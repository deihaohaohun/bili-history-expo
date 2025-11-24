import FormErrorTip from "@/components/FormErrorTip";
import { COUNTRIES, VIDEO_TYPES } from "@/constants/Countries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/lib/supabase";
import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button, Input, Label, RadioGroup, SizeTokens } from "tamagui";

type Inputs = {
  title: string;
  total: string;
  type: string;
  area: string;
};

export function RadioGroupItemWithLabel(props: {
  size: SizeTokens;
  value: string;
  label: string;
}) {
  const id = `radiogroup-${props.value}`;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <RadioGroup.Item value={props.value} id={id} size={props.size}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>

      <Label size={props.size} htmlFor={id}>
        {props.label}
      </Label>
    </View>
  );
}

const AddVideoModal = () => {
  const textColor = useThemeColor({}, "text");
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      title: "",
      total: "",
      type: "Anime",
      area: "japan",
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const id = await supabase
      .from("videos")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .single();
    console.log(id);
    await supabase.from("videos").insert({
      id: Number(id.data?.id || 0) + 1,
      title: data.title,
      total: Number(data.total),
      type: data.type,
      area: data.area,
    });
    Toast.show({
      type: "success",
      text1: "提醒",
      text2: "待观看视频添加成功~",
      topOffset: 60,
    });
    reset();
    setLoading(false);
  };

  return (
    <View style={{ padding: 12, gap: 12 }}>
      <Label style={{ color: textColor }}>视频名称</Label>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            size="$3"
            placeholder="请输入视频名称"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="title"
      />
      {errors.title?.type === "required" && (
        <FormErrorTip tip="视频名称不能为空" />
      )}
      <Label style={{ color: textColor }}>视频剧集总数</Label>
      <Controller
        control={control}
        rules={{
          required: true,
          min: 1,
          max: 9999,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            size="$3"
            placeholder="请输入视频剧集总数"
            keyboardType="number-pad"
            onBlur={onBlur}
            onChangeText={(text) => {
              // 自定义逻辑 1：只允许数字
              const numericValue = text.replace(/[^0-9]/g, "");
              // 自定义逻辑 2：限制最大值 999
              const finalValue =
                numericValue === ""
                  ? ""
                  : Math.min(Number(numericValue), 9999).toString();
              // 最后调用 react-hook-form 的 onChange 更新表单状态
              onChange(finalValue);
            }}
            value={value}
          />
        )}
        name="total"
      />
      {errors.total?.type === "required" && (
        <FormErrorTip tip="剧集数必须在 1 到 9999 之间" />
      )}
      <Label style={{ color: textColor }}>视频类型</Label>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <RadioGroup
            aria-labelledby="请选择视频类型"
            defaultValue="Anime"
            onValueChange={onChange}
            onBlur={onBlur}
            value={value}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {VIDEO_TYPES.map((type) => (
                <RadioGroupItemWithLabel
                  key={type.label}
                  size="$4"
                  value={type.value}
                  label={type.label}
                />
              ))}
            </View>
          </RadioGroup>
        )}
        name="type"
      />
      {errors.type?.type === "required" && (
        <FormErrorTip tip="视频类型不能为空" />
      )}
      <Label style={{ color: textColor }}>视频所属地区</Label>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <RadioGroup
            aria-labelledby="请选择视频所属地区"
            defaultValue="japan"
            onValueChange={onChange}
            onBlur={onBlur}
            value={value}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {COUNTRIES.map((country) => (
                <RadioGroupItemWithLabel
                  key={country.label}
                  size="$4"
                  value={country.value}
                  label={country.label}
                />
              ))}
            </View>
          </RadioGroup>
        )}
        name="area"
      />
      {errors.area?.type === "required" && (
        <FormErrorTip tip="视频所属地区不能为空" />
      )}

      <Button size="$4" onPress={handleSubmit(onSubmit)} disabled={loading}>
        提交
      </Button>
    </View>
  );
};

export default AddVideoModal;
