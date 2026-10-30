import React from 'react';
import { Bell, Menu, XCircle, User, ChevronDown, LogOut } from 'lucide-react';

import { Avatar, Dropdown } from 'antd';
import { useInventoryOperator } from '../../assetInventory/useInventoryOperator';

export default function AdminHeader({ activeSubMenu }) {
  const [operator] = useInventoryOperator();
  const employeeName = operator.replace(/^\d+-/, '');
  const logout = () => {
    sessionStorage.setItem('mmp-demo-signed-out', '1');
    window.dispatchEvent(new Event('mmp-demo-session-change'));
  };
  return (
    <div className="h-14 bg-white shadow-[0_1px_4px_rgba(0,21,41,0.08)] flex items-center justify-between px-4 z-10">
      <div className="flex items-center gap-4">
        <div className="p-1 cursor-pointer text-gray-500 hover:bg-gray-100 rounded transition-colors">
          <Menu size={20} />
        </div>
        <div className="flex items-end h-full pt-3 gap-1">
          <div className="px-4 py-1.5 bg-[#fafafa] border border-b-0 border-[#f0f0f0] rounded-t-md text-sm text-gray-500 cursor-pointer flex items-center gap-2 hover:bg-gray-50">
            我的资产
            <XCircle size={12} className="hover:text-red-500" />
          </div>
          <div className="px-4 py-1.5 bg-primary-bg border border-b-0 border-primary rounded-t-md text-sm text-primary font-medium cursor-pointer flex items-center gap-2 relative top-[1px]">
            {activeSubMenu}
            <XCircle size={12} className="hover:text-primary" />
          </div>
        </div>
      </div>
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
