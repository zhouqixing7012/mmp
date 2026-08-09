import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { Plus, Printer, Search, Trash2 } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

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
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-1.5 rounded bg-[#1677ff]" />
      <Typography.Title level={3} className="mb-0">{children}</Typography.Title>
    </div>
  );
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input
        value={value}
        readOnly
        placeholder={placeholder}
        className="pointer-events-none"
        suffix={<Search size={14} className="text-[#1677ff]" />}
      />
    </div>
  );
}

function DateFilter({ value, onChange, placeholder }) {
  return (
    <DatePicker
      value={value ? dayjs(value) : null}
      format="YYYY-MM-DD"
      placeholder={placeholder}
      style={{ width: '100%' }}
      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
    />
  );
}

function SelectorModal({ config, onClose }) {
  if (!config) return null;
  return (
    <SelectModal
      open
      title={config.title}
      dataSource={config.dataSource || []}
      columns={[{ title: '名称', dataIndex: 'name' }]}
      searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]}
      onCancel={onClose}
      onConfirm={config.onConfirm}
    />
  );
}

function RowSelection(selectedRowKeys, setSelectedRowKeys) {
  return {
    type: 'checkbox',
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    fixed: true,
    columnTitle: '选择',
    columnWidth: 64,
  };
}

function confirmDelete({ selectedRowKeys, setSelectedRowKeys, setRows, messageApi, objectName }) {
  if (selectedRowKeys.length === 0) {
    messageApi.warning(`请先选择需要删除的${objectName}`);
    return;
  }
  Modal.confirm({
    title: `确认删除所选${objectName}？`,
    content: `共选择 ${selectedRowKeys.length} 条。`,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: () => {
      const selected = new Set(selectedRowKeys);
      setRows((current) => current.filter((row) => !selected.has(row.id)));
      setSelectedRowKeys([]);
      messageApi.success(`已删除所选${objectName}`);
    },
  });
}

const INBOUND_ROWS = [
  { id: 1, documentNo: 'PI-202608070025', applicationNo: 'ERA-202608070021', status: '已完成', inboundType: '退库入库', warehouse: 'I0022-资产集团前台库（焦点互...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', prNo: '', assetTag: '' },
  { id: 2, documentNo: 'PI-202608070024', applicationNo: 'ERA-202608070002', status: '已完成', inboundType: '退库入库', warehouse: 'I0022-资产集团前台库（焦点互...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', prNo: '', assetTag: '' },
  { id: 3, documentNo: 'PI-202608070023', applicationNo: 'ERA-202608070003', status: '已完成', inboundType: '退库入库', warehouse: 'I0022-资产集团前台库（焦点互...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', prNo: '', assetTag: '' },
  { id: 4, documentNo: 'PI-202608070022', applicationNo: 'CHA-2026080700001', status: '已完成', inboundType: '退库入库', warehouse: 'I0018-资产集团前台库（新动力）...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', prNo: '', assetTag: '' },
  { id: 5, documentNo: 'PI-202608070021', applicationNo: '', status: '已完成', inboundType: '退库入库', warehouse: 'I0013-资产集团前台库（新媒体）...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '否', poNo: '', prNo: '', assetTag: '' },
  { id: 6, documentNo: 'PI-202608070004', applicationNo: 'ERA-202608070022', status: '已完成', inboundType: '退库入库', warehouse: 'I0019-资产集团前台库（天津飞狐）...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', prNo: '', assetTag: '' },
  { id: 7, documentNo: 'PI-202608070003', applicationNo: '', status: '已完成', inboundType: '退库入库', warehouse: 'I0018-资产集团前台库（新动力）...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 2, cardClaim: '否', poNo: '', prNo: '', assetTag: '' },
  { id: 8, documentNo: 'PI-202608070002', applicationNo: 'CPR-202608070001', status: '已完成', inboundType: '退库入库', warehouse: 'I10086-集团合约机库（新媒体）...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '否', poNo: '', prNo: '', assetTag: '' },
  { id: 9, documentNo: 'PI-202608070001', applicationNo: 'ERA-202608070001', status: '已完成', inboundType: '退库入库', warehouse: 'I0013-资产集团前台库（新媒体）...', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', prNo: '', assetTag: '' },
  { id: 10, documentNo: 'PI-202608060022', applicationNo: '', status: '已完成', inboundType: '退库入库', warehouse: 'I0013-资产集团前台库（新媒体）...', createdDate: '2026-08-06', creator: '114111-杨芊', quantity: 1, cardClaim: '否', poNo: '', prNo: '', assetTag: '' },
];

const OUTBOUND_ROWS = [
  { id: 1, documentNo: 'OS-202608070025', applicationNo: 'EUA-202607280002', status: '已完成', outboundType: '领用出库', warehouse: 'I1001-耗材...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 80, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 2, documentNo: 'OS-202608070024', applicationNo: 'EUA-202607280001', status: '已完成', outboundType: '领用出库', warehouse: 'I1001-耗材...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 3, documentNo: 'OS-202608070023', applicationNo: '', status: '已完成', outboundType: '领用出库', warehouse: 'I0006-资产...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '否', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 4, documentNo: 'OS-202608070022', applicationNo: 'CHA-2026080700001', status: '已完成', outboundType: '领用出库', warehouse: 'I0018-资产...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 5, documentNo: 'OS-202608070021', applicationNo: '', status: '已完成', outboundType: '领用出库', warehouse: 'I0001-资产...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '否', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 6, documentNo: 'OS-202608070005', applicationNo: 'CA-2026080500023', status: '已完成', outboundType: '领用出库', warehouse: 'I0001-资产...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 7, documentNo: 'OS-202608070004', applicationNo: 'EBA-202608050001', status: '已完成', outboundType: '借用出库', warehouse: 'I0018-资产...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 8, documentNo: 'OS-202608070003', applicationNo: '', status: '已完成', outboundType: '领用出库', warehouse: 'I0006-资产...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '否', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 9, documentNo: 'OS-202608070002', applicationNo: 'CPU-202608060001', status: '已完成', outboundType: '领用出库', warehouse: 'I10086-集...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '213852-孙志强', quantity: 1, cardClaim: '否', poNo: '', assetTag: '', responsiblePerson: '' },
  { id: 10, documentNo: 'OS-202608070001', applicationNo: 'CA-2026080300022', status: '已完成', outboundType: '领用出库', warehouse: 'I0001-资产...', outboundDate: '2026-08-07', createdDate: '2026-08-07', creator: '114111-杨芊', quantity: 1, cardClaim: '是', poNo: '', assetTag: '', responsiblePerson: '' },
];

const MOVE_ROWS = [
  { id: 1, documentNo: 'TS-202608040001', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）...', toWarehouse: 'I0013.资产集团前台库（新媒体）...', createdDate: '2026-08-04', creator: '114111-杨芊', quantity: 5 },
  { id: 2, documentNo: 'TS-202607280005', status: '已完成', fromWarehouse: 'I0022.资产集团前台库（焦点互动）...', toWarehouse: 'I0010.资产集团总库（焦点互动）...', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 1 },
  { id: 3, documentNo: 'TS-202607280004', status: '已完成', fromWarehouse: 'I0018.资产集团前台库（新动力）...', toWarehouse: 'I0006.资产集团总库（新动力）...', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 2 },
  { id: 4, documentNo: 'TS-202607280021', status: '已完成', fromWarehouse: 'I0013.资产集团前台库（新媒体）...', toWarehouse: 'I0001.资产集团总库（新媒体）...', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 6 },
  { id: 5, documentNo: 'TS-202607280003', status: '已完成', fromWarehouse: 'I0007.资产集团总库（天津飞狐）...', toWarehouse: 'I0019.资产集团前台库（天津飞狐）...', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 1 },
  { id: 6, documentNo: 'TS-202607280002', status: '已完成', fromWarehouse: 'I0006.资产集团总库（新动力）...', toWarehouse: 'I0018.资产集团前台库（新动力）...', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 1 },
  { id: 7, documentNo: 'TS-202607280001', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）...', toWarehouse: 'I0013.资产集团前台库（新媒体）...', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 5 },
  { id: 8, documentNo: 'TS-202607270001', status: '已完成', fromWarehouse: 'I0010.资产集团总库（焦点互动）...', toWarehouse: 'I0022.资产集团前台库（焦点互动）...', createdDate: '2026-07-27', creator: '213852-孙志强', quantity: 1 },
  { id: 9, documentNo: 'TS-202607240021', status: '已完成', fromWarehouse: 'I0020.资产集团前台库（天津金狐）...', toWarehouse: 'I0008.资产集团总库（天津金狐）...', createdDate: '2026-07-24', creator: '213852-孙志强', quantity: 1 },
  { id: 10, documentNo: 'TS-202607240004', status: '已完成', fromWarehouse: 'I0019.资产集团前台库（天津飞狐）...', toWarehouse: 'I0007.资产集团总库（天津飞狐）...', createdDate: '2026-07-24', creator: '213852-孙志强', quantity: 2 },
];

const TRANSFER_ROWS = [
  { id: 1, documentNo: 'AT-202608070001', applicationNo: 'ETA-202608070001', status: '已完成', company: '201.焦点互动', createdDate: '2026-08-07', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 2, documentNo: 'AT-202608060002', applicationNo: 'ETA-202608060022', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-06', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 3, documentNo: 'AT-202608060001', applicationNo: 'ETA-202608060021', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-06', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 4, documentNo: 'AT-202608040001', applicationNo: 'ETA-202608030001', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-04', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 5, documentNo: 'AT-202607300021', applicationNo: 'ETA-202607290001', status: '已完成', company: '114.新媒体', createdDate: '2026-07-30', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 6, documentNo: 'AT-202607300001', applicationNo: 'ETA-202607280003', status: '已完成', company: '114.新媒体', createdDate: '2026-07-30', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 7, documentNo: 'AT-202607290001', applicationNo: 'ETA-202607280002', status: '已完成', company: '114.新媒体', createdDate: '2026-07-29', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 8, documentNo: 'AT-202607280001', applicationNo: 'ETA-202607280001', status: '已完成', company: '132.千钧', createdDate: '2026-07-28', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 9, documentNo: 'AT-202607240002', applicationNo: 'ETA-202607240021', status: '已完成', company: '112.北京新动力', createdDate: '2026-07-24', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
  { id: 10, documentNo: 'AT-202607240001', applicationNo: 'ETA-202607230002', status: '已完成', company: '114.新媒体', createdDate: '2026-07-24', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '' },
];

const EMPTY_INBOUND_FILTERS = { documentNo: '', inboundType: '', status: '', poNo: '', prNo: '', assetTag: '', creator: '', createdFrom: '', createdTo: '' };
const EMPTY_OUTBOUND_FILTERS = { documentNo: '', outboundType: '', status: '', poNo: '', applicationNo: '', assetTag: '', creator: '', createdFrom: '', createdTo: '', responsiblePerson: '' };
const EMPTY_MOVE_FILTERS = { documentNo: '', status: '', creator: '', createdFrom: '', createdTo: '' };
const EMPTY_TRANSFER_FILTERS = { documentNo: '', reason: '', status: '', company: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', creator: '', createdFrom: '', createdTo: '' };

export function InboundPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INBOUND_ROWS);
  const [draft, setDraft] = useState(EMPTY_INBOUND_FILTERS);
  const [applied, setApplied] = useState(EMPTY_INBOUND_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectorType, setSelectorType] = useState('');
  const creatorData = useMemo(() => toSelectData(INBOUND_ROWS.map((row) => row.creator)), []);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, applied.documentNo)
    && (!applied.inboundType || row.inboundType === applied.inboundType)
    && (!applied.status || row.status === applied.status)
    && includesText(row.poNo, applied.poNo)
    && includesText(row.prNo, applied.prNo)
    && includesText(row.assetTag, applied.assetTag)
    && includesText(row.creator, applied.creator)
    && inDateRange(row.createdDate, applied.createdFrom, applied.createdTo)
  )), [rows, applied]);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));
  const selectorConfig = selectorType === 'creator' ? {
    title: '选择制单人',
    dataSource: creatorData,
    onConfirm: (record) => update('creator', record.name),
  } : null;

  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '入库单号', dataIndex: 'documentNo', width: 190, render: (value) => <Typography.Link onClick={() => messageApi.info('入库单详情字段待确认')}>{value}</Typography.Link> },
    { title: '申请单号', dataIndex: 'applicationNo', width: 210, render: (value) => value || '-' },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '入库类型', dataIndex: 'inboundType', width: 130 },
    { title: '入库仓库', dataIndex: 'warehouse', width: 280 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
    { title: '是否刷卡领用', dataIndex: 'cardClaim', width: 130, render: (value) => <StatusTag value={value} type="yesNo" /> },
    { title: '操作', key: 'operation', width: 90, fixed: 'right', render: () => <Button type="link" className="px-0" onClick={() => messageApi.info('入库单操作详情待确认')}>操作</Button> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>入库</PageTitle>
      <QueryBar onQuery={() => { setApplied({ ...draft }); setSelectedRowKeys([]); }} onReset={() => { setDraft(EMPTY_INBOUND_FILTERS); setApplied(EMPTY_INBOUND_FILTERS); setSelectedRowKeys([]); }}>
        <QueryItem label="入库单号"><Input value={draft.documentNo} allowClear placeholder="请输入入库单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
        <QueryItem label="入库类型"><Select value={draft.inboundType || undefined} allowClear placeholder="全部" options={[{ label: '退库入库', value: '退库入库' }]} onChange={(value) => update('inboundType', value)} /></QueryItem>
        <QueryItem label="单据状态"><Select value={draft.status || undefined} allowClear placeholder="全部" options={[{ label: '已完成', value: '已完成' }]} onChange={(value) => update('status', value)} /></QueryItem>
        <QueryItem label="PO单号"><Input value={draft.poNo} allowClear placeholder="请输入PO单号" onChange={(event) => update('poNo', event.target.value)} /></QueryItem>
        <QueryItem label="PR单号"><Input value={draft.prNo} allowClear placeholder="请输入PR单号" onChange={(event) => update('prNo', event.target.value)} /></QueryItem>
        <QueryItem label="资产标签号"><Input value={draft.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => update('assetTag', event.target.value)} /></QueryItem>
        <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setSelectorType('creator')} /></QueryItem>
        <QueryItem label="制单日期从"><DateFilter value={draft.createdFrom} placeholder="开始日期" onChange={(value) => update('createdFrom', value)} /></QueryItem>
        <QueryItem label="制单日期至"><DateFilter value={draft.createdTo} placeholder="结束日期" onChange={(value) => update('createdTo', value)} /></QueryItem>
      </QueryBar>
      <Card size="small" title="入库单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end"><Space>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => messageApi.info('入库新建页面字段待确认')}>创建</Button>
          <Button danger icon={<Trash2 size={14} />} onClick={() => confirmDelete({ selectedRowKeys, setSelectedRowKeys, setRows, messageApi, objectName: '入库单' })}>删除</Button>
          <Button icon={<Printer size={14} />} onClick={() => messageApi.success('批量打印操作已记录（原型）')}>批量打印</Button>
        </Space></div>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={RowSelection(selectedRowKeys, setSelectedRowKeys)} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
      <SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />
    </Space>
  );
}

export function OutboundPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(OUTBOUND_ROWS);
  const [draft, setDraft] = useState(EMPTY_OUTBOUND_FILTERS);
  const [applied, setApplied] = useState(EMPTY_OUTBOUND_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectorType, setSelectorType] = useState('');
  const creatorData = useMemo(() => toSelectData(OUTBOUND_ROWS.map((row) => row.creator)), []);
  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, applied.documentNo)
    && (!applied.outboundType || row.outboundType === applied.outboundType)
    && (!applied.status || row.status === applied.status)
    && includesText(row.poNo, applied.poNo)
    && includesText(row.applicationNo, applied.applicationNo)
    && includesText(row.assetTag, applied.assetTag)
    && includesText(row.creator, applied.creator)
    && includesText(row.responsiblePerson, applied.responsiblePerson)
    && inDateRange(row.createdDate, applied.createdFrom, applied.createdTo)
  )), [rows, applied]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));
  const selectorConfig = selectorType === 'creator' ? {
    title: '选择制单人', dataSource: creatorData, onConfirm: (record) => update('creator', record.name),
  } : selectorType === 'responsiblePerson' ? {
    title: '选择资产责任人', dataSource: [], onConfirm: (record) => update('responsiblePerson', record.name),
  } : null;

  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '出库单号', dataIndex: 'documentNo', width: 190, render: (value) => <Typography.Link onClick={() => messageApi.info('出库单详情字段待确认')}>{value}</Typography.Link> },
    { title: '申请单号', dataIndex: 'applicationNo', width: 210, render: (value) => value || '-' },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '出库类型', dataIndex: 'outboundType', width: 130 },
    { title: '出库仓库', dataIndex: 'warehouse', width: 220 },
    { title: '出库时间', dataIndex: 'outboundDate', width: 130 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
    { title: '是否刷卡领用', dataIndex: 'cardClaim', width: 130, render: (value) => <StatusTag value={value} type="yesNo" /> },
    { title: '操作', key: 'operation', width: 90, fixed: 'right', render: () => <Button type="link" className="px-0" onClick={() => messageApi.info('出库单操作详情待确认')}>操作</Button> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>出库</PageTitle>
      <QueryBar onQuery={() => { setApplied({ ...draft }); setSelectedRowKeys([]); }} onReset={() => { setDraft(EMPTY_OUTBOUND_FILTERS); setApplied(EMPTY_OUTBOUND_FILTERS); setSelectedRowKeys([]); }}>
        <QueryItem label="出库单号"><Input value={draft.documentNo} allowClear placeholder="请输入出库单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
        <QueryItem label="出库类型"><Select value={draft.outboundType || undefined} allowClear placeholder="全部" options={[{ label: '领用出库', value: '领用出库' }, { label: '借用出库', value: '借用出库' }]} onChange={(value) => update('outboundType', value)} /></QueryItem>
        <QueryItem label="单据状态"><Select value={draft.status || undefined} allowClear placeholder="全部" options={[{ label: '已完成', value: '已完成' }]} onChange={(value) => update('status', value)} /></QueryItem>
        <QueryItem label="PO单号"><Input value={draft.poNo} allowClear placeholder="请输入PO单号" onChange={(event) => update('poNo', event.target.value)} /></QueryItem>
        <QueryItem label="申请单号"><Input value={draft.applicationNo} allowClear placeholder="请输入申请单号" onChange={(event) => update('applicationNo', event.target.value)} /></QueryItem>
        <QueryItem label="资产标签号"><Input value={draft.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => update('assetTag', event.target.value)} /></QueryItem>
        <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setSelectorType('creator')} /></QueryItem>
        <QueryItem label="制单日期从"><DateFilter value={draft.createdFrom} placeholder="开始日期" onChange={(value) => update('createdFrom', value)} /></QueryItem>
        <QueryItem label="制单日期至"><DateFilter value={draft.createdTo} placeholder="结束日期" onChange={(value) => update('createdTo', value)} /></QueryItem>
        <QueryItem label="资产责任人"><LookupInput value={draft.responsiblePerson} placeholder="请选择资产责任人" onOpen={() => setSelectorType('responsiblePerson')} /></QueryItem>
      </QueryBar>
      <Card size="small" title="出库单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end"><Space>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => messageApi.info('出库新建页面字段待确认')}>创建</Button>
          <Button danger icon={<Trash2 size={14} />} onClick={() => confirmDelete({ selectedRowKeys, setSelectedRowKeys, setRows, messageApi, objectName: '出库单' })}>删除</Button>
          <Button icon={<Printer size={14} />} onClick={() => messageApi.success('出库打印操作已记录（原型）')}>出库打印</Button>
          <Button icon={<Printer size={14} />} onClick={() => messageApi.success('领用打印操作已记录（原型）')}>领用打印</Button>
        </Space></div>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={RowSelection(selectedRowKeys, setSelectedRowKeys)} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
      <SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />
    </Space>
  );
}

export function MovePage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(MOVE_ROWS);
  const [draft, setDraft] = useState(EMPTY_MOVE_FILTERS);
  const [applied, setApplied] = useState(EMPTY_MOVE_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectorType, setSelectorType] = useState('');
  const [activeTab, setActiveTab] = useState('initiated');
  const [scanAsset, setScanAsset] = useState('');
  const creatorData = useMemo(() => toSelectData(MOVE_ROWS.map((row) => row.creator)), []);
  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, applied.documentNo)
    && (!applied.status || row.status === applied.status)
    && includesText(row.creator, applied.creator)
    && inDateRange(row.createdDate, applied.createdFrom, applied.createdTo)
  )), [rows, applied]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));
  const selectorConfig = selectorType === 'creator' ? {
    title: '选择制单人', dataSource: creatorData, onConfirm: (record) => update('creator', record.name),
  } : null;

  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '移库单号', dataIndex: 'documentNo', width: 190, render: (value) => <Typography.Link onClick={() => messageApi.info('移库单详情字段待确认')}>{value}</Typography.Link> },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '移出仓库', dataIndex: 'fromWarehouse', width: 320 },
    { title: '移入仓库', dataIndex: 'toWarehouse', width: 320 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
    { title: '操作', key: 'operation', width: 90, fixed: 'right', render: () => <Button type="link" className="px-0" onClick={() => messageApi.info('移库单操作详情待确认')}>操作</Button> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>移库</PageTitle>
      <Card size="small">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[{ key: 'initiated', label: '发起单据' }, { key: 'received', label: '接收单据' }]} />
      </Card>
      {activeTab === 'received' ? (
        <Card size="small"><Empty description="接收单据字段待确认" /></Card>
      ) : (
        <>
          <QueryBar onQuery={() => { setApplied({ ...draft }); setSelectedRowKeys([]); }} onReset={() => { setDraft(EMPTY_MOVE_FILTERS); setApplied(EMPTY_MOVE_FILTERS); setSelectedRowKeys([]); setScanAsset(''); }}>
            <QueryItem label="移库单号"><Input value={draft.documentNo} allowClear placeholder="请输入移库单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
            <QueryItem label="单据状态"><Select value={draft.status || undefined} allowClear placeholder="全部" options={[{ label: '已完成', value: '已完成' }]} onChange={(value) => update('status', value)} /></QueryItem>
            <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setSelectorType('creator')} /></QueryItem>
            <QueryItem label="制单日期从"><DateFilter value={draft.createdFrom} placeholder="开始日期" onChange={(value) => update('createdFrom', value)} /></QueryItem>
            <QueryItem label="制单日期至"><DateFilter value={draft.createdTo} placeholder="结束日期" onChange={(value) => update('createdTo', value)} /></QueryItem>
            <QueryItem label="资产扫描"><Input value={scanAsset} allowClear placeholder="扫描资产打开单据" onChange={(event) => setScanAsset(event.target.value)} onPressEnter={() => messageApi.info('资产扫描后打开单据的规则待确认')} /></QueryItem>
          </QueryBar>
          <Card size="small" title="移库单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
            <div className="mb-3 flex justify-end"><Space>
              <Button type="primary" icon={<Plus size={14} />} onClick={() => messageApi.info('移库新建页面字段待确认')}>创建</Button>
              <Button danger icon={<Trash2 size={14} />} onClick={() => confirmDelete({ selectedRowKeys, setSelectedRowKeys, setRows, messageApi, objectName: '移库单' })}>删除</Button>
            </Space></div>
            <Table rowKey="id" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={RowSelection(selectedRowKeys, setSelectedRowKeys)} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
          </Card>
        </>
      )}
      <SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />
    </Space>
  );
}

export function TransferPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(TRANSFER_ROWS);
  const [draft, setDraft] = useState(EMPTY_TRANSFER_FILTERS);
  const [applied, setApplied] = useState(EMPTY_TRANSFER_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectorType, setSelectorType] = useState('');
  const companyData = useMemo(() => toSelectData(TRANSFER_ROWS.map((row) => row.company)), []);
  const creatorData = useMemo(() => toSelectData(TRANSFER_ROWS.map((row) => row.creator)), []);
  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, applied.documentNo)
    && includesText(row.reason, applied.reason)
    && (!applied.status || row.status === applied.status)
    && includesText(row.company, applied.company)
    && includesText(row.outDept, applied.outDept)
    && includesText(row.outLocation, applied.outLocation)
    && includesText(row.plate, applied.plate)
    && includesText(row.inDept, applied.inDept)
    && includesText(row.inLocation, applied.inLocation)
    && includesText(row.creator, applied.creator)
    && inDateRange(row.createdDate, applied.createdFrom, applied.createdTo)
  )), [rows, applied]);
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

  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '转移单号', dataIndex: 'documentNo', width: 190, render: (value) => <Typography.Link onClick={() => messageApi.info('转移单详情字段待确认')}>{value}</Typography.Link> },
    { title: '申请单号', dataIndex: 'applicationNo', width: 220 },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '公司', dataIndex: 'company', width: 180 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 180 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
    { title: '操作', key: 'operation', width: 90, fixed: 'right', render: () => <Button type="link" className="px-0" onClick={() => messageApi.info('转移单操作详情待确认')}>操作</Button> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>转移</PageTitle>
      <QueryBar onQuery={() => { setApplied({ ...draft }); setSelectedRowKeys([]); }} onReset={() => { setDraft(EMPTY_TRANSFER_FILTERS); setApplied(EMPTY_TRANSFER_FILTERS); setSelectedRowKeys([]); }}>
        <QueryItem label="转移单号"><Input value={draft.documentNo} allowClear placeholder="请输入转移单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
        <QueryItem label="转移原因"><Input value={draft.reason} allowClear placeholder="请输入转移原因" onChange={(event) => update('reason', event.target.value)} /></QueryItem>
        <QueryItem label="单据状态"><Select value={draft.status || undefined} allowClear placeholder="全部" options={[{ label: '已完成', value: '已完成' }]} onChange={(value) => update('status', value)} /></QueryItem>
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
        <div className="mb-3 flex justify-end"><Space>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => messageApi.info('创建转移单页面字段待确认')}>创建转移单</Button>
          <Button danger icon={<Trash2 size={14} />} onClick={() => confirmDelete({ selectedRowKeys, setSelectedRowKeys, setRows, messageApi, objectName: '转移单' })}>删除</Button>
        </Space></div>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={RowSelection(selectedRowKeys, setSelectedRowKeys)} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
      <SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />
    </Space>
  );
}
