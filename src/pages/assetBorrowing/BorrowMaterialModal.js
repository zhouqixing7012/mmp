import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, LayoutGrid, Trash2 } from 'lucide-react';
import { Button, Checkbox, Empty, Input, Modal, Space, Tag, Typography } from 'antd';
import { BORROWABLE_MATERIALS } from '../../mock/assetBorrowingMock';

function getBorrowTypes(keyword) {
  const grouped = new Map();
  BORROWABLE_MATERIALS
    .filter((material) => material.enabled && material.borrowable)
    .forEach((material) => {
      const key = `${material.category}::${material.subCategory}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          category: material.category,
          subCategory: material.subCategory,
          assetDesc: material.subCategory,
          config: '',
          enabled: true,
          borrowable: true,
        });
      }
    });

  const normalizedKeyword = keyword.trim().toLowerCase();
  return [...grouped.values()].filter((item) => (
    !normalizedKeyword || `${item.category} ${item.subCategory}`.toLowerCase().includes(normalizedKeyword)
  ));
}

export default function BorrowMaterialModal({ open, onCancel, onConfirm }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const borrowTypes = useMemo(() => getBorrowTypes(searchQuery), [searchQuery]);
  const categories = useMemo(() => [...new Set(borrowTypes.map((item) => item.category))], [borrowTypes]);
  const subCategories = useMemo(
    () => borrowTypes.filter((item) => item.category === selectedCategory),
    [borrowTypes, selectedCategory]
  );

  const toggleSubCategory = (material) => {
    setSelectedMaterials((current) => current.some((item) => item.id === material.id)
      ? current.filter((item) => item.id !== material.id)
      : [...current, material]);
  };

  const resetModal = () => {
    setSearchQuery('');
    setSelectedCategory('');
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
          <span>添加资产</span>
        </Space>
      )}
      open={open}
      width={920}
      onCancel={closeModal}
      footer={(
        <div className="flex w-full items-center justify-between px-2">
          <Typography.Text>已选择 <b className="text-blue-600">{selectedMaterials.length}</b> 项</Typography.Text>
          <Space size={12}>
            <Button type="primary" disabled={selectedMaterials.length === 0} onClick={confirmSelection}>确定添加</Button>
            <Button onClick={closeModal}>返回</Button>
          </Space>
        </div>
      )}
      destroyOnHidden
    >
      <Input.Search
        allowClear
        className="mb-4"
        placeholder="搜索大类或小类"
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          setSelectedCategory('');
        }}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-4">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
            <div className="border-r border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">大类</div>
            <div className="px-3 py-2 text-sm font-medium text-slate-700">小类</div>
          </div>

          <div className="grid min-h-[360px] max-h-[460px] grid-cols-2">
            <div className="overflow-auto border-r border-slate-200 p-2">
              {categories.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无可借用资产" />
              ) : categories.map((category) => {
                const selected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    className={`mb-1 flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition ${selected ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span>{category}</span>
                    {selected ? <Check size={14} /> : <ChevronRight size={14} className="text-slate-400" />}
                  </button>
                );
              })}
            </div>

            <div className="overflow-auto p-2">
              {!selectedCategory ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择大类" />
              ) : subCategories.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无可借用小类" />
              ) : subCategories.map((material) => {
                const checked = selectedMaterials.some((item) => item.id === material.id);
                return (
                  <button
                    key={material.id}
                    type="button"
                    className={`mb-1 flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition ${checked ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => toggleSubCategory(material)}
                  >
                    <span>{material.subCategory}</span>
                    <Checkbox
                      checked={checked}
                      onChange={() => toggleSubCategory(material)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex min-h-[360px] max-h-[460px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Typography.Title level={5} className="mb-0">已选资产</Typography.Title>
            <Button type="link" disabled={selectedMaterials.length === 0} onClick={() => setSelectedMaterials([])}>清空</Button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {selectedMaterials.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂未选择资产" />
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
                <Typography.Text strong>{item.subCategory}</Typography.Text>
                <div className="mt-1 text-xs text-slate-500">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
