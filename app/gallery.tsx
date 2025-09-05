import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	Alert,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import {
	collection,
	addDoc,
	getDocs,
	query,
	orderBy,
	serverTimestamp,
	where,
} from "firebase/firestore";
import {
	getFirebaseStorage,
	getFirebaseDb,
	getCurrentUser,
} from "../lib/firebase";
import { useAuth } from "../lib/auth-context";
import LoginScreen from "../components/LoginScreen";
// Removed GlueStack UI imports - using React Native components instead

interface GalleryImage {
	id: string;
	url: string;
	createdAt: any;
	width?: number;
	height?: number;
	mime?: string;
	userId: string;
}

export default function Gallery() {
	const { user, loading: authLoading, signOut } = useAuth();
	const [images, setImages] = useState<GalleryImage[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		if (user) {
			loadImages();
		}
	}, [user]);

	const loadImages = async () => {
		if (!user) return;

		try {
			setLoading(true);
			const db = getFirebaseDb();
			const q = query(
				collection(db, "hiddenMeta"),
				where("userId", "==", user.uid),
				orderBy("createdAt", "desc")
			);
			const querySnapshot = await getDocs(q);

			const imageList: GalleryImage[] = [];
			querySnapshot.forEach((doc) => {
				imageList.push({
					id: doc.id,
					...doc.data(),
				} as GalleryImage);
			});

			setImages(imageList);
		} catch (error) {
			console.error("Error loading images:", error);
			Alert.alert("Error", "Failed to load images");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadImages();
		setRefreshing(false);
	};

	const requestPermissions = async () => {
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Required",
				"Please grant permission to access your photo library to add images to the hidden gallery."
			);
			return false;
		}
		return true;
	};

	const pickImage = async () => {
		const hasPermission = await requestPermissions();
		if (!hasPermission) return;

		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (!result.canceled && result.assets[0]) {
				await uploadImage(result.assets[0]);
			}
		} catch (error) {
			console.error("Error picking image:", error);
			Alert.alert("Error", "Failed to pick image");
		}
	};

	const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
		if (!user) {
			Alert.alert("Error", "You must be signed in to upload images");
			return;
		}

		try {
			setLoading(true);

			const storage = getFirebaseStorage();
			const db = getFirebaseDb();

			// Create a reference to the storage location with user ID
			const timestamp = Date.now();
			const imageRef = ref(
				storage,
				`hidden/${user.uid}/img_${timestamp}.jpg`
			);

			// Convert asset to blob
			const response = await fetch(asset.uri);
			const blob = await response.blob();

			// Upload the image
			await uploadBytes(imageRef, blob);

			// Get the download URL
			const downloadURL = await getDownloadURL(imageRef);

			// Save metadata to Firestore with user ID
			await addDoc(collection(db, "hiddenMeta"), {
				url: downloadURL,
				userId: user.uid,
				createdAt: serverTimestamp(),
				width: asset.width,
				height: asset.height,
				mime: "image/jpeg",
			});

			// Reload images
			await loadImages();

			Alert.alert("Success", "Image added to your hidden gallery");
		} catch (error) {
			console.error("Error uploading image:", error);
			Alert.alert("Error", "Failed to upload image");
		} finally {
			setLoading(false);
		}
	};

	const renderImage = ({ item }: { item: GalleryImage }) => (
		<TouchableOpacity
			className="flex-1 m-1 aspect-square"
			style={{ flex: 1, margin: 4, aspectRatio: 1 }}
		>
			<Image
				source={{ uri: item.url }}
				className="w-full h-full rounded-lg"
				style={{ width: "100%", height: "100%", borderRadius: 8 }}
				resizeMode="cover"
			/>
		</TouchableOpacity>
	);

	const renderEmptyState = () => (
		<View
			className="flex-1 justify-center items-center px-8"
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				paddingHorizontal: 32,
			}}
		>
			<Text
				className="text-white text-lg text-center mb-4"
				style={{
					color: "white",
					fontSize: 18,
					textAlign: "center",
					marginBottom: 16,
				}}
			>
				No images in your hidden gallery yet
			</Text>
			<Text
				className="text-gray-400 text-center"
				style={{ color: "#9CA3AF", textAlign: "center" }}
			>
				Tap "Add Photo" to add your first image
			</Text>
		</View>
	);

	// Show loading spinner while checking authentication
	if (authLoading) {
		return (
			<View
				className="flex-1 bg-calcBg justify-center items-center"
				style={{
					flex: 1,
					backgroundColor: "#000000",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" color="#FF9F0A" />
			</View>
		);
	}

	// Show login screen if not authenticated
	if (!user) {
		return <LoginScreen />;
	}

	return (
		<View
			className="flex-1 bg-calcBg"
			style={{ flex: 1, backgroundColor: "#000000" }}
		>
			{/* Header */}
			<View
				className="pt-12 pb-4 px-6"
				style={{
					paddingTop: 48,
					paddingBottom: 16,
					paddingHorizontal: 24,
				}}
			>
				<View
					className="flex-row items-center justify-between"
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<TouchableOpacity onPress={() => router.back()}>
						<Text
							className="text-white text-lg"
							style={{ color: "white", fontSize: 18 }}
						>
							← Back
						</Text>
					</TouchableOpacity>
					<Text
						className="text-white text-xl font-semibold"
						style={{
							color: "white",
							fontSize: 20,
							fontWeight: "600",
						}}
					>
						Hidden Gallery
					</Text>
					<TouchableOpacity onPress={signOut}>
						<Text
							className="text-white text-sm"
							style={{ color: "white", fontSize: 14 }}
						>
							Sign Out
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Add Photo Button */}
			<View
				className="px-6 mb-4"
				style={{ paddingHorizontal: 24, marginBottom: 16 }}
			>
				<TouchableOpacity
					onPress={pickImage}
					className="bg-calcKeyAccent rounded-lg py-3 px-6 items-center"
					style={{
						backgroundColor: "#FF9F0A",
						borderRadius: 8,
						paddingVertical: 12,
						paddingHorizontal: 24,
						alignItems: "center",
					}}
				>
					<Text
						className="text-white text-lg font-semibold"
						style={{
							color: "white",
							fontSize: 18,
							fontWeight: "600",
						}}
					>
						Add Photo
					</Text>
				</TouchableOpacity>
			</View>

			{/* Image Grid */}
			<FlatList
				data={images}
				renderItem={renderImage}
				keyExtractor={(item) => item.id}
				numColumns={2}
				contentContainerStyle={{ paddingHorizontal: 8 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#FF9F0A"
					/>
				}
				ListEmptyComponent={renderEmptyState}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
