import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, LayoutGrid, Trash2 } from 'lucide-react';
import { Button, Checkbox, Empty, Input, Modal, Space, Tabs, Tag, Tooltip, Typography } from 'antd';
import { ASSET_LIBRARY } from '../../mock/assetApplicationMock';

const LEVEL_NAMES = ['大类', '小类', '品牌', '型号', '配置'];
const CATALOG_PATHS = {
  A001: ['电脑整机', '便携式电脑', '联想', 'ThinkPad T14', 'i7-1360P / 16G / 512G SSD'],
  A009: ['电脑整机', '便携式电脑', '联想', 'ThinkPad T14', 'Ultra 7 / 32G / 1T SSD'],
  A010: ['电脑整机', '便携式电脑', '联想', 'ThinkPad X1 Carbon', 'Ultra 7 / 16G / 512G SSD'],
  A011: ['电脑整机', '便携式电脑', '联想', 'ThinkPad X1 Carbon', 'Ultra 7 / 32G / 1T SSD'],
  A002: ['电脑整机', '便携式电脑', '苹果', 'MacBook Pro 14', 'M3 Pro / 18G / 512G SSD'],
  A012: ['电脑整机', '便携式电脑', '苹果', 'MacBook Pro 14', 'M3 Pro / 36G / 1T SSD'],
  A013: ['电脑整机', '便携式电脑', '苹果', 'MacBook Air 13', 'M3 / 16G / 512G SSD'],
  A014: ['电脑整机', '便携式电脑', '苹果', 'MacBook Air 13', 'M3 / 24G / 512G SSD'],
  A004: ['显示设备', '显示器', '戴尔', 'U2723QE', '27英寸 / 4K / Type-C 90W / 银色'],
  A015: ['显示设备', '显示器', '戴尔', 'U2723QE', '27英寸 / 4K / Type-C 90W / 黑色'],
  A016: ['显示设备', '显示器', '戴尔', 'P2425H', '23.8英寸 / FHD / IPS / HDMI+DP'],
  A017: ['显示设备', '显示器', '戴尔', 'P2425H', '23.8英寸 / FHD / IPS / USB Hub'],
  A005: ['电脑整机', '台式电脑', '联想', '启天 M430', 'i5 / 16G / 512G SSD'],
  A006: ['存储耗材', '移动存储', '西部数据', 'Elements Portable', '2TB / 2.5英寸 / USB 3.0'],
  A018: ['存储耗材', '移动存储', '西部数据', 'Elements Portable', '4TB / 2.5英寸 / USB 3.0'],
  A007: ['电脑配件', '电源适配器', '苹果', '双USB-C 电源适配器', '35W / 双USB-C接口'],
  A019: ['电脑配件', '电源适配器', '苹果', 'USB-C 电源适配器', '70W / USB-C接口'],
  A008: ['办公耗材', '鼠标', '罗技', 'MX Master 3S', '静音 / 无线 / 蓝牙 / 黑色'],
  A020: ['办公耗材', '鼠标', '罗技', 'MX Master 3S', '静音 / 无线 / 蓝牙 / 白色'],
  A021: ['电脑配件', '转接线', '绿联', 'Type-C 多功能转接器', '转接线.绿联、CELINK、苹果.Type-C转（VGA/以太网/USB/Type-C）'],
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
    overStandard: asset.id === 'A002' || asset.id === 'A012',
    departmentOverStandard: asset.id === 'A002' || asset.id === 'A012',
    requiresVp: asset.id === 'A002' || asset.id === 'A012',
  };
}

function getCatalogRecords(type, keyword) {
  return ASSET_LIBRARY
    .filter((asset) => asset.type === type)
    .map((asset) => ({ asset, path: CATALOG_PATHS[asset.id] }))
    .filter((item) => item.path)
    .filter((item) => {
      const text = `${item.asset.name} ${item.asset.desc} ${item.path.join(' ')}`.toLowerCase();
      return !keyword || text.includes(keyword);
    });
}

function uniqueValues(records, level, selectedPath) {
  return [...new Set(records
    .filter((item) => selectedPath.every((value, index) => item.path[index] === value))
    .map((item) => item.path[level]))];
}

export default function AssetStoreModal({ open, onCancel, onAdd }) {
  const [activeType, setActiveType] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const keyword = searchQuery.trim().toLowerCase();
  const records = useMemo(() => getCatalogRecords(activeType, keyword), [activeType, keyword]);

  const levelOptions = useMemo(() => LEVEL_NAMES.map((_, level) => (
    level === 0 || selectedPath.length >= level
      ? uniqueValues(records, level, selectedPath.slice(0, level))
      : []
  )), [records, selectedPath]);

  const selectLevel = (level, value) => {
    setSelectedPath((current) => [...current.slice(0, level), value]);
  };

  const toggleConfiguration = (config) => {
    const path = [...selectedPath.slice(0, 4), config];
    const matched = records.find((item) => item.path.every((value, index) => value === path[index]));
    if (!matched) return;
    const material = mapMaterial(matched.asset, matched.path);
    setSelectedMaterials((current) => current.some((item) => item.id === material.id)
      ? current.filter((item) => item.id !== material.id)
      : [...current, material]);
  };

  const confirmSelection = () => {
    if (selectedMaterials.length === 0) return;
    onAdd(selectedMaterials);
    setSelectedMaterials([]);
    setSelectedPath([]);
    setSearchQuery('');
  };

  const closeModal = () => {
    setSelectedMaterials([]);
    setSelectedPath([]);
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
      width={1180}
      onCancel={closeModal}
      footer={(
        <div className="flex w-full items-center justify-between px-2">
          <div className="min-w-[140px] text-left">
            <Typography.Text>已选择 <b className="text-blue-600">{selectedMaterials.length}</b> 项</Typography.Text>
          </div>
          <Space size={12}>
            <Button type="primary" disabled={selectedMaterials.length === 0} onClick={confirmSelection}>确定添加</Button>
            <Button onClick={closeModal}>返回</Button>
          </Space>
        </div>
      )}
      destroyOnHidden
    >
      <Tabs
        activeKey={activeType}
        onChange={(next) => {
          setActiveType(next);
          setSelectedPath([]);
        }}
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
        onChange={(event) => {
          setSearchQuery(event.target.value);
          setSelectedPath([]);
        }}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50">
            {LEVEL_NAMES.map((name) => (
              <div key={name} className="border-r border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 last:border-r-0">{name}</div>
            ))}
          </div>
          <div className="grid min-h-[430px] max-h-[500px] grid-cols-5">
            {LEVEL_NAMES.map((_, level) => (
              <div key={LEVEL_NAMES[level]} className="overflow-auto border-r border-slate-200 p-2 last:border-r-0">
                {levelOptions[level].length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={level === 0 ? '暂无数据' : '请选择上一级'} />
                ) : levelOptions[level].map((option) => {
                  const selected = selectedPath[level] === option;
                  const isConfig = level === 4;
                  const matched = isConfig
                    ? records.find((item) => item.path.every((value, index) => value === [...selectedPath.slice(0, 4), option][index]))
                    : null;
                  const checked = matched && selectedMaterials.some((item) => item.id === matched.asset.id);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`mb-1 flex w-full items-start justify-between gap-2 rounded px-3 py-2 text-left text-sm transition ${selected || checked ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
                      onMouseEnter={() => {
                        if (!isConfig) selectLevel(level, option);
                      }}
                      onFocus={() => {
                        if (!isConfig) selectLevel(level, option);
                      }}
                      onClick={() => {
                        if (isConfig) toggleConfiguration(option);
                        else selectLevel(level, option);
                      }}
                    >
                      <Tooltip title={option} placement="topLeft" mouseEnterDelay={0.4}>
                        <span className="min-w-0 flex-1 whitespace-normal break-words leading-5">{option}</span>
                      </Tooltip>
                      <span className="mt-0.5 shrink-0">
                        {isConfig ? (
                          <Checkbox checked={Boolean(checked)} onChange={() => toggleConfiguration(option)} onClick={(event) => event.stopPropagation()} />
                        ) : selected ? <Check size={14} /> : <ChevronRight size={14} className="text-slate-400" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-[430px] max-h-[500px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Typography.Title level={5} className="mb-0">已选物资</Typography.Title>
            <Button type="link" disabled={selectedMaterials.length === 0} onClick={() => setSelectedMaterials([])}>清空</Button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {selectedMaterials.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂未选择物资" />
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
        </div>
      </div>
    </Modal>
  );
}
