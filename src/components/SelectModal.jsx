import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button, Input, Table } from 'antd';
import QueryBar, { QueryItem } from './QueryBar';

const DEFAULT_SEARCH_VALUES = {};
const DEFAULT_SELECTED_KEYS = [];
const EXIT_DURATION = 140;

/**
 * 通用选择弹窗组件
 *
 * Props:
 *   open        - boolean, 弹窗是否打开
 *   onCancel    - () => void, 关闭回调
 *   onSelect    - (record) => void, 选中回调
 *   onConfirm   - (record|records) => void, 确认回调
 *   title       - string, 弹窗标题
 *   searchFields - Array<{ name, label, dataIndex, placeholder }>, 搜索字段配置
 *   columns     - Ant Design Table columns
 *   dataSource  - Array, 数据源
 *   initialSearchValues - object, 可选初始搜索值
 *   initialSelectedKeys - Array<string|number>, 可选已选行
 *   rowKey      - string, 行标识字段，默认 id
 *   width       - number|string, 期望宽度，默认 700px；公共最大宽度 960px
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
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

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

  useEffect(() => {
    let frameId;
    let exitTimer;

    if (open) {
      setShouldRender(true);
      frameId = window.requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      if (shouldRender) {
        exitTimer = window.setTimeout(() => setShouldRender(false), EXIT_DURATION);
      }
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      if (exitTimer) window.clearTimeout(exitTimer);
    };
  }, [open, shouldRender]);

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

  const handleConfirm = () => {
    if (multiple) {
      const selected = normalizedData.filter((item) => selectedKeys.includes(String(item[rowKey])));
      (onConfirm || onSelect)?.(selected);
      onCancel();
      resetState();
      return;
    }

    if (!selectedKey) return;
    const selected = normalizedData.find((item) => String(item[rowKey]) === String(selectedKey));
    if (!selected) return;
    (onConfirm || onSelect)?.(selected);
    onCancel();
    resetState();
  };

  const handleCancel = () => {
    onCancel();
    resetState();
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

  if (!shouldRender || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/40 z-[1200] flex items-center justify-center p-4 mmp-motion-overlay ${isVisible ? 'is-visible' : ''}`}
      data-prototype-overlay="select-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`bg-white rounded-xl shadow-xl flex flex-col overflow-hidden mmp-motion-dialog ${isVisible ? 'is-visible' : ''}`}
        style={{
          width,
          maxWidth: 'min(var(--mmp-modal-max-width), calc(100vw - 32px))',
          maxHeight: '88vh',
        }}
        data-prototype-bindable="selection-modal"
        data-prototype-label={title}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <span className="text-base font-semibold text-gray-900" data-prototype-display-anchor="title">{title}</span>
          <button
            type="button"
            onClick={handleCancel}
            className="h-6 w-6 inline-flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 min-w-0 overflow-y-auto">
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
              scroll={{ x: 'max-content', y: 360 }}
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
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#f0f0f0] bg-[#fafafa]">
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" disabled={multiple ? selectedKeys.length === 0 : !selectedKey} onClick={handleConfirm}>确定</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
