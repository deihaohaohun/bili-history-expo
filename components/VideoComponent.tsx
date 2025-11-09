import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';
import React from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { Video as VideoType } from '../app/(tabs)/index';

const VideoComponent = ({ item }: { item: VideoType }) => {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");

  return (
    <View
      style={{
        backgroundColor: colorScheme === "light" ? "#fff" : "#222",
        margin: 4,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {item.image ? (
        <Image
          source={item.image}
          style={{
            width: "100%",
            aspectRatio: 3 / 4,
          }}
        />
      ) : (
        <View style={{ width: "100%", aspectRatio: 3 / 4, justifyContent: "center", alignItems: "center" }} >
          <Text style={{ fontSize: 16, color: textColor, textAlign: "center" }}>暂无图片</Text>
        </View>
      )}
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
          全 {item.total} {item.type === "Anime" ? "话" : "集"}
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
  )
}

export default VideoComponent