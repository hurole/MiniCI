import { Avatar, Layout, Menu } from '@arco-design/web-react';
import {
  IconApps,
  IconMenuFold,
  IconMenuUnfold,
  IconRobot,
  IconUser,
} from '@arco-design/web-react/icon';
import { useState } from 'react';
import Logo from '@assets/images/logo.svg?react';
import { Link, Outlet } from 'react-router';

function Home() {
  const [collapsed, setCollapsed] = useState(false);

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
          {!collapsed && <h2 className="ml-4 text-xl font-medium">Foka CI</h2>}
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
          <Menu.Item key="1">
            <Link to="/env">
              <IconRobot fontSize={16} />
              环境管理
            </Link>
          </Menu.Item>
        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header className="h-14 border-b-gray-100 border-b-[1px]">
          <div className="flex items-center justify-end px-4 h-full">
            <Avatar>
              <IconUser />
            </Avatar>
          </div>
        </Layout.Header>
        <Layout.Content>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}

export default Home;
