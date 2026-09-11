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

const RECEIPT_ROWS = [
  { id: 1, receiptNo: 'REC-202606110001', status: '已完成', poNo: 'PO2606030001', supplier: '北京汉信成科技发展有限公司', creator: '王英', createdAt: '2026-06-11 16:23:59', inboundOrderNo: 'PUTIN-202606110001' },
  { id: 2, receiptNo: 'REC-202608200001', status: '已完成', poNo: 'PO2608200004', supplier: '老六的公司', creator: 'admin-系统管理员', createdAt: '2026-08-20 15:30:00', inboundOrderNo: 'PUTIN-202608200002' },
  { id: 3, receiptNo: 'REC-202608110002', status: '待接收', poNo: 'PO2410230001', supplier: '老六的公司', creator: 'admin-系统管理员', createdAt: '2026-08-11 10:00:00' },
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
    { id: 1, editable: true, receiptStatus: '待接收', materialGroup: '1.资产', assetClass: '13.OFFICE EQUIPMENT', materialCode: '113004066005000', materialDesc: 'AVAYA.AVAYA扩容套件', poDesc: 'AVAYA.AVAYA扩容套件', config: '8+256', partQuantity: '-', partDesc: '-', currentReceiptQty: 2, purchaseQty: 2, untaxedUnitPrice: '1.00', untaxedSubtotal: '2.00', totalTax: '198.98', taxedUnitPrice: '99.99', taxedSubtotal: '199.98', taxRate: '1%', receivedQty: 0, draftQty: 2, agreedArrivalDate: '2024-10-23', prLineNo: '', saLineNo: 'SA2408110001-10', applicationNo: '', department: '商务采购组', businessLine: '' },
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
    { id: 1, editable: true, receiptStatus: '待接收', materialGroup: '1.资产', assetClass: '14.SERVER', materialCode: '114008042010000', materialDesc: 'Dell.R740', poDesc: 'Dell.R740-Intel Silver4210*2,DDR4_2933MHz_16G*8,Seagate_SAS12Gb_2.5寸_10k_600GB*8,双口千兆+双光口万兆(Intel X710)*1,H740P_电池*1,白金750W热插拔*2,2U2.5寸8盘位机箱*1', config: 'Intel Silver4210*2,DDR4_2933MHz_16G*8,Seagate_SAS12Gb_2.5寸_10k_600GB*8,双口千兆+双光口万兆(Intel X710)*1,H740P_电池*1,白金750W热插拔*2,2U2.5寸8盘位机箱*1', partQuantity: '-', partDesc: '-', currentReceiptQty: 1, purchaseQty: 1, untaxedUnitPrice: '-', untaxedSubtotal: '-', totalTax: '-', taxedUnitPrice: '-', taxedSubtotal: '-', taxRate: '-', receivedQty: 0, draftQty: 0, agreedArrivalDate: '-', prLineNo: '-', saLineNo: '-', applicationNo: '-', department: '-', businessLine: '-' },
  ],
};

const EMPTY_PO_FILTERS = { company: '', plate: '', poNo: '', supplier: '', receiptStatus: '', purchaseType: '' };
const EMPTY_RECEIPT_FILTERS = { receiptNo: '', poNo: '', status: '', creator: '', createdFrom: '', createdTo: '', supplier: '' };
const DIRECT_INBOUND_TYPES = new Set(['服务器', '服务器备件', '网络设备', '网络设备备件']);

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
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

function getReceiptItems(receipt) {
  const po = PO_ROWS.find((item) => item.poNo === receipt?.poNo);
  const detailItems = getPoDetail(po).items || [];
  if (receipt?.itemIds?.length) return detailItems.filter((item) => receipt.itemIds.includes(item.id));
  const receivedItems = detailItems.filter((item) => Number(item.currentReceiptQty || 0) > 0);
  return receivedItems.length > 0 ? receivedItems : detailItems;
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
      rows.push({
        id: `${item.id}-${index + 1}`,
        lineNo,
        sourceLineId: item.id,
        generatedTag,
        assetTag: completed ? generatedTag : '',
        sn: completed ? completedSn : '',
        materialGroup: item.materialGroup,
        assetClass: item.assetClass,
        materialDesc: item.materialDesc,
        config: item.config,
        partQuantity: item.partQuantity,
        partDesc: item.partDesc,
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

  return (
    <Modal
      open={open}
      title="明细信息维护"
      width={760}
      okText="保存"
      cancelText={readOnly ? '关闭' : '取消'}
      onCancel={onCancel}
      onOk={readOnly ? onCancel : () => onSave({ ...asset, sn, assetMark, remark })}
      okButtonProps={readOnly ? { style: { display: 'none' } } : undefined}
      destroyOnHidden
    >
      <Space direction="vertical" size={16} className="w-full">
        <Card size="small" title="明细信息">
          <DetailGrid columns={2} labelWidth={96}>
            <DetailItem label="资产标签号"><Readonly>{asset?.assetTag}</Readonly></DetailItem>
            <DetailItem label="资产说明"><Readonly>{asset?.materialDesc}</Readonly></DetailItem>
            <DetailItem label="SN号">{readOnly ? <Readonly>{sn}</Readonly> : <Input value={sn} onChange={(event) => setSn(event.target.value)} />}</DetailItem>
            <DetailItem label="资产标记">{readOnly ? <Readonly>{assetMark}</Readonly> : <Input value={assetMark} onChange={(event) => setAssetMark(event.target.value)} />}</DetailItem>
            <DetailItem label="备注" span={2}>{readOnly ? <Readonly>{remark}</Readonly> : <Input value={remark} onChange={(event) => setRemark(event.target.value)} />}</DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="部件信息"><Typography.Text type="secondary">暂无部件信息</Typography.Text></Card>
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
  const [selectorType, setSelectorType] = useState('');
  const [maintenanceStore, setMaintenanceStore] = useState({});
  const [maintenanceSession, setMaintenanceSession] = useState({ rows: [], tagsGenerated: false, defaultSnApplied: false });
  const [selectedMaintenanceKeys, setSelectedMaintenanceKeys] = useState([]);
  const [maintenanceScan, setMaintenanceScan] = useState('');
  const [maintenanceAsset, setMaintenanceAsset] = useState(null);
  const [maintenanceScanTargetId, setMaintenanceScanTargetId] = useState(null);
  const [maintenanceFilterId, setMaintenanceFilterId] = useState(null);

  const maintenanceRows = maintenanceSession.rows;
  const companyData = useMemo(() => toSelectData(PO_ROWS.map((item) => item.company)), []);
  const plateData = useMemo(() => toSelectData(PO_ROWS.map((item) => item.plate)), []);
  const supplierData = useMemo(() => toSelectData(PO_ROWS.map((item) => item.supplier)), []);

  const filteredPoRows = useMemo(() => PO_ROWS.filter((row) => (
    includesText(row.company, poAppliedFilters.company)
    && includesText(row.plate, poAppliedFilters.plate)
    && includesText(row.poNo, poAppliedFilters.poNo)
    && includesText(row.supplier, poAppliedFilters.supplier)
    && (!poAppliedFilters.receiptStatus || row.receiptStatus === poAppliedFilters.receiptStatus)
    && (!poAppliedFilters.purchaseType || row.purchaseType === poAppliedFilters.purchaseType)
  )), [poAppliedFilters]);

  const filteredReceiptRows = useMemo(() => receiptRows.filter((row) => {
    const date = row.createdAt ? row.createdAt.slice(0, 10) : '';
    return includesText(row.receiptNo, receiptAppliedFilters.receiptNo)
      && includesText(row.poNo, receiptAppliedFilters.poNo)
      && includesText(row.status, receiptAppliedFilters.status)
      && includesText(row.creator, receiptAppliedFilters.creator)
      && includesText(row.supplier, receiptAppliedFilters.supplier)
      && (!receiptAppliedFilters.createdFrom || date >= receiptAppliedFilters.createdFrom)
      && (!receiptAppliedFilters.createdTo || date <= receiptAppliedFilters.createdTo);
  }), [receiptRows, receiptAppliedFilters]);

  const updatePoFilter = (field, value) => setPoDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const updateReceiptFilter = (field, value) => setReceiptDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const updateReceiptDateRange = (dates) => setReceiptDraftFilters((current) => ({
    ...current,
    createdFrom: dates?.[0] ? dates[0].format('YYYY-MM-DD') : '',
    createdTo: dates?.[1] ? dates[1].format('YYYY-MM-DD') : '',
  }));

  const updateMaintenanceSession = (updater) => {
    if (!activeReceipt) return;
    setMaintenanceSession((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      setMaintenanceStore((store) => ({ ...store, [activeReceipt.receiptNo]: next }));
      return next;
    });
  };

  const openPoDetail = (row) => {
    setActivePO(row);
    setDetailPlate(row.plate || '');
    setApplicationBatch('');
    setSelectedItemKeys([]);
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
    setActivePO(PO_ROWS.find((item) => item.poNo === row.poNo) || activePO);
    setSelectedReceiptLineKeys([]);
    setView('receiptDetail');
  };

  const createReceipt = () => {
    if (selectedItemKeys.length === 0) {
      messageApi.warning('请先选择需要创建接收单的物资');
      return;
    }
    const nextId = receiptRows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    const nextReceipt = {
      id: nextId,
      receiptNo: `REC-${dayjs().format('YYYYMMDD')}${String(nextId).padStart(4, '0')}`,
      status: '待接收',
      poNo: activePO.poNo,
      supplier: activePO.supplier,
      creator: 'admin-系统管理员',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      itemIds: [...selectedItemKeys],
    };
    setReceiptRows((current) => [...current, nextReceipt]);
    setActiveReceipt(nextReceipt);
    setSelectedReceiptLineKeys([]);
    setView('receiptDetail');
    messageApi.success('接收单创建成功');
  };

  const openReceiptMaintenance = () => {
    if (!activeReceipt) return;
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
      rows: current.rows.map((row) => ({ ...row, assetTag: row.generatedTag })),
    }));
    setMaintenanceScan('');
    setMaintenanceScanTargetId(null);
    setMaintenanceFilterId(null);
    messageApi.success('已为全部接收明细生成资产标签号并实时保存');
  };

  const applyDefaultMaintenanceSn = () => {
    if (maintenanceRows.length === 0) return messageApi.warning('当前没有可维护SN号的明细');
    updateMaintenanceSession((current) => ({
      ...current,
      defaultSnApplied: true,
      rows: current.rows.map((row) => ({ ...row, sn: '缺省' })),
    }));
    messageApi.success('全部接收明细SN号已设为缺省并实时保存');
  };

  const deleteMaintenanceRows = () => {
    if (!selectedMaintenanceKeys.length) return messageApi.warning('请先选择需要删除的资产行');
    const selected = new Set(selectedMaintenanceKeys);
    updateMaintenanceSession((current) => ({ ...current, rows: current.rows.filter((row) => !selected.has(row.id)) }));
    if (maintenanceScanTargetId && selected.has(maintenanceScanTargetId)) setMaintenanceScanTargetId(null);
    if (maintenanceFilterId && selected.has(maintenanceFilterId)) setMaintenanceFilterId(null);
    setSelectedMaintenanceKeys([]);
    messageApi.success('已删除所选明细并实时保存');
  };

  const resetMaintenanceScan = () => {
    setMaintenanceScan('');
    setMaintenanceScanTargetId(null);
    setMaintenanceFilterId(null);
    setSelectedMaintenanceKeys([]);
  };

  const handleMaintenanceScan = () => {
    if (activeReceipt?.status === '已完成') return messageApi.warning('已完成接收单不可再维护SN号');
    if (!maintenanceSession.tagsGenerated) return messageApi.warning('请先生成资产标签号');
    const value = maintenanceScan.trim();
    if (!value) return;

    if (maintenanceScanTargetId) {
      const target = maintenanceRows.find((row) => row.id === maintenanceScanTargetId);
      if (!target) {
        setMaintenanceScanTargetId(null);
        return;
      }
      updateMaintenanceSession((current) => ({
        ...current,
        rows: current.rows.map((row) => row.id === target.id ? { ...row, sn: value } : row),
      }));
      setSelectedMaintenanceKeys([target.id]);
      setMaintenanceScanTargetId(null);
      setMaintenanceFilterId(null);
      setMaintenanceScan('');
      messageApi.success(`已为 ${target.assetTag} 写入SN号并实时保存`);
      return;
    }

    const matched = maintenanceRows.find((row) => row.assetTag === value);
    if (!matched) return messageApi.warning('未找到对应资产标签号');
    setMaintenanceFilterId(matched.id);
    setMaintenanceScanTargetId(matched.id);
    setSelectedMaintenanceKeys([matched.id]);
    setMaintenanceScan('');
  };

  const confirmReceipt = () => {
    if (!activeReceipt) return;
    const session = maintenanceStore[activeReceipt.receiptNo] || buildMaintenanceSession(activeReceipt);
    if (session.rows.length === 0) {
      messageApi.warning('当前没有可确认的接收资产明细');
      return;
    }
    const missingTagCount = session.rows.filter((row) => !String(row.assetTag || '').trim()).length;
    const missingSnCount = session.rows.filter((row) => !String(row.sn || '').trim()).length;
    if (missingTagCount > 0 || missingSnCount > 0) {
      messageApi.warning(`接收确认失败：${missingTagCount > 0 ? `${missingTagCount} 条资产标签号未维护` : ''}${missingTagCount > 0 && missingSnCount > 0 ? '，' : ''}${missingSnCount > 0 ? `${missingSnCount} 条SN号未维护` : ''}`);
      return;
    }
    const inboundOrderNo = `PUTIN-${dayjs().format('YYYYMMDD')}${String(activeReceipt.id).padStart(4, '0')}`;
    const completedReceipt = { ...activeReceipt, status: '已完成', inboundOrderNo };
    setReceiptRows((current) => current.map((row) => row.id === activeReceipt.id ? completedReceipt : row));
    setActiveReceipt(completedReceipt);
    messageApi.success(`接收确认成功，已生成入库单 ${inboundOrderNo}`);
  };

  const deleteReceiptLines = (visibleReceiptItems) => {
    if (selectedReceiptLineKeys.length === 0) return messageApi.warning('请先选择需要删除的接收行');
    Modal.confirm({
      title: '确认删除所选接收行？',
      content: `共选择 ${selectedReceiptLineKeys.length} 条。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const selected = new Set(selectedReceiptLineKeys);
        const nextItemIds = visibleReceiptItems.filter((item) => !selected.has(item.id)).map((item) => item.id);
        const nextReceipt = { ...activeReceipt, itemIds: nextItemIds };
        setReceiptRows((current) => current.map((row) => row.id === activeReceipt.id ? nextReceipt : row));
        setActiveReceipt(nextReceipt);
        setMaintenanceStore((store) => {
          const saved = store[activeReceipt.receiptNo];
          if (!saved) return store;
          return {
            ...store,
            [activeReceipt.receiptNo]: {
              ...saved,
              rows: saved.rows.filter((row) => !selected.has(row.sourceLineId)),
            },
          };
        });
        setSelectedReceiptLineKeys([]);
        messageApi.success('已删除所选接收行');
      },
    });
  };

  const selectorConfig = {
    company: { title: '选择公司', dataSource: companyData, onConfirm: (record) => updatePoFilter('company', record.name) },
    plate: { title: '选择板块', dataSource: plateData, onConfirm: (record) => updatePoFilter('plate', record.name) },
    supplier: { title: '选择供应商', dataSource: supplierData, onConfirm: (record) => updatePoFilter('supplier', record.name) },
    detailPlate: { title: '选择板块', dataSource: plateData, onConfirm: (record) => setDetailPlate(record.name) },
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
    { title: '操作', key: 'operation', width: 80, fixed: 'left', render: (_, row) => row.editable ? <Button type="link" className="px-0" onClick={() => messageApi.info('物资编辑字段待确认')}>编辑</Button> : '-' },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 120, render: (value) => value ? <StatusTag value={value} /> : '-' },
    { title: '物资总类', dataIndex: 'materialGroup', width: 120 },
    { title: '资产大类', dataIndex: 'assetClass', width: 180 },
    { title: '物料编码', dataIndex: 'materialCode', width: 170 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 230 },
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
    const detail = getPoDetail(activePO);
    const itemRows = detail.items || [];
    const canCreateReceipt = activePO.purchaseType === '电子设备';
    const canExecuteInbound = DIRECT_INBOUND_TYPES.has(activePO.purchaseType);
    const hasReceipt = receiptRows.some((row) => row.poNo === activePO.poNo);

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>资产接收</PageTitle>
        <Card size="small" title="PO单信息">
          <DetailGrid columns={3} labelWidth={112}>
            <DetailItem label="PO单号"><Readonly>{activePO.poNo}</Readonly></DetailItem>
            <DetailItem label="供应商"><Readonly>{activePO.supplier}</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{detail.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{activePO.poName}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{detail.procurementUnit || activePO.company}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{detail.contractSubject}</Readonly></DetailItem>
            <DetailItem label="不含税合计"><Readonly>{detail.untaxedAmount}</Readonly></DetailItem>
            <DetailItem label="合计税额"><Readonly>{detail.taxAmount}</Readonly></DetailItem>
            <DetailItem label="合计金额"><Readonly>{detail.totalAmount}</Readonly></DetailItem>
            <DetailItem label="采购员"><Readonly>{detail.buyer}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{detail.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="推送日期"><Readonly>{activePO.pushDate}</Readonly></DetailItem>
            <DetailItem label="板块"><SelectorInput value={detailPlate} placeholder="请选择板块" onOpen={() => setSelectorType('detailPlate')} /></DetailItem>
            <DetailItem label="申请批次"><Input value={applicationBatch} placeholder="请输入申请批次" onChange={(event) => setApplicationBatch(event.target.value)} /></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="PO物资明细" extra={<Typography.Text type="secondary">共 {itemRows.length} 条</Typography.Text>}>
          <Table rowKey="id" size="small" bordered columns={itemColumns} dataSource={itemRows} rowSelection={{ type: 'checkbox', selectedRowKeys: selectedItemKeys, onChange: setSelectedItemKeys, fixed: true, columnTitle: '选择', columnWidth: 64, getCheckboxProps: (record) => ({ disabled: record.receiptStatus === '已入库' }) }} scroll={{ x: 'max-content' }} pagination={false} />
        </Card>
        <div className="flex justify-center gap-3">
          {canCreateReceipt && <Button type="primary" onClick={createReceipt}>创建接收单</Button>}
          {canExecuteInbound && <Button type="primary" onClick={() => selectedItemKeys.length === 0 ? messageApi.warning('请先选择需要入库的物资') : messageApi.info('执行入库的后续字段待确认')}>执行入库</Button>}
          {hasReceipt && <Button onClick={() => openReceiptList(activePO)}>查看接收单</Button>}
          <Button onClick={() => setView('poList')}>返回</Button>
        </div>
        {selectorConfig && <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={[{ title: '名称', dataIndex: 'name' }]} searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={selectorConfig.onConfirm} />}
      </Space>
    );
  }

  if (view === 'receiptMaintenance' && activeReceipt) {
    const receiptPO = PO_ROWS.find((item) => item.poNo === activeReceipt.poNo) || activePO;
    const detail = getPoDetail(receiptPO);
    const isPending = activeReceipt.status !== '已完成';
    const scanTargetAsset = maintenanceScanTargetId ? maintenanceRows.find((row) => row.id === maintenanceScanTargetId) || null : null;
    const visibleMaintenanceRows = maintenanceFilterId ? maintenanceRows.filter((row) => row.id === maintenanceFilterId) : maintenanceRows;
    const scanPlaceholder = !isPending
      ? '接收已完成'
      : !maintenanceSession.tagsGenerated
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
      { title: '操作', key: 'operation', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => setMaintenanceAsset(row)}>{isPending ? '编辑' : '查看'}</Button> },
    ];

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>接收单明细</PageTitle>
        <Card size="small" title="接收单信息">
          <DetailGrid columns={3} labelWidth={118}>
            <DetailItem label="接收单号"><Readonly>{activeReceipt.receiptNo}</Readonly></DetailItem>
            <DetailItem label="接收人"><Readonly>{activeReceipt.creator}</Readonly></DetailItem>
            <DetailItem label="接收时间"><Readonly>{activeReceipt.createdAt?.slice(0, 10)}</Readonly></DetailItem>
            <DetailItem label="PO单号"><Readonly>{activeReceipt.poNo}</Readonly></DetailItem>
            <DetailItem label="供应商"><Readonly>{activeReceipt.supplier}</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{detail.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{receiptPO?.poName}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{detail.procurementUnit || receiptPO?.company}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{detail.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{receiptPO?.plate}</Readonly></DetailItem>
            <DetailItem label="部门"><Readonly>{detail.department}</Readonly></DetailItem>
            <DetailItem label="采购员"><Readonly>{detail.buyer}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{detail.contractSubject}</Readonly></DetailItem>
            <DetailItem label="订单日期"><Readonly>{detail.orderDate || receiptPO?.pushDate}</Readonly></DetailItem>
            <DetailItem label="接收单状态"><StatusTag value={activeReceipt.status} /></DetailItem>
            <DetailItem label="申请批次"><Readonly>{applicationBatch}</Readonly></DetailItem>
          </DetailGrid>
        </Card>

        <QueryBar onQuery={handleMaintenanceScan} onReset={resetMaintenanceScan}>
          <QueryItem label="扫描光标">
            <Input value={maintenanceScan} allowClear disabled={!isPending || !maintenanceSession.tagsGenerated} placeholder={scanPlaceholder} onChange={(event) => setMaintenanceScan(event.target.value)} onPressEnter={handleMaintenanceScan} />
          </QueryItem>
        </QueryBar>

        <Card size="small" title="接收资产明细" extra={(
          <Space>
            {isPending && <Button danger onClick={deleteMaintenanceRows}>删除行</Button>}
            {isPending && !maintenanceSession.tagsGenerated && <Button onClick={generateMaintenanceTags}>生成标签号</Button>}
            {isPending && !maintenanceSession.defaultSnApplied && <Button onClick={applyDefaultMaintenanceSn}>维护SN号</Button>}
            {maintenanceSession.tagsGenerated && maintenanceRows.length > 0 && <Button onClick={() => messageApi.success('已发起全部标签号打印（原型）')}>打印标签号</Button>}
          </Space>
        )}>
          <Table rowKey="id" size="small" bordered columns={maintenanceColumns} dataSource={visibleMaintenanceRows} rowSelection={isPending ? { selectedRowKeys: selectedMaintenanceKeys, onChange: setSelectedMaintenanceKeys, fixed: true, columnTitle: '选择', columnWidth: 64 } : undefined} scroll={{ x: 'max-content' }} pagination={false} />
        </Card>

        <div className="flex justify-center gap-3"><Button onClick={() => setView('receiptDetail')}>返回</Button></div>
        <ReceiptLineMaintenanceModal
          key={maintenanceAsset?.id || 'closed'}
          open={Boolean(maintenanceAsset)}
          asset={maintenanceAsset}
          readOnly={!isPending}
          onCancel={() => setMaintenanceAsset(null)}
          onSave={(nextAsset) => {
            updateMaintenanceSession((current) => ({ ...current, rows: current.rows.map((row) => row.id === nextAsset.id ? nextAsset : row) }));
            setMaintenanceAsset(null);
            messageApi.success('明细信息已保存');
          }}
        />
      </Space>
    );
  }

  if (view === 'receiptDetail' && activeReceipt) {
    const receiptPO = PO_ROWS.find((item) => item.poNo === activeReceipt.poNo) || activePO;
    const detail = getPoDetail(receiptPO);
    const detailItems = detail.items || [];
    const receiptItems = activeReceipt.itemIds?.length
      ? detailItems.filter((item) => activeReceipt.itemIds.includes(item.id))
      : detailItems.filter((item) => Number(item.currentReceiptQty || 0) > 0);
    const visibleReceiptItems = receiptItems.length > 0 ? receiptItems : detailItems;
    const canOperateReceipt = activeReceipt.status !== '已完成';

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
            <DetailItem label="板块"><Readonly>{receiptPO?.plate}</Readonly></DetailItem>
            <DetailItem label="接收人"><Readonly>{activeReceipt.creator}</Readonly></DetailItem>
            <DetailItem label="接收单状态"><StatusTag value={activeReceipt.status} /></DetailItem>
            <DetailItem label="接收时间"><Readonly>{activeReceipt.createdAt?.slice(0, 10)}</Readonly></DetailItem>
            <DetailItem label="申请批次"><Readonly>-</Readonly></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="接收物资明细" extra={canOperateReceipt ? <Button danger icon={<Trash2 size={14} />} onClick={() => deleteReceiptLines(visibleReceiptItems)}>删除接收行</Button> : null}>
          <Table rowKey="id" size="small" bordered columns={receiptDetailColumns} dataSource={visibleReceiptItems} rowSelection={canOperateReceipt ? { type: 'checkbox', selectedRowKeys: selectedReceiptLineKeys, onChange: setSelectedReceiptLineKeys, fixed: true, columnTitle: '选择', columnWidth: 64 } : undefined} scroll={{ x: 'max-content' }} pagination={false} />
        </Card>
        <div className="flex justify-center gap-3">
          <Button onClick={openReceiptMaintenance}>{canOperateReceipt ? '维护接收明细' : '查看接收明细'}</Button>
          {canOperateReceipt && <Button danger onClick={() => messageApi.info('取消接收规则待确认')}>取消接收</Button>}
          {canOperateReceipt && <Button type="primary" onClick={confirmReceipt}>接收确认</Button>}
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
          const filters = activePO ? { ...EMPTY_RECEIPT_FILTERS, poNo: activePO.poNo } : EMPTY_RECEIPT_FILTERS;
          setReceiptDraftFilters(filters);
          setReceiptAppliedFilters(filters);
          setSelectedReceiptKeys([]);
        }}>
          <QueryItem label="接收单号"><Input value={receiptDraftFilters.receiptNo} allowClear placeholder="请输入接收单号" onChange={(event) => updateReceiptFilter('receiptNo', event.target.value)} /></QueryItem>
          <QueryItem label="PO单号"><Input value={receiptDraftFilters.poNo} allowClear placeholder="请输入PO单号" onChange={(event) => updateReceiptFilter('poNo', event.target.value)} /></QueryItem>
          <QueryItem label="单据状态"><Select value={receiptDraftFilters.status || undefined} allowClear placeholder="请选择" options={[{ label: '待接收', value: '待接收' }, { label: '已完成', value: '已完成' }]} onChange={(value) => updateReceiptFilter('status', value)} /></QueryItem>
          <QueryItem label="制单人"><Input value={receiptDraftFilters.creator} allowClear placeholder="请输入制单人" onChange={(event) => updateReceiptFilter('creator', event.target.value)} /></QueryItem>
          <QueryItem label="制单时间"><DatePicker.RangePicker value={receiptDateRange} style={{ width: '100%' }} format="YYYY-MM-DD" allowClear onChange={updateReceiptDateRange} /></QueryItem>
          <QueryItem label="供应商"><Input value={receiptDraftFilters.supplier} allowClear placeholder="请输入供应商" onChange={(event) => updateReceiptFilter('supplier', event.target.value)} /></QueryItem>
        </QueryBar>
        <Card size="small" title="接收单列表" extra={<Typography.Text type="secondary">共 {filteredReceiptRows.length} 条</Typography.Text>}>
          <div className="mb-3 flex justify-end">
            <Button danger icon={<Trash2 size={14} />} onClick={() => {
              if (selectedReceiptKeys.length === 0) return messageApi.warning('请先选择需要删除的接收单');
              const selected = new Set(selectedReceiptKeys);
              setReceiptRows((current) => current.filter((row) => !selected.has(row.id)));
              setSelectedReceiptKeys([]);
              messageApi.success('已删除所选接收单');
            }}>删除接收单</Button>
          </div>
          <Table rowKey="id" size="small" bordered columns={receiptColumns} dataSource={filteredReceiptRows} rowSelection={{ type: 'checkbox', selectedRowKeys: selectedReceiptKeys, onChange: setSelectedReceiptKeys, fixed: true, columnTitle: '选择', columnWidth: 64 }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
        </Card>
        <div className="flex justify-center gap-3"><Button onClick={() => setView('poList')}>返回</Button></div>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>资产接收</PageTitle>
      <QueryBar onQuery={() => setPoAppliedFilters({ ...poDraftFilters })} onReset={() => { setPoDraftFilters(EMPTY_PO_FILTERS); setPoAppliedFilters(EMPTY_PO_FILTERS); }}>
        <QueryItem label="公司"><SelectorInput value={poDraftFilters.company} placeholder="请选择公司" onOpen={() => setSelectorType('company')} /></QueryItem>
        <QueryItem label="板块"><SelectorInput value={poDraftFilters.plate} placeholder="请选择板块" onOpen={() => setSelectorType('plate')} /></QueryItem>
        <QueryItem label="PO单号"><Input value={poDraftFilters.poNo} allowClear placeholder="请输入PO单号" onChange={(event) => updatePoFilter('poNo', event.target.value)} /></QueryItem>
        <QueryItem label="供应商"><SelectorInput value={poDraftFilters.supplier} placeholder="请选择供应商" onOpen={() => setSelectorType('supplier')} /></QueryItem>
        <QueryItem label="接收状态"><Select value={poDraftFilters.receiptStatus || undefined} allowClear placeholder="全部" options={[{ label: '待接收', value: '待接收' }, { label: '已入库', value: '已入库' }]} onChange={(value) => updatePoFilter('receiptStatus', value)} /></QueryItem>
        <QueryItem label="采购类型"><Select value={poDraftFilters.purchaseType || undefined} allowClear placeholder="全部" options={['电子设备', '服务器', '服务器备件', '网络设备', '网络设备备件'].map((value) => ({ label: value, value }))} onChange={(value) => updatePoFilter('purchaseType', value)} /></QueryItem>
      </QueryBar>
      <Card size="small" title="PO单列表" extra={<Typography.Text type="secondary">共 {filteredPoRows.length} 条</Typography.Text>}>
        <Table rowKey="id" size="small" bordered columns={poColumns} dataSource={filteredPoRows} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
      {selectorConfig && <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={[{ title: '名称', dataIndex: 'name' }]} searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={selectorConfig.onConfirm} />}
    </Space>
  );
}
