import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function AdminContent({ activeMenu, activeSubMenu, activeTab, tabs, onTabChange, children }) {
  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <span>首页</span>
        <ChevronRight size={14} />
        <span>{activeMenu}</span>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium">{activeSubMenu}</span>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-[#f0f0f0] min-h-[calc(100vh-140px)] flex flex-col">
        {tabs.length > 0 && (
          <div className="flex items-center border-b border-[#f0f0f0] px-4 pt-2 overflow-x-auto custom-scrollbar bg-white rounded-t-md">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`px-5 py-3 text-sm cursor-pointer whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#1677ff] font-medium' : 'text-gray-600 hover:text-[#1677ff]'}`}
                onClick={() => onTabChange(tab)}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1677ff]" />}
              </div>
            ))}
          </div>
        )}
        <div className="p-4 md:p-5 bg-[#fafafa] flex-1 flex flex-col relative">
          {children}
        </div>
      </div>
    </div>
  );
}
