import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
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
import { Plus, Printer, Search, Trash2, Upload } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const OUTBOUND_TYPES = ['领用出库', '借用出库'];
const WAREHOUSES = [
  'I0001-资产集团总库（新媒体）',
  'I0013-资产集团前台库（新媒体）',
  'I0022-资产集团前台库（焦点互动）',
];

const INITIAL_ROWS = [
  { id: 1, documentNo: 'OS-202608070025', applicationNo: 'EUA-202607280002', status: '已完成', outboundType: '领用出库', warehouse: 'I1001-耗材库', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 80, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 2, documentNo: 'OS-202608070024', applicationNo: 'EUA-202607280001', status: '已完成', outboundType: '领用出库', warehouse: 'I0001-资产集团总库（新媒体）', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 3, documentNo: 'OS-202608070023', applicationNo: '', status: '已完成', outboundType: '领用出库', warehouse: 'I0006-资产集团总库', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '否', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 4, documentNo: 'OS-202608070022', applicationNo: 'CHA-2026080700001', status: '已完成', outboundType: '领用出库', warehouse: 'I0018-资产集团前台库', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 5, documentNo: 'OS-202608070004', applicationNo: 'EBA-202608050001', status: '已完成', outboundType: '借用出库', warehouse: 'I0018-资产集团前台库', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', assetTag: 'AST-2409010068', responsiblePerson: '114111-杨芊' },
];

const SOURCE_ASSET = {
  assetTag: 'AST-2409010068',
  sn: 'SN-T14-0068',
  materialDesc: '联想.ThinkPad T14',
  materialGroup: '1.资产',
  assetClass: '10.电脑',
  assetSubClass: '笔记本电脑',
  brand: '联想',
  model: 'ThinkPad T14',
  config: 'i7 / 32G / 1T SSD',
  unit: '台',
  applicationBatch: '2026Q3',
  responsiblePerson: '114111-杨芊',
  quantity: 1,
  assetStatus: '在库-新增',
  company: '114.新媒体',
  plate: '集团',
  costCenter: 'ERP部',
  expenseAccount: '固定资产',
  mainAssetTag: '-',
  originalValue: 8200,
  tax: 1066,
  partQuantity: 0,
  partDesc: '-',
  assetMark: '主资产',
  remark: '-',
};

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

function OutboundItemModal({ open, mode, warehouse, initialLine, onCancel, onConfirm }) {
  const isBorrow = mode === '借用出库';
  const initialAsset = initialLine ? { ...SOURCE_ASSET, ...initialLine } : { ...SOURCE_ASSET };
  const [asset, setAsset] = useState(initialAsset);
  const [continuousAdd, setContinuousAdd] = useState(false);
  const [form, setForm] = useState({
    person: initialLine?.person || '206984-何文',
    department: initialLine?.department || '0.*',
    company: initialLine?.company || '114.新媒体',
    city: initialLine?.city || '010.北京市',
    building: initialLine?.building || '129753.搜狐媒体大厦',
    floor: initialLine?.floor || '15F',
    room: initialLine?.room || '1508',
    outboundQty: initialLine?.quantity || initialAsset.quantity || 1,
    outboundStatus: initialLine?.outboundStatus || (isBorrow ? '在用-借用中' : '在用-使用中'),
    costCenter: initialLine?.costCenter || '0.*',
    businessLine: initialLine?.businessLine || '0.*',
    outboundDate: initialLine?.outboundDate || '2026-09-10',
    usage: initialLine?.usage || '办公',
    reason: initialLine?.reason || '',
    expectedReturnDate: initialLine?.expectedReturnDate || '2026-09-30',
    usageDesc: initialLine?.usageDesc || '',
  });
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const total = Number(asset.originalValue || 0) + Number(asset.tax || 0);

  const submit = () => {
    const payload = {
      ...asset,
      ...form,
      quantity: form.outboundQty || 1,
      person: form.person,
      issuePerson: isBorrow ? '' : form.person,
      borrowPerson: isBorrow ? form.person : '',
      issueDate: isBorrow ? '' : form.outboundDate,
      borrowDate: isBorrow ? form.outboundDate : '',
      borrowReason: isBorrow ? form.reason : '',
      outboundStatus: form.outboundStatus,
      total,
    };
    onConfirm(payload, continuousAdd);
  };

  return (
    <Modal
      open={open}
      title={isBorrow ? '添加借用出库物资' : '添加领用出库物资'}
      width={1180}
      okText="添加并关闭"
      cancelText="取消"
      onCancel={onCancel}
      onOk={submit}
      destroyOnHidden
    >
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Text>当前仓库：{warehouse}</Typography.Text>
        <Card size="small" title="选择物资">
          <DetailGrid columns={3} labelWidth={96}>
            <EditorField label="资产标签号">
              <LookupInput value={asset.assetTag} onClick={() => setAsset((current) => ({ ...current, assetTag: SOURCE_ASSET.assetTag }))} />
            </EditorField>
            <EditorField label="SN号">
              <LookupInput value={asset.sn} onClick={() => setAsset((current) => ({ ...current, sn: SOURCE_ASSET.sn }))} />
            </EditorField>
            <EditorField label="连续添加"><Checkbox checked={continuousAdd} onChange={(e) => setContinuousAdd(e.target.checked)}>连续添加</Checkbox></EditorField>
          </DetailGrid>
        </Card>

        <Card size="small" title="物资信息">
          <DetailGrid columns={3} labelWidth={96} minWidth={980}>
            <EditorField label="资产标签号"><Readonly>{asset.assetTag}</Readonly></EditorField>
            <EditorField label="SN号"><Readonly>{asset.sn}</Readonly></EditorField>
            <EditorField label="物资说明"><Readonly>{asset.materialDesc}</Readonly></EditorField>
            <EditorField label="物资大类"><Readonly>{asset.assetClass}</Readonly></EditorField>
            <EditorField label="物资小类"><Readonly>{asset.assetSubClass}</Readonly></EditorField>
            <EditorField label="品牌"><Readonly>{asset.brand}</Readonly></EditorField>
            <EditorField label="规格型号"><Readonly>{asset.model}</Readonly></EditorField>
            <EditorField label="配置"><Readonly>{asset.config}</Readonly></EditorField>
            <EditorField label="计量单位"><Readonly>{asset.unit}</Readonly></EditorField>
            <EditorField label="申请批次"><Readonly>{asset.applicationBatch}</Readonly></EditorField>
            <EditorField label="责任人"><Readonly>{asset.responsiblePerson}</Readonly></EditorField>
            <EditorField label="物资总类"><Readonly>{asset.materialGroup}</Readonly></EditorField>
            <EditorField label="数量"><Readonly>{asset.quantity}</Readonly></EditorField>
            <EditorField label="资产状态"><Readonly>{asset.assetStatus}</Readonly></EditorField>
            <EditorField label="公司"><Readonly>{asset.company}</Readonly></EditorField>
            <EditorField label="板块"><Readonly>{asset.plate}</Readonly></EditorField>
            <EditorField label="成本中心"><Readonly>{asset.costCenter}</Readonly></EditorField>
            <EditorField label="费用账户"><Readonly>{asset.expenseAccount}</Readonly></EditorField>
            <EditorField label="主资产标签号"><Readonly>{asset.mainAssetTag}</Readonly></EditorField>
            <EditorField label="原值"><Readonly>{Number(asset.originalValue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</Readonly></EditorField>
            <EditorField label="税金"><Readonly>{Number(asset.tax || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</Readonly></EditorField>
            <EditorField label="总价"><Readonly>{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</Readonly></EditorField>
            <EditorField label="部件数量"><Readonly>{asset.partQuantity}</Readonly></EditorField>
            <EditorField label="部件说明"><Readonly>{asset.partDesc}</Readonly></EditorField>
            <EditorField label="资产标记"><Readonly>{asset.assetMark}</Readonly></EditorField>
            <EditorField label="备注" span={3}><Readonly>{asset.remark}</Readonly></EditorField>
          </DetailGrid>
        </Card>

        <Card size="small" title={isBorrow ? '借用出库' : '领用出库'}>
          <DetailGrid columns={3} labelWidth={96} minWidth={980}>
            <EditorField label={isBorrow ? '借用人' : '领用人'} required><LookupInput value={form.person} onClick={() => {}} /></EditorField>
            <EditorField label="部门"><Readonly>{form.department}</Readonly></EditorField>
            <EditorField label="公司"><Readonly>{form.company}</Readonly></EditorField>
            <EditorField label="资产状态" required>
              <Select
                className="w-full"
                value={form.outboundStatus}
                options={(isBorrow ? ['在用-借用中', '在用-使用中'] : ['在用-使用中', '在用-借用中']).map((value) => ({ label: value, value }))}
                onChange={(value) => set('outboundStatus', value)}
              />
            </EditorField>
            <EditorField label="出库数量"><Readonly>{form.outboundQty}</Readonly></EditorField>
            <EditorField label="成本中心" required><LookupInput value={form.costCenter} onClick={() => {}} /></EditorField>
            <EditorField label="业务线"><LookupInput value={form.businessLine} onClick={() => {}} /></EditorField>
            <EditorField label="City" required><LookupInput value={form.city} onClick={() => {}} /></EditorField>
            <EditorField label="Building" required><LookupInput value={form.building} onClick={() => {}} /></EditorField>
            <EditorField label="Floor" required><Select className="w-full" value={form.floor} options={['15F', '16F', '17F'].map((v) => ({ label: v, value: v }))} onChange={(v) => set('floor', v)} /></EditorField>
            <EditorField label="Room"><Input value={form.room} onChange={(e) => set('room', e.target.value)} /></EditorField>
            {isBorrow && <EditorField label="借用原因" required><Input value={form.reason} onChange={(e) => set('reason', e.target.value)} /></EditorField>}
            <EditorField label="用途" required><Select className="w-full" value={form.usage} options={['办公', '测试', '机房'].map((v) => ({ label: v, value: v }))} onChange={(v) => set('usage', v)} /></EditorField>
            <EditorField label={isBorrow ? '借用日期' : '领用日期'} required><DatePicker className="w-full" value={form.outboundDate ? dayjs(form.outboundDate) : null} onChange={(d) => set('outboundDate', d?.format('YYYY-MM-DD') || '')} /></EditorField>
            {isBorrow && <EditorField label="预计归还日期" required><DatePicker className="w-full" value={form.expectedReturnDate ? dayjs(form.expectedReturnDate) : null} onChange={(d) => set('expectedReturnDate', d?.format('YYYY-MM-DD') || '')} /></EditorField>}
            <EditorField label="使用说明" span={3}><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={form.usageDesc} onChange={(e) => set('usageDesc', e.target.value)} /></EditorField>
          </DetailGrid>
        </Card>
      </Space>
    </Modal>
  );
}

function OutboundEditor({ source, onBack, onSave, onExecute }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [outboundType, setOutboundType] = useState(source?.outboundType || '领用出库');
  const [warehouse, setWarehouse] = useState(source?.warehouse || WAREHOUSES[0]);
  const [remark, setRemark] = useState(source?.remark || '');
  const [cardClaim, setCardClaim] = useState(source?.cardClaim || '否');
  const [lines, setLines] = useState(source?.lines || []);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const documentNo = source?.documentNo || '保存后自动生成';
  const creator = source?.creator || '206984-何文';
  const status = source?.status || '草稿';
  const createdDate = source?.createdDate || dayjs().format('YYYY-MM-DD');
  const editable = status === '草稿';

  const issueColumns = [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: 'SN序列号', dataIndex: 'sn', width: 150 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 180 },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '领用人', dataIndex: 'issuePerson', width: 140 },
    { title: '领用日期', dataIndex: 'issueDate', width: 120 },
    { title: '资产标记', dataIndex: 'assetMark', width: 100 },
    { title: '资产状态', dataIndex: 'outboundStatus', width: 130 },
    ...(editable ? [{ title: '操作', width: 80, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => { setEditingLine(row); setLineModalOpen(true); }}>编辑</Button> }] : []),
  ];
  const borrowColumns = [
    { title: '行号', width: 64, render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: 'SN序列号', dataIndex: 'sn', width: 150 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 110 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 180 },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '借用日期', dataIndex: 'borrowDate', width: 120 },
    { title: '借用人', dataIndex: 'borrowPerson', width: 140 },
    { title: '借用原因', dataIndex: 'borrowReason', width: 180 },
    { title: '资产标记', dataIndex: 'assetMark', width: 100 },
    { title: '资产状态', dataIndex: 'outboundStatus', width: 130 },
    ...(editable ? [{ title: '操作', width: 80, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => { setEditingLine(row); setLineModalOpen(true); }}>编辑</Button> }] : []),
  ];

  const payload = () => ({
    outboundType,
    warehouse,
    remark,
    cardClaim,
    quantity: lines.reduce((sum, row) => sum + Number(row.quantity || 0), 0),
    lines,
  });

  const saveLine = (row, continuousAdd) => {
    if (editingLine) {
      setLines((current) => current.map((item) => item.id === editingLine.id ? { ...row, id: editingLine.id } : item));
      setEditingLine(null);
      setLineModalOpen(false);
      return;
    }
    setLines((current) => [...current, { ...row, id: `${Date.now()}-${current.length + 1}` }]);
    if (!continuousAdd) setLineModalOpen(false);
  };

  const deleteLines = () => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要删除的物资');
    const selected = new Set(selectedKeys);
    setLines((current) => current.filter((row) => !selected.has(row.id)));
    setSelectedKeys([]);
  };

  const changeType = (value) => {
    if (!lines.length) {
      setOutboundType(value);
      return;
    }
    Modal.confirm({
      title: '切换出库类型？',
      content: '领用出库与借用出库的维护字段不同，切换后当前物资行会清空。',
      okText: '切换',
      cancelText: '取消',
      onOk: () => {
        setOutboundType(value);
        setLines([]);
        setSelectedKeys([]);
      },
    });
  };

  const executeOutbound = () => {
    if (!lines.length) return messageApi.warning('请先添加待出库物资');
    onExecute(payload());
    messageApi.success('执行出库成功');
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>出库单</PageTitle>
      <Card size="small" title="出库单信息">
        <DetailGrid columns={3} labelWidth={96}>
          <EditorField label="出库单号"><Readonly>{documentNo}</Readonly></EditorField>
          <EditorField label="单据类型"><Readonly>出库工单</Readonly></EditorField>
          <EditorField label="单据状态"><StatusTag value={status} /></EditorField>
          <EditorField label="出库类型">{editable ? <Select className="w-full" value={outboundType} options={OUTBOUND_TYPES.map((v) => ({ label: v, value: v }))} onChange={changeType} /> : <Readonly>{outboundType}</Readonly>}</EditorField>
          <EditorField label="制单人"><Readonly>{creator}</Readonly></EditorField>
          <EditorField label="制单时间"><Readonly>{createdDate}</Readonly></EditorField>
          <EditorField label="是否刷卡领用">{editable ? <Select className="w-full" value={cardClaim} options={['是', '否'].map((v) => ({ label: v, value: v }))} onChange={setCardClaim} /> : <Readonly>{cardClaim}</Readonly>}</EditorField>
          <EditorField label="当前仓库">{editable ? <Select className="w-full" value={warehouse} options={WAREHOUSES.map((v) => ({ label: v, value: v }))} onChange={setWarehouse} /> : <Readonly>{warehouse}</Readonly>}</EditorField>
          <EditorField label="备注" span={3}>{editable ? <TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={remark} onChange={(e) => setRemark(e.target.value)} /> : <Readonly>{remark}</Readonly>}</EditorField>
        </DetailGrid>
      </Card>

      <Card
        size="small"
        title="出库物资"
        extra={editable ? <Space>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditingLine(null); setLineModalOpen(true); }}>添加物资</Button>
          <Button danger icon={<Trash2 size={14} />} onClick={deleteLines}>删除物资</Button>
          <Button icon={<Upload size={14} />} onClick={() => messageApi.info('Excel导入沿用出库模板，本轮按截图字段展示')}>Excel导入</Button>
        </Space> : null}
      >
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={outboundType === '借用出库' ? borrowColumns : issueColumns}
          dataSource={lines}
          rowSelection={editable ? { selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true } : undefined}
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </Card>

      <div className="flex justify-center gap-3">
        {editable ? (
          <>
            <Button onClick={() => onSave(payload())}>保存草稿</Button>
            <Button type="primary" onClick={executeOutbound}>执行出库</Button>
            <Button onClick={onBack}>返回</Button>
          </>
        ) : (
          <>
            <Button type="primary" icon={<Printer size={14} />} onClick={() => messageApi.success('出库单打印操作已记录（原型）')}>打印</Button>
            <Button onClick={onBack}>返回</Button>
          </>
        )}
      </div>

      {editable && <OutboundItemModal
        key={`${outboundType}-${editingLine?.id || 'new'}-${lineModalOpen}`}
        open={lineModalOpen}
        mode={outboundType}
        warehouse={warehouse}
        initialLine={editingLine}
        onCancel={() => { setLineModalOpen(false); setEditingLine(null); }}
        onConfirm={saveLine}
      />}
    </Space>
  );
}

export default function OutboundPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [view, setView] = useState('list');
  const [activeRow, setActiveRow] = useState(null);
  const emptyFilters = { documentNo: '', outboundType: '', status: '', poNo: '', applicationNo: '', assetTag: '', creator: '', createdFrom: '', createdTo: '', responsiblePerson: '' };
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
    && includesText(row.assetTag, filters.assetTag)
    && includesText(row.creator, filters.creator)
    && includesText(row.responsiblePerson, filters.responsiblePerson)
    && (!filters.createdFrom || row.createdDate >= filters.createdFrom)
    && (!filters.createdTo || row.createdDate <= filters.createdTo)
  )), [rows, filters]);

  const openEditor = (row = null) => {
    setActiveRow(row);
    setView('editor');
  };

  const buildRow = (payload, status) => {
    const id = Math.max(0, ...rows.map((row) => row.id)) + 1;
    return {
      id,
      documentNo: `OS-${dayjs().format('YYYYMMDD')}${String(id).padStart(4, '0')}`,
      applicationNo: '',
      status,
      outboundType: payload.outboundType,
      warehouse: payload.warehouse,
      outboundDate: status === '已完成' ? dayjs().format('YYYY-MM-DD') : '',
      createdDate: dayjs().format('YYYY-MM-DD'),
      creator: '206984-何文',
      quantity: payload.quantity,
      cardClaim: payload.cardClaim,
      poNo: '',
      assetTag: payload.lines[0]?.assetTag || '',
      responsiblePerson: payload.lines[0]?.responsiblePerson || '',
      remark: payload.remark,
      lines: payload.lines,
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

  const executeOutbound = (payload) => {
    if (activeRow) {
      setRows((current) => current.map((row) => row.id === activeRow.id ? { ...row, ...payload, status: '已完成', outboundDate: dayjs().format('YYYY-MM-DD') } : row));
    } else {
      const created = buildRow(payload, '已完成');
      setRows((current) => [created, ...current]);
    }
    setActiveRow(null);
    setView('list');
  };

  if (view === 'editor') {
    return <OutboundEditor source={activeRow} onBack={() => { setView('list'); setActiveRow(null); }} onSave={saveDraft} onExecute={executeOutbound} />;
  }

  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '出库单号', dataIndex: 'documentNo', width: 190, render: (value, row) => <Button type="link" className="px-0" onClick={() => openEditor(row)}>{value}</Button> },
    { title: '申请单号', dataIndex: 'applicationNo', width: 210, render: (value) => value || '-' },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '出库类型', dataIndex: 'outboundType', width: 130 },
    { title: '出库仓库', dataIndex: 'warehouse', width: 280 },
    { title: '出库时间', dataIndex: 'outboundDate', width: 130, render: (value) => value || '-' },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
    { title: '是否刷卡领用', dataIndex: 'cardClaim', width: 130, render: (value) => <StatusTag value={value} /> },
  ];

  const deleteRows = () => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要删除的出库单');
    const selected = new Set(selectedKeys);
    setRows((current) => current.filter((row) => !selected.has(row.id)));
    setSelectedKeys([]);
    messageApi.success('已删除所选出库单');
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>出库</PageTitle>
      <QueryBar
        onQuery={() => { setFilters({ ...draft }); setSelectedKeys([]); }}
        onReset={() => { setDraft(emptyFilters); setFilters(emptyFilters); setSelectedKeys([]); }}
      >
        <QueryItem label="出库单号"><Input value={draft.documentNo} allowClear placeholder="请输入出库单号" onChange={(e) => update('documentNo', e.target.value)} /></QueryItem>
        <QueryItem label="出库类型"><Select className="w-full" value={draft.outboundType || undefined} allowClear placeholder="全部" options={OUTBOUND_TYPES.map((v) => ({ label: v, value: v }))} onChange={(v) => update('outboundType', v)} /></QueryItem>
        <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={['草稿', '已完成'].map((v) => ({ label: v, value: v }))} onChange={(v) => update('status', v)} /></QueryItem>
        <QueryItem label="PO单号"><Input value={draft.poNo} allowClear placeholder="请输入PO单号" onChange={(e) => update('poNo', e.target.value)} /></QueryItem>
        <QueryItem label="申请单号"><Input value={draft.applicationNo} allowClear placeholder="请输入申请单号" onChange={(e) => update('applicationNo', e.target.value)} /></QueryItem>
        <QueryItem label="资产标签号"><Input value={draft.assetTag} allowClear placeholder="请输入资产标签号" onChange={(e) => update('assetTag', e.target.value)} /></QueryItem>
        <QueryItem label="制单人"><Input value={draft.creator} allowClear placeholder="请输入制单人" onChange={(e) => update('creator', e.target.value)} /></QueryItem>
        <QueryItem label="制单日期">
          <RangePicker
            className="w-full"
            value={[draft.createdFrom ? dayjs(draft.createdFrom) : null, draft.createdTo ? dayjs(draft.createdTo) : null]}
            onChange={(dates) => {
              update('createdFrom', dates?.[0]?.format('YYYY-MM-DD') || '');
              update('createdTo', dates?.[1]?.format('YYYY-MM-DD') || '');
            }}
          />
        </QueryItem>
        <QueryItem label="资产责任人"><Input value={draft.responsiblePerson} allowClear placeholder="请输入资产责任人" onChange={(e) => update('responsiblePerson', e.target.value)} /></QueryItem>
      </QueryBar>

      <Card size="small" title="出库单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => openEditor()}>创建</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={deleteRows}>删除</Button>
            <Button icon={<Printer size={14} />} onClick={() => messageApi.success('出库打印操作已记录（原型）')}>出库打印</Button>
            <Button icon={<Printer size={14} />} onClick={() => messageApi.success('领用打印操作已记录（原型）')}>领用打印</Button>
          </Space>
        </div>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true }} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
    </Space>
  );
}
