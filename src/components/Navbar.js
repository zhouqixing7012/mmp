import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navGroups } from '../config/routes';

export default function Navbar() {
  const location = useLocation();
  const [openGroupKey, setOpenGroupKey] = useState('');

  const groupClass = (isActive) =>
    `rounded px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
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

  const toggleGroup = (groupKey) => {
    setOpenGroupKey((currentKey) => (currentKey === groupKey ? '' : groupKey));
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-3 whitespace-nowrap text-lg font-bold text-gray-800">📋 资产管理系统</div>

        {navGroups.map((group) => {
          const isActiveGroup = group.routes.some((route) => route.path === location.pathname);
          const isOpen = openGroupKey === group.key;

          return (
            <div key={group.key} className="relative">
              <button type="button" className={groupClass(isActiveGroup)} onClick={() => toggleGroup(group.key)}>
                {group.name}
              </button>

              {isOpen && (
                <div className="absolute left-0 top-10 z-50 min-w-[220px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  {group.routes.map((route) => (
                    <Link key={route.path} to={route.path} className={linkClass(route.path)} onClick={() => setOpenGroupKey('')}>
                      {route.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
