import React, { useMemo, useState } from 'react';
import { Card, Input, Select, Table, Tabs, Typography } from 'antd';
import { Search } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';

const DEFAULT_FILTERS = {
  employeeInfo: '220784-周琦星',
  assetTag: '',
  documentNo: '',
  documentStatus: '',
};

const ASSET_ROWS = [
  {
    id: 'asset-1',
    tag: '112161100271-V',
    description: '戴尔.E2417H显示器',
    assetStatus: '在用-使用中',
    owner: '220784.周琦星',
    guarantor: '-',
    applicant: '-',
    documentNo: '-',
    documentType: '-',
    businessType: '-',
    documentStatus: '-',
    approvalNode: '-',
    approver: '-',
    company: '新媒体',
    plate: 'Corporate',
  },
  {
    id: 'asset-2',
    tag: '114122102371',
    description: '微软.Surface Laptop 4',
    assetStatus: '在用-使用中',
    owner: '220784.周琦星',
    guarantor: '-',
    applicant: '-',
    documentNo: '-',
    documentType: '-',
    businessType: '-',
    documentStatus: '-',
    approvalNode: '-',
    approver: '-',
    company: '新媒体',
    plate: 'Corporate',
  },
];

const CONSUMABLE_ROWS = [];
const CONTRACT_NUMBER_ROWS = [];

const DOCUMENT_ROWS = [
  {
    id: 'document-1',
    applicationNo: 'NE-202505310007',
    documentType: '新员工领用',
    businessType: '新员工领用',
    documentStatus: '已完成',
    applicant: '220784.周琦星',
    applyDate: '2025-05-31',
    coreDocument: 'OS-202506040022',
    company: '新媒体',
    plate: 'Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
    operation: '-',
  },
];

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function displayText(value) {
  return value === undefined || value === null || value === '' ? '-' : value;
}

function createWorkflowColumns({ tagTitle, descriptionTitle, statusTitle, ownerTitle = '资产责任人', includeGuaranteeSource = false }) {
  const columns = [
    { title: '行号', dataIndex: 'rowNo', width: 70, fixed: 'left' },
    { title: tagTitle, dataIndex: 'tag', width: 160, fixed: 'left', render: displayText },
    { title: descriptionTitle, dataIndex: 'description', width: 220, render: displayText },
    {
      title: statusTitle,
      dataIndex: 'assetStatus',
      width: 130,
      render: (value) => value && value !== '-' ? <StatusTag value={value} type="business" /> : '-',
    },
    { title: ownerTitle, dataIndex: 'owner', width: 170, render: displayText },
    { title: '资产担保人', dataIndex: 'guarantor', width: 150, render: displayText },
  ];

  if (includeGuaranteeSource) {
    columns.push({ title: '担保来源单据', dataIndex: 'guaranteeSource', width: 160, render: displayText });
  }

  return [
    ...columns,
    { title: '单据申请人', dataIndex: 'applicant', width: 150, render: displayText },
    { title: '所在单据编号', dataIndex: 'documentNo', width: 170, render: displayText },
    { title: '单据类型', dataIndex: 'documentType', width: 130, render: displayText },
    { title: '单据业务类型', dataIndex: 'businessType', width: 150, render: displayText },
    { title: '单据状态', dataIndex: 'documentStatus', width: 120, render: displayText },
    { title: '单据审批环节', dataIndex: 'approvalNode', width: 150, render: displayText },
    { title: '单据审批人', dataIndex: 'approver', width: 150, render: displayText },
    { title: '公司', dataIndex: 'company', width: 120, render: displayText },
    { title: '板块', dataIndex: 'plate', width: 120, render: displayText },
  ];
}

const ASSET_COLUMNS = createWorkflowColumns({
  tagTitle: '资产标签号',
  descriptionTitle: '资产说明',
  statusTitle: '资产状态',
});

const CONSUMABLE_COLUMNS = createWorkflowColumns({
  tagTitle: '耗材标签号',
  descriptionTitle: '耗材说明',
  statusTitle: '耗材状态',
  ownerTitle: '耗材责任人',
  includeGuaranteeSource: true,
});

const CONTRACT_COLUMNS = [
  { title: '行号', dataIndex: 'rowNo', width: 70, fixed: 'left' },
  { title: '合约号码标签号', dataIndex: 'tag', width: 170, fixed: 'left', render: displayText },
  { title: '合约号码说明', dataIndex: 'description', width: 200, render: displayText },
  { title: '合约号码状态', dataIndex: 'assetStatus', width: 140, render: displayText },
  { title: '责任人', dataIndex: 'owner', width: 150, render: displayText },
  { title: '责任人公司', dataIndex: 'ownerCompany', width: 140, render: displayText },
  { title: '责任人部门', dataIndex: 'ownerDepartment', width: 180, render: displayText },
  { title: '所在单据编号', dataIndex: 'documentNo', width: 170, render: displayText },
  { title: '单据申请人', dataIndex: 'applicant', width: 150, render: displayText },
  { title: '单据类型', dataIndex: 'documentType', width: 130, render: displayText },
  { title: '单据业务类型', dataIndex: 'businessType', width: 150, render: displayText },
  { title: '单据审批环节', dataIndex: 'approvalNode', width: 150, render: displayText },
  { title: '单据审批人', dataIndex: 'approver', width: 150, render: displayText },
];

const DOCUMENT_COLUMNS = [
  { title: '行号', dataIndex: 'rowNo', width: 70, fixed: 'left' },
  { title: '申请单号', dataIndex: 'applicationNo', width: 180, fixed: 'left', render: displayText },
  { title: '单据类型', dataIndex: 'documentType', width: 130, render: displayText },
  { title: '业务类型', dataIndex: 'businessType', width: 130, render: displayText },
  {
    title: '单据状态',
    dataIndex: 'documentStatus',
    width: 120,
    render: (value) => value && value !== '-' ? <StatusTag value={value} type="business" /> : '-',
  },
  { title: '申请人', dataIndex: 'applicant', width: 150, render: displayText },
  { title: '申请时间', dataIndex: 'applyDate', width: 120, render: displayText },
  { title: '核心单据', dataIndex: 'coreDocument', width: 180, render: displayText },
  { title: '公司', dataIndex: 'company', width: 120, render: displayText },
  { title: '板块', dataIndex: 'plate', width: 120, render: displayText },
  { title: '部门', dataIndex: 'department', width: 360, render: displayText },
  { title: '操作', dataIndex: 'operation', width: 90, render: displayText },
];

function withRowNo(rows) {
  return rows.map((row, index) => ({ ...row, rowNo: index + 1 }));
}

export default function EmployeeAssetInfoQueryPage() {
  const [activeTab, setActiveTab] = useState('asset');
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const filteredAssetRows = useMemo(() => withRowNo(ASSET_ROWS.filter((row) => (
    (includesText(row.owner, appliedFilters.employeeInfo) || includesText(row.applicant, appliedFilters.employeeInfo))
    && includesText(row.tag, appliedFilters.assetTag)
    && includesText(row.documentNo, appliedFilters.documentNo)
    && includesText(row.documentStatus, appliedFilters.documentStatus)
  ))), [appliedFilters]);

  const filteredConsumableRows = useMemo(() => withRowNo(CONSUMABLE_ROWS.filter((row) => (
    (includesText(row.owner, appliedFilters.employeeInfo) || includesText(row.applicant, appliedFilters.employeeInfo))
    && includesText(row.tag, appliedFilters.assetTag)
    && includesText(row.documentNo, appliedFilters.documentNo)
    && includesText(row.documentStatus, appliedFilters.documentStatus)
  ))), [appliedFilters]);

  const filteredContractRows = useMemo(() => withRowNo(CONTRACT_NUMBER_ROWS.filter((row) => (
    (includesText(row.owner, appliedFilters.employeeInfo) || includesText(row.applicant, appliedFilters.employeeInfo))
    && includesText(row.tag, appliedFilters.assetTag)
    && includesText(row.documentNo, appliedFilters.documentNo)
    && includesText(row.documentStatus, appliedFilters.documentStatus)
  ))), [appliedFilters]);

  const filteredDocumentRows = useMemo(() => withRowNo(DOCUMENT_ROWS.filter((row) => (
    includesText(row.applicant, appliedFilters.employeeInfo)
    && (includesText(row.applicationNo, appliedFilters.documentNo) || includesText(row.coreDocument, appliedFilters.documentNo))
    && includesText(row.documentStatus, appliedFilters.documentStatus)
  ))), [appliedFilters]);

  const tabConfig = {
    asset: { label: '资产', title: '资产信息', rows: filteredAssetRows, columns: ASSET_COLUMNS },
    consumable: { label: '耗材', title: '耗材信息', rows: filteredConsumableRows, columns: CONSUMABLE_COLUMNS },
    contract: { label: '合约号码', title: '合约号码信息', rows: filteredContractRows, columns: CONTRACT_COLUMNS },
    document: { label: '单据信息', title: '单据信息', rows: filteredDocumentRows, columns: DOCUMENT_COLUMNS },
  };

  const current = tabConfig[activeTab];

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={4} className="mb-0">员工资产信息查询</Typography.Title>

      <QueryBar
        onQuery={() => setAppliedFilters({ ...draftFilters })}
        onReset={() => {
          setDraftFilters(DEFAULT_FILTERS);
          setAppliedFilters(DEFAULT_FILTERS);
        }}
      >
        <QueryItem label="员工信息">
          <Input
            value={draftFilters.employeeInfo}
            placeholder="请输入员工编号或姓名"
            allowClear
            suffix={<Search size={14} className="text-[#1677ff]" />}
            onChange={(event) => updateFilter('employeeInfo', event.target.value)}
          />
        </QueryItem>
        <QueryItem label="资产标签号">
          <Input
            value={draftFilters.assetTag}
            placeholder="请输入资产标签号"
            allowClear
            onChange={(event) => updateFilter('assetTag', event.target.value)}
          />
        </QueryItem>
        <QueryItem label="单据编号">
          <Input
            value={draftFilters.documentNo}
            placeholder="请输入单据编号"
            allowClear
            onChange={(event) => updateFilter('documentNo', event.target.value)}
          />
        </QueryItem>
        <QueryItem label="单据状态">
          <Select
            value={draftFilters.documentStatus || undefined}
            placeholder="请选择"
            allowClear
            options={[{ label: '已完成', value: '已完成' }]}
            onChange={(value) => updateFilter('documentStatus', value)}
          />
        </QueryItem>
      </QueryBar>

      <Card size="small" bodyStyle={{ paddingTop: 0 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={Object.entries(tabConfig).map(([key, item]) => ({ key, label: item.label }))}
        />

        <div className="mb-3 flex items-center justify-between">
          <Typography.Text strong>{current.title}</Typography.Text>
          <Typography.Text type="secondary">共 {current.rows.length} 条</Typography.Text>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={current.columns}
          dataSource={current.rows}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
}
