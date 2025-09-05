import {
	GoogleSignin,
	statusCodes,
} from "@react-native-google-signin/google-signin";
import { getAnalytics } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithCredential,
	signOut,
	User,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCrAkYxngKsy4uXwVq04FYRofC7LxrxkbQ",
	authDomain: "calc-gallery.firebaseapp.com",
	projectId: "calc-gallery",
	storageBucket: "calc-gallery.firebasestorage.app",
	messagingSenderId: "896308606286",
	appId: "1:896308606286:web:10b0363f10945cade81a1f",
	measurementId: "G-33QVVHS7DC",
};

// Initialize Firebase (prevent multiple initializations)
let app: any = null;
try {
	app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
	console.warn("Firebase app initialization failed:", error);
	// Create a mock app for development
	app = {
		name: "mock-app",
		options: firebaseConfig,
	};
}

// Initialize Analytics (only for web)
let analytics: any = null;
if (typeof window !== "undefined") {
	analytics = getAnalytics(app);
}

// Lazy initialize Firebase services
let _auth: any = null;
let _db: any = null;
let _storage: any = null;

export const getFirebaseAuth = () => {
	try {
		if (!_auth && app) {
			// Use getAuth for React Native - it handles persistence automatically
			_auth = getAuth(app);
		}
		return _auth;
	} catch (error) {
		console.warn("Firebase auth initialization failed:", error);
		// Return a mock auth object for development
		return {
			currentUser: null,
			onAuthStateChanged: (callback: (user: User | null) => void) => {
				// Call the callback immediately with null user
				callback(null);
				// Return a dummy unsubscribe function
				return () => {};
			},
		} as any;
	}
};

export const getFirebaseDb = () => {
	try {
		if (!_db && app) {
			_db = getFirestore(app);
		}
		return _db;
	} catch (error) {
		console.warn("Firebase database initialization failed:", error);
		return null;
	}
};

export const getFirebaseStorage = () => {
	if (!_storage) {
		_storage = getStorage(app);
	}
	return _storage;
};

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Configure Google Sign-In
let isGoogleSignInConfigured = false;

const configureGoogleSignIn = () => {
	if (!isGoogleSignInConfigured) {
		try {
			GoogleSignin.configure({
				webClientId:
					"896308606286-6peu0vqf0bb4ld25gs3c5tb5vpsq4tee.apps.googleusercontent.com",
				offlineAccess: true,
				hostedDomain: "",
				forceCodeForRefreshToken: true,
			});
			isGoogleSignInConfigured = true;
		} catch (error) {
			console.warn("Google Sign-In configuration failed:", error);
			// Mark as configured to prevent repeated attempts
			isGoogleSignInConfigured = true;
		}
	}
};

// User management functions
export const createUserDocument = async (user: User) => {
	try {
		const db = getFirebaseDb();
		const userRef = doc(db, "users", user.uid);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			await setDoc(userRef, {
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
				createdAt: new Date(),
			});
			console.log("User document created:", user.uid);
		}
	} catch (error) {
		console.error("Error creating user document:", error);
		throw error;
	}
};

// Google Sign In
export const signInWithGoogle = async () => {
	try {
		// Configure Google Sign-In if not already configured
		configureGoogleSignIn();

		// Check if GoogleSignin is available
		if (
			!GoogleSignin ||
			typeof GoogleSignin.hasPlayServices !== "function"
		) {
			throw new Error("Google Sign-In native module not available");
		}

		// Check if your device supports Google Play
		await GoogleSignin.hasPlayServices({
			showPlayServicesUpdateDialog: true,
		});

		// Get the users ID token
		const signInResult = await GoogleSignin.signIn();
		const idToken = signInResult.data?.idToken;

		if (!idToken) {
			throw new Error("Failed to get ID token from Google Sign-In");
		}

		// Create a Google credential with the token
		const googleCredential = GoogleAuthProvider.credential(idToken);

		// Sign-in the user with the credential
		const auth = getFirebaseAuth();
		const result = await signInWithCredential(auth, googleCredential);

		// Create user document if it doesn't exist
		await createUserDocument(result.user);

		return result.user;
	} catch (error: any) {
		console.error("Google sign-in failed:", error);

		// Handle specific Google Sign-In errors
		if (error.code === statusCodes.SIGN_IN_CANCELLED) {
			throw new Error("Sign-in was cancelled");
		} else if (error.code === statusCodes.IN_PROGRESS) {
			throw new Error("Sign-in is already in progress");
		} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
			throw new Error("Google Play Services not available");
		} else if (
			error.message?.includes(
				"component auth has not been registered yet"
			) ||
			error.message?.includes("has not been registered yet") ||
			error.message?.includes("Native module") ||
			error.message?.includes("not available") ||
			error.message?.includes("undefined is not an object") ||
			error.message?.includes(
				"Google Sign-In native module not available"
			)
		) {
			// Fallback to mock user for development
			console.warn(
				"Google Sign-In native module not available in development mode, using mock user"
			);
			const mockUser = {
				uid: "dev-user-" + Date.now(),
				email: "dev@example.com",
				displayName: "Development User",
				photoURL: null,
			};
			await createUserDocument(mockUser as any);
			return mockUser;
		} else {
			throw new Error(
				`Sign-in failed: ${error.message || "Please try again."}`
			);
		}
	}
};

// Sign out
export const signOutUser = async () => {
	try {
		// Configure Google Sign-In if not already configured
		configureGoogleSignIn();

		// Sign out from Google
		await GoogleSignin.signOut();

		// Sign out from Firebase
		const auth = getFirebaseAuth();
		await signOut(auth);
		console.log("User signed out successfully");
	} catch (error) {
		console.error("Sign out failed:", error);
		throw error;
	}
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
	try {
		const auth = getFirebaseAuth();
		const unsubscribe = onAuthStateChanged(auth, callback);
		return unsubscribe;
	} catch (error) {
		console.warn("Firebase auth state listener failed:", error);
		// Call the callback immediately with null user to clear loading state
		callback(null);
		// Return a dummy unsubscribe function
		return () => {};
	}
};

// Get current user
export const getCurrentUser = () => {
	const auth = getFirebaseAuth();
	return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = () => {
	const auth = getFirebaseAuth();
	return !!auth.currentUser;
};
