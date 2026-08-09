import React from 'react';
import { User, Calendar, CheckSquare, XSquare } from 'lucide-react';

const watermarkStyle = {
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='150'><text x='50' y='100' transform='rotate(-25 50 100)' fill='%23000000' fill-opacity='0.04' font-family='sans-serif' font-size='16'>梁声 111160</text></svg>")`,
  backgroundRepeat: 'repeat',
};

export default function AssetMaintenanceLayout({ sidebarContent, children }) {
  return (
    <div className="flex h-screen w-full bg-white font-['Microsoft_YaHei',_sans-serif] text-[12px] text-gray-800 overflow-hidden">
      <div className="w-[180px] bg-[#f5f5f5] flex flex-col flex-shrink-0 border-r border-gray-300">
        <div className="p-2 border-b border-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <User size={14} className="text-blue-500" />
            <span className="font-bold">梁声 (111160)</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-red-500" />
            <span>2026年05月11日 Mon</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare size={14} className="text-gray-400" />
            <span>您有 <span className="text-green-600 font-bold">0</span> 条待办任务</span>
          </div>
          <div className="flex items-center gap-2">
            <XSquare size={14} className="text-red-500" />
            <span>您有 <span className="text-red-600 font-bold">4</span> 条已办任务</span>
          </div>
        </div>
        {sidebarContent}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden" style={watermarkStyle}>
        {children}
      </div>
    </div>
  );
}
