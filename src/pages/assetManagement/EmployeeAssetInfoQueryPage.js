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
    assetStatus: '在用-借用中',
    statusCode: '3',
    materialType: '资产',
    ownerId: '220784',
    ownerName: '周琦星',
    applicantId: '',
    applicant: '-',
    documentNo: '-',
    spPoPutinNum: '',
    tagNumber: '112161100271-V',
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
    spPoPutinNum: 'TR-202609010001',
    tagNumber: '114122102371',
    documentType: '资产转移',
    businessType: '员工转移',
    documentStatus: '已驳回',
    approvalNode: '流程已结束',
    approver: '-',
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
    spPoPutinNum: 'EUA-202609020001',
    tagNumber: '114122102399',
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
    spPoPutinNum: 'PI-202609120010',
    tagNumber: 'QT-260123',
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
    spPoPutinNum: '',
    tagNumber: 'QT-260188',
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
    spPoPutinNum: 'PI-202609100003',
    tagNumber: 'N-0739',
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
    spPoPutinNum: '',
    tagNumber: 'N-0741',
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
    relationType: 'employeeApplication',
    headerApplicantId: '220784',
    payPersonId: '',
    applicant: '220784-周琦星',
    applyDate: '2025-05-31',
    createdAt: '2025-05-31 09:30:00',
    coreDocument: 'OS-202506040022',
    company: '114.新媒体',
    plate: '17.Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
    detailAvailable: true,
    isHistorical: true,
  },
  {
    id: 'document-2',
    applicationNo: 'CAA-202609150031',
    documentType: '统一申请',
    businessType: '统一申请相关',
    documentStatus: '处理中',
    relationType: 'caaPurchaseApplication',
    headerApplicantId: '',
    payPersonId: '220784',
    applicant: '-',
    applyDate: '2026-09-15',
    createdAt: '2026-09-15 11:10:00',
    coreDocument: 'PO-202609150018',
    company: '114.新媒体',
    plate: '17.Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
    detailAvailable: true,
    isHistorical: false,
  },
  {
    id: 'document-3',
    applicationNo: 'IN-202609120021',
    documentType: '独立入库',
    businessType: '入库',
    documentStatus: '已完成',
    relationType: 'standaloneInbound',
    returnPersonIds: ['220784'],
    applicant: '-',
    applyDate: '2026-09-12',
    createdAt: '2026-09-12 14:20:00',
    coreDocument: '-',
    company: '114.新媒体',
    plate: '17.Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
    detailAvailable: true,
    isHistorical: false,
  },
  {
    id: 'document-4',
    applicationNo: 'OS-202609100015',
    documentType: '独立出库',
    businessType: '出库',
    documentStatus: '已完成',
    relationType: 'standaloneOutbound',
    detailResponsibleIds: ['220784'],
    applicant: '-',
    applyDate: '2026-09-10',
    createdAt: '2026-09-10 16:05:00',
    coreDocument: '-',
    company: '114.新媒体',
    plate: '17.Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
    detailAvailable: true,
    isHistorical: false,
  },
  {
    id: 'document-5',
    applicationNo: 'AT-202609010003',
    documentType: '资产转移',
    businessType: '资产转移',
    documentStatus: '已完成',
    relationType: 'standaloneTransfer',
    detailResponsibleIds: ['218356'],
    detailApplicantIds: ['220784'],
    applicant: '-',
    applyDate: '2026-09-01',
    createdAt: '2026-09-01 10:15:00',
    coreDocument: '-',
    company: '114.新媒体',
    plate: '17.Corporate',
    department: 'D3520.集团总部.ERP部.业务产品二组.运营产品组',
    detailAvailable: true,
    isHistorical: false,
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


function compareSpPoPutinDescThenTagAsc(a, b) {
  const aDocumentNo = String(a.spPoPutinNum || '').trim();
  const bDocumentNo = String(b.spPoPutinNum || '').trim();

  if (!aDocumentNo && bDocumentNo) return 1;
  if (aDocumentNo && !bDocumentNo) return -1;

  if (aDocumentNo && bDocumentNo) {
    const documentCompare = bDocumentNo.localeCompare(aDocumentNo, 'zh-CN', { numeric: true });
    if (documentCompare !== 0) return documentCompare;
  }

  return String(a.tagNumber || '').localeCompare(String(b.tagNumber || ''), 'zh-CN', { numeric: true });
}

function documentBelongsToEmployee(row, employeeId) {
  if (!employeeId) return false;
  const target = String(employeeId);

  if (row.relationType === 'employeeApplication'
    || row.relationType === 'caaInventoryApplication'
    || row.relationType === 'caaPurchaseApplication') {
    const headerEmployeeId = row.headerApplicantId || row.payPersonId;
    return String(headerEmployeeId || '') === target;
  }

  if (row.relationType === 'standaloneInbound') {
    return (row.returnPersonIds || []).some((value) => String(value || '') === target);
  }

  if (row.relationType === 'standaloneOutbound') {
    return (row.detailResponsibleIds || []).some((value) => String(value || '') === target);
  }

  if (row.relationType === 'standaloneTransfer') {
    return [
      ...(row.detailResponsibleIds || []),
      ...(row.detailApplicantIds || []),
    ].some((value) => String(value || '') === target);
  }

  return false;
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
        ['耗材大类', record.majorCategory],
        ['耗材小类', record.minorCategory],
        ['耗材说明', record.description],
        ['品牌', record.brand],
        ['主资产标签号', record.mainAssetTag],
        ['数量', record.quantity],
        ['原值', amountText(record.originalValue)],
        ['净值', amountText(record.netValue)],
        ['耗材责任人', `${record.ownerId}.${record.ownerName}`],
        ['耗材状态', record.status],
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
        ['号码状态', record.status],
        ['责任人', `${record.ownerId}-${record.ownerName}`],
        ['使用公司', record.company],
        ['部门', record.department],
        ['领用日期', record.claimDate],
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
  const [draftEmployee, setDraftEmployee] = useState(null);
  const [appliedEmployee, setAppliedEmployee] = useState(null);
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

    const employeeChanged = Boolean(appliedEmployee?.id && appliedEmployee.id !== draftEmployee.id);
    setAppliedEmployee(draftEmployee);

    if (employeeChanged) {
      const nextDraftFilters = copy(EMPTY_TAB_FILTERS);
      nextDraftFilters[activeTab] = { ...draftFilters[activeTab] };
      setDraftFilters(nextDraftFilters);

      const nextAppliedFilters = copy(EMPTY_TAB_FILTERS);
      nextAppliedFilters[activeTab] = { ...draftFilters[activeTab] };
      setAppliedFilters(nextAppliedFilters);
      return;
    }

    setAppliedFilters((current) => ({
      ...current,
      [activeTab]: { ...draftFilters[activeTab] },
    }));
  };

  const resetQuery = () => {
    setDraftEmployee(null);
    setAppliedEmployee(null);
    setDraftFilters(copy(EMPTY_TAB_FILTERS));
    setAppliedFilters(copy(EMPTY_TAB_FILTERS));
  };

  const handleEmployeeConfirm = (record) => {
    const isDifferentFromApplied = Boolean(appliedEmployee?.id && appliedEmployee.id !== record.id);
    setDraftEmployee(record);

    if (isDifferentFromApplied) {
      const nextDraftFilters = copy(EMPTY_TAB_FILTERS);
      nextDraftFilters[activeTab] = { ...draftFilters[activeTab] };
      setDraftFilters(nextDraftFilters);
      setAppliedFilters(copy(EMPTY_TAB_FILTERS));
      setAppliedEmployee(null);
    }

    setEmployeeModalOpen(false);
  };

  const clearEmployee = () => {
    setDraftEmployee(null);
    setAppliedEmployee(null);
    setDraftFilters(copy(EMPTY_TAB_FILTERS));
    setAppliedFilters(copy(EMPTY_TAB_FILTERS));
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
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
      .sort(compareSpPoPutinDescThenTagAsc)
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
      .sort(compareSpPoPutinDescThenTagAsc)
      .map((row, index) => ({ ...row, rowNo: index + 1 }));
  }, [appliedEmployee, appliedFilters.consumable]);

  const filteredContractRows = useMemo(() => {
    const employeeId = appliedEmployee?.id;
    const filter = appliedFilters.contract;
    return CONTRACT_NUMBER_ROWS
      .filter((row) => (
        String(row.ownerId) === String(employeeId || '')
        && row.status === '在用-使用中'
        && includesText(row.contractNumber, filter.contractNumber)
      ))
      .sort(compareSpPoPutinDescThenTagAsc)
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
      .sort((a, b) => String(b.applyDate).localeCompare(String(a.applyDate)))
      .map((row, index) => ({ ...row, rowNo: index + 1 }));
  }, [appliedEmployee, appliedFilters.document]);

  const openDocumentDetail = (documentNo) => {
    if (!documentNo || documentNo === '-') return;
    const record = DOCUMENT_ROWS.find((row) => row.applicationNo === documentNo || row.coreDocument === documentNo);

    if (!record) {
      messageApi.warning('暂无明细展示页面！请联系维护人员添加。');
      return;
    }

    if (record.isHistorical) {
      messageApi.info('历史单据跳转至旧系统对应单据详情页');
      return;
    }

    if (!record.detailAvailable) {
      messageApi.warning('暂无明细展示页面！请联系维护人员添加。');
      return;
    }

    setDetail({ kind: 'document', record });
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
    {
      title: '耗材标签号',
      dataIndex: 'tag',
      width: 160,
      fixed: 'left',
      render: (value, record) => (
        <Button type="link" size="small" onClick={() => setDetail({ kind: 'consumable', record })}>{value}</Button>
      ),
    },
    { title: '耗材说明', dataIndex: 'description', width: 240, render: displayText },
    { title: '耗材状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '耗材责任人', dataIndex: 'ownerName', width: 180, render: (_, record) => `${record.ownerId}.${record.ownerName}` },
    { title: '关联主资产标签号', dataIndex: 'mainAssetTag', width: 160, render: displayText },
    {
      title: '主资产资产说明',
      dataIndex: 'mainAssetTag',
      width: 240,
      render: (value) => displayText(ASSET_ROWS.find((asset) => asset.tag === value)?.description),
    },
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
    { title: '合约号码说明', dataIndex: 'contractDesc', width: 200, render: displayText },
    { title: '合约号码状态', dataIndex: 'status', width: 140, render: (value) => <StatusTag value={value} type="business" /> },
    { title: '责任人', dataIndex: 'ownerName', width: 170, render: (_, record) => `${record.ownerId}-${record.ownerName}` },
    { title: '责任人公司', dataIndex: 'ownerCompany', width: 160, render: displayText },
    {
      title: '所在单据编号',
      dataIndex: 'spPoPutinNum',
      width: 180,
      render: (value, record) => (value && record.detailAvailable
        ? <Button type="link" size="small" onClick={() => openDocumentDetail(value)}>{value}</Button>
        : displayText(value)),
    },
    { title: '单据申请人', dataIndex: 'applicant', width: 150, render: displayText },
    { title: '单据类型', dataIndex: 'documentType', width: 130, render: displayText },
    { title: '单据业务类型', dataIndex: 'businessType', width: 140, render: displayText },
    { title: '单据审批环节', dataIndex: 'approvalNode', width: 160, render: displayText },
    { title: '单据审批人', dataIndex: 'approver', width: 150, render: displayText },
  ];

  const documentColumns = [
    { title: '行号', dataIndex: 'rowNo', width: 70, fixed: 'left' },
    {
      title: '申请单号',
      dataIndex: 'applicationNo',
      width: 180,
      fixed: 'left',
      render: (value) => value
        ? <Button type="link" size="small" onClick={() => openDocumentDetail(value)}>{value}</Button>
        : '-',
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
      render: (value) => value && value !== '-'
        ? <Button type="link" size="small" onClick={() => openDocumentDetail(value)}>{value}</Button>
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
      render: (_, record) => {
        const detailNo = record.applicationNo || record.coreDocument;
        return detailNo
          ? <Button type="link" size="small" onClick={() => openDocumentDetail(detailNo)}>查看流程</Button>
          : '-';
      },
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
    contract: {
      label: '合约号码',
      title: '合约号码信息',
      rows: filteredContractRows,
      columns: contractColumns,
      emptyText: '暂无合约号码信息。',
    },
    consumable: {
      label: '耗材',
      title: '耗材信息',
      rows: filteredConsumableRows,
      columns: consumableColumns,
      emptyText: '暂无耗材信息。',
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

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={Object.entries(tabConfig).map(([key, item]) => ({ key, label: item.label }))}
        />

        <QueryBar onQuery={runQuery} onReset={resetQuery}>
          <QueryItem label="员工信息">
            <LookupInput
              value={employeeText(draftEmployee)}
              placeholder="请选择员工"
              onOpen={() => setEmployeeModalOpen(true)}
              onClear={clearEmployee}
            />
          </QueryItem>

          {activeTab === 'asset' && (
            <QueryItem label="资产标签号">
              <Input
                value={currentFilter.assetTag}
                placeholder="请输入资产标签号"
                allowClear
                onChange={(event) => updateFilter('assetTag', event.target.value)}
              />
            </QueryItem>
          )}

          {activeTab === 'consumable' && (
            <QueryItem label="耗材标签号">
              <Input
                value={currentFilter.assetTag}
                placeholder="请输入耗材标签号"
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

        <Card size="small">
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
        onConfirm={handleEmployeeConfirm}
      />

      <RecordDetailModal detail={detail} onClose={() => setDetail(null)} />
    </>
  );
}
