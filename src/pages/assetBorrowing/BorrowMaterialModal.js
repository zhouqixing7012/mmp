import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, LayoutGrid, Trash2 } from 'lucide-react';
import { Button, Checkbox, Empty, Input, Modal, Space, Tabs, Tag, Typography } from 'antd';
import { BORROWABLE_MATERIALS } from '../../mock/assetBorrowingMock';

const LEVEL_NAMES = ['大类', '小类', '品牌', '型号', '配置'];

function getCatalogRecords(type, keyword) {
  if (type !== 'asset') return [];

  return BORROWABLE_MATERIALS
    .filter((material) => material.enabled && material.borrowable)
    .map((material) => ({
      material,
      path: [material.category, material.subCategory, material.brand, material.model, material.config],
    }))
    .filter((item) => {
      const text = `${item.material.assetDesc} ${item.path.join(' ')}`.toLowerCase();
      return !keyword || text.includes(keyword);
    });
}

function uniqueValues(records, level, selectedPath) {
  return [...new Set(records
    .filter((item) => selectedPath.every((value, index) => item.path[index] === value))
    .map((item) => item.path[level]))];
}

export default function BorrowMaterialModal({ open, onCancel, onConfirm }) {
  const [activeType, setActiveType] = useState('asset');
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

    setSelectedMaterials((current) => current.some((item) => item.id === matched.material.id)
      ? current.filter((item) => item.id !== matched.material.id)
      : [...current, matched.material]);
  };

  const resetModal = () => {
    setActiveType('asset');
    setSearchQuery('');
    setSelectedPath([]);
    setSelectedMaterials([]);
  };

  const closeModal = () => {
    resetModal();
    onCancel();
  };

  const confirmSelection = () => {
    if (selectedMaterials.length === 0) return;
    onConfirm(selectedMaterials);
    resetModal();
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
          { key: 'asset', label: '资产' },
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
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={activeType === 'consumable' ? '暂无可借用耗材' : (level === 0 ? '暂无数据' : '请选择上一级')}
                  />
                ) : levelOptions[level].map((option) => {
                  const selected = selectedPath[level] === option;
                  const isConfig = level === 4;
                  const matched = isConfig
                    ? records.find((item) => item.path.every((value, index) => value === [...selectedPath.slice(0, 4), option][index]))
                    : null;
                  const checked = matched && selectedMaterials.some((item) => item.id === matched.material.id);

                  return (
                    <button
                      key={option}
                      type="button"
                      className={`mb-1 flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition ${selected || checked ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
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
                      <span className="min-w-0 flex-1 truncate">{option}</span>
                      {isConfig ? (
                        <Checkbox
                          checked={Boolean(checked)}
                          onChange={() => toggleConfiguration(option)}
                          onClick={(event) => event.stopPropagation()}
                        />
                      ) : selected ? <Check size={14} /> : <ChevronRight size={14} className="text-slate-400" />}
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
                  <Tag color="blue">资产</Tag>
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
