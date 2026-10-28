import { executionAssetFields } from './inventoryExecutionAssetFields';
import React from 'react';
import StatusTag from '../../components/StatusTag';
import { formatAssetCategory } from '../../components/AssetQueryControls';
import { inventoryRemark } from './inventoryRemark';
import { inventoryResultSource } from './inventoryResultSource';

function formatMoney(value) {
  const numeric = Number(value || 0);
  return numeric.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function makeAssetColumns({ includeNo = true } = {}) {
  const columns = [
    { title: '盘点范围', dataIndex: 'inventoryRange', width: 100, fixed: 'left' },
    { title: '导入方式', dataIndex: 'resultSource', width: 150, render: (_, row) => inventoryResultSource(row) || '-' },
    { title: '盘点状态', dataIndex: 'inventoryStatus', width: 100, render: (value) => <StatusTag value={value} /> },
    { title: '资产盘点人', dataIndex: 'counter', width: 130 },
    { title: '盘点日期', dataIndex: 'inventoryDate', width: 120 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 150 },
    { title: '序列号', dataIndex: 'serialNo', width: 140 },
    { title: '资产类别', key: 'assetCategory', width: 240, render: (_, row) => formatAssetCategory(row) },
    { title: '资产说明', dataIndex: 'description', width: 180 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'right' },
    { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right', render: formatMoney },
    { title: 'EBS原值', dataIndex: 'ebsOriginalValue', width: 110, align: 'right', render: formatMoney },
    { title: '净值', dataIndex: 'netValue', width: 100, align: 'right', render: formatMoney },
    { title: '使用状态', dataIndex: 'useStatus', width: 140, render: (value) => <StatusTag value={value} /> },
    { title: 'NO位置', dataIndex: 'noLocation', width: 120 },
    { title: '盘点备注', key: 'inventoryRemark', width: 160, render: (_, row) => inventoryRemark(row) },
    { title: '使用说明', dataIndex: 'useDescription', width: 160 },
    { title: '备注', dataIndex: 'remark', width: 130 },
    { title: '资产责任人', dataIndex: 'owner', width: 150 },
    { title: '责任人部门', dataIndex: 'ownerDept', width: 200 },
    { title: '责任人职级', dataIndex: 'ownerLevel', width: 110 },
    { title: 'City', dataIndex: 'city', width: 110 },
    { title: 'Building', dataIndex: 'building', width: 170 },
    { title: 'Floor', dataIndex: 'floor', width: 90 },
    { title: '子公司', dataIndex: 'organization', width: 120 },
    { title: '成本中心', dataIndex: 'costCenter', width: 180 },
    { title: '启用日期', dataIndex: 'enableDate', width: 120 },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 140 },
  ];

  if (includeNo) {
    columns.push(
      { title: 'NO扫描资产标签号', dataIndex: 'noScanAssetTag', width: 160 },
      { title: 'NO扫描序列号', dataIndex: 'noScanSerialNo', width: 150 },
      { title: 'NO扫描品牌', dataIndex: 'noScanBrand', width: 120 },
      { title: 'NO扫描型号', dataIndex: 'noScanModel', width: 140 },
      { title: 'NO扫描位置', dataIndex: 'noScanLocation', width: 190 },
      { title: 'NO扫描数据差异', dataIndex: 'noScanDiff', width: 240 },
    );
  }

  return executionAssetFields(includeNo).map(([title, key]) => ({ ...columns.find(column => (column.dataIndex || column.key) === key), title }));
}

