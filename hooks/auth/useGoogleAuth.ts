import { useUser } from "@/hooks/auth/useUser";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { setNewUserDoc, StorageKey } from "@/utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthRequest } from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

// Firebase project credentials
const WEB_CLIENT_ID =
	"896308606286-ise1uqlfhqffamp6d3sv9uhkpmkcs802.apps.googleusercontent.com";
const IOS_CLIENT_ID =
	"896308606286-ise1uqlfhqffamp6d3sv9uhkpmkcs802.apps.googleusercontent.com";
const ANDROID_CLIENT_ID =
	"896308606286-ise1uqlfhqffamp6d3sv9uhkpmkcs802.apps.googleusercontent.com";

export const useGoogleAuth = () => {
	const { refreshUserToken } = useUser();
	const [error, setError] = useState<string>();
	const [request, response, promptAsync] = useAuthRequest({
		webClientId: WEB_CLIENT_ID,
		iosClientId: IOS_CLIENT_ID,
		androidClientId: ANDROID_CLIENT_ID,
		scopes: ["openid", "profile", "email"],
	});

	const handleFirebaseSignIn = useCallback(
		async (idToken: string | null) => {
			if (!idToken) {
				setError("No authentication token received from Google");
				return;
			}

			try {
				const auth = getFirebaseAuth();
				const db = getFirebaseDb();

				if (!auth) {
					throw new Error("Firebase auth not initialized");
				}

				if (!db) {
					throw new Error("Firebase database not initialized");
				}

				const credential = GoogleAuthProvider.credential(idToken);
				const userCredential = await signInWithCredential(
					auth,
					credential
				);
				const user = userCredential.user;

				// Store user data in AsyncStorage
				await AsyncStorage.setItem(
					StorageKey.user,
					JSON.stringify(user)
				);

				// Try to create user document in Firestore
				try {
					const userDocRef = doc(db, "users", user.uid);
					const userDoc = await getDoc(userDocRef);
					if (!userDoc.exists()) {
						await setNewUserDoc(user, userDocRef);
					}
				} catch (dbError) {
					console.warn("Failed to create user document:", dbError);
					// Continue even if Firestore fails
				}

				// Force a refresh of the user token and data
				await refreshUserToken();
				setError(undefined);
			} catch (error: any) {
				console.error("Firebase sign-in error:", error);
				setError(
					error.message ?? "An error occurred during Google sign-in"
				);
			}
		},
		[refreshUserToken]
	);

	useEffect(() => {
		if (response?.type === "success" && response.authentication) {
			handleFirebaseSignIn(response.authentication.idToken ?? null);
		} else if (response?.type === "error") {
			setError("Google authentication failed");
		}
	}, [response, handleFirebaseSignIn]);

	const clearError = useCallback(() => {
		setError(undefined);
	}, []);

	const signInWithGoogle = useCallback(() => {
		setError(undefined);
		promptAsync();
	}, [promptAsync]);

	return { signInWithGoogle, error, clearError };
};
