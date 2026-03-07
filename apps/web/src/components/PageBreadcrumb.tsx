import { Breadcrumb } from '@arco-design/web-react';
import { IconHome } from '@arco-design/web-react/icon';
import { Link, useLocation } from 'react-router';

export function PageBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If we are at root, don't show breadcrumb
  if (pathnames.length === 0) return null;

  return (
    <div className="px-6 py-3 bg-white border-b border-gray-200">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">
            <IconHome />
          </Link>
        </Breadcrumb.Item>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          let breadcrumbName = value;
          if (value === 'project') breadcrumbName = '项目管理';
          // project detail ID
          if (
            index > 0 &&
            pathnames[index - 1] === 'project' &&
            !Number.isNaN(Number(value))
          ) {
            breadcrumbName = '项目详情';
          }

          return last ? (
            <Breadcrumb.Item key={to}>{breadcrumbName}</Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item key={to}>
              <Link to={to}>{breadcrumbName}</Link>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
}
