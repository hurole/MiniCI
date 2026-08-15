import { Avatar, Dropdown, Layout, Menu } from '@arco-design/web-react';
import { IconExport } from '@arco-design/web-react/icon';
import Logo from '@assets/images/logo.svg?react';
import { PageBreadcrumb } from '@components/PageBreadcrumb';
import { loginService } from '@pages/login/service';
import { useGlobalStore } from '@stores/global';
import { Outlet, useNavigate } from 'react-router';

function Home() {
  const globalStore = useGlobalStore();
  const navigate = useNavigate();

  return (
    <Layout className="h-screen">
      <Layout.Header className="flex h-14 items-center justify-between border-b-[1px] border-b-gray-100 px-4">
        <button
          className="flex cursor-pointer flex-row items-center border-none bg-transparent p-0 outline-none"
          onClick={() => navigate('/project')}
          type="button">
          <Logo className="h-8 w-8" aria-label="MiniCI" />
          <h2 className="m-0 ml-3 text-lg font-medium text-gray-800">Mini CI</h2>
        </button>
        <div className="flex h-full items-center justify-end">
          <Dropdown
            droplist={
              <Menu className="px-3">
                <Menu.Item key="1" onClick={loginService.logout}>
                  <IconExport />
                  <span className="ml-2">退出登录</span>
                </Menu.Item>
              </Menu>
            }>
            <div className="flex cursor-pointer items-center rounded-xl p-2 hover:bg-gray-100">
              <Avatar size={28} className="border border-solid border-gray-300">
                <img alt="avatar" src={globalStore.user?.avatar_url.replace('https', 'http')} />
              </Avatar>
              <span className="ml-2 font-semibold text-gray-500">{globalStore.user?.username}</span>
            </div>
          </Dropdown>
        </div>
      </Layout.Header>
      <Layout.Content className="min-h-0 bg-gray-100">
        <div className="flex h-full flex-col">
          <PageBreadcrumb />
          <div className="min-h-0 flex-1">
            <Outlet />
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default Home;
