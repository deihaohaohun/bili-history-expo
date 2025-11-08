import React from 'react'
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Text, View } from 'react-native'
import { Button, Input, Label, RadioGroup, SizeTokens } from 'tamagui'

type Inputs = {
  title: string
  total: string
  type: string
  area: string
}

export function RadioGroupItemWithLabel(props: {
  size: SizeTokens
  value: string
  label: string
}) {
  const id = `radiogroup-${props.value}`
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <RadioGroup.Item value={props.value} id={id} size={props.size}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>

      <Label size={props.size} htmlFor={id}>
        {props.label}
      </Label>
    </View>
  )
}

const AddVideoModal = () => {

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      title: '',
      total: '',
      type: 'Anime',
      area: 'japan',
    },
  })
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  return (
    <View style={{ padding: 12, gap: 12 }}>
      <Label>视频名称</Label>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input size="$3" placeholder="请输入视频名称" onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
        name="title"
      />
      {errors.title?.type === "required" && (
        <Text style={{ color: 'red' }}>视频名称不能为空</Text>
      )}
      <Label>视频剧集总数</Label>
      <Controller
        control={control}
        rules={{
          required: true,
          min: 1,
          max: 999,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input size="$3" placeholder="请输入视频剧集总数" keyboardType="number-pad" onBlur={onBlur} onChangeText={(text) => {
            // 自定义逻辑 1：只允许数字
            const numericValue = text.replace(/[^0-9]/g, '');
            // 自定义逻辑 2：限制最大值 999
            const finalValue = numericValue === '' ? '' : Math.min(Number(numericValue), 999).toString();
            // 最后调用 react-hook-form 的 onChange 更新表单状态
            onChange(finalValue);
          }} value={value} />
        )}
        name="total"
      />
      {errors.total?.type === "required" && (
        <Text style={{ color: 'red' }}>剧集数必须在 1 到 999 之间</Text>
      )}
      <Label>视频类型</Label>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <RadioGroup aria-labelledby="请选择视频类型" defaultValue="Anime" onValueChange={onChange} onBlur={onBlur} value={value}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <RadioGroupItemWithLabel size="$4" value="Anime" label="动漫" />
              <RadioGroupItemWithLabel size="$4" value="Movie" label="电影" />
              <RadioGroupItemWithLabel size="$4" value="TVSeries" label="电视剧" />
              <RadioGroupItemWithLabel size="$4" value="Documentary" label="纪录片" />
            </View>
          </RadioGroup>
        )}
        name="type"
      />
      {errors.type?.type === "required" && (
        <Text style={{ color: 'red' }}>视频类型不能为空</Text>
      )}
      <Label>视频所属地区</Label>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <RadioGroup aria-labelledby="请选择视频所属地区" defaultValue="japan" onValueChange={onChange} onBlur={onBlur} value={value}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <RadioGroupItemWithLabel size="$4" value="japan" label="日本" />
              <RadioGroupItemWithLabel size="$4" value="china" label="中国" />
              <RadioGroupItemWithLabel size="$4" value="america" label="美国" />
            </View>
          </RadioGroup>
        )}
        name="area"
      />
      {errors.area?.type === "required" && (
        <Text style={{ color: 'red' }}>视频所属地区不能为空</Text>
      )}

      <Button size="$4" onPress={handleSubmit(onSubmit)}>
        提交
      </Button>
    </View>
  )
}

export default AddVideoModal
