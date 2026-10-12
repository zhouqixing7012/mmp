import React from 'react';
import { Button, Card, InputNumber, Select, Space, Switch, Table, Typography } from 'antd';
import { AssetCategorySelect, OwnerLevelSelect } from '../../components/AssetQueryControls';
import SectionCardTitle from './SectionCardTitle';

export default function InventoryPhotoRuleEditor({ config, onChange, assets, ranges }) {
  const change = (key, field, value) => onChange({ ...config, rules: config.rules.map(rule => rule.key === key ? { ...rule, [field]: value } : rule) });
  const fieldColumns = [
    ['部门', 'department', 'ownerDept'], ['资产状态', 'assetStatus', 'useStatus'],
    ['盘点组织', 'organization', 'organization'], ['City', 'city', 'city'],
    ['Building', 'building', 'building'], ['Floor', 'floor', 'floor'],
  ].map(([title, field, assetField]) => ({
    title, dataIndex: field, width: 160,
    render: (value, rule) => <Select mode="multiple" allowClear className="w-full" value={value}
      options={[...new Set(assets.map(asset => asset[assetField]).filter(Boolean))].map(option => ({ label: option, value: option }))}
      onChange={next => change(rule.key, field, next)} />,
  }));
  const columns = [
    { title: '盘点范围', dataIndex: 'range', width: 120, render: (value, rule) => <Select className="w-full" value={value} options={ranges.map(range => ({ label: range, value: range }))} onChange={next => change(rule.key, 'range', next)} /> },
    { title: '资产责任人职级', dataIndex: 'ownerLevel', width: 180, render: (value, rule) => <OwnerLevelSelect rows={assets} value={value} onChange={next => change(rule.key, 'ownerLevel', next)} /> },
    fieldColumns[0],
    { title: '资产类别', dataIndex: 'category', width: 180, render: (value, rule) => <AssetCategorySelect rows={assets} value={value} onChange={next => change(rule.key, 'category', next)} /> },
    ...fieldColumns.slice(1),
    { title: '上传百分比（%）', dataIndex: 'percent', width: 140, render: (value, rule) => <InputNumber min={0} max={100} value={value} className="w-full" onChange={next => change(rule.key, 'percent', next)} /> },
    { title: '操作', width: 80, fixed: 'right', render: (_, rule) => <Button type="link" danger onClick={() => onChange({ ...config, rules: config.rules.filter(row => row.key !== rule.key) })}>删除</Button> },
  ];
  const addRule = () => onChange({ ...config, rules: [...config.rules, {
    key: `image-${Date.now()}`, range: ranges[0], ownerLevel: [], department: [], category: [],
    assetStatus: [], organization: [], city: [], building: [], floor: [], percent: 100,
  }] });
  return <Card size="small" title={<SectionCardTitle>图片上传规则配置</SectionCardTitle>}
    extra={<Space><Typography.Text>是否上传图片</Typography.Text><Switch aria-label="是否上传图片" checked={config.enabled} onChange={enabled => onChange({ ...config, enabled })} /></Space>}>
    {config.enabled && <><div className="mb-3 flex justify-end"><Button onClick={addRule}>增行</Button></div>
      <Table rowKey="key" size="small" bordered columns={columns} dataSource={config.rules} scroll={{ x: 1860 }} pagination={false} /></>}
  </Card>;
}
