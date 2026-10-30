import React, { useRef } from 'react';
import QueryTabs from '../../../components/QueryTabs';
import PageMotionBoundary from '../../../components/PageMotionBoundary';

function ConfigTabContent({ tab, children }) {
  const pages = useRef(new Map());
  pages.current.set(tab, children);
  return Array.from(pages.current, ([key, content]) => <div key={key} hidden={key !== tab}>{content}</div>);
}

export default function AdminContent({ activeMenu, activeSubMenu, activeTab, tabs, onTabChange, children }) {
  const isWorkspace = activeMenu === '个人工作台';
  const prototypePageScope = [activeMenu, activeSubMenu, activeTab].filter(Boolean).join('::');
  const prototypePageLabel = activeTab || activeSubMenu || activeMenu;

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#F2F5FA] p-4 md:p-6"
      data-prototype-page-scope={prototypePageScope}
      data-prototype-page-label={prototypePageLabel}
    >


      <div
        className={isWorkspace
          ? 'min-h-[calc(100vh-140px)] flex flex-col'
          : 'min-h-[calc(100vh-140px)] flex flex-col min-w-0'}
      >
        <QueryTabs key={activeMenu === '后台基础配置' ? activeSubMenu : prototypePageScope} tabs={tabs} activeTab={activeTab} onChange={onTabChange}>
        <PageMotionBoundary
          key={activeMenu === '后台基础配置' ? activeSubMenu : prototypePageScope}
          className={isWorkspace
            ? 'relative flex flex-1 flex-col'
            : 'relative flex flex-1 flex-col min-w-0 bg-transparent'}
        >
          {activeMenu === '后台基础配置' ? <ConfigTabContent key={activeSubMenu} tab={activeTab}>{children}</ConfigTabContent> : children}
        </PageMotionBoundary>
        </QueryTabs>
      </div>
    </div>
  );
}
