import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GlueStackProvider } from "../components/GlueStackProvider";
import "../global.css";

export default function RootLayout() {
	return (
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
	);
}
