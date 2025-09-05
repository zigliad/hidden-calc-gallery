import React from "react";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

interface GlueStackProviderProps {
	children: React.ReactNode;
}

export const GlueStackProvider: React.FC<GlueStackProviderProps> = ({
	children,
}) => {
	return (
		<GluestackUIProvider config={config}>{children}</GluestackUIProvider>
	);
};
