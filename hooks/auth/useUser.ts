import { User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/firebase";
import {
	getUserFromStorage,
	removeUserFromStorage,
	setUserToStorage,
} from "../../utils/storage";

export const useUser = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Load user from storage on mount
	useEffect(() => {
		const loadUserFromStorage = async () => {
			try {
				const storedUser = await getUserFromStorage();
				setUser(storedUser);
			} catch (error) {
				console.error("Error loading user from storage:", error);
			} finally {
				setLoading(false);
			}
		};

		loadUserFromStorage();
	}, []);

	// Refresh user token and data
	const refreshUserToken = useCallback(async () => {
		try {
			const currentUser = getCurrentUser();
			if (currentUser) {
				// Force refresh the ID token
				await currentUser.getIdToken(true);
				setUser(currentUser);
				await setUserToStorage(currentUser);
			} else {
				// If no current user, clear stored user
				setUser(null);
				await removeUserFromStorage();
			}
		} catch (error) {
			console.error("Error refreshing user token:", error);
			// If refresh fails, clear the user
			setUser(null);
			await removeUserFromStorage();
		}
	}, []);

	// Update user data
	const updateUser = useCallback(async (userData: User | null) => {
		setUser(userData);
		if (userData) {
			await setUserToStorage(userData);
		} else {
			await removeUserFromStorage();
		}
	}, []);

	// Clear user data
	const clearUser = useCallback(async () => {
		setUser(null);
		await removeUserFromStorage();
	}, []);

	return {
		user,
		loading,
		refreshUserToken,
		updateUser,
		clearUser,
	};
};
