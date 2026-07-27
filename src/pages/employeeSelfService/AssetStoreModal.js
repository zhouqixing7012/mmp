import React, { useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Button, Input, Modal, Select, Space, Table, Tree } from 'antd';
import { ASSET_LIBRARY, TREE_CATEGORIES } from '../../mock/assetApplicationMock';

const DEFAULT_EXPANDED_NODES = ['c-pc', 'c-pc-l2', 'c-pc-l3-nb', 'c-office', 'c-office-l2', 'c-office-l3-acc'];

function toTreeData(nodes) {
  return nodes.map((node) => ({
    key: node.id,
    title: node.name,
    children: node.children ? toTreeData(node.children) : undefined,
  }));
}

function mapMaterial(asset) {
  return {
    id: asset.id,
    materialType: asset.type === 'consumable' ? '耗材' : '资产',
    type: asset.type,
    categoryId: asset.categoryId,
    category: asset.categoryId,
    assetDesc: asset.name,
    config: asset.desc,
    referencePrice: 0,
    overStandard: asset.id === 'A002',
    departmentOverStandard: asset.id === 'A002',
    requiresVp: asset.id === 'A002',
  };
}

export default function AssetStoreModal({ open, onCancel, onAdd }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('cat-nb-win');
  const [expandedNodes, setExpandedNodes] = useState(DEFAULT_EXPANDED_NODES);
  const [topFilter, setTopFilter] = useState('all');
  const treeData = useMemo(() => toTreeData(TREE_CATEGORIES), []);

  const filteredAssets = useMemo(() => ASSET_LIBRARY.filter((asset) => {
    const keyword = searchQuery.trim().toLowerCase();
    const matchSearch = !keyword
      || asset.name.toLowerCase().includes(keyword)
      || asset.desc.toLowerCase().includes(keyword);
    const matchType = topFilter === 'all' || asset.type === topFilter;
    const matchCategory = activeCategoryId === 'all' || asset.categoryId === activeCategoryId;
    return matchSearch && matchType && matchCategory;
  }), [searchQuery, activeCategoryId, topFilter]);

  const columns = [
    {
      title: '物资名称',
      dataIndex: 'name',
      render: (value, record) => (
        <div>
          <div className="font-medium text-slate-800">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{record.desc}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (value) => value === 'consumable' ? '耗材' : '资产',
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      render: (_, record) => <Button type="link" onClick={() => onAdd(mapMaterial(record))}>选择</Button>,
    },
  ];

  return (
    <Modal
      title={(
        <Space>
          <LayoutGrid size={18} className="text-blue-600" />
          <span>资产商城</span>
        </Space>
      )}
      open={open}
      width={960}
      onCancel={onCancel}
      footer={<Button onClick={onCancel}>返回</Button>}
      destroyOnHidden
    >
      <div className="mb-4 flex items-center gap-3">
        <Input.Search
          allowClear
          placeholder="搜索物资名称或型号"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          style={{ width: 140 }}
          value={topFilter}
          options={[
            { label: '全部物资', value: 'all' },
            { label: '资产', value: 'main' },
            { label: '耗材', value: 'consumable' },
          ]}
          onChange={setTopFilter}
        />
      </div>
      <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-4">
        <div className="max-h-[460px] overflow-auto rounded-lg border border-slate-200 p-3">
          <Tree
            treeData={treeData}
            selectedKeys={[activeCategoryId]}
            expandedKeys={expandedNodes}
            onExpand={setExpandedNodes}
            onSelect={(keys, info) => {
              if (!info.node.children && keys[0]) setActiveCategoryId(keys[0]);
            }}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredAssets}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ y: 390 }}
        />
      </div>
    </Modal>
  );
}
