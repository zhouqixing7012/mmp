import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Space, Table, Typography } from 'antd';
import QueryBar, { QueryItem } from './QueryBar';

const DEFAULT_SEARCH_VALUES = {};
const DEFAULT_SELECTED_KEYS = [];

/**
 * 通用选择弹窗组件
 *
 * 统一规则：
 * - 查询区由 QueryBar 按实际可用宽度自动切换 1 / 2 / 3 列；
 * - Table 按列定义的合理 width 自然决定是否产生横向滚动，不按列数判断；
 * - 默认宽度 700px，数据密集场景可传 960px，但不得超过公共上限；
 * - Footer 右侧固定为“取消 → 确定”，多选时左侧展示已选数量。
 */
export default function SelectModal({
  open,
  onCancel,
  onSelect,
  onConfirm,
  title,
  searchFields = [],
  columns = [],
  dataSource = [],
  initialSearchValues = DEFAULT_SEARCH_VALUES,
  initialSelectedKeys = DEFAULT_SELECTED_KEYS,
  rowKey = 'id',
  multiple = false,
  width = 700,
  // 默认仅按列宽决定横向滚动；需要限制弹窗内表格高度时由业务显式传入 y。
  scroll,
}) {
  const buildInitialSearchValues = () => {
    const init = {};
    searchFields.forEach((field) => {
      init[field.name] = initialSearchValues[field.name] || '';
    });
    return init;
  };

  const [searchDraft, setSearchDraft] = useState(buildInitialSearchValues);
  const [appliedSearch, setAppliedSearch] = useState(buildInitialSearchValues);
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const normalizedData = useMemo(() => {
    const seenKeys = new Set();
    return dataSource.filter((item) => {
      const rawKey = item?.[rowKey];
      if (rawKey === undefined || rawKey === null || rawKey === '') return true;
      const normalizedKey = String(rawKey);
      if (seenKeys.has(normalizedKey)) return false;
      seenKeys.add(normalizedKey);
      return true;
    });
  }, [dataSource, rowKey]);

  const filteredData = useMemo(() => normalizedData.filter((item) => (
    searchFields.every((field) => {
      const searchValue = appliedSearch[field.name];
      if (!searchValue) return true;
      const targetValue = item[field.dataIndex];
      return String(targetValue || '').toLowerCase().includes(String(searchValue).trim().toLowerCase());
    })
  )), [normalizedData, searchFields, appliedSearch]);

  useEffect(() => {
    if (!open) return;
    const init = buildInitialSearchValues();
    const normalizedSelectedKeys = initialSelectedKeys.map((value) => String(value));
    setSearchDraft(init);
    setAppliedSearch(init);
    setSelectedKey(multiple ? null : (normalizedSelectedKeys[0] || null));
    setSelectedKeys(multiple ? normalizedSelectedKeys : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetState = () => {
    const init = buildInitialSearchValues();
    const normalizedSelectedKeys = initialSelectedKeys.map((value) => String(value));
    setSearchDraft(init);
    setAppliedSearch(init);
    setSelectedKey(multiple ? null : (normalizedSelectedKeys[0] || null));
    setSelectedKeys(multiple ? normalizedSelectedKeys : []);
  };

  const handleQuery = () => {
    setAppliedSearch({ ...searchDraft });
  };

  const handleReset = () => {
    const init = buildInitialSearchValues();
    setSearchDraft(init);
    setAppliedSearch(init);
  };

  const handleCancel = () => {
    onCancel();
    resetState();
  };

  const handleConfirm = () => {
    if (multiple) {
      const selected = normalizedData.filter((item) => selectedKeys.includes(String(item[rowKey])));
      (onConfirm || onSelect)?.(selected);
      handleCancel();
      return;
    }

    if (!selectedKey) return;
    const selected = normalizedData.find((item) => String(item[rowKey]) === String(selectedKey));
    if (!selected) return;
    (onConfirm || onSelect)?.(selected);
    handleCancel();
  };

  const tableRowKey = (record) => String(record?.[rowKey] ?? '');
  const rowSelection = multiple
    ? {
        type: 'checkbox',
        selectedRowKeys: selectedKeys,
        onChange: (keys) => setSelectedKeys(keys.map(String)),
        preserveSelectedRowKeys: true,
      }
    : {
        type: 'radio',
        selectedRowKeys: selectedKey ? [selectedKey] : [],
        onChange: (keys) => setSelectedKey(keys[0] ? String(keys[0]) : null),
      };

  const selectedCount = multiple ? selectedKeys.length : (selectedKey ? 1 : 0);

  return (
    <Modal
      open={open}
      title={title}
      width={width}
      onCancel={handleCancel}
      destroyOnHidden
      rootClassName="mmp-select-modal"
      modalRender={(node) => (
        <div
          data-prototype-overlay="select-modal"
          data-prototype-bindable="selection-modal"
          data-prototype-label={title}
        >
          {node}
        </div>
      )}
      footer={(
        <div className="flex w-full items-center justify-between">
          <Typography.Text type="secondary">
            {multiple ? <>已选择 <b>{selectedCount}</b> 项</> : null}
          </Typography.Text>
          <Space size={8}>
            <Button onClick={handleCancel}>取消</Button>
            <Button
              type="primary"
              disabled={selectedCount === 0}
              onClick={handleConfirm}
            >
              确定
            </Button>
          </Space>
        </div>
      )}
    >
      {searchFields.length > 0 && (
        <QueryBar onQuery={handleQuery} onReset={handleReset}>
          {searchFields.map((field) => (
            <QueryItem key={field.name} label={field.label}>
              <Input
                value={searchDraft[field.name] || ''}
                allowClear
                placeholder={field.placeholder || `请输入${field.label}`}
                onChange={(event) => setSearchDraft((previous) => ({ ...previous, [field.name]: event.target.value }))}
                onPressEnter={handleQuery}
              />
            </QueryItem>
          ))}
        </QueryBar>
      )}

      <div data-prototype-bindable="selection-table" data-prototype-label={`${title}列表`}>
        <Table
          rowKey={tableRowKey}
          size="small"
          bordered
          columns={columns}
          dataSource={filteredData}
          rowSelection={rowSelection}
          scroll={{ x: 'max-content', ...(scroll || {}) }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onRow={(record) => ({
            onClick: () => {
              const key = tableRowKey(record);
              if (multiple) {
                setSelectedKeys((previous) => (
                  previous.includes(key)
                    ? previous.filter((item) => item !== key)
                    : [...previous, key]
                ));
                return;
              }
              setSelectedKey(key);
            },
          })}
        />
      </div>
    </Modal>
  );
}
