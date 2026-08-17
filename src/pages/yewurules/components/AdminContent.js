import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function AdminContent({ activeMenu, activeSubMenu, activeTab, tabs, onTabChange, children }) {
  const isWorkspace = activeMenu === '个人工作台';
  const prototypePageScope = [activeMenu, activeSubMenu, activeTab].filter(Boolean).join('::');
  const prototypePageLabel = activeTab || activeSubMenu || activeMenu;

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#f0f2f5] p-4 md:p-6"
      data-prototype-page-scope={prototypePageScope}
      data-prototype-page-label={prototypePageLabel}
    >
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <span>首页</span>
        <ChevronRight size={14} />
        <span>{activeMenu}</span>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-800">{activeSubMenu}</span>
      </div>

      <div
        className={isWorkspace
          ? 'min-h-[calc(100vh-140px)] flex flex-col'
          : 'min-h-[calc(100vh-140px)] flex flex-col rounded-md border border-[#f0f0f0] bg-white shadow-sm'}
      >
        {tabs.length > 0 && (
          <div className="custom-scrollbar flex items-center overflow-x-auto rounded-t-md border-b border-[#f0f0f0] bg-white px-4 pt-2">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`relative cursor-pointer whitespace-nowrap px-5 py-3 text-sm transition-colors ${activeTab === tab ? 'font-medium text-[#1677ff]' : 'text-gray-600 hover:text-[#1677ff]'}`}
                onClick={() => onTabChange(tab)}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#1677ff]" />}
              </div>
            ))}
          </div>
        )}
        <div
          className={isWorkspace
            ? 'relative flex flex-1 flex-col'
            : 'relative flex flex-1 flex-col bg-[#fafafa] p-4 md:p-5'}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
