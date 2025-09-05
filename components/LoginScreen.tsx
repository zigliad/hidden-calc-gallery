import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useAuth } from "../lib/auth-context";

export default function LoginScreen() {
	const { signIn, error, clearError } = useAuth();
	const [isSigningIn, setIsSigningIn] = useState(false);

	const handleGoogleSignIn = async () => {
		try {
			setIsSigningIn(true);
			clearError(); // Clear any previous errors
			await signIn();
		} catch (error) {
			console.error("Sign in error:", error);
			// Error handling is now managed by the auth context
		} finally {
			setIsSigningIn(false);
		}
	};

	return (
		<View
			className="flex-1 bg-calcBg justify-center items-center px-8"
			style={{
				flex: 1,
				backgroundColor: "#000000",
				justifyContent: "center",
				alignItems: "center",
				paddingHorizontal: 32,
			}}
		>
			<View
				className="bg-calcKey rounded-lg p-8 w-full max-w-sm"
				style={{
					backgroundColor: "#333333",
					borderRadius: 8,
					padding: 32,
					width: "100%",
					maxWidth: 320,
				}}
			>
				<Text
					className="text-white text-2xl font-bold text-center mb-6"
					style={{
						color: "white",
						fontSize: 24,
						fontWeight: "bold",
						textAlign: "center",
						marginBottom: 24,
					}}
				>
					Hidden Gallery
				</Text>

				<Text
					className="text-gray-300 text-center mb-8"
					style={{
						color: "#D1D5DB",
						textAlign: "center",
						marginBottom: 32,
					}}
				>
					Sign in to upload and view your private photos
				</Text>

				{error && (
					<View
						className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
						style={{
							backgroundColor: "rgba(239, 68, 68, 0.2)",
							borderColor: "rgba(239, 68, 68, 0.5)",
							borderWidth: 1,
							borderRadius: 8,
							padding: 12,
							marginBottom: 16,
						}}
					>
						<Text
							className="text-red-400 text-sm text-center"
							style={{
								color: "#F87171",
								fontSize: 14,
								textAlign: "center",
							}}
						>
							{error}
						</Text>
					</View>
				)}

				<TouchableOpacity
					onPress={handleGoogleSignIn}
					disabled={isSigningIn}
					className="bg-calcKeyAccent rounded-lg py-4 px-6 items-center"
					style={{
						backgroundColor: "#FF9F0A",
						borderRadius: 8,
						paddingVertical: 16,
						paddingHorizontal: 24,
						alignItems: "center",
						opacity: isSigningIn ? 0.7 : 1,
					}}
				>
					{isSigningIn ? (
						<ActivityIndicator color="white" size="small" />
					) : (
						<Text
							className="text-white text-lg font-semibold"
							style={{
								color: "white",
								fontSize: 18,
								fontWeight: "600",
							}}
						>
							Sign in with Google
						</Text>
					)}
				</TouchableOpacity>

				<Text
					className="text-gray-400 text-xs text-center mt-4"
					style={{
						color: "#9CA3AF",
						fontSize: 12,
						textAlign: "center",
						marginTop: 16,
					}}
				>
					Your photos will be private and only accessible to you
				</Text>
			</View>
		</View>
	);
}
