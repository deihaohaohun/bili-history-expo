import { useState } from "react";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

export default function StatisticScreen() {
  const [pieData, setPieData] = useState([
    {
      value: 47,
      color: "#009FFF",
      gradientCenterColor: "#006DFF",
      title: "动漫",
      focused: true,
    },
    {
      value: 40,
      color: "#93FCF8",
      gradientCenterColor: "#3BE9DE",
      title: "电视剧",
      focused: false,
    },
    {
      value: 16,
      color: "#BDB2FA",
      gradientCenterColor: "#8F80F3",
      title: "电影",
      focused: false,
    },
    {
      value: 3,
      color: "#FFA5BA",
      gradientCenterColor: "#FF7F97",
      title: "纪录片",
      focused: false,
    },
  ]);
  const centerData = pieData.find((data) => data.focused);

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
          {data.title} ({data.value}):{" "}
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
              // 把对应索引的数据的 focused 属性设置为 true, 其他的设置为 false
              pieData.forEach((item, index) => {
                item.focused = index === idx;
              });
              setPieData([...pieData]);
            }}
            centerLabelComponent={() => {
              return (
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Text
                    style={{ fontSize: 22, color: "white", fontWeight: "bold" }}
                  >
                    {centerData?.value}%
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
    </View>
  );
}
