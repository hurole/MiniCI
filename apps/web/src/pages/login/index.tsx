import { Button } from '@arco-design/web-react';
import Gitea from '@assets/images/gitea.svg?react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { loginService } from './service';

function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authCode = searchParams.get('code');

  const onLoginClick = async () => {
    const url = await loginService.getAuthUrl();
    if (url) {
      window.location.href = url;
    }
  };

  useEffect(() => {
    if (authCode) {
      loginService.login(authCode, navigate);
    }
  }, [authCode, navigate]);

  return (
    <div className="flex justify-center items-center h-[100vh]">
      <Button
        type="primary"
        color="green"
        shape="round"
        size="large"
        onClick={onLoginClick}
      >
        <span className="flex items-center gap-2">
          <Gitea className="w-5 h-5" />
          <span>Gitea 授权登录</span>
        </span>
      </Button>
    </div>
  );
}

export default Login;
