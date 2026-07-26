import React, { useMemo, useState } from 'react';
import { Check, LayoutGrid, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button, Card, Empty, Input, InputNumber, Modal, Select, Space, Table, Tree, message as antdMessage } from 'antd';
import {
  ASSET_LIBRARY,
  MY_EXISTING_ASSETS,
  REASON_OPTIONS,
  TREE_CATEGORIES,
} from '../mock/assetApplicationMock';
import { addAssetApplication } from '../services/demoStorage';

const DEFAULT_EXPANDED_NODES = ['c-pc', 'c-pc-l2', 'c-pc-l3-nb', 'c-office', 'c-office-l2', 'c-office-l3-acc'];

function buildApplication(cart) {
  const now = new Date();
  const dateText = now.toISOString().slice(0, 10);
  const serial = String(now.getTime()).slice(-6);

  return {
    id: `CA-${dateText.replaceAll('-', '')}${serial}`,
    applyDate: dateText,
    status: 'pending',
    applicant: {
      id: '213852',
      name: '孙志强',
      phone: '010-00000001',
      email: 'demo@sohu-lab.com',
      department: '集团总部-员工服务中心-资产部',
    },
    materials: cart.map((item) => ({
      id: item.id,
      name: item.name,
      desc: item.desc,
      config: item.desc,
      detail: item.customDesc || '-',
      reason: item.reason,
      usage: item.type === 'consumable' ? '耗材补充' : '办公使用',
      relatedAsset: item.relatedAsset || '',
      isOverStandard: false,
      quantity: item.quantity,
    })),
    approvalHistory: [
      { node: '开始', person: '213852-孙志强', agent: '-', status: 'submitted', time: now.toLocaleString('zh-CN', { hour12: false }), comment: '-' },
      { node: '资产管理员-审批', person: '当前用户', agent: '-', status: 'pending', time: '-', comment: '-' },
    ],
  };
}

function toTreeData(nodes) {
  return nodes.map((node) => ({
    key: node.id,
    title: node.name,
    children: node.children ? toTreeData(node.children) : undefined,
  }));
}

const reasonOptions = REASON_OPTIONS.map((reason) => ({ label: reason, value: reason }));
const relatedAssetOptions = MY_EXISTING_ASSETS.map((asset) => ({ label: asset.name, value: asset.id }));

export default function AssetApplicationPrototype() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('cat-nb-win');
  const [expandedNodes, setExpandedNodes] = useState(DEFAULT_EXPANDED_NODES);
  const [topFilter, setTopFilter] = useState('all');
  const [cart, setCart] = useState([]);
  const [batchReason, setBatchReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const selectedCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const treeData = useMemo(() => toTreeData(TREE_CATEGORIES), []);

  const filteredAssets = useMemo(() => {
    return ASSET_LIBRARY.filter((asset) => {
      const keyword = searchQuery.trim().toLowerCase();
      const matchSearch = !keyword || asset.name.toLowerCase().includes(keyword) || asset.desc.toLowerCase().includes(keyword);
      const matchTopFilter = topFilter === 'all' || asset.type === topFilter;
      const matchCategory = topFilter === 'consumable' || activeCategoryId === 'all' || asset.categoryId === activeCategoryId;
      return matchSearch && matchTopFilter && matchCategory;
    });
  }, [searchQuery, activeCategoryId, topFilter]);

  const addToCart = (asset) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === asset.id);
      if (existing) {
        return prev.map((item) => (item.id === asset.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...prev,
        {
          ...asset,
          quantity: 1,
          reason: '',
          customDesc: '',
          relatedAsset: '',
        },
      ];
    });
    messageApi.success(`已将 ${asset.name} 添加到申请明细`);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    messageApi.success('已删除申请明细');
  };

  const updateCartItem = (id, field, value) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const applyBatchReason = () => {
    if (!batchReason) return;
    setCart((prev) => prev.map((item) => ({ ...item, reason: batchReason })));
    messageApi.success('已批量应用申请原因');
  };

  const handleSafeSubmit = () => {
    if (cart.length === 0) {
      messageApi.warning('申请明细不能为空');
      return;
    }

    if (cart.some((item) => !item.reason)) {
      messageApi.warning('请确保所有资产都已填写申请原因');
      return;
    }

    if (cart.some((item) => item.type === 'consumable' && !item.relatedAsset)) {
      messageApi.warning('耗材类物资必须关联主资产');
      return;
    }

    setSubmitLoading(true);
    try {
      addAssetApplication(buildApplication(cart));
      setCart([]);
      setBatchReason('');
      messageApi.success('资产申请提交成功，审批流程已发起');
    } finally {
      setSubmitLoading(false);
    }
  };

  const assetColumns = [
    {
      title: '资产名称',
      dataIndex: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium text-slate-800">{text}</div>
          <div className="mt-1 text-xs text-slate-500">{record.desc}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (type) => (type === 'consumable' ? '耗材' : '主资产'),
    },
    {
      title: '操作',
      width: 90,
      render: (_, record) => (
        <Button size="small" type="link" onClick={() => addToCart(record)}>
          选择
        </Button>
      ),
    },
  ];

  const cartColumns = [
    {
      title: '资产名称',
      dataIndex: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium text-slate-800">{text}</div>
          <div className="mt-1 text-xs text-slate-500">{record.desc}</div>
        </div>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 110,
      render: (value, record) => (
        <InputNumber min={1} value={value} onChange={(nextValue) => updateCartItem(record.id, 'quantity', nextValue || 1)} />
      ),
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      width: 160,
      render: (value, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="请选择"
          value={value || undefined}
          options={reasonOptions}
          onChange={(nextValue) => updateCartItem(record.id, 'reason', nextValue)}
        />
      ),
    },
    {
      title: '关联主资产',
      dataIndex: 'relatedAsset',
      width: 220,
      render: (value, record) => {
        if (record.type !== 'consumable') {
          return <span className="text-slate-400">无需关联</span>;
        }

        const newAssetOptions = cart
          .filter((item) => item.type === 'main')
          .map((item) => ({ label: `[新申请] ${item.name}`, value: `new-${item.id}` }));

        return (
          <Select
            style={{ width: '100%' }}
            placeholder="请选择主资产"
            value={value || undefined}
            options={[...relatedAssetOptions, ...newAssetOptions]}
            onChange={(nextValue) => updateCartItem(record.id, 'relatedAsset', nextValue)}
          />
        );
      },
    },
    {
      title: '详细说明',
      dataIndex: 'customDesc',
      render: (value, record) => (
        <Input placeholder="补充说明" value={value} onChange={(event) => updateCartItem(record.id, 'customDesc', event.target.value)} />
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (_, record) => (
        <Button danger type="text" icon={<Trash2 size={14} />} onClick={() => removeFromCart(record.id)} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Card
        className="h-[calc(100vh-32px)]"
        bodyStyle={{ height: '100%', padding: 0, display: 'flex', flexDirection: 'column' }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
          <Space>
            <ShoppingCart size={18} className="text-blue-600" />
            <span className="font-medium text-slate-800">本次申请明细</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{selectedCount} 件</span>
          </Space>
          <Space>
            {cart.length > 1 && (
              <>
                <Select
                  style={{ width: 160 }}
                  placeholder="批量设置原因"
                  value={batchReason || undefined}
                  options={reasonOptions}
                  onChange={setBatchReason}
                />
                <Button disabled={!batchReason} onClick={applyBatchReason}>
                  应用
                </Button>
              </>
            )}
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
              添加物资
            </Button>
          </Space>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <Table
            rowKey="id"
            columns={cartColumns}
            dataSource={cart}
            pagination={false}
            locale={{ emptyText: <Empty description="请点击右上角「添加物资」选择资产" /> }}
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4">
          <div className="text-sm text-slate-600">
            已选 <span className="font-semibold text-blue-600">{selectedCount}</span> 件物资
          </div>
          <Button type="primary" loading={submitLoading} icon={<Check size={14} />} onClick={handleSafeSubmit}>
            提交审批
          </Button>
        </div>
      </Card>

      <Modal
        title={
          <Space>
            <LayoutGrid size={18} className="text-blue-600" />
            <span>资产商城</span>
          </Space>
        }
        open={isModalOpen}
        width={960}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
        okText="确定"
        cancelText="返回"
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
              { label: '全部资产', value: 'all' },
              { label: '耗材配件', value: 'consumable' },
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
              onExpand={(keys) => setExpandedNodes(keys)}
              onSelect={(keys, info) => {
                if (!info.node.children) {
                  setActiveCategoryId(keys[0]);
                  setTopFilter('all');
                }
              }}
            />
          </div>
          <Table
            rowKey="id"
            columns={assetColumns}
            dataSource={filteredAssets}
            size="small"
            pagination={{ pageSize: 6, showSizeChanger: false }}
            locale={{ emptyText: <Empty description="无匹配物资" /> }}
          />
        </div>
      </Modal>
    </div>
  );
}
