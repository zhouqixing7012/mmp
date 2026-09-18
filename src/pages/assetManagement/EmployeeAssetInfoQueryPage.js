import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import { Search } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const EMPLOYEE_OPTIONS = [
  { id: '220784', name: '周琦星', department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组' },
  { id: '218356', name: '徐鑫', department: '产品技术部.研发一组' },
  { id: '203938', name: '张磊', department: '视频技术部.平台组' },
  { id: '200620', name: '王英', department: '集团.资产管理部.员工服务中心' },
];

const DEFAULT_EMPLOYEE = EMPLOYEE_OPTIONS[0];

const EMPTY_TAB_FILTERS = {
  asset: { assetTag: '' },
  consumable: { assetTag: '' },
  contract: { contractNumber: '' },
  document: { documentNo: '', documentStatus: '' },
};

const ASSET_ROWS = [
  {
    id: 'asset-1',
    tag: '112161100271-V',
    description: '戴尔.E2417H显示器',
    assetStatus: '在用-使用中',
    statusCode: '3',
    materialType: '资产',
    ownerId: '220784',
    ownerName: '周琦星',
    applicantId: '',
    applicant: '-',
    documentNo: '-',
    documentType: '-',
    businessType: '-',
    documentStatus: '-',
    approvalNode: '-',
    approver: '-',
    company: '114.新媒体',
    plate: '17.Corporate',
  },
  {
    id: 'asset-2',
    tag: '114122102371',
    description: '微软.Surface Laptop 4',
    assetStatus: '在用-使用中',
    statusCode: '6',
    materialType: '资产',
    ownerId: '220784',
    ownerName: '周琦星',
    applicantId: '220784',
    applicant: '220784-周琦星',
    documentNo: 'TR-202609010001',
    documentType: '资产转移',
    businessType: '员工转移',
    documentStatus: '处理中',
    approvalNode: '接收部门经理审批',
    approver: '110001-张朝阳',
    company: '114.新媒体',
    plate: '17.Corporate',
  },
  {
    id: 'asset-3',
    tag: '114122102399',
    description: '联想.ThinkPad X13 2024',
    assetStatus: '在用-使用中',
    statusCode: '3',
    materialType: '资产',
    ownerId: '218356',
    ownerName: '徐鑫',
    applicantId: '220784',
    applicant: '220784-周琦星',
    documentNo: 'EUA-202609020001',
    documentType: '资产申请',
    businessType: '员工领用',
    documentStatus: '处理中',
    approvalNode: 'ES配给',
    approver: '115102-王英',
    company: '114.新媒体',
    plate: '17.Corporate',
  },
];

const CONSUMABLE_ROWS = [
  {
    id: 'consumable-1',
    tag: 'QT-260123',
    company: '114.新媒体',
    plate: '17.Corporate',
    majorCategory: '电脑外设/配件',
    minorCategory: '键盘',
    description: '苹果.妙控键盘（MK2A3CH/A）',
    brand: '苹果',
    mainAssetTag: '114122102371',
    quantity: 1,
    originalValue: 675,
    netValue: 0,
    ownerId: '220784',
    ownerName: '周琦星',
    status: '在用',
    costCenter: 'D3520.ERP部',
    warehouse: 'I1001.耗材集团总库（新媒体）',
    enabledDate: '2026-06-04',
    materialType: '耗材',
  },
  {
    id: 'consumable-2',
    tag: 'QT-260188',
    company: '114.新媒体',
    plate: '17.Corporate',
    majorCategory: '线材',
    minorCategory: '转接线',
    description: '绿联.60121 Type-C数据线',
    brand: '绿联',
    mainAssetTag: '',
    quantity: 1,
    originalValue: 13,
    netValue: 0,
    ownerId: '218356',
    ownerName: '徐鑫',
    status: '在用',
    costCenter: '产品技术部',
    warehouse: 'I1001.耗材集团总库（新媒体）',
    enabledDate: '2026-08-01',
    materialType: '耗材',
  },
];

const CONTRACT_NUMBER_ROWS = [
  {
    id: 'contract-1',
    contractNumber: '18001379052',
    secondaryCard: '-',
    status: '在用-使用中',
    active: true,
    ownerId: '220784',
    ownerName: '周琦星',
    company: '114.新媒体',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
    claimDate: '2026-06-18',
    remark: '业务使用',
  },
  {
    id: 'contract-2',
    contractNumber: '18001379265',
    secondaryCard: '-',
    status: '在用-使用中',
    active: true,
    ownerId: '218356',
    ownerName: '徐鑫',
    company: '114.新媒体',
    department: '产品技术部.研发一组',
    claimDate: '2026-01-05',
    remark: '移动测试号码',
  },
];

const DOCUMENT_ROWS = [
  {
    id: 'document-1',
    applicationNo: 'NE-202505310007',
    documentType: '新员工领用',
    businessType: '新员工相关',
    documentStatus: '已完成',
    applicantId: '220784',
    applicant: '220784-周琦星',
    responsiblePersonId: '',
    payPersonId: '',
    inboundPersonIds: [],
    outboundPersonIds: ['220784'],
    applyDate: '2025-05-31',
    createdAt: '2025-05-31 09:30:00',
    coreDocument: 'OS-202506040022',
    company: '114.新媒体',
    plate: '17.Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
  },
  {
    id: 'document-2',
    applicationNo: 'AR-202609120021',
    documentType: '资产退库',
    businessType: '退库',
    documentStatus: '处理中',
    applicantId: '218356',
    applicant: '218356-徐鑫',
    responsiblePersonId: '220784',
    payPersonId: '',
    inboundPersonIds: ['220784'],
    outboundPersonIds: [],
    applyDate: '2026-09-12',
    createdAt: '2026-09-12 14:20:00',
    coreDocument: '-',
    company: '114.新媒体',
    plate: '17.Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
  },
  {
    id: 'document-3',
    applicationNo: 'TR-202609010001',
    documentType: '资产转移',
    businessType: '员工转移',
    documentStatus: '已驳回',
    applicantId: '218356',
    applicant: '218356-徐鑫',
    responsiblePersonId: '',
    payPersonId: '220784',
    inboundPersonIds: [],
    outboundPersonIds: [],
    applyDate: '2026-09-01',
    createdAt: '2026-09-01 10:15:00',
    coreDocument: 'AT-202609010003',
    company: '114.新媒体',
    plate: '17.Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
  },
];

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/[.\-\s]/g, '');
}

function includesText(value, query) {
  if (!query) return true;
  return normalizeText(value).includes(normalizeText(query));
}

function displayText(value) {
  return value === undefined || value === null || value === '' ? '-' : value;
}

function amountText(value) {
  if (value === undefined || value === null || value === '' || value === '-') return '-';
  const number = Number(value);
  if (Number.isNaN(number)) return displayText(value);
  return number.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function employeeText(employee) {
  if (!employee?.id) return '';
  return `${employee.id}-${employee.name}`;
}

function documentBelongsToEmployee(row, employeeId) {
  if (!employeeId) return false;
  return [
    row.applicantId,
    row.responsiblePersonId,
    row.payPersonId,
    ...(row.inboundPersonIds || []),
    ...(row.outboundPersonIds || []),
  ].some((value) => String(value || '') === String(employeeId));
}

function LookupInput({ value, placeholder, onOpen, onClear }) {
  const handleOpen = (event) => {
    if (event?.target?.closest?.('.ant-input-clear-icon')) return;
    onOpen?.();
  };

  return (
    <Input
      value={value || ''}
      readOnly
      allowClear={Boolean(onClear)}
      placeholder={placeholder}
      suffix={<Search size={14} className="text-[#1677ff]" />}
      style={{ cursor: 'pointer' }}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.();
        }
      }}
      onChange={(event) => {
        if (!event.target.value) onClear?.();
      }}
    />
  );
}

function RecordDetailModal({ detail, onClose }) {
  if (!detail) return null;
  const { kind, record } = detail;

  const configs = {
    asset: {
      title: '资产卡片详情',
      items: [
        ['资产标签号', record.tag],
        ['资产说明', record.description],
        ['资产状态', record.assetStatus],
        ['资产责任人', `${record.ownerId}-${record.ownerName}`],
        ['公司', record.company],
        ['板块', record.plate],
      ],
    },
    consumable: {
      title: '耗材详情',
      items: [
        ['耗材标签号', record.tag],
        ['资产大类', record.majorCategory],
        ['资产小类', record.minorCategory],
        ['资产说明', record.description],
        ['品牌', record.brand],
        ['主资产标签号', record.mainAssetTag],
        ['数量', record.quantity],
        ['原值', amountText(record.originalValue)],
        ['净值', amountText(record.netValue)],
        ['责任人', `${record.ownerId}-${record.ownerName}`],
        ['状态', record.status],
        ['成本中心', record.costCenter],
        ['仓库', record.warehouse],
        ['启用日期', record.enabledDate],
      ],
    },
    contract: {
      title: '合约号码详情',
      items: [
        ['合约号码', record.contractNumber],
        ['副卡', record.secondaryCard],
        ['状态', record.status],
        ['责任人编号', record.ownerId],
        ['责任人', record.ownerName],
        ['公司', record.company],
        ['部门', record.department],
        ['领用时间', record.claimDate],
        ['备注', record.remark],
      ],
    },
    document: {
      title: '业务单据详情',
      items: [
        ['申请单号', record.applicationNo],
        ['单据类型', record.documentType],
        ['业务类型', record.businessType],
        ['单据状态', record.documentStatus],
        ['申请人', record.applicant],
        ['申请时间', record.applyDate],
        ['核心单据', record.coreDocument],
        ['公司', record.company],
        ['板块', record.plate],
        ['部门', record.department],
      ],
    },
  };

  const config = configs[kind];
  if (!config) return null;

  return (
    <Modal
      open
      title={config.title}
      footer={null}
      onCancel={onClose}
      width={760}
      destroyOnHidden
    >
      <DetailGrid columns={3} labelWidth={110}>
        {config.items.map(([label, value]) => (
          <DetailItem key={label} label={label}>{displayText(value)}</DetailItem>
        ))}
      </DetailGrid>
    </Modal>
  );
}

export default function EmployeeAssetInfoQueryPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [activeTab, setActiveTab] = useState('asset');
  const [draftEmployee, setDraftEmployee] = useState(DEFAULT_EMPLOYEE);
  const [appliedEmployee, setAppliedEmployee] = useState(DEFAULT_EMPLOYEE);
  const [draftFilters, setDraftFilters] = useState(() => copy(EMPTY_TAB_FILTERS));
  const [appliedFilters, setAppliedFilters] = useState(() => copy(EMPTY_TAB_FILTERS));
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({
      ...current,
      [activeTab]: {
        ...current[activeTab],
        [field]: value || '',
      },
    }));
  };

  const runQuery = () => {
    if (!draftEmployee?.id) {
      messageApi.warning('请选择员工信息');
      return;
    }
    setAppliedEmployee(draftEmployee);
    setAppliedFilters((current) => ({
      ...current,
      [activeTab]: { ...draftFilters[activeTab] },
    }));
  };

  const resetQuery = () => {
    setDraftEmployee(null);
    setAppliedEmployee(null);
    setDraftFilters((current) => ({
      ...current,
      [activeTab]: copy(EMPTY_TAB_FILTERS[activeTab]),
    }));
    setAppliedFilters((current) => ({
      ...current,
      [activeTab]: copy(EMPTY_TAB_FILTERS[activeTab]),
    }));
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (!appliedEmployee?.id) return;
    setAppliedFilters((current) => ({
      ...current,
      [key]: { ...draftFilters[key] },
    }));
  };

  const filteredAssetRows = useMemo(() => {
    const employeeId = appliedEmployee?.id;
    const filter = appliedFilters.asset;
    return ASSET_ROWS
      .filter((row) => (
        String(row.ownerId) === String(employeeId || '')
        && ['3', '6'].includes(String(row.statusCode))
        && row.materialType === '资产'
        && includesText(row.tag, filter.assetTag)
      ))
      .map((row, index) => ({ ...row, rowNo: index + 1 }));
  }, [appliedEmployee, appliedFilters.asset]);

  const filteredConsumableRows = useMemo(() => {
    const employeeId = appliedEmployee?.id;
    const filter = appliedFilters.consumable;
    return CONSUMABLE_ROWS
      .filter((row) => (
        String(row.ownerId) === String(employeeId || '')
        && row.materialType === '耗材'
        && includesText(row.tag, filter.assetTag)
      ))
      .map((row, index) => ({ ...row, rowNo: index + 1 }));
  }, [appliedEmployee, appliedFilters.consumable]);

  const filteredContractRows = useMemo(() => {
    const employeeId = appliedEmployee?.id;
    const filter = appliedFilters.contract;
    return CONTRACT_NUMBER_ROWS
      .filter((row) => (
        String(row.ownerId) === String(employeeId || '')
        && row.active
        && includesText(row.contractNumber, filter.contractNumber)
      ))
      .map((row, index) => ({ ...row, rowNo: index + 1 }));
  }, [appliedEmployee, appliedFilters.contract]);

  const filteredDocumentRows = useMemo(() => {
    const employeeId = appliedEmployee?.id;
    const filter = appliedFilters.document;
    return DOCUMENT_ROWS
      .filter((row) => (
        documentBelongsToEmployee(row, employeeId)
        && (includesText(row.applicationNo, filter.documentNo) || includesText(row.coreDocument, filter.documentNo))
        && includesText(row.documentStatus, filter.documentStatus)
      ))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map((row, index) => ({ ...row, rowNo: index + 1 }));
  }, [appliedEmployee, appliedFilters.document]);

  const openDocumentDetail = (documentNo) => {
    if (!documentNo || documentNo === '-') return;
    const record = DOCUMENT_ROWS.find((row) => row.applicationNo === documentNo || row.coreDocument === documentNo);
    if (record) {
      setDetail({ kind: 'document', record });
      return;
    }
    messageApi.info('当前原型暂无该单据详情数据');
  };

  const assetColumns = [
    { title: '行号', dataIndex: 'rowNo', width: 70, fixed: 'left' },
    {
      title: '资产标签号',
      dataIndex: 'tag',
      width: 170,
      fixed: 'left',
      render: (value, record) => (
        <Button type="link" size="small" onClick={() => setDetail({ kind: 'asset', record })}>{value}</Button>
      ),
    },
    { title: '资产说明', dataIndex: 'description', width: 220, render: displayText },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '资产责任人', width: 170, render: (_, record) => `${record.ownerId}-${record.ownerName}` },
    { title: '单据申请人', dataIndex: 'applicant', width: 150, render: displayText },
    {
      title: '所在单据编号',
      dataIndex: 'documentNo',
      width: 170,
      render: (value) => value && value !== '-'
        ? <Button type="link" size="small" onClick={() => openDocumentDetail(value)}>{value}</Button>
        : '-',
    },
    { title: '单据类型', dataIndex: 'documentType', width: 130, render: displayText },
    { title: '单据业务类型', dataIndex: 'businessType', width: 140, render: displayText },
    { title: '单据状态', dataIndex: 'documentStatus', width: 120, render: displayText },
    { title: '单据审批环节', dataIndex: 'approvalNode', width: 160, render: displayText },
    { title: '单据审批人', dataIndex: 'approver', width: 150, render: displayText },
    { title: '公司', dataIndex: 'company', width: 130, render: displayText },
    { title: '板块', dataIndex: 'plate', width: 130, render: displayText },
  ];

  const consumableColumns = [
    { title: '行号', dataIndex: 'rowNo', width: 70, fixed: 'left' },
    {
      title: '耗材标签号',
      dataIndex: 'tag',
      width: 160,
      fixed: 'left',
      render: (value, record) => (
        <Button type="link" size="small" onClick={() => setDetail({ kind: 'consumable', record })}>{value}</Button>
      ),
    },
    { title: '公司', dataIndex: 'company', width: 130, render: displayText },
    { title: '板块', dataIndex: 'plate', width: 130, render: displayText },
    { title: '资产大类', dataIndex: 'majorCategory', width: 150, render: displayText },
    { title: '资产小类', dataIndex: 'minorCategory', width: 140, render: displayText },
    { title: '资产说明', dataIndex: 'description', width: 240, render: displayText },
    { title: '品牌', dataIndex: 'brand', width: 110, render: displayText },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 160, render: displayText },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'right', render: displayText },
    { title: '原值', dataIndex: 'originalValue', width: 120, align: 'right', render: amountText },
    { title: '净值', dataIndex: 'netValue', width: 120, align: 'right', render: amountText },
    { title: '责任人编号', dataIndex: 'ownerId', width: 120, render: displayText },
    { title: '责任人', dataIndex: 'ownerName', width: 120, render: displayText },
    { title: '状态', dataIndex: 'status', width: 110, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '成本中心', dataIndex: 'costCenter', width: 160, render: displayText },
    { title: '仓库', dataIndex: 'warehouse', width: 220, render: displayText },
    { title: '启用日期', dataIndex: 'enabledDate', width: 120, render: displayText },
  ];

  const contractColumns = [
    { title: '行号', dataIndex: 'rowNo', width: 70, fixed: 'left' },
    {
      title: '合约号码',
      dataIndex: 'contractNumber',
      width: 150,
      fixed: 'left',
      render: (value, record) => (
        <Button type="link" size="small" onClick={() => setDetail({ kind: 'contract', record })}>{value}</Button>
      ),
    },
    { title: '副卡', dataIndex: 'secondaryCard', width: 120, render: displayText },
    { title: '状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '责任人编号', dataIndex: 'ownerId', width: 120, render: displayText },
    { title: '责任人', dataIndex: 'ownerName', width: 120, render: displayText },
    { title: '公司', dataIndex: 'company', width: 130, render: displayText },
    { title: '部门', dataIndex: 'department', width: 320, render: displayText },
    { title: '领用时间', dataIndex: 'claimDate', width: 120, render: displayText },
    { title: '备注', dataIndex: 'remark', width: 180, render: displayText },
  ];

  const documentColumns = [
    { title: '行号', dataIndex: 'rowNo', width: 70, fixed: 'left' },
    {
      title: '申请单号',
      dataIndex: 'applicationNo',
      width: 180,
      fixed: 'left',
      render: (value, record) => (
        <Button type="link" size="small" onClick={() => setDetail({ kind: 'document', record })}>{value}</Button>
      ),
    },
    { title: '单据类型', dataIndex: 'documentType', width: 130, render: displayText },
    { title: '业务类型', dataIndex: 'businessType', width: 130, render: displayText },
    { title: '单据状态', dataIndex: 'documentStatus', width: 120, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '申请人', dataIndex: 'applicant', width: 150, render: displayText },
    { title: '申请时间', dataIndex: 'applyDate', width: 120, render: displayText },
    {
      title: '核心单据',
      dataIndex: 'coreDocument',
      width: 180,
      render: (value, record) => value && value !== '-'
        ? <Button type="link" size="small" onClick={() => setDetail({ kind: 'document', record })}>{value}</Button>
        : '-',
    },
    { title: '公司', dataIndex: 'company', width: 130, render: displayText },
    { title: '板块', dataIndex: 'plate', width: 130, render: displayText },
    { title: '部门', dataIndex: 'department', width: 360, render: displayText },
    {
      title: '操作',
      key: 'operation',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => setDetail({ kind: 'document', record })}>查看流程</Button>
      ),
    },
  ];

  const tabConfig = {
    asset: {
      label: '资产',
      title: '资产信息',
      rows: filteredAssetRows,
      columns: assetColumns,
      emptyText: '暂无资产信息。',
    },
    consumable: {
      label: '耗材',
      title: '耗材信息',
      rows: filteredConsumableRows,
      columns: consumableColumns,
      emptyText: '暂无耗材信息。',
    },
    contract: {
      label: '合约号码',
      title: '合约号码信息',
      rows: filteredContractRows,
      columns: contractColumns,
      emptyText: '暂无合约号码信息。',
    },
    document: {
      label: '单据信息',
      title: '单据信息',
      rows: filteredDocumentRows,
      columns: documentColumns,
      emptyText: '暂无单据信息。',
    },
  };

  const current = tabConfig[activeTab];
  const currentFilter = draftFilters[activeTab];

  return (
    <>
      {contextHolder}
      <div className="flex flex-col gap-4">
        <Typography.Title level={4} className="mb-0">员工资产信息查询</Typography.Title>

        <QueryBar onQuery={runQuery} onReset={resetQuery}>
          <QueryItem label="员工信息">
            <LookupInput
              value={employeeText(draftEmployee)}
              placeholder="请选择员工"
              onOpen={() => setEmployeeModalOpen(true)}
              onClear={() => setDraftEmployee(null)}
            />
          </QueryItem>

          {(activeTab === 'asset' || activeTab === 'consumable') && (
            <QueryItem label="资产标签号">
              <Input
                value={currentFilter.assetTag}
                placeholder={activeTab === 'asset' ? '请输入资产标签号' : '请输入耗材标签号'}
                allowClear
                onChange={(event) => updateFilter('assetTag', event.target.value)}
              />
            </QueryItem>
          )}

          {activeTab === 'contract' && (
            <QueryItem label="合约号码">
              <Input
                value={currentFilter.contractNumber}
                placeholder="请输入合约号码"
                allowClear
                onChange={(event) => updateFilter('contractNumber', event.target.value)}
              />
            </QueryItem>
          )}

          {activeTab === 'document' && (
            <>
              <QueryItem label="单据编号">
                <Input
                  value={currentFilter.documentNo}
                  placeholder="请输入单据编号"
                  allowClear
                  onChange={(event) => updateFilter('documentNo', event.target.value)}
                />
              </QueryItem>
              <QueryItem label="单据状态">
                <Select
                  value={currentFilter.documentStatus || undefined}
                  placeholder="请选择"
                  allowClear
                  options={[
                    { label: '已完成', value: '已完成' },
                    { label: '处理中', value: '处理中' },
                    { label: '已驳回', value: '已驳回' },
                  ]}
                  onChange={(value) => updateFilter('documentStatus', value)}
                />
              </QueryItem>
            </>
          )}
        </QueryBar>

        <Card size="small" bodyStyle={{ paddingTop: 0 }}>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
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
            locale={{ emptyText: current.emptyText }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        </Card>
      </div>

      <SelectModal
        open={employeeModalOpen}
        title="选择员工"
        dataSource={EMPLOYEE_OPTIONS}
        columns={[
          { title: '员工编号', dataIndex: 'id', width: 120 },
          { title: '员工姓名', dataIndex: 'name', width: 120 },
          { title: '部门', dataIndex: 'department', width: 320 },
        ]}
        searchFields={[
          { label: '员工编号', name: 'id', dataIndex: 'id', placeholder: '请输入员工编号' },
          { label: '员工姓名', name: 'name', dataIndex: 'name', placeholder: '请输入员工姓名' },
          { label: '部门', name: 'department', dataIndex: 'department', placeholder: '请输入部门' },
        ]}
        onCancel={() => setEmployeeModalOpen(false)}
        onConfirm={(record) => {
          setDraftEmployee(record);
          setEmployeeModalOpen(false);
        }}
      />

      <RecordDetailModal detail={detail} onClose={() => setDetail(null)} />
    </>
  );
}
