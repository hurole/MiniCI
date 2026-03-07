import { Button, Space, Tag, Typography } from '@arco-design/web-react';
import Gitea from '@assets/images/gitea.svg?react';
import Logo from '@assets/images/logo.svg?react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { loginService } from './service';

const { Title, Text } = Typography;

export default function LoginPage() {
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[(--color-bg-1)]">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-border-1) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border-1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          opacity: 0.4,
        }}
      />
      <div
        className="fixed top-0 left-0 right-0 h-0.75 z-50"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgb(var(--green-6)), rgb(var(--blue-5)), rgb(var(--green-6)), transparent)',
          backgroundSize: '200% 100%',
          animation: 'pipelineFlow 3s linear infinite',
        }}
      />

      <div
        className="fixed w-150 h-150 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          top: '50%',
          left: '50%',
          background:
            'radial-gradient(circle, rgba(var(--green-6), 0.06) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-100 px-4"
        style={{ animation: 'cardIn 0.45s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div
          className="rounded-xl px-9 py-10"
          style={{
            background: 'var(--color-bg-2)',
            border: '1px solid var(--color-border-2)',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="flex items-center justify-center w-13 h-13 rounded-xl mb-4"
              style={{
                width: 52,
                height: 52,
                background: 'rgba(var(--green-6), 0.1)',
                border: '1px solid rgba(var(--green-6), 0.25)',
              }}
            >
              <Logo />
            </div>
            <Title
              heading={4}
              style={{
                marginBottom: 4,
                fontFamily: 'monospace',
                letterSpacing: '-0.5px',
              }}
            >
              Mini<span style={{ color: 'rgb(var(--green-6))' }}>CI</span>
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              持续集成 · 部署平台
            </Text>
          </div>

          <div className="flex items-center justify-center gap-1 mb-6">
            {['Build', 'Test', 'Deploy'].map((stage, index) => (
              <>
                <Tag
                  key={stage}
                  color="green"
                  size="small"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                  }}
                >
                  {stage}
                </Tag>
                {index < 2 && (
                  <Text
                    key={stage}
                    type="secondary"
                    style={{ fontSize: 12, lineHeight: 1 }}
                  >
                    ›
                  </Text>
                )}
              </>
            ))}
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-6"
            style={{
              background: 'rgba(var(--green-6), 0.08)',
              border: '1px solid rgba(var(--green-6), 0.2)',
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                background: 'rgb(var(--green-6))',
                animation: 'blink 2s ease-in-out infinite',
              }}
            />
            <Text
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                color: 'rgb(var(--green-6))',
              }}
            >
              Gitea OAuth · 服务正常
            </Text>
          </div>

          <Button
            long
            size="large"
            onClick={onLoginClick}
            style={{
              borderRadius: '8px',
              fontFamily: 'monospace',
            }}
          >
            <span className="flex items-center gap-3 justify-center">
              <Gitea className="w-5 h-5" />
              <span className="text-xs">Gitea 授权登录</span>
            </span>
          </Button>

          <div
            className="my-6"
            style={{ height: 1, background: 'var(--color-border-1)' }}
          />
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              textAlign: 'center',
              display: 'block',
              lineHeight: 1.8,
            }}
          >
            登录即代表你有权访问系统
          </Text>
        </div>

        <div className="flex items-center justify-center gap-4 mt-5">
          {['MiniCI', 'v0.1.0'].map((item, i) => (
            <Space key={item} size={16}>
              <Text
                type="tertiary"
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                {item}
              </Text>
              {i < 2 && (
                <span
                  style={{
                    width: 1,
                    height: 10,
                    background: 'var(--color-border-2)',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                  }}
                />
              )}
            </Space>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pipelineFlow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
