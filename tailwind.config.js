/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
	],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				calcBg: "#000000",
				calcDisplay: "#1C1C1C",
				calcKey: "#333333",
				calcKeyLight: "#A5A5A5",
				calcKeyAccent: "#FF9F0A",
			},
		},
	},
};
