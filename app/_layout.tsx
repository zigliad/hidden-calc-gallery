import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GlueStackProvider } from "../components/GlueStackProvider";
import { AuthProvider } from "../lib/auth-context";
import "../global.css";

export default function RootLayout() {
	return (
		<AuthProvider>
			<GlueStackProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<Stack
						screenOptions={{
							headerShown: false,
						}}
					>
						<Stack.Screen name="index" />
						<Stack.Screen name="gallery" />
					</Stack>
				</GestureHandlerRootView>
			</GlueStackProvider>
		</AuthProvider>
	);
}
