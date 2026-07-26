import React from 'react';
import { Button } from 'antd';
import StatusTag from '../../../../components/StatusTag';

export const initialMaterialComprehensiveForm = {
  mainCatCode: '', mainCatDesc: '', subCatCode: '', subCatDesc: '', brand: '', modelCode: '', modelDesc: '',
  configDesc: '', unit: '', hasLevel: '', level: '', hasMainAsset: '', misAudit: '', returnCheck: '',
  enabled: '1', enableDate: '', stopDate: '', formalCanApply: '是', internCanApply: '否', canApply: '', refPrice: '', isStop: '', needCheck: '是',
  allowReplace: '0', allowTransfer: '1', allowBorrow: '0', needEsApproval: '0', allowReturn: '0',
  nonTechOverlimit: '0', misIdentifyOnReturn: '0', misIdentify: '0', mainAssetSubCat: '',
  tempEffStartDate: '', tempEffEndDate: '', tempDept: '', tempEmployee: '',
};

export const materialComprehensiveResetFields = {
  mainCatCode: '', mainCatDesc: '', subCatCode: '', subCatDesc: '', brand: '', modelCode: '', modelDesc: '',
  configDesc: '', unit: '', hasLevel: '', level: '', hasMainAsset: '', misAudit: '', returnCheck: '',
  enabled: '1', enableDate: '', stopDate: '', formalCanApply: '是', internCanApply: '否', canApply: '', refPrice: '', isStop: '', needCheck: '是',
  allowReplace: '0', allowTransfer: '1', allowBorrow: '0', needEsApproval: '0', allowReturn: '0',
  nonTechOverlimit: '0', misIdentifyOnReturn: '0', misIdentify: '0', mainAssetSubCat: '',
};

export const createMaterialComprehensiveColumns = (handleEdit) => [
  { title: '序号', dataIndex: 'id', width: 60 },
  { title: '维度组合编码', dataIndex: 'code', width: 140 },
  { title: '维度组合描述', dataIndex: 'desc', width: 180 },
  { title: '物料总类', dataIndex: 'mainCatCode', width: 100, render: (val) => val === '1' ? '资产' : val === '2' ? '耗材' : val === '3' ? '低值耐用品' : '-' },
  { title: '物料大类', dataIndex: 'catDesc', width: 120 },
  { title: '物料小类', dataIndex: 'subCatDesc', width: 120 },
  { title: '品牌', dataIndex: 'brand', width: 120 },
  { title: '规格型号', dataIndex: 'model', width: 120 },
  { title: '配置描述', dataIndex: 'configDesc', width: 130, render: (val) => val || '-' },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '参考价格', dataIndex: 'refPrice', width: 100, render: (val) => val || '0.00' },
  { title: '是否启用', dataIndex: 'enabled', width: 90, render: (val) => <StatusTag value={val} type="enabled" /> },
  { title: '是否停产', dataIndex: 'isStop', width: 90, render: (val) => <StatusTag value={val} type="stop" /> },
  { title: '正式员工可申请', dataIndex: 'formalCanApply', width: 120, render: (val) => val || '-' },
  { title: '实习生可申请', dataIndex: 'internCanApply', width: 110, render: (val) => val || '-' },
  { title: '是否允许退库', dataIndex: 'allowReturn', width: 110, render: (val) => <StatusTag value={val} /> },
  { title: '是否需要盘点', dataIndex: 'needCheck', width: 100, render: (val) => <StatusTag value={val} /> },
  { title: '退库是否需要MIS鉴定', dataIndex: 'misIdentifyOnReturn', width: 140, render: (val) => <StatusTag value={val} /> },
  { title: '耗材申请是否需要MIS审核', dataIndex: 'misAudit', width: 160, render: (val) => <StatusTag value={val} /> },
  { title: '是否关联主资产', dataIndex: 'hasMainAsset', width: 120, render: (val) => <StatusTag value={val} /> },
  { title: '是否允许更换', dataIndex: 'allowReplace', width: 110, render: (val) => <StatusTag value={val} /> },
  { title: '是否允许转移', dataIndex: 'allowTransfer', width: 110, render: (val) => <StatusTag value={val} /> },
  { title: '操作', dataIndex: 'action', width: 80, fixed: 'right', render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>编辑</Button> },
];
