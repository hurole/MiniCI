import axios, { type Axios, type AxiosRequestConfig } from 'axios';

class Net {
  private readonly instance: Axios;
  constructor() {
    this.instance = axios.create({
      baseURL: process.env.BASE_URL,
      timeout: 20000,
      withCredentials: true,
    });

    this.applyInterceptors(this.instance);
  }

  private applyInterceptors(instance: Axios) {
    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.log('error', error);
        // 对于DELETE请求返回204状态码的情况，视为成功
        if (
          error.response &&
          error.response.status === 204 &&
          error.config.method === 'delete'
        ) {
          // 创建一个模拟的成功响应
          return Promise.resolve({
            ...error.response,
            data: error.response.data || null,
            status: 200, // 将204转换为200，避免被当作错误处理
          });
        }

        if (error.status === 401 && error.config.url !== '/api/auth/info') {
          window.location.href = '/login';
          return;
        }
        return Promise.reject(error);
      },
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.request<T>(config);
      if (!response || !response.data) {
        throw new Error('Invalid response');
      }
      return response.data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
}

export interface APIResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

export const net = new Net();
