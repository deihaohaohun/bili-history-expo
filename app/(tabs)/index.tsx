import { FlashList } from "@shopify/flash-list";
import { defaultConfig } from "@tamagui/config/v4";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { Image } from "expo-image";
import { View } from "react-native";
import { Text } from "tamagui";

// Tamagui 配置
const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

// 扁平化数据
const DATA = [
  {
    id: 1,
    title: "打了300年的史莱姆，不知不觉就练到了满级",
    image:
      "https://i2.hdslb.com/bfs/bangumi/image/d9727717ee6b507225b26ae367a43a444a6157ca.png@308w_410h_1c.avif",
  },
  {
    id: 2,
    title: "Ｄｒ．ＳＴＯＮＥ 石纪元",
    image:
      "https://i2.hdslb.com/bfs/bangumi/image/834bdb5d36c401179b9e91fdc1de520a6664c2a7.png@308w_410h_1c.avif",
  },
  {
    id: 3,
    title: "齐木楠雄的灾难（日播&精选版）",
    image:
      "https://i2.hdslb.com/bfs/bangumi/eb4f17335f48951945fb9da47e6ee0bc65fa2fbb.jpg@308w_410h_1c.avif",
  },
  {
    id: 4,
    title: "打了300年的史莱姆，不知不觉就练到了满级",
    image:
      "https://i2.hdslb.com/bfs/bangumi/image/d9727717ee6b507225b26ae367a43a444a6157ca.png@308w_410h_1c.avif",
  },
  {
    id: 5,
    title: "Ｄｒ．ＳＴＯＮＥ 石纪元",
    image:
      "https://i2.hdslb.com/bfs/bangumi/image/834bdb5d36c401179b9e91fdc1de520a6664c2a7.png@308w_410h_1c.avif",
  },
  {
    id: 6,
    title: "齐木楠雄的灾难（日播&精选版）",
    image:
      "https://i2.hdslb.com/bfs/bangumi/eb4f17335f48951945fb9da47e6ee0bc65fa2fbb.jpg@308w_410h_1c.avif",
  },
  // 如果有更多数据，继续添加
];

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <View style={{ flex: 1, padding: 2 }}>
        <FlashList
          data={DATA}
          numColumns={3} // 每行显示 3 个元素
          estimatedItemSize={150}
          renderItem={({ item }) => (
            <View className="flex-1 p-1">
              <Image
                source={item.image}
                style={{
                  width: "100%",
                  aspectRatio: 3 / 4,
                }}
              />
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                className="bg-neutral-500 text-white p-1"
              >
                {item.title}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id + ""}
        />
      </View>
    </TamaguiProvider>
  );
}
