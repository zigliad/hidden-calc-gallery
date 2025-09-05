const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("hcscript");
config.transformer.assetPlugins = ["expo-asset/tools/hashAssetFiles"];

// Add path mapping support
config.resolver.alias = {
	"@": path.resolve(__dirname, "."),
};

module.exports = config;
