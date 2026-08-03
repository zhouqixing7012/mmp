import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Radio, Table } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';

export const BORROW_WAREHOUSES = [
  { id: 'WH-BJ-001', code: '10001', name: '北京总部仓', company: '搜狐新动力信息技术有限公司' },
  { id: 'WH-BJ-002', code: '10002', name: '北京影像器材仓', company: '搜狐新动力信息技术有限公司' },
  { id: 'WH-SH-001', code: '10003', name: '上海资产仓', company: '上海搜狐信息技术有限公司' },
  { id: 'WH-GZ-001', code: '10004', name: '广州资产仓', company: '搜狐新动力信息技术有限公司' },
];

const EMPTY_QUERY = { code: '', name: '' };

export function getBorrowWarehouse(name) {
  return BORROW_WAREHOUSES.find((item) => item.name === name) || null;
}

export default function WarehouseSelectModal({ open, value, onCancel, onConfirm }) {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    if (!open) return;
    setQuery(EMPTY_QUERY);
    setAppliedQuery(EMPTY_QUERY);
    setSelectedKey(getBorrowWarehouse(value)?.id || null);
  }, [open, value]);

  const filteredRows = useMemo(() => BORROW_WAREHOUSES.filter((item) => (
    (!appliedQuery.code || item.code.includes(appliedQuery.code.trim()))
    && (!appliedQuery.name || item.name.includes(appliedQuery.name.trim()))
  )), [appliedQuery]);

  const selectedWarehouse = BORROW_WAREHOUSES.find((item) => item.id === selectedKey) || null;
  const columns = [
    {
      title: '选择',
      width: 70,
      align: 'center',
      render: (_, record) => <Radio checked={selectedKey === record.id} />,
    },
    { title: '仓库编码', dataIndex: 'code', width: 140 },
    { title: '仓库描述', dataIndex: 'name', width: 260 },
    { title: '所属公司', dataIndex: 'company' },
  ];

  const reset = () => {
    setQuery(EMPTY_QUERY);
    setAppliedQuery(EMPTY_QUERY);
  };

  return (
    <Modal
      title="仓库列表"
      open={open}
      width={820}
      footer={null}
      destroyOnHidden
      onCancel={onCancel}
    >
      <QueryBar onQuery={() => setAppliedQuery(query)} onReset={reset}>
        <QueryItem label="仓库编码">
          <Input
            allowClear
            value={query.code}
            placeholder="请输入仓库编码"
            onChange={(event) => setQuery((current) => ({ ...current, code: event.target.value }))}
          />
        </QueryItem>
        <QueryItem label="仓库描述">
          <Input
            allowClear
            value={query.name}
            placeholder="请输入仓库描述"
            onChange={(event) => setQuery((current) => ({ ...current, name: event.target.value }))}
          />
        </QueryItem>
      </QueryBar>

      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={filteredRows}
        pagination={false}
        scroll={{ y: 360 }}
        onRow={(record) => ({
          onClick: () => setSelectedKey(record.id),
          className: selectedKey === record.id ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer',
        })}
      />

      <div className="mt-4 flex justify-center gap-3">
        <Button type="primary" disabled={!selectedWarehouse} onClick={() => onConfirm(selectedWarehouse)}>确定</Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </Modal>
  );
}
