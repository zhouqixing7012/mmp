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
import { Printer, Search, Trash2 } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import {
  EXISTING_ASSET_SNS,
  INITIAL_PO_ITEMS,
  INITIAL_PO_ROWS,
  INITIAL_RECEIPTS,
  MATERIAL_OPTIONS,
  WAREHOUSE_BY_COMPANY,
} from './consumableReceiptMock';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const CURRENT_USER = '115102-王英';
const GENERATED_INBOUND_STORAGE_KEY = 'mmp.inventory.generatedInboundRows.v1';
const CONSUMABLE_STOCK_STORAGE_KEY = 'mmp.inventory.consumableWarehouseStock.v1';
const EMPTY_PO_FILTERS = {
  company: '', plate: '', poNo: '', supplier: '', receiptStatus: '', purchaseType: '', pushFrom: '', pushTo: '',
};
const EMPTY_RECEIPT_FILTERS = {
  receiptNo: '', poNo: '', status: '', creator: '', createdFrom: '', createdTo: '', supplier: '',
};

const round2 = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
const money = (value) => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const count = (value) => Number(value || 0).toLocaleString('zh-CN');
const includesText = (value, query) => !query || String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
const remainingQty = (item) => Math.max(0, Number(item.purchaseQty || 0) - Number(item.receivedQty || 0) - Number(item.draftQty || 0));
const selectorData = (values) => [...new Set(values.filter(Boolean))].map((name, index) => ({ id: index + 1, name }));
const docNo = (prefix, seq) => `${prefix}-${dayjs().format('YYYYMMDD')}${String(seq).padStart(4, '0')}`;
const formatPartDesc = (value) => String(value || '').split('@').filter(Boolean).join(' / ') || '-';
const splitPartNames = (value, countValue) => {
  const source = String(value || '').split('@').filter(Boolean);
  const size = Math.max(0, Number(countValue || 0));
  return Array.from({ length: size }, (_, index) => source[index] || `部件${index + 1}`);
};
const buildPartRows = (line, assetTag = '') => {
  const childCount = Math.max(0, Number(line.partQuantity || 0) - 1);
  const names = splitPartNames(line.partDesc, childCount);
  return names.map((name, index) => ({
    id: `${line.id}-part-${index + 1}`,
    partName: name,
    partTag: assetTag ? `${assetTag}-${index + 1}` : '',
    partSn: '',
  }));
};
const serializeParts = (parts) => (parts || []).map((part) => `${part.partName || ''}#${part.partTag || ''}#${part.partSn || ''}`).join('@');
const lineMoney = (item, quantity) => {
  const qty = Number(quantity || 0);
  const untaxedUnit = round2(item.untaxedUnitPrice);
  const unitTax = round2(untaxedUnit * Number(item.taxRate || 0));
  return {
    untaxedUnit,
    unitTax,
    untaxedAmount: round2(qty * untaxedUnit),
    taxAmount: round2(qty * unitTax),
    taxedUnit: round2(untaxedUnit + unitTax),
    taxedAmount: round2(qty * (untaxedUnit + unitTax)),
  };
};

function SelectorInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} className="text-[#1677ff]" />} />
    </div>
  );
}

function PageTitle() {
  return <Typography.Title level={3} className="mb-0">耗材接收</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function readStorageRows(key) {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function persistInboundAndStock(inboundRow, stockUpdates = []) {
  if (typeof window === 'undefined') return true;
  const previousInbound = window.localStorage.getItem(GENERATED_INBOUND_STORAGE_KEY);
  const previousStock = window.localStorage.getItem(CONSUMABLE_STOCK_STORAGE_KEY);
  try {
    const inboundRows = readStorageRows(GENERATED_INBOUND_STORAGE_KEY).filter((row) => row.documentNo !== inboundRow.documentNo);
    window.localStorage.setItem(GENERATED_INBOUND_STORAGE_KEY, JSON.stringify([inboundRow, ...inboundRows]));

    if (stockUpdates.length) {
      const stockRows = readStorageRows(CONSUMABLE_STOCK_STORAGE_KEY);
      const nextStock = [...stockRows];
      stockUpdates.forEach((update) => {
        const index = nextStock.findIndex((row) => row.warehouse === update.warehouse && row.materialCode === update.materialCode);
        if (index >= 0) {
          nextStock[index] = { ...nextStock[index], quantity: Number(nextStock[index].quantity || 0) + Number(update.quantity || 0) };
        } else {
          nextStock.push({ ...update });
        }
      });
      window.localStorage.setItem(CONSUMABLE_STOCK_STORAGE_KEY, JSON.stringify(nextStock));
    }
    return true;
  } catch (error) {
    if (previousInbound === null) window.localStorage.removeItem(GENERATED_INBOUND_STORAGE_KEY);
    else window.localStorage.setItem(GENERATED_INBOUND_STORAGE_KEY, previousInbound);
    if (previousStock === null) window.localStorage.removeItem(CONSUMABLE_STOCK_STORAGE_KEY);
    else window.localStorage.setItem(CONSUMABLE_STOCK_STORAGE_KEY, previousStock);
    return false;
  }
}

function resolveWarehouse(company) {
  const value = WAREHOUSE_BY_COMPANY[company];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export default function ConsumableReceiptPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [view, setView] = useState('poList');
  const [poRows, setPoRows] = useState(INITIAL_PO_ROWS);
  const [poItems, setPoItems] = useState(INITIAL_PO_ITEMS);
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);
  const [activePO, setActivePO] = useState(null);
  const [activeReceiptNo, setActiveReceiptNo] = useState('');
  const [poDraft, setPoDraft] = useState(EMPTY_PO_FILTERS);
  const [poFilters, setPoFilters] = useState(EMPTY_PO_FILTERS);
  const [receiptDraft, setReceiptDraft] = useState(EMPTY_RECEIPT_FILTERS);
  const [receiptFilters, setReceiptFilters] = useState(EMPTY_RECEIPT_FILTERS);
  const [selectedPoItems, setSelectedPoItems] = useState([]);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [maintenanceLineIds, setMaintenanceLineIds] = useState([]);
  const [selectorType, setSelectorType] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [partNamesDraft, setPartNamesDraft] = useState(null);
  const [scanInput, setScanInput] = useState({ value: '', stage: 'tag', detailId: null });
  const [detailEditor, setDetailEditor] = useState(null);
  const [detailDraft, setDetailDraft] = useState(null);
  const [poPage, setPoPage] = useState(1);
  const [poPageSize, setPoPageSize] = useState(10);
  const [receiptPage, setReceiptPage] = useState(1);
  const [receiptPageSize, setReceiptPageSize] = useState(10);
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [maintenancePageSize, setMaintenancePageSize] = useState(10);

  const activeReceipt = useMemo(
    () => receipts.find((item) => item.receiptNo === activeReceiptNo) || null,
    [receipts, activeReceiptNo],
  );
  const activeItems = activePO ? (poItems[activePO.poNo] || []) : [];
  const companies = useMemo(() => selectorData(poRows.map((item) => item.company)), [poRows]);
  const plates = useMemo(() => selectorData(poRows.map((item) => item.plate)), [poRows]);
  const suppliers = useMemo(() => selectorData(poRows.map((item) => item.supplier)), [poRows]);

  const filteredPos = useMemo(() => poRows.filter((row) => (
    includesText(row.company, poFilters.company)
    && includesText(row.plate, poFilters.plate)
    && includesText(row.poNo, poFilters.poNo)
    && includesText(row.supplier, poFilters.supplier)
    && (!poFilters.receiptStatus || row.receiptStatus === poFilters.receiptStatus)
    && (!poFilters.purchaseType || row.purchaseType === poFilters.purchaseType)
    && (!poFilters.pushFrom || row.pushDate >= poFilters.pushFrom)
    && (!poFilters.pushTo || row.pushDate <= poFilters.pushTo)
  )), [poRows, poFilters]);

  const filteredReceipts = useMemo(() => [...receipts].filter((row) => {
    const date = row.createdAt?.slice(0, 10) || '';
    return includesText(row.receiptNo, receiptFilters.receiptNo)
      && includesText(row.poNo, receiptFilters.poNo)
      && (!receiptFilters.status || row.status === receiptFilters.status)
      && includesText(row.creator, receiptFilters.creator)
      && includesText(row.supplier, receiptFilters.supplier)
      && (!receiptFilters.createdFrom || date >= receiptFilters.createdFrom)
      && (!receiptFilters.createdTo || date <= receiptFilters.createdTo);
  }).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))), [receipts, receiptFilters]);

  const setPoFilter = (field, value) => setPoDraft((current) => ({ ...current, [field]: value || '' }));
  const setReceiptFilter = (field, value) => setReceiptDraft((current) => ({ ...current, [field]: value || '' }));
  const updateActivePoField = (field, value) => {
    if (!activePO) return;
    setPoRows((list) => list.map((row) => (row.poNo === activePO.poNo ? { ...row, [field]: value } : row)));
    setActivePO((row) => ({ ...row, [field]: value }));
  };

  const selectorConfig = {
    company: { title: '选择公司', dataSource: companies, confirm: (record) => setPoFilter('company', record.name) },
    plate: { title: '选择板块', dataSource: plates, confirm: (record) => setPoFilter('plate', record.name) },
    supplier: { title: '选择供应商', dataSource: suppliers, confirm: (record) => setPoFilter('supplier', record.name) },
    receiptSupplier: { title: '选择供应商', dataSource: suppliers, confirm: (record) => setReceiptFilter('supplier', record.name) },
    detailPlate: { title: '选择板块', dataSource: plates, confirm: (record) => updateActivePoField('plate', record.name) },
    material: {
      title: '选择物料',
      dataSource: MATERIAL_OPTIONS.filter((item) => item.purchaseType === activePO?.purchaseType),
      columns: [
        { title: '物料编码', dataIndex: 'code' },
        { title: '物料名称', dataIndex: 'name' },
        { title: '配置', dataIndex: 'config' },
      ],
      searchFields: [
        { label: '物料编码', name: 'code', dataIndex: 'code' },
        { label: '物料名称', name: 'name', dataIndex: 'name' },
      ],
      confirm: (record) => setEditDraft((item) => ({
        ...item,
        materialGroup: record.materialGroup,
        assetClass: record.consumableClass,
        materialCode: record.code,
        materialDesc: record.name,
        config: record.config,
      })),
    },
  }[selectorType];

  const changePoQty = (poNo, lines, mode) => setPoItems((current) => ({
    ...current,
    [poNo]: (current[poNo] || []).map((item) => {
      const line = lines.find((candidate) => candidate.sourceItemId === item.id);
      if (!line) return item;
      const qty = Number(line.actualReceiveQty || 0);
      const next = mode === 'occupy'
        ? { ...item, draftQty: Number(item.draftQty || 0) + qty }
        : { ...item, draftQty: Math.max(0, Number(item.draftQty || 0) - qty) };
      return { ...next, currentReceiveQty: remainingQty(next) };
    }),
  }));

  const completePoQty = (poNo, lines, isDurable) => {
    const nextItems = (poItems[poNo] || []).map((item) => {
      const line = lines.find((candidate) => candidate.sourceItemId === item.id);
      if (!line) return item;
      const qty = Number(line.actualReceiveQty || 0);
      const next = {
        ...item,
        draftQty: Math.max(0, Number(item.draftQty || 0) - qty),
        receivedQty: Number(item.receivedQty || 0) + qty,
      };
      const hasRemaining = remainingQty(next) > 0;
      return {
        ...next,
        currentReceiveQty: remainingQty(next),
        receiptStatus: hasRemaining ? '待接收' : (isDurable ? '已接收' : '已入库'),
      };
    });
    setPoItems((current) => ({ ...current, [poNo]: nextItems }));
    const hasRemaining = nextItems.some((item) => remainingQty(item) > 0);
    const nextStatus = hasRemaining ? '待接收' : (isDurable ? '已接收' : '已入库');
    setPoRows((list) => list.map((row) => (row.poNo === poNo ? { ...row, receiptStatus: nextStatus } : row)));
    setActivePO((row) => (row?.poNo === poNo ? { ...row, receiptStatus: nextStatus } : row));
  };

  const openPo = (row) => {
    setActivePO(row);
    setSelectedPoItems([]);
    setView('poDetail');
  };

  const openReceiptList = (po = null) => {
    const filters = po ? { ...EMPTY_RECEIPT_FILTERS, poNo: po.poNo } : { ...EMPTY_RECEIPT_FILTERS };
    setActivePO(po);
    setReceiptDraft(filters);
    setReceiptFilters(filters);
    setSelectedReceipts([]);
    setReceiptPage(1);
    setView('receiptList');
  };

  const openReceipt = (row) => {
    setActiveReceiptNo(row.receiptNo);
    setSelectedLines([]);
    setView('receiptDetail');
  };

  const saveItem = () => {
    const qty = Number(editDraft?.currentReceiveQty || 0);
    if (!Number.isInteger(qty) || qty <= 0) return messageApi.error('接收数量必须为大于 0 的整数');
    if (qty > remainingQty(editItem)) return messageApi.error('接收数量不能超过可接收数量！');
    if (editDraft.isPart) {
      const partQuantity = Number(editDraft.partQuantity || 0);
      if (!Number.isInteger(partQuantity) || partQuantity < 2 || partQuantity > 100) return messageApi.error('请输入 2～100 之间的整数！');
    }
    setPoItems((current) => ({
      ...current,
      [activePO.poNo]: current[activePO.poNo].map((item) => (item.id === editItem.id ? { ...item, ...editDraft } : item)),
    }));
    setEditItem(null);
    setEditDraft(null);
    return undefined;
  };

  const openPartMaintenance = () => {
    const partQuantity = Number(editDraft?.partQuantity || 0);
    if (!Number.isInteger(partQuantity) || partQuantity < 2 || partQuantity > 100) return messageApi.warning('请填写部件数量！');
    setPartNamesDraft(splitPartNames(editDraft.partDesc, partQuantity - 1));
    return undefined;
  };

  const savePartNames = () => {
    const names = (partNamesDraft || []).map((name, index) => String(name || '').trim() || `部件${index + 1}`);
    setEditDraft((current) => ({ ...current, partDesc: names.join('@') }));
    setPartNamesDraft(null);
  };

  const createReceipt = () => {
    if (!selectedPoItems.length) return messageApi.warning('请选择要接收的物料！');
    if (!String(activePO?.plate || '').trim()) return messageApi.warning('请选择板块！');
    const source = activeItems.filter((item) => selectedPoItems.includes(item.id) && Number(item.currentReceiveQty || 0) > 0 && remainingQty(item) > 0);
    if (!source.length) return messageApi.warning('所选物资当前没有可接收数量');
    const lines = source.map((item, index) => {
      const calc = lineMoney(item, item.currentReceiveQty);
      return {
        id: index + 1,
        sourceItemId: item.id,
        materialGroup: item.materialGroup,
        assetClass: item.assetClass,
        materialCode: item.materialCode,
        materialDesc: item.materialDesc,
        config: item.config,
        partQuantity: item.isPart ? item.partQuantity : 0,
        partDesc: item.isPart ? item.partDesc : '',
        actualReceiveQty: item.currentReceiveQty,
        purchaseQty: item.purchaseQty,
        untaxedUnitPrice: calc.untaxedUnit,
        untaxedAmount: calc.untaxedAmount,
        taxAmount: calc.taxAmount,
        taxedUnitPrice: calc.taxedUnit,
        taxedAmount: calc.taxedAmount,
        taxRate: item.taxRate,
        promisedArrivalDate: item.promisedArrivalDate,
        prLine: item.prLine,
        saLine: item.saLine,
        applicationNo: item.applicationNo,
        department: item.department,
        businessLine: item.businessLine,
        applicant: item.applicant,
      };
    });
    const id = Math.max(0, ...receipts.map((item) => Number(item.id || 0))) + 1;
    const receipt = {
      id,
      receiptNo: docNo('REC', id),
      status: '草稿',
      poNo: activePO.poNo,
      poName: activePO.poName,
      supplier: activePO.supplier,
      supplierPhone: activePO.supplierPhone,
      procurementUnit: activePO.procurementUnit,
      procurementUnitPhone: activePO.procurementUnitPhone,
      buyer: activePO.buyer,
      buyerPhone: activePO.buyerPhone,
      contractSubject: activePO.contractSubject,
      plate: activePO.plate,
      department: lines[0]?.department || '-',
      creator: CURRENT_USER,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      receiver: '',
      receiptAt: '',
      orderDate: activePO.orderDate || activePO.pushDate,
      applicationBatch: activePO.applicationBatch || '',
      purchaseType: activePO.purchaseType,
      lines,
      details: [],
    };
    changePoQty(activePO.poNo, lines, 'occupy');
    setReceipts((list) => [receipt, ...list]);
    setActiveReceiptNo(receipt.receiptNo);
    setSelectedPoItems([]);
    setView('receiptDetail');
    messageApi.success(`接收单 ${receipt.receiptNo} 创建成功`);
    return undefined;
  };

  const buildDetailsForReceipt = (receipt) => {
    const existing = receipt.details || [];
    const generated = [];
    receipt.lines.forEach((line) => {
      const existingForLine = existing.filter((detail) => detail.lineId === line.id);
      const missing = Math.max(0, Number(line.actualReceiveQty || 0) - existingForLine.length);
      Array.from({ length: missing }, (_, index) => index + 1).forEach((sequence) => {
        const id = `${line.id}-${existingForLine.length + sequence}`;
        generated.push({
          id,
          lineId: line.id,
          assetTag: '',
          sn: '',
          materialGroup: line.materialGroup,
          materialCode: line.materialCode,
          consumableClass: line.assetClass,
          consumableDesc: line.materialDesc,
          config: line.config,
          partQuantity: line.partQuantity || 0,
          partDesc: line.partDesc || '',
          parts: buildPartRows(line),
          quantity: 1,
          untaxedUnitPrice: line.untaxedUnitPrice,
          taxAmount: round2(line.taxAmount / Math.max(1, line.actualReceiveQty)),
          prLine: line.prLine,
          saLine: line.saLine,
          applicant: line.applicant || '-',
          businessLine: line.businessLine,
          remark: '',
        });
      });
    });
    return [...existing, ...generated];
  };

  const openMaintenance = () => {
    if (!activeReceipt || activeReceipt.purchaseType !== '低值耐用品') return;
    if (!activeReceipt.lines.length) return messageApi.warning('请先维护接收信息！');
    const invalidIndex = activeReceipt.lines.findIndex((line) => Number(line.actualReceiveQty || 0) <= 0);
    if (invalidIndex >= 0) return messageApi.warning(`第 ${invalidIndex + 1} 行，未维护接收数量！`);
    const details = buildDetailsForReceipt(activeReceipt);
    setReceipts((list) => list.map((receipt) => (receipt.receiptNo === activeReceipt.receiptNo ? { ...receipt, details } : receipt)));
    setMaintenanceLineIds(activeReceipt.lines.map((line) => line.id));
    setSelectedDetails([]);
    setMaintenancePage(1);
    setScanInput({ value: '', stage: 'tag', detailId: null });
    setView('maintenance');
    return undefined;
  };

  const performDeleteReceiptLines = () => {
    const ids = new Set(selectedLines);
    const removedLines = activeReceipt.lines.filter((line) => ids.has(line.id));
    changePoQty(activeReceipt.poNo, removedLines, 'release');
    setReceipts((list) => list.map((receipt) => (
      receipt.receiptNo === activeReceipt.receiptNo
        ? {
          ...receipt,
          lines: receipt.lines.filter((line) => !ids.has(line.id)),
          details: (receipt.details || []).filter((detail) => !ids.has(detail.lineId)),
        }
        : receipt
    )));
    setSelectedLines([]);
    messageApi.success('已删除所选接收行');
  };

  const deleteReceiptLines = () => {
    if (!selectedLines.length) return messageApi.warning('请先选择需要删除的接收行');
    Modal.confirm({
      title: '确认删除接收行？',
      content: `将删除已选择的 ${selectedLines.length} 条接收行，并释放对应 PO 草稿占用数量。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: performDeleteReceiptLines,
    });
    return undefined;
  };

  const collectOtherRealSns = (excludeReceiptNo = '', excludeDetailId = '') => {
    const values = new Set(EXISTING_ASSET_SNS.filter(Boolean));
    receipts.forEach((receipt) => {
      (receipt.details || []).forEach((detail) => {
        if (receipt.receiptNo === excludeReceiptNo && excludeDetailId === null) return;
        if (receipt.receiptNo === excludeReceiptNo && detail.id === excludeDetailId) return;
        if (detail.sn && detail.sn !== '缺省') values.add(detail.sn);
        (detail.parts || []).forEach((part) => {
          if (part.partSn && part.partSn !== '缺省') values.add(part.partSn);
        });
      });
    });
    return values;
  };

  const duplicateSn = (sn, detailId) => {
    const value = String(sn || '').trim();
    if (!value || value === '缺省') return false;
    return collectOtherRealSns(activeReceiptNo, detailId).has(value);
  };

  const setDetailSn = (detailId, sn) => {
    const value = String(sn || '').trim();
    if (duplicateSn(value, detailId)) return messageApi.error(`SN 号：${value} 已存在！`);
    setReceipts((list) => list.map((receipt) => (
      receipt.receiptNo === activeReceiptNo
        ? { ...receipt, details: receipt.details.map((detail) => (detail.id === detailId ? { ...detail, sn: value } : detail)) }
        : receipt
    )));
    return undefined;
  };

  const generateTags = () => {
    const blankCount = (activeReceipt.details || []).filter((detail) => !detail.assetTag).length;
    if (!blankCount) return;
    let seq = (activeReceipt.details || []).filter((detail) => detail.assetTag).length + 1;
    setReceipts((list) => list.map((receipt) => (
      receipt.receiptNo === activeReceiptNo
        ? {
          ...receipt,
          details: receipt.details.map((detail) => {
            if (detail.assetTag) return detail;
            const assetTag = `${receipt.procurementUnit}-${receipt.plate || 'NA'}-${detail.materialCode}-${String(seq++).padStart(6, '0')}`;
            return {
              ...detail,
              assetTag,
              parts: (detail.parts || []).map((part, index) => ({ ...part, partTag: `${assetTag}-${index + 1}` })),
            };
          }),
        }
        : receipt
    )));
    setScanInput({ value: '', stage: 'tag', detailId: null });
    messageApi.success(`已为 ${blankCount} 条空白耗材标签号生成标签号并实时保存`);
  };

  const fillDefaultSn = () => {
    const blankCount = (activeReceipt.details || []).filter((detail) => !String(detail.sn || '').trim()).length;
    if (!blankCount) return messageApi.info('所有 SN 号均已维护');
    setReceipts((list) => list.map((receipt) => (
      receipt.receiptNo === activeReceiptNo
        ? { ...receipt, details: receipt.details.map((detail) => (!detail.sn ? { ...detail, sn: '缺省' } : detail)) }
        : receipt
    )));
    messageApi.success(`已为 ${blankCount} 条空白 SN 号维护“缺省”并实时保存`);
    return undefined;
  };

  const printLabels = () => (
    (activeReceipt.details || []).some((detail) => !detail.assetTag)
      ? messageApi.warning('有未维护的标签号，请先生成标签号')
      : messageApi.success('标签打印批次已生成')
  );

  const performDeleteReceipts = () => {
    const ids = new Set(selectedReceipts);
    receipts.filter((receipt) => ids.has(receipt.id)).forEach((receipt) => changePoQty(receipt.poNo, receipt.lines, 'release'));
    setReceipts((list) => list.filter((receipt) => !ids.has(receipt.id)));
    setSelectedReceipts([]);
    messageApi.success('已删除所选草稿接收单');
  };

  const deleteReceipts = () => {
    if (!selectedReceipts.length) return messageApi.warning('请先选择需要删除的接收单！');
    Modal.confirm({
      title: '确认删除接收单？',
      content: `将删除已选择的 ${selectedReceipts.length} 张草稿接收单，并释放对应 PO 草稿占用数量。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: performDeleteReceipts,
    });
    return undefined;
  };

  const performDeleteDetails = () => {
    const ids = new Set(selectedDetails);
    const removed = activeReceipt.details.filter((detail) => ids.has(detail.id));
    const byLine = removed.reduce((result, detail) => ({
      ...result,
      [detail.lineId]: (result[detail.lineId] || 0) + 1,
    }), {});
    const nextLines = activeReceipt.lines.map((line) => {
      const qty = Math.max(0, Number(line.actualReceiveQty || 0) - (byLine[line.id] || 0));
      const calc = lineMoney(line, qty);
      return {
        ...line,
        actualReceiveQty: qty,
        untaxedAmount: calc.untaxedAmount,
        taxAmount: calc.taxAmount,
        taxedUnitPrice: calc.taxedUnit,
        taxedAmount: calc.taxedAmount,
      };
    }).filter((line) => Number(line.actualReceiveQty || 0) > 0);

    setReceipts((list) => list.map((receipt) => (
      receipt.receiptNo === activeReceiptNo
        ? { ...receipt, lines: nextLines, details: receipt.details.filter((detail) => !ids.has(detail.id)) }
        : receipt
    )));
    setPoItems((current) => ({
      ...current,
      [activeReceipt.poNo]: current[activeReceipt.poNo].map((item) => {
        const line = activeReceipt.lines.find((candidate) => candidate.sourceItemId === item.id);
        if (!line || !byLine[line.id]) return item;
        const next = { ...item, draftQty: Math.max(0, Number(item.draftQty || 0) - byLine[line.id]) };
        return { ...next, currentReceiveQty: remainingQty(next) };
      }),
    }));
    setMaintenanceLineIds(nextLines.map((line) => line.id));
    setSelectedDetails([]);
    messageApi.success('已删除所选接收明细并实时保存');
  };

  const deleteDetails = () => {
    if (!selectedDetails.length) return messageApi.warning('请先选择需要删除的接收明细');
    Modal.confirm({
      title: '确认删除接收明细？',
      content: `将删除已选择的 ${selectedDetails.length} 条逐件明细，并同步减少接收数量、释放 PO 草稿占用数量。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: performDeleteDetails,
    });
    return undefined;
  };

  const handleScanInput = () => {
    const value = scanInput.value.trim();
    if (!value || !activeReceipt) return;
    const details = activeReceipt.details || [];
    const allTagsGenerated = details.length > 0 && details.every((detail) => String(detail.assetTag || '').trim());
    if (!allTagsGenerated) return messageApi.warning('请先生成全部标签号');

    if (scanInput.stage === 'tag') {
      const matched = details.find((detail) => detail.assetTag === value);
      if (!matched) return messageApi.warning('未找到对应标签号');
      setScanInput({ value: '', stage: 'sn', detailId: matched.id });
      setSelectedDetails([matched.id]);
      return;
    }

    if (!scanInput.detailId) {
      setScanInput({ value: '', stage: 'tag', detailId: null });
      return messageApi.warning('请先扫描标签号');
    }
    if (duplicateSn(value, scanInput.detailId)) return messageApi.error(`SN 号：${value} 已存在！`);
    setDetailSn(scanInput.detailId, value);
    setScanInput({ value: '', stage: 'tag', detailId: null });
    setSelectedDetails([]);
    return messageApi.success('SN号已写入并实时保存');
  };

  const openDetailEditor = (detail) => {
    setDetailEditor(detail);
    setDetailDraft({ ...detail, parts: (detail.parts || []).map((part) => ({ ...part })) });
  };

  const saveDetailEditor = () => {
    if (!detailDraft) return;
    const otherValues = collectOtherRealSns(activeReceiptNo, detailDraft.id);
    const currentValues = [detailDraft.sn, ...(detailDraft.parts || []).map((part) => part.partSn)]
      .map((value) => String(value || '').trim())
      .filter((value) => value && value !== '缺省');
    const seen = new Set();
    for (const value of currentValues) {
      if (otherValues.has(value) || seen.has(value)) return messageApi.error(`SN 号：${value} 已存在！`);
      seen.add(value);
    }
    setReceipts((list) => list.map((receipt) => (
      receipt.receiptNo === activeReceiptNo
        ? { ...receipt, details: receipt.details.map((detail) => (detail.id === detailDraft.id ? { ...detailDraft } : detail)) }
        : receipt
    )));
    setDetailEditor(null);
    setDetailDraft(null);
    messageApi.success('明细信息已保存');
    return undefined;
  };

  const findReceiptDuplicateSn = (receipt) => {
    const otherValues = collectOtherRealSns(receipt.receiptNo, null);
    const current = [];
    (receipt.details || []).forEach((detail) => {
      if (detail.sn && detail.sn !== '缺省') current.push(detail.sn);
      (detail.parts || []).forEach((part) => {
        if (part.partSn && part.partSn !== '缺省') current.push(part.partSn);
      });
    });
    const seen = new Set();
    return current.find((value) => otherValues.has(value) || (seen.has(value) ? true : (seen.add(value), false))) || '';
  };

  const buildInboundRow = (receipt, warehouse, isDurable) => {
    const documentNo = `PI-CM-${dayjs().format('YYYYMMDD')}${String(receipt.id).padStart(4, '0')}`;
    const lines = isDurable
      ? (receipt.details || []).map((detail, index) => ({
        id: `${receipt.receiptNo}-${index + 1}`,
        materialDesc: detail.consumableDesc,
        materialGroup: detail.materialGroup,
        assetClass: detail.consumableClass,
        config: detail.config,
        quantity: 1,
        assetTag: detail.assetTag,
        sn: detail.sn,
        originalValue: detail.untaxedUnitPrice,
        tax: detail.taxAmount,
        poNo: receipt.poNo,
        prNo: detail.prLine,
        receiptNo: receipt.receiptNo,
        applicationBatch: receipt.applicationBatch,
        plate: receipt.plate,
        partQuantity: detail.partQuantity || 0,
        partDesc: serializeParts(detail.parts),
      }))
      : receipt.lines.map((line, index) => ({
        id: `${receipt.receiptNo}-${index + 1}`,
        materialDesc: line.materialDesc,
        materialGroup: line.materialGroup,
        assetClass: line.assetClass,
        config: line.config,
        quantity: Number(line.actualReceiveQty || 0),
        assetTag: '',
        sn: '',
        originalValue: line.untaxedAmount,
        tax: line.taxAmount,
        poNo: receipt.poNo,
        prNo: line.prLine,
        receiptNo: receipt.receiptNo,
        applicationBatch: receipt.applicationBatch,
        plate: receipt.plate,
        partQuantity: 0,
        partDesc: '',
      }));
    return {
      id: `consumable-${receipt.id}-${Date.now()}`,
      documentNo,
      applicationNo: '',
      status: isDurable ? '草稿' : '已完成',
      inboundType: '采购接收',
      warehouse,
      createdDate: dayjs().format('YYYY-MM-DD'),
      creator: CURRENT_USER,
      quantity: receipt.lines.reduce((sum, line) => sum + Number(line.actualReceiveQty || 0), 0),
      cardClaim: '否',
      poNo: receipt.poNo,
      prNo: receipt.lines[0]?.prLine || '',
      assetTag: isDurable ? (receipt.details?.[0]?.assetTag || '') : '',
      lines,
      sourceModule: '耗材接收',
      purchaseType: receipt.purchaseType,
      receiptNo: receipt.receiptNo,
    };
  };

  const confirmReceipt = () => {
    if (!activeReceipt) return;
    if (!activeReceipt.lines.length) return messageApi.warning('当前没有可确认的接收行');
    const isDurable = activeReceipt.purchaseType === '低值耐用品';
    const warehouseMatches = resolveWarehouse(activeReceipt.procurementUnit);
    if (!warehouseMatches.length) return messageApi.error('未找到当前公司对应的耗材仓库');
    if (warehouseMatches.length > 1) return messageApi.error('当前公司匹配到多个耗材仓库，请检查耗材仓配置');
    const warehouse = warehouseMatches[0];

    if (isDurable) {
      const expected = activeReceipt.lines.reduce((sum, line) => sum + Number(line.actualReceiveQty || 0), 0);
      if ((activeReceipt.details || []).length !== expected) return messageApi.warning('有未维护的标签号或 SN 号，请先维护接收明细。');
      if (activeReceipt.details.some((detail) => !String(detail.assetTag || '').trim() || !String(detail.sn || '').trim())) {
        return messageApi.warning('有未维护的标签号或 SN 号，请先维护接收明细。');
      }
      const duplicate = findReceiptDuplicateSn(activeReceipt);
      if (duplicate) return messageApi.error(`接收确认失败：SN号 ${duplicate} 已存在`);
    } else if (activeReceipt.lines.some((line) => Number(line.actualReceiveQty || 0) <= 0)) {
      return messageApi.warning('当前没有可确认的接收行');
    }

    const inboundRow = buildInboundRow(activeReceipt, warehouse, isDurable);
    const stockUpdates = isDurable ? [] : activeReceipt.lines.map((line) => ({
      warehouse,
      materialCode: line.materialCode,
      materialDesc: line.materialDesc,
      quantity: Number(line.actualReceiveQty || 0),
    }));
    if (!persistInboundAndStock(inboundRow, stockUpdates)) return messageApi.error('接收失败：入库结果保存失败，请重试');

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    completePoQty(activeReceipt.poNo, activeReceipt.lines, isDurable);
    setReceipts((list) => list.map((receipt) => (
      receipt.receiptNo === activeReceipt.receiptNo
        ? {
          ...receipt,
          status: '已完成',
          receiver: CURRENT_USER,
          receiptAt: now,
          inboundResult: {
            inboundNo: inboundRow.documentNo,
            warehouse,
            status: inboundRow.status,
            creator: CURRENT_USER,
            createdAt: inboundRow.createdDate,
            quantity: inboundRow.quantity,
          },
        }
        : receipt
    )));
    messageApi.success(isDurable
      ? `接收确认成功，已生成草稿入库单 ${inboundRow.documentNo}`
      : `接收确认成功，已完成入库并生成入库单 ${inboundRow.documentNo}`);
    return undefined;
  };

  const poColumns = [
    { title: '行号', width: 70, render: (_, __, index) => (poPage - 1) * poPageSize + index + 1 },
    { title: 'PO单号', dataIndex: 'poNo', width: 170, render: (value, row) => <Button type="link" className="px-0" onClick={() => openPo(row)}>{value}</Button> },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: 'PO单名称', dataIndex: 'poName', width: 220 },
    { title: '公司', dataIndex: 'company', width: 150 },
    { title: '板块', dataIndex: 'plate', width: 110, render: (value) => value || '-' },
    { title: '供应商', dataIndex: 'supplier', width: 250 },
    { title: '推送日期', dataIndex: 'pushDate', width: 120 },
    { title: '采购类型', dataIndex: 'purchaseType', width: 120 },
    {
      title: '操作', width: 140, fixed: 'right', render: (_, row) => (
        <Space size={2}>
          <Button type="link" className="px-0" onClick={() => openPo(row)}>接收</Button>
          <Button type="link" className="px-0" onClick={() => openReceiptList(row)}>查看</Button>
        </Space>
      ),
    },
  ];

  const itemColumns = [
    { title: '行号', width: 70, render: (_, __, index) => index + 1 },
    {
      title: '操作', width: 80, render: (_, row) => (
        activePO?.receiptStatus !== '已入库' && remainingQty(row) > 0
          ? <Button type="link" className="px-0" onClick={() => { setEditItem(row); setEditDraft({ ...row }); }}>编辑</Button>
          : '-'
      ),
    },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 110, render: (value) => <StatusTag value={value} /> },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
    { title: '耗材大类', dataIndex: 'assetClass', width: 110 },
    { title: '物料编码', dataIndex: 'materialCode', width: 170 },
    { title: '耗材说明', dataIndex: 'materialDesc', width: 190 },
    { title: 'PO单说明', dataIndex: 'poDesc', width: 180 },
    { title: '配置', dataIndex: 'config', width: 230 },
    { title: '部件数量', dataIndex: 'partQuantity', width: 100, render: (value) => value || '-' },
    { title: '部件说明', dataIndex: 'partDesc', width: 180, render: formatPartDesc },
    { title: '本次接收数量', dataIndex: 'currentReceiveQty', width: 120, render: count },
    { title: '采购数量', dataIndex: 'purchaseQty', width: 100, render: count },
    { title: '已接收数量', dataIndex: 'receivedQty', width: 110, render: count },
    { title: '草稿数量', dataIndex: 'draftQty', width: 100, render: count },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 110, render: money },
    { title: '不含税金额小计', width: 140, render: (_, row) => money(lineMoney(row, row.currentReceiveQty).untaxedAmount) },
    { title: '总税额', width: 100, render: (_, row) => money(lineMoney(row, row.currentReceiveQty).taxAmount) },
    { title: '含税单价', width: 110, render: (_, row) => money(lineMoney(row, 1).taxedUnit) },
    { title: '含税小计', width: 120, render: (_, row) => money(lineMoney(row, row.currentReceiveQty).taxedAmount) },
    { title: '税率', dataIndex: 'taxRate', width: 80, render: (value) => `${round2(value * 100)}%` },
    { title: '约定到货日期', dataIndex: 'promisedArrivalDate', width: 130 },
    { title: 'PR单 / 行号', dataIndex: 'prLine', width: 150 },
    { title: 'SA单 / 行号', dataIndex: 'saLine', width: 150 },
    { title: '申请单号', dataIndex: 'applicationNo', width: 150, render: (value) => value || '-' },
    { title: '部门', dataIndex: 'department', width: 170 },
    { title: '业务线', dataIndex: 'businessLine', width: 100 },
  ];

  const receiptColumns = [
    { title: '行号', width: 70, render: (_, __, index) => (receiptPage - 1) * receiptPageSize + index + 1 },
    { title: '接收单号', dataIndex: 'receiptNo', width: 200, render: (value, row) => <Button type="link" className="px-0" onClick={() => openReceipt(row)}>{value}</Button> },
    { title: '单据状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} /> },
    { title: 'PO单号', dataIndex: 'poNo', width: 170 },
    { title: '供应商', dataIndex: 'supplier', width: 250 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '制单时间', dataIndex: 'createdAt', width: 180 },
  ];

  const lineColumns = [
    { title: '行号', width: 60, render: (_, __, index) => index + 1 },
    { title: '耗材说明', dataIndex: 'materialDesc', width: 190 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '部件数量', dataIndex: 'partQuantity', width: 100, render: (value) => value || '-' },
    { title: '部件说明', dataIndex: 'partDesc', width: 180, render: formatPartDesc },
    { title: '本次接收数量', dataIndex: 'actualReceiveQty', width: 120, render: count },
    { title: '采购数量', dataIndex: 'purchaseQty', width: 100, render: count },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 110, render: money },
    { title: '不含税金额小计', dataIndex: 'untaxedAmount', width: 140, render: money },
    { title: '税额', dataIndex: 'taxAmount', width: 100, render: money },
    { title: '含税单价', dataIndex: 'taxedUnitPrice', width: 110, render: money },
    { title: '含税小计', dataIndex: 'taxedAmount', width: 120, render: money },
    { title: '税率', dataIndex: 'taxRate', width: 80, render: (value) => `${round2(value * 100)}%` },
    { title: '约定到货日期', dataIndex: 'promisedArrivalDate', width: 130 },
    { title: 'PR单 / 行号', dataIndex: 'prLine', width: 150 },
    { title: 'SA单 / 行号', dataIndex: 'saLine', width: 150 },
    { title: '申请单号', dataIndex: 'applicationNo', width: 150, render: (value) => value || '-' },
    { title: '部门', dataIndex: 'department', width: 160 },
    { title: '业务线', dataIndex: 'businessLine', width: 100 },
  ];

  const detailColumns = [
    { title: '行号', width: 60, render: (_, __, index) => (maintenancePage - 1) * maintenancePageSize + index + 1 },
    { title: '耗材标签号', dataIndex: 'assetTag', width: 220, render: (value) => value || '-' },
    { title: 'SN号', dataIndex: 'sn', width: 180, render: (value) => value || '-' },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
    { title: '耗材大类', dataIndex: 'consumableClass', width: 110 },
    { title: '耗材说明', dataIndex: 'consumableDesc', width: 190 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '部件数量', dataIndex: 'partQuantity', width: 100, render: (value) => value || '-' },
    { title: '部件说明', dataIndex: 'partDesc', width: 180, render: formatPartDesc },
    { title: '耗材数量', dataIndex: 'quantity', width: 100, render: count },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 110, render: money },
    { title: '税金', dataIndex: 'taxAmount', width: 100, render: money },
    { title: 'PR单 / 行号', dataIndex: 'prLine', width: 150 },
    { title: 'SA单 / 行号', dataIndex: 'saLine', width: 150 },
    { title: '申请人', dataIndex: 'applicant', width: 130 },
    { title: '业务线', dataIndex: 'businessLine', width: 100 },
    { title: '备注', dataIndex: 'remark', width: 140, render: (value) => value || '-' },
    { title: '操作', fixed: 'right', width: 80, render: (_, row) => <Button type="link" className="px-0" onClick={() => openDetailEditor(row)}>{activeReceipt?.status === '草稿' ? '编辑' : '查看'}</Button> },
  ];

  if (view === 'poDetail' && activePO) {
    const untaxed = activeItems.reduce((sum, item) => sum + lineMoney(item, item.purchaseQty).untaxedAmount, 0);
    const tax = activeItems.reduce((sum, item) => sum + lineMoney(item, item.purchaseQty).taxAmount, 0);
    const hasReceipt = receipts.some((receipt) => receipt.poNo === activePO.poNo);
    const isClosed = activePO.receiptStatus === '已入库';
    return (
      <Space direction="vertical" size={16} className="w-full" data-page-view-key="consumable-po-detail">
        {contextHolder}
        <PageTitle />
        <Alert type="info" showIcon message="默认为全量接收，可点击编辑按钮修改接收数量！" />
        <Card size="small" title="PO基础信息">
          <DetailGrid columns={3} labelWidth={112}>
            <DetailItem label="PO单号"><Readonly>{activePO.poNo}</Readonly></DetailItem>
            <DetailItem label="供应商"><Readonly>{activePO.supplier}</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{activePO.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{activePO.poName}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{activePO.procurementUnit}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{activePO.contractSubject}</Readonly></DetailItem>
            <DetailItem label="采购单位联系电话"><Readonly>{activePO.procurementUnitPhone}</Readonly></DetailItem>
            {activePO.purchaseType === '低值耐用品' && (
              <>
                <DetailItem label="不含税合计"><Readonly>{money(untaxed)}</Readonly></DetailItem>
                <DetailItem label="合计税额"><Readonly>{money(tax)}</Readonly></DetailItem>
                <DetailItem label="合计金额"><Readonly>{money(untaxed + tax)}</Readonly></DetailItem>
              </>
            )}
            <DetailItem label="采购员"><Readonly>{activePO.buyer}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{activePO.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="推送日期"><Readonly>{activePO.pushDate}</Readonly></DetailItem>
            <DetailItem label="板块">
              {isClosed ? <Readonly>{activePO.plate}</Readonly> : <SelectorInput value={activePO.plate} placeholder="请选择板块" onOpen={() => setSelectorType('detailPlate')} />}
            </DetailItem>
            <DetailItem label="申请批次">
              {isClosed ? <Readonly>{activePO.applicationBatch}</Readonly> : <Input value={activePO.applicationBatch || ''} onChange={(event) => updateActivePoField('applicationBatch', event.target.value)} />}
            </DetailItem>
          </DetailGrid>
        </Card>
        <Card
          size="small"
          title="采购明细"
          extra={(
            <Space>
              <Typography.Text type="secondary">共 {activeItems.length} 条</Typography.Text>
              {!isClosed && <Button type="primary" onClick={createReceipt}>创建接收单</Button>}
            </Space>
          )}
        >
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={itemColumns}
            dataSource={activeItems}
            rowSelection={!isClosed ? {
              selectedRowKeys: selectedPoItems,
              onChange: setSelectedPoItems,
              fixed: true,
              columnTitle: '选择',
              getCheckboxProps: (row) => ({ disabled: !remainingQty(row) || !row.currentReceiveQty }),
            } : undefined}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Card>
        <div className="flex justify-center gap-3">
          {hasReceipt && <Button onClick={() => openReceiptList(activePO)}>查看接收单</Button>}
          <Button onClick={() => setView('poList')}>返回</Button>
        </div>

        <Modal
          open={Boolean(editItem && editDraft)}
          title="编辑接收信息"
          width={720}
          okText="保存"
          onOk={saveItem}
          onCancel={() => { setEditItem(null); setEditDraft(null); setPartNamesDraft(null); }}
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
                <InputNumber className="mt-1 w-full" min={1} max={remainingQty(editItem)} precision={0} value={editDraft.currentReceiveQty} onChange={(value) => setEditDraft((item) => ({ ...item, currentReceiveQty: value }))} />
              </div>
              {activePO.purchaseType === '低值耐用品' && (
                <>
                  <div>
                    <Typography.Text>是否部件</Typography.Text>
                    <Select
                      className="mt-1 w-full"
                      value={editDraft.isPart ? 'Y' : 'N'}
                      options={[{ label: '是', value: 'Y' }, { label: '否', value: 'N' }]}
                      onChange={(value) => setEditDraft((item) => value === 'Y' ? { ...item, isPart: true } : { ...item, isPart: false, partQuantity: 0, partDesc: '' })}
                    />
                  </div>
                  <div>
                    <Typography.Text>部件数量</Typography.Text>
                    <InputNumber
                      className="mt-1 w-full"
                      disabled={!editDraft.isPart}
                      min={2}
                      max={100}
                      precision={0}
                      value={editDraft.partQuantity || undefined}
                      onChange={(value) => {
                        const nextCount = Number(value || 0);
                        const names = nextCount >= 2 ? splitPartNames(editDraft.partDesc, nextCount - 1) : [];
                        setEditDraft((item) => ({ ...item, partQuantity: nextCount, partDesc: names.join('@') }));
                      }}
                    />
                  </div>
                  <div>
                    <Typography.Text>部件说明</Typography.Text>
                    <Space.Compact className="mt-1 w-full">
                      <Input readOnly disabled={!editDraft.isPart} value={editDraft.isPart ? formatPartDesc(editDraft.partDesc) : ''} />
                      <Button disabled={!editDraft.isPart} onClick={openPartMaintenance}>维护</Button>
                    </Space.Compact>
                  </div>
                </>
              )}
            </Space>
          )}
        </Modal>

        <Modal
          open={Array.isArray(partNamesDraft)}
          title="维护部件说明"
          width={620}
          okText="确定"
          onOk={savePartNames}
          onCancel={() => setPartNamesDraft(null)}
        >
          <Space direction="vertical" size={10} className="w-full">
            {(partNamesDraft || []).map((name, index) => (
              <div key={index} className="flex items-center gap-3">
                <Typography.Text className="w-24 shrink-0">子部件 {index + 1}</Typography.Text>
                <Input value={name} onChange={(event) => setPartNamesDraft((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
              </div>
            ))}
          </Space>
        </Modal>

        {selectorConfig && (
          <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={selectorConfig.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={selectorConfig.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={(record) => { selectorConfig.confirm(record); setSelectorType(''); }} />
        )}
      </Space>
    );
  }

  if (view === 'receiptList') {
    return (
      <Space direction="vertical" size={16} className="w-full" data-page-view-key="consumable-receipt-list">
        {contextHolder}
        <PageTitle />
        <QueryBar
          onQuery={() => { setReceiptFilters({ ...receiptDraft }); setSelectedReceipts([]); setReceiptPage(1); }}
          onReset={() => {
            setReceiptDraft({ ...EMPTY_RECEIPT_FILTERS });
            setReceiptFilters({ ...EMPTY_RECEIPT_FILTERS });
            setSelectedReceipts([]);
            setReceiptPage(1);
          }}
        >
          <QueryItem label="接收单号"><Input value={receiptDraft.receiptNo} onChange={(event) => setReceiptFilter('receiptNo', event.target.value)} /></QueryItem>
          <QueryItem label="PO单号"><Input value={receiptDraft.poNo} onChange={(event) => setReceiptFilter('poNo', event.target.value)} /></QueryItem>
          <QueryItem label="单据状态"><Select allowClear placeholder="全部" value={receiptDraft.status || undefined} options={['草稿', '已完成'].map((value) => ({ label: value, value }))} onChange={(value) => setReceiptFilter('status', value)} /></QueryItem>
          <QueryItem label="制单人"><Input value={receiptDraft.creator} onChange={(event) => setReceiptFilter('creator', event.target.value)} /></QueryItem>
          <QueryItem label="制单时间">
            <RangePicker
              style={{ width: '100%' }}
              value={receiptDraft.createdFrom && receiptDraft.createdTo ? [dayjs(receiptDraft.createdFrom), dayjs(receiptDraft.createdTo)] : null}
              onChange={(dates) => {
                setReceiptFilter('createdFrom', dates?.[0]?.format('YYYY-MM-DD') || '');
                setReceiptFilter('createdTo', dates?.[1]?.format('YYYY-MM-DD') || '');
              }}
            />
          </QueryItem>
          <QueryItem label="供应商"><SelectorInput value={receiptDraft.supplier} placeholder="请选择供应商" onOpen={() => setSelectorType('receiptSupplier')} /></QueryItem>
        </QueryBar>
        <Card
          size="small"
          title="接收单列表"
          extra={(
            <Space>
              <Typography.Text type="secondary">共 {filteredReceipts.length} 条</Typography.Text>
              <Button danger icon={<Trash2 size={14} />} onClick={deleteReceipts}>删除接收单</Button>
            </Space>
          )}
        >
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={receiptColumns}
            dataSource={filteredReceipts}
            rowSelection={{
              selectedRowKeys: selectedReceipts,
              onChange: setSelectedReceipts,
              fixed: true,
              columnTitle: '选择',
              getCheckboxProps: (row) => ({ disabled: row.status !== '草稿' }),
            }}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: receiptPage,
              pageSize: receiptPageSize,
              showSizeChanger: true,
              onChange: (page, pageSize) => { setReceiptPage(page); setReceiptPageSize(pageSize); },
            }}
          />
        </Card>
        <div className="flex justify-center"><Button onClick={() => setView('poList')}>返回</Button></div>
        {selectorConfig && (
          <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={[{ title: '名称', dataIndex: 'name' }]} searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={(record) => { selectorConfig.confirm(record); setSelectorType(''); }} />
        )}
      </Space>
    );
  }

  if (view === 'receiptDetail' && activeReceipt) {
    const isDraft = activeReceipt.status === '草稿';
    const isDurable = activeReceipt.purchaseType === '低值耐用品';
    return (
      <Space direction="vertical" size={16} className="w-full" data-page-view-key="consumable-receipt-detail">
        {contextHolder}
        <PageTitle />
        <Card size="small" title="接收单信息">
          <DetailGrid columns={3} labelWidth={112}>
            <DetailItem label="接收单号"><Readonly>{activeReceipt.receiptNo}</Readonly></DetailItem>
            <DetailItem label="PO单号"><Readonly>{activeReceipt.poNo}</Readonly></DetailItem>
            <DetailItem label="接收单状态"><StatusTag value={activeReceipt.status} /></DetailItem>
            <DetailItem label="供应商"><Readonly>{activeReceipt.supplier}</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{activeReceipt.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{activeReceipt.poName}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{activeReceipt.procurementUnit}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{activeReceipt.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{activeReceipt.plate}</Readonly></DetailItem>
            <DetailItem label="部门"><Readonly>{activeReceipt.department || activeReceipt.lines?.[0]?.department}</Readonly></DetailItem>
            <DetailItem label="采购员"><Readonly>{activeReceipt.buyer}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{activeReceipt.contractSubject}</Readonly></DetailItem>
            <DetailItem label="订单日期"><Readonly>{activeReceipt.orderDate}</Readonly></DetailItem>
            <DetailItem label="制单人"><Readonly>{activeReceipt.creator}</Readonly></DetailItem>
            <DetailItem label="制单时间"><Readonly>{activeReceipt.createdAt}</Readonly></DetailItem>
            <DetailItem label="接收人"><Readonly>{activeReceipt.receiver}</Readonly></DetailItem>
            <DetailItem label="接收时间"><Readonly>{activeReceipt.receiptAt}</Readonly></DetailItem>
            <DetailItem label="申请批次"><Readonly>{activeReceipt.applicationBatch}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
        <Card
          size="small"
          title="接收行明细"
          extra={(
            <Space>
              <Typography.Text type="secondary">共 {activeReceipt.lines.length} 条</Typography.Text>
              {isDraft && <Button danger icon={<Trash2 size={14} />} onClick={deleteReceiptLines}>删除接收行</Button>}
            </Space>
          )}
        >
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={lineColumns}
            dataSource={activeReceipt.lines}
            rowSelection={isDraft ? { selectedRowKeys: selectedLines, onChange: setSelectedLines, fixed: true, columnTitle: '选择' } : undefined}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Card>
        <div className="flex justify-center gap-3">
          {isDraft && isDurable && <Button onClick={openMaintenance}>维护接收明细</Button>}
          {isDraft && <Button type="primary" onClick={confirmReceipt}>接收确认</Button>}
          {!isDraft && isDurable && <Button onClick={openMaintenance}>查看接收明细</Button>}
          {!isDraft && <Button icon={<Printer size={14} />} onClick={() => messageApi.success(`已打开 ${activeReceipt.receiptNo} 打印预览（原型）`)}>接收单打印</Button>}
          <Button onClick={() => setView('receiptList')}>返回</Button>
        </div>
      </Space>
    );
  }

  if (view === 'maintenance' && activeReceipt) {
    const details = activeReceipt.details || [];
    const currentDetail = details.find((detail) => detail.id === scanInput.detailId);
    const isDraft = activeReceipt.status === '草稿';
    const allTagsGenerated = details.length > 0 && details.every((detail) => String(detail.assetTag || '').trim());
    const allSnMaintained = details.length > 0 && details.every((detail) => String(detail.sn || '').trim());
    return (
      <Space direction="vertical" size={16} className="w-full" data-page-view-key="consumable-maintenance">
        {contextHolder}
        <PageTitle />
        <Card size="small" title="接收单信息">
          <DetailGrid columns={3} labelWidth={112}>
            <DetailItem label="接收单号"><Readonly>{activeReceipt.receiptNo}</Readonly></DetailItem>
            <DetailItem label="PO单号"><Readonly>{activeReceipt.poNo}</Readonly></DetailItem>
            <DetailItem label="接收单状态"><StatusTag value={activeReceipt.status} /></DetailItem>
            <DetailItem label="供应商"><Readonly>{activeReceipt.supplier}</Readonly></DetailItem>
            <DetailItem label="制单人"><Readonly>{activeReceipt.creator}</Readonly></DetailItem>
            <DetailItem label="制单时间"><Readonly>{activeReceipt.createdAt}</Readonly></DetailItem>
            <DetailItem label="接收人"><Readonly>{activeReceipt.receiver}</Readonly></DetailItem>
            <DetailItem label="接收时间"><Readonly>{activeReceipt.receiptAt}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="扫描维护">
          <div className="flex items-center gap-3">
            <Typography.Text className="shrink-0">扫描光标</Typography.Text>
            <Input
              value={scanInput.value}
              disabled={!isDraft || !allTagsGenerated}
              placeholder={!allTagsGenerated ? '生成标签号后可使用扫描' : scanInput.stage === 'tag' ? '请扫描耗材标签号' : `已定位 ${currentDetail?.assetTag || ''}，请扫描SN号`}
              onChange={(event) => setScanInput((current) => ({ ...current, value: event.target.value }))}
              onPressEnter={handleScanInput}
            />
          </div>
        </Card>
        <Card
          size="small"
          title="接收明细"
          extra={(
            <Space>
              <Typography.Text type="secondary">共 {details.length} 条</Typography.Text>
              {isDraft && <Button danger icon={<Trash2 size={14} />} onClick={deleteDetails}>删除行</Button>}
              {isDraft && !allTagsGenerated && <Button onClick={generateTags}>生成标签号</Button>}
              {isDraft && !allSnMaintained && <Button onClick={fillDefaultSn}>维护SN号</Button>}
              {allTagsGenerated && <Button icon={<Printer size={14} />} onClick={printLabels}>打印标签号</Button>}
            </Space>
          )}
        >
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={detailColumns}
            dataSource={details}
            rowSelection={isDraft ? { selectedRowKeys: selectedDetails, onChange: setSelectedDetails, fixed: true, columnTitle: '选择' } : undefined}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: maintenancePage,
              pageSize: maintenancePageSize,
              showSizeChanger: true,
              onChange: (page, pageSize) => { setMaintenancePage(page); setMaintenancePageSize(pageSize); },
            }}
          />
        </Card>
        <div className="flex justify-center gap-3"><Button onClick={() => setView('receiptDetail')}>返回</Button></div>

        <Modal
          open={Boolean(detailEditor && detailDraft)}
          title={isDraft ? '编辑接收明细' : '查看接收明细'}
          width={900}
          onCancel={() => { setDetailEditor(null); setDetailDraft(null); }}
          footer={isDraft ? [
            <Button key="cancel" onClick={() => { setDetailEditor(null); setDetailDraft(null); }}>取消</Button>,
            <Button key="save" type="primary" onClick={saveDetailEditor}>保存</Button>,
          ] : null}
        >
          {detailDraft && (
            <Space direction="vertical" size={16} className="w-full">
              <Card size="small" title="明细信息">
                <DetailGrid columns={2} labelWidth={100}>
                  <DetailItem label="耗材标签号"><Readonly>{detailDraft.assetTag}</Readonly></DetailItem>
                  <DetailItem label="耗材说明"><Readonly>{detailDraft.consumableDesc}</Readonly></DetailItem>
                  <DetailItem label="SN号">{isDraft ? <Input value={detailDraft.sn} onChange={(event) => setDetailDraft((current) => ({ ...current, sn: event.target.value }))} /> : <Readonly>{detailDraft.sn}</Readonly>}</DetailItem>
                  <DetailItem label="备注">{isDraft ? <TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={detailDraft.remark} onChange={(event) => setDetailDraft((current) => ({ ...current, remark: event.target.value }))} /> : <Readonly>{detailDraft.remark}</Readonly>}</DetailItem>
                </DetailGrid>
              </Card>
              <Card size="small" title="部件信息">
                {(detailDraft.parts || []).length ? (
                  <Table
                    rowKey="id"
                    size="small"
                    bordered
                    pagination={false}
                    dataSource={detailDraft.parts}
                    columns={[
                      {
                        title: '部件名称', dataIndex: 'partName', width: 220,
                        render: (value, row, index) => isDraft
                          ? <Input value={value} onChange={(event) => setDetailDraft((current) => ({ ...current, parts: current.parts.map((part, partIndex) => partIndex === index ? { ...part, partName: event.target.value } : part) }))} />
                          : value,
                      },
                      { title: '部件标签号', dataIndex: 'partTag', width: 260, render: (value) => value || '-' },
                      {
                        title: '部件SN', dataIndex: 'partSn', width: 220,
                        render: (value, row, index) => isDraft
                          ? <Input value={value} onChange={(event) => setDetailDraft((current) => ({ ...current, parts: current.parts.map((part, partIndex) => partIndex === index ? { ...part, partSn: event.target.value } : part) }))} />
                          : (value || '-'),
                      },
                    ]}
                  />
                ) : <Typography.Text type="secondary">暂无部件信息</Typography.Text>}
              </Card>
            </Space>
          )}
        </Modal>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full" data-page-view-key="consumable-po-list">
      {contextHolder}
      <PageTitle />
      <QueryBar
        onQuery={() => { setPoFilters({ ...poDraft }); setPoPage(1); }}
        onReset={() => { setPoDraft({ ...EMPTY_PO_FILTERS }); setPoFilters({ ...EMPTY_PO_FILTERS }); setPoPage(1); }}
      >
        <QueryItem label="公司"><SelectorInput value={poDraft.company} placeholder="请选择公司" onOpen={() => setSelectorType('company')} /></QueryItem>
        <QueryItem label="板块"><SelectorInput value={poDraft.plate} placeholder="请选择板块" onOpen={() => setSelectorType('plate')} /></QueryItem>
        <QueryItem label="PO单号"><Input value={poDraft.poNo} onChange={(event) => setPoFilter('poNo', event.target.value)} /></QueryItem>
        <QueryItem label="供应商"><SelectorInput value={poDraft.supplier} placeholder="请选择供应商" onOpen={() => setSelectorType('supplier')} /></QueryItem>
        <QueryItem label="接收状态"><Select allowClear placeholder="全部" value={poDraft.receiptStatus || undefined} options={['待接收', '已接收', '已入库'].map((value) => ({ label: value, value }))} onChange={(value) => setPoFilter('receiptStatus', value)} /></QueryItem>
        <QueryItem label="采购类型"><Select allowClear placeholder="全部" value={poDraft.purchaseType || undefined} options={['低值耐用品', '耗材'].map((value) => ({ label: value, value }))} onChange={(value) => setPoFilter('purchaseType', value)} /></QueryItem>
        <QueryItem label="推送日期">
          <RangePicker
            style={{ width: '100%' }}
            value={poDraft.pushFrom && poDraft.pushTo ? [dayjs(poDraft.pushFrom), dayjs(poDraft.pushTo)] : null}
            onChange={(dates) => {
              setPoFilter('pushFrom', dates?.[0]?.format('YYYY-MM-DD') || '');
              setPoFilter('pushTo', dates?.[1]?.format('YYYY-MM-DD') || '');
            }}
          />
        </QueryItem>
      </QueryBar>
      <Card size="small" title="PO单列表" extra={<Typography.Text type="secondary">共 {filteredPos.length} 条</Typography.Text>}>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={poColumns}
          dataSource={filteredPos}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: poPage,
            pageSize: poPageSize,
            showSizeChanger: true,
            onChange: (page, pageSize) => { setPoPage(page); setPoPageSize(pageSize); },
          }}
        />
      </Card>
      {selectorConfig && (
        <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={selectorConfig.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={selectorConfig.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={(record) => { selectorConfig.confirm(record); setSelectorType(''); }} />
      )}
    </Space>
  );
}
