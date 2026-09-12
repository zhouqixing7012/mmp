import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { Search, Trash2 } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const PO_ROWS = [
  { id: 1, poNo: 'PO2608200004', receiptStatus: '待接收', poName: '电子设备采购订单', company: '北京新动力', plate: '搜狐网-web', supplier: '老六的公司', pushDate: '2026-08-20', purchaseType: '电子设备' },
  { id: 2, poNo: 'PO2410280002', receiptStatus: '待接收', poName: '服务器备件采购订单', company: '新媒体', plate: '', supplier: '上海华讯网络系统有限公司', pushDate: '2024-10-30', purchaseType: '服务器备件' },
  { id: 3, poNo: 'PO2103040001', receiptStatus: '待接收', poName: '服务器采购订单', company: '新媒体', plate: '', supplier: '北京亚康环宇科技有限公司', pushDate: '2021-06-08', purchaseType: '服务器' },
  { id: 4, poNo: 'PO2606030001', receiptStatus: '已入库', poName: '电子设备采购订单', company: '新媒体', plate: 'Corporate', supplier: '北京汉信成科技发展有限公司', pushDate: '2026-06-08', purchaseType: '电子设备' },
  { id: 5, poNo: 'PO2606020006', receiptStatus: '已入库', poName: '电子设备采购订单', company: '天津飞狐', plate: '视频', supplier: '北京荣泽嘉业商贸有限公司', pushDate: '2026-06-02', purchaseType: '电子设备' },
  { id: 6, poNo: 'PO2606020005', receiptStatus: '已入库', poName: '电子设备采购订单', company: '天津飞狐', plate: '视频', supplier: '北京一新科技有限责任公司', pushDate: '2026-06-05', purchaseType: '电子设备' },
  { id: 7, poNo: 'PO2606020004', receiptStatus: '已入库', poName: '电子设备采购订单', company: '北京新动力', plate: '视频', supplier: '北京汉信成科技发展有限公司', pushDate: '2026-06-08', purchaseType: '电子设备' },
  { id: 8, poNo: 'PO2606020003', receiptStatus: '已入库', poName: '电子设备采购订单', company: '天津飞狐', plate: '视频', supplier: '北京美捷美科技有限公司', pushDate: '2026-06-08', purchaseType: '电子设备' },
  { id: 9, poNo: 'PO2606020002', receiptStatus: '已入库', poName: '电子设备采购订单', company: '北京新动力', plate: '视频', supplier: '华盛天诚（北京）科技有限公司', pushDate: '2026-07-20', purchaseType: '电子设备' },
  { id: 10, poNo: 'PO2606020001', receiptStatus: '已入库', poName: '电子设备采购订单', company: '天津飞狐', plate: '视频', supplier: '北京汉信成科技有限公司', pushDate: '2026-06-08', purchaseType: '电子设备' },
  { id: 11, poNo: 'PO2410230001', receiptStatus: '待接收', poName: '电子设备采购订单', company: '北京新动力', plate: 'Corporate', supplier: '老六的公司', pushDate: '2024-10-23', purchaseType: '电子设备' },
];

const ELECTRONIC_PO_DETAIL = {
  supplierPhone: '-',
  procurementUnit: '北京新动力',
  contractSubject: '北京搜狐新动力信息技术有限公司',
  untaxedAmount: '123.76',
  taxAmount: '1.24',
  totalAmount: '125.00',
  buyer: '114664.薛毛毛',
  buyerPhone: '18911208538',
  department: '商务采购组',
  orderDate: '2026-08-20',
  items: [
    { id: 1, editable: false, receiptStatus: '已入库', materialGroup: '1.资产', assetClass: '13.OFFICE EQUIPMENT', materialCode: '113028079006000', materialDesc: '曼富图.MVR901EPEX变焦手柄', poDesc: '曼富图.MVR901EPEX变焦手柄-16+512', config: '16+512', partQuantity: '-', partDesc: '-', currentReceiptQty: 0, purchaseQty: 1, untaxedUnitPrice: '-', untaxedSubtotal: '-', totalTax: '-', taxedUnitPrice: '-', taxedSubtotal: '-', taxRate: '-', receivedQty: 1, draftQty: 0, agreedArrivalDate: '-', prLineNo: '-', saLineNo: '-', applicationNo: '-', department: '-', businessLine: '-' },
    { id: 2, editable: true, receiptStatus: '待接收', materialGroup: '1.资产', assetClass: '13.OFFICE EQUIPMENT', materialCode: '113004066005000', materialDesc: '魅族.魅族 MX4 PRO(联通版)', poDesc: '魅族.魅族 MX4 PRO(联通版)-16+512', config: '16+512', partQuantity: '-', partDesc: '-', currentReceiptQty: 1, purchaseQty: 1, untaxedUnitPrice: '-', untaxedSubtotal: '-', totalTax: '-', taxedUnitPrice: '-', taxedSubtotal: '-', taxRate: '-', receivedQty: 0, draftQty: 0, agreedArrivalDate: '-', prLineNo: '-', saLineNo: '-', applicationNo: '-', department: '-', businessLine: '-' },
  ],
};

const MAINTENANCE_PO_DETAIL = {
  ...ELECTRONIC_PO_DETAIL,
  supplierPhone: '',
  department: '商务采购组',
  orderDate: '2024-10-23',
  items: [
    { id: 1, editable: false, receiptStatus: '待接收', materialGroup: '1.资产', assetClass: '13.OFFICE EQUIPMENT', materialCode: '113004066005000', materialDesc: 'AVAYA.AVAYA扩容套件', poDesc: 'AVAYA.AVAYA扩容套件', config: '8+256', partQuantity: '-', partDesc: '-', currentReceiptQty: 0, purchaseQty: 2, untaxedUnitPrice: '1.00', untaxedSubtotal: '2.00', totalTax: '198.98', taxedUnitPrice: '99.99', taxedSubtotal: '199.98', taxRate: '1%', receivedQty: 0, draftQty: 2, agreedArrivalDate: '2024-10-23', prLineNo: '', saLineNo: 'SA2408110001-10', applicationNo: '', department: '商务采购组', businessLine: '' },
  ],
};

const SERVER_PO_DETAIL = {
  supplierPhone: '1058834065',
  procurementUnit: '新媒体',
  contractSubject: '北京搜狐新媒体信息技术有限公司',
  untaxedAmount: '49,800.77',
  taxAmount: '6,474.10',
  totalAmount: '56,274.87',
  buyer: '114664.薛毛毛',
  buyerPhone: '010-62728109',
  department: '-',
  orderDate: '2021-06-08',
  items: [
    { id: 1, editable: true, receiptStatus: '待接收', materialGroup: '1.资产', assetClass: '14.SERVER', materialCode: '114008042010000', materialDesc: 'Dell.R740', poDesc: 'Dell.R740-Intel Silver4210*2,DDR4_2933MHz_16G*8,Seagate_SAS12Gb_2.5寸_10k_600GB*8,双口千兆+双光口万兆(Intel X710)*1,H740P_电池*1,白金750W热插拔*2,2U2.5寸8盘位机箱*1', config: 'Intel Silver4210*2,DDR4_2933MHz_16G*8,Seagate_SAS12Gb_2.5寸_10k_600GB*8,双口千兆+双光口万兆(Intel X710)*1,H740P_电池*1,白金750W热插拔*2,2U2.5寸8盘位机箱*1', partQuantity: '-', partDesc: '-', currentReceiptQty: 1, purchaseQty: 1, untaxedUnitPrice: '-', untaxedSubtotal: '-', totalTax: '-', taxedUnitPrice: '-', taxedSubtotal: '-', taxRate: '-', receivedQty: 0, draftQty: 0, agreedArrivalDate: '-', prLineNo: '-', saLineNo: '-', applicationNo: '', department: '-', businessLine: '', noLocation: '北京.搜狐网络大厦.5F' },
  ],
};

const INITIAL_DRAFT_ITEM = { ...MAINTENANCE_PO_DETAIL.items[0], currentReceiptQty: 2, editable: true };
const RECEIPT_ROWS = [
  { id: 1, receiptNo: 'REC-202606110001', status: '已完成', poNo: 'PO2606030001', supplier: '北京汉信成科技发展有限公司', creator: '王英', createdAt: '2026-06-11 16:23:59', receiver: '王英', receiptAt: '2026-06-11 16:30:12', plate: 'Corporate', applicationBatch: '', inboundOrderNo: 'PI-202606110001' },
  { id: 2, receiptNo: 'REC-202608200001', status: '已完成', poNo: 'PO2608200004', supplier: '老六的公司', creator: 'admin-系统管理员', createdAt: '2026-08-20 15:30:00', receiver: 'admin-系统管理员', receiptAt: '2026-08-20 15:36:20', plate: '搜狐网-web', applicationBatch: '', inboundOrderNo: 'PI-202608200002' },
  { id: 3, receiptNo: 'REC-202608110002', status: '草稿', poNo: 'PO2410230001', supplier: '老六的公司', creator: 'admin-系统管理员', createdAt: '2026-08-11 10:00:00', receiver: '', receiptAt: '', plate: 'Corporate', applicationBatch: '2026Q3', itemIds: [1], items: [INITIAL_DRAFT_ITEM] },
];

const EMPTY_PO_FILTERS = { company: '', plate: '', poNo: '', supplier: '', receiptStatus: '', purchaseType: '' };
const EMPTY_RECEIPT_FILTERS = { receiptNo: '', poNo: '', status: '', creator: '', createdFrom: '', createdTo: '', supplier: '' };
const DIRECT_INBOUND_TYPES = new Set(['服务器', '服务器备件', '网络设备', '网络设备备件']);
const GENERATED_INBOUND_STORAGE_KEY = 'mmp.inventory.generatedInboundRows.v1';
const CURRENT_USER = 'admin-系统管理员';
const PO_STATUS_ORDER = { 待接收: 0, 已接收: 1, 已入库: 2 };
const PLATE_OPTIONS = [
  { label: '11.搜狐网-web', value: '搜狐网-web' },
  { label: '12.搜狐网-mobile', value: '搜狐网-mobile' },
  { label: '13.汽车', value: '汽车' },
  { label: '14.无线', value: '无线' },
  { label: '15.焦点', value: '焦点' },
  { label: '16.视频', value: '视频' },
  { label: '17.Corporate', value: 'Corporate' },
  { label: '51.焦点 Corporate', value: '焦点 Corporate' },
  { label: '52.房产', value: '房产' },
  { label: '53.家居', value: '家居' },
  { label: '54.二手房', value: '二手房' },
  { label: '56.SAAS', value: 'SAAS' },
];

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function numericValue(value) {
  const parsed = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSelectData(values) {
  return [...new Set(values.filter(Boolean))].map((name, index) => ({ id: index + 1, name }));
}

function getPoDetail(po) {
  if (!po) return {};
  if (po.poNo === 'PO2410230001') return MAINTENANCE_PO_DETAIL;
  if (po.purchaseType === '电子设备') return ELECTRONIC_PO_DETAIL;
  if (DIRECT_INBOUND_TYPES.has(po.purchaseType)) return SERVER_PO_DETAIL;
  return {};
}

function getBasePoItem(poNo, itemId) {
  const po = PO_ROWS.find((row) => row.poNo === poNo);
  return (getPoDetail(po).items || []).find((item) => item.id === itemId) || null;
}

function getReceiptItems(receipt) {
  if (Array.isArray(receipt?.items)) return receipt.items;
  const po = PO_ROWS.find((item) => item.poNo === receipt?.poNo);
  const detailItems = getPoDetail(po).items || [];
  if (Array.isArray(receipt?.itemIds)) return detailItems.filter((item) => receipt.itemIds.includes(item.id));
  const receivedItems = detailItems.filter((item) => Number(item.currentReceiptQty || 0) > 0);
  return receivedItems.length > 0 ? receivedItems : detailItems;
}

function splitPartDescriptions(value, count) {
  const source = String(value || '').replace(/^-$|^暂无$/, '').split('@').filter(Boolean);
  return Array.from({ length: Math.max(0, count) }, (_, index) => source[index] || `部件${index + 1}`);
}

function buildPartRows(item, assetTag = '') {
  const count = Math.max(0, Number(item?.partQuantity || 0) - 1);
  const names = splitPartDescriptions(item?.partDesc, count);
  return Array.from({ length: count }, (_, index) => ({
    id: `${item?.id || 'part'}-${index + 1}`,
    partName: names[index],
    partTag: assetTag ? `${assetTag}-${index + 1}` : '',
    partSn: '',
  }));
}

function serializeParts(parts) {
  return (parts || []).map((part) => `${part.partName || ''}#${part.partTag || ''}#${part.partSn || ''}`).join('@');
}

function buildMaintenanceSession(receipt) {
  const completed = receipt?.status === '已完成';
  let lineNo = 1;
  const rows = [];
  getReceiptItems(receipt).forEach((item) => {
    const count = Math.max(0, Number(item.currentReceiptQty || 0));
    for (let index = 0; index < count; index += 1) {
      const specialTag = receipt?.poNo === 'PO2410230001' ? String(112132600468 + rows.length) : null;
      const generatedTag = specialTag || `11213${String(2600000 + Number(receipt?.id || 0) * 100 + Number(item.id || 0) * 10 + index).padStart(7, '0')}`;
      const completedSn = `SOHUXX${String(156000 + Number(receipt?.id || 0) * 100 + Number(item.id || 0) * 10 + index)}`;
      const assetTag = completed ? generatedTag : '';
      rows.push({
        id: `${item.id}-${index + 1}`,
        lineNo,
        sourceLineId: item.id,
        generatedTag,
        assetTag,
        sn: completed ? completedSn : '',
        materialGroup: item.materialGroup,
        assetClass: item.assetClass,
        materialDesc: item.materialDesc,
        config: item.config,
        partQuantity: item.partQuantity,
        partDesc: item.partDesc,
        parts: buildPartRows(item, assetTag),
        assetQty: 1,
        untaxedUnitPrice: item.untaxedUnitPrice,
        tax: item.totalTax,
        prLineNo: item.prLineNo,
        saLineNo: item.saLineNo,
        applicant: '',
        businessLine: item.businessLine,
        assetMark: '',
        remark: '',
      });
      lineNo += 1;
    }
  });
  return {
    rows,
    tagsGenerated: completed && rows.length > 0,
    defaultSnApplied: completed && rows.length > 0,
  };
}

function normalizeSn(value) {
  return String(value || '').trim();
}

function isRealSn(value) {
  const normalized = normalizeSn(value);
  return Boolean(normalized) && normalized !== '缺省';
}

function SelectorInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input value={value} readOnly allowClear={false} placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} className="text-[#1677ff]" />} />
    </div>
  );
}

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function ReceiptLineMaintenanceModal({ open, asset, readOnly, onCancel, onSave }) {
  const [sn, setSn] = useState(asset?.sn || '');
  const [assetMark, setAssetMark] = useState(asset?.assetMark || '');
  const [remark, setRemark] = useState(asset?.remark || '');
  const [parts, setParts] = useState(asset?.parts || buildPartRows(asset, asset?.assetTag || ''));

  const partColumns = [
    {
      title: '部件名称', dataIndex: 'partName', width: 220,
      render: (value, row) => readOnly ? <Readonly>{value}</Readonly> : <Input value={value} onChange={(event) => setParts((current) => current.map((item) => item.id === row.id ? { ...item, partName: event.target.value } : item))} />,
    },
    { title: '部件标签号', dataIndex: 'partTag', width: 220, render: (value) => <Readonly>{value}</Readonly> },
    {
      title: '部件SN', dataIndex: 'partSn', width: 220,
      render: (value, row) => readOnly ? <Readonly>{value}</Readonly> : <Input value={value} onChange={(event) => setParts((current) => current.map((item) => item.id === row.id ? { ...item, partSn: event.target.value } : item))} />,
    },
  ];

  return (
    <Modal
      open={open}
      title="明细信息维护"
      width={820}
      okText="保存"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => onSave({ ...asset, sn, assetMark, remark, parts, partDesc: parts.length ? parts.map((part) => part.partName).join('@') : asset?.partDesc })}
      footer={readOnly ? null : undefined}
      destroyOnHidden
    >
      <Space direction="vertical" size={16} className="w-full">
        <Card size="small" title="明细信息">
          <DetailGrid columns={2} labelWidth={96}>
            <DetailItem label="资产标签号"><Readonly>{asset?.assetTag}</Readonly></DetailItem>
            <DetailItem label="资产说明"><Readonly>{asset?.materialDesc}</Readonly></DetailItem>
            <DetailItem label="SN号">{readOnly ? <Readonly>{sn}</Readonly> : <Input value={sn} onChange={(event) => setSn(event.target.value)} />}</DetailItem>
            <DetailItem label="资产标记">{readOnly ? <Readonly>{assetMark}</Readonly> : <Input value={assetMark} onChange={(event) => setAssetMark(event.target.value)} />}</DetailItem>
            <DetailItem label="备注" span={2}>{readOnly ? <Readonly>{remark}</Readonly> : <Input.TextArea rows={3} value={remark} onChange={(event) => setRemark(event.target.value)} />}</DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="部件信息">
          {parts.length > 0
            ? <Table rowKey="id" size="small" bordered pagination={false} columns={partColumns} dataSource={parts} scroll={{ x: 'max-content' }} />
            : <Typography.Text type="secondary">暂无部件信息</Typography.Text>}
        </Card>
      </Space>
    </Modal>
  );
}

export default function AssetReceiptPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [view, setView] = useState('poList');
  const [activePO, setActivePO] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [poDraftFilters, setPoDraftFilters] = useState(EMPTY_PO_FILTERS);
  const [poAppliedFilters, setPoAppliedFilters] = useState(EMPTY_PO_FILTERS);
  const [receiptDraftFilters, setReceiptDraftFilters] = useState(EMPTY_RECEIPT_FILTERS);
  const [receiptAppliedFilters, setReceiptAppliedFilters] = useState(EMPTY_RECEIPT_FILTERS);
  const [receiptRows, setReceiptRows] = useState(RECEIPT_ROWS);
  const [selectedReceiptKeys, setSelectedReceiptKeys] = useState([]);
  const [selectedReceiptLineKeys, setSelectedReceiptLineKeys] = useState([]);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const [detailPlate, setDetailPlate] = useState('');
  const [applicationBatch, setApplicationBatch] = useState('');
  const [poReceiptDefaults, setPoReceiptDefaults] = useState({});
  const [selectorType, setSelectorType] = useState('');
  const [poItemOverrides, setPoItemOverrides] = useState({});
  const [editItem, setEditItem] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [partDescriptionModalOpen, setPartDescriptionModalOpen] = useState(false);
  const [partDescriptionDraft, setPartDescriptionDraft] = useState([]);
  const [maintenanceStore, setMaintenanceStore] = useState({});
  const [maintenanceSession, setMaintenanceSession] = useState({ rows: [], tagsGenerated: false, defaultSnApplied: false });
  const [selectedMaintenanceKeys, setSelectedMaintenanceKeys] = useState([]);
  const [maintenanceScan, setMaintenanceScan] = useState('');
  const [maintenanceAsset, setMaintenanceAsset] = useState(null);
  const [maintenanceScanTargetId, setMaintenanceScanTargetId] = useState(null);
  const [maintenanceFilterId, setMaintenanceFilterId] = useState(null);

  const maintenanceRows = maintenanceSession.rows;
  const hasBlankMaintenanceTags = maintenanceRows.some((row) => !String(row.assetTag || '').trim());
  const allMaintenanceTagsReady = maintenanceRows.length > 0 && !hasBlankMaintenanceTags;
  const hasBlankMaintenanceSn = maintenanceRows.some((row) => !normalizeSn(row.sn));

  const getEffectivePoItems = (po = activePO, overrides = poItemOverrides) => {
    if (!po) return [];
    return (getPoDetail(po).items || []).map((item) => ({ ...item, ...(overrides[po.poNo]?.[item.id] || {}) }));
  };

  const availableQty = (item) => Math.max(0, Number(item?.purchaseQty || 0) - Number(item?.receivedQty || 0) - Number(item?.draftQty || 0));

  const effectivePoRows = useMemo(() => PO_ROWS.map((row) => {
    const defaults = poReceiptDefaults[row.poNo] || {};
    if (row.receiptStatus === '已入库') return { ...row, plate: defaults.plate ?? row.plate };
    const items = (getPoDetail(row).items || []).map((item) => ({ ...item, ...(poItemOverrides[row.poNo]?.[item.id] || {}) }));
    const fullyReceived = items.length > 0 && items.every((item) => Number(item.receivedQty || 0) >= Number(item.purchaseQty || 0));
    return { ...row, plate: defaults.plate ?? row.plate, receiptStatus: fullyReceived ? '已接收' : '待接收' };
  }), [poItemOverrides, poReceiptDefaults]);

  const companyData = useMemo(() => toSelectData(effectivePoRows.map((item) => item.company)), [effectivePoRows]);
  const supplierData = useMemo(() => toSelectData(effectivePoRows.map((item) => item.supplier)), [effectivePoRows]);
  const receiptSupplierData = useMemo(() => toSelectData(receiptRows.map((item) => item.supplier)), [receiptRows]);

  const filteredPoRows = useMemo(() => effectivePoRows.filter((row) => (
    includesText(row.company, poAppliedFilters.company)
    && includesText(row.plate, poAppliedFilters.plate)
    && includesText(row.poNo, poAppliedFilters.poNo)
    && includesText(row.supplier, poAppliedFilters.supplier)
    && (!poAppliedFilters.receiptStatus || row.receiptStatus === poAppliedFilters.receiptStatus)
    && (!poAppliedFilters.purchaseType || row.purchaseType === poAppliedFilters.purchaseType)
  )).sort((a, b) => {
    const statusDiff = (PO_STATUS_ORDER[a.receiptStatus] ?? 99) - (PO_STATUS_ORDER[b.receiptStatus] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    return String(b.pushDate || '').localeCompare(String(a.pushDate || ''));
  }), [effectivePoRows, poAppliedFilters]);

  const filteredReceiptRows = useMemo(() => receiptRows.filter((row) => {
    const date = row.createdAt ? row.createdAt.slice(0, 10) : '';
    return includesText(row.receiptNo, receiptAppliedFilters.receiptNo)
      && includesText(row.poNo, receiptAppliedFilters.poNo)
      && includesText(row.status, receiptAppliedFilters.status)
      && includesText(row.creator, receiptAppliedFilters.creator)
      && includesText(row.supplier, receiptAppliedFilters.supplier)
      && (!receiptAppliedFilters.createdFrom || date >= receiptAppliedFilters.createdFrom)
      && (!receiptAppliedFilters.createdTo || date <= receiptAppliedFilters.createdTo);
  }).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))), [receiptRows, receiptAppliedFilters]);

  const updatePoFilter = (field, value) => setPoDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const updateReceiptFilter = (field, value) => setReceiptDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const updateReceiptDateRange = (dates) => setReceiptDraftFilters((current) => ({
    ...current,
    createdFrom: dates?.[0] ? dates[0].format('YYYY-MM-DD') : '',
    createdTo: dates?.[1] ? dates[1].format('YYYY-MM-DD') : '',
  }));

  const updatePoReceiptDefault = (field, value) => {
    if (!activePO) return;
    setPoReceiptDefaults((current) => ({
      ...current,
      [activePO.poNo]: { ...(current[activePO.poNo] || {}), [field]: value },
    }));
  };

  const updateMaintenanceSession = (updater) => {
    if (!activeReceipt) return;
    setMaintenanceSession((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      setMaintenanceStore((store) => ({ ...store, [activeReceipt.receiptNo]: next }));
      return next;
    });
  };

  const setPoItemValues = (poNo, updatesById) => {
    setPoItemOverrides((current) => {
      const nextForPo = { ...(current[poNo] || {}) };
      Object.entries(updatesById).forEach(([rawId, updater]) => {
        const itemId = Number(rawId);
        const base = getBasePoItem(poNo, itemId) || {};
        const previous = { ...base, ...(nextForPo[itemId] || {}) };
        nextForPo[itemId] = typeof updater === 'function' ? updater(previous) : { ...previous, ...updater };
      });
      return { ...current, [poNo]: nextForPo };
    });
  };

  const releaseDraftReservations = (receipts) => {
    const releasesByPo = {};
    receipts.forEach((receipt) => {
      getReceiptItems(receipt).forEach((item) => {
        releasesByPo[receipt.poNo] = releasesByPo[receipt.poNo] || {};
        releasesByPo[receipt.poNo][item.id] = (releasesByPo[receipt.poNo][item.id] || 0) + Number(item.currentReceiptQty || 0);
      });
    });
    Object.entries(releasesByPo).forEach(([poNo, releases]) => {
      setPoItemValues(poNo, Object.fromEntries(Object.entries(releases).map(([itemId, qty]) => [itemId, (previous) => {
        const nextDraft = Math.max(0, Number(previous.draftQty || 0) - Number(qty || 0));
        const remaining = Math.max(0, Number(previous.purchaseQty || 0) - Number(previous.receivedQty || 0) - nextDraft);
        return {
          ...previous,
          draftQty: nextDraft,
          currentReceiptQty: remaining,
          editable: remaining > 0,
          receiptStatus: Number(previous.receivedQty || 0) >= Number(previous.purchaseQty || 0) ? '已接收' : '待接收',
        };
      }])));
    });
  };

  const releaseDraftCounts = (poNo, countsByItemId) => {
    setPoItemValues(poNo, Object.fromEntries(Object.entries(countsByItemId).map(([itemId, qty]) => [itemId, (previous) => {
      const nextDraft = Math.max(0, Number(previous.draftQty || 0) - Number(qty || 0));
      const remaining = Math.max(0, Number(previous.purchaseQty || 0) - Number(previous.receivedQty || 0) - nextDraft);
      return { ...previous, draftQty: nextDraft, currentReceiptQty: remaining, editable: remaining > 0 };
    }])));
  };

  const completeReceiptOnPo = (receipt) => {
    const updates = {};
    getReceiptItems(receipt).forEach((item) => {
      updates[item.id] = (previous) => {
        const qty = Number(item.currentReceiptQty || 0);
        const nextDraft = Math.max(0, Number(previous.draftQty || 0) - qty);
        const nextReceived = Number(previous.receivedQty || 0) + qty;
        const remaining = Math.max(0, Number(previous.purchaseQty || 0) - nextReceived - nextDraft);
        return {
          ...previous,
          draftQty: nextDraft,
          receivedQty: nextReceived,
          currentReceiptQty: remaining,
          editable: remaining > 0,
          receiptStatus: nextReceived >= Number(previous.purchaseQty || 0) ? '已接收' : '待接收',
        };
      };
    });
    setPoItemValues(receipt.poNo, updates);
  };

  const openPoDetail = (row) => {
    const defaults = poReceiptDefaults[row.poNo] || {};
    setActivePO(row);
    setDetailPlate(defaults.plate ?? row.plate ?? '');
    setApplicationBatch(defaults.applicationBatch ?? '');
    setSelectedItemKeys([]);
    setEditItem(null);
    setEditDraft(null);
    setView('poDetail');
  };

  const openReceiptList = (row) => {
    const filters = { ...EMPTY_RECEIPT_FILTERS, poNo: row.poNo };
    setActivePO(row);
    setActiveReceipt(null);
    setReceiptDraftFilters(filters);
    setReceiptAppliedFilters(filters);
    setSelectedReceiptKeys([]);
    setView('receiptList');
  };

  const openReceiptDetail = (row) => {
    setActiveReceipt(row);
    setActivePO(effectivePoRows.find((item) => item.poNo === row.poNo) || activePO);
    setSelectedReceiptLineKeys([]);
    setView('receiptDetail');
  };

  const editAvailableQty = (item) => availableQty(item);

  const openItemEditor = (row) => {
    const partQuantity = row.partQuantity === '-' ? 0 : Number(row.partQuantity || 0);
    setEditItem(row);
    setEditDraft({
      ...row,
      currentReceiptQty: Math.min(Math.max(1, Number(row.currentReceiptQty || 1)), Math.max(1, availableQty(row))),
      isPart: row.isPart ?? (row.partQuantity !== '-' && partQuantity > 0),
      partQuantity,
      partDescriptions: splitPartDescriptions(row.partDesc, Math.max(0, partQuantity - 1)),
    });
  };

  const openPartDescriptionEditor = () => {
    const quantity = Number(editDraft?.partQuantity || 0);
    if (!editDraft?.isPart || !Number.isInteger(quantity) || quantity < 2 || quantity > 100) {
      messageApi.warning('请填写部件数量！');
      return;
    }
    setPartDescriptionDraft(Array.from({ length: quantity - 1 }, (_, index) => editDraft.partDescriptions?.[index] || `部件${index + 1}`));
    setPartDescriptionModalOpen(true);
  };

  const savePoItem = () => {
    const qty = Number(editDraft?.currentReceiptQty || 0);
    const maxQty = editAvailableQty(editItem);
    if (!DIRECT_INBOUND_TYPES.has(activePO?.purchaseType)) {
      if (!Number.isInteger(qty) || qty <= 0) return messageApi.error('接收数量必须为大于 0 的整数');
      if (qty > maxQty) return messageApi.error(`接收数量不能超过可接收数量（当前可接收数量为 ${maxQty}）`);
    }
    if (editDraft.isPart && (!Number.isInteger(Number(editDraft.partQuantity)) || Number(editDraft.partQuantity) < 2 || Number(editDraft.partQuantity) > 100)) {
      return messageApi.error('请输入 2～100 之间的整数！');
    }
    setPoItemValues(activePO.poNo, {
      [editItem.id]: {
        ...editDraft,
        partQuantity: editDraft.isPart ? Number(editDraft.partQuantity) : '-',
        partDesc: editDraft.isPart ? (editDraft.partDescriptions || []).join('@') : '-',
      },
    });
    setEditItem(null);
    setEditDraft(null);
    setPartDescriptionModalOpen(false);
    messageApi.success('接收信息已保存，修改将用于该PO后续未完成接收数据');
    return undefined;
  };

  const createReceipt = () => {
    if (selectedItemKeys.length === 0) return messageApi.warning('请选择要接收的物料！');
    if (!detailPlate) return messageApi.warning('请选择板块！');
    const selectedItems = getEffectivePoItems(activePO).filter((item) => selectedItemKeys.includes(item.id));
    const receiptItems = selectedItems.map((item) => {
      const maxQty = availableQty(item);
      const qty = Math.min(Number(item.currentReceiptQty || 0), maxQty);
      return { ...item, currentReceiptQty: qty };
    }).filter((item) => Number(item.currentReceiptQty || 0) > 0);
    if (!receiptItems.length) return messageApi.warning('所选物资当前没有可接收数量');

    const nextId = receiptRows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    const nextReceipt = {
      id: nextId,
      receiptNo: `REC-${dayjs().format('YYYYMMDD')}${String(nextId).padStart(4, '0')}`,
      status: '草稿',
      poNo: activePO.poNo,
      supplier: activePO.supplier,
      creator: CURRENT_USER,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      receiver: '',
      receiptAt: '',
      plate: detailPlate,
      applicationBatch: applicationBatch.trim(),
      itemIds: receiptItems.map((item) => item.id),
      items: receiptItems,
    };

    setPoItemValues(activePO.poNo, Object.fromEntries(receiptItems.map((item) => [item.id, (previous) => {
      const nextDraft = Number(previous.draftQty || 0) + Number(item.currentReceiptQty || 0);
      const remaining = Math.max(0, Number(previous.purchaseQty || 0) - Number(previous.receivedQty || 0) - nextDraft);
      return { ...previous, draftQty: nextDraft, currentReceiptQty: remaining, editable: remaining > 0 };
    }])));
    setReceiptRows((current) => [...current, nextReceipt]);
    setActiveReceipt(nextReceipt);
    setSelectedItemKeys([]);
    setSelectedReceiptLineKeys([]);
    setView('receiptDetail');
    messageApi.success('接收单草稿创建成功，已占用本次接收数量');
    return undefined;
  };

  const persistGeneratedInbounds = (rows) => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = JSON.parse(window.localStorage.getItem(GENERATED_INBOUND_STORAGE_KEY) || '[]');
      const documentNos = new Set(rows.map((row) => row.documentNo));
      const next = [...rows, ...stored.filter((item) => !documentNos.has(item.documentNo))];
      window.localStorage.setItem(GENERATED_INBOUND_STORAGE_KEY, JSON.stringify(next));
      return true;
    } catch (error) {
      messageApi.error('接收失败：入库草稿数据同步失败');
      return false;
    }
  };

  const buildInboundWarehouse = (po) => po.company?.includes('焦点') ? 'I0022-资产集团前台库（焦点互动）' : 'I0001-资产集团总库（新媒体）';

  const confirmDirectPoReceipt = () => {
    if (!selectedItemKeys.length) return messageApi.warning('请选择要接收的物料！');
    if (!detailPlate) return messageApi.warning('请选择板块！');
    const selectedItems = getEffectivePoItems(activePO)
      .filter((item) => selectedItemKeys.includes(item.id))
      .map((item) => ({ ...item, currentReceiptQty: Math.min(Number(item.currentReceiptQty || 0), availableQty(item)) }))
      .filter((item) => Number(item.currentReceiptQty || 0) > 0);
    if (!selectedItems.length) return messageApi.warning('当前没有可接收确认的物资');

    const nextReceiptId = receiptRows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const receiptNo = `REC-${dayjs().format('YYYYMMDD')}${String(nextReceiptId).padStart(4, '0')}`;
    const groupedItems = selectedItems.reduce((result, item) => {
      const key = item.noLocation || '默认NO位置';
      result[key] = result[key] || [];
      result[key].push(item);
      return result;
    }, {});
    const inboundGroups = Object.entries(groupedItems);
    const inboundRows = inboundGroups.map(([noLocation, items], groupIndex) => {
      const inboundOrderNo = `PI-${dayjs().format('YYYYMMDD')}${String(nextReceiptId).padStart(4, '0')}${inboundGroups.length > 1 ? `-${String(groupIndex + 1).padStart(2, '0')}` : ''}`;
      const quantity = items.reduce((sum, item) => sum + Number(item.currentReceiptQty || 0), 0);
      return {
        id: Number(`${dayjs().format('YYMMDDHHmm')}${String(groupIndex + 1).padStart(2, '0')}`),
        documentNo: inboundOrderNo,
        applicationNo: '',
        applicationBatch: applicationBatch.trim(),
        status: '草稿',
        inboundType: '采购接收',
        warehouse: buildInboundWarehouse(activePO),
        createdDate: dayjs().format('YYYY-MM-DD'),
        creator: CURRENT_USER,
        quantity,
        cardClaim: '否',
        poNo: activePO.poNo,
        prNo: items[0]?.prLineNo || '',
        assetTag: '',
        receiptNo,
        noLocation,
        lines: items.map((item, index) => ({
          id: `${receiptNo}-${groupIndex + 1}-${index + 1}`,
          company: activePO.company,
          plate: detailPlate,
          department: item.department,
          supplier: activePO.supplier,
          assetTag: '',
          sn: '',
          poNo: activePO.poNo,
          receiptNo,
          applicationBatch: applicationBatch.trim(),
          materialGroup: item.materialGroup,
          assetClass: item.assetClass,
          assetSubClass: activePO.purchaseType,
          materialDesc: item.materialDesc,
          config: item.config,
          partQuantity: item.isPart ? item.partQuantity : 0,
          partDesc: item.isPart ? item.partDesc : (item.partDesc || '-'),
          prLine: item.prLineNo,
          quantity: Number(item.currentReceiptQty || 0),
          originalValue: numericValue(item.untaxedSubtotal),
          tax: numericValue(item.totalTax),
          billable: '是',
          noLocation,
        })),
      };
    });

    if (!persistGeneratedInbounds(inboundRows)) return undefined;

    const inboundOrderNos = inboundRows.map((row) => row.documentNo);
    const completedReceipt = {
      id: nextReceiptId,
      receiptNo,
      status: '已完成',
      poNo: activePO.poNo,
      supplier: activePO.supplier,
      creator: CURRENT_USER,
      createdAt: now,
      receiver: CURRENT_USER,
      receiptAt: now,
      plate: detailPlate,
      applicationBatch: applicationBatch.trim(),
      itemIds: selectedItems.map((item) => item.id),
      items: selectedItems,
      inboundOrderNo: inboundOrderNos[0],
      inboundOrderNos,
    };

    setPoItemValues(activePO.poNo, Object.fromEntries(selectedItems.map((item) => [item.id, (previous) => {
      const nextReceived = Number(previous.receivedQty || 0) + Number(item.currentReceiptQty || 0);
      const remaining = Math.max(0, Number(previous.purchaseQty || 0) - nextReceived - Number(previous.draftQty || 0));
      return {
        ...previous,
        receivedQty: nextReceived,
        currentReceiptQty: remaining,
        editable: remaining > 0,
        receiptStatus: nextReceived >= Number(previous.purchaseQty || 0) ? '已接收' : '待接收',
      };
    }])));
    setReceiptRows((current) => [...current, completedReceipt]);
    setSelectedItemKeys([]);
    messageApi.success('接收成功，入库单已创建！');
    return undefined;
  };

  const openReceiptMaintenance = () => {
    if (!activeReceipt) return;
    const receiptItems = getReceiptItems(activeReceipt);
    if (!receiptItems.length) return messageApi.warning('请先维护接收信息！');
    const invalidIndex = receiptItems.findIndex((item) => Number(item.currentReceiptQty || 0) <= 0);
    if (invalidIndex >= 0) return messageApi.warning(`第 ${invalidIndex + 1} 行，未维护接收数量！`);
    const saved = maintenanceStore[activeReceipt.receiptNo];
    const session = saved || buildMaintenanceSession(activeReceipt);
    setMaintenanceSession(session);
    if (!saved) setMaintenanceStore((store) => ({ ...store, [activeReceipt.receiptNo]: session }));
    setSelectedMaintenanceKeys([]);
    setMaintenanceScan('');
    setMaintenanceScanTargetId(null);
    setMaintenanceFilterId(null);
    setView('receiptMaintenance');
  };

  const generateMaintenanceTags = () => {
    if (maintenanceRows.length === 0) return messageApi.warning('当前没有可生成标签号的明细');
    updateMaintenanceSession((current) => ({
      ...current,
      tagsGenerated: true,
      rows: current.rows.map((row) => ({
        ...row,
        assetTag: row.assetTag || row.generatedTag,
        parts: (row.parts || []).map((part, index) => ({ ...part, partTag: `${row.assetTag || row.generatedTag}-${index + 1}` })),
      })),
    }));
    setMaintenanceScan('');
    setMaintenanceScanTargetId(null);
    setMaintenanceFilterId(null);
    messageApi.success('生成成功！');
    return undefined;
  };

  const applyDefaultMaintenanceSn = () => {
    if (maintenanceRows.length === 0) return messageApi.warning('当前没有可维护SN号的明细');
    const blankCount = maintenanceRows.filter((row) => !normalizeSn(row.sn)).length;
    if (!blankCount) return messageApi.info('当前所有SN号均已维护');
    updateMaintenanceSession((current) => ({
      ...current,
      defaultSnApplied: true,
      rows: current.rows.map((row) => normalizeSn(row.sn) ? row : { ...row, sn: '缺省' }),
    }));
    messageApi.success(`已为 ${blankCount} 条空白SN号维护“缺省”并实时保存`);
    return undefined;
  };

  const collectKnownRealSns = (excludeReceiptNo, excludeRowId, includeCurrentReceipt = true) => {
    const values = [];
    Object.entries(maintenanceStore).forEach(([receiptNo, session]) => {
      if (receiptNo === excludeReceiptNo) return;
      session.rows.forEach((row) => { if (isRealSn(row.sn)) values.push(normalizeSn(row.sn)); });
    });
    receiptRows.filter((receipt) => receipt.status === '已完成' && !maintenanceStore[receipt.receiptNo] && receipt.receiptNo !== excludeReceiptNo).forEach((receipt) => {
      buildMaintenanceSession(receipt).rows.forEach((row) => { if (isRealSn(row.sn)) values.push(normalizeSn(row.sn)); });
    });
    if (includeCurrentReceipt) {
      maintenanceRows.forEach((row) => {
        if (row.id !== excludeRowId && isRealSn(row.sn)) values.push(normalizeSn(row.sn));
      });
    }
    return new Set(values);
  };

  const validateSn = (value, rowId) => {
    const normalized = normalizeSn(value);
    if (!isRealSn(normalized)) return true;
    if (collectKnownRealSns(activeReceipt?.receiptNo, rowId, true).has(normalized)) {
      messageApi.error(`SN 号：${normalized} 已存在！`);
      return false;
    }
    return true;
  };

  const validatePartInfo = (parts) => {
    const realPartSns = (parts || []).map((part) => normalizeSn(part.partSn)).filter((sn) => isRealSn(sn));
    const duplicate = realPartSns.find((sn, index) => realPartSns.indexOf(sn) !== index);
    if (duplicate) {
      messageApi.error('存在重复的部件序列号！');
      return false;
    }
    if (serializeParts(parts).length > 500) {
      messageApi.error('描述字符超长，总长度不能超过 500 字符！');
      return false;
    }
    return true;
  };

  const deleteMaintenanceRows = () => {
    if (!selectedMaintenanceKeys.length) return messageApi.warning('请先选择需要删除的标签行！');
    const selected = new Set(selectedMaintenanceKeys);
    const removedRows = maintenanceRows.filter((row) => selected.has(row.id));
    const countsByItemId = removedRows.reduce((result, row) => ({ ...result, [row.sourceLineId]: (result[row.sourceLineId] || 0) + 1 }), {});
    Modal.confirm({
      title: '确认删除选中的标签行吗？',
      content: `共选择 ${removedRows.length} 条，删除后将同步减少接收数量并释放对应PO草稿占用数量。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        releaseDraftCounts(activeReceipt.poNo, countsByItemId);
        const nextItems = getReceiptItems(activeReceipt).map((item) => ({
          ...item,
          currentReceiptQty: Math.max(0, Number(item.currentReceiptQty || 0) - Number(countsByItemId[item.id] || 0)),
        })).filter((item) => Number(item.currentReceiptQty || 0) > 0);
        const nextReceipt = { ...activeReceipt, itemIds: nextItems.map((item) => item.id), items: nextItems };
        setActiveReceipt(nextReceipt);
        setReceiptRows((current) => current.map((row) => row.id === nextReceipt.id ? nextReceipt : row));
        updateMaintenanceSession((current) => ({
          ...current,
          rows: current.rows.filter((row) => !selected.has(row.id)).map((row, index) => ({ ...row, lineNo: index + 1 })),
        }));
        if (maintenanceScanTargetId && selected.has(maintenanceScanTargetId)) setMaintenanceScanTargetId(null);
        if (maintenanceFilterId && selected.has(maintenanceFilterId)) setMaintenanceFilterId(null);
        setSelectedMaintenanceKeys([]);
        messageApi.success(`已删除 ${removedRows.length} 条明细，本次接收数量已同步减少并释放PO占用数量`);
      },
    });
    return undefined;
  };

  const resetMaintenanceScan = () => {
    setMaintenanceScan('');
    setMaintenanceScanTargetId(null);
    setMaintenanceFilterId(null);
    setSelectedMaintenanceKeys([]);
  };

  const handleMaintenanceScan = () => {
    if (activeReceipt?.status !== '草稿') return messageApi.warning('已完成接收单不可再维护SN号');
    if (!allMaintenanceTagsReady) return messageApi.warning('请先生成资产标签号');
    const value = maintenanceScan.trim();
    if (!value) return undefined;

    if (maintenanceScanTargetId) {
      const target = maintenanceRows.find((row) => row.id === maintenanceScanTargetId);
      if (!target) {
        setMaintenanceScanTargetId(null);
        return undefined;
      }
      if (!validateSn(value, target.id)) return undefined;
      updateMaintenanceSession((current) => ({
        ...current,
        rows: current.rows.map((row) => row.id === target.id ? { ...row, sn: value } : row),
      }));
      setSelectedMaintenanceKeys([target.id]);
      setMaintenanceScanTargetId(null);
      setMaintenanceFilterId(null);
      setMaintenanceScan('');
      messageApi.success(`已为 ${target.assetTag} 写入SN号并实时保存`);
      return undefined;
    }

    const matched = maintenanceRows.find((row) => row.assetTag === value);
    if (!matched) return messageApi.warning(`未找到匹配的标签号：${value}`);
    setMaintenanceFilterId(matched.id);
    setMaintenanceScanTargetId(matched.id);
    setSelectedMaintenanceKeys([matched.id]);
    setMaintenanceScan('');
    return undefined;
  };

  const confirmReceipt = () => {
    if (!activeReceipt) return undefined;
    const session = maintenanceStore[activeReceipt.receiptNo] || buildMaintenanceSession(activeReceipt);
    if (session.rows.length === 0) return messageApi.warning('当前没有可确认的接收资产明细');

    const missingTagCount = session.rows.filter((row) => !String(row.assetTag || '').trim()).length;
    const missingSnCount = session.rows.filter((row) => !normalizeSn(row.sn)).length;
    if (missingTagCount > 0 || missingSnCount > 0) return messageApi.warning('有未维护的标签号或 SN 号，请先维护接收明细。');

    const realSns = session.rows.filter((row) => isRealSn(row.sn)).map((row) => normalizeSn(row.sn));
    const duplicateInCurrent = realSns.find((sn, index) => realSns.indexOf(sn) !== index);
    if (duplicateInCurrent) return messageApi.error(`接收确认失败：SN号 ${duplicateInCurrent} 已存在`);
    const otherSns = collectKnownRealSns(activeReceipt.receiptNo, null, false);
    const duplicateWithOther = realSns.find((sn) => otherSns.has(sn));
    if (duplicateWithOther) return messageApi.error(`接收确认失败：SN号 ${duplicateWithOther} 已存在`);

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const receiptPO = effectivePoRows.find((item) => item.poNo === activeReceipt.poNo) || activePO;
    const inboundOrderNo = `PI-${dayjs().format('YYYYMMDD')}${String(activeReceipt.id).padStart(4, '0')}`;
    const inboundRow = {
      id: Number(dayjs().format('YYMMDDHHmmss')),
      documentNo: inboundOrderNo,
      applicationNo: '',
      applicationBatch: activeReceipt.applicationBatch || '',
      status: '草稿',
      inboundType: '采购接收',
      warehouse: buildInboundWarehouse(receiptPO),
      createdDate: dayjs().format('YYYY-MM-DD'),
      creator: CURRENT_USER,
      quantity: session.rows.length,
      cardClaim: '否',
      poNo: activeReceipt.poNo,
      prNo: session.rows[0]?.prLineNo || '',
      assetTag: session.rows[0]?.assetTag || '',
      receiptNo: activeReceipt.receiptNo,
      lines: session.rows.map((row, index) => ({
        id: `${activeReceipt.receiptNo}-${index + 1}`,
        company: receiptPO?.company,
        plate: activeReceipt.plate || receiptPO?.plate,
        department: getReceiptItems(activeReceipt).find((item) => item.id === row.sourceLineId)?.department || '',
        supplier: activeReceipt.supplier,
        assetTag: row.assetTag,
        sn: row.sn,
        poNo: activeReceipt.poNo,
        receiptNo: activeReceipt.receiptNo,
        applicationBatch: activeReceipt.applicationBatch || '',
        materialGroup: row.materialGroup,
        assetClass: row.assetClass,
        assetSubClass: receiptPO?.purchaseType || '电子设备',
        materialDesc: row.materialDesc,
        config: row.config,
        partQuantity: row.partQuantity === '-' ? 0 : row.partQuantity,
        partDesc: row.partDesc || '-',
        parts: row.parts || [],
        prLine: row.prLineNo,
        quantity: 1,
        originalValue: numericValue(row.untaxedUnitPrice),
        tax: numericValue(row.tax),
        billable: '是',
      })),
    };

    if (!persistGeneratedInbounds([inboundRow])) return undefined;

    const completedReceipt = {
      ...activeReceipt,
      status: '已完成',
      receiver: CURRENT_USER,
      receiptAt: now,
      inboundOrderNo,
    };
    setReceiptRows((current) => current.map((row) => row.id === activeReceipt.id ? completedReceipt : row));
    setActiveReceipt(completedReceipt);
    completeReceiptOnPo(activeReceipt);
    messageApi.success(`接收确认成功，已生成草稿入库单 ${inboundOrderNo}`);
    return undefined;
  };

  const cancelReceipt = () => {
    if (!activeReceipt || activeReceipt.status !== '草稿') return undefined;
    Modal.confirm({
      title: '确认取消接收？',
      content: '取消后当前草稿接收单作废，并释放已占用的PO可接收数量。',
      okText: '确认取消',
      cancelText: '返回',
      okButtonProps: { danger: true },
      onOk: () => {
        releaseDraftReservations([activeReceipt]);
        setReceiptRows((current) => current.filter((row) => row.id !== activeReceipt.id));
        setMaintenanceStore((current) => {
          const next = { ...current };
          delete next[activeReceipt.receiptNo];
          return next;
        });
        setActiveReceipt(null);
        setSelectedReceiptLineKeys([]);
        setView('receiptList');
        messageApi.success('草稿接收单已作废，PO占用数量已释放');
      },
    });
    return undefined;
  };

  const deleteReceiptLines = (visibleReceiptItems) => {
    if (selectedReceiptLineKeys.length === 0) return messageApi.warning('请先选择需要删除的接收行！');
    Modal.confirm({
      title: '确认删除选中的接收行吗？',
      content: `共选择 ${selectedReceiptLineKeys.length} 条，删除后将释放对应PO占用数量。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const selected = new Set(selectedReceiptLineKeys);
        const removedItems = visibleReceiptItems.filter((item) => selected.has(item.id));
        releaseDraftReservations([{ ...activeReceipt, items: removedItems }]);
        const nextItems = visibleReceiptItems.filter((item) => !selected.has(item.id));
        const nextReceipt = { ...activeReceipt, itemIds: nextItems.map((item) => item.id), items: nextItems };
        setReceiptRows((current) => current.map((row) => row.id === activeReceipt.id ? nextReceipt : row));
        setActiveReceipt(nextReceipt);
        setMaintenanceStore((store) => {
          const saved = store[activeReceipt.receiptNo];
          if (!saved) return store;
          return {
            ...store,
            [activeReceipt.receiptNo]: {
              ...saved,
              rows: saved.rows.filter((row) => !selected.has(row.sourceLineId)).map((row, index) => ({ ...row, lineNo: index + 1 })),
            },
          };
        });
        setSelectedReceiptLineKeys([]);
        messageApi.success('已删除所选接收行并释放PO占用数量');
      },
    });
    return undefined;
  };

  const deleteSelectedReceipts = () => {
    if (!selectedReceiptKeys.length) return messageApi.warning('请先选择需要删除的接收单！');
    const selected = new Set(selectedReceiptKeys);
    const targetRows = receiptRows.filter((row) => selected.has(row.id));
    const completedCount = targetRows.filter((row) => row.status === '已完成').length;
    if (completedCount) return messageApi.warning('已完成接收单不可删除，请只选择草稿接收单');
    Modal.confirm({
      title: '确认删除选中的接收单吗？',
      content: '删除后将释放对应PO占用数量。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        releaseDraftReservations(targetRows);
        setReceiptRows((current) => current.filter((row) => !selected.has(row.id)));
        setMaintenanceStore((current) => {
          const next = { ...current };
          targetRows.forEach((row) => delete next[row.receiptNo]);
          return next;
        });
        setSelectedReceiptKeys([]);
        messageApi.success('已删除所选草稿接收单并释放PO占用数量');
      },
    });
    return undefined;
  };

  const selectorConfig = {
    company: { title: '选择公司', dataSource: companyData, onConfirm: (record) => updatePoFilter('company', record.name) },
    supplier: { title: '选择供应商', dataSource: supplierData, onConfirm: (record) => updatePoFilter('supplier', record.name) },
    receiptSupplier: { title: '选择供应商', dataSource: receiptSupplierData, onConfirm: (record) => { updateReceiptFilter('supplier', record.name); setSelectorType(''); } },
    material: {
      title: '选择物料',
      dataSource: getEffectivePoItems(activePO).map((item) => ({ ...item, code: item.materialCode, name: item.materialDesc })),
      columns: [
        { title: '物料编码', dataIndex: 'code' },
        { title: '物料名称', dataIndex: 'name' },
        { title: '配置', dataIndex: 'config' },
      ],
      searchFields: [
        { label: '物料编码', name: 'code', dataIndex: 'code' },
        { label: '物料名称', name: 'name', dataIndex: 'name' },
      ],
      onConfirm: (record) => {
        setEditDraft((current) => ({
          ...current,
          materialCode: record.materialCode,
          materialDesc: record.materialDesc,
          materialGroup: record.materialGroup,
          assetClass: record.assetClass,
          config: record.config,
        }));
        setSelectorType('');
      },
    },
  }[selectorType];

  const poColumns = [
    { title: '行号', dataIndex: 'id', width: 72, align: 'center' },
    { title: 'PO单号', dataIndex: 'poNo', width: 170, render: (value, row) => <Button type="link" className="px-0" onClick={() => openPoDetail(row)}>{value}</Button> },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: 'PO单名称', dataIndex: 'poName', width: 220 },
    { title: '公司', dataIndex: 'company', width: 150 },
    { title: '板块', dataIndex: 'plate', width: 130, render: (value) => value || '-' },
    { title: '供应商', dataIndex: 'supplier', width: 280 },
    { title: '推送日期', dataIndex: 'pushDate', width: 130 },
    { title: '采购类型', dataIndex: 'purchaseType', width: 140 },
    {
      title: '操作', key: 'operation', width: 130, fixed: 'right', render: (_, row) => (
        <Space size={4}>
          <Button type="link" className="px-0" onClick={() => openPoDetail(row)}>接收</Button>
          <Button type="link" className="px-0" onClick={() => openReceiptList(row)}>查看</Button>
        </Space>
      ),
    },
  ];

  const receiptColumns = [
    { title: '行号', dataIndex: 'id', width: 72, align: 'center' },
    { title: '接收单号', dataIndex: 'receiptNo', width: 210, render: (value, row) => <Typography.Link onClick={() => openReceiptDetail(row)}>{value}</Typography.Link> },
    { title: '单据状态', dataIndex: 'status', width: 140, render: (value) => <StatusTag value={value} /> },
    { title: 'PO单号', dataIndex: 'poNo', width: 180 },
    { title: '供应商', dataIndex: 'supplier', width: 280 },
    { title: '制单人', dataIndex: 'creator', width: 140 },
    { title: '制单时间', dataIndex: 'createdAt', width: 190 },
  ];

  const itemColumns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '操作', key: 'operation', width: 80, fixed: 'left', render: (_, row) => row.editable && row.receiptStatus === '待接收' && availableQty(row) > 0 ? <Button type="link" className="px-0" onClick={() => openItemEditor(row)}>编辑</Button> : '-' },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 120, render: (value) => value ? <StatusTag value={value} /> : '-' },
    { title: '物资总类', dataIndex: 'materialGroup', width: 120 },
    { title: '资产大类', dataIndex: 'assetClass', width: 180 },
    { title: '物料编码', dataIndex: 'materialCode', width: 170 },
    { title: '资产说明', dataIndex: 'materialDesc', width: 230 },
    { title: 'PO单说明', dataIndex: 'poDesc', width: 360 },
    { title: '配置', dataIndex: 'config', width: 300 },
    { title: '部件数量', dataIndex: 'partQuantity', width: 110 },
    { title: '部件说明', dataIndex: 'partDesc', width: 180 },
    { title: '本次接收数量', dataIndex: 'currentReceiptQty', width: 130, align: 'right' },
    { title: '采购数量', dataIndex: 'purchaseQty', width: 100, align: 'right' },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 120, align: 'right' },
    { title: '不含税金额小计', dataIndex: 'untaxedSubtotal', width: 140, align: 'right' },
    { title: '总税额', dataIndex: 'totalTax', width: 100, align: 'right' },
    { title: '含税单价', dataIndex: 'taxedUnitPrice', width: 110, align: 'right' },
    { title: '含税小计', dataIndex: 'taxedSubtotal', width: 110, align: 'right' },
    { title: '税率', dataIndex: 'taxRate', width: 90, align: 'right' },
    { title: '已接收数量', dataIndex: 'receivedQty', width: 120, align: 'right' },
    { title: '草稿数量', dataIndex: 'draftQty', width: 100, align: 'right' },
    { title: '约定到货日期', dataIndex: 'agreedArrivalDate', width: 130 },
    { title: 'PR单/行号', dataIndex: 'prLineNo', width: 140 },
    { title: 'SA单/行号', dataIndex: 'saLineNo', width: 140 },
    { title: '申请单号', dataIndex: 'applicationNo', width: 160 },
    { title: '部门', dataIndex: 'department', width: 180 },
    { title: '业务线', dataIndex: 'businessLine', width: 140 },
  ];

  const receiptDetailColumns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '物料说明', dataIndex: 'materialDesc', width: 240 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '部件数量', dataIndex: 'partQuantity', width: 110 },
    { title: '部件说明', dataIndex: 'partDesc', width: 180 },
    { title: '本次接收数量', dataIndex: 'currentReceiptQty', width: 130, align: 'right' },
    { title: '采购数量', dataIndex: 'purchaseQty', width: 100, align: 'right' },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 120, align: 'right' },
    { title: '不含税金额小计', dataIndex: 'untaxedSubtotal', width: 140, align: 'right' },
    { title: '税额', dataIndex: 'totalTax', width: 100, align: 'right' },
    { title: '含税单价', dataIndex: 'taxedUnitPrice', width: 110, align: 'right' },
    { title: '含税小计', dataIndex: 'taxedSubtotal', width: 110, align: 'right' },
    { title: '税率', dataIndex: 'taxRate', width: 90, align: 'right' },
    { title: '约定到货日期', dataIndex: 'agreedArrivalDate', width: 130 },
    { title: 'PR单/行号', dataIndex: 'prLineNo', width: 140 },
    { title: 'SA单/行号', dataIndex: 'saLineNo', width: 140 },
    { title: '申请单号', dataIndex: 'applicationNo', width: 160 },
    { title: '部门', dataIndex: 'department', width: 180 },
    { title: '业务线', dataIndex: 'businessLine', width: 140 },
  ];

  if (view === 'poDetail' && activePO) {
    const currentPO = effectivePoRows.find((row) => row.poNo === activePO.poNo) || activePO;
    const detail = getPoDetail(currentPO);
    const itemRows = getEffectivePoItems(currentPO);
    const canCreateReceipt = currentPO.purchaseType === '电子设备';
    const canDirectConfirm = DIRECT_INBOUND_TYPES.has(currentPO.purchaseType);
    const hasReceipt = receiptRows.some((row) => row.poNo === currentPO.poNo);
    const isDirectInbound = DIRECT_INBOUND_TYPES.has(currentPO.purchaseType);

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>资产接收</PageTitle>
        <Alert
          type="info"
          showIcon
          message={isDirectInbound ? '本次接收数量由 NO/MIS 数据决定，不支持人工修改。' : '默认为全量接收，可点击编辑按钮修改接收数量！'}
        />
        <Card size="small" title="PO单信息">
          <DetailGrid columns={3} labelWidth={112}>
            <DetailItem label="PO单号"><Readonly>{currentPO.poNo}</Readonly></DetailItem>
            <DetailItem label="供应商"><Readonly>{currentPO.supplier}</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{detail.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{currentPO.poName}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{detail.procurementUnit || currentPO.company}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{detail.contractSubject}</Readonly></DetailItem>
            <DetailItem label="不含税合计"><Readonly>{detail.untaxedAmount}</Readonly></DetailItem>
            <DetailItem label="合计税额"><Readonly>{detail.taxAmount}</Readonly></DetailItem>
            <DetailItem label="合计金额"><Readonly>{detail.totalAmount}</Readonly></DetailItem>
            <DetailItem label="采购员"><Readonly>{detail.buyer}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{detail.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="推送日期"><Readonly>{currentPO.pushDate}</Readonly></DetailItem>
            <DetailItem label="板块">
              <Select
                value={detailPlate || undefined}
                placeholder="请选择板块"
                options={PLATE_OPTIONS}
                onChange={(value) => { setDetailPlate(value); updatePoReceiptDefault('plate', value); }}
              />
            </DetailItem>
            <DetailItem label="申请批次"><Input value={applicationBatch} placeholder="选填，请输入申请批次" onChange={(event) => { const value = event.target.value; setApplicationBatch(value); updatePoReceiptDefault('applicationBatch', value); }} /></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="PO物资明细" extra={(
          <Space>
            <Typography.Text type="secondary">共 {itemRows.length} 条</Typography.Text>
            {canCreateReceipt && <Button type="primary" onClick={createReceipt}>创建接收单</Button>}
            {canDirectConfirm && <Button type="primary" onClick={confirmDirectPoReceipt}>接收确认</Button>}
          </Space>
        )}>
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={itemColumns}
            dataSource={itemRows}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedItemKeys,
              onChange: setSelectedItemKeys,
              fixed: true,
              columnTitle: '选择',
              columnWidth: 64,
              getCheckboxProps: (record) => ({ disabled: record.receiptStatus !== '待接收' || availableQty(record) <= 0 || Number(record.currentReceiptQty || 0) <= 0 }),
            }}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Card>
        <div className="flex justify-center gap-3">
          {hasReceipt && <Button onClick={() => openReceiptList(currentPO)}>查看接收单</Button>}
          <Button onClick={() => setView('poList')}>返回</Button>
        </div>
        <Modal
          open={Boolean(editItem && editDraft)}
          title="编辑接收信息"
          width={720}
          okText="保存"
          onOk={savePoItem}
          onCancel={() => { setEditItem(null); setEditDraft(null); setPartDescriptionModalOpen(false); }}
        >
          {editDraft && (
            <Space direction="vertical" size={12} className="w-full">
              <div onClick={() => setSelectorType('material')} className="cursor-pointer">
                <Typography.Text>物料</Typography.Text>
                <Input className="mt-1 pointer-events-none" readOnly value={`${editDraft.materialCode} / ${editDraft.materialDesc}`} suffix={<Search size={14} className="text-[#1677ff]" />} />
              </div>
              <div>
                <Typography.Text>配置</Typography.Text>
                <Input className="mt-1" value={editDraft.config} onChange={(event) => setEditDraft((item) => ({ ...item, config: event.target.value }))} />
              </div>
              <div>
                <Typography.Text>接收数量</Typography.Text>
                {isDirectInbound ? (
                  <div className="mt-1">
                    <Readonly>{editDraft.currentReceiptQty}</Readonly>
                    <div><Typography.Text type="secondary">由 NO/MIS 数据决定，不允许人工修改</Typography.Text></div>
                  </div>
                ) : (
                  <InputNumber className="mt-1 w-full" min={1} max={editAvailableQty(editItem)} precision={0} value={editDraft.currentReceiptQty} onChange={(value) => setEditDraft((item) => ({ ...item, currentReceiptQty: value }))} />
                )}
              </div>
              <div>
                <Typography.Text>是否部件</Typography.Text>
                <Select className="mt-1 w-full" value={editDraft.isPart ? 'Y' : 'N'} options={[{ label: '是', value: 'Y' }, { label: '否', value: 'N' }]} onChange={(value) => setEditDraft((item) => value === 'Y' ? { ...item, isPart: true } : { ...item, isPart: false, partQuantity: 0, partDescriptions: [] })} />
              </div>
              <div>
                <Typography.Text>部件数量</Typography.Text>
                <InputNumber className="mt-1 w-full" disabled={!editDraft.isPart} min={2} max={100} precision={0} value={editDraft.partQuantity || undefined} onChange={(value) => setEditDraft((item) => ({ ...item, partQuantity: value || 0, partDescriptions: splitPartDescriptions((item.partDescriptions || []).join('@'), Math.max(0, Number(value || 0) - 1)) }))} />
              </div>
              <div>
                <Typography.Text>部件说明</Typography.Text>
                <div className="mt-1 flex gap-2">
                  <Input readOnly value={(editDraft.partDescriptions || []).join(' / ')} placeholder="请维护部件说明" />
                  <Button disabled={!editDraft.isPart} onClick={openPartDescriptionEditor}>维护</Button>
                </div>
              </div>
            </Space>
          )}
        </Modal>
        <Modal
          open={partDescriptionModalOpen}
          title="维护部件说明"
          width={640}
          okText="确定"
          cancelText="取消"
          onCancel={() => setPartDescriptionModalOpen(false)}
          onOk={() => { setEditDraft((current) => ({ ...current, partDescriptions: [...partDescriptionDraft] })); setPartDescriptionModalOpen(false); }}
        >
          <Space direction="vertical" size={12} className="w-full">
            {partDescriptionDraft.map((value, index) => (
              <div key={index}>
                <Typography.Text>子部件 {index + 1}</Typography.Text>
                <Input className="mt-1" value={value} onChange={(event) => setPartDescriptionDraft((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
              </div>
            ))}
          </Space>
        </Modal>
        {selectorConfig && <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={selectorConfig.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={selectorConfig.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={selectorConfig.onConfirm} />}
      </Space>
    );
  }

  if (view === 'receiptMaintenance' && activeReceipt) {
    const receiptPO = effectivePoRows.find((item) => item.poNo === activeReceipt.poNo) || activePO;
    const detail = getPoDetail(receiptPO);
    const isDraft = activeReceipt.status === '草稿';
    const scanTargetAsset = maintenanceScanTargetId ? maintenanceRows.find((row) => row.id === maintenanceScanTargetId) || null : null;
    const visibleMaintenanceRows = maintenanceFilterId ? maintenanceRows.filter((row) => row.id === maintenanceFilterId) : maintenanceRows;
    const scanPlaceholder = !isDraft
      ? '接收已完成'
      : !allMaintenanceTagsReady
        ? '生成标签号后可使用扫描'
        : maintenanceScanTargetId
          ? `已定位 ${scanTargetAsset?.assetTag || ''}，请扫描SN号`
          : '请扫描资产标签号';
    const maintenanceColumns = [
      { title: '行号', dataIndex: 'lineNo', width: 70, align: 'center' },
      { title: '资产标签号', dataIndex: 'assetTag', width: 160, render: (value) => value || '-' },
      { title: 'SN号', dataIndex: 'sn', width: 130, render: (value) => value || '-' },
      { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
      { title: '资产大类', dataIndex: 'assetClass', width: 180 },
      { title: '物资说明', dataIndex: 'materialDesc', width: 220 },
      { title: '配置', dataIndex: 'config', width: 120 },
      { title: '部件数量', dataIndex: 'partQuantity', width: 110 },
      { title: '部件说明', dataIndex: 'partDesc', width: 160 },
      { title: '资产数量', dataIndex: 'assetQty', width: 100, align: 'right' },
      { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 120, align: 'right' },
      { title: '税金', dataIndex: 'tax', width: 100, align: 'right' },
      { title: 'PR单/行号', dataIndex: 'prLineNo', width: 140 },
      { title: 'SA单/行号', dataIndex: 'saLineNo', width: 140 },
      { title: '申请人', dataIndex: 'applicant', width: 120 },
      { title: '业务线', dataIndex: 'businessLine', width: 120 },
      { title: '资产标记', dataIndex: 'assetMark', width: 120 },
      { title: '备注', dataIndex: 'remark', width: 180 },
      { title: '操作', key: 'operation', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => setMaintenanceAsset(row)}>{isDraft ? '编辑' : '查看'}</Button> },
    ];

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>接收单明细</PageTitle>
        <Card size="small" title="接收单信息">
          <DetailGrid columns={3} labelWidth={118}>
            <DetailItem label="接收单号"><Readonly>{activeReceipt.receiptNo}</Readonly></DetailItem>
            <DetailItem label="接收人"><Readonly>{activeReceipt.receiver}</Readonly></DetailItem>
            <DetailItem label="接收时间"><Readonly>{activeReceipt.receiptAt}</Readonly></DetailItem>
            <DetailItem label="PO单号"><Readonly>{activeReceipt.poNo}</Readonly></DetailItem>
            <DetailItem label="供应商"><Readonly>{activeReceipt.supplier}</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{detail.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{receiptPO?.poName}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{detail.procurementUnit || receiptPO?.company}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{detail.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{activeReceipt.plate || receiptPO?.plate}</Readonly></DetailItem>
            <DetailItem label="部门"><Readonly>{detail.department}</Readonly></DetailItem>
            <DetailItem label="采购员"><Readonly>{detail.buyer}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{detail.contractSubject}</Readonly></DetailItem>
            <DetailItem label="订单日期"><Readonly>{detail.orderDate || receiptPO?.pushDate}</Readonly></DetailItem>
            <DetailItem label="接收单状态"><StatusTag value={activeReceipt.status} /></DetailItem>
            <DetailItem label="申请批次"><Readonly>{activeReceipt.applicationBatch}</Readonly></DetailItem>
          </DetailGrid>
        </Card>

        <QueryBar onQuery={handleMaintenanceScan} onReset={resetMaintenanceScan}>
          <QueryItem label="扫描光标">
            <Input value={maintenanceScan} allowClear disabled={!isDraft || !allMaintenanceTagsReady} placeholder={scanPlaceholder} onChange={(event) => setMaintenanceScan(event.target.value)} onPressEnter={handleMaintenanceScan} />
          </QueryItem>
        </QueryBar>

        <Card size="small" title="接收资产明细" extra={(
          <Space>
            <Typography.Text type="secondary">共 {visibleMaintenanceRows.length} 条</Typography.Text>
            {isDraft && <Button danger onClick={deleteMaintenanceRows}>删除行</Button>}
            {isDraft && hasBlankMaintenanceTags && <Button onClick={generateMaintenanceTags}>生成标签号</Button>}
            {isDraft && hasBlankMaintenanceSn && <Button onClick={applyDefaultMaintenanceSn}>维护SN号</Button>}
            {allMaintenanceTagsReady && <Button onClick={() => messageApi.success('已发起全部标签号打印（原型）')}>打印标签号</Button>}
          </Space>
        )}>
          <Table rowKey="id" size="small" bordered columns={maintenanceColumns} dataSource={visibleMaintenanceRows} rowSelection={isDraft ? { selectedRowKeys: selectedMaintenanceKeys, onChange: setSelectedMaintenanceKeys, fixed: true, columnTitle: '选择', columnWidth: 64 } : undefined} scroll={{ x: 'max-content' }} pagination={false} />
        </Card>

        <div className="flex justify-center gap-3"><Button onClick={() => setView('receiptDetail')}>返回</Button></div>
        <ReceiptLineMaintenanceModal
          key={maintenanceAsset?.id || 'closed'}
          open={Boolean(maintenanceAsset)}
          asset={maintenanceAsset}
          readOnly={!isDraft}
          onCancel={() => setMaintenanceAsset(null)}
          onSave={(nextAsset) => {
            if (!validateSn(nextAsset.sn, nextAsset.id)) return;
            if (!validatePartInfo(nextAsset.parts)) return;
            updateMaintenanceSession((current) => ({ ...current, rows: current.rows.map((row) => row.id === nextAsset.id ? nextAsset : row) }));
            setMaintenanceAsset(null);
            messageApi.success('明细信息已保存');
          }}
        />
      </Space>
    );
  }

  if (view === 'receiptDetail' && activeReceipt) {
    const receiptPO = effectivePoRows.find((item) => item.poNo === activeReceipt.poNo) || activePO;
    const detail = getPoDetail(receiptPO);
    const visibleReceiptItems = getReceiptItems(activeReceipt);
    const canOperateReceipt = activeReceipt.status === '草稿';

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>资产接收</PageTitle>
        <Card size="small" title="接收单信息">
          <DetailGrid columns={3} labelWidth={120}>
            <DetailItem label="采购接收单号"><Readonly>{activeReceipt.receiptNo}</Readonly></DetailItem>
            <DetailItem label="PO单号"><Readonly>{activeReceipt.poNo}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{receiptPO?.poName}</Readonly></DetailItem>
            <DetailItem label="供应商"><Readonly>{activeReceipt.supplier}</Readonly></DetailItem>
            <DetailItem label="联系人"><Readonly>-</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{detail.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{detail.procurementUnit || receiptPO?.company}</Readonly></DetailItem>
            <DetailItem label="采购员"><Readonly>{detail.buyer}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{detail.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{detail.contractSubject}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{activeReceipt.plate || receiptPO?.plate}</Readonly></DetailItem>
            <DetailItem label="制单人"><Readonly>{activeReceipt.creator}</Readonly></DetailItem>
            <DetailItem label="制单时间"><Readonly>{activeReceipt.createdAt}</Readonly></DetailItem>
            <DetailItem label="接收人"><Readonly>{activeReceipt.receiver}</Readonly></DetailItem>
            <DetailItem label="接收时间"><Readonly>{activeReceipt.receiptAt}</Readonly></DetailItem>
            <DetailItem label="接收单状态"><StatusTag value={activeReceipt.status} /></DetailItem>
            <DetailItem label="申请批次"><Readonly>{activeReceipt.applicationBatch}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="接收物资明细" extra={(
          <Space>
            <Typography.Text type="secondary">共 {visibleReceiptItems.length} 条</Typography.Text>
            {canOperateReceipt && <Button danger icon={<Trash2 size={14} />} onClick={() => deleteReceiptLines(visibleReceiptItems)}>删除接收行</Button>}
          </Space>
        )}>
          <Table rowKey="id" size="small" bordered columns={receiptDetailColumns} dataSource={visibleReceiptItems} rowSelection={canOperateReceipt ? { type: 'checkbox', selectedRowKeys: selectedReceiptLineKeys, onChange: setSelectedReceiptLineKeys, fixed: true, columnTitle: '选择', columnWidth: 64 } : undefined} scroll={{ x: 'max-content' }} pagination={false} />
        </Card>
        <div className="flex justify-center gap-3">
          {!DIRECT_INBOUND_TYPES.has(receiptPO?.purchaseType) && <Button onClick={openReceiptMaintenance}>{canOperateReceipt ? '维护接收明细' : '查看接收明细'}</Button>}
          {canOperateReceipt && <Button danger onClick={cancelReceipt}>取消接收</Button>}
          {canOperateReceipt && <Button type="primary" onClick={confirmReceipt}>接收确认</Button>}
          {!canOperateReceipt && <Button onClick={() => messageApi.success('已发起接收单打印（原型）')}>接收单打印</Button>}
          <Button onClick={() => setView('receiptList')}>返回</Button>
        </div>
      </Space>
    );
  }

  if (view === 'receiptList') {
    const receiptDateRange = receiptDraftFilters.createdFrom && receiptDraftFilters.createdTo
      ? [dayjs(receiptDraftFilters.createdFrom), dayjs(receiptDraftFilters.createdTo)]
      : null;

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>资产接收</PageTitle>
        <QueryBar onQuery={() => { setReceiptAppliedFilters({ ...receiptDraftFilters }); setSelectedReceiptKeys([]); }} onReset={() => {
          setReceiptDraftFilters(EMPTY_RECEIPT_FILTERS);
          setReceiptAppliedFilters(EMPTY_RECEIPT_FILTERS);
          setSelectedReceiptKeys([]);
        }}>
          <QueryItem label="接收单号"><Input value={receiptDraftFilters.receiptNo} allowClear placeholder="请输入接收单号" onChange={(event) => updateReceiptFilter('receiptNo', event.target.value)} /></QueryItem>
          <QueryItem label="PO单号"><Input value={receiptDraftFilters.poNo} allowClear placeholder="请输入PO单号" onChange={(event) => updateReceiptFilter('poNo', event.target.value)} /></QueryItem>
          <QueryItem label="单据状态"><Select value={receiptDraftFilters.status || undefined} allowClear placeholder="请选择" options={[{ label: '草稿', value: '草稿' }, { label: '已完成', value: '已完成' }]} onChange={(value) => updateReceiptFilter('status', value)} /></QueryItem>
          <QueryItem label="制单人"><Input value={receiptDraftFilters.creator} allowClear placeholder="请输入制单人" onChange={(event) => updateReceiptFilter('creator', event.target.value)} /></QueryItem>
          <QueryItem label="制单时间"><DatePicker.RangePicker value={receiptDateRange} style={{ width: '100%' }} format="YYYY-MM-DD" allowClear onChange={updateReceiptDateRange} /></QueryItem>
          <QueryItem label="供应商"><SelectorInput value={receiptDraftFilters.supplier} placeholder="请选择供应商" onOpen={() => setSelectorType('receiptSupplier')} /></QueryItem>
        </QueryBar>
        <Card size="small" title="接收单列表" extra={(
          <Space>
            <Typography.Text type="secondary">共 {filteredReceiptRows.length} 条</Typography.Text>
            <Button danger icon={<Trash2 size={14} />} onClick={deleteSelectedReceipts}>删除接收单</Button>
          </Space>
        )}>
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={receiptColumns}
            dataSource={filteredReceiptRows}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedReceiptKeys,
              onChange: setSelectedReceiptKeys,
              fixed: true,
              columnTitle: '选择',
              columnWidth: 64,
              getCheckboxProps: (record) => ({ disabled: record.status !== '草稿' }),
            }}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>
        <div className="flex justify-center gap-3"><Button onClick={() => setView('poList')}>返回</Button></div>
        {selectorConfig && <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={selectorConfig.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={selectorConfig.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={selectorConfig.onConfirm} />}
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>资产接收</PageTitle>
      <QueryBar onQuery={() => setPoAppliedFilters({ ...poDraftFilters })} onReset={() => { setPoDraftFilters(EMPTY_PO_FILTERS); setPoAppliedFilters(EMPTY_PO_FILTERS); }}>
        <QueryItem label="公司"><SelectorInput value={poDraftFilters.company} placeholder="请选择公司" onOpen={() => setSelectorType('company')} /></QueryItem>
        <QueryItem label="板块"><Select value={poDraftFilters.plate || undefined} allowClear placeholder="请选择板块" options={PLATE_OPTIONS} onChange={(value) => updatePoFilter('plate', value)} /></QueryItem>
        <QueryItem label="PO单号"><Input value={poDraftFilters.poNo} allowClear placeholder="请输入PO单号" onChange={(event) => updatePoFilter('poNo', event.target.value)} /></QueryItem>
        <QueryItem label="供应商"><SelectorInput value={poDraftFilters.supplier} placeholder="请选择供应商" onOpen={() => setSelectorType('supplier')} /></QueryItem>
        <QueryItem label="接收状态"><Select value={poDraftFilters.receiptStatus || undefined} allowClear placeholder="全部" options={['待接收', '已接收', '已入库'].map((value) => ({ label: value, value }))} onChange={(value) => updatePoFilter('receiptStatus', value)} /></QueryItem>
        <QueryItem label="采购类型"><Select value={poDraftFilters.purchaseType || undefined} allowClear placeholder="全部" options={['电子设备', '服务器', '服务器备件', '网络设备', '网络设备备件'].map((value) => ({ label: value, value }))} onChange={(value) => updatePoFilter('purchaseType', value)} /></QueryItem>
      </QueryBar>
      <Card size="small" title="PO单列表" extra={<Typography.Text type="secondary">共 {filteredPoRows.length} 条</Typography.Text>}>
        <Table rowKey="id" size="small" bordered columns={poColumns} dataSource={filteredPoRows} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
      {selectorConfig && <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={selectorConfig.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={selectorConfig.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={selectorConfig.onConfirm} />}
    </Space>
  );
}
