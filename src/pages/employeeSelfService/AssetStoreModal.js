import React, { useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Button, Input, Modal, Space, Tabs, Tree, Typography } from 'antd';
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
          node = { key, title: label, children: [] };
          nodes.push(node);
        }
        if (index === path.length - 1) {
          node.isLeaf = true;
          node.material = mapMaterial(asset, path);
          delete node.children;
        } else {
          nodes = node.children;
        }
      });
    });
  return root;
}

export default function AssetStoreModal({ open, onCancel, onAdd }) {
  const [activeType, setActiveType] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const keyword = searchQuery.trim().toLowerCase();
  const treeData = useMemo(() => buildTree(activeType, keyword), [activeType, keyword]);

  const confirmSelection = () => {
    if (!selectedMaterial) return;
    onAdd(selectedMaterial);
    setSelectedMaterial(null);
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
      width={840}
      onCancel={onCancel}
      footer={(
        <Space>
          <Button type="primary" disabled={!selectedMaterial} onClick={confirmSelection}>确定</Button>
          <Button onClick={onCancel}>返回</Button>
        </Space>
      )}
      destroyOnHidden
    >
      <Tabs
        activeKey={activeType}
        onChange={(next) => { setActiveType(next); setSelectedMaterial(null); }}
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
        onChange={(event) => { setSearchQuery(event.target.value); setSelectedMaterial(null); }}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-4">
        <div className="min-h-[420px] max-h-[480px] overflow-auto rounded-lg border border-slate-200 p-4">
          <Tree
            showLine
            defaultExpandAll
            treeData={treeData}
            selectedKeys={selectedMaterial ? [`${activeType}-${CATALOG_PATHS[selectedMaterial.id].join('-')}`] : []}
            onSelect={(_, info) => setSelectedMaterial(info.node.isLeaf ? info.node.material : null)}
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Typography.Title level={5}>已选物资</Typography.Title>
          {selectedMaterial ? (
            <Space direction="vertical" size={8}>
              <Typography.Text><b>类型：</b>{selectedMaterial.materialType}</Typography.Text>
              <Typography.Text><b>资产说明：</b>{selectedMaterial.assetDesc}</Typography.Text>
              <Typography.Text><b>配置：</b>{selectedMaterial.config}</Typography.Text>
              <Typography.Text type="secondary">仅可选择第五级“配置”节点。</Typography.Text>
            </Space>
          ) : (
            <Typography.Text type="secondary">请依次展开大类、小类、品牌、型号，并选择配置。</Typography.Text>
          )}
        </div>
      </div>
    </Modal>
  );
}
