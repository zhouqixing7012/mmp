import React from 'react';
import { Bell, Menu, XCircle } from 'lucide-react';

export default function AdminHeader({ activeSubMenu }) {
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
          <div className="px-4 py-1.5 bg-[#e6f4ff] border border-b-0 border-[#1677ff] rounded-t-md text-sm text-[#1677ff] font-medium cursor-pointer flex items-center gap-2 relative top-[1px]">
            {activeSubMenu}
            <XCircle size={12} className="hover:text-[#1677ff]" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-gray-500">
        <Bell size={18} className="cursor-pointer hover:text-gray-800 transition-colors" />
        <div className="w-7 h-7 rounded-full bg-[#1677ff] text-white flex items-center justify-center text-xs shadow-sm cursor-pointer hover:opacity-90">A</div>
      </div>
    </div>
  );
}
