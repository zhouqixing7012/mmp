import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tabs } from 'antd';

// Mount page tabs in the first inline query Card. Dialog queries keep their own layout.
export default function QueryTabs({ tabs, activeTab, onChange, children }) {
  const root = useRef(null);
  const [target, setTarget] = useState(null);
  useLayoutEffect(() => {
    const container = root.current;
    const update = () => setTarget(Array.from(container.querySelectorAll('[data-mmp-query-tabs]'))
      .find(node => !node.closest('[hidden], [role="dialog"], .ant-modal, .ant-drawer')) || null);
    update();
    const observer = new MutationObserver(update);
    observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    return () => observer.disconnect();
  }, []);
  const navigation = tabs.length > 1 ? <Tabs aria-label="业务分类" activeKey={activeTab} onChange={onChange}
    items={tabs.map(tab => ({ key: tab, label: tab }))} /> : null;
  return <div ref={root} className="flex flex-1 flex-col min-w-0">
    {target ? createPortal(navigation, target) : navigation}
    {children}
  </div>;
}
