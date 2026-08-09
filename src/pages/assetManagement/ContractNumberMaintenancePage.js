import React from 'react';
import {
  getContractNumberMaintenanceRows,
  updateContractNumberMaintenanceRow,
} from '../../services/assetManagementService';
import LedgerMaintenancePage from './LedgerMaintenancePage';

const FILTERS = [
  { field: 'tag', label: '标签号', type: 'input' },
  { field: 'amount', label: '金额', type: 'input' },
  { field: 'status', label: '状态', type: 'select' },
  { field: 'assetDesc', label: '说明', type: 'input' },
  { field: 'sn', label: 'SN号', type: 'input' },
  { field: 'secondaryCard', label: '副卡', type: 'input' },
  { field: 'ownerName', label: '责任人', type: 'lookup' },
  { field: 'company', label: '公司', type: 'lookup' },
  { field: 'department', label: '部门', type: 'lookup' },
  { field: 'claimDateFrom', label: '领用日期从', type: 'dateFrom', sourceField: 'claimDate' },
  { field: 'claimDateTo', label: '领用日期至', type: 'dateTo', sourceField: 'claimDate' },
  { field: 'minorCategory', label: '资产小类', type: 'select', sourceField: 'minorCategory' },
];

const TABLE_COLUMNS = [
  { title: '标签号', field: 'tag', width: 120, fixed: 'left' },
  { title: '副卡', field: 'secondaryCard', width: 140 },
  { title: '资产小类', field: 'minorCategory', width: 120 },
  { title: '品牌', field: 'brand', width: 100 },
  { title: '资产说明', field: 'assetDesc', width: 180 },
  { title: '配置', field: 'config', width: 430 },
  { title: '金额', field: 'amount', width: 100, align: 'right', type: 'amount' },
  { title: '数量', field: 'quantity', width: 80, align: 'right' },
  { title: '状态', field: 'status', width: 130, type: 'status' },
  { title: 'SN号', field: 'sn', width: 160 },
  { title: '仓库', field: 'warehouse', width: 200 },
  { title: '启用日期', field: 'enabledDate', width: 120 },
  { title: '资产责任人', field: 'ownerName', width: 160 },
  { title: '身份证号', field: 'idCard', width: 180 },
  { title: '职级', field: 'jobLevel', width: 100 },
  { title: '子公司', field: 'subsidiary', width: 140 },
  { title: '部门', field: 'department', width: 180 },
  { title: '领用时间', field: 'claimDate', width: 150 },
  { title: '备注', field: 'note', width: 220 },
];

const EXPORT_FIELDS = TABLE_COLUMNS.map((item) => [item.title, item.field]);

const EDIT_FIELDS = [
  { field: 'tag', label: '标签号', disabled: true },
  { field: 'secondaryCard', label: '副卡' },
  { field: 'minorCategory', label: '资产小类', disabled: true },
  { field: 'brand', label: '品牌' },
  { field: 'assetDesc', label: '资产说明', span: 16, required: true },
  { field: 'config', label: '配置', span: 16 },
  { field: 'amount', label: '金额', type: 'number', required: true },
  { field: 'quantity', label: '数量', type: 'number', required: true },
  { field: 'status', label: '状态', type: 'select' },
  { field: 'sn', label: 'SN号' },
  { field: 'warehouse', label: '仓库' },
  { field: 'enabledDate', label: '启用日期', placeholder: 'YYYY-MM-DD' },
  { field: 'ownerName', label: '资产责任人' },
  { field: 'idCard', label: '身份证号' },
  { field: 'jobLevel', label: '职级' },
  { field: 'subsidiary', label: '子公司' },
  { field: 'department', label: '部门' },
  { field: 'claimDate', label: '领用时间', placeholder: 'YYYY-MM-DD' },
  { field: 'note', label: '备注', span: 16 },
];

export default function ContractNumberMaintenancePage() {
  return (
    <LedgerMaintenancePage
      title="合约号码维护"
      listTitle="合约号码列表"
      itemName="合约号码"
      tagField="tag"
      getRows={getContractNumberMaintenanceRows}
      updateRow={updateContractNumberMaintenanceRow}
      filterDefinitions={FILTERS}
      tableColumns={TABLE_COLUMNS}
      exportFields={EXPORT_FIELDS}
      editFields={EDIT_FIELDS}
    />
  );
}
