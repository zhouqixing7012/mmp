import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center space-x-4">
      <div className="text-lg font-bold text-gray-800 mr-6">📋 资产管理系统</div>
      <Link to="/" className={linkClass('/')}>报废申请单</Link>
      <Link to="/approval" className={linkClass('/approval')}>审批页</Link>
      <Link to="/BaofeiNeishen" className={linkClass('/BaofeiNeishen')}>报废申请单——内审</Link>
      <Link to="/BaofeiCaigou2" className={linkClass('/BaofeiCaigou2')}>报废申请单——采购（2）</Link>
      <Link to="/BaofeiCaigou3" className={linkClass('/BaofeiCaigou3')}>报废申请单——采购（3）</Link>
      <Link to="/BaofeiCaigou4" className={linkClass('/BaofeiCaigou4')}>报废申请单——采购（4）</Link>
    </nav>
  );
}