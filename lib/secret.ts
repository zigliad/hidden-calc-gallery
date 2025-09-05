// Simple hardcoded password for the hidden gallery
// No crypto or secure storage needed for this demo

const HARDCODED_PASSWORD = "1701";

export const checkSecret = (input: string): boolean => {
	return input === HARDCODED_PASSWORD;
};

export const getDefaultPassword = (): string => {
	return HARDCODED_PASSWORD;
};

// For development - you can change this password here
export const setPassword = (newPassword: string): void => {
	// In a real app, you'd want to store this securely
	// For this demo, we'll just use the hardcoded value
	console.log("Password change requested:", newPassword);
	console.log(
		"Note: In this demo, password is hardcoded to:",
		HARDCODED_PASSWORD
	);
};

export const initializeDefaultSecret = async (): Promise<void> => {
	// No initialization needed for hardcoded password
	console.log(
		"Secret system initialized with hardcoded password:",
		HARDCODED_PASSWORD
	);
};
