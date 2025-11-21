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
