import axios from 'axios';

import { type ApiError, type CustomAxiosInstance } from './types';

const apiInstance: CustomAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status || 500,
    };
    return Promise.reject(apiError);
  },
);

export { apiInstance };
