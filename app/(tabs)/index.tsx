import { defaultConfig } from "@tamagui/config/v4";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { SafeAreaView } from "react-native-safe-area-context";

// you usually export this from a tamagui.config.ts file
const config = createTamagui(defaultConfig);

type Conf = typeof config;

// make imports typed
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <SafeAreaView style={{ paddingTop: 30 }}></SafeAreaView>
    </TamaguiProvider>
  );
}
