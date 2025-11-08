import { getVideoList } from "@/apis/video";
import VideoComponent from "@/components/VideoComponent";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/lib/supabase";
import Entypo from '@expo/vector-icons/Entypo';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, RefreshControl, useWindowDimensions, View } from "react-native";
import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Button, Input, Text } from "tamagui";

import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

const renderTabBar = (props: any) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: 'white' }}
    style={{ backgroundColor: '#509EE2' }}
  />
);

const VideoList = ({ queryStatus = "doing" }: { queryStatus?: string }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [id, setId] = useState(0);
  const currentVideo = videos.find((video) => video.id === id)!;
  const [current, setCurrent] = useState(0);
  const textColor = useThemeColor({}, "text");
  const [status] = useState(queryStatus);
  const [loading, setLoading] = useState(true);
  const [processLoading, setProcessLoading] = useState(false);

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
    getVideoList(status).then((res) => {
      setVideos(res || []);
      setLoading(false);
    });
  }, [status]);

  const onRefresh = async () => {
    setLoading(true);
    setRefreshing(true);
    const res = await getVideoList(status);
    setLoading(false);
    setVideos(res || []);
    setRefreshing(false);
  };

  const addVideoProgress = async () => {
    setProcessLoading(true);
    const params = {
      current: current + 1,
    };
    let msg = `已经成功标记进度到第 ${current + 1} 集了 ~`;
    const { error } = await supabase
      .from("videos")
      .update(params)
      .eq("id", currentVideo.id);
    setProcessLoading(false);
    if (error) {
      console.log("Update failed:", error);
    } else {
      setCurrent(current + 1);
      onRefresh();
      Toast.show({
        type: "success",
        text1: "提醒",
        text2: msg,
        topOffset: 60,
      });
    }
  };

  const startWatching = async () => {
    await supabase
      .from("videos")
      .update({
        status: "doing",
        current: 1,
      })
      .eq("id", currentVideo.id);
    setCurrent(1);
    Toast.show({
      type: "info",
      text1: "提醒",
      text2: "已标记开始观看,快去追番吧~",
      topOffset: 60,
    });
    onRefresh();
    bottomSheetModalRef.current?.close();
  };

  const markFinished = async () => {
    await supabase
      .from("videos")
      .update({
        status: "done",
        finished_at: dayjs().valueOf() + '',
        // TODO: 增加再次观看功能的时候需要循环次数增加逻辑
        loop_count: 1
      })
      .eq("id", currentVideo.id);
    Toast.show({
      type: "success",
      text1: "提醒",
      text2: "成就 +1, 快去解锁更多成就吧~",
      topOffset: 60,
    });
    onRefresh();
    bottomSheetModalRef.current?.close();
  };
  const markMovieFinished = async () => {
    await supabase
      .from("videos")
      .update({
        status: "done",
        current: 1,
        finished_at: dayjs().valueOf() + '',
      })
      .eq("id", currentVideo.id);
    Toast.show({
      type: "success",
      text1: "提醒",
      text2: "成就 +1, 快去解锁更多成就吧~",
      topOffset: 60,
    });
    onRefresh();
    bottomSheetModalRef.current?.close();
  };

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <View style={{ flex: 1, padding: 4 }}>
          <FlashList
            data={videos}
            numColumns={3}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  handlePresentModalPress(item.id, item.current);
                }}
              >
                <VideoComponent item={item} />
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
                {loading ? "正在加载中..." : '已加载所有数据'}
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
                paddingVertical: 12,
                paddingBottom: 12,
                paddingHorizontal: 12,
                flex: 1,
              }}
            >
              {currentVideo?.status === "doing" &&
                (currentVideo.current < currentVideo.total ? (
                  <View style={{ width: "100%", gap: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                        gap: 8,
                      }}
                    >
                      <Text fontSize={16}>当前看到第</Text>
                      <Input
                        style={{ flex: 1 }}
                        size="$4"
                        borderWidth={2}
                        value={current + ""}
                        disabled
                      />
                      <Text>{currentVideo.type === "Anime" ? "话" : "集"}</Text>
                    </View>
                    <Button size="$4" onPress={addVideoProgress} disabled={processLoading}>
                      <Text>
                        标记本{currentVideo.type === "Anime" ? "话" : "集"}为已看过
                      </Text>
                    </Button>
                  </View>
                ) : (
                  <Button onPress={markFinished} style={{ flex: 1 }}>
                    标记为已看过
                  </Button>
                ))}
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
                  onPress={() =>
                    currentVideo.type === "Anime"
                      ? startWatching()
                      : markMovieFinished()
                  }
                  style={{ flex: 1 }}
                >
                  {currentVideo.type === "Anime" ? "开始观看" : "标记为看过"}
                </Button>
              )}
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

const renderScene = SceneMap({
  doing: () => <VideoList />,
  todo: () => <VideoList queryStatus="todo" />,
  done: () => <VideoList queryStatus="done" />,
});

const routes = [
  { key: 'doing', title: '正在看' },
  { key: 'todo', title: '未观看' },
  { key: 'done', title: '已完成' },
];

export interface Video {
  id: number;
  title: string;
  image: string;
  total: number;
  status: string;
  current: number;
  finishedAt?: string;
  type: "Anime" | "Movie" | "Documentary";
  loopCount?: number;
}

export default function App() {
  const router = useRouter();

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (<>
    <Stack.Screen options={{
      headerRight: () => <Entypo style={{ marginRight: 12 }} name="squared-plus" size={24} color="black" onPress={() => { router.navigate('/addVideoModal') }} />
    }} />

    <TabView
      renderTabBar={renderTabBar}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  </>

  );
}
