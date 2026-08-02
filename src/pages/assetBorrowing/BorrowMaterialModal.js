import React, { useMemo, useState } from 'react';
import { Input, Modal, Select, Table } from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { BORROWABLE_MATERIALS } from '../../mock/assetBorrowingMock';

const EMPTY_QUERY = {
  keyword: '',
  category: '',
  subCategory: '',
  brand: '',
  model: '',
};

export default function BorrowMaterialModal({ open, onCancel, onConfirm }) {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [appliedQuery, setAppliedQuery] = useState(EMPTY_QUERY);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const materials = useMemo(() => BORROWABLE_MATERIALS.filter((item) => (
    item.enabled && item.borrowable
  )), []);

  const categoryOptions = useMemo(() => (
    [...new Set(materials.map((item) => item.category))].map((value) => ({ label: value, value }))
  ), [materials]);
  const subCategoryOptions = useMemo(() => (
    [...new Set(materials
      .filter((item) => !query.category || item.category === query.category)
      .map((item) => item.subCategory))].map((value) => ({ label: value, value }))
  ), [materials, query.category]);
  const brandOptions = useMemo(() => (
    [...new Set(materials
      .filter((item) => (!query.category || item.category === query.category)
        && (!query.subCategory || item.subCategory === query.subCategory))
      .map((item) => item.brand))].map((value) => ({ label: value, value }))
  ), [materials, query.category, query.subCategory]);
  const modelOptions = useMemo(() => (
    [...new Set(materials
      .filter((item) => (!query.brand || item.brand === query.brand))
      .map((item) => item.model))].map((value) => ({ label: value, value }))
  ), [materials, query.brand]);

  const filteredData = useMemo(() => materials.filter((item) => {
    const keyword = appliedQuery.keyword.trim().toLowerCase();
    const keywordText = `${item.subCategory} ${item.brand} ${item.model} ${item.config}`.toLowerCase();
    return (!keyword || keywordText.includes(keyword))
      && (!appliedQuery.category || item.category === appliedQuery.category)
      && (!appliedQuery.subCategory || item.subCategory === appliedQuery.subCategory)
      && (!appliedQuery.brand || item.brand === appliedQuery.brand)
      && (!appliedQuery.model || item.model === appliedQuery.model);
  }), [materials, appliedQuery]);

  const columns = [
    { title: '资产大类', dataIndex: 'category', width: 120 },
    { title: '资产小类', dataIndex: 'subCategory', width: 140 },
    { title: '品牌', dataIndex: 'brand', width: 100 },
    { title: '型号', dataIndex: 'model', width: 190 },
    { title: '配置', dataIndex: 'config', width: 240 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 240 },
  ];

  const reset = () => {
    setQuery(EMPTY_QUERY);
    setAppliedQuery(EMPTY_QUERY);
  };

  const close = () => {
    setSelectedKeys([]);
    onCancel();
  };

  return (
    <Modal
      title="选择借用物资"
      open={open}
      width={1050}
      okText={`确定（${selectedKeys.length}）`}
      cancelText="取消"
      okButtonProps={{ disabled: selectedKeys.length === 0 }}
      onCancel={close}
      onOk={() => {
        onConfirm(materials.filter((item) => selectedKeys.includes(item.id)));
        setSelectedKeys([]);
      }}
    >
      <QueryBar onQuery={() => setAppliedQuery(query)} onReset={reset}>
        <QueryItem label="关键字">
          <Input
            value={query.keyword}
            placeholder="小类、品牌、型号或配置"
            onChange={(event) => setQuery((current) => ({ ...current, keyword: event.target.value }))}
            onPressEnter={() => setAppliedQuery(query)}
          />
        </QueryItem>
        <QueryItem label="资产大类">
          <Select
            allowClear
            value={query.category || undefined}
            placeholder="全部"
            options={categoryOptions}
            onChange={(value) => setQuery((current) => ({
              ...current,
              category: value || '',
              subCategory: '',
              brand: '',
              model: '',
            }))}
          />
        </QueryItem>
        <QueryItem label="资产小类">
          <Select
            allowClear
            value={query.subCategory || undefined}
            placeholder="全部"
            options={subCategoryOptions}
            onChange={(value) => setQuery((current) => ({
              ...current,
              subCategory: value || '',
              brand: '',
              model: '',
            }))}
          />
        </QueryItem>
        <QueryItem label="品牌">
          <Select
            allowClear
            value={query.brand || undefined}
            placeholder="全部"
            options={brandOptions}
            onChange={(value) => setQuery((current) => ({ ...current, brand: value || '', model: '' }))}
          />
        </QueryItem>
        <QueryItem label="型号">
          <Select
            allowClear
            value={query.model || undefined}
            placeholder="全部"
            options={modelOptions}
            onChange={(value) => setQuery((current) => ({ ...current, model: value || '' }))}
          />
        </QueryItem>
      </QueryBar>

      <Table
        rowKey="id"
        rowSelection={{
          selectedRowKeys: selectedKeys,
          preserveSelectedRowKeys: true,
          onChange: setSelectedKeys,
        }}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 950 }}
        size="small"
      />
    </Modal>
  );
}
