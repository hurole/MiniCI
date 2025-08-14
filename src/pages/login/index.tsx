import { Input, Space } from '@arco-design/web-react';
import { IconUser, IconInfoCircle } from '@arco-design/web-react/icon';
function Login() {
  return (
    <div>
      <Space direction='vertical'>
        <Input placeholder="username" prefix={<IconUser />} size="large" />
        <Input.Password
          placeholder="password"
          prefix={<IconInfoCircle />}
          size="large"
        />
      </Space>
    </div>
  );
}

export default Login;
