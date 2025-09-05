import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
	Alert,
	Modal,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from "react-native";

import { CalcKey } from "../components/CalcKey";
import { checkSecret, setPassword } from "../lib/secret";
import { useAuth } from "../lib/auth-context";
import LoginScreen from "../components/LoginScreen";

type Operation = "+" | "-" | "*" | "/" | null;

export default function Calculator() {
	const { user, loading } = useAuth();
	const [display, setDisplay] = useState("0");
	const [previousValue, setPreviousValue] = useState<number | null>(null);
	const [operation, setOperation] = useState<Operation>(null);
	const [waitingForOperand, setWaitingForOperand] = useState(false);
	const [justEvaluated, setJustEvaluated] = useState(false);
	const [showPasscodeModal, setShowPasscodeModal] = useState(false);
	const [newPasscode, setNewPasscode] = useState("");
	const [confirmPasscode, setConfirmPasscode] = useState("");

	// Secret capture: rolling buffer of last 12 digit presses
	const digitBuffer = useRef<string[]>([]);

	const inputDigit = (digit: string) => {
		// Add to secret digit buffer
		digitBuffer.current.push(digit);
		if (digitBuffer.current.length > 12) {
			digitBuffer.current.shift();
		}

		if (justEvaluated) {
			setDisplay(digit);
			setJustEvaluated(false);
		} else if (waitingForOperand) {
			setDisplay(digit);
			setWaitingForOperand(false);
		} else {
			setDisplay(display === "0" ? digit : display + digit);
		}
	};

	const inputDecimal = () => {
		if (justEvaluated) {
			setDisplay("0.");
			setJustEvaluated(false);
		} else if (waitingForOperand) {
			setDisplay("0.");
			setWaitingForOperand(false);
		} else if (display.indexOf(".") === -1) {
			setDisplay(display + ".");
		}
	};

	const clear = () => {
		setDisplay("0");
		setPreviousValue(null);
		setOperation(null);
		setWaitingForOperand(false);
		setJustEvaluated(false);
		digitBuffer.current = [];
	};

	const handleLongPressAC = () => {
		setShowPasscodeModal(true);
	};

	const saveNewPasscode = async () => {
		if (newPasscode !== confirmPasscode) {
			Alert.alert("Error", "Passcodes do not match");
			return;
		}

		if (newPasscode.length < 4) {
			Alert.alert("Error", "Passcode must be at least 4 digits");
			return;
		}

		try {
			setPassword(newPasscode);
			Alert.alert("Success", "New passcode set successfully");
			setShowPasscodeModal(false);
			setNewPasscode("");
			setConfirmPasscode("");
		} catch (error) {
			Alert.alert("Error", "Failed to set new passcode");
		}
	};

	const performOperation = (nextOperation: Operation) => {
		const inputValue = parseFloat(display);

		if (previousValue === null) {
			setPreviousValue(inputValue);
		} else if (operation) {
			const currentValue = previousValue || 0;
			const newValue = calculate(currentValue, inputValue, operation);

			setDisplay(String(newValue));
			setPreviousValue(newValue);
		}

		setWaitingForOperand(true);
		setOperation(nextOperation);
		setJustEvaluated(false);
		// Clear digit buffer on operator press
		digitBuffer.current = [];
	};

	const calculate = (
		firstValue: number,
		secondValue: number,
		operation: Operation
	): number => {
		switch (operation) {
			case "+":
				return firstValue + secondValue;
			case "-":
				return firstValue - secondValue;
			case "*":
				return firstValue * secondValue;
			case "/":
				return secondValue !== 0 ? firstValue / secondValue : NaN;
			default:
				return secondValue;
		}
	};

	const toggleSign = () => {
		if (display !== "0") {
			setDisplay(
				display.charAt(0) === "-" ? display.slice(1) : "-" + display
			);
		}
	};

	const inputPercent = () => {
		const value = parseFloat(display) / 100;
		setDisplay(String(value));
	};

	const evaluate = async () => {
		const inputValue = parseFloat(display);

		if (previousValue !== null && operation) {
			const newValue = calculate(previousValue, inputValue, operation);
			setDisplay(String(newValue));
			setPreviousValue(null);
			setOperation(null);
			setWaitingForOperand(true);
			setJustEvaluated(true);
		}

		// Check secret passcode
		const secretDigits = digitBuffer.current.join("");
		if (secretDigits.length > 0) {
			const isValidSecret = checkSecret(secretDigits);
			if (isValidSecret) {
				router.push("/gallery");
			}
		}

		// Clear digit buffer after evaluation
		digitBuffer.current = [];
	};

	const formatDisplay = (value: string): string => {
		// Handle special cases first
		if (value === "NaN" || value === "Infinity" || value === "-Infinity") {
			return "Error";
		}

		// Try to parse the number
		let num: number;
		try {
			num = parseFloat(value);
		} catch (error) {
			return "Error";
		}

		// Check if parsing resulted in NaN
		if (isNaN(num)) {
			return "Error";
		}

		// Handle very large numbers (only use scientific notation for extremely large numbers)
		if (Math.abs(num) > 999999999999) {
			try {
				return num.toExponential(2);
			} catch (error) {
				return "Error";
			}
		}

		// Handle very small numbers (only use scientific notation for extremely small numbers)
		if (Math.abs(num) < 0.000000001 && num !== 0) {
			try {
				return num.toExponential(2);
			} catch (error) {
				return "Error";
			}
		}

		// Format regular numbers with better precision
		try {
			// For integers, show as is
			if (Number.isInteger(num)) {
				return num.toString();
			}

			// For decimals, limit to 8 decimal places and remove trailing zeros
			const formatted = num.toFixed(8).replace(/\.?0+$/, "");

			// If the formatted number is too long, use scientific notation
			if (formatted.length > 12) {
				return num.toExponential(2);
			}

			return formatted;
		} catch (error) {
			return "Error";
		}
	};

	// Show loading spinner while checking authentication
	if (loading) {
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
			{/* Display */}
			<View
				className="flex-1 justify-end px-6 pb-8"
				style={{
					flex: 1,
					justifyContent: "flex-end",
					paddingHorizontal: 24,
					paddingBottom: 32,
				}}
			>
				<Text
					numberOfLines={1}
					style={{
						fontSize: 60,
						color: "white",
						textAlign: "right",
						fontWeight: "300",
					}}
				>
					{formatDisplay(display)}
				</Text>
			</View>

			{/* Keypad */}
			<View
				className="px-2 pb-8"
				style={{ paddingHorizontal: 8, paddingBottom: 32 }}
			>
				{/* Row 1: AC, +/-, %, / */}
				<View
					className="flex-row mb-2"
					style={{ flexDirection: "row", marginBottom: 8 }}
				>
					<CalcKey
						label="AC"
						onPress={clear}
						onLongPress={handleLongPressAC}
						variant="light"
					/>
					<CalcKey label="+/-" onPress={toggleSign} variant="light" />
					<CalcKey label="%" onPress={inputPercent} variant="light" />
					<CalcKey
						label="/"
						onPress={() => performOperation("/")}
						variant="accent"
					/>
				</View>

				{/* Row 2: 7, 8, 9, × */}
				<View
					className="flex-row mb-2"
					style={{ flexDirection: "row", marginBottom: 8 }}
				>
					<CalcKey
						label="7"
						onPress={() => inputDigit("7")}
						variant="dark"
					/>
					<CalcKey
						label="8"
						onPress={() => inputDigit("8")}
						variant="dark"
					/>
					<CalcKey
						label="9"
						onPress={() => inputDigit("9")}
						variant="dark"
					/>
					<CalcKey
						label="×"
						onPress={() => performOperation("*")}
						variant="accent"
					/>
				</View>

				{/* Row 3: 4, 5, 6, - */}
				<View
					className="flex-row mb-2"
					style={{ flexDirection: "row", marginBottom: 8 }}
				>
					<CalcKey
						label="4"
						onPress={() => inputDigit("4")}
						variant="dark"
					/>
					<CalcKey
						label="5"
						onPress={() => inputDigit("5")}
						variant="dark"
					/>
					<CalcKey
						label="6"
						onPress={() => inputDigit("6")}
						variant="dark"
					/>
					<CalcKey
						label="−"
						onPress={() => performOperation("-")}
						variant="accent"
					/>
				</View>

				{/* Row 4: 1, 2, 3, + */}
				<View
					className="flex-row mb-2"
					style={{ flexDirection: "row", marginBottom: 8 }}
				>
					<CalcKey
						label="1"
						onPress={() => inputDigit("1")}
						variant="dark"
					/>
					<CalcKey
						label="2"
						onPress={() => inputDigit("2")}
						variant="dark"
					/>
					<CalcKey
						label="3"
						onPress={() => inputDigit("3")}
						variant="dark"
					/>
					<CalcKey
						label="+"
						onPress={() => performOperation("+")}
						variant="accent"
					/>
				</View>

				{/* Row 5: 0 (wide), ., = */}
				<View
					className="flex-row mb-2"
					style={{ flexDirection: "row", marginBottom: 8 }}
				>
					<CalcKey
						label="0"
						onPress={() => inputDigit("0")}
						variant="dark"
						wide
					/>
					<CalcKey label="." onPress={inputDecimal} variant="dark" />
					<CalcKey label="=" onPress={evaluate} variant="accent" />
				</View>
			</View>

			{/* Passcode Setup Modal */}
			<Modal
				visible={showPasscodeModal}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowPasscodeModal(false)}
			>
				<View className="flex-1 bg-black/50 justify-center items-center px-8">
					<View className="bg-calcDisplay rounded-2xl p-6 w-full max-w-sm">
						<Text className="text-white text-xl font-semibold mb-4 text-center">
							Set New Passcode
						</Text>

						<TextInput
							value={newPasscode}
							onChangeText={setNewPasscode}
							placeholder="Enter new passcode"
							placeholderTextColor="#A5A5A5"
							secureTextEntry
							keyboardType="numeric"
							className="bg-calcKey text-white text-lg px-4 py-3 rounded-lg mb-4"
							maxLength={12}
						/>

						<TextInput
							value={confirmPasscode}
							onChangeText={setConfirmPasscode}
							placeholder="Confirm passcode"
							placeholderTextColor="#A5A5A5"
							secureTextEntry
							keyboardType="numeric"
							className="bg-calcKey text-white text-lg px-4 py-3 rounded-lg mb-6"
							maxLength={12}
						/>

						<View className="flex-row space-x-3">
							<TouchableOpacity
								onPress={() => setShowPasscodeModal(false)}
								className="flex-1 bg-calcKeyLight py-3 rounded-lg"
							>
								<Text className="text-black text-center font-semibold">
									Cancel
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={saveNewPasscode}
								className="flex-1 bg-calcKeyAccent py-3 rounded-lg"
							>
								<Text className="text-white text-center font-semibold">
									Save
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}
