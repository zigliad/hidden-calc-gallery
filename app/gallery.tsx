import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	Alert,
	RefreshControl,
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
} from "firebase/firestore";
import {
	getFirebaseStorage,
	getFirebaseDb,
	ensureAnonAuth,
} from "../lib/firebase";
// Removed GlueStack UI imports - using React Native components instead

interface GalleryImage {
	id: string;
	url: string;
	createdAt: any;
	width?: number;
	height?: number;
	mime?: string;
}

export default function Gallery() {
	const [images, setImages] = useState<GalleryImage[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		const initializeAndLoad = async () => {
			await ensureAnonAuth();
			await loadImages();
		};
		initializeAndLoad();
	}, []);

	const loadImages = async () => {
		try {
			setLoading(true);
			const db = getFirebaseDb();
			const q = query(
				collection(db, "hiddenMeta"),
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
		try {
			setLoading(true);

			const storage = getFirebaseStorage();
			const db = getFirebaseDb();

			// Create a reference to the storage location
			const timestamp = Date.now();
			const imageRef = ref(storage, `hidden/img_${timestamp}.jpg`);

			// Convert asset to blob
			const response = await fetch(asset.uri);
			const blob = await response.blob();

			// Upload the image
			await uploadBytes(imageRef, blob);

			// Get the download URL
			const downloadURL = await getDownloadURL(imageRef);

			// Save metadata to Firestore
			await addDoc(collection(db, "hiddenMeta"), {
				url: downloadURL,
				createdAt: serverTimestamp(),
				width: asset.width,
				height: asset.height,
				mime: "image/jpeg",
			});

			// Reload images
			await loadImages();

			Alert.alert("Success", "Image added to hidden gallery");
		} catch (error) {
			console.error("Error uploading image:", error);
			Alert.alert("Error", "Failed to upload image");
		} finally {
			setLoading(false);
		}
	};

	const renderImage = ({ item }: { item: GalleryImage }) => (
		<TouchableOpacity className="flex-1 m-1 aspect-square">
			<Image
				source={{ uri: item.url }}
				className="w-full h-full rounded-lg"
				resizeMode="cover"
			/>
		</TouchableOpacity>
	);

	const renderEmptyState = () => (
		<View className="flex-1 justify-center items-center px-8">
			<Text className="text-white text-lg text-center mb-4">
				No images in your hidden gallery yet
			</Text>
			<Text className="text-gray-400 text-center">
				Tap "Add Photo" to add your first image
			</Text>
		</View>
	);

	return (
		<View className="flex-1 bg-calcBg">
			{/* Header */}
			<View className="pt-12 pb-4 px-6">
				<View className="flex-row items-center justify-between">
					<TouchableOpacity onPress={() => router.back()}>
						<Text className="text-white text-lg">← Back</Text>
					</TouchableOpacity>
					<Text className="text-white text-xl font-semibold">
						Hidden Gallery
					</Text>
					<View className="w-12" />
				</View>
			</View>

			{/* Add Photo Button */}
			<View className="px-6 mb-4">
				<TouchableOpacity
					onPress={pickImage}
					className="bg-calcKeyAccent rounded-lg py-3 px-6 items-center"
				>
					<Text className="text-white text-lg font-semibold">
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
