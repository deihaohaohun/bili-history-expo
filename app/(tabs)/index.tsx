import { get } from "@/utils/request";
import { FlashList } from "@shopify/flash-list";
import { defaultConfig } from "@tamagui/config/v4";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { RefreshControl, View } from "react-native";
import { Text } from "tamagui";

// Tamagui 配置
const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

interface Video {
  id: number;
  title: string;
  image: string;
}

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getVideos = async () => {
    const res = await get<Video[]>("/videos");
    return res;
  };

  const onRefresh = () => {
    setRefreshing(true);
    // 模拟异步数据加载
    getVideos().then((res) => {
      setVideos(res);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    getVideos().then((res) => {
      setVideos(res);
    });
  }, []);

  return (
    <TamaguiProvider config={config}>
      <View style={{ flex: 1, padding: 2 }}>
        <FlashList
          data={videos}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000" // iOS 刷新指示器颜色
              colors={["#000"]} // Android 刷新指示器颜色
            />
          }
        />
      </View>
    </TamaguiProvider>
  );
}
