import { net } from '@shared';
import type { AuthURLResponse } from './types';
import type { NavigateFunction } from 'react-router';
import { Notification } from '@arco-design/web-react';

class LoginService {
  async getAuthUrl() {
    const { code, data } = await net.request<AuthURLResponse>({
      method: 'GET',
      url: '/api/auth/url',
      params: {
        redirect: encodeURIComponent(`${location.origin}/login`),
      },
    });
    if (code === 0) {
      return data.url;
    }
  }

  async login(authCode: string, navigate: NavigateFunction) {
    const { data, code } = await net.request<AuthURLResponse>({
      method: 'POST',
      url: '/api/auth/login',
      data: {
        code: authCode,
      },
    });
    if (code === 0) {
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
      Notification.success({
        title: '提示',
        content: '登录成功'
      });
    }
  }
}

export const loginService = new LoginService();
