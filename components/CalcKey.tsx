import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface CalcKeyProps {
	label: string;
	onPress: () => void;
	onLongPress?: () => void;
	variant: "light" | "dark" | "accent";
	wide?: boolean;
}

export const CalcKey: React.FC<CalcKeyProps> = ({
	label,
	onPress,
	onLongPress,
	variant,
	wide = false,
}) => {
	const getVariantStyles = () => {
		switch (variant) {
			case "light":
				return "bg-calcKeyLight";
			case "accent":
				return "bg-calcKeyAccent";
			case "dark":
			default:
				return "bg-calcKey";
		}
	};

	const getTextColor = () => {
		switch (variant) {
			case "light":
				return "text-black";
			case "accent":
			case "dark":
			default:
				return "text-white";
		}
	};

	const getVariantStyle = () => {
		switch (variant) {
			case "light":
				return { backgroundColor: "#A5A5A5" };
			case "accent":
				return { backgroundColor: "#FF9F0A" };
			case "dark":
			default:
				return { backgroundColor: "#333333" };
		}
	};

	const getTextColorStyle = () => {
		switch (variant) {
			case "light":
				return { color: "black" };
			case "accent":
			case "dark":
			default:
				return { color: "white" };
		}
	};

	return (
		<TouchableOpacity
			onPress={onPress}
			onLongPress={onLongPress}
			className={`
        ${getVariantStyles()}
        ${wide ? "flex-[2]" : "flex-1"}
        aspect-square
        rounded-full
        items-center
        justify-center
        mx-1
        my-1
      `}
			style={{
				...getVariantStyle(),
				flex: wide ? 2 : 1,
				height: 80,
				borderRadius: 40,
				alignItems: "center",
				justifyContent: "center",
				marginHorizontal: 4,
				marginVertical: 4,
			}}
			accessibilityLabel={label}
			accessibilityRole="button"
		>
			<Text
				className={`${getTextColor()} text-3xl font-light`}
				style={{
					...getTextColorStyle(),
					fontSize: 30,
					fontWeight: "300",
				}}
			>
				{label}
			</Text>
		</TouchableOpacity>
	);
};
