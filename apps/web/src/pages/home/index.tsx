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
      <Layout.Header className="h-14 border-b-gray-100 border-b-[1px] flex items-center justify-between px-4">
        <button
          className="flex flex-row items-center cursor-pointer bg-transparent border-none p-0 outline-none"
          onClick={() => navigate('/project')}
          type="button"
        >
          <Logo className="h-8 w-8" aria-label="MiniCI" />
          <h2 className="ml-3 text-lg font-medium m-0 text-gray-800">
            Mini CI
          </h2>
        </button>
        <div className="flex items-center justify-end h-full">
          <Dropdown
            droplist={
              <Menu className="px-3">
                <Menu.Item key="1" onClick={loginService.logout}>
                  <IconExport />
                  <span className="ml-2">退出登录</span>
                </Menu.Item>
              </Menu>
            }
          >
            <div className="p-2 rounded-xl cursor-pointer flex items-center hover:bg-gray-100">
              <Avatar size={28} className="border-gray-300 border border-solid">
                <img
                  alt="avatar"
                  src={globalStore.user?.avatar_url.replace('https', 'http')}
                />
              </Avatar>
              <span className="ml-2 font-semibold text-gray-500">
                {globalStore.user?.username}
              </span>
            </div>
          </Dropdown>
        </div>
      </Layout.Header>
      <Layout.Content className="bg-gray-100 min-h-0">
        <div className="h-full flex flex-col">
          <PageBreadcrumb />
          <div className="flex-1 min-h-0">
            <Outlet />
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default Home;
