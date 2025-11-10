import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Video } from './index';

type VideoType = Partial<Video>

export default function StatisticScreen() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const animeVideos = videos.filter((video) => video.type === "Anime");
  const movieVideos = videos.filter((video) => video.type === "Movie");
  const tvVideos = videos.filter((video) => video.type === "TV");
  const documentaryVideos = videos.filter((video) => video.type === "Documentary");
  const [focused, setFocused] = useState(0);
  const pieData = [
    {
      value: animeVideos.length,
      color: "#009FFF",
      gradientCenterColor: "#006DFF",
      title: "动漫",
      focused: focused === 0,
    },
    {
      value: tvVideos.length,
      color: "#93FCF8",
      gradientCenterColor: "#3BE9DE",
      title: "电视剧",
      focused: focused === 1,
    },
    {
      value: movieVideos.length,
      color: "#BDB2FA",
      gradientCenterColor: "#8F80F3",
      title: "电影",
      focused: focused === 2,
    },
    {
      value: documentaryVideos.length,
      color: "#FFA5BA",
      gradientCenterColor: "#FF7F97",
      title: "纪录片",
      focused: focused === 3,
    },
  ];
  const centerData = pieData.find((data) => data.focused);
  const videosFinishedInThisYear = videos.filter((video) => dayjs(video.finished_at ? +video.finished_at : 0).year() === dayjs().year());
  const videosAddedInThisYear = videos.filter((video) => dayjs(video.created_at).year() === dayjs().year());

  useEffect(() => {
    supabase
      .from("videos")
      .select("id,type,created_at,finished_at")
      .then((res) => {
        setVideos(res.data as VideoType[]);
      });
  }, []);

  const renderDot = (data: any) => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: data.color,
          marginRight: 10,
        }}
      />
    );
  };

  const Legend = ({ data }: any) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: 160,
          marginRight: 20,
        }}
      >
        {renderDot(data)}
        <Text style={{ color: "white" }}>
          {data.title}:
          {(
            (data.value / pieData.reduce((pre, next) => pre + next.value, 0)) *
            100
          ).toFixed(2)}
          %
        </Text>
      </View>
    );
  };

  const renderLegendComponent = () => {
    return (
      <>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Legend data={pieData[0]} />
          <Legend data={pieData[1]} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Legend data={pieData[2]} />
          <Legend data={pieData[3]} />
        </View>
      </>
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          margin: 12,
          padding: 12,
          borderRadius: 12,
          backgroundColor: "#333",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          视频类型统计
        </Text>
        <View style={{ padding: 20, alignItems: "center" }}>
          <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            radius={90}
            innerRadius={60}
            innerCircleColor={"#333"}
            onPress={(data: any, idx: number) => {
              setFocused(idx);
            }}
            centerLabelComponent={() => {
              return (
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Text
                    style={{ fontSize: 22, color: "white", fontWeight: "bold" }}
                  >
                    {centerData?.value}
                  </Text>
                  <Text style={{ fontSize: 14, color: "white" }}>
                    {centerData?.title}
                  </Text>
                </View>
              );
            }}
          />
        </View>
        {renderLegendComponent()}
      </View>

      <View
        style={{
          margin: 12,
          padding: 12,
          borderRadius: 12,
          backgroundColor: "#333",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          成就统计
        </Text>
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            这一年已经添加了 {videosAddedInThisYear.length} 部视频~
          </Text>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            不知不觉这一年已经看完了 {videosFinishedInThisYear.length} 部视频~
          </Text>
        </View>
      </View>
    </View>
  );
}
