import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Text, TextStyle, View } from 'react-native';

const ListHeader = ({ setStatus, status }: { setStatus: (status: string) => void; status: string }) => {

  const textColor = useThemeColor({}, "text");

  const headerStyle = (target: string): TextStyle => {
    return {
      paddingVertical: 4,
      fontSize: 16,
      color: textColor,
      ...(status === target ? {
        borderBottomWidth: 4,
        borderBottomColor: "deeppink",
        fontWeight: "bold",
      } : {}),
    }
  }

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 8,
      }}
    >
      <Text onPress={() => setStatus("all")} style={headerStyle('all')}>全部</Text>
      <Text onPress={() => setStatus("todo")} style={headerStyle('todo')}>未观看</Text>
      <Text onPress={() => setStatus("doing")} style={headerStyle('doing')}>进行中</Text>
      <Text onPress={() => setStatus("done")} style={headerStyle('done')}>已完成</Text>
    </View>
  )
}

export default ListHeader
