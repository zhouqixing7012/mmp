import React from 'react';
import { App as AntdApp, Card, Empty, Typography } from 'antd';
import ApplicationQueryPage from './ApplicationQueryPage';
import TransferApplicationPage from './TransferApplicationPage';

export const APPLICATION_PAGE_IDS = { 移库单: 'storage', 退库单: 'return', 转移单: 'transfer', 借用单: 'borrow', 更换单: 'replacement', 未完成单据: 'unfinished', 资产申请单: 'asset', 耗材申请单: 'consumable', 新员工领用单: 'newEmployee' };
export default function ApplicationQueriesContent({ activeSubMenu }) {
  const id = APPLICATION_PAGE_IDS[activeSubMenu];
  if (!id) throw new Error(`申请菜单未定义：${activeSubMenu}`);
  if (id === 'transfer') return <AntdApp><TransferApplicationPage /></AntdApp>;
  if (id === 'replacement') return <div className="flex flex-col gap-4"><Typography.Title level={4}>更换单</Typography.Title>
    <Card size="small"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="新版 PRD 尚未定义更换单的查询入口及页面字段。" /></Card></div>;
  return <ApplicationQueryPage key={id} id={id} />;
}
