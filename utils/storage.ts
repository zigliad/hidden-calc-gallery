import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "firebase/auth";
import { setDoc } from "firebase/firestore";

export enum StorageKey {
	user = "user",
	// Add other storage keys as needed
}

export const setNewUserDoc = async (user: User, userDocRef: any) => {
	try {
		await setDoc(userDocRef, {
			uid: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
			createdAt: new Date(),
		});
		console.log("User document created:", user.uid);
	} catch (error) {
		console.error("Error creating user document:", error);
		throw error;
	}
};

export const getUserFromStorage = async (): Promise<User | null> => {
	try {
		const userData = await AsyncStorage.getItem(StorageKey.user);
		return userData ? JSON.parse(userData) : null;
	} catch (error) {
		console.error("Error getting user from storage:", error);
		return null;
	}
};

export const setUserToStorage = async (user: User): Promise<void> => {
	try {
		await AsyncStorage.setItem(StorageKey.user, JSON.stringify(user));
	} catch (error) {
		console.error("Error setting user to storage:", error);
		throw error;
	}
};

export const removeUserFromStorage = async (): Promise<void> => {
	try {
		await AsyncStorage.removeItem(StorageKey.user);
	} catch (error) {
		console.error("Error removing user from storage:", error);
		throw error;
	}
};
