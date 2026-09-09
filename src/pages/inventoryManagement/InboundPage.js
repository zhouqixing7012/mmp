import React, { useMemo, useState } from 'react';
import {
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
import { Plus, Printer, Search, Trash2, Upload } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;
const INBOUND_TYPES = ['新增入库', '采购接收', '退库入库', '借用归还'];
const WAREHOUSES = [
  'I0001-资产集团总库（新媒体）',
  'I0013-资产集团前台库（新媒体）',
  'I0022-资产集团前台库（焦点互动）',
];

const INITIAL_ROWS = [
  { id: 1, documentNo: 'PI-202608070025', applicationNo: 'ERA-202608070021', status: '已完成', inboundType: '退库入库', warehouse: 'I0022-资产集团前台库（焦点互动）', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', prNo: '', assetTag: '' },
  { id: 2, documentNo: 'PI-202608070024', applicationNo: 'ERA-202608070002', status: '已完成', inboundType: '退库入库', warehouse: 'I0013-资产集团前台库（新媒体）', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', prNo: '', assetTag: '' },
  { id: 3, documentNo: 'PI-202608060003', applicationNo: 'EBA-202608050001', status: '已完成', inboundType: '借用归还', warehouse: 'I0013-资产集团前台库（新媒体）', createdDate: '2026-08-06', creator: '114111-杨芊', quantity: 1, cardClaim: '否', poNo: '', prNo: '', assetTag: 'AST-100023' },
  { id: 4, documentNo: 'PI-202608050012', applicationNo: '', status: '已完成', inboundType: '采购接收', warehouse: 'I0001-资产集团总库（新媒体）', createdDate: '2026-08-05', creator: '206984-何文', quantity: 3, cardClaim: '否', poNo: 'PO2606030001', prNo: 'PR2605270012', assetTag: '' },
  { id: 5, documentNo: 'PI-202608010006', applicationNo: '', status: '已完成', inboundType: '新增入库', warehouse: 'I0001-资产集团总库（新媒体）', createdDate: '2026-08-01', creator: '206984-何文', quantity: 1, cardClaim: '否', poNo: '', prNo: '', assetTag: 'AST-100019' },
];

const PURCHASE_PENDING_ROWS = [
  { id: 1, company: '114.新媒体', plate: '集团', department: 'ERP部.业务产品二组', supplier: '北京一新科技有限责任公司', assetTag: 'AST-260901001', sn: 'SN-R740-001', poNo: 'PO2606030001', receiptNo: 'REC-202606110001', materialGroup: '1.资产', assetClass: '14.SERVER', assetSubClass: '服务器', materialDesc: 'Dell.R740', config: 'Silver4210*2 / 128G / 600G*8', partQuantity: 0, partDesc: '-', prLine: 'PR2605270012 / 1', quantity: 1, originalValue: 49800.77, tax: 6474.10, billable: '是' },
  { id: 2, company: '114.新媒体', plate: '集团', department: 'ERP部.基础架构组', supplier: '北京汉信成科技发展有限公司', assetTag: 'AST-260901002', sn: 'SN-T14-018', poNo: 'PO2603270001', receiptNo: 'REC-202604090003', materialGroup: '1.资产', assetClass: '10.电脑', assetSubClass: '笔记本电脑', materialDesc: '联想.ThinkPad T14', config: 'i7 / 32G / 1T', partQuantity: 0, partDesc: '-', prLine: 'PR2603180007 / 2', quantity: 1, originalValue: 8200, tax: 1066, billable: '否' },
];

const SOURCE_ASSET = {
  assetTag: 'AST-2409010068',
  sn: 'SN-T14-0068',
  materialDesc: '联想.ThinkPad T14',
  enabledDate: '2024-09-01',
  materialGroup: '1.资产',
  assetClass: '10.电脑',
  assetSubClass: '笔记本电脑',
  mainAssetTag: '-',
  brand: '联想',
  model: 'ThinkPad T14',
  config: 'i7 / 32G / 1T SSD',
  unit: '台',
  quantity: 1,
  assetStatus: '借出',
  printNo: 'PRINT-2409010068',
  company: '114.新媒体',
  plate: '集团',
  businessLine: '0.*',
  costCenter: 'ERP部',
  city: '010.北京市',
  building: '129753.搜狐媒体大厦',
  floor: '15F',
  room: '1508',
  expenseAccount: '固定资产',
  usage: '办公',
  partQuantity: 0,
  partDesc: '-',
  remark: '-',
  responsiblePerson: '114111-杨芊',
  area: 'A区',
  location: 'A-01-03',
  assetMark: '主资产',
  appraisalNo: 'APP-20260901001',
  appraisalResult: '正常',
  appraiser: '206984-何文',
  appraisalDate: '2026-09-01',
};

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function money(value) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children || '-'}</Typography.Text>;
}

function LookupInput({ value, placeholder = '请选择', onClick }) {
  return (
    <div className="cursor-pointer" onClick={onClick}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} />} />
    </div>
  );
}

function EditorField({ label, children, span = 1 }) {
  return <DetailItem label={label} span={span}>{children}</DetailItem>;
}

function NewInboundItemModal({ open, warehouse, onCancel, onConfirm }) {
  const [form, setForm] = useState({
    materialDesc: '联想.ThinkPad T14', materialGroup: '1.资产', assetClass: '10.电脑', assetSubClass: '笔记本电脑', brand: '联想', model: 'ThinkPad T14', config: 'i7 / 32G / 1T SSD', unit: '台', area: 'A区', location: 'A-01-03', applicationBatch: '2026Q3', quantity: 1, contractNo: 'HT-2026-09001', originalValue: 8200, tax: 1066, assetTag: '', sn: '', assetLevel: '普通资产', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '15F', usage: '办公', department: 'ERP部.业务产品二组', responsiblePerson: '114111-杨芊', addType: '采购新增', company: '114.新媒体', costCenter: 'ERP部', businessLine: '0.*', project: '0.*', plate: '集团', expenseAccount: '固定资产', purchaseDate: '2026-09-10', enableDate: '2026-09-10', prNo: 'PR2603180007', applicationNo: '', poNo: '', applicant: '206984-何文', partQuantity: 0, partDesc: '', mainAssetTag: '', supplier: '北京一新科技有限责任公司', usageDesc: '', remark: ''
  });
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <Modal open={open} title="添加新增入库物资" width={1180} okText="添加并关闭" cancelText="取消" onCancel={onCancel} onOk={() => onConfirm({ ...form, total: Number(form.originalValue || 0) + Number(form.tax || 0) })}>
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Text type="secondary">当前仓库：{warehouse}</Typography.Text>
        <Card size="small" title="物资信息">
          <DetailGrid columns={3} labelWidth={96} minWidth={980}>
            <EditorField label="物资说明*"><LookupInput value={form.materialDesc} onClick={() => {}} /></EditorField>
            <EditorField label="物资总类"><Select className="w-full" value={form.materialGroup} options={[{ label: '1.资产', value: '1.资产' }]} onChange={(v) => set('materialGroup', v)} /></EditorField>
            <EditorField label="物资大类"><Input value={form.assetClass} onChange={(e) => set('assetClass', e.target.value)} /></EditorField>
            <EditorField label="物资小类"><Input value={form.assetSubClass} onChange={(e) => set('assetSubClass', e.target.value)} /></EditorField>
            <EditorField label="品牌"><Input value={form.brand} onChange={(e) => set('brand', e.target.value)} /></EditorField>
            <EditorField label="规格型号"><Input value={form.model} onChange={(e) => set('model', e.target.value)} /></EditorField>
            <EditorField label="配置"><Input value={form.config} onChange={(e) => set('config', e.target.value)} /></EditorField>
            <EditorField label="计量单位"><Input value={form.unit} onChange={(e) => set('unit', e.target.value)} /></EditorField>
            <EditorField label="库区"><Input value={form.area} onChange={(e) => set('area', e.target.value)} /></EditorField>
            <EditorField label="库位"><Input value={form.location} onChange={(e) => set('location', e.target.value)} /></EditorField>
            <EditorField label="申请批次"><Input value={form.applicationBatch} onChange={(e) => set('applicationBatch', e.target.value)} /></EditorField>
            <EditorField label="入库数量*"><InputNumber className="w-full" min={1} precision={0} value={form.quantity} onChange={(v) => set('quantity', v || 1)} /></EditorField>
            <EditorField label="合同编号"><Input value={form.contractNo} onChange={(e) => set('contractNo', e.target.value)} /></EditorField>
            <EditorField label="原值*"><InputNumber className="w-full" min={0} precision={2} value={form.originalValue} onChange={(v) => set('originalValue', v || 0)} /></EditorField>
            <EditorField label="税金"><InputNumber className="w-full" min={0} precision={2} value={form.tax} onChange={(v) => set('tax', v || 0)} /></EditorField>
            <EditorField label="合计"><Readonly>{money(Number(form.originalValue || 0) + Number(form.tax || 0))}</Readonly></EditorField>
            <EditorField label="资产标签号"><Input value={form.assetTag} onChange={(e) => set('assetTag', e.target.value)} /></EditorField>
            <EditorField label="SN号"><Input value={form.sn} onChange={(e) => set('sn', e.target.value)} /></EditorField>
            <EditorField label="资产级别"><Select className="w-full" value={form.assetLevel} options={['普通资产', '重要资产'].map((v) => ({ label: v, value: v }))} onChange={(v) => set('assetLevel', v)} /></EditorField>
            <EditorField label="资产状态*"><Readonly>在库-新增</Readonly></EditorField>
            <EditorField label="City*"><Input value={form.city} onChange={(e) => set('city', e.target.value)} /></EditorField>
            <EditorField label="Building*"><LookupInput value={form.building} onClick={() => {}} /></EditorField>
            <EditorField label="Floor*"><Select className="w-full" value={form.floor} options={['15F', '16F', '17F'].map((v) => ({ label: v, value: v }))} onChange={(v) => set('floor', v)} /></EditorField>
            <EditorField label="用途"><Select className="w-full" value={form.usage} options={['办公', '测试', '机房'].map((v) => ({ label: v, value: v }))} onChange={(v) => set('usage', v)} /></EditorField>
            <EditorField label="所在部门"><Input value={form.department} onChange={(e) => set('department', e.target.value)} /></EditorField>
            <EditorField label="责任人*"><LookupInput value={form.responsiblePerson} onClick={() => {}} /></EditorField>
            <EditorField label="新增类型*"><Select className="w-full" value={form.addType} options={['采购新增', '盘盈新增', '其他新增'].map((v) => ({ label: v, value: v }))} onChange={(v) => set('addType', v)} /></EditorField>
            <EditorField label="原资产标签号"><Input value={form.originalAssetTag || ''} onChange={(e) => set('originalAssetTag', e.target.value)} /></EditorField>
            <EditorField label="公司*"><Readonly>{form.company}</Readonly></EditorField>
            <EditorField label="成本中心*"><LookupInput value={form.costCenter} onClick={() => {}} /></EditorField>
            <EditorField label="业务线"><LookupInput value={form.businessLine} onClick={() => {}} /></EditorField>
            <EditorField label="项目"><LookupInput value={form.project} onClick={() => {}} /></EditorField>
            <EditorField label="板块*"><LookupInput value={form.plate} onClick={() => {}} /></EditorField>
            <EditorField label="费用账户"><Input value={form.expenseAccount} onChange={(e) => set('expenseAccount', e.target.value)} /></EditorField>
            <EditorField label="购置日期*"><DatePicker className="w-full" value={dayjs(form.purchaseDate)} onChange={(d) => set('purchaseDate', d?.format('YYYY-MM-DD') || '')} /></EditorField>
            <EditorField label="启用日期*"><DatePicker className="w-full" value={dayjs(form.enableDate)} onChange={(d) => set('enableDate', d?.format('YYYY-MM-DD') || '')} /></EditorField>
            <EditorField label="PR单号"><Input value={form.prNo} onChange={(e) => set('prNo', e.target.value)} /></EditorField>
            <EditorField label="申请单号"><Input value={form.applicationNo} onChange={(e) => set('applicationNo', e.target.value)} /></EditorField>
            <EditorField label="PO单号"><Input value={form.poNo} onChange={(e) => set('poNo', e.target.value)} /></EditorField>
            <EditorField label="申请人"><LookupInput value={form.applicant} onClick={() => {}} /></EditorField>
            <EditorField label="部件数量"><InputNumber className="w-full" min={0} precision={0} value={form.partQuantity} onChange={(v) => set('partQuantity', v || 0)} /></EditorField>
            <EditorField label="部件说明"><Input value={form.partDesc} onChange={(e) => set('partDesc', e.target.value)} /></EditorField>
            <EditorField label="主资产标签号"><LookupInput value={form.mainAssetTag} onClick={() => {}} /></EditorField>
            <EditorField label="供应商"><LookupInput value={form.supplier} onClick={() => {}} /></EditorField>
            <EditorField label="使用说明" span={3}><Input value={form.usageDesc} onChange={(e) => set('usageDesc', e.target.value)} /></EditorField>
            <EditorField label="备注" span={3}><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={form.remark} onChange={(e) => set('remark', e.target.value)} /></EditorField>
          </DetailGrid>
        </Card>
      </Space>
    </Modal>
  );
}

function AssetInboundItemModal({ open, mode, warehouse, onCancel, onConfirm }) {
  const isBorrow = mode === '借用归还';
  const [asset, setAsset] = useState({ ...SOURCE_ASSET });
  const [form, setForm] = useState({ returnQty: 1, returnDate: '2026-09-10', returnReason: '员工退库', borrowReason: '项目临时使用', borrowDate: '2026-08-01', borrowApplicationNo: 'EBA-202608050001', renewCount: 0, usageDesc: '' });
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <Modal open={open} title={isBorrow ? '添加借用归还物资' : '添加退库入库物资'} width={1180} okText="添加并关闭" cancelText="取消" onCancel={onCancel} onOk={() => onConfirm({ ...asset, ...form, quantity: form.returnQty || 1, inboundStatus: '在库-待处理', returnType: isBorrow ? '' : '一般退库' })}>
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Text type="secondary">当前仓库：{warehouse}</Typography.Text>
        <Card size="small" title="选择物资">
          <DetailGrid columns={3} labelWidth={96}>
            <EditorField label="资产标签号"><LookupInput value={asset.assetTag} onClick={() => {}} /></EditorField>
            <EditorField label="SN号"><LookupInput value={asset.sn} onClick={() => {}} /></EditorField>
            <EditorField label="物资说明*"><LookupInput value={asset.materialDesc} onClick={() => {}} /></EditorField>
          </DetailGrid>
        </Card>
        <Card size="small" title="物资信息">
          <DetailGrid columns={3} labelWidth={96} minWidth={980}>
            <EditorField label="资产标签号"><Readonly>{asset.assetTag}</Readonly></EditorField>
            <EditorField label="SN号"><Readonly>{asset.sn}</Readonly></EditorField>
            <EditorField label="物资说明"><Readonly>{asset.materialDesc}</Readonly></EditorField>
            <EditorField label="启用日期"><Readonly>{asset.enabledDate}</Readonly></EditorField>
            <EditorField label="物资总类"><Readonly>{asset.materialGroup}</Readonly></EditorField>
            <EditorField label="物资大类"><Readonly>{asset.assetClass}</Readonly></EditorField>
            <EditorField label="物资小类"><Readonly>{asset.assetSubClass}</Readonly></EditorField>
            <EditorField label="主资产标签号"><Readonly>{asset.mainAssetTag}</Readonly></EditorField>
            <EditorField label="品牌"><Readonly>{asset.brand}</Readonly></EditorField>
            <EditorField label="规格型号"><Readonly>{asset.model}</Readonly></EditorField>
            <EditorField label="配置"><Readonly>{asset.config}</Readonly></EditorField>
            <EditorField label="计量单位"><Readonly>{asset.unit}</Readonly></EditorField>
            <EditorField label={isBorrow ? '借用人' : '退库人'}><Readonly>206984-何文</Readonly></EditorField>
            <EditorField label={isBorrow ? '借用数量' : '资产数量'}><Readonly>{asset.quantity}</Readonly></EditorField>
            <EditorField label="资产状态"><Readonly>{asset.assetStatus}</Readonly></EditorField>
            <EditorField label="印刷号"><Readonly>{asset.printNo}</Readonly></EditorField>
            <EditorField label="公司"><Readonly>{asset.company}</Readonly></EditorField>
            <EditorField label="板块"><Readonly>{asset.plate}</Readonly></EditorField>
            <EditorField label="业务线"><Readonly>{asset.businessLine}</Readonly></EditorField>
            <EditorField label="成本中心"><Readonly>{asset.costCenter}</Readonly></EditorField>
            <EditorField label="City"><Readonly>{asset.city}</Readonly></EditorField>
            <EditorField label="Building"><Readonly>{asset.building}</Readonly></EditorField>
            <EditorField label="Floor"><Readonly>{asset.floor}</Readonly></EditorField>
            <EditorField label="Room"><Readonly>{asset.room}</Readonly></EditorField>
            <EditorField label="费用账户"><Readonly>{asset.expenseAccount}</Readonly></EditorField>
            <EditorField label="用途"><Readonly>{asset.usage}</Readonly></EditorField>
            <EditorField label="部件数量"><Readonly>{asset.partQuantity}</Readonly></EditorField>
            <EditorField label="部件说明"><Readonly>{asset.partDesc}</Readonly></EditorField>
            {isBorrow && <EditorField label="借用开始日期"><Readonly>{form.borrowDate}</Readonly></EditorField>}
            {isBorrow && <EditorField label="借用申请单号"><Readonly>{form.borrowApplicationNo}</Readonly></EditorField>}
            {isBorrow && <EditorField label="借用原因"><Readonly>{form.borrowReason}</Readonly></EditorField>}
            {isBorrow && <EditorField label="续借次数"><Readonly>{form.renewCount}</Readonly></EditorField>}
            <EditorField label="备注" span={3}><Readonly>{asset.remark}</Readonly></EditorField>
          </DetailGrid>
        </Card>
        <Card size="small" title={isBorrow ? '借用归还入库' : '一般退库入库'}>
          <DetailGrid columns={3} labelWidth={96}>
            <EditorField label="责任人*"><LookupInput value={asset.responsiblePerson} onClick={() => {}} /></EditorField>
            <EditorField label="库区"><Input value={asset.area} onChange={(e) => setAsset((current) => ({ ...current, area: e.target.value }))} /></EditorField>
            <EditorField label="货位"><Input value={asset.location} onChange={(e) => setAsset((current) => ({ ...current, location: e.target.value }))} /></EditorField>
            <EditorField label="资产标记"><Select className="w-full" value={asset.assetMark} options={['主资产', '附属资产'].map((v) => ({ label: v, value: v }))} onChange={(v) => setAsset((current) => ({ ...current, assetMark: v }))} /></EditorField>
            <EditorField label={isBorrow ? '归还数量*' : '退库数量*'}><InputNumber className="w-full" min={1} precision={0} value={form.returnQty} onChange={(v) => set('returnQty', v || 1)} /></EditorField>
            <EditorField label="资产状态*"><Readonly>在库-待处理</Readonly></EditorField>
            <EditorField label={isBorrow ? '归还日期' : '退库日期'}><DatePicker className="w-full" value={dayjs(form.returnDate)} onChange={(d) => set('returnDate', d?.format('YYYY-MM-DD') || '')} /></EditorField>
            <EditorField label="鉴定单号"><Input value={asset.appraisalNo} onChange={(e) => setAsset((current) => ({ ...current, appraisalNo: e.target.value }))} /></EditorField>
            {!isBorrow && <EditorField label="退库原因"><Input value={form.returnReason} onChange={(e) => set('returnReason', e.target.value)} /></EditorField>}
            <EditorField label="鉴定结果"><Select className="w-full" value={asset.appraisalResult} options={['正常', '维修', '报废'].map((v) => ({ label: v, value: v }))} onChange={(v) => setAsset((current) => ({ ...current, appraisalResult: v }))} /></EditorField>
            <EditorField label="鉴定人"><LookupInput value={asset.appraiser} onClick={() => {}} /></EditorField>
            <EditorField label="鉴定日期"><DatePicker className="w-full" value={dayjs(asset.appraisalDate)} onChange={(d) => setAsset((current) => ({ ...current, appraisalDate: d?.format('YYYY-MM-DD') || '' }))} /></EditorField>
            <EditorField label="使用说明" span={3}><Input value={form.usageDesc} onChange={(e) => set('usageDesc', e.target.value)} /></EditorField>
          </DetailGrid>
        </Card>
      </Space>
    </Modal>
  );
}

function PurchasePendingModal({ open, onCancel, onConfirm }) {
  const [draft, setDraft] = useState({ company: '', plate: '', department: '', assetClass: '', supplier: '', poNo: '', receiptNo: '', assetTag: '', scan: '' });
  const [filters, setFilters] = useState(draft);
  const [selected, setSelected] = useState([]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));
  const rows = useMemo(() => PURCHASE_PENDING_ROWS.filter((row) => includesText(row.company, filters.company) && includesText(row.plate, filters.plate) && includesText(row.department, filters.department) && includesText(row.assetClass, filters.assetClass) && includesText(row.supplier, filters.supplier) && includesText(row.poNo, filters.poNo) && includesText(row.receiptNo, filters.receiptNo) && includesText(row.assetTag, filters.assetTag)), [filters]);
  const columns = [
    { title: '行号', dataIndex: 'id', width: 64 },
    { title: '公司', dataIndex: 'company', width: 120 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: 'SN号', dataIndex: 'sn', width: 150 },
    { title: 'PO单号', dataIndex: 'poNo', width: 150 },
    { title: '接收单号', dataIndex: 'receiptNo', width: 190 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
    { title: '资产大类', dataIndex: 'assetClass', width: 120 },
    { title: '资产小类', dataIndex: 'assetSubClass', width: 130 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 180 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '部件数量', dataIndex: 'partQuantity', width: 100 },
    { title: '部件说明', dataIndex: 'partDesc', width: 120 },
    { title: 'PR单/行', dataIndex: 'prLine', width: 150 },
  ];
  const selectedRows = PURCHASE_PENDING_ROWS.filter((row) => selected.includes(row.id));

  return (
    <Modal open={open} title="选择待入库物资" width={1240} okText="确认" cancelText="取消" onCancel={onCancel} onOk={() => onConfirm(selectedRows)}>
      <Space direction="vertical" size={16} className="w-full">
        <QueryBar onQuery={() => setFilters({ ...draft })} onReset={() => { const empty = { company: '', plate: '', department: '', assetClass: '', supplier: '', poNo: '', receiptNo: '', assetTag: '', scan: '' }; setDraft(empty); setFilters(empty); }}>
          <QueryItem label="公司"><Input value={draft.company} onChange={(e) => update('company', e.target.value)} /></QueryItem>
          <QueryItem label="板块"><Input value={draft.plate} onChange={(e) => update('plate', e.target.value)} /></QueryItem>
          <QueryItem label="部门"><Input value={draft.department} onChange={(e) => update('department', e.target.value)} /></QueryItem>
          <QueryItem label="资产类别"><Input value={draft.assetClass} onChange={(e) => update('assetClass', e.target.value)} /></QueryItem>
          <QueryItem label="供应商"><Input value={draft.supplier} onChange={(e) => update('supplier', e.target.value)} /></QueryItem>
          <QueryItem label="PO单号"><Input value={draft.poNo} onChange={(e) => update('poNo', e.target.value)} /></QueryItem>
          <QueryItem label="接收单号"><Input value={draft.receiptNo} onChange={(e) => update('receiptNo', e.target.value)} /></QueryItem>
          <QueryItem label="资产标签号"><Input value={draft.assetTag} onChange={(e) => update('assetTag', e.target.value)} /></QueryItem>
        </QueryBar>
        <Card size="small" title="扫描光标"><Input value={draft.scan} placeholder="扫描资产标签号" onChange={(e) => update('scan', e.target.value)} onPressEnter={() => { const matched = PURCHASE_PENDING_ROWS.find((row) => row.assetTag === draft.scan.trim()); if (matched) setSelected((current) => current.includes(matched.id) ? current : [...current, matched.id]); }} /></Card>
        <Card size="small" title="待入库物资">
          <Table rowKey="id" size="small" bordered columns={columns} dataSource={rows} rowSelection={{ selectedRowKeys: selected, onChange: setSelected, fixed: true }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} />
        </Card>
        <Card size="small" title={`已选择（${selectedRows.length}）`}>
          {selectedRows.length ? <Space wrap>{selectedRows.map((row) => <Typography.Text key={row.id}>{row.assetTag} / {row.materialDesc}</Typography.Text>)}</Space> : <Typography.Text type="secondary">暂未选择</Typography.Text>}
        </Card>
      </Space>
    </Modal>
  );
}

function InboundEditor({ source, onBack, onSave }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [inboundType, setInboundType] = useState(source?.inboundType || '新增入库');
  const [warehouse, setWarehouse] = useState(source?.warehouse || WAREHOUSES[0]);
  const [remark, setRemark] = useState('');
  const [billable, setBillable] = useState('是');
  const [lines, setLines] = useState(source?.lines || []);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [lineModal, setLineModal] = useState('');
  const documentNo = source?.documentNo || '保存后自动生成';
  const creator = source?.creator || '206984-何文';
  const status = source?.status || '草稿';
  const createdDate = source?.createdDate || dayjs().format('YYYY-MM-DD');
  const totalOriginal = lines.reduce((sum, row) => sum + Number(row.originalValue || 0), 0);
  const totalTax = lines.reduce((sum, row) => sum + Number(row.tax || 0), 0);

  const commonColumns = [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 180 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
    { title: '入库数量', dataIndex: 'quantity', width: 100 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160, render: (v) => v || '-' },
    { title: 'SN序列号', dataIndex: 'sn', width: 160, render: (v) => v || '-' },
    { title: '原值', dataIndex: 'originalValue', width: 110, render: money },
    { title: '税金', dataIndex: 'tax', width: 100, render: money },
    { title: '总价', width: 110, render: (_, row) => money(Number(row.originalValue || 0) + Number(row.tax || 0)) },
    { title: 'PO单号', dataIndex: 'poNo', width: 150, render: (v) => v || '-' },
    { title: 'PR单号', dataIndex: 'prNo', width: 150, render: (v) => v || '-' },
  ];

  const columns = inboundType === '借用归还' ? [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 }, { title: '资产标签号', dataIndex: 'assetTag', width: 160 }, { title: 'SN序列号', dataIndex: 'sn', width: 150 }, { title: '物资总类', dataIndex: 'materialGroup', width: 110 }, { title: '物资说明', dataIndex: 'materialDesc', width: 180 }, { title: '数量', dataIndex: 'quantity', width: 80 }, { title: '借用原因', dataIndex: 'borrowReason', width: 180 }, { title: '借用日期', dataIndex: 'borrowDate', width: 120 }, { title: '资产标记', dataIndex: 'assetMark', width: 100 }, { title: '借用人', width: 130, render: () => '206984-何文' }, { title: '资产状态', dataIndex: 'inboundStatus', width: 130 },
  ] : inboundType === '退库入库' ? [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 }, { title: '资产标签号', dataIndex: 'assetTag', width: 160 }, { title: 'SN序列号', dataIndex: 'sn', width: 150 }, { title: '物资总类', dataIndex: 'materialGroup', width: 110 }, { title: '物资说明', dataIndex: 'materialDesc', width: 180 }, { title: '数量', dataIndex: 'quantity', width: 80 }, { title: '退库类型', dataIndex: 'returnType', width: 110 }, { title: '资产标记', dataIndex: 'assetMark', width: 100 }, { title: '退库人', width: 130, render: () => '206984-何文' }, { title: '资产状态', dataIndex: 'inboundStatus', width: 130 },
  ] : inboundType === '采购接收' ? [...commonColumns, { title: '是否计费', dataIndex: 'billable', width: 100 }] : commonColumns;

  const addLine = (row) => {
    const id = Date.now();
    setLines((current) => [...current, { id, materialGroup: row.materialGroup || '1.资产', materialDesc: row.materialDesc, quantity: row.quantity || 1, assetTag: row.assetTag || '', sn: row.sn || '', originalValue: Number(row.originalValue || 0), tax: Number(row.tax || 0), poNo: row.poNo || '', prNo: row.prNo || row.prLine || '', ...row }]);
    setLineModal('');
  };

  const addPurchaseRows = (rows) => {
    if (!rows.length) {
      messageApi.warning('请先选择待入库物资');
      return;
    }
    setLines((current) => [...current, ...rows.map((row) => ({ ...row, id: `${Date.now()}-${row.id}`, prNo: row.prLine }))]);
    setLineModal('');
  };

  const deleteLines = () => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要删除的物资');
    const selected = new Set(selectedKeys);
    setLines((current) => current.filter((row) => !selected.has(row.id)));
    setSelectedKeys([]);
  };

  const changeType = (value) => {
    if (lines.length) {
      Modal.confirm({ title: '切换入库类型？', content: '不同入库类型的字段不同，切换后当前物资行会清空。', okText: '切换', cancelText: '取消', onOk: () => { setInboundType(value); setLines([]); setSelectedKeys([]); } });
      return;
    }
    setInboundType(value);
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>入库单</PageTitle>
      <Card size="small" title="入库单信息">
        <DetailGrid columns={3} labelWidth={96}>
          <EditorField label="入库单号"><Readonly>{documentNo}</Readonly></EditorField>
          <EditorField label="单据类型"><Readonly>入库单</Readonly></EditorField>
          <EditorField label="单据状态"><StatusTag value={status} /></EditorField>
          <EditorField label="入库类型"><Select className="w-full" value={inboundType} options={INBOUND_TYPES.map((v) => ({ label: v, value: v }))} onChange={changeType} /></EditorField>
          <EditorField label="制单人"><Readonly>{creator}</Readonly></EditorField>
          <EditorField label="制单时间"><Readonly>{createdDate}</Readonly></EditorField>
          {(inboundType === '新增入库' || inboundType === '采购接收') && <EditorField label="合计原值"><Readonly>{money(totalOriginal)}</Readonly></EditorField>}
          {(inboundType === '新增入库' || inboundType === '采购接收') && <EditorField label="合计税金"><Readonly>{money(totalTax)}</Readonly></EditorField>}
          {(inboundType === '新增入库' || inboundType === '采购接收') && <EditorField label="合计金额"><Readonly>{money(totalOriginal + totalTax)}</Readonly></EditorField>}
          <EditorField label="是否刷卡领用"><Readonly>否</Readonly></EditorField>
          {inboundType === '采购接收' && <EditorField label="是否计费"><Select className="w-full" value={billable} options={['是', '否'].map((v) => ({ label: v, value: v }))} onChange={setBillable} /></EditorField>}
          <EditorField label="当前仓库"><Select className="w-full" value={warehouse} options={WAREHOUSES.map((v) => ({ label: v, value: v }))} onChange={setWarehouse} /></EditorField>
          <EditorField label="备注" span={3}><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={remark} onChange={(e) => setRemark(e.target.value)} /></EditorField>
        </DetailGrid>
      </Card>

      <Card
        size="small"
        title="入库物资"
        extra={<Space>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setLineModal(inboundType === '采购接收' ? 'purchase' : 'asset')}>{inboundType === '采购接收' ? '待入库物资' : '添加物资'}</Button>
          <Button danger icon={<Trash2 size={14} />} onClick={deleteLines}>删除物资</Button>
          <Button icon={<Upload size={14} />} onClick={() => messageApi.info('Excel导入沿用现有入库模板，本轮先按截图字段展示')}>Excel导入</Button>
        </Space>}
      >
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={lines} rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }} scroll={{ x: 'max-content' }} pagination={false} />
      </Card>

      <div className="flex justify-center gap-3">
        <Button type="primary" onClick={() => onSave({ inboundType, warehouse, quantity: lines.reduce((sum, row) => sum + Number(row.quantity || 0), 0), lines })}>保存草稿</Button>
        <Button onClick={onBack}>返回</Button>
      </div>

      <NewInboundItemModal open={lineModal === 'asset' && inboundType === '新增入库'} warehouse={warehouse} onCancel={() => setLineModal('')} onConfirm={addLine} />
      <AssetInboundItemModal open={lineModal === 'asset' && (inboundType === '退库入库' || inboundType === '借用归还')} mode={inboundType} warehouse={warehouse} onCancel={() => setLineModal('')} onConfirm={addLine} />
      <PurchasePendingModal open={lineModal === 'purchase'} onCancel={() => setLineModal('')} onConfirm={addPurchaseRows} />
    </Space>
  );
}

export default function InboundPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [view, setView] = useState('list');
  const [activeRow, setActiveRow] = useState(null);
  const [draft, setDraft] = useState({ documentNo: '', inboundType: '', status: '', poNo: '', prNo: '', assetTag: '', creator: '', createdFrom: '', createdTo: '' });
  const [filters, setFilters] = useState(draft);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));

  const filteredRows = useMemo(() => rows.filter((row) => includesText(row.documentNo, filters.documentNo) && (!filters.inboundType || row.inboundType === filters.inboundType) && (!filters.status || row.status === filters.status) && includesText(row.poNo, filters.poNo) && includesText(row.prNo, filters.prNo) && includesText(row.assetTag, filters.assetTag) && includesText(row.creator, filters.creator) && (!filters.createdFrom || row.createdDate >= filters.createdFrom) && (!filters.createdTo || row.createdDate <= filters.createdTo)), [rows, filters]);

  const openEditor = (row = null) => {
    setActiveRow(row);
    setView('editor');
  };

  const saveDraft = (payload) => {
    if (activeRow) {
      setRows((current) => current.map((row) => row.id === activeRow.id ? { ...row, ...payload, status: '草稿' } : row));
      messageApi.success('入库单草稿已保存');
      return;
    }
    const id = Math.max(0, ...rows.map((row) => row.id)) + 1;
    const created = { id, documentNo: `PI-${dayjs().format('YYYYMMDD')}${String(id).padStart(4, '0')}`, applicationNo: '', status: '草稿', inboundType: payload.inboundType, warehouse: payload.warehouse, createdDate: dayjs().format('YYYY-MM-DD'), creator: '206984-何文', quantity: payload.quantity, cardClaim: '否', poNo: '', prNo: '', assetTag: '', lines: payload.lines };
    setRows((current) => [created, ...current]);
    setActiveRow(created);
    messageApi.success(`已生成入库单 ${created.documentNo}`);
  };

  if (view === 'editor') {
    return <InboundEditor source={activeRow} onBack={() => { setView('list'); setActiveRow(null); }} onSave={saveDraft} />;
  }

  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '入库单号', dataIndex: 'documentNo', width: 190, render: (value, row) => <Button type="link" className="px-0" onClick={() => openEditor(row)}>{value}</Button> },
    { title: '申请单号', dataIndex: 'applicationNo', width: 200, render: (value) => value || '-' },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '入库类型', dataIndex: 'inboundType', width: 130 },
    { title: '入库仓库', dataIndex: 'warehouse', width: 280 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
    { title: '是否刷卡领用', dataIndex: 'cardClaim', width: 130, render: (value) => <StatusTag value={value} /> },
    { title: '操作', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => openEditor(row)}>编辑</Button> },
  ];

  const deleteRows = () => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要删除的入库单');
    const selected = new Set(selectedKeys);
    setRows((current) => current.filter((row) => !selected.has(row.id)));
    setSelectedKeys([]);
    messageApi.success('已删除所选入库单');
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>入库</PageTitle>
      <QueryBar onQuery={() => { setFilters({ ...draft }); setSelectedKeys([]); }} onReset={() => { const empty = { documentNo: '', inboundType: '', status: '', poNo: '', prNo: '', assetTag: '', creator: '', createdFrom: '', createdTo: '' }; setDraft(empty); setFilters(empty); setSelectedKeys([]); }}>
        <QueryItem label="入库单号"><Input value={draft.documentNo} allowClear placeholder="请输入入库单号" onChange={(e) => update('documentNo', e.target.value)} /></QueryItem>
        <QueryItem label="入库类型"><Select className="w-full" value={draft.inboundType || undefined} allowClear placeholder="全部" options={INBOUND_TYPES.map((v) => ({ label: v, value: v }))} onChange={(v) => update('inboundType', v)} /></QueryItem>
        <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={['草稿', '已完成'].map((v) => ({ label: v, value: v }))} onChange={(v) => update('status', v)} /></QueryItem>
        <QueryItem label="PO单号"><Input value={draft.poNo} allowClear placeholder="请输入PO单号" onChange={(e) => update('poNo', e.target.value)} /></QueryItem>
        <QueryItem label="PR单号"><Input value={draft.prNo} allowClear placeholder="请输入PR单号" onChange={(e) => update('prNo', e.target.value)} /></QueryItem>
        <QueryItem label="资产标签号"><Input value={draft.assetTag} allowClear placeholder="请输入资产标签号" onChange={(e) => update('assetTag', e.target.value)} /></QueryItem>
        <QueryItem label="制单人"><Input value={draft.creator} allowClear placeholder="请输入制单人" onChange={(e) => update('creator', e.target.value)} /></QueryItem>
        <QueryItem label="制单日期从"><DatePicker className="w-full" value={draft.createdFrom ? dayjs(draft.createdFrom) : null} onChange={(d) => update('createdFrom', d?.format('YYYY-MM-DD') || '')} /></QueryItem>
        <QueryItem label="制单日期至"><DatePicker className="w-full" value={draft.createdTo ? dayjs(draft.createdTo) : null} onChange={(d) => update('createdTo', d?.format('YYYY-MM-DD') || '')} /></QueryItem>
      </QueryBar>
      <Card size="small" title="入库单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => openEditor()}>创建</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={deleteRows}>删除</Button>
            <Button icon={<Printer size={14} />} onClick={() => messageApi.success('批量打印操作已记录（原型）')}>批量打印</Button>
          </Space>
        </div>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
    </Space>
  );
}
