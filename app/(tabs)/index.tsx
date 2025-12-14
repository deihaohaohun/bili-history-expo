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
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { Stack, useRouter } from "expo-router";
import Fuse from "fuse.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, RefreshControl, useColorScheme, useWindowDimensions, View } from "react-native";
import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Button, Input, Text } from "tamagui";

import { TabBar, TabView } from 'react-native-tab-view';

const renderTabBar = (props: any) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: 'white' }}
    style={{ backgroundColor: '#509EE2' }}
  />
);

type RefreshKey = "doing" | "todo" | "done";

type Route = { key: RefreshKey; title: string };

const PAGE_SIZE = 20;

const VideoList = ({
  queryStatus = "doing",
  externalRefreshToken,
  onRequestRefresh,
}: {
  queryStatus?: string;
  externalRefreshToken?: number;
  onRequestRefresh?: (keys: RefreshKey[]) => void;
}) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [videos, setVideos] = useState<Video[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [id, setId] = useState(0);
  const currentVideo = videos.find((video) => video.id === id);
  const [current, setCurrent] = useState(0);
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const isDark = useColorScheme();

  const [status] = useState(queryStatus);
  const [loading, setLoading] = useState(true);
  const [processLoading, setProcessLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");

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

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    const res = await getVideoList(status);
    setLoading(false);
    setVideos(res || []);
    setPage(1);
    setRefreshing(false);
  }, [status]);

  useEffect(() => {
    getVideoList(status).then((res) => {
      setVideos(res || []);
      setLoading(false);
      setPage(1);
    });
  }, [status, externalRefreshToken]);

  useFocusEffect(
    useCallback(() => {
      if (status !== "todo") return;
      onRefresh();
    }, [onRefresh, status])
  );

  const fuse = useMemo(() => {
    if (status !== "done") return null;
    return new Fuse<Video>(videos, {
      keys: ["title"],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [status, videos]);

  const filteredVideos = useMemo(() => {
    if (status !== "done") return videos;
    const keyword = searchText.trim();
    if (!keyword) return videos;
    if (!fuse) return videos;
    return fuse.search(keyword).map((r: Fuse.FuseResult<Video>) => r.item);
  }, [fuse, searchText, status, videos]);

  const pagedVideos = useMemo(() => {
    return filteredVideos.slice(0, page * PAGE_SIZE);
  }, [filteredVideos, page]);

  const hasMore = filteredVideos.length > pagedVideos.length;

  const addVideoProgress = async () => {
    if (!currentVideo) return;
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
      onRequestRefresh?.(["doing"]);
      Toast.show({
        type: "success",
        text1: "提醒",
        text2: msg,
        topOffset: 60,
      });
    }
  };

  const startWatching = async () => {
    if (!currentVideo) return;
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
    onRequestRefresh?.(["doing", "todo"]);
    bottomSheetModalRef.current?.close();
  };

  const markFinished = async () => {
    if (!currentVideo) return;
    await supabase
      .from("videos")
      .update({
        status: "done",
        finished_at: dayjs().valueOf() + '',
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
    onRequestRefresh?.(["doing", "done"]);
    bottomSheetModalRef.current?.close();
  };

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <View style={{ flex: 1, padding: 4 }}>
          {status === "done" && (
            <View style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
              <Input
                size="$4"
                placeholder="搜索已观看视频"
                value={searchText}
                onChangeText={(v) => {
                  setSearchText(v);
                  setPage(1);
                }}
              />
            </View>
          )}
          <FlashList
            data={pagedVideos}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? tabBarHeight : 0 }}
            renderItem={({ item }: { item: Video }) => (
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
              <View style={{ paddingVertical: 10, gap: 10 }}>
                {hasMore && (
                  <Button
                    size="$4"
                    onPress={() => setPage((p) => p + 1)}
                    disabled={loading}
                  >
                    加载更多
                  </Button>
                )}
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    color: textColor,
                  }}
                >
                  {loading
                    ? "正在加载中..."
                    : hasMore
                      ? `已加载 ${pagedVideos.length}/${filteredVideos.length}`
                      : '已加载所有数据'}
                </Text>
              </View>
            }
          />
        </View>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          enableDismissOnClose
          bottomInset={Platform.OS === 'ios' ? tabBarHeight : 0}
          topInset={insets.top}
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: backgroundColor,
          }}
          handleIndicatorStyle={{
            backgroundColor: isDark ? '#444' : '#ccc',
          }}
        >
          <BottomSheetView style={{ backgroundColor: backgroundColor }}>
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
                flexGrow: 0,
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
                  onPress={() => startWatching()}
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
  )
}

const routes: Route[] = [
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
  created_at: string;
  finished_at?: string;
  type: "Anime" | "Movie" | "Documentary" | "TV";
  loopCount?: number;
  area?: string;
}

export default function App() {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [refreshTokens, setRefreshTokens] = useState<Record<RefreshKey, number>>({
    doing: 0,
    todo: 0,
    done: 0,
  });

  const requestRefresh = useCallback((keys: RefreshKey[]) => {
    setRefreshTokens((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        next[k] = (next[k] ?? 0) + 1;
      });
      return next;
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      requestRefresh(["todo"]);
    }, [requestRefresh])
  );

  const renderScene = useCallback(
    ({ route }: { route: Route }) => {
      if (route.key === "todo") {
        return (
          <VideoList
            queryStatus="todo"
            externalRefreshToken={refreshTokens.todo}
            onRequestRefresh={requestRefresh}
          />
        );
      }
      if (route.key === "done") {
        return (
          <VideoList
            queryStatus="done"
            externalRefreshToken={refreshTokens.done}
            onRequestRefresh={requestRefresh}
          />
        );
      }
      return (
        <VideoList
          queryStatus="doing"
          externalRefreshToken={refreshTokens.doing}
          onRequestRefresh={requestRefresh}
        />
      );
    },
    [refreshTokens.doing, refreshTokens.done, refreshTokens.todo, requestRefresh]
  );

  return (<>
    <Stack.Screen options={{
      headerRight: () => <Entypo style={{ marginRight: 12, color: textColor }} name="squared-plus" size={24} color="black" onPress={() => { router.navigate('/addVideoModal') }} />
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
