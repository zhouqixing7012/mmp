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
import { Plus, Search, Trash2, Upload } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;

const EMPTY_FILTERS = {
  documentNo: '',
  reason: '',
  status: '',
  company: '',
  outDept: '',
  outLocation: '',
  plate: '',
  inDept: '',
  inLocation: '',
  creator: '',
  createdFrom: '',
  createdTo: '',
};

const INITIAL_ROWS = [
  { id: 1, documentNo: 'AT-202608070001', applicationNo: 'ETA-202608070001', status: '已完成', company: '201.焦点互动', createdDate: '2026-08-07', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 2, documentNo: 'AT-202608060002', applicationNo: 'ETA-202608060022', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-06', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 3, documentNo: 'AT-202608060001', applicationNo: 'ETA-202608060021', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-06', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 4, documentNo: 'AT-202608040001', applicationNo: 'ETA-202608030001', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-04', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 5, documentNo: 'AT-202607300021', applicationNo: 'ETA-202607290001', status: '已完成', company: '114.新媒体', createdDate: '2026-07-30', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 6, documentNo: 'AT-202607300001', applicationNo: 'ETA-202607280003', status: '已完成', company: '114.新媒体', createdDate: '2026-07-30', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 7, documentNo: 'AT-202607290001', applicationNo: 'ETA-202607280002', status: '已完成', company: '114.新媒体', createdDate: '2026-07-29', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 8, documentNo: 'AT-202607280001', applicationNo: 'ETA-202607280001', status: '已完成', company: '132.千钧', createdDate: '2026-07-28', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 9, documentNo: 'AT-202607240002', applicationNo: 'ETA-202607240021', status: '已完成', company: '112.北京新动力', createdDate: '2026-07-24', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 10, documentNo: 'AT-202607240001', applicationNo: 'ETA-202607230002', status: '已完成', company: '114.新媒体', createdDate: '2026-07-24', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
];

// 复用项目现有资产转移演示数据；截图没有提供的资产属性保持为空。
const SOURCE_ASSETS = [
  {
    id: '1',
    assetTag: '1141200545',
    sn: '',
    materialDesc: '笔记本.技术笔记本.惠普.820 G1技术型.i5-4200U/4G/500G/12.5"/3芯电池/包/鼠标',
    availableQty: 1,
    materialGroup: '',
    assetClass: '',
    assetSubClass: '',
    assetQty: 1,
    brand: '',
    model: '',
    config: '',
    unit: '',
    assetMark: '',
    originalValue: '',
    netValue: '',
    assetStatus: '在用-使用中',
    company: '',
    plate: '',
    department: '',
    costCenter: '',
    businessLine: '',
    project: '',
    expenseAccount: '',
    responsiblePerson: '110933-史小曼',
    city: '北京市',
    building: '搜狐媒体大厦',
    floor: '17层',
    room: '',
    enabledDate: '',
    printNo: '',
    usage: '',
    remark: '',
  },
];

const COMPANY_OPTIONS = ['101.新时代', '201.焦点互动', '112.北京新动力', '114.新媒体', '132.千钧'];
const PURPOSE_OPTIONS = ['员工用机', '部门公用', '其他用途', '专业用途'];
const ASSET_STATUS_OPTIONS = ['在用-使用中', '在库-待处理'];
const RECEIVER_OPTIONS = [
  { id: 1, name: '114111-杨羊', department: '集团总部.员工服务中心.资产部' },
];
const SIMPLE_ZERO_OPTION = [{ id: 1, name: '0.*' }];

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function inDateRange(value, from, to) {
  if (!value) return !from && !to;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function toSelectData(values) {
  return [...new Set(values.filter(Boolean))].map((name, index) => ({ id: index + 1, name }));
}

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function RequiredLabel({ children }) {
  return <><span className="text-[#ff4d4f] mr-1">*</span>{children}</>;
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} />} />
    </div>
  );
}

function DateFilter({ value, onChange, placeholder }) {
  return <DatePicker className="w-full" value={value ? dayjs(value) : null} format="YYYY-MM-DD" placeholder={placeholder} onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')} />;
}

function SelectorModal({ config, onClose }) {
  if (!config) return null;
  return <SelectModal open title={config.title} dataSource={config.dataSource || []} columns={config.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={config.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={onClose} onConfirm={(record) => { config.onConfirm(record); onClose(); }} />;
}

function TransferItemModal({ open, currentCompany, initialLine, onCancel, onConfirm }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [asset, setAsset] = useState(initialLine ? { ...initialLine } : null);
  const [selectorType, setSelectorType] = useState('');
  const [form, setForm] = useState(() => ({
    inPerson: initialLine?.inPerson || '',
    inPlate: initialLine?.inPlate || '0.*',
    inDept: initialLine?.inDept || '0.*',
    inCostCenter: initialLine?.inCostCenter || '0.*',
    city: initialLine?.city || '',
    building: initialLine?.building || '',
    floor: initialLine?.floor || '',
    room: initialLine?.room || '',
    purpose: initialLine?.purpose || '',
    assetStatus: initialLine?.targetAssetStatus || '在用-使用中',
    businessLine: initialLine?.targetBusinessLine || '0.*',
    project: initialLine?.targetProject || '0.*',
    transferReason: initialLine?.transferReason || '',
    transferDate: initialLine?.transferDate || dayjs().format('YYYY-MM-DD'),
    usageDescription: initialLine?.usageDescription || '',
  }));
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value || '' }));
  const chooseAsset = (record) => setAsset({ ...record });
  const selectorConfig = {
    asset: {
      title: '选择资产', dataSource: SOURCE_ASSETS,
      columns: [{ title: '资产标签号', dataIndex: 'assetTag' }, { title: '物资说明', dataIndex: 'materialDesc' }, { title: '资产状态', dataIndex: 'assetStatus' }],
      searchFields: [{ label: '资产标签号', name: 'assetTag', dataIndex: 'assetTag' }, { label: '物资说明', name: 'materialDesc', dataIndex: 'materialDesc' }],
      onConfirm: chooseAsset,
    },
    receiver: { title: '选择转入人', dataSource: RECEIVER_OPTIONS, onConfirm: (record) => setForm((current) => ({ ...current, inPerson: record.name, inDept: record.department || current.inDept })) },
    city: { title: '选择 City', dataSource: [{ id: 1, name: '北京市' }], onConfirm: (record) => update('city', record.name) },
    building: { title: '选择 Building', dataSource: [{ id: 1, name: '搜狐媒体大厦' }], onConfirm: (record) => update('building', record.name) },
    businessLine: { title: '选择业务线', dataSource: SIMPLE_ZERO_OPTION, onConfirm: (record) => update('businessLine', record.name) },
    project: { title: '选择项目', dataSource: SIMPLE_ZERO_OPTION, onConfirm: (record) => update('project', record.name) },
  }[selectorType];

  const submit = (keepOpen) => {
    if (!asset) return messageApi.warning('请先选择资产');
    const required = [['转入人', form.inPerson], ['转入成本中心', form.inCostCenter], ['City', form.city], ['Building', form.building], ['Floor', form.floor], ['用途', form.purpose], ['资产状态', form.assetStatus]];
    const missing = required.find(([, value]) => !value);
    if (missing) return messageApi.warning(`请填写${missing[0]}`);
    onConfirm({ ...asset, ...form, transferQty: Number(asset.assetQty || asset.availableQty || 1), outPerson: asset.responsiblePerson || '', outCostCenter: asset.costCenter || '', targetAssetStatus: form.assetStatus, targetBusinessLine: form.businessLine, targetProject: form.project }, keepOpen);
    if (keepOpen) {
      setAsset(null);
      setForm((current) => ({ ...current, transferReason: '', usageDescription: '' }));
    }
    return undefined;
  };

  return (
    <Modal open={open} title="添加转移物资" width={1180} onCancel={onCancel} destroyOnHidden footer={[
      <Button key="continue" type="primary" onClick={() => submit(true)}>添加并继续</Button>,
      <Button key="close" type="primary" onClick={() => submit(false)}>添加并关闭</Button>,
      <Button key="cancel" onClick={onCancel}>取消</Button>,
    ]}>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Text>当前公司：{currentCompany || '-'}</Typography.Text>
        <Card size="small" title="选择物资">
          <DetailGrid columns={2} labelWidth={96}>
            <DetailItem label="资产标签号"><LookupInput value={asset?.assetTag || ''} placeholder="请选择资产标签号" onOpen={() => setSelectorType('asset')} /></DetailItem>
            <DetailItem label="SN号"><LookupInput value={asset?.sn || ''} placeholder="请选择SN号" onOpen={() => setSelectorType('asset')} /></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="物资信息">
          <DetailGrid columns={4} labelWidth={96} minWidth={1040}>
            <DetailItem label="资产标签号"><Readonly>{asset?.assetTag}</Readonly></DetailItem>
            <DetailItem label="SN号"><Readonly>{asset?.sn}</Readonly></DetailItem>
            <DetailItem label="物资说明"><Readonly>{asset?.materialDesc}</Readonly></DetailItem>
            <DetailItem label="可用数量"><Readonly>{asset?.availableQty}</Readonly></DetailItem>
            <DetailItem label="物资总类"><Readonly>{asset?.materialGroup}</Readonly></DetailItem>
            <DetailItem label="物资大类"><Readonly>{asset?.assetClass}</Readonly></DetailItem>
            <DetailItem label="物资小类"><Readonly>{asset?.assetSubClass}</Readonly></DetailItem>
            <DetailItem label="资产数量"><Readonly>{asset?.assetQty}</Readonly></DetailItem>
            <DetailItem label="品牌"><Readonly>{asset?.brand}</Readonly></DetailItem>
            <DetailItem label="规格/型号"><Readonly>{asset?.model}</Readonly></DetailItem>
            <DetailItem label="配置"><Readonly>{asset?.config}</Readonly></DetailItem>
            <DetailItem label="计量单位"><Readonly>{asset?.unit}</Readonly></DetailItem>
            <DetailItem label="资产标记"><Readonly>{asset?.assetMark}</Readonly></DetailItem>
            <DetailItem label="原值"><Readonly>{asset?.originalValue}</Readonly></DetailItem>
            <DetailItem label="净值"><Readonly>{asset?.netValue}</Readonly></DetailItem>
            <DetailItem label="资产状态"><Readonly>{asset?.assetStatus}</Readonly></DetailItem>
            <DetailItem label="公司"><Readonly>{asset?.company}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{asset?.plate}</Readonly></DetailItem>
            <DetailItem label="部门"><Readonly>{asset?.department}</Readonly></DetailItem>
            <DetailItem label="成本中心"><Readonly>{asset?.costCenter}</Readonly></DetailItem>
            <DetailItem label="业务线"><Readonly>{asset?.businessLine}</Readonly></DetailItem>
            <DetailItem label="项目"><Readonly>{asset?.project}</Readonly></DetailItem>
            <DetailItem label="费用账户"><Readonly>{asset?.expenseAccount}</Readonly></DetailItem>
            <DetailItem label="责任人"><Readonly>{asset?.responsiblePerson}</Readonly></DetailItem>
            <DetailItem label="City"><Readonly>{asset?.city}</Readonly></DetailItem>
            <DetailItem label="Building"><Readonly>{asset?.building}</Readonly></DetailItem>
            <DetailItem label="Floor"><Readonly>{asset?.floor}</Readonly></DetailItem>
            <DetailItem label="Room"><Readonly>{asset?.room}</Readonly></DetailItem>
            <DetailItem label="启用日期"><Readonly>{asset?.enabledDate}</Readonly></DetailItem>
            <DetailItem label="印刷号"><Readonly>{asset?.printNo}</Readonly></DetailItem>
            <DetailItem label="用途"><Readonly>{asset?.usage}</Readonly></DetailItem>
            <DetailItem label="备注"><Readonly>{asset?.remark}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="转移单信息">
          <DetailGrid columns={4} labelWidth={108} minWidth={1040}>
            <DetailItem label={<RequiredLabel>转入人</RequiredLabel>}><LookupInput value={form.inPerson} placeholder="请选择转入人" onOpen={() => setSelectorType('receiver')} /></DetailItem>
            <DetailItem label="转入板块"><Readonly>{form.inPlate}</Readonly></DetailItem>
            <DetailItem label="转入部门"><Readonly>{form.inDept}</Readonly></DetailItem>
            <DetailItem label={<RequiredLabel>转入成本中心</RequiredLabel>}><Input value={form.inCostCenter} onChange={(event) => update('inCostCenter', event.target.value)} /></DetailItem>
            <DetailItem label={<RequiredLabel>City</RequiredLabel>}><LookupInput value={form.city} placeholder="请选择 City" onOpen={() => setSelectorType('city')} /></DetailItem>
            <DetailItem label={<RequiredLabel>Building</RequiredLabel>}><LookupInput value={form.building} placeholder="请选择 Building" onOpen={() => setSelectorType('building')} /></DetailItem>
            <DetailItem label={<RequiredLabel>Floor</RequiredLabel>}><Select className="w-full" value={form.floor || undefined} placeholder="请选择" options={['17层'].map((value) => ({ label: value, value }))} onChange={(value) => update('floor', value)} /></DetailItem>
            <DetailItem label="Room"><Input value={form.room} onChange={(event) => update('room', event.target.value)} /></DetailItem>
            <DetailItem label={<RequiredLabel>用途</RequiredLabel>}><Select className="w-full" value={form.purpose || undefined} placeholder="请选择" options={PURPOSE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => update('purpose', value)} /></DetailItem>
            <DetailItem label={<RequiredLabel>资产状态</RequiredLabel>}><Select className="w-full" value={form.assetStatus || undefined} placeholder="请选择" options={ASSET_STATUS_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => update('assetStatus', value)} /></DetailItem>
            <DetailItem label="业务线"><LookupInput value={form.businessLine} placeholder="请选择业务线" onOpen={() => setSelectorType('businessLine')} /></DetailItem>
            <DetailItem label="项目"><LookupInput value={form.project} placeholder="请选择项目" onOpen={() => setSelectorType('project')} /></DetailItem>
            <DetailItem label="转移原因" span={3}><Input value={form.transferReason} onChange={(event) => update('transferReason', event.target.value)} /></DetailItem>
            <DetailItem label="转移日期"><DatePicker className="w-full" value={form.transferDate ? dayjs(form.transferDate) : null} format="YYYY-MM-DD" onChange={(date) => update('transferDate', date ? date.format('YYYY-MM-DD') : '')} /></DetailItem>
            <DetailItem label="使用说明" span={4}><TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={form.usageDescription} onChange={(event) => update('usageDescription', event.target.value)} /></DetailItem>
          </DetailGrid>
        </Card>
      </Space>
      <SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />
    </Modal>
  );
}

function TransferEditor({ onBack, onSave }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [company, setCompany] = useState('101.新时代');
  const [remark, setRemark] = useState('');
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [lines, setLines] = useState([]);
  const createdDate = dayjs().format('YYYY-MM-DD');
  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 300 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 120, render: (value) => value || '-' },
    { title: '物资大类.小类', key: 'assetClass', width: 180, render: (_, row) => [row.assetClass, row.assetSubClass].filter(Boolean).join(' / ') || '-' },
    { title: '转移数量', dataIndex: 'transferQty', width: 100, align: 'right' },
    { title: '转出人', dataIndex: 'outPerson', width: 150, render: (value) => value || '-' },
    { title: '转出成本中心', dataIndex: 'outCostCenter', width: 180, render: (value) => value || '-' },
    { title: '转入人', dataIndex: 'inPerson', width: 150 },
    { title: '转入成本中心', dataIndex: 'inCostCenter', width: 180 },
    { title: '转入城市', dataIndex: 'city', width: 130 },
    { title: '转入建筑物', dataIndex: 'building', width: 180 },
    { title: '操作', key: 'operation', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => { setEditingLine(row); setLineModalOpen(true); }}>编辑</Button> },
  ];
  const saveLine = (line, keepOpen) => {
    if (editingLine) {
      setLines((current) => current.map((item) => item.id === editingLine.id ? { ...line, id: editingLine.id } : item));
      setEditingLine(null);
      setLineModalOpen(false);
      return;
    }
    setLines((current) => [...current, { ...line, id: `${Date.now()}-${current.length + 1}` }]);
    if (!keepOpen) setLineModalOpen(false);
  };
  const saveDraft = () => {
    if (!company) return messageApi.warning('请选择公司');
    onSave({ company, remark, lines });
    return undefined;
  };
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>转移单</PageTitle>
      <Card size="small" title="转移单信息">
        <DetailGrid columns={3} labelWidth={96}>
          <DetailItem label="转移单号"><Readonly>自动生成</Readonly></DetailItem>
          <DetailItem label="单据类型"><Readonly>转移单</Readonly></DetailItem>
          <DetailItem label="单据状态"><StatusTag value="草稿" /></DetailItem>
          <DetailItem label="公司"><LookupInput value={company} placeholder="请选择公司" onOpen={() => setCompanyModalOpen(true)} /></DetailItem>
          <DetailItem label="制单人"><Readonly>admin-系统管理员</Readonly></DetailItem>
          <DetailItem label="制单时间"><Readonly>{createdDate}</Readonly></DetailItem>
          <DetailItem label="备注" span={3}><TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={remark} onChange={(event) => setRemark(event.target.value)} /></DetailItem>
        </DetailGrid>
      </Card>
      <Card size="small" title="转移物资" extra={<Space>
        <Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditingLine(null); setLineModalOpen(true); }}>添加物资</Button>
        <Button icon={<Upload size={14} />} onClick={() => messageApi.info('Excel 导入沿用转移模板，本轮仅按截图补齐页面字段')}>Excel导入</Button>
      </Space>}>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={lines} scroll={{ x: 'max-content' }} pagination={false} />
      </Card>
      <div className="flex justify-center gap-3">
        <Button type="primary" onClick={saveDraft}>保存草稿</Button>
        <Button onClick={onBack}>返回</Button>
      </div>
      <SelectModal open={companyModalOpen} title="选择公司" dataSource={COMPANY_OPTIONS.map((name, index) => ({ id: index + 1, name }))} columns={[{ title: '公司', dataIndex: 'name' }]} searchFields={[{ label: '公司', name: 'name', dataIndex: 'name' }]} onCancel={() => setCompanyModalOpen(false)} onConfirm={(record) => { setCompany(record.name); setCompanyModalOpen(false); }} />
      <TransferItemModal key={`${lineModalOpen}-${editingLine?.id || 'new'}-${company}`} open={lineModalOpen} currentCompany={company} initialLine={editingLine} onCancel={() => { setLineModalOpen(false); setEditingLine(null); }} onConfirm={saveLine} />
    </Space>
  );
}

export default function TransferPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectorType, setSelectorType] = useState('');
  const [view, setView] = useState('list');
  const creatorData = useMemo(() => toSelectData(rows.map((row) => row.creator)), [rows]);
  const companyData = useMemo(() => toSelectData([...COMPANY_OPTIONS, ...rows.map((row) => row.company)]), [rows]);
  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, filters.documentNo)
    && includesText(row.reason, filters.reason)
    && (!filters.status || row.status === filters.status)
    && includesText(row.company, filters.company)
    && includesText(row.outDept, filters.outDept)
    && includesText(row.outLocation, filters.outLocation)
    && includesText(row.plate, filters.plate)
    && includesText(row.inDept, filters.inDept)
    && includesText(row.inLocation, filters.inLocation)
    && includesText(row.creator, filters.creator)
    && inDateRange(row.createdDate, filters.createdFrom, filters.createdTo)
  )), [rows, filters]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));
  const emptyLookup = (title, field) => ({ title, dataSource: [], onConfirm: (record) => update(field, record.name) });
  const selectorConfig = {
    company: { title: '选择公司', dataSource: companyData, onConfirm: (record) => update('company', record.name) },
    creator: { title: '选择制单人', dataSource: creatorData, onConfirm: (record) => update('creator', record.name) },
    outDept: emptyLookup('选择转出部门', 'outDept'),
    outLocation: emptyLookup('选择转出地点', 'outLocation'),
    plate: emptyLookup('选择板块', 'plate'),
    inDept: emptyLookup('选择转入部门', 'inDept'),
    inLocation: emptyLookup('选择转入地点', 'inLocation'),
  }[selectorType];
  const deleteRows = () => {
    if (!selectedRowKeys.length) return messageApi.warning('请先选择需要删除的转移单');
    Modal.confirm({
      title: '确认删除所选转移单？', content: `共选择 ${selectedRowKeys.length} 条。`, okText: '删除', cancelText: '取消', okButtonProps: { danger: true },
      onOk: () => {
        const selected = new Set(selectedRowKeys);
        setRows((current) => current.filter((row) => !selected.has(row.id)));
        setSelectedRowKeys([]);
        messageApi.success('已删除所选转移单');
      },
    });
    return undefined;
  };
  const saveDraft = ({ company, remark, lines }) => {
    const id = Math.max(0, ...rows.map((row) => row.id)) + 1;
    const firstLine = lines[0] || {};
    const created = {
      id,
      documentNo: `AT-${dayjs().format('YYYYMMDD')}${String(id).padStart(4, '0')}`,
      applicationNo: '', status: '草稿', company, createdDate: dayjs().format('YYYY-MM-DD'), creator: 'admin-系统管理员',
      quantity: lines.reduce((sum, line) => sum + Number(line.transferQty || 0), 0), reason: firstLine.transferReason || '', outDept: firstLine.department || '',
      outLocation: [firstLine.city, firstLine.building].filter(Boolean).join(' / '), plate: firstLine.inPlate || '', inDept: firstLine.inDept || '', inLocation: [firstLine.city, firstLine.building].filter(Boolean).join(' / '), remark, lines,
    };
    setRows((current) => [created, ...current]);
    setView('list');
    messageApi.success(`已生成转移单 ${created.documentNo}`);
  };
  if (view === 'create') {
    return <>{contextHolder}<TransferEditor onBack={() => setView('list')} onSave={saveDraft} /></>;
  }
  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '转移单号', dataIndex: 'documentNo', width: 190 },
    { title: '申请单号', dataIndex: 'applicationNo', width: 220, render: (value) => value || '-' },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '公司', dataIndex: 'company', width: 180 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 180 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
    { title: '操作', key: 'operation', width: 90, fixed: 'right', render: () => <Button type="link" className="px-0" onClick={() => messageApi.info('转移单详情字段待确认')}>操作</Button> },
  ];
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>转移</PageTitle>
      <QueryBar onQuery={() => { setFilters({ ...draft }); setSelectedRowKeys([]); }} onReset={() => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setSelectedRowKeys([]); }}>
        <QueryItem label="转移单号"><Input value={draft.documentNo} allowClear placeholder="请输入转移单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
        <QueryItem label="转移原因"><Input value={draft.reason} allowClear placeholder="请输入转移原因" onChange={(event) => update('reason', event.target.value)} /></QueryItem>
        <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={['草稿', '已完成'].map((value) => ({ label: value, value }))} onChange={(value) => update('status', value)} /></QueryItem>
        <QueryItem label="公司"><LookupInput value={draft.company} placeholder="请选择公司" onOpen={() => setSelectorType('company')} /></QueryItem>
        <QueryItem label="转出部门"><LookupInput value={draft.outDept} placeholder="请选择转出部门" onOpen={() => setSelectorType('outDept')} /></QueryItem>
        <QueryItem label="转出地点"><LookupInput value={draft.outLocation} placeholder="请选择转出地点" onOpen={() => setSelectorType('outLocation')} /></QueryItem>
        <QueryItem label="板块"><LookupInput value={draft.plate} placeholder="请选择板块" onOpen={() => setSelectorType('plate')} /></QueryItem>
        <QueryItem label="转入部门"><LookupInput value={draft.inDept} placeholder="请选择转入部门" onOpen={() => setSelectorType('inDept')} /></QueryItem>
        <QueryItem label="转入地点"><LookupInput value={draft.inLocation} placeholder="请选择转入地点" onOpen={() => setSelectorType('inLocation')} /></QueryItem>
        <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setSelectorType('creator')} /></QueryItem>
        <QueryItem label="制单日期从"><DateFilter value={draft.createdFrom} placeholder="开始日期" onChange={(value) => update('createdFrom', value)} /></QueryItem>
        <QueryItem label="制单日期至"><DateFilter value={draft.createdTo} placeholder="结束日期" onChange={(value) => update('createdTo', value)} /></QueryItem>
      </QueryBar>
      <Card size="small" title="转移单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setView('create')}>创建</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={deleteRows}>删除</Button>
          </Space>
        </div>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, fixed: true, columnTitle: '选择', columnWidth: 64 }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
      <SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />
    </Space>
  );
}
