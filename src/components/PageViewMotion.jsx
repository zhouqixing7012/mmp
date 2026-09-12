import React from 'react';

/**
 * 同一业务页面内部的列表 / 详情 / 编辑 / 创建视图切换容器。
 * viewKey 变化时重新触发项目统一的轻量页面进入动效。
 */
export default function PageViewMotion({ viewKey, children, className = '' }) {
  return (
    <div key={String(viewKey)} className={`mmp-page-motion ${className}`.trim()}>
      {children}
    </div>
  );
}
