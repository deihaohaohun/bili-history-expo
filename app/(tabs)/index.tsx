import { getVideoList, updateVideo } from "@/apis/video";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { defaultConfig } from "@tamagui/config/v4";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, View } from "react-native";
import {
  GestureHandlerRootView,
  Pressable,
} from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Button, Input, Text } from "tamagui";

// Tamagui 配置
const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

export interface Video {
  id: number;
  title: string;
  image: string;
  total: number;
  status: string;
  current: number;
}

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [id, setId] = useState(0);
  const currentVideo = videos.find((video) => video.id === id)!;
  const [current, setCurrent] = useState(0);
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");

  // callbacks
  const handlePresentModalPress = useCallback((id: number, current: number) => {
    setId(id);
    setCurrent(current);
    bottomSheetModalRef.current?.present();
  }, []);
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1} // 关闭时遮罩消失
        appearsOnIndex={0} // 打开时遮罩出现
        opacity={0.5} // 遮罩透明度
        onPress={() => {
          // 点击遮罩时关闭 Bottom Sheet
          bottomSheetModalRef.current?.close();
        }}
      />
    ),
    []
  );

  useEffect(() => {
    getVideoList().then((res) => {
      setVideos(res);
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const res = await getVideoList();
    setVideos(res);
    setRefreshing(false);
  };

  const addVideoProgress = async () => {
    if (currentVideo.status === "done") {
      Toast.show({
        type: "error",
        text1: "提醒",
        text2: "不能再增加了",
        topOffset: 60,
      });
      return;
    }
    setCurrent(current + 1);
    const params = {
      ...currentVideo,
      current: current + 1,
    };
    let msg = "增加成功";
    if (current + 1 === currentVideo.total) {
      msg = "已看完";
      params.status = "done";
    }
    if (currentVideo.status === "todo") {
      msg = "已开始";
      params.status = "doing";
    }
    await updateVideo(id, params);
    onRefresh();
    // toast 提示
    Toast.show({
      type: "success",
      text1: "提醒",
      text2: msg,
      topOffset: 60,
    });
  };

  return (
    <TamaguiProvider config={config}>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <View style={{ flex: 1, padding: 4 }}>
            <FlashList
              data={videos}
              numColumns={3} // 每行显示 3 个元素
              estimatedItemSize={150}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    handlePresentModalPress(item.id, item.current);
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        colorScheme === "light" ? "#fff" : "#222",
                      margin: 4,
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={item.image}
                      style={{
                        width: "100%",
                        aspectRatio: 3 / 4,
                      }}
                    />
                    <View style={{ padding: 4 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: textColor,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          color: textColor,
                        }}
                      >
                        全 {item.total} 话
                      </Text>
                      {item.status === "doing" && (
                        <Text
                          style={{
                            color: textColor,
                            fontSize: 12,
                            textAlign: "right",
                          }}
                        >
                          当前看到 {item.current} 话
                        </Text>
                      )}
                      {item.status === "done" && (
                        <Text
                          style={{
                            color: textColor,
                            fontSize: 12,
                            textAlign: "right",
                          }}
                        >
                          已看完
                        </Text>
                      )}
                      {item.status === "todo" && (
                        <Text
                          style={{
                            color: textColor,
                            fontSize: 12,
                            textAlign: "right",
                          }}
                        >
                          未观看
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
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
              ListFooterComponent={
                <Text
                  style={{
                    textAlign: "center",
                    paddingVertical: 10,
                    fontSize: 16,
                    color: textColor,
                  }}
                >
                  没有更多数据...
                </Text>
              }
            />
          </View>

          <BottomSheetModal
            ref={bottomSheetModalRef}
            enableDismissOnClose
            backdropComponent={renderBackdrop}
          >
            <BottomSheetView>
              <Text style={{ fontSize: 20, textAlign: "center" }}>
                {currentVideo?.title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  padding: 12,
                  flex: 1,
                }}
              >
                {currentVideo?.status === "doing" && (
                  <>
                    <Input
                      style={{ flex: 1 }}
                      size="$4"
                      borderWidth={2}
                      value={current + ""}
                      disabled
                    />
                    <Button size="$4" onPress={addVideoProgress}>
                      +
                    </Button>
                  </>
                )}
                {currentVideo?.status === "done" && (
                  <Button
                    size="$4"
                    style={{ flex: 1 }}
                    onPress={() =>
                      Toast.show({
                        type: "info",
                        text1: "提醒",
                        text2: "功能待实现",
                        topOffset: 60,
                      })
                    }
                  >
                    再看一遍
                  </Button>
                )}
                {currentVideo?.status === "todo" && (
                  <Button
                    size="$4"
                    onPress={addVideoProgress}
                    style={{ flex: 1 }}
                  >
                    开始观看
                  </Button>
                )}
              </View>
            </BottomSheetView>
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </TamaguiProvider>
  );
}
