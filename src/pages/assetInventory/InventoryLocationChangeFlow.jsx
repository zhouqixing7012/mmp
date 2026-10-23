import React from 'react';
import { Button, Card, Space, Table, Typography, message } from 'antd';
import * as XLSX from 'xlsx';
import { getInventoryLocationChangePool } from './inventoryLocationChangeStore';

export const LOCATION_POOL_FIELDS = [
  ['资产标签号', row => row.assetTag], ['资产说明', row => row.assetDesc],
  ['序列号', row => row.serialNumber], ['数量', row => row.quantity],
  ['原城市', row => row.before?.city], ['原建筑物', row => row.before?.building], ['原楼层/机房', row => row.before?.floor],
  ['拟城市', row => row.after?.city], ['拟建筑物', row => row.after?.building], ['拟楼层/机房', row => row.after?.floor],
  ['备注', row => row.remark], ['记录人', row => row.operator], ['记录时间', row => row.recordedAt], ['处理状态', row => row.status],
];

export function createInventoryLocationPoolWorkbook(rows) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    LOCATION_POOL_FIELDS.map(([label]) => label),
    ...rows.map(row => LOCATION_POOL_FIELDS.map(([, value]) => value(row) ?? '')),
  ]), '位置变更池');
  return workbook;
}

// PC仅查看和导出移动端收集的位置建议，不再提供编辑、提交或审批入口。
export default function InventoryLocationChangeFlow({ project, onBack }) {
  const [messageApi, contextHolder] = message.useMessage();
  const rows = getInventoryLocationChangePool(project.projectNo);
  const exportPool = () => {
    try { XLSX.writeFile(createInventoryLocationPoolWorkbook(rows), `${project.projectNo}-位置变更池.xlsx`); }
    catch (error) { messageApi.error('位置变更池导出失败，请重试'); }
  };
  const columns = LOCATION_POOL_FIELDS.map(([title, value], index) => ({
    title, key: String(index), width: ['资产说明', '备注'].includes(title) ? 220 : 150,
    render: (_, row) => value(row) === null || value(row) === undefined || value(row) === '' ? '-' : value(row),
  }));
  return <Space direction="vertical" size={16} className="w-full">
    {contextHolder}
    <Typography.Title level={4}>位置变更池</Typography.Title>
    <Card size="small" title={`${project.projectNo} ${project.projectName || ''}`} extra={<Button onClick={exportPool}>导出</Button>}>
      <Table rowKey="id" bordered size="small" columns={columns} dataSource={rows}
        locale={{ emptyText: '暂无待变更资产' }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: total => `共 ${total} 条` }} />
    </Card>
    <div className="flex justify-end"><Button onClick={onBack}>返回</Button></div>
  </Space>;
}
