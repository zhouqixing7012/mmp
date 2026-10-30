import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function AdminBreadcrumb({ activeMenu, activeSubMenu, activeTab, onTabChange }) {
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
      <nav aria-label="面包屑" className="flex flex-wrap items-center gap-2 text-sm text-text-tertiary">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
              {item.onClick && !isLast ? (
                <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-text-primary transition-colors hover:text-primary" onClick={item.onClick}>{item.label}</button>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-primary' : ''}>{item.label}</span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
  );
}
