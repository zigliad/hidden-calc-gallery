import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChange, signOutUser } from "./firebase";
import { useGoogleAuth } from "../hooks/auth/useGoogleAuth";
import { useUser } from "../hooks/auth/useUser";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: () => Promise<void>;
	signOut: () => Promise<void>;
	error: string | undefined;
	clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const { user, loading, updateUser } = useUser();
	const { signInWithGoogle, error, clearError } = useGoogleAuth();

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		try {
			const unsubscribe = onAuthStateChange((user) => {
				updateUser(user);
			});

			// Set a timeout to ensure loading state is cleared even if auth state doesn't change
			timeoutId = setTimeout(() => {
				// Loading state is now managed by useUser hook
			}, 3000);

			return () => {
				unsubscribe();
				if (timeoutId) clearTimeout(timeoutId);
			};
		} catch (error) {
			console.warn("Firebase auth state listener failed:", error);
		}
	}, [updateUser]);

	const signIn = async () => {
		try {
			signInWithGoogle();
		} catch (error: any) {
			console.error("Sign in error:", error);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			await signOutUser();
			updateUser(null);
		} catch (error: any) {
			console.error("Sign out error:", error);
			// Even if sign out fails, clear the user locally
			updateUser(null);
			// Don't throw the error for Google Sign-In module issues
			if (
				!error.message?.includes(
					"component auth has not been registered yet"
				) &&
				!error.message?.includes("has not been registered yet") &&
				!error.message?.includes("Native module") &&
				!error.message?.includes("not available")
			) {
				throw error;
			}
		}
	};

	const value = {
		user,
		loading,
		signIn,
		signOut,
		error,
		clearError,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
