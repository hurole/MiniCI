import { Avatar, Dropdown, Layout, Menu } from '@arco-design/web-react';
import {
  IconApps,
  IconExport,
  IconMenuFold,
  IconMenuUnfold,

} from '@arco-design/web-react/icon';
import Logo from '@assets/images/logo.svg?react';
import { loginService } from '@pages/login/service';
import { useState } from 'react';
import { Link, Outlet } from 'react-router';
import { useGlobalStore } from '../../stores/global';

function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const globalStore = useGlobalStore();

  return (
    <Layout className="h-screen w-full">
      <Layout.Sider
        collapsible
        onCollapse={setCollapsed}
        trigger={
          collapsed ? (
            <IconMenuUnfold fontSize={16} />
          ) : (
            <IconMenuFold fontSize={16} />
          )
        }
      >
        <div className="flex flex-row items-center justify-center h-[56px]">
          <Logo />
          {!collapsed && <h2 className="ml-4 text-xl font-medium">Mini CI</h2>}
        </div>
        <Menu
          className="flex-1"
          defaultOpenKeys={['0']}
          defaultSelectedKeys={['0_1']}
          collapse={collapsed}
        >
          <Menu.Item key="0">
            <Link to="/project">
              <IconApps fontSize={16} />
              <span>项目管理</span>
            </Link>
          </Menu.Item>

        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header className="h-14 border-b-gray-100 border-b-[1px]">
          <div className="flex items-center justify-end px-4 h-full">
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
                <Avatar
                  size={28}
                  className="border-gray-300 border-[1px] border-solid"
                >
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
        <Layout.Content className="overflow-y-auto bg-gray-100">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

export default Home;
