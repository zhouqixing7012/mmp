import { Link, useLocation } from 'react-router-dom';
import { navRoutes } from '../config/routes';

export default function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
      location.pathname === path
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        <div className="text-lg font-bold text-gray-800 mr-6 whitespace-nowrap">📋 资产管理系统</div>
        {navRoutes.map((route) => (
          <Link key={route.path} to={route.path} className={linkClass(route.path)}>
            {route.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
