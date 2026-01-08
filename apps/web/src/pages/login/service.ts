import { Message, Notification } from '@arco-design/web-react';
import { net } from '@shared';
import type { NavigateFunction } from 'react-router';
import { useGlobalStore } from '../../stores/global';
import type { AuthLoginResponse, AuthURLResponse } from './types';

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
    const { data, code } = await net.request<AuthLoginResponse>({
      method: 'POST',
      url: '/api/auth/login',
      data: {
        code: authCode,
      },
    });
    if (code === 0) {
      useGlobalStore.getState().setUser(data);
      navigate('/');
      Notification.success({
        title: '提示',
        content: '登录成功',
      });
    }
  }

  async logout() {
    const { code } = await net.request<AuthURLResponse>({
      method: 'GET',
      url: '/api/auth/logout',
    });
    if (code === 0) {
      Message.success('登出成功');
      window.location.href = '/login';
    }
  }
}

export const loginService = new LoginService();
