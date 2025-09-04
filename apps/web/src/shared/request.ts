import axios, { Axios, type AxiosRequestConfig } from 'axios';

class Net {
  private readonly instance: Axios;
  constructor() {
    this.instance = axios.create({
      baseURL: process.env.BASE_URL,
      timeout: 20000,
      withCredentials: true,
    });
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const { data } = await this.instance.request<T>(config);
    return data;
  }
}

export interface APIResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

export const net = new Net();
