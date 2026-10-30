import React from 'react';
import { Bell, User, ChevronDown, LogOut } from 'lucide-react';

import AdminBreadcrumb from './AdminBreadcrumb';
import { Avatar, Dropdown } from 'antd';
import { useInventoryOperator } from '../../assetInventory/useInventoryOperator';

export default function AdminHeader({ activeMenu, activeSubMenu, activeTab, onTabChange }) {
  const [operator] = useInventoryOperator();
  const employeeName = operator.replace(/^\d+-/, '');
  const logout = () => {
    sessionStorage.setItem('mmp-demo-signed-out', '1');
    window.dispatchEvent(new Event('mmp-demo-session-change'));
  };
  return (
    <div className="min-h-16 shrink-0 py-2 bg-white shadow-[0_1px_4px_rgba(0,21,41,0.08)] flex items-center justify-between px-4 z-10">
      <div className="min-w-0 flex-1 pr-4"><AdminBreadcrumb {...{ activeMenu, activeSubMenu, activeTab, onTabChange }} /></div>
      <div className="flex items-center gap-4 text-gray-500">
        <Bell size={18} className="cursor-pointer hover:text-gray-800 transition-colors" />
        <Dropdown trigger={['click']} menu={{ items: [{ key: 'logout', label: '退出登录', icon: <LogOut size={16} /> }], onClick: logout }}>
          <button type="button" className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100" aria-label={`${employeeName}，账户菜单`}>
            <Avatar size={28} icon={<User size={18} />} />
            <span className="text-sm text-gray-700">{employeeName}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </Dropdown>
      </div>
    </div>
  );
}
