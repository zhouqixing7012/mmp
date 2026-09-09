import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Descriptions, Input, InputNumber, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { Printer, Search, Trash2 } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import { INITIAL_PO_ITEMS, INITIAL_PO_ROWS, INITIAL_RECEIPTS, MATERIAL_OPTIONS, OFFICE_AREAS, WAREHOUSE_BY_COMPANY } from './consumableReceiptMock';

const { RangePicker } = DatePicker;
const EMPTY_PO_FILTERS = { company: '', plate: '', poNo: '', supplier: '', receiptStatus: '', purchaseType: '', officeArea: '', pushFrom: '', pushTo: '' };
const EMPTY_RECEIPT_FILTERS = { receiptNo: '', poNo: '', status: '', creator: '', createdFrom: '', createdTo: '', supplier: '' };

const round2 = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
const money = (value) => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const count = (value) => Number(value || 0).toLocaleString('zh-CN');
const includesText = (value, query) => !query || String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
const remainingQty = (item) => Math.max(0, Number(item.purchaseQty || 0) - Number(item.receivedQty || 0) - Number(item.draftQty || 0));
const selectorData = (values) => [...new Set(values.filter(Boolean))].map((name, index) => ({ id: index + 1, name }));
const docNo = (prefix, seq) => `${prefix}-${dayjs().format('YYYYMMDD')}${String(seq).padStart(4, '0')}`;
const lineMoney = (item, quantity) => {
  const qty = Number(quantity || 0);
  const untaxedUnit = round2(item.untaxedUnitPrice);
  const unitTax = round2(untaxedUnit * Number(item.taxRate || 0));
  return { untaxedUnit, unitTax, untaxedAmount: round2(qty * untaxedUnit), taxAmount: round2(qty * unitTax), taxedUnit: round2(untaxedUnit + unitTax), taxedAmount: round2(qty * (untaxedUnit + unitTax)) };
};

function SelectorInput({ value, placeholder, onOpen }) {
  return <div className="cursor-pointer" onClick={onOpen}><Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} className="text-[#1677ff]" />} /></div>;
}

function PageTitle() {
  return <div className="flex items-center gap-2"><div className="h-8 w-1.5 rounded bg-[#1677ff]" /><Typography.Title level={3} className="mb-0">耗材接收</Typography.Title></div>;
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
  const [selectorType, setSelectorType] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [scan, setScan] = useState({ open: false, tag: '', sn: '', detailId: null });

  const activeReceipt = useMemo(() => receipts.find((item) => item.receiptNo === activeReceiptNo) || null, [receipts, activeReceiptNo]);
  const activeItems = activePO ? (poItems[activePO.poNo] || []) : [];
  const companies = useMemo(() => selectorData(poRows.map((item) => item.company)), [poRows]);
  const plates = useMemo(() => selectorData(poRows.map((item) => item.plate)), [poRows]);
  const suppliers = useMemo(() => selectorData(poRows.map((item) => item.supplier)), [poRows]);

  const filteredPos = useMemo(() => poRows.filter((row) => includesText(row.company, poFilters.company)
    && includesText(row.plate, poFilters.plate) && includesText(row.poNo, poFilters.poNo) && includesText(row.supplier, poFilters.supplier)
    && (!poFilters.receiptStatus || row.receiptStatus === poFilters.receiptStatus) && (!poFilters.purchaseType || row.purchaseType === poFilters.purchaseType)
    && (!poFilters.officeArea || row.officeArea === poFilters.officeArea) && (!poFilters.pushFrom || row.pushDate >= poFilters.pushFrom)
    && (!poFilters.pushTo || row.pushDate <= poFilters.pushTo)), [poRows, poFilters]);

  const filteredReceipts = useMemo(() => [...receipts].filter((row) => {
    const date = row.createdAt?.slice(0, 10) || '';
    return includesText(row.receiptNo, receiptFilters.receiptNo) && includesText(row.poNo, receiptFilters.poNo)
      && (!receiptFilters.status || row.status === receiptFilters.status) && includesText(row.receiver, receiptFilters.creator)
      && includesText(row.supplier, receiptFilters.supplier) && (!receiptFilters.createdFrom || date >= receiptFilters.createdFrom)
      && (!receiptFilters.createdTo || date <= receiptFilters.createdTo);
  }).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))), [receipts, receiptFilters]);

  const setPoFilter = (field, value) => setPoDraft((current) => ({ ...current, [field]: value || '' }));
  const setReceiptFilter = (field, value) => setReceiptDraft((current) => ({ ...current, [field]: value || '' }));

  const selectorConfig = {
    company: { title: '选择公司', dataSource: companies, confirm: (r) => setPoFilter('company', r.name) },
    plate: { title: '选择板块', dataSource: plates, confirm: (r) => setPoFilter('plate', r.name) },
    supplier: { title: '选择供应商', dataSource: suppliers, confirm: (r) => setPoFilter('supplier', r.name) },
    receiptSupplier: { title: '选择供应商', dataSource: suppliers, confirm: (r) => setReceiptFilter('supplier', r.name) },
    detailPlate: { title: '选择板块', dataSource: plates, confirm: (r) => { setPoRows((list) => list.map((x) => x.poNo === activePO.poNo ? { ...x, plate: r.name } : x)); setActivePO((x) => ({ ...x, plate: r.name })); } },
    material: {
      title: '选择物料',
      dataSource: MATERIAL_OPTIONS.filter((item) => item.purchaseType === activePO?.purchaseType),
      columns: [{ title: '物料编码', dataIndex: 'code' }, { title: '物料名称', dataIndex: 'name' }, { title: '配置', dataIndex: 'config' }],
      searchFields: [{ label: '物料编码', name: 'code', dataIndex: 'code' }, { label: '物料名称', name: 'name', dataIndex: 'name' }],
      confirm: (r) => setEditDraft((x) => ({ ...x, materialCode: r.code, materialDesc: r.name, config: r.config })),
    },
  }[selectorType];

  const changePoQty = (poNo, lines, mode) => setPoItems((current) => ({
    ...current,
    [poNo]: (current[poNo] || []).map((item) => {
      const line = lines.find((x) => x.sourceItemId === item.id);
      if (!line) return item;
      const qty = Number(line.actualReceiveQty || 0);
      const next = mode === 'occupy' ? { ...item, draftQty: Number(item.draftQty || 0) + qty } : { ...item, draftQty: Math.max(0, Number(item.draftQty || 0) - qty) };
      return { ...next, currentReceiveQty: remainingQty(next) };
    }),
  }));

  const completePoQty = (poNo, lines, inbound) => {
    const nextItems = (poItems[poNo] || []).map((item) => {
      const line = lines.find((x) => x.sourceItemId === item.id);
      if (!line) return item;
      const qty = Number(line.actualReceiveQty || 0);
      const next = { ...item, draftQty: Math.max(0, Number(item.draftQty || 0) - qty), receivedQty: Number(item.receivedQty || 0) + qty };
      return { ...next, currentReceiveQty: remainingQty(next), receiptStatus: next.receivedQty >= next.purchaseQty ? '已接收' : '待接收' };
    });
    setPoItems((current) => ({ ...current, [poNo]: nextItems }));
    const all = nextItems.every((item) => item.receivedQty >= item.purchaseQty);
    const any = nextItems.some((item) => item.receivedQty > 0);
    setPoRows((list) => list.map((row) => row.poNo === poNo ? { ...row, receiptStatus: inbound && all ? '已入库' : (all || any ? '已接收' : '待接收') } : row));
  };

  const openPo = (row) => { setActivePO(row); setSelectedPoItems([]); setView('poDetail'); };
  const openReceiptList = (po = null) => {
    const filters = po ? { ...EMPTY_RECEIPT_FILTERS, poNo: po.poNo } : EMPTY_RECEIPT_FILTERS;
    setActivePO(po); setReceiptDraft(filters); setReceiptFilters(filters); setSelectedReceipts([]); setView('receiptList');
  };
  const openReceipt = (row) => { setActiveReceiptNo(row.receiptNo); setSelectedLines([]); setView('receiptDetail'); };

  const saveItem = () => {
    const qty = Number(editDraft?.currentReceiveQty || 0);
    if (!Number.isInteger(qty) || qty <= 0) return messageApi.error('接收数量必须为大于 0 的整数');
    if (qty > remainingQty(editItem)) return messageApi.error(`接收数量不能超过可接收数量（当前可接收数量为 ${remainingQty(editItem)}）`);
    if (editDraft.isPart && (!Number.isInteger(Number(editDraft.partQuantity)) || Number(editDraft.partQuantity) <= 0)) return messageApi.error('部件数量必须为大于 0 的整数');
    setPoItems((current) => ({ ...current, [activePO.poNo]: current[activePO.poNo].map((item) => item.id === editItem.id ? { ...item, ...editDraft } : item) }));
    setEditItem(null); setEditDraft(null);
  };

  const createReceipt = () => {
    if (!selectedPoItems.length) return messageApi.warning('请选择要接收的物料！');
    const source = activeItems.filter((item) => selectedPoItems.includes(item.id));
    const lines = source.map((item, index) => {
      const calc = lineMoney(item, item.currentReceiveQty);
      return { id: index + 1, sourceItemId: item.id, materialGroup: item.materialGroup, assetClass: item.assetClass, materialCode: item.materialCode, materialDesc: item.materialDesc,
        config: item.config, partQuantity: item.isPart ? item.partQuantity : 0, partDesc: item.isPart ? item.partDesc : '', actualReceiveQty: item.currentReceiveQty,
        purchaseQty: item.purchaseQty, untaxedUnitPrice: calc.untaxedUnit, untaxedAmount: calc.untaxedAmount, taxAmount: calc.taxAmount, taxedUnitPrice: calc.taxedUnit,
        taxedAmount: calc.taxedAmount, taxRate: item.taxRate, promisedArrivalDate: item.promisedArrivalDate, prLine: item.prLine, saLine: item.saLine,
        applicationNo: item.applicationNo, department: item.department, businessLine: item.businessLine, applicant: item.applicant };
    });
    const id = Math.max(0, ...receipts.map((item) => item.id)) + 1;
    const receipt = { id, receiptNo: docNo('REC', id), status: '草稿', poNo: activePO.poNo, poName: activePO.poName, supplier: activePO.supplier,
      supplierPhone: activePO.supplierPhone, procurementUnit: activePO.procurementUnit, buyer: activePO.buyer, buyerPhone: activePO.buyerPhone,
      contractSubject: activePO.contractSubject, plate: activePO.plate, receiver: '115102-王英', createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      applicationBatch: activePO.applicationBatch, purchaseType: activePO.purchaseType, lines, details: [] };
    changePoQty(activePO.poNo, lines, 'occupy'); setReceipts((list) => [receipt, ...list]); setActiveReceiptNo(receipt.receiptNo); setView('receiptDetail');
    messageApi.success(`已创建接收单 ${receipt.receiptNo}`);
  };

  const buildDetails = (receipt) => receipt.details?.length ? receipt.details : receipt.lines.flatMap((line) => Array.from({ length: Number(line.actualReceiveQty || 0) }, (_, index) => ({
    id: `${line.id}-${index + 1}`, lineId: line.id, assetTag: '', sn: '', materialGroup: line.materialGroup, materialCode: line.materialCode,
    consumableClass: line.assetClass, consumableDesc: line.materialDesc, config: line.config, quantity: 1, untaxedUnitPrice: line.untaxedUnitPrice,
    taxAmount: round2(line.taxAmount / Math.max(1, line.actualReceiveQty)), prLine: line.prLine, saLine: line.saLine, applicant: line.applicant || '-',
    businessLine: line.businessLine, assetMark: '主耗材', remark: '',
  })));

  const openMaintenance = () => {
    if (!activeReceipt) return;
    const details = buildDetails(activeReceipt);
    if (!activeReceipt.details?.length) setReceipts((list) => list.map((r) => r.receiptNo === activeReceipt.receiptNo ? { ...r, details } : r));
    setSelectedDetails([]); setView('maintenance');
  };

  const confirmReceipt = () => {
    if (activeReceipt.purchaseType === '低值耐用品') {
      if (!activeReceipt.details?.length) return messageApi.warning('请先维护接收明细');
      setReceipts((list) => list.map((r) => r.receiptNo === activeReceipt.receiptNo ? { ...r, status: '接收待维护' } : r));
      return messageApi.success('接收单进入“接收待维护”');
    }
    const warehouse = WAREHOUSE_BY_COMPANY[activeReceipt.procurementUnit];
    if (!warehouse) return messageApi.error('未找到当前公司对应的耗材仓库');
    const inboundResult = { inboundNo: docNo('IN', Math.max(0, ...receipts.map((x) => x.id)) + 1), warehouse, status: '已完成', creator: '115102-王英', createdAt: dayjs().format('YYYY-MM-DD'), quantity: activeReceipt.lines.reduce((sum, line) => sum + Number(line.actualReceiveQty), 0) };
    completePoQty(activeReceipt.poNo, activeReceipt.lines, true);
    setReceipts((list) => list.map((r) => r.receiptNo === activeReceipt.receiptNo ? { ...r, status: '接收完成', inboundResult } : r));
    messageApi.success(`接收完成，已自动生成入库单 ${inboundResult.inboundNo} 并增加耗材库存`);
  };

  const duplicateSn = (sn, detailId) => sn && sn !== '缺省' && receipts.some((r) => (r.details || []).some((d) => !(r.receiptNo === activeReceiptNo && d.id === detailId) && d.sn === sn));
  const setDetailSn = (detailId, sn) => {
    const value = String(sn || '').trim();
    if (duplicateSn(value, detailId)) return messageApi.error(`SN 号：${value} 已存在！`);
    setReceipts((list) => list.map((r) => r.receiptNo === activeReceiptNo ? { ...r, details: r.details.map((d) => d.id === detailId ? { ...d, sn: value } : d) } : r));
  };
  const generateTags = () => {
    let seq = 1;
    setReceipts((list) => list.map((r) => r.receiptNo === activeReceiptNo ? { ...r, details: r.details.map((d) => d.assetTag ? d : { ...d, assetTag: `${r.procurementUnit}-${r.plate || 'NA'}-${d.materialCode}-${String(seq++).padStart(6, '0')}` }) } : r));
    messageApi.success('已按“公司 + 板块 + 物料 + 流水”生成空标签号');
  };
  const fillDefaultSn = () => { setReceipts((list) => list.map((r) => r.receiptNo === activeReceiptNo ? { ...r, details: r.details.map((d) => d.sn ? d : { ...d, sn: '缺省' }) } : r)); messageApi.success('已为未维护的 SN 号填充“缺省”'); };
  const printLabels = () => activeReceipt.details.some((d) => !d.assetTag) ? messageApi.warning('有未维护的标签号，请先维护接收明细。') : messageApi.success('标签打印批次已生成');
  const completeDurable = () => {
    if (activeReceipt.details.some((d) => !d.assetTag || !d.sn)) return messageApi.warning('有未维护的标签号或 SN 号，请先维护接收明细。');
    completePoQty(activeReceipt.poNo, activeReceipt.lines, false); setReceipts((list) => list.map((r) => r.receiptNo === activeReceiptNo ? { ...r, status: '接收完成' } : r));
    messageApi.success('接收状态 → 接收完成；后续进入采购接收入库');
  };
  const cancelReceipt = () => { changePoQty(activeReceipt.poNo, activeReceipt.lines, 'release'); setReceipts((list) => list.filter((r) => r.receiptNo !== activeReceiptNo)); messageApi.success('已取消接收，草稿占用数量已释放'); openReceiptList(activePO); };
  const deleteReceipts = () => {
    if (!selectedReceipts.length) return messageApi.warning('请先选择需要删除的接收单');
    const ids = new Set(selectedReceipts); receipts.filter((r) => ids.has(r.id)).forEach((r) => changePoQty(r.poNo, r.lines, 'release'));
    setReceipts((list) => list.filter((r) => !ids.has(r.id))); setSelectedReceipts([]); messageApi.success('已删除所选草稿接收单');
  };
  const deleteDetails = () => {
    if (!selectedDetails.length) return messageApi.warning('请先选择需要删除的接收明细');
    const ids = new Set(selectedDetails); const removed = activeReceipt.details.filter((d) => ids.has(d.id));
    const byLine = removed.reduce((m, d) => ({ ...m, [d.lineId]: (m[d.lineId] || 0) + 1 }), {});
    const lines = activeReceipt.lines.map((line) => { const qty = Math.max(0, line.actualReceiveQty - (byLine[line.id] || 0)); const calc = lineMoney(line, qty); return { ...line, actualReceiveQty: qty, untaxedAmount: calc.untaxedAmount, taxAmount: calc.taxAmount, taxedUnitPrice: calc.taxedUnit, taxedAmount: calc.taxedAmount }; });
    setReceipts((list) => list.map((r) => r.receiptNo === activeReceiptNo ? { ...r, lines, details: r.details.filter((d) => !ids.has(d.id)) } : r));
    setPoItems((current) => ({ ...current, [activeReceipt.poNo]: current[activeReceipt.poNo].map((item) => { const line = activeReceipt.lines.find((x) => x.sourceItemId === item.id); if (!line) return item; const next = { ...item, draftQty: Math.max(0, item.draftQty - (byLine[line.id] || 0)) }; return { ...next, currentReceiveQty: remainingQty(next) }; }) }));
    setSelectedDetails([]);
  };

  const poColumns = [
    { title: '行号', dataIndex: 'id', width: 70 }, { title: 'PO单号', dataIndex: 'poNo', width: 170, render: (v, r) => <Button type="link" className="px-0" onClick={() => openPo(r)}>{v}</Button> },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 120, render: (v) => <StatusTag value={v} /> }, { title: 'PO单名称', dataIndex: 'poName', width: 220 },
    { title: '公司', dataIndex: 'company', width: 150 }, { title: '板块', dataIndex: 'plate', width: 110 }, { title: '办公区', dataIndex: 'officeArea', width: 190 },
    { title: '供应商', dataIndex: 'supplier', width: 250 }, { title: '推送日期', dataIndex: 'pushDate', width: 120 }, { title: '采购类型', dataIndex: 'purchaseType', width: 120 },
    { title: '操作', width: 140, fixed: 'right', render: (_, r) => <Space size={2}><Button type="link" className="px-0" onClick={() => openPo(r)}>接收</Button><Button type="link" className="px-0" onClick={() => openReceiptList(r)}>查看</Button></Space> },
  ];
  const itemColumns = [
    { title: '行号', dataIndex: 'id', width: 70 }, { title: '操作', width: 80, render: (_, r) => <Button type="link" className="px-0" disabled={!remainingQty(r)} onClick={() => { setEditItem(r); setEditDraft({ ...r }); }}>编辑</Button> },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 110 }, { title: '物资总类', dataIndex: 'materialGroup', width: 110 }, { title: '资产大类', dataIndex: 'assetClass', width: 110 },
    { title: '物料编码', dataIndex: 'materialCode', width: 170 }, { title: '物料说明', dataIndex: 'materialDesc', width: 190 }, { title: 'PO单说明', dataIndex: 'poDesc', width: 180 },
    { title: '配置', dataIndex: 'config', width: 230 }, { title: '部件数量', dataIndex: 'partQuantity', width: 100, render: (v) => v || '-' }, { title: '部件说明', dataIndex: 'partDesc', width: 160, render: (v) => v || '-' },
    { title: '本次接收数量', dataIndex: 'currentReceiveQty', width: 120, render: count }, { title: '采购数量', dataIndex: 'purchaseQty', width: 100, render: count },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 110, render: money }, { title: '不含税金额小计', width: 140, render: (_, r) => money(lineMoney(r, r.currentReceiveQty).untaxedAmount) },
    { title: '总税额', width: 100, render: (_, r) => money(lineMoney(r, r.currentReceiveQty).taxAmount) }, { title: '含税单价', width: 110, render: (_, r) => money(lineMoney(r, 1).taxedUnit) },
    { title: '含税小计', width: 120, render: (_, r) => money(lineMoney(r, r.currentReceiveQty).taxedAmount) }, { title: '税率', dataIndex: 'taxRate', width: 80, render: (v) => `${round2(v * 100)}%` },
    { title: '已接收数量', dataIndex: 'receivedQty', width: 110, render: count }, { title: '草稿数量', dataIndex: 'draftQty', width: 100, render: count }, { title: '约定到货日期', dataIndex: 'promisedArrivalDate', width: 130 },
    { title: 'PR单 / 行号', dataIndex: 'prLine', width: 150 }, { title: 'SA单 / 行号', dataIndex: 'saLine', width: 150 }, { title: '申请单号', dataIndex: 'applicationNo', width: 150, render: (v) => v || '-' },
    { title: '部门', dataIndex: 'department', width: 170 }, { title: '业务线', dataIndex: 'businessLine', width: 100 },
  ];
  const receiptColumns = [
    { title: '行号', dataIndex: 'id', width: 70 }, { title: '接收单号', dataIndex: 'receiptNo', width: 200, render: (v, r) => <Button type="link" className="px-0" onClick={() => openReceipt(r)}>{v}</Button> },
    { title: '单据状态', dataIndex: 'status', width: 130, render: (v) => <StatusTag value={v} /> }, { title: 'PO单号', dataIndex: 'poNo', width: 170 }, { title: '供应商', dataIndex: 'supplier', width: 250 },
    { title: '制单人', dataIndex: 'receiver', width: 130 }, { title: '制单时间', dataIndex: 'createdAt', width: 180 }, { title: '操作', width: 80, render: (_, r) => <Button type="link" className="px-0" onClick={() => openReceipt(r)}>{r.status === '接收完成' ? '查看' : '编辑'}</Button> },
  ];
  const lineColumns = [
    { title: '行号', dataIndex: 'id', width: 60 }, { title: '物料说明', dataIndex: 'materialDesc', width: 190 }, { title: '配置', dataIndex: 'config', width: 220 }, { title: '部件数量', dataIndex: 'partQuantity', width: 100, render: (v) => v || '-' },
    { title: '部件说明', dataIndex: 'partDesc', width: 150, render: (v) => v || '-' }, { title: '本次接收数量', dataIndex: 'actualReceiveQty', width: 120, render: count }, { title: '采购数量', dataIndex: 'purchaseQty', width: 100, render: count },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 110, render: money }, { title: '不含税金额小计', dataIndex: 'untaxedAmount', width: 140, render: money }, { title: '税额', dataIndex: 'taxAmount', width: 100, render: money },
    { title: '含税单价', dataIndex: 'taxedUnitPrice', width: 110, render: money }, { title: '含税小计', dataIndex: 'taxedAmount', width: 120, render: money }, { title: '税率', dataIndex: 'taxRate', width: 80, render: (v) => `${round2(v * 100)}%` },
    { title: '约定到货日期', dataIndex: 'promisedArrivalDate', width: 130 }, { title: 'PR单 / 行号', dataIndex: 'prLine', width: 150 }, { title: 'SA单 / 行号', dataIndex: 'saLine', width: 150 }, { title: '申请单号', dataIndex: 'applicationNo', width: 150, render: (v) => v || '-' },
    { title: '部门', dataIndex: 'department', width: 160 }, { title: '业务线', dataIndex: 'businessLine', width: 100 }, { title: '本次实际接收数量', dataIndex: 'actualReceiveQty', width: 140, render: count },
  ];
  const detailColumns = [
    { title: '行号', width: 60, render: (_, __, i) => i + 1 }, { title: '耗材标签号', dataIndex: 'assetTag', width: 220, render: (v) => v || '-' },
    { title: 'SN号', dataIndex: 'sn', width: 180, render: (v, r) => activeReceipt?.status === '接收完成' ? (v || '-') : <Input size="small" value={v} placeholder="扫描或录入SN" onChange={(e) => setDetailSn(r.id, e.target.value)} /> },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 }, { title: '耗材大类', dataIndex: 'consumableClass', width: 110 }, { title: '耗材说明', dataIndex: 'consumableDesc', width: 190 }, { title: '配置', dataIndex: 'config', width: 220 },
    { title: '耗材数量', dataIndex: 'quantity', width: 100 }, { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 110, render: money }, { title: '税金', dataIndex: 'taxAmount', width: 100, render: money },
    { title: 'PR单 / 行号', dataIndex: 'prLine', width: 150 }, { title: 'SA单 / 行号', dataIndex: 'saLine', width: 150 }, { title: '申请人', dataIndex: 'applicant', width: 120 }, { title: '业务线', dataIndex: 'businessLine', width: 100 }, { title: '资产标记', dataIndex: 'assetMark', width: 100 }, { title: '备注', dataIndex: 'remark', width: 120, render: (v) => v || '-' },
  ];

  if (view === 'poDetail' && activePO) {
    const untaxed = activeItems.reduce((sum, item) => sum + lineMoney(item, item.purchaseQty).untaxedAmount, 0);
    const tax = activeItems.reduce((sum, item) => sum + lineMoney(item, item.purchaseQty).taxAmount, 0);
    return <Space direction="vertical" size={16} className="w-full">{contextHolder}<PageTitle /><Alert type="info" showIcon message="默认为全量接收，可点击编辑按钮修改接收数量！" />
      <Card size="small" title="PO基础信息"><Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="PO单号">{activePO.poNo}</Descriptions.Item><Descriptions.Item label="供应商">{activePO.supplier}</Descriptions.Item><Descriptions.Item label="供应商联系电话">{activePO.supplierPhone}</Descriptions.Item>
        <Descriptions.Item label="PO单说明">{activePO.poName}</Descriptions.Item><Descriptions.Item label="采购单位">{activePO.procurementUnit}</Descriptions.Item><Descriptions.Item label="合同主体">{activePO.contractSubject}</Descriptions.Item>
        <Descriptions.Item label="采购单位联系电话">{activePO.procurementUnitPhone}</Descriptions.Item>{activePO.purchaseType === '低值耐用品' && <><Descriptions.Item label="不含税合计">{money(untaxed)}</Descriptions.Item><Descriptions.Item label="合计税额">{money(tax)}</Descriptions.Item><Descriptions.Item label="合计金额">{money(untaxed + tax)}</Descriptions.Item></>}
        <Descriptions.Item label="采购员">{activePO.buyer}</Descriptions.Item><Descriptions.Item label="采购员联系电话">{activePO.buyerPhone}</Descriptions.Item><Descriptions.Item label="推送日期">{activePO.pushDate}</Descriptions.Item>
        <Descriptions.Item label="板块">{activePO.receiptStatus === '已入库' ? activePO.plate : <SelectorInput value={activePO.plate} placeholder="请选择板块" onOpen={() => setSelectorType('detailPlate')} />}</Descriptions.Item><Descriptions.Item label="申请批次">{activePO.applicationBatch}</Descriptions.Item>
      </Descriptions></Card>
      <Card size="small" title="采购明细"><Table rowKey="id" size="small" bordered columns={itemColumns} dataSource={activeItems} rowSelection={{ selectedRowKeys: selectedPoItems, onChange: setSelectedPoItems, fixed: true, getCheckboxProps: (r) => ({ disabled: !remainingQty(r) || !r.currentReceiveQty }) }} scroll={{ x: 'max-content' }} pagination={false} /></Card>
      <div className="flex justify-center gap-3"><Button type="primary" onClick={createReceipt}>创建接收单</Button><Button onClick={() => openReceiptList(activePO)}>查看接收单</Button><Button onClick={() => setView('poList')}>返回</Button></div>
      <Modal open={Boolean(editItem && editDraft)} title="编辑接收信息" width={720} okText="保存" onOk={saveItem} onCancel={() => { setEditItem(null); setEditDraft(null); }}>
        {editDraft && <Space direction="vertical" size={12} className="w-full"><div onClick={() => setSelectorType('material')} className="cursor-pointer"><Typography.Text>物料</Typography.Text><Input className="mt-1 pointer-events-none" readOnly value={`${editDraft.materialCode} / ${editDraft.materialDesc}`} suffix={<Search size={14} className="text-[#1677ff]" />} /></div>
          <div><Typography.Text>配置</Typography.Text><Input className="mt-1" value={editDraft.config} onChange={(e) => setEditDraft((x) => ({ ...x, config: e.target.value }))} /></div>
          <div><Typography.Text>接收数量</Typography.Text><InputNumber className="mt-1 w-full" min={1} max={remainingQty(editItem)} precision={0} value={editDraft.currentReceiveQty} onChange={(v) => setEditDraft((x) => ({ ...x, currentReceiveQty: v }))} /><Typography.Text type="secondary">当前剩余可接收数量：{count(remainingQty(editItem))}</Typography.Text></div>
          {activePO.purchaseType === '低值耐用品' && <><div><Typography.Text>是否部件</Typography.Text><Select className="mt-1 w-full" value={editDraft.isPart ? 'Y' : 'N'} options={[{ label: '是', value: 'Y' }, { label: '否', value: 'N' }]} onChange={(v) => setEditDraft((x) => ({ ...x, isPart: v === 'Y' }))} /></div><div><Typography.Text>部件数量</Typography.Text><InputNumber className="mt-1 w-full" disabled={!editDraft.isPart} min={1} precision={0} value={editDraft.partQuantity || undefined} onChange={(v) => setEditDraft((x) => ({ ...x, partQuantity: v || 0 }))} /></div><div><Typography.Text>部件描述</Typography.Text><Input className="mt-1" disabled={!editDraft.isPart} value={editDraft.partDesc} onChange={(e) => setEditDraft((x) => ({ ...x, partDesc: e.target.value }))} /></div></>}
        </Space>}
      </Modal>
      {selectorConfig && <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={selectorConfig.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={selectorConfig.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={(r) => { selectorConfig.confirm(r); setSelectorType(''); }} />}
    </Space>;
  }

  if (view === 'receiptList') return <Space direction="vertical" size={16} className="w-full">{contextHolder}<PageTitle />
    <QueryBar onQuery={() => { setReceiptFilters({ ...receiptDraft }); setSelectedReceipts([]); }} onReset={() => { const f = activePO ? { ...EMPTY_RECEIPT_FILTERS, poNo: activePO.poNo } : EMPTY_RECEIPT_FILTERS; setReceiptDraft(f); setReceiptFilters(f); setSelectedReceipts([]); }}>
      <QueryItem label="接收单号"><Input value={receiptDraft.receiptNo} onChange={(e) => setReceiptFilter('receiptNo', e.target.value)} /></QueryItem><QueryItem label="PO单号"><Input value={receiptDraft.poNo} onChange={(e) => setReceiptFilter('poNo', e.target.value)} /></QueryItem>
      <QueryItem label="单据状态"><Select allowClear placeholder="全部" value={receiptDraft.status || undefined} options={['草稿', '接收待维护', '接收完成'].map((v) => ({ label: v, value: v }))} onChange={(v) => setReceiptFilter('status', v)} /></QueryItem><QueryItem label="制单人"><Input value={receiptDraft.creator} onChange={(e) => setReceiptFilter('creator', e.target.value)} /></QueryItem>
      <QueryItem label="制单时间"><RangePicker style={{ width: '100%' }} onChange={(d) => { setReceiptFilter('createdFrom', d?.[0]?.format('YYYY-MM-DD') || ''); setReceiptFilter('createdTo', d?.[1]?.format('YYYY-MM-DD') || ''); }} /></QueryItem><QueryItem label="供应商"><SelectorInput value={receiptDraft.supplier} placeholder="请选择供应商" onOpen={() => setSelectorType('receiptSupplier')} /></QueryItem>
    </QueryBar>
    <Card size="small" title="接收单列表"><div className="mb-3 flex justify-end"><Button danger icon={<Trash2 size={14} />} onClick={deleteReceipts}>删除接收单</Button></div><Table rowKey="id" size="small" bordered columns={receiptColumns} dataSource={filteredReceipts} rowSelection={{ selectedRowKeys: selectedReceipts, onChange: setSelectedReceipts, fixed: true, getCheckboxProps: (r) => ({ disabled: r.status !== '草稿' }) }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} /></Card>
    <div className="flex justify-center"><Button onClick={() => setView('poList')}>返回</Button></div>{selectorConfig && <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={[{ title: '名称', dataIndex: 'name' }]} searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={(r) => { selectorConfig.confirm(r); setSelectorType(''); }} />}
  </Space>;

  if (view === 'receiptDetail' && activeReceipt) {
    const totals = activeReceipt.lines.reduce((m, l) => ({ untaxed: m.untaxed + l.untaxedAmount, tax: m.tax + l.taxAmount, taxed: m.taxed + l.taxedAmount }), { untaxed: 0, tax: 0, taxed: 0 });
    return <Space direction="vertical" size={16} className="w-full">{contextHolder}<PageTitle />
      <Card size="small" title="接收单信息"><Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="采购接收单号">{activeReceipt.receiptNo}</Descriptions.Item><Descriptions.Item label="PO单号">{activeReceipt.poNo}</Descriptions.Item><Descriptions.Item label="PO单说明">{activeReceipt.poName}</Descriptions.Item><Descriptions.Item label="供应商">{activeReceipt.supplier}</Descriptions.Item><Descriptions.Item label="联系人">-</Descriptions.Item><Descriptions.Item label="供应商联系电话">{activeReceipt.supplierPhone}</Descriptions.Item>
        <Descriptions.Item label="采购单位">{activeReceipt.procurementUnit}</Descriptions.Item><Descriptions.Item label="采购员">{activeReceipt.buyer}</Descriptions.Item><Descriptions.Item label="采购员联系电话">{activeReceipt.buyerPhone}</Descriptions.Item><Descriptions.Item label="合同主体">{activeReceipt.contractSubject}</Descriptions.Item><Descriptions.Item label="板块">{activeReceipt.plate}</Descriptions.Item><Descriptions.Item label="接收人">{activeReceipt.receiver}</Descriptions.Item>
        <Descriptions.Item label="接收单状态"><StatusTag value={activeReceipt.status} /></Descriptions.Item><Descriptions.Item label="接收时间">{activeReceipt.createdAt.slice(0, 10)}</Descriptions.Item><Descriptions.Item label="申请批次">{activeReceipt.applicationBatch}</Descriptions.Item><Descriptions.Item label="本次不含税金额">{money(totals.untaxed)}</Descriptions.Item><Descriptions.Item label="本次税额">{money(totals.tax)}</Descriptions.Item><Descriptions.Item label="本次含税金额">{money(totals.taxed)}</Descriptions.Item>
      </Descriptions></Card>
      <Card size="small" title="接收行明细"><Table rowKey="id" size="small" bordered columns={lineColumns} dataSource={activeReceipt.lines} rowSelection={activeReceipt.status === '草稿' ? { selectedRowKeys: selectedLines, onChange: setSelectedLines, fixed: true, getCheckboxProps: (r) => ({ disabled: r.actualReceiveQty !== 0 }) } : undefined} scroll={{ x: 'max-content' }} pagination={false} /></Card>
      {activeReceipt.inboundResult && <Card size="small" title="自动入库结果"><Descriptions bordered size="small" column={3}><Descriptions.Item label="入库单号">{activeReceipt.inboundResult.inboundNo}</Descriptions.Item><Descriptions.Item label="单据类型">入库单</Descriptions.Item><Descriptions.Item label="入库类型">采购接收</Descriptions.Item><Descriptions.Item label="单据状态">已完成</Descriptions.Item><Descriptions.Item label="入库仓库">{activeReceipt.inboundResult.warehouse}</Descriptions.Item><Descriptions.Item label="制单人">{activeReceipt.inboundResult.creator}</Descriptions.Item><Descriptions.Item label="制单时间">{activeReceipt.inboundResult.createdAt}</Descriptions.Item><Descriptions.Item label="供应商">{activeReceipt.supplier}</Descriptions.Item><Descriptions.Item label="是否自动出库">N</Descriptions.Item><Descriptions.Item label="自动入库数量">{count(activeReceipt.inboundResult.quantity)}</Descriptions.Item><Descriptions.Item label="库存方向">增加</Descriptions.Item><Descriptions.Item label="是否影响库存">Y</Descriptions.Item></Descriptions></Card>}
      <div className="flex justify-center gap-3 flex-wrap">{activeReceipt.status === '草稿' && activeReceipt.purchaseType === '低值耐用品' && <Button onClick={openMaintenance}>维护接收明细</Button>}{activeReceipt.status === '草稿' && <Button danger onClick={cancelReceipt}>取消接收</Button>}{activeReceipt.status === '草稿' && <Button type="primary" onClick={confirmReceipt}>接收确认</Button>}{activeReceipt.status === '接收待维护' && <Button onClick={openMaintenance}>维护接收明细</Button>}{activeReceipt.status === '接收待维护' && <Button icon={<Printer size={14} />} onClick={printLabels}>标签打印</Button>}{activeReceipt.status === '接收待维护' && <Button type="primary" onClick={completeDurable}>接收完成</Button>}{activeReceipt.status !== '草稿' && <Button icon={<Printer size={14} />} onClick={() => messageApi.success('已打开接收单打印预览（原型）')}>接收单打印</Button>}<Button onClick={() => openReceiptList(activePO || poRows.find((p) => p.poNo === activeReceipt.poNo))}>返回</Button></div>
    </Space>;
  }

  if (view === 'maintenance' && activeReceipt) {
    const details = activeReceipt.details || []; const matched = details.find((d) => d.id === scan.detailId);
    return <Space direction="vertical" size={16} className="w-full">{contextHolder}<PageTitle />
      <Card size="small" title="接收单信息"><Descriptions bordered size="small" column={3}><Descriptions.Item label="接收单号">{activeReceipt.receiptNo}</Descriptions.Item><Descriptions.Item label="PO单号">{activeReceipt.poNo}</Descriptions.Item><Descriptions.Item label="接收单状态"><StatusTag value={activeReceipt.status} /></Descriptions.Item><Descriptions.Item label="供应商">{activeReceipt.supplier}</Descriptions.Item><Descriptions.Item label="接收人">{activeReceipt.receiver}</Descriptions.Item><Descriptions.Item label="接收时间">{activeReceipt.createdAt.slice(0, 10)}</Descriptions.Item></Descriptions></Card>
      <Card size="small" title="低值耐用品接收明细"><div className="mb-3 flex justify-end gap-2">{activeReceipt.status === '草稿' && <Button danger icon={<Trash2 size={14} />} onClick={deleteDetails}>删除行</Button>}<Button onClick={generateTags}>生成标签号</Button><Button onClick={fillDefaultSn}>维护SN号</Button><Button onClick={() => setScan({ open: true, tag: '', sn: '', detailId: null })}>扫描维护</Button>{activeReceipt.status === '接收待维护' && <Button icon={<Printer size={14} />} onClick={printLabels}>标签打印</Button>}</div><Table rowKey="id" size="small" bordered columns={detailColumns} dataSource={details} rowSelection={activeReceipt.status === '草稿' ? { selectedRowKeys: selectedDetails, onChange: setSelectedDetails, fixed: true } : undefined} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} /></Card>
      <div className="flex justify-center gap-3">{activeReceipt.status === '草稿' && <Button type="primary" onClick={confirmReceipt}>接收确认</Button>}{activeReceipt.status === '接收待维护' && <Button type="primary" onClick={completeDurable}>接收完成</Button>}<Button onClick={() => setView('receiptDetail')}>返回</Button></div>
      <Modal open={scan.open} title="扫描维护" okText="保存SN" onCancel={() => setScan((x) => ({ ...x, open: false }))} onOk={() => { if (!matched) return messageApi.warning('请先扫描耗材标签号'); if (!scan.sn.trim()) return messageApi.warning('SN 号禁止为空'); if (duplicateSn(scan.sn.trim(), matched.id)) return messageApi.error(`SN 号：${scan.sn.trim()} 已存在！`); setDetailSn(matched.id, scan.sn.trim()); setScan((x) => ({ ...x, open: false })); }}><Space direction="vertical" size={12} className="w-full"><div><Typography.Text>第一步：扫描耗材标签号</Typography.Text><Input className="mt-1" value={scan.tag} onChange={(e) => { const tag = e.target.value; const d = details.find((x) => x.assetTag === tag.trim()); setScan((x) => ({ ...x, tag, detailId: d?.id || null })); }} />{scan.tag && !matched && <Typography.Text type="danger">未找到匹配的标签号：{scan.tag}</Typography.Text>}</div>{matched && <Alert type="success" showIcon message={`标签号：${matched.assetTag}`} description={`配置：${matched.config}；物料说明：${matched.consumableDesc}`} />}<div><Typography.Text>第二步：扫描 SN 号</Typography.Text><Input className="mt-1" disabled={!matched} value={scan.sn} onChange={(e) => setScan((x) => ({ ...x, sn: e.target.value }))} /></div></Space></Modal>
    </Space>;
  }

  return <Space direction="vertical" size={16} className="w-full">{contextHolder}<PageTitle />
    <QueryBar onQuery={() => setPoFilters({ ...poDraft })} onReset={() => { setPoDraft(EMPTY_PO_FILTERS); setPoFilters(EMPTY_PO_FILTERS); }}>
      <QueryItem label="公司"><SelectorInput value={poDraft.company} placeholder="请选择公司" onOpen={() => setSelectorType('company')} /></QueryItem><QueryItem label="板块"><SelectorInput value={poDraft.plate} placeholder="请选择板块" onOpen={() => setSelectorType('plate')} /></QueryItem><QueryItem label="PO单号"><Input value={poDraft.poNo} onChange={(e) => setPoFilter('poNo', e.target.value)} /></QueryItem>
      <QueryItem label="供应商"><SelectorInput value={poDraft.supplier} placeholder="请选择供应商" onOpen={() => setSelectorType('supplier')} /></QueryItem><QueryItem label="接收状态"><Select allowClear placeholder="全部" value={poDraft.receiptStatus || undefined} options={['待接收', '已接收', '已入库'].map((v) => ({ label: v, value: v }))} onChange={(v) => setPoFilter('receiptStatus', v)} /></QueryItem><QueryItem label="采购类型"><Select allowClear placeholder="全部" value={poDraft.purchaseType || undefined} options={['低值耐用品', '低耗耗材'].map((v) => ({ label: v, value: v }))} onChange={(v) => setPoFilter('purchaseType', v)} /></QueryItem>
      <QueryItem label="办公区"><Select allowClear placeholder="全部" value={poDraft.officeArea || undefined} options={OFFICE_AREAS.map((v) => ({ label: v, value: v }))} onChange={(v) => setPoFilter('officeArea', v)} /></QueryItem><QueryItem label="推送日期"><RangePicker style={{ width: '100%' }} onChange={(d) => { setPoFilter('pushFrom', d?.[0]?.format('YYYY-MM-DD') || ''); setPoFilter('pushTo', d?.[1]?.format('YYYY-MM-DD') || ''); }} /></QueryItem>
    </QueryBar>
    <Card size="small" title="PO单列表"><Table rowKey="id" size="small" bordered columns={poColumns} dataSource={filteredPos} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} /></Card>
    {selectorConfig && <SelectModal open title={selectorConfig.title} dataSource={selectorConfig.dataSource} columns={selectorConfig.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={selectorConfig.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={() => setSelectorType('')} onConfirm={(r) => { selectorConfig.confirm(r); setSelectorType(''); }} />}
  </Space>;
}