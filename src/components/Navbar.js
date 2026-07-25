import { Link, useLocation } from 'react-router-dom';
import { navGroups } from '../config/routes';

export default function Navbar() {
  const location = useLocation();

  const groupClass = (isActive) =>
    `cursor-pointer list-none rounded px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
    }`;

  const linkClass = (path) =>
    `block rounded px-3 py-2 text-sm transition-colors whitespace-nowrap ${
      location.pathname === path
        ? 'bg-blue-50 text-blue-700 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-3 whitespace-nowrap text-lg font-bold text-gray-800">📋 资产管理系统</div>

        {navGroups.map((group) => {
          const isActiveGroup = group.routes.some((route) => route.path === location.pathname);

          return (
            <details key={group.key} className="group relative">
              <summary className={groupClass(isActiveGroup)}>{group.name}</summary>
              <div className="absolute left-0 top-10 z-50 min-w-[220px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                {group.routes.map((route) => (
                  <Link key={route.path} to={route.path} className={linkClass(route.path)}>
                    {route.name}
                  </Link>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </nav>
  );
}
