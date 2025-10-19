import { Video } from "@/app/(tabs)";
import { supabase } from "@/lib/supabase";
import { put } from "@/utils/request";

// 根据 json-server 通过 id 修改视频信息
export const updateVideo = async (id: number, data: Video) => {
  return put<Video>(`/videos/${id}`, data);
};

// 新建视频
export const createVideo = async (data: Video) => {
  return put<Video>("/videos", data);
};

// 删除视频
export const deleteVideo = async (id: number) => {
  return put<Video>(`/videos/${id}`, {
    status: "done",
  });
};

// 获取视频列表
export const getVideoList = async (status?: string): Promise<Video[]> => {
  try {
    // 构建查询
    let query = supabase
      .from("videos")
      .select("*")
      .order("finished_at", { ascending: false });

    // 仅当status不是"all"且存在时添加过滤条件
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // 执行查询并处理结果
    const { data, error } = await query;

    if (error) {
      console.error("获取视频列表失败:", error);
      return [];
    }

    return (data as Video[]) || [];
  } catch (error) {
    console.error("获取视频列表时发生异常:", error);
    return [];
  }
};
