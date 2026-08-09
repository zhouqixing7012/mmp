import React from 'react';
import {
  getConsumableMaintenanceRows,
  updateConsumableMaintenanceRow,
} from '../../services/assetManagementService';
import LedgerMaintenancePage from './LedgerMaintenancePage';

const FILTERS = [
  { field: 'tag', label: '耗材标签号', type: 'input' },
  { field: 'company', label: '公司', type: 'lookup' },
  { field: 'department', label: '部门', type: 'lookup' },
  { field: 'ownerName', label: '当前责任人', type: 'lookup', matchFields: ['ownerName', 'ownerId'] },
  { field: 'mainTag', label: '主资产标签号', type: 'input' },
  { field: 'assetDesc', label: '耗材说明', type: 'input' },
  { field: 'category', label: '耗材类别', type: 'lookup', sourceField: 'majorCategory', matchFields: ['majorCategory', 'minorCategory'] },
  { field: 'status', label: '耗材状态', type: 'lookup' },
  { field: 'plate', label: '板块', type: 'select' },
  { field: 'poNumber', label: 'PO单号', type: 'input' },
  { field: 'purpose', label: '用途', type: 'select' },
  { field: 'warehouse', label: '仓库', type: 'lookup' },
];

const TABLE_COLUMNS = [
  { title: '耗材标签号', field: 'tag', width: 150, fixed: 'left' },
  { title: '公司', field: 'company', width: 130 },
  { title: '板块', field: 'plate', width: 150 },
  { title: '资产大类', field: 'majorCategory', width: 160 },
  { title: '资产小类', field: 'minorCategory', width: 160 },
  { title: '资产说明', field: 'assetDesc', width: 300 },
  { title: '品牌', field: 'brand', width: 140 },
  { title: '主资产标签号', field: 'mainTag', width: 160 },
  { title: '数量', field: 'quantity', width: 80, align: 'right' },
  { title: '原值', field: 'originalValue', width: 110, align: 'right', type: 'amount' },
  { title: '净值', field: 'netValue', width: 110, align: 'right', type: 'amount' },
  { title: '资产责任人编号', field: 'ownerId', width: 150 },
  { title: '资产责任人', field: 'ownerName', width: 180 },
  { title: '资产状态', field: 'status', width: 130, type: 'status' },
  { title: '成本中心', field: 'costCenter', width: 160 },
  { title: '仓库', field: 'warehouse', width: 140 },
  { title: '启用日期', field: 'enabledDate', width: 120 },
];

const EXPORT_FIELDS = TABLE_COLUMNS.map((item) => [item.title, item.field]);

const EDIT_FIELDS = [
  { field: 'tag', label: '耗材标签号', disabled: true },
  { field: 'company', label: '公司', disabled: true },
  { field: 'plate', label: '板块', disabled: true },
  { field: 'majorCategory', label: '资产大类', disabled: true },
  { field: 'minorCategory', label: '资产小类', disabled: true },
  { field: 'brand', label: '品牌' },
  { field: 'assetDesc', label: '资产说明', span: 16, required: true },
  { field: 'mainTag', label: '主资产标签号' },
  { field: 'quantity', label: '数量', type: 'number', required: true },
  { field: 'ownerId', label: '资产责任人编号' },
  { field: 'ownerName', label: '资产责任人' },
  { field: 'status', label: '资产状态', type: 'select' },
  { field: 'costCenter', label: '成本中心' },
  { field: 'warehouse', label: '仓库' },
  { field: 'enabledDate', label: '启用日期', placeholder: 'YYYY-MM-DD' },
];

export default function ConsumableMaintenancePage() {
  return (
    <LedgerMaintenancePage
      title="耗材维护"
      listTitle="耗材列表"
      itemName="耗材"
      tagField="tag"
      getRows={getConsumableMaintenanceRows}
      updateRow={updateConsumableMaintenanceRow}
      filterDefinitions={FILTERS}
      tableColumns={TABLE_COLUMNS}
      exportFields={EXPORT_FIELDS}
      editFields={EDIT_FIELDS}
    />
  );
}
