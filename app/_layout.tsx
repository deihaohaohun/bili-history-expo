import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { defaultConfig } from "@tamagui/config/v4";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { createTamagui, TamaguiProvider, Theme } from "tamagui";

// Tamagui 配置
const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf { }
}

const getToastConfig = (scheme: "light" | "dark" | null) => {
  const isDark = scheme === "dark";
  const baseStyle = {
    style: {
      backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
      borderLeftColor: isDark ? "#3399ff" : "#0066ff",
    },
    text1Style: {
      color: isDark ? "#ffffff" : "#000000",
      fontSize: 15,
    },
    text2Style: {
      color: isDark ? "#cccccc" : "#666666",
      fontSize: 13,
    },
  };

  return {
    success: ({ text1, text2, ...props }: any) => (
      <BaseToast
        {...props}
        style={{ ...baseStyle.style, borderLeftColor: "#4CAF50" }}
        text1={text1}
        text2={text2}
        text1Style={baseStyle.text1Style}
        text2Style={baseStyle.text2Style}
      />
    ),
    error: ({ text1, text2, ...props }: any) => (
      <ErrorToast
        {...props}
        style={{ ...baseStyle.style, borderLeftColor: "#F44336" }}
        text1={text1}
        text2={text2}
        text1Style={baseStyle.text1Style}
        text2Style={baseStyle.text2Style}
      />
    ),
    info: ({ text1, text2, ...props }: any) => (
      <BaseToast
        {...props}
        style={{ ...baseStyle.style, borderLeftColor: "#2196F3" }}
        text1={text1}
        text2={text2}
        text1Style={baseStyle.text1Style}
        text2Style={baseStyle.text2Style}
      />
    ),
  };
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <Theme name={colorScheme === "dark" ? "dark" : "light"}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="addVideoModal"
              options={{ title: "添加待观看视频", presentation: "modal" }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          <Toast config={getToastConfig(colorScheme || "light")} />
        </ThemeProvider>
      </Theme>
    </TamaguiProvider>
  );
}
