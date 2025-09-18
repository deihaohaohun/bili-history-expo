// request.js
import axios from "axios";

// 创建 axios 实例
const request = axios.create({
  baseURL: `http://${process.env.EXPO_PUBLIC_LOCAL_IP}:3000`,
  timeout: 10000, // 超时时间 10s
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 在请求前统一处理，比如添加 token
    const token = "your_token"; // 可以从 Redux / AsyncStorage 拿
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 统一处理响应
    return response.data; // 直接返回 data 部分
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      console.log("接口错误：", error.response.status, error.response.data);
    } else if (error.request) {
      console.log("请求未响应：", error.request);
    } else {
      console.log("请求设置错误：", error.message);
    }
    return Promise.reject(error);
  }
);

export default request;

export function get<T>(url: string) {
  return request.get<any, T>(url);
}

export function put<T>(url: string, data: any) {
  return request.put<any, T>(url, data);
}
