import type { AxiosInstance, AxiosRequestConfig } from 'axios';

// 커스텀 응답 타입을 정의
interface CustomAxiosInstance extends AxiosInstance {
  get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
  post<T = any, R = T>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R>;
  put<T = any, R = T>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R>;
  delete<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
}

interface ApiError {
  message: string;
  status: number;
}

export type { CustomAxiosInstance, ApiError };
