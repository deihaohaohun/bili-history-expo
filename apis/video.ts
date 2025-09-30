import { Video } from "@/app/(tabs)";
import { get, put } from "@/utils/request";

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
export const getVideoList = async (status?: string) => {
  if (status === "all") {
    return get<Video[]>("/videos?_sort=finishedAt&_order=desc");
  }
  return get<Video[]>(`/videos?status=${status}&_sort=finishedAt&_order=desc`);
};
