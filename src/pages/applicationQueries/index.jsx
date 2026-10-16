import React from 'react';
import ApplicationQueryPage from './ApplicationQueryPage';

export const APPLICATION_PAGE_IDS = { 移库单: 'storage', 退库单: 'return', 转移单: 'transfer', 借用单: 'borrow', 更换单: 'replacement', 未完成单据: 'unfinished', 资产申请单: 'asset', 耗材申请单: 'consumable', 新员工领用单: 'newEmployee' };
export default function ApplicationQueriesContent({ activeSubMenu }) {
  const id = APPLICATION_PAGE_IDS[activeSubMenu];
  if (!id) throw new Error(`申请菜单未定义：${activeSubMenu}`);
  return <ApplicationQueryPage key={id} id={id} />;
}
