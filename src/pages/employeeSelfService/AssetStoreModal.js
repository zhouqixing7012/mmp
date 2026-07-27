import React, { useMemo, useState } from 'react';
import { LayoutGrid, Trash2 } from 'lucide-react';
import { Button, Empty, Input, Modal, Space, Tabs, Tag, Tree, Typography } from 'antd';
import { ASSET_LIBRARY } from '../../mock/assetApplicationMock';

const CATALOG_PATHS = {
  A001: ['电脑整机', '便携式电脑', '联想', 'ThinkPad T14', 'i7 / 16G / 512G'],
  A002: ['电脑整机', '便携式电脑', '苹果', 'MacBook Pro 14', 'M3 Pro / 18G / 512G'],
  A004: ['显示设备', '显示器', '戴尔', 'U2723QE', '27英寸 / 4K / Type-C'],
  A005: ['电脑整机', '台式电脑', '联想', '启天 M430', '商用台式主机 i5'],
  A006: ['存储耗材', '移动存储', '西部数据', 'Elements 4TB', '2.5英寸 / USB 3.0'],
  A007: ['电脑配件', '电源适配器', '苹果', '35W 双USB-C', '35W / 双USB-C接口'],
  A008: ['办公耗材', '鼠标', '罗技', 'MX Master 3S', '静音 / 无线 / 蓝牙'],
};

function getLeafKey(type, path) {
  return `${type}-${path.join('-')}`;
}

function mapMaterial(asset, path) {
  return {
    id: asset.id,
    materialType: asset.type === 'consumable' ? '耗材' : '资产',
    type: asset.type,
    categoryId: asset.categoryId,
    category: path.join('-'),
    assetDesc: `${path[1]}.${path[2]}.${path[3]}`,
    config: path[4],
    referencePrice: 0,
    overStandard: asset.id === 'A002',
    departmentOverStandard: asset.id === 'A002',
    requiresVp: asset.id === 'A002',
  };
}

function buildTree(type, keyword) {
  const root = [];
  ASSET_LIBRARY
    .filter((asset) => asset.type === type)
    .filter((asset) => {
      const text = `${asset.name} ${asset.desc} ${(CATALOG_PATHS[asset.id] || []).join(' ')}`.toLowerCase();
      return !keyword || text.includes(keyword);
    })
    .forEach((asset) => {
      const path = CATALOG_PATHS[asset.id];
      if (!path) return;
      let nodes = root;
      path.forEach((label, index) => {
        const key = `${type}-${path.slice(0, index + 1).join('-')}`;
        let node = nodes.find((item) => item.key === key);
        if (!node) {
          node = {
            key,
            title: label,
            children: [],
            checkable: index === path.length - 1,
            selectable: false,
          };
          nodes.push(node);
        }
        if (index === path.length - 1) {
          node.isLeaf = true;
          node.material = mapMaterial(asset, path);
          node.disableCheckbox = false;
          delete node.children;
        } else {
          node.disableCheckbox = true;
          nodes = node.children;
        }
      });
    });
  return root;
}

export default function AssetStoreModal({ open, onCancel, onAdd }) {
  const [activeType, setActiveType] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const keyword = searchQuery.trim().toLowerCase();
  const treeData = useMemo(() => buildTree(activeType, keyword), [activeType, keyword]);

  const selectedKeys = useMemo(() => selectedMaterials.map((item) => (
    getLeafKey(item.type, CATALOG_PATHS[item.id])
  )), [selectedMaterials]);

  const handleCheck = (_, info) => {
    const material = info.node.material;
    if (!material) return;
    setSelectedMaterials((current) => {
      const exists = current.some((item) => item.id === material.id);
      if (info.checked && !exists) return [...current, material];
      if (!info.checked && exists) return current.filter((item) => item.id !== material.id);
      return current;
    });
  };

  const confirmSelection = () => {
    if (selectedMaterials.length === 0) return;
    onAdd(selectedMaterials);
    setSelectedMaterials([]);
    setSearchQuery('');
  };

  const closeModal = () => {
    setSelectedMaterials([]);
    setSearchQuery('');
    onCancel();
  };

  return (
    <Modal
      title={(
        <Space>
          <LayoutGrid size={18} className="text-blue-600" />
          <span>添加物资</span>
        </Space>
      )}
      open={open}
      width={980}
      onCancel={closeModal}
      footer={(
        <div className="flex items-center justify-between">
          <Typography.Text>已选择 <b className="text-blue-600">{selectedMaterials.length}</b> 项</Typography.Text>
          <Space>
            <Button type="primary" disabled={selectedMaterials.length === 0} onClick={confirmSelection}>
              确定添加
            </Button>
            <Button onClick={closeModal}>返回</Button>
          </Space>
        </div>
      )}
      destroyOnHidden
    >
      <Tabs
        activeKey={activeType}
        onChange={setActiveType}
        items={[
          { key: 'main', label: '资产' },
          { key: 'consumable', label: '耗材' },
        ]}
      />
      <Input.Search
        allowClear
        className="mb-4"
        placeholder="搜索大类、小类、品牌、型号或配置"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-4">
        <div className="min-h-[440px] max-h-[500px] overflow-auto rounded-lg border border-slate-200 p-4">
          <Tree
            checkable
            checkStrictly
            showLine
            defaultExpandAll
            treeData={treeData}
            checkedKeys={selectedKeys}
            onCheck={handleCheck}
          />
        </div>
        <div className="flex min-h-[440px] max-h-[500px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Typography.Title level={5} className="mb-0">已选物资</Typography.Title>
            <Button type="link" disabled={selectedMaterials.length === 0} onClick={() => setSelectedMaterials([])}>清空</Button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {selectedMaterials.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请勾选五级配置节点" />
            ) : selectedMaterials.map((item) => (
              <div key={item.id} className="mb-3 rounded-lg border border-slate-200 bg-white p-3 last:mb-0">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Space size={6} wrap>
                    <Tag color={item.type === 'consumable' ? 'orange' : 'blue'}>{item.materialType}</Tag>
                    {item.overStandard && <Tag color="error">已超标</Tag>}
                  </Space>
                  <Button
                    danger
                    type="text"
                    size="small"
                    icon={<Trash2 size={14} />}
                    onClick={() => setSelectedMaterials((current) => current.filter((record) => record.id !== item.id))}
                  />
                </div>
                <Typography.Text strong>{item.assetDesc}</Typography.Text>
                <div className="mt-1 text-xs text-slate-500">{item.config}</div>
              </div>
            ))}
          </div>
          <Typography.Text type="secondary" className="mt-3 text-xs">
            仅第五级“配置”节点可勾选；切换资产/耗材或执行搜索不会清空已选项。
          </Typography.Text>
        </div>
      </div>
    </Modal>
  );
}
