import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Lazy initialize Firebase services
let _auth: any = null;
let _db: any = null;
let _storage: any = null;

export const getFirebaseAuth = () => {
	if (!_auth) {
		_auth = getAuth(app);
	}
	return _auth;
};

export const getFirebaseDb = () => {
	if (!_db) {
		_db = getFirestore(app);
	}
	return _db;
};

export const getFirebaseStorage = () => {
	if (!_storage) {
		_storage = getStorage(app);
	}
	return _storage;
};

// Ensure anonymous authentication
export const ensureAnonAuth = async () => {
	try {
		const auth = getFirebaseAuth();
		if (!auth.currentUser) {
			await signInAnonymously(auth);
			console.log("Anonymous authentication successful");
		}
	} catch (error) {
		console.error("Anonymous authentication failed:", error);
	}
};
