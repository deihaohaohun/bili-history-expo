import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui, TamaguiProvider } from "tamagui";

// Tamagui 配置
const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf { }
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={config}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "哔哩历史",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="history" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="statistic"
          options={{
            title: "统计",
            tabBarIcon: ({ color }) => (
              <AntDesign name="area-chart" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </TamaguiProvider>
  );
}
