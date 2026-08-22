import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function AdminContent({ activeMenu, activeSubMenu, activeTab, tabs, onTabChange, children }) {
  const isWorkspace = activeMenu === '个人工作台';
  const prototypePageScope = [activeMenu, activeSubMenu, activeTab].filter(Boolean).join('::');
  const prototypePageLabel = activeTab || activeSubMenu || activeMenu;
  const [dynamicBreadcrumb, setDynamicBreadcrumb] = useState(null);

  useEffect(() => {
    setDynamicBreadcrumb(null);
  }, [activeMenu, activeSubMenu, activeTab]);

  useEffect(() => {
    const handleBreadcrumbChange = (event) => {
      const items = event.detail?.items;
      setDynamicBreadcrumb(Array.isArray(items) && items.length ? items : null);
    };
    window.addEventListener('mmp:breadcrumb-change', handleBreadcrumbChange);
    return () => window.removeEventListener('mmp:breadcrumb-change', handleBreadcrumbChange);
  }, []);

  const defaultBreadcrumb = [
    { label: '首页' },
    { label: activeMenu },
    { label: activeSubMenu },
    ...(activeTab && activeTab !== activeSubMenu ? [{ label: activeTab, onClick: () => onTabChange(activeTab) }] : []),
  ].filter((item) => item.label);
  const breadcrumbItems = dynamicBreadcrumb || defaultBreadcrumb;

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#f0f2f5] p-4 md:p-6"
      data-prototype-page-scope={prototypePageScope}
      data-prototype-page-label={prototypePageLabel}
    >
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 && <ChevronRight size={14} />}
              {item.onClick && !isLast ? (
                <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-gray-500 transition-colors hover:text-[#1677ff]" onClick={item.onClick}>{item.label}</button>
              ) : (
                <span className={isLast ? 'font-medium text-gray-800' : ''}>{item.label}</span>
              )}
            </React.Fragment>
          );
        })}
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
