import { Link, useLocation } from 'react-router-dom';

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
      {/* 导航容器：支持横向滚动、不换行 */}
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        <div className="text-lg font-bold text-gray-800 mr-6 whitespace-nowrap">📋 资产管理系统</div>
        <Link to="/PCSDASHBOARD" className={linkClass('/PCSDASHBOARD')}>域名&证书看板</Link>
        <Link to="/PCSDASHBOARD(2)" className={linkClass('/PCSDASHBOARD(2)')}>域名&证书看板（2）</Link>
        <Link to="/PCS" className={linkClass('/PCS')}>域名&证书查询列表</Link>
        <Link to="/" className={linkClass('/')}>报废申请单</Link>
        <Link to="/approval" className={linkClass('/approval')}>审批页</Link>
        <Link to="/BaofeiNeishen" className={linkClass('/BaofeiNeishen')}>报废申请单——内审</Link>
        <Link to="/BaofeiCaigou2" className={linkClass('/BaofeiCaigou2')}>报废申请单——采购（2）</Link>
        <Link to="/BaofeiCaigou3" className={linkClass('/BaofeiCaigou3')}>报废申请单——采购（3）</Link>
        <Link to="/BaofeiCaigou4" className={linkClass('/BaofeiCaigou4')}>报废申请单——采购（4）</Link>
        <Link to="/Dashboard" className={linkClass('/Dashboard')}>机房资产大盘</Link>
        <Link to="/Dashboardapp" className={linkClass('/Dashboardapp')}>机房资产大盘移动端</Link>
        <Link to="/Caigoudingdan" className={linkClass('/Caigoudingdan')}>采购订单编辑页</Link>
        <Link to="/BaofeiCaigou1" className={linkClass('/BaofeiCaigou1')}>报废申请单——采购（1）</Link>
        <Link to="/Jifang" className={linkClass('/Jifang')}>机房资产管理</Link>
        <Link to="/Jifanglist" className={linkClass('/Jifanglist')}>机房资产维护查询列表</Link>
        <Link to="/Jifanglistone" className={linkClass('/Jifanglistone')}>机房资产维护查询列表（员工端）</Link>
        <Link to="/Weizhi" className={linkClass('/Weizhi')}>位置变更编辑页</Link>
        <Link to="/Positionshenpi" className={linkClass('/Positionshenpi')}>位置变更审批页</Link>
        <Link to="/SN" className={linkClass('/SN')}>序列号变更编辑页</Link>
        <Link to="/SNshenpi" className={linkClass('/SNshenpi')}>序列号变更审批页</Link>
        <Link to="/Connectzhu" className={linkClass('/Connectzhu')}>主备维护主编辑页</Link>
        <Link to="/Connectbei" className={linkClass('/Connectbei')}>主备维护备件编辑页</Link>
        <Link to="/Connectshenpi" className={linkClass('/Connectshenpi')}>主备维护审批页</Link>
        <Link to="/People" className={linkClass('/People')}>责任人变更编辑页</Link>
        <Link to="/Peoplejieshou" className={linkClass('/Peoplejieshou')}>责任人变更接收人确认——审批</Link>
        <Link to="/Peopleshiwu" className={linkClass('/Peopleshiwu')}>责任人变更实物确认——审批</Link>
        {/* <Link to="/SN" className={linkClass('/SN')}>序列号变更编辑页</Link> */}
      </div>
    </nav>
  );
}