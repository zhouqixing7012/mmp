import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { Download, Plus, Printer, Search, Trash2, Upload } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import OutboundApprovalPage from './OutboundApprovalPage';
import OutboundApprovalHistoryPage from './OutboundApprovalHistoryPage';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const OUTBOUND_TYPES = ['领用出库', '借用出库'];
const OUTBOUND_STATUSES = ['草稿', '审批中', '已完成'];
const WAREHOUSES = [
  'I0001-资产集团总库（新媒体）',
  'I0013-资产集团前台库（新媒体）',
  'I0022-资产集团前台库（焦点互动）',
  'I1001-耗材库',
];
const INFRA_TYPES = new Set(['服务器', '服务器备件', '网络设备', '网络设备备件']);
const AVAILABLE_ASSET_STATUSES = new Set(['在库-待处理', '在库-新增', '在库-再利用']);
const CURRENT_USER = '206984-何文';

const EMPLOYEES = [
  { value: '206984-何文', label: '206984-何文', department: 'ERP部.业务产品二组', company: '114.新媒体', costCenter: 'ERP部', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '15F' },
  { value: '114111-杨芊', label: '114111-杨芊', department: 'ES部.资产管理组', company: '114.新媒体', costCenter: 'ES部', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '16F' },
  { value: '116201-李娜', label: '116201-李娜', department: '技术部.基础设施组', company: '116.天津飞狐', costCenter: '技术部', city: '022.天津市', building: '220101.天津研发中心', floor: '8F' },
];
const COST_CENTERS = ['ERP部', 'ES部', '技术部', '0.*'];
const BUSINESS_LINES = ['0.*', '媒体', '研发', '基础设施'];
const LOCATION_OPTIONS = {
  '010.北京市': {
    '129753.搜狐媒体大厦': ['15F', '16F', '17F'],
    '129754.搜狐网络大厦': ['8F', '9F'],
  },
  '022.天津市': {
    '220101.天津研发中心': ['7F', '8F', '9F'],
  },
};

const ASSET_POOL = [
  {
    id: 'asset-laptop-1', assetTag: 'AST-2409010068', sn: 'SN-T14-0068', materialDesc: '联想.ThinkPad T14', materialGroup: '1.资产',
    assetClass: '10.电脑', assetSubClass: '笔记本电脑', brand: '联想', model: 'ThinkPad T14', config: 'i7 / 32G / 1T SSD', unit: '台',
    applicationBatch: '2026Q3', responsiblePerson: '114111-杨芊', responsibleLeader: '100007-王总', esOutboundAdmin: '114120-周敏', quantity: 1,
    assetStatus: '在库-新增', company: '114.新媒体', plate: '集团', department: 'ES部.资产管理组', costCenter: 'ES部', businessLine: '媒体',
    expenseAccount: '固定资产', mainAssetTag: '-', originalValue: 8200, tax: 1066, partQuantity: 0, partDesc: '-', assetMark: '主资产', remark: '-',
    warehouse: 'I0001-资产集团总库（新媒体）', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '15F', room: '1508', locked: false,
    purchaseSource: true, poNo: 'PO2607010008', prNo: 'PR2606180012', purchaseSpecialist: '100501-采购专员A', service: '', noLocation: '',
  },
  {
    id: 'asset-monitor-1', assetTag: 'AST-2409010072', sn: 'SN-DL-0072', materialDesc: '戴尔.U2723QE显示器', materialGroup: '1.资产',
    assetClass: '11.办公设备', assetSubClass: '显示器', brand: '戴尔', model: 'U2723QE', config: '27英寸 / 4K', unit: '台',
    applicationBatch: '2026Q3', responsiblePerson: '114111-杨芊', responsibleLeader: '100007-王总', esOutboundAdmin: '114120-周敏', quantity: 1,
    assetStatus: '在库-再利用', company: '114.新媒体', plate: '集团', department: 'ES部.资产管理组', costCenter: 'ES部', businessLine: '媒体',
    expenseAccount: '固定资产', mainAssetTag: '-', originalValue: 3200, tax: 416, partQuantity: 0, partDesc: '-', assetMark: '主资产', remark: '可再次领用',
    warehouse: 'I0001-资产集团总库（新媒体）', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '15F', room: '1508', locked: false,
    purchaseSource: false, poNo: '', prNo: '', purchaseSpecialist: '', service: '', noLocation: '',
  },
  {
    id: 'asset-server-1', assetTag: 'AST-SRV-26080018', sn: 'SRV-SN-0018', materialDesc: 'Dell.PowerEdge R760', materialGroup: '1.资产',
    assetClass: '20.服务器设备', assetSubClass: '服务器', brand: 'Dell', model: 'PowerEdge R760', config: '2*Gold 6430 / 512G / 8*3.84T', unit: '台',
    applicationBatch: '2026IDC', responsiblePerson: '116201-李娜', responsibleLeader: '100021-赵总', esOutboundAdmin: '114120-周敏', quantity: 1,
    assetStatus: '在库-待处理', company: '116.天津飞狐', plate: '集团', department: '技术部.基础设施组', costCenter: '技术部', businessLine: '基础设施',
    expenseAccount: '固定资产', mainAssetTag: '-', originalValue: 128000, tax: 16640, partQuantity: 2, partDesc: '电源模块@网卡', assetMark: '主资产', remark: '-',
    warehouse: 'I0001-资产集团总库（新媒体）', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '17F', room: 'IDC', locked: false,
    purchaseSource: true, poNo: 'PO2608050018', prNo: 'PR2607200042', purchaseSpecialist: '100502-采购专员B', service: '核心业务服务', noLocation: 'NO-A-12',
  },
  {
    id: 'asset-network-1', assetTag: 'AST-NET-26080003', sn: 'NET-SN-0003', materialDesc: 'Cisco.Nexus 9300', materialGroup: '1.资产',
    assetClass: '21.网络设备', assetSubClass: '网络设备', brand: 'Cisco', model: 'Nexus 9300', config: '48*10/25G + 6*100G', unit: '台',
    applicationBatch: '2026IDC', responsiblePerson: '116201-李娜', responsibleLeader: '100021-赵总', esOutboundAdmin: '114120-周敏', quantity: 1,
    assetStatus: '在库-新增', company: '116.天津飞狐', plate: '集团', department: '技术部.基础设施组', costCenter: '技术部', businessLine: '基础设施',
    expenseAccount: '固定资产', mainAssetTag: '-', originalValue: 86000, tax: 11180, partQuantity: 0, partDesc: '-', assetMark: '主资产', remark: '-',
    warehouse: 'I0001-资产集团总库（新媒体）', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '17F', room: 'IDC', locked: false,
    purchaseSource: true, poNo: 'PO2608050019', prNo: 'PR2607200043', purchaseSpecialist: '100502-采购专员B', service: '网络服务', noLocation: 'NO-A-12',
  },
  {
    id: 'asset-locked-1', assetTag: 'AST-LOCK-0001', sn: 'LOCK-SN-01', materialDesc: '锁定资产演示', materialGroup: '1.资产', assetClass: '10.电脑', assetSubClass: '笔记本电脑',
    brand: '联想', model: 'X1', config: '演示', unit: '台', applicationBatch: '2026Q3', responsiblePerson: '114111-杨芊', responsibleLeader: '100007-王总', esOutboundAdmin: '114120-周敏',
    quantity: 1, assetStatus: '在库-新增', company: '114.新媒体', plate: '集团', department: 'ES部.资产管理组', costCenter: 'ES部', businessLine: '媒体', expenseAccount: '固定资产',
    mainAssetTag: '-', originalValue: 9000, tax: 1170, partQuantity: 0, partDesc: '-', assetMark: '主资产', remark: '已被其他业务锁定', warehouse: 'I0001-资产集团总库（新媒体）',
    city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '15F', room: '1508', locked: true, purchaseSource: false, poNo: '', prNo: '', purchaseSpecialist: '', service: '', noLocation: '',
  },
];

const baseIssueLine = {
  department: 'ERP部.业务产品二组', company: '114.新媒体', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '15F', room: '1508',
  outboundStatus: '在用-使用中', costCenter: 'ERP部', businessLine: '研发', usage: '办公', usageDesc: '日常办公使用',
};

const INITIAL_ROWS = [
  {
    id: 1, documentNo: 'OS-202608070025', applicationNo: 'EUA-202607280002', status: '已完成', outboundType: '领用出库', warehouse: 'I1001-耗材库',
    outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 80, cardClaim: '是', poNo: 'PO2606150021', tag: '', responsiblePerson: '',
    sourceModule: '耗材领用', autoGenerated: true, materialKind: 'consumable', purchaseNoticeStatus: '成功', remark: '普通耗材自动出库',
    lines: [{ id: 'c-1', materialKind: 'consumable', materialGroup: '3.耗材', consumableClass: '办公耗材', materialDesc: 'A4打印纸', quantity: 80, assetTag: '', sn: '', issuePerson: '206984-何文', issueDate: '2026-08-07', outboundStatus: '已领用', purchaseSource: true, purchaseSpecialist: '100503-采购专员C', poNo: 'PO2606150021', prNo: 'PR2606100009' }],
  },
  {
    id: 2, documentNo: 'OS-202608070024', applicationNo: 'EUA-202607280001', status: '已完成', outboundType: '领用出库', warehouse: 'I0001-资产集团总库（新媒体）',
    outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: 'PO2607010008', tag: 'AST-2409010068', responsiblePerson: '114111-杨芊',
    sourceModule: '员工资产申领', autoGenerated: true, materialKind: 'asset', purchaseNoticeStatus: '失败', remark: '员工资产领用完成',
    lines: [{ id: 'a-1', ...ASSET_POOL[0], ...baseIssueLine, quantity: 1, issuePerson: '206984-何文', issueDate: '2026-08-07', person: '206984-何文' }],
  },
  {
    id: 3, documentNo: 'OS-202608070023', applicationNo: 'EUA-202607260018', status: '已完成', outboundType: '领用出库', warehouse: 'I1001-耗材库',
    outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: 'PO2606200030', tag: 'CON-26070018', responsiblePerson: '206984-何文',
    sourceModule: '耗材领用', autoGenerated: true, materialKind: 'durable', purchaseNoticeStatus: '成功', remark: '低值耐用品领用完成',
    lines: [{ id: 'd-1', materialKind: 'durable', materialGroup: '2.低值耐用品', consumableClass: '办公设备', materialDesc: '罗技.MX Keys键盘', quantity: 1, assetTag: 'CON-26070018', sn: 'MXK-0018', issuePerson: '206984-何文', issueDate: '2026-08-07', outboundStatus: '已领用', purchaseSource: true, purchaseSpecialist: '100503-采购专员C', poNo: 'PO2606200030', prNo: 'PR2606120012' }],
  },
  {
    id: 4, documentNo: 'OS-202608070004', applicationNo: 'EBA-202608050001', status: '已完成', outboundType: '借用出库', warehouse: 'I0013-资产集团前台库（新媒体）',
    outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', tag: 'AST-2409010072', responsiblePerson: '114111-杨芊',
    sourceModule: '员工资产借用', autoGenerated: true, materialKind: 'asset', remark: '借用出库自动生成',
    lines: [{ id: 'b-1', ...ASSET_POOL[1], warehouse: 'I0013-资产集团前台库（新媒体）', quantity: 1, person: '206984-何文', borrowPerson: '206984-何文', borrowDate: '2026-08-07', borrowReason: '活动', expectedReturnDate: '2026-09-07', outboundStatus: '在用-借用中', department: 'ERP部.业务产品二组', company: '114.新媒体', costCenter: 'ERP部', businessLine: '研发', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '15F', room: '1508', usage: '办公', usageDesc: '临时活动使用' }],
  },
  {
    id: 5, documentNo: 'OS-202609120001', applicationNo: '', status: '审批中', outboundType: '领用出库', warehouse: 'I0001-资产集团总库（新媒体）',
    outboundDate: '', createdDate: '2026-09-12', creator: CURRENT_USER, quantity: 1, cardClaim: '否', poNo: 'PO2607010008', tag: 'AST-2409010068', responsiblePerson: '114111-杨芊',
    sourceModule: '手工出库', autoGenerated: false, materialKind: 'asset', approvalRoute: '普通资产手工领用', currentApprovalIndex: 1,
    approvalSteps: [
      { key: 'owner', name: '责任人确认', approver: '114111-杨芊' },
      { key: 'leader', name: '责任人直属7级及以上领导审批', approver: '100007-王总' },
      { key: 'es', name: 'ES出库管理员确认', approver: '114120-周敏' },
    ],
    approvalHistory: [{ node: '责任人确认', handler: '114111-杨芊', action: '同意', time: '2026-09-12 10:20:18', opinion: '确认领用信息无误' }],
    approvalStartedAt: '2026-09-12 10:18:02', approvalInitiator: CURRENT_USER, remark: '普通资产手工出库审批演示',
    lines: [{ id: 'ma-1', ...ASSET_POOL[0], ...baseIssueLine, quantity: 1, issuePerson: '206984-何文', issueDate: '2026-09-12', person: '206984-何文' }],
  },
  {
    id: 6, documentNo: 'OS-202609120002', applicationNo: '', status: '审批中', outboundType: '领用出库', warehouse: 'I0001-资产集团总库（新媒体）',
    outboundDate: '', createdDate: '2026-09-12', creator: CURRENT_USER, quantity: 1, cardClaim: '否', poNo: 'PO2608050018', tag: 'AST-SRV-26080018', responsiblePerson: '116201-李娜',
    sourceModule: '手工出库', autoGenerated: false, materialKind: 'asset', approvalRoute: '机房资产手工领用', currentApprovalIndex: 0,
    approvalSteps: [{ key: 'leader', name: '责任人直属7级及以上领导审批', approver: '100021-赵总' }], approvalHistory: [],
    approvalStartedAt: '2026-09-12 11:02:40', approvalInitiator: CURRENT_USER, remark: '机房资产手工出库审批演示',
    lines: [{ id: 'mi-1', ...ASSET_POOL[2], department: '技术部.基础设施组', company: '116.天津飞狐', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '17F', room: 'IDC', outboundStatus: '在用-使用中', costCenter: '技术部', businessLine: '基础设施', usage: '机房', usageDesc: '机房部署', quantity: 1, issuePerson: '116201-李娜', issueDate: '2026-09-12', person: '116201-李娜' }],
  },
];

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function money(value) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function count(value) {
  return Number(value || 0).toLocaleString('zh-CN');
}

function LookupInput({ value, placeholder = '请选择', onClick, disabled = false }) {
  if (disabled) return <Readonly>{value}</Readonly>;
  return (
    <div className="cursor-pointer" onClick={onClick}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} />} />
    </div>
  );
}

function FieldLabel({ label, required }) {
  return <span>{label}{required && <span className="ml-0.5 text-red-500">*</span>}</span>;
}

function EditorField({ label, required = false, children, span = 1 }) {
  return <DetailItem label={<FieldLabel label={label} required={required} />} span={span}>{children}</DetailItem>;
}

function isInfraAsset(asset) {
  return INFRA_TYPES.has(asset?.assetSubClass);
}

function approvalRouteForLine(line) {
  return isInfraAsset(line) ? '机房资产手工领用' : '普通资产手工领用';
}

function sameApprovalChain(a, b) {
  if (!a || !b) return true;
  const routeA = approvalRouteForLine(a);
  const routeB = approvalRouteForLine(b);
  if (routeA !== routeB) return false;
  if (routeA === '机房资产手工领用') return a.responsibleLeader === b.responsibleLeader;
  return a.responsiblePerson === b.responsiblePerson
    && a.responsibleLeader === b.responsibleLeader
    && a.esOutboundAdmin === b.esOutboundAdmin;
}

function buildApprovalSteps(line) {
  if (isInfraAsset(line)) {
    return [{ key: 'leader', name: '责任人直属7级及以上领导审批', approver: line.responsibleLeader }];
  }
  return [
    { key: 'owner', name: '责任人确认', approver: line.responsiblePerson },
    { key: 'leader', name: '责任人直属7级及以上领导审批', approver: line.responsibleLeader },
    { key: 'es', name: 'ES出库管理员确认', approver: line.esOutboundAdmin },
  ];
}

function hasPurchaseSource(lines) {
  return (lines || []).some((line) => Boolean(line.purchaseSource));
}

function OutboundItemModal({ open, mode, warehouse, initialLine, existingLines, onCancel, onConfirm }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const isBorrow = mode === '借用出库';
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [asset, setAsset] = useState(initialLine ? { ...initialLine } : null);
  const initialPerson = initialLine?.person || initialLine?.issuePerson || initialLine?.borrowPerson || CURRENT_USER;
  const employee = EMPLOYEES.find((item) => item.value === initialPerson) || EMPLOYEES[0];
  const [form, setForm] = useState({
    person: initialPerson,
    department: initialLine?.department || employee.department,
    company: initialLine?.company || employee.company,
    city: initialLine?.city || employee.city,
    building: initialLine?.building || employee.building,
    floor: initialLine?.floor || employee.floor,
    room: initialLine?.room || '',
    outboundQty: initialLine?.quantity || 1,
    outboundStatus: initialLine?.outboundStatus || (isBorrow ? '在用-借用中' : '在用-使用中'),
    costCenter: initialLine?.costCenter || employee.costCenter,
    businessLine: initialLine?.businessLine || '0.*',
    outboundDate: initialLine?.issueDate || initialLine?.borrowDate || dayjs().format('YYYY-MM-DD'),
    usage: initialLine?.usage || '办公',
    reason: initialLine?.borrowReason || '',
    expectedReturnDate: initialLine?.expectedReturnDate || dayjs().add(1, 'month').format('YYYY-MM-DD'),
    usageDesc: initialLine?.usageDesc || '',
  });
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const chooseEmployee = (value) => {
    const next = EMPLOYEES.find((item) => item.value === value);
    if (!next) return;
    setForm((current) => ({
      ...current,
      person: value,
      department: next.department,
      company: next.company,
      costCenter: next.costCenter,
      city: next.city,
      building: next.building,
      floor: next.floor,
    }));
  };

  const changeCity = (value) => setForm((current) => ({ ...current, city: value, building: '', floor: '' }));
  const changeBuilding = (value) => setForm((current) => ({ ...current, building: value, floor: '' }));
  const buildingOptions = Object.keys(LOCATION_OPTIONS[form.city] || {});
  const floorOptions = (LOCATION_OPTIONS[form.city]?.[form.building] || []);

  const existingTags = useMemo(() => new Set(
    (existingLines || [])
      .filter((line) => line.id !== initialLine?.id)
      .map((line) => line.assetTag)
      .filter(Boolean),
  ), [existingLines, initialLine?.id]);

  const selectableAssets = useMemo(() => ASSET_POOL.filter((item) => (
    item.warehouse === warehouse
    && AVAILABLE_ASSET_STATUSES.has(item.assetStatus)
    && !item.locked
    && (!existingTags.has(item.assetTag) || item.assetTag === initialLine?.assetTag)
  )), [warehouse, existingTags, initialLine?.assetTag]);

  const selectorAssets = useMemo(() => selectableAssets.map((item) => ({
    ...item,
    brand: item.brand || String(item.materialDesc || '').split('.')[0] || '-',
    originalValueDisplay: money(item.originalValue),
  })), [selectableAssets]);

  const selectedAssetDisplay = asset
    ? [asset.assetTag, asset.sn, asset.materialDesc].filter(Boolean).join(' / ')
    : '';

  const validate = () => {
    if (!asset?.assetTag) return '请选择出库物资';
    if (!form.person) return `${isBorrow ? '借用人' : '领用人'}不能为空`;
    if (!form.outboundStatus) return '资产状态不能为空';
    if (!form.costCenter) return '成本中心不能为空';
    if (!form.city) return 'City不能为空';
    if (!form.building) return 'Building不能为空';
    if (!form.floor) return 'Floor不能为空';
    if (!form.usage) return '用途不能为空';
    if (!form.outboundDate) return `${isBorrow ? '借用日期' : '领用日期'}不能为空`;
    if (isBorrow && !form.reason.trim()) return '借用原因不能为空';
    if (isBorrow && !form.expectedReturnDate) return '预计归还日期不能为空';
    if (isBorrow && form.expectedReturnDate < form.outboundDate) return '预计归还日期不得早于借用日期';
    const first = existingLines?.find((line) => line.id !== initialLine?.id);
    if (first && !sameApprovalChain(first, asset)) return '所选资产与当前出库单审批路线不一致，请拆分出库单处理。';
    return '';
  };

  const submit = (keepOpen) => {
    const error = validate();
    if (error) return messageApi.warning(error);
    const total = Number(asset.originalValue || 0) + Number(asset.tax || 0);
    const payload = {
      ...asset,
      ...form,
      quantity: Number(form.outboundQty || asset.quantity || 1),
      person: form.person,
      issuePerson: isBorrow ? '' : form.person,
      borrowPerson: isBorrow ? form.person : '',
      issueDate: isBorrow ? '' : form.outboundDate,
      borrowDate: isBorrow ? form.outboundDate : '',
      borrowReason: isBorrow ? form.reason : '',
      outboundStatus: form.outboundStatus,
      total,
    };
    const accepted = onConfirm(payload, keepOpen);
    if (accepted === false) return undefined;
    if (keepOpen) setAsset(null);
    return undefined;
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={isBorrow ? '添加借用出库物资' : '添加领用出库物资'}
        width={960}
        onCancel={onCancel}
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={onCancel}>取消</Button>,
          <Button key="continue" onClick={() => submit(true)}>添加并继续</Button>,
          <Button key="close" type="primary" onClick={() => submit(false)}>添加并关闭</Button>,
        ]}
      >
        <Space direction="vertical" size={16} className="w-full">
          <Typography.Text>当前仓库：{warehouse}</Typography.Text>
          <Card size="small" title="选择物资">
            <DetailGrid columns={3} labelWidth={96}>
              <EditorField label="出库物资" required span={3}>
                <LookupInput
                  value={selectedAssetDisplay}
                  placeholder="请选择出库物资"
                  onClick={() => setSelectorOpen(true)}
                  disabled={Boolean(initialLine)}
                />
              </EditorField>
            </DetailGrid>
          </Card>

          <Card size="small" title="物资信息">
            <DetailGrid columns={3} labelWidth={96} >
              <EditorField label="资产标签号"><Readonly>{asset?.assetTag}</Readonly></EditorField>
              <EditorField label="SN号"><Readonly>{asset?.sn}</Readonly></EditorField>
              <EditorField label="物资说明"><Readonly>{asset?.materialDesc}</Readonly></EditorField>
              <EditorField label="物资大类"><Readonly>{asset?.assetClass}</Readonly></EditorField>
              <EditorField label="物资小类"><Readonly>{asset?.assetSubClass}</Readonly></EditorField>
              <EditorField label="品牌"><Readonly>{asset?.brand}</Readonly></EditorField>
              <EditorField label="规格型号"><Readonly>{asset?.model}</Readonly></EditorField>
              <EditorField label="配置"><Readonly>{asset?.config}</Readonly></EditorField>
              <EditorField label="计量单位"><Readonly>{asset?.unit}</Readonly></EditorField>
              <EditorField label="申请批次"><Readonly>{asset?.applicationBatch}</Readonly></EditorField>
              <EditorField label="责任人"><Readonly>{asset?.responsiblePerson}</Readonly></EditorField>
              <EditorField label="物资总类"><Readonly>{asset?.materialGroup}</Readonly></EditorField>
              <EditorField label="数量"><Readonly>{asset?.quantity}</Readonly></EditorField>
              <EditorField label="资产状态"><Readonly>{asset?.assetStatus}</Readonly></EditorField>
              <EditorField label="公司"><Readonly>{asset?.company}</Readonly></EditorField>
              <EditorField label="板块"><Readonly>{asset?.plate}</Readonly></EditorField>
              <EditorField label="成本中心"><Readonly>{asset?.costCenter}</Readonly></EditorField>
              <EditorField label="费用账户"><Readonly>{asset?.expenseAccount}</Readonly></EditorField>
              <EditorField label="主资产标签号"><Readonly>{asset?.mainAssetTag}</Readonly></EditorField>
              <EditorField label="原值"><Readonly>{asset ? money(asset.originalValue) : '-'}</Readonly></EditorField>
              <EditorField label="税金"><Readonly>{asset ? money(asset.tax) : '-'}</Readonly></EditorField>
              <EditorField label="总价"><Readonly>{asset ? money(Number(asset.originalValue || 0) + Number(asset.tax || 0)) : '-'}</Readonly></EditorField>
              <EditorField label="部件数量"><Readonly>{asset?.partQuantity}</Readonly></EditorField>
              <EditorField label="部件说明"><Readonly>{asset?.partDesc}</Readonly></EditorField>
              <EditorField label="资产标记"><Readonly>{asset?.assetMark}</Readonly></EditorField>
              <EditorField label="备注" span={3}><Readonly>{asset?.remark}</Readonly></EditorField>
            </DetailGrid>
          </Card>

          <Card size="small" title={isBorrow ? '借用出库' : '领用出库'}>
            <DetailGrid columns={3} labelWidth={96} >
              <EditorField label={isBorrow ? '借用人' : '领用人'} required>
                <Select className="w-full" value={form.person} options={EMPLOYEES.map(({ value, label }) => ({ value, label }))} onChange={chooseEmployee} />
              </EditorField>
              <EditorField label="部门"><Readonly>{form.department}</Readonly></EditorField>
              <EditorField label="公司"><Readonly>{form.company}</Readonly></EditorField>
              <EditorField label="资产状态" required>
                <Select className="w-full" value={form.outboundStatus} options={(isBorrow ? ['在用-借用中'] : ['在用-使用中']).map((value) => ({ label: value, value }))} onChange={(value) => set('outboundStatus', value)} />
              </EditorField>
              <EditorField label="出库数量"><Readonly>{asset?.quantity || form.outboundQty}</Readonly></EditorField>
              <EditorField label="成本中心" required><Select className="w-full" value={form.costCenter} options={COST_CENTERS.map((v) => ({ label: v, value: v }))} onChange={(v) => set('costCenter', v)} /></EditorField>
              <EditorField label="业务线"><Select className="w-full" allowClear value={form.businessLine || undefined} options={BUSINESS_LINES.map((v) => ({ label: v, value: v }))} onChange={(v) => set('businessLine', v || '')} /></EditorField>
              <EditorField label="City" required><Select className="w-full" value={form.city || undefined} options={Object.keys(LOCATION_OPTIONS).map((v) => ({ label: v, value: v }))} onChange={changeCity} /></EditorField>
              <EditorField label="Building" required><Select className="w-full" value={form.building || undefined} options={buildingOptions.map((v) => ({ label: v, value: v }))} onChange={changeBuilding} /></EditorField>
              <EditorField label="Floor" required><Select className="w-full" value={form.floor || undefined} options={floorOptions.map((v) => ({ label: v, value: v }))} onChange={(v) => set('floor', v)} /></EditorField>
              <EditorField label="Room"><Input value={form.room} onChange={(e) => set('room', e.target.value)} /></EditorField>
              {isBorrow && <EditorField label="借用原因" required><Input value={form.reason} onChange={(e) => set('reason', e.target.value)} /></EditorField>}
              <EditorField label="用途" required><Select className="w-full" value={form.usage} options={['办公', '测试', '机房', '部门公用'].map((v) => ({ label: v, value: v }))} onChange={(v) => set('usage', v)} /></EditorField>
              <EditorField label={isBorrow ? '借用日期' : '领用日期'} required><DatePicker className="w-full" value={form.outboundDate ? dayjs(form.outboundDate) : null} onChange={(d) => set('outboundDate', d?.format('YYYY-MM-DD') || '')} /></EditorField>
              {isBorrow && <EditorField label="预计归还日期" required><DatePicker className="w-full" value={form.expectedReturnDate ? dayjs(form.expectedReturnDate) : null} onChange={(d) => set('expectedReturnDate', d?.format('YYYY-MM-DD') || '')} /></EditorField>}
              <EditorField label="使用说明" span={3}><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={form.usageDesc} onChange={(e) => set('usageDesc', e.target.value)} /></EditorField>
            </DetailGrid>
          </Card>
        </Space>
      </Modal>

      <SelectModal
        open={selectorOpen}
        title="选择出库物资"
        width={960}
        dataSource={selectorAssets}
        initialSelectedKeys={asset ? [asset.id] : []}
        columns={[
          { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
          { title: 'SN号', dataIndex: 'sn', width: 150 },
          { title: '资产说明', dataIndex: 'materialDesc', width: 200 },
          { title: '公司', dataIndex: 'company', width: 130 },
          { title: '板块', dataIndex: 'plate', width: 100 },
          { title: '资产大类', dataIndex: 'assetClass', width: 120 },
          { title: '资产小类', dataIndex: 'assetSubClass', width: 130 },
          { title: '当前状态', dataIndex: 'assetStatus', width: 130 },
          { title: '当前仓库', dataIndex: 'warehouse', width: 230 },
          { title: '当前责任人', dataIndex: 'responsiblePerson', width: 140 },
        ]}
        searchFields={[
          { label: '资产标签号', name: 'assetTag', dataIndex: 'assetTag' },
          { label: 'SN号', name: 'sn', dataIndex: 'sn' },
          { label: '资产说明', name: 'materialDesc', dataIndex: 'materialDesc' },
          { label: '资产大类', name: 'assetClass', dataIndex: 'assetClass' },
          { label: '资产小类', name: 'assetSubClass', dataIndex: 'assetSubClass' },
          { label: '责任人', name: 'responsiblePerson', dataIndex: 'responsiblePerson' },
        ]}
        onCancel={() => setSelectorOpen(false)}
        onConfirm={(record) => {
          setAsset(record || null);
          setSelectorOpen(false);
        }}
      />
    </>
  );
}

function OutboundMaterialDetailModal({ open, row, outboundType, onCancel }) {
  if (!row) return null;
  const durable = row.materialKind === 'durable';
  const consumable = row.materialKind === 'consumable';
  const isBorrow = outboundType === '借用出库';
  if (durable || consumable) {
    return (
      <Modal open={open} title="出库物资信息" width={960} onCancel={onCancel} footer={null}>
        <Card size="small" title="耗材信息">
          <DetailGrid columns={3} labelWidth={112} minWidth={820}>
            <EditorField label={durable ? '耗材标签号' : '标签号'}><Readonly>{row.assetTag}</Readonly></EditorField>
            <EditorField label="SN号"><Readonly>{row.sn}</Readonly></EditorField>
            <EditorField label="耗材说明"><Readonly>{row.materialDesc}</Readonly></EditorField>
            <EditorField label="物资总类"><Readonly>{row.materialGroup}</Readonly></EditorField>
            <EditorField label="耗材大类"><Readonly>{row.consumableClass}</Readonly></EditorField>
            <EditorField label="数量"><Readonly>{row.quantity}</Readonly></EditorField>
            <EditorField label="领用人"><Readonly>{row.issuePerson}</Readonly></EditorField>
            <EditorField label="领用日期"><Readonly>{row.issueDate}</Readonly></EditorField>
            <EditorField label="耗材状态"><Readonly>{row.outboundStatus}</Readonly></EditorField>
            <EditorField label="PO单号"><Readonly>{row.poNo}</Readonly></EditorField>
            <EditorField label="PR单号"><Readonly>{row.prNo}</Readonly></EditorField>
            <EditorField label="采购专员"><Readonly>{row.purchaseSpecialist}</Readonly></EditorField>
          </DetailGrid>
        </Card>
      </Modal>
    );
  }

  return (
    <Modal open={open} title="出库物资信息" width={960} onCancel={onCancel} footer={null}>
      <Space direction="vertical" size={16} className="w-full">
        <Card size="small" title="物资信息">
          <DetailGrid columns={3} labelWidth={112} >
            <EditorField label="资产标签号"><Readonly>{row.assetTag}</Readonly></EditorField>
            <EditorField label="SN号"><Readonly>{row.sn}</Readonly></EditorField>
            <EditorField label="物资说明"><Readonly>{row.materialDesc}</Readonly></EditorField>
            <EditorField label="物资大类"><Readonly>{row.assetClass}</Readonly></EditorField>
            <EditorField label="物资小类"><Readonly>{row.assetSubClass}</Readonly></EditorField>
            <EditorField label="品牌"><Readonly>{row.brand}</Readonly></EditorField>
            <EditorField label="规格型号"><Readonly>{row.model}</Readonly></EditorField>
            <EditorField label="配置"><Readonly>{row.config}</Readonly></EditorField>
            <EditorField label="计量单位"><Readonly>{row.unit}</Readonly></EditorField>
            <EditorField label="申请批次"><Readonly>{row.applicationBatch}</Readonly></EditorField>
            <EditorField label="责任人"><Readonly>{row.responsiblePerson}</Readonly></EditorField>
            <EditorField label="物资总类"><Readonly>{row.materialGroup}</Readonly></EditorField>
            <EditorField label="数量"><Readonly>{row.quantity}</Readonly></EditorField>
            <EditorField label="资产状态"><Readonly>{row.assetStatus}</Readonly></EditorField>
            <EditorField label="公司"><Readonly>{row.company}</Readonly></EditorField>
            <EditorField label="板块"><Readonly>{row.plate}</Readonly></EditorField>
            <EditorField label="成本中心"><Readonly>{row.costCenter}</Readonly></EditorField>
            <EditorField label="费用账户"><Readonly>{row.expenseAccount}</Readonly></EditorField>
            <EditorField label="主资产标签号"><Readonly>{row.mainAssetTag}</Readonly></EditorField>
            <EditorField label="原值"><Readonly>{money(row.originalValue)}</Readonly></EditorField>
            <EditorField label="税金"><Readonly>{money(row.tax)}</Readonly></EditorField>
            <EditorField label="总价"><Readonly>{money(Number(row.originalValue || 0) + Number(row.tax || 0))}</Readonly></EditorField>
            <EditorField label="部件数量"><Readonly>{row.partQuantity}</Readonly></EditorField>
            <EditorField label="部件说明"><Readonly>{row.partDesc}</Readonly></EditorField>
            <EditorField label="资产标记"><Readonly>{row.assetMark}</Readonly></EditorField>
            {isInfraAsset(row) && <EditorField label="NO位置"><Readonly>{row.noLocation}</Readonly></EditorField>}
            {isInfraAsset(row) && <EditorField label="服务"><Readonly>{row.service}</Readonly></EditorField>}
            <EditorField label="备注" span={3}><Readonly>{row.remark}</Readonly></EditorField>
          </DetailGrid>
        </Card>
        <Card size="small" title={isBorrow ? '借用出库' : '领用出库'}>
          <DetailGrid columns={3} labelWidth={112}>
            <EditorField label={isBorrow ? '借用人' : '领用人'}><Readonly>{isBorrow ? row.borrowPerson : row.issuePerson}</Readonly></EditorField>
            <EditorField label="部门"><Readonly>{row.department}</Readonly></EditorField>
            <EditorField label="公司"><Readonly>{row.company}</Readonly></EditorField>
            <EditorField label="资产状态"><Readonly>{row.outboundStatus}</Readonly></EditorField>
            <EditorField label="出库数量"><Readonly>{row.quantity}</Readonly></EditorField>
            <EditorField label="成本中心"><Readonly>{row.costCenter}</Readonly></EditorField>
            <EditorField label="业务线"><Readonly>{row.businessLine}</Readonly></EditorField>
            <EditorField label="City"><Readonly>{row.city}</Readonly></EditorField>
            <EditorField label="Building"><Readonly>{row.building}</Readonly></EditorField>
            <EditorField label="Floor"><Readonly>{row.floor}</Readonly></EditorField>
            <EditorField label="Room"><Readonly>{row.room}</Readonly></EditorField>
            {isBorrow && <EditorField label="借用原因"><Readonly>{row.borrowReason}</Readonly></EditorField>}
            <EditorField label="用途"><Readonly>{row.usage}</Readonly></EditorField>
            <EditorField label={isBorrow ? '借用日期' : '领用日期'}><Readonly>{isBorrow ? row.borrowDate : row.issueDate}</Readonly></EditorField>
            {isBorrow && <EditorField label="预计归还日期"><Readonly>{row.expectedReturnDate}</Readonly></EditorField>}
            <EditorField label="使用说明" span={3}><Readonly>{row.usageDesc}</Readonly></EditorField>
          </DetailGrid>
        </Card>
      </Space>
    </Modal>
  );
}

function OutboundEditor({ source, onBack, onSave, onStartApproval, onApprove, onReject }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const outboundType = source?.outboundType || '领用出库';
  const [warehouse, setWarehouse] = useState(source?.warehouse || WAREHOUSES[0]);
  const [remark, setRemark] = useState(source?.remark || '');
  const [cardClaim, setCardClaim] = useState(source?.cardClaim || '否');
  const [lines, setLines] = useState(source?.lines || []);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [materialDetail, setMaterialDetail] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const documentNo = source?.documentNo || '保存后自动生成';
  const creator = source?.creator || CURRENT_USER;
  const status = source?.status || '草稿';
  const createdDate = source?.createdDate || dayjs().format('YYYY-MM-DD');
  const editable = status === '草稿';
  const approvalPending = status === '审批中';
  const materialKind = source?.materialKind || (lines.some((line) => line.materialKind === 'consumable') ? 'consumable' : lines.some((line) => line.materialKind === 'durable') ? 'durable' : 'asset');

  const tagLink = (value, row) => value
    ? <Button type="link" className="px-0 select-text" onClick={() => setMaterialDetail(row)}>{value}</Button>
    : '-';

  const issueColumns = materialKind === 'consumable' ? [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 },
    { title: '标签号', dataIndex: 'assetTag', width: 130, render: tagLink },
    { title: '物资总类', dataIndex: 'materialGroup', width: 120 },
    { title: '耗材大类', dataIndex: 'consumableClass', width: 130 },
    { title: '耗材说明', dataIndex: 'materialDesc', width: 200 },
    { title: '数量', dataIndex: 'quantity', width: 90, render: count },
    { title: '领用人', dataIndex: 'issuePerson', width: 140 },
    { title: '领用日期', dataIndex: 'issueDate', width: 120 },
    { title: '耗材状态', dataIndex: 'outboundStatus', width: 130 },
  ] : materialKind === 'durable' ? [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 },
    { title: '耗材标签号', dataIndex: 'assetTag', width: 160, render: tagLink },
    { title: 'SN序列号', dataIndex: 'sn', width: 150, render: (v) => v || '-' },
    { title: '物资总类', dataIndex: 'materialGroup', width: 120 },
    { title: '耗材大类', dataIndex: 'consumableClass', width: 130 },
    { title: '耗材说明', dataIndex: 'materialDesc', width: 200 },
    { title: '数量', dataIndex: 'quantity', width: 90, render: count },
    { title: '领用人', dataIndex: 'issuePerson', width: 140 },
    { title: '领用日期', dataIndex: 'issueDate', width: 120 },
    { title: '耗材状态', dataIndex: 'outboundStatus', width: 130 },
  ] : [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160, render: tagLink },
    { title: 'SN序列号', dataIndex: 'sn', width: 150 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 200 },
    { title: '数量', dataIndex: 'quantity', width: 90, render: count },
    { title: '领用人', dataIndex: 'issuePerson', width: 140 },
    { title: '领用日期', dataIndex: 'issueDate', width: 120 },
    { title: '资产标记', dataIndex: 'assetMark', width: 100 },
    { title: '资产状态', dataIndex: 'outboundStatus', width: 130 },
    ...(editable ? [{ title: '操作', width: 80, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => { setEditingLine(row); setLineModalOpen(true); }}>编辑</Button> }] : []),
  ];

  const borrowColumns = [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160, render: tagLink },
    { title: 'SN序列号', dataIndex: 'sn', width: 150 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 200 },
    { title: '数量', dataIndex: 'quantity', width: 90, render: count },
    { title: '借用日期', dataIndex: 'borrowDate', width: 120 },
    { title: '借用人', dataIndex: 'borrowPerson', width: 140 },
    { title: '借用原因', dataIndex: 'borrowReason', width: 180 },
    { title: '资产标记', dataIndex: 'assetMark', width: 100 },
    { title: '资产状态', dataIndex: 'outboundStatus', width: 130 },
  ];

  const payload = () => ({
    outboundType,
    warehouse,
    remark,
    cardClaim,
    quantity: lines.reduce((sum, row) => sum + Number(row.quantity || 0), 0),
    materialKind: lines.some((line) => line.materialKind === 'consumable') ? 'consumable' : lines.some((line) => line.materialKind === 'durable') ? 'durable' : 'asset',
    lines,
  });

  const saveLine = (row, keepOpen) => {
    const first = lines.find((item) => item.id !== editingLine?.id);
    if (first && !sameApprovalChain(first, row)) {
      messageApi.error('所选资产与当前出库单审批路线不一致，请拆分出库单处理。');
      return false;
    }
    if (editingLine) {
      setLines((current) => current.map((item) => item.id === editingLine.id ? { ...row, id: editingLine.id } : item));
      setEditingLine(null);
      setLineModalOpen(false);
      messageApi.success('出库物资已更新');
      return true;
    }
    setLines((current) => [...current, { ...row, id: `${Date.now()}-${current.length + 1}` }]);
    if (!keepOpen) setLineModalOpen(false);
    messageApi.success(keepOpen ? '物资已添加，可继续选择下一件资产' : '物资已添加');
    return true;
  };

  const deleteLines = () => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要删除的物资');
    Modal.confirm({
      title: '确认删除所选出库物资？',
      content: '删除仅影响当前草稿，不会修改资产台账或产生库存事务。',
      okText: '删除', okButtonProps: { danger: true }, cancelText: '取消',
      onOk: () => {
        const selected = new Set(selectedKeys);
        setLines((current) => current.filter((row) => !selected.has(row.id)));
        setSelectedKeys([]);
        messageApi.success('已删除所选出库物资');
      },
    });
    return undefined;
  };

  const changeWarehouse = (value) => {
    if (!lines.length) return setWarehouse(value);
    Modal.confirm({
      title: '切换当前仓库？',
      content: '切换仓库后当前已添加物资将被清空，是否继续？',
      okText: '切换', cancelText: '取消',
      onOk: () => { setWarehouse(value); setLines([]); setSelectedKeys([]); },
    });
    return undefined;
  };

  const validateBeforeSubmit = () => {
    if (!lines.length) return '请先添加待出库物资';
    if (!warehouse) return '请选择当前仓库';
    if (lines.some((line) => line.warehouse && line.warehouse !== warehouse)) return '资产不在当前库，请先执行移库操作！';
    if (lines.some((line) => Number(line.quantity || 0) <= 0)) return '出库数量必须大于0';
    if (lines.some((line) => !AVAILABLE_ASSET_STATUSES.has(line.assetStatus))) return '存在资产状态不允许出库，请重新选择';
    if (lines.some((line) => line.locked)) return '存在已被其他业务锁定的资产，请重新选择';
    if (lines.some((line) => !line.person || !line.costCenter || !line.city || !line.building || !line.floor || !line.usage || !(line.issueDate || line.borrowDate))) return '请检查所有必填项及内容格式';
    const first = lines[0];
    if (lines.some((line) => !sameApprovalChain(first, line))) return '所选资产对应的责任审批链不一致，请拆分出库单后重新提交。';
    return '';
  };

  const startApproval = () => {
    const error = validateBeforeSubmit();
    if (error) return messageApi.warning(error);
    onStartApproval(payload());
    return undefined;
  };

  const importSample = () => {
    const sample = ASSET_POOL.find((asset) => asset.warehouse === warehouse && !asset.locked && AVAILABLE_ASSET_STATUSES.has(asset.assetStatus) && (!lines[0] || sameApprovalChain(lines[0], asset)));
    if (!sample) return messageApi.error('当前仓库没有符合本单审批路线的可导入资产');
    const employeeOption = EMPLOYEES[0];
    setLines((current) => [...current, {
      ...sample,
      id: `import-${Date.now()}`,
      person: employeeOption.value,
      issuePerson: employeeOption.value,
      issueDate: dayjs().format('YYYY-MM-DD'),
      department: employeeOption.department,
      company: employeeOption.company,
      outboundStatus: '在用-使用中',
      costCenter: employeeOption.costCenter,
      businessLine: '研发',
      city: employeeOption.city,
      building: employeeOption.building,
      floor: employeeOption.floor,
      room: '',
      usage: '办公',
      usageDesc: 'Excel导入演示',
      quantity: 1,
    }]);
    setImportOpen(false);
    messageApi.success('Excel导入校验通过，已导入1条物资');
    return undefined;
  };

  return (
    <Space direction="vertical" size={16} className="w-full" data-page-view-key={`outbound-${status}-${outboundType}`}>
      {contextHolder}
      <PageTitle>出库单</PageTitle>
      <Card size="small" title="出库单信息">
        <DetailGrid columns={3} labelWidth={112}>
          <EditorField label="出库单号"><Readonly>{documentNo}</Readonly></EditorField>
          <EditorField label="单据类型"><Readonly>出库工单</Readonly></EditorField>
          <EditorField label="出库类型"><Readonly>{outboundType}</Readonly></EditorField>
          <EditorField label="制单人"><Readonly>{creator}</Readonly></EditorField>
          <EditorField label="制单时间"><Readonly>{createdDate}</Readonly></EditorField>
          <EditorField label="是否刷卡领用">{editable ? <Select className="w-full" value={cardClaim} options={['是', '否'].map((v) => ({ label: v, value: v }))} onChange={setCardClaim} /> : <Readonly>{cardClaim}</Readonly>}</EditorField>
          <EditorField label="当前仓库">{editable ? <Select className="w-full" value={warehouse} options={WAREHOUSES.filter((v) => !v.includes('耗材库')).map((v) => ({ label: v, value: v }))} onChange={changeWarehouse} /> : <Readonly>{warehouse}</Readonly>}</EditorField>
          <EditorField label="备注" span={3}>{editable ? <TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={remark} onChange={(e) => setRemark(e.target.value)} /> : <Readonly>{remark}</Readonly>}</EditorField>
        </DetailGrid>
      </Card>

      <Card size="small" title="出库物资" extra={<Space><Typography.Text type="secondary">共 {lines.length} 条</Typography.Text>{editable && <Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditingLine(null); setLineModalOpen(true); }}>添加物资</Button>}{editable && lines.length > 0 && <Button danger icon={<Trash2 size={14} />} onClick={deleteLines}>删除物资</Button>}{editable && <Button icon={<Download size={14} />} onClick={() => messageApi.success('手工领用出库模板已生成（原型）')}>模板下载</Button>}{editable && <Button icon={<Upload size={14} />} onClick={() => setImportOpen(true)}>Excel导入</Button>}</Space>}>
        <Table rowKey="id" size="small" bordered columns={outboundType === '借用出库' ? borrowColumns : issueColumns} dataSource={lines} rowSelection={editable ? { selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true } : undefined} scroll={{ x: 'max-content' }} pagination={false} />
      </Card>

      {!approvalPending && <div className="flex justify-center gap-3">
        {editable && <Button onClick={() => onSave(payload())}>保存草稿</Button>}
        {editable && <Button type="primary" onClick={startApproval}>执行出库</Button>}
        {!editable && <Button type="primary" icon={<Printer size={14} />} onClick={() => messageApi.success('出库单打印预览已打开（原型）')}>打印</Button>}
        <Button onClick={onBack}>返回</Button>
      </div>}
      {approvalPending && <div className="flex justify-center"><Button onClick={onBack}>返回</Button></div>}

      {editable && <OutboundItemModal
        key={`${outboundType}-${editingLine?.id || 'new'}-${lineModalOpen}`}
        open={lineModalOpen}
        mode={outboundType}
        warehouse={warehouse}
        initialLine={editingLine}
        existingLines={lines}
        onCancel={() => { setLineModalOpen(false); setEditingLine(null); }}
        onConfirm={saveLine}
      />}
      <OutboundMaterialDetailModal open={Boolean(materialDetail)} row={materialDetail} outboundType={outboundType} onCancel={() => setMaterialDetail(null)} />
      <Modal open={importOpen} title="Excel导入校验（原型）" onCancel={() => setImportOpen(false)} footer={[
        <Button key="cancel" onClick={() => setImportOpen(false)}>取消</Button>,
        <Button key="error" onClick={() => Modal.error({ title: 'Excel导入校验失败', content: '第2行｜资产标签号｜资产不属于当前仓库；第4行｜资产状态｜当前资产不可出库。' })}>查看错误示例</Button>,
        <Button key="ok" type="primary" onClick={importSample}>模拟校验通过</Button>,
      ]}><Typography.Paragraph>模板字段会校验当前仓库、资产标签号、资产状态、业务锁定和必填领用字段。请选择演示结果。</Typography.Paragraph></Modal>
    </Space>
  );
}

export default function OutboundPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [view, setView] = useState('list');
  const [activeRow, setActiveRow] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const emptyFilters = { documentNo: '', outboundType: '', status: '', poNo: '', applicationNo: '', tag: '', creator: '', createdFrom: '', createdTo: '', responsiblePerson: '' };
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, filters.documentNo)
    && (!filters.outboundType || row.outboundType === filters.outboundType)
    && (!filters.status || row.status === filters.status)
    && includesText(row.poNo, filters.poNo)
    && includesText(row.applicationNo, filters.applicationNo)
    && (!filters.tag || includesText(row.tag, filters.tag) || (row.lines || []).some((line) => includesText(line.assetTag, filters.tag)))
    && includesText(row.creator, filters.creator)
    && (!filters.responsiblePerson || includesText(row.responsiblePerson, filters.responsiblePerson) || (row.lines || []).some((line) => includesText(line.responsiblePerson, filters.responsiblePerson)))
    && (!filters.createdFrom || row.createdDate >= filters.createdFrom)
    && (!filters.createdTo || row.createdDate <= filters.createdTo)
  )), [rows, filters]);

  const openEditor = (row = null) => {
    setActiveRow(row);
    setView('editor');
  };

  const openApprovalHistory = (row) => {
    setActiveRow(row);
    setView('approvalHistory');
  };

  const buildRow = (payload, status) => {
    const numericIds = rows.map((row) => Number(row.id)).filter(Number.isFinite);
    const id = Math.max(0, ...numericIds) + 1;
    return {
      id,
      documentNo: `OS-${dayjs().format('YYYYMMDD')}${String(id).padStart(4, '0')}`,
      applicationNo: '',
      status,
      outboundType: payload.outboundType,
      warehouse: payload.warehouse,
      outboundDate: status === '已完成' ? dayjs().format('YYYY-MM-DD') : '',
      createdDate: dayjs().format('YYYY-MM-DD'),
      creator: CURRENT_USER,
      quantity: payload.quantity,
      cardClaim: payload.cardClaim,
      poNo: payload.lines[0]?.poNo || '',
      tag: payload.lines[0]?.assetTag || '',
      responsiblePerson: payload.lines[0]?.responsiblePerson || '',
      remark: payload.remark,
      lines: payload.lines,
      materialKind: payload.materialKind || 'asset',
      sourceModule: '手工出库',
      autoGenerated: false,
    };
  };

  const saveDraft = (payload) => {
    if (activeRow) {
      const updated = { ...activeRow, ...payload, status: '草稿' };
      setRows((current) => current.map((row) => row.id === activeRow.id ? updated : row));
      setActiveRow(updated);
      messageApi.success('出库单草稿已保存');
      return;
    }
    const created = buildRow(payload, '草稿');
    setRows((current) => [created, ...current]);
    setActiveRow(created);
    messageApi.success(`已生成出库单 ${created.documentNo}`);
  };

  const startApproval = (payload) => {
    const first = payload.lines[0];
    const steps = buildApprovalSteps(first);
    const base = activeRow ? { ...activeRow, ...payload } : buildRow(payload, '草稿');
    const updated = {
      ...base,
      status: '审批中',
      approvalRoute: approvalRouteForLine(first),
      approvalSteps: steps,
      currentApprovalIndex: 0,
      approvalHistory: base.approvalHistory || [],
      approvalInitiator: CURRENT_USER,
      approvalStartedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    setRows((current) => activeRow ? current.map((row) => row.id === activeRow.id ? updated : row) : [updated, ...current]);
    setActiveRow(updated);
    setView('approval');
    messageApi.success(`审批已发起，当前节点：${steps[0].name}`);
  };

  const approveCurrent = (opinion) => {
    if (!activeRow || activeRow.status !== '审批中') return;
    const index = activeRow.currentApprovalIndex || 0;
    const step = activeRow.approvalSteps[index];
    const history = [...(activeRow.approvalHistory || []), { node: step.name, handler: step.approver, action: '同意', time: dayjs().format('YYYY-MM-DD HH:mm:ss'), opinion: opinion || '同意' }];
    const last = index >= activeRow.approvalSteps.length - 1;
    const updated = last ? {
      ...activeRow,
      status: '已完成',
      outboundDate: dayjs().format('YYYY-MM-DD'),
      approvalHistory: history,
      purchaseNoticeStatus: hasPurchaseSource(activeRow.lines) ? '失败' : undefined,
      inventoryResult: '已更新资产/库存及事务（原型）',
    } : { ...activeRow, currentApprovalIndex: index + 1, approvalHistory: history };
    setRows((current) => current.map((row) => row.id === activeRow.id ? updated : row));
    setActiveRow(updated);
    if (last) messageApi.success(hasPurchaseSource(activeRow.lines) ? '审批完成并正式出库；采购专员通知发送失败，可重新发送' : '审批完成并正式出库');
    else messageApi.success(`审批通过，进入下一节点：${updated.approvalSteps[updated.currentApprovalIndex].name}`);
  };

  const rejectCurrent = (opinion) => {
    if (!activeRow || activeRow.status !== '审批中') return;
    const index = activeRow.currentApprovalIndex || 0;
    const step = activeRow.approvalSteps[index];
    const updated = {
      ...activeRow,
      status: '草稿',
      approvalHistory: [...(activeRow.approvalHistory || []), { node: step.name, handler: step.approver, action: '驳回', time: dayjs().format('YYYY-MM-DD HH:mm:ss'), opinion }],
      currentApprovalIndex: 0,
    };
    setRows((current) => current.map((row) => row.id === activeRow.id ? updated : row));
    setActiveRow(updated);
    setView('editor');
    messageApi.warning('审批已驳回，出库单恢复为草稿，可修改后重新提交');
  };

  if (view === 'approvalHistory') {
    return (
      <OutboundApprovalHistoryPage
        outbound={activeRow}
        onBack={() => { setView('list'); setActiveRow(null); }}
      />
    );
  }

  if (view === 'approval') {
    return (
      <OutboundApprovalPage
        outbound={activeRow}
        onApprove={approveCurrent}
        onReject={rejectCurrent}
        onBack={() => { setView('list'); setActiveRow(null); }}
      />
    );
  }

  if (view === 'editor') {
    return <OutboundEditor source={activeRow} onBack={() => { setView('list'); setActiveRow(null); }} onSave={saveDraft} onStartApproval={startApproval} onApprove={approveCurrent} onReject={rejectCurrent} />;
  }

  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => (page - 1) * pageSize + index + 1 },
    { title: '出库单号', dataIndex: 'documentNo', width: 190, render: (value, row) => <Button type="link" className="px-0 select-text" onClick={() => openEditor(row)}>{value}</Button> },
    { title: '申请单号', dataIndex: 'applicationNo', width: 210, render: (value) => value || '-' },
    {
      title: '单据状态',
      dataIndex: 'status',
      width: 120,
      render: (value, row) => (
        <Button type="link" className="px-0" onClick={() => openApprovalHistory(row)}>
          <StatusTag value={value} />
        </Button>
      ),
    },
    { title: '出库类型', dataIndex: 'outboundType', width: 130 },
    { title: '出库仓库', dataIndex: 'warehouse', width: 280 },
    { title: '出库时间', dataIndex: 'outboundDate', width: 130, render: (value) => value || '-' },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right', render: count },
    { title: '是否刷卡领用', dataIndex: 'cardClaim', width: 130, render: (value) => <StatusTag value={value} /> },
  ];

  const deleteRows = () => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要删除的出库单');
    const selectedRows = rows.filter((row) => selectedKeys.includes(row.id));
    if (selectedRows.some((row) => row.status !== '草稿')) return messageApi.warning('仅草稿出库单允许删除');
    Modal.confirm({
      title: '确认删除所选出库单？',
      content: '删除草稿不会产生正式库存或资产台账变化。',
      okText: '删除', okButtonProps: { danger: true }, cancelText: '取消',
      onOk: () => {
        const selected = new Set(selectedKeys);
        setRows((current) => current.filter((row) => !selected.has(row.id)));
        setSelectedKeys([]);
        messageApi.success('已删除所选草稿出库单');
      },
    });
    return undefined;
  };

  const printRows = (type) => {
    if (!selectedKeys.length) return messageApi.warning(`请先选择需要${type}的出库单`);
    const selectedRows = rows.filter((row) => selectedKeys.includes(row.id));
    if (selectedRows.some((row) => row.status !== '已完成')) return messageApi.warning('仅已完成出库单允许打印');
    messageApi.success(`${type}预览已打开，共 ${selectedRows.length} 张；领用出库和借用出库均支持领用打印（原型）`);
    return undefined;
  };

  return (
    <Space direction="vertical" size={16} className="w-full" data-page-view-key="outbound-list">
      {contextHolder}
      <PageTitle>出库</PageTitle>
      <QueryBar onQuery={() => { setFilters({ ...draft }); setSelectedKeys([]); setPage(1); }} onReset={() => { setDraft(emptyFilters); setFilters(emptyFilters); setSelectedKeys([]); setPage(1); }}>
        <QueryItem label="出库单号"><Input value={draft.documentNo} allowClear placeholder="请输入出库单号" onChange={(e) => update('documentNo', e.target.value)} /></QueryItem>
        <QueryItem label="出库类型"><Select className="w-full" value={draft.outboundType || undefined} allowClear placeholder="全部" options={OUTBOUND_TYPES.map((v) => ({ label: v, value: v }))} onChange={(v) => update('outboundType', v)} /></QueryItem>
        <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={OUTBOUND_STATUSES.map((v) => ({ label: v, value: v }))} onChange={(v) => update('status', v)} /></QueryItem>
        <QueryItem label="PO单号"><Input value={draft.poNo} allowClear placeholder="请输入PO单号" onChange={(e) => update('poNo', e.target.value)} /></QueryItem>
        <QueryItem label="申请单号"><Input value={draft.applicationNo} allowClear placeholder="请输入申请单号" onChange={(e) => update('applicationNo', e.target.value)} /></QueryItem>
        <QueryItem label="标签号"><Input value={draft.tag} allowClear placeholder="请输入资产/耗材标签号" onChange={(e) => update('tag', e.target.value)} /></QueryItem>
        <QueryItem label="制单人"><Input value={draft.creator} allowClear placeholder="请输入制单人" onChange={(e) => update('creator', e.target.value)} /></QueryItem>
        <QueryItem label="制单日期"><RangePicker className="w-full" value={[draft.createdFrom ? dayjs(draft.createdFrom) : null, draft.createdTo ? dayjs(draft.createdTo) : null]} onChange={(dates) => { update('createdFrom', dates?.[0]?.format('YYYY-MM-DD') || ''); update('createdTo', dates?.[1]?.format('YYYY-MM-DD') || ''); }} /></QueryItem>
        <QueryItem label="资产责任人"><Input value={draft.responsiblePerson} allowClear placeholder="请输入资产责任人" onChange={(e) => update('responsiblePerson', e.target.value)} /></QueryItem>
      </QueryBar>

      <Card size="small" title="出库单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => openEditor()}>创建</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={deleteRows}>删除</Button>
            <Button icon={<Printer size={14} />} onClick={() => printRows('出库打印')}>出库打印</Button>
            <Button icon={<Printer size={14} />} onClick={() => printRows('领用打印')}>领用打印</Button>
            <Button icon={<Download size={14} />} onClick={() => messageApi.success(`已导出当前查询结果 ${filteredRows.length} 条（原型）`)}>导出</Button>
          </Space>
        </div>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }}
          scroll={{ x: 'max-content' }}
          pagination={{ current: page, pageSize, showSizeChanger: true, onChange: (nextPage, nextSize) => { if (nextSize !== pageSize) { setPageSize(nextSize); setPage(1); } else setPage(nextPage); } }}
        />
      </Card>
    </Space>
  );
}
