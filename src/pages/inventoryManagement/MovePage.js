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
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { Plus, Search, Trash2, Upload } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import MoveReceiveContent from './MoveReceiveContent';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const WAREHOUSES = [
  'I0001.资产集团总库（新媒体）',
  'I0013.资产集团前台库（新媒体）',
  'I0022.资产集团前台库（焦点互动）',
];

const RECEIVE_WAREHOUSES = [
  { id: 1, name: 'I2010.资产汽车北京库' },
  { id: 2, name: 'I0024.资产网络大厦库（新媒体）' },
  { id: 3, name: 'I0033.资产MIS备货库（新媒体）' },
];

const INITIAL_ROWS = [
  { id: 1, documentNo: 'TS-202608040001', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）', toWarehouse: 'I0013.资产集团前台库（新媒体）', createdDate: '2026-08-04', creator: '114111-杨芊', quantity: 5, remark: '', lines: [] },
  { id: 2, documentNo: 'TS-202607280005', status: '已完成', fromWarehouse: 'I0022.资产集团前台库（焦点互动）', toWarehouse: 'I0010.资产集团总库（焦点互动）', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 1, remark: '', lines: [] },
  { id: 3, documentNo: 'TS-202607280004', status: '已完成', fromWarehouse: 'I0018.资产集团前台库（新动力）', toWarehouse: 'I0006.资产集团总库（新动力）', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 2, remark: '', lines: [] },
  { id: 4, documentNo: 'TS-202607280021', status: '已完成', fromWarehouse: 'I0013.资产集团前台库（新媒体）', toWarehouse: 'I0001.资产集团总库（新媒体）', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 6, remark: '', lines: [] },
  { id: 5, documentNo: 'TS-202607280003', status: '已完成', fromWarehouse: 'I0007.资产集团总库（天津飞狐）', toWarehouse: 'I0019.资产集团前台库（天津飞狐）', createdDate: '2026-07-28', creator: '213852-孙志强', quantity: 1, remark: '', lines: [] },
];

const EMPTY_FILTERS = {
  documentNo: '',
  status: '',
  creator: '',
  createdFrom: '',
  createdTo: '',
  assetScan: '',
};

const SOURCE_ASSET = {
  assetTag: 'AST-2409010068',
  sn: 'SN-T14-0068',
  materialDesc: '联想.ThinkPad T14',
  availableQty: 1,
  materialGroup: '1.资产',
  assetClass: '10.电脑',
  assetSubClass: '笔记本电脑',
  assetQty: 1,
  applicationBatch: '2026Q3',
  config: 'i7 / 32G / 1T SSD',
  unit: '台',
  assetMark: '主资产',
  originalValue: 8200,
  netValue: 6800,
  assetStatus: '在库-新增',
  company: '114.新媒体',
  plate: '集团',
  department: 'ERP部',
  costCenter: 'ERP部',
  businessLine: '0.*',
  project: '0.*',
  expenseAccount: '固定资产',
  responsiblePerson: '206984-何文',
  city: '010.北京市',
  building: '129753.搜狐媒体大厦',
  floor: '15F',
  room: '1508',
  enabledDate: '2026-09-10',
  usage: '办公',
  remark: '-',
};

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

function rowContainsAsset(row, query) {
  if (!query) return true;
  return (row.lines || []).some((asset) => includesText(asset.assetTag, query) || includesText(asset.sn, query));
}

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function RequiredLabel({ children }) {
  return <span>{children}<span className="ml-0.5 text-red-500">*</span></span>;
}

function LookupInput({ value, placeholder, onOpen, disabled = false }) {
  if (disabled) return <Readonly>{value}</Readonly>;
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} />} />
    </div>
  );
}

function MoveItemModal({ open, currentWarehouse, initialLine, onCancel, onConfirm }) {
  const [asset, setAsset] = useState(() => ({ ...SOURCE_ASSET, ...(initialLine || {}), warehouse: currentWarehouse }));
  const [moveDesc, setMoveDesc] = useState(initialLine?.moveDesc || '');

  const submit = (keepOpen) => {
    const quantity = Number(asset.assetQty || asset.quantity || 1);
    onConfirm({
      ...asset,
      warehouse: currentWarehouse,
      quantity,
      moveDesc,
      moveStatus: '草稿',
    }, keepOpen);
  };

  const pickSourceAsset = () => setAsset((current) => ({ ...current, ...SOURCE_ASSET, warehouse: currentWarehouse }));

  return (
    <Modal
      open={open}
      title="添加移库物资"
      width={1180}
      onCancel={onCancel}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="continue" onClick={() => submit(true)}>添加并继续</Button>,
        <Button key="close" type="primary" onClick={() => submit(false)}>添加并关闭</Button>,
      ]}
    >
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Text>当前仓库：{currentWarehouse}</Typography.Text>

        <Card size="small" title="选择物资">
          <DetailGrid columns={3} labelWidth={96}>
            <DetailItem label="资产标签号"><LookupInput value={asset.assetTag} placeholder="请选择资产标签号" onOpen={pickSourceAsset} /></DetailItem>
            <DetailItem label="SN号"><LookupInput value={asset.sn} placeholder="请选择SN号" onOpen={pickSourceAsset} /></DetailItem>
            <DetailItem label="物资说明"><LookupInput value={asset.materialDesc} placeholder="请选择物资说明" onOpen={pickSourceAsset} /></DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="物资信息">
          <DetailGrid columns={4} labelWidth={96} minWidth={1040}>
            <DetailItem label="资产标签号"><Readonly>{asset.assetTag}</Readonly></DetailItem>
            <DetailItem label="SN号"><Readonly>{asset.sn}</Readonly></DetailItem>
            <DetailItem label="物资说明"><Readonly>{asset.materialDesc}</Readonly></DetailItem>
            <DetailItem label="可用数量"><Readonly>{asset.availableQty}</Readonly></DetailItem>
            <DetailItem label="物资总类"><Readonly>{asset.materialGroup}</Readonly></DetailItem>
            <DetailItem label="物资大类"><Readonly>{asset.assetClass}</Readonly></DetailItem>
            <DetailItem label="物资小类"><Readonly>{asset.assetSubClass}</Readonly></DetailItem>
            <DetailItem label="资产数量"><Readonly>{asset.assetQty}</Readonly></DetailItem>
            <DetailItem label="仓库"><Readonly>{currentWarehouse}</Readonly></DetailItem>
            <DetailItem label="申请批次"><Readonly>{asset.applicationBatch}</Readonly></DetailItem>
            <DetailItem label="配置"><Readonly>{asset.config}</Readonly></DetailItem>
            <DetailItem label="计量单位"><Readonly>{asset.unit}</Readonly></DetailItem>
            <DetailItem label="资产标记"><Readonly>{asset.assetMark}</Readonly></DetailItem>
            <DetailItem label="原值"><Readonly>{Number(asset.originalValue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</Readonly></DetailItem>
            <DetailItem label="净值"><Readonly>{Number(asset.netValue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</Readonly></DetailItem>
            <DetailItem label="资产状态"><Readonly>{asset.assetStatus}</Readonly></DetailItem>
            <DetailItem label="公司"><Readonly>{asset.company}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{asset.plate}</Readonly></DetailItem>
            <DetailItem label="部门"><Readonly>{asset.department}</Readonly></DetailItem>
            <DetailItem label="成本中心"><Readonly>{asset.costCenter}</Readonly></DetailItem>
            <DetailItem label="业务线"><Readonly>{asset.businessLine}</Readonly></DetailItem>
            <DetailItem label="项目"><Readonly>{asset.project}</Readonly></DetailItem>
            <DetailItem label="费用账户"><Readonly>{asset.expenseAccount}</Readonly></DetailItem>
            <DetailItem label="责任人"><Readonly>{asset.responsiblePerson}</Readonly></DetailItem>
            <DetailItem label="City"><Readonly>{asset.city}</Readonly></DetailItem>
            <DetailItem label="Building"><Readonly>{asset.building}</Readonly></DetailItem>
            <DetailItem label="Floor"><Readonly>{asset.floor}</Readonly></DetailItem>
            <DetailItem label="Room"><Readonly>{asset.room}</Readonly></DetailItem>
            <DetailItem label="启用日期"><Readonly>{asset.enabledDate}</Readonly></DetailItem>
            <DetailItem label="用途"><Readonly>{asset.usage}</Readonly></DetailItem>
            <DetailItem label="备注"><Readonly>{asset.remark}</Readonly></DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="移库信息">
          <DetailGrid columns={3} labelWidth={96}>
            <DetailItem label="移库说明" span={3}><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={moveDesc} onChange={(event) => setMoveDesc(event.target.value)} /></DetailItem>
          </DetailGrid>
        </Card>
      </Space>
    </Modal>
  );
}

function MoveEditor({ source, onBack, onSave }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const isNew = !source;
  const editable = isNew || source?.status === '草稿';
  const [currentWarehouse, setCurrentWarehouse] = useState(source?.fromWarehouse || WAREHOUSES[0]);
  const [receiveWarehouse, setReceiveWarehouse] = useState(source?.toWarehouse || RECEIVE_WAREHOUSES[0].name);
  const [remark, setRemark] = useState(source?.remark || '');
  const [lineScanDraft, setLineScanDraft] = useState('');
  const [lineScan, setLineScan] = useState('');
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [lines, setLines] = useState(source?.lines || []);
  const [selectedLineKeys, setSelectedLineKeys] = useState([]);
  const [editingLine, setEditingLine] = useState(null);
  const createdDate = source?.createdDate || dayjs().format('YYYY-MM-DD');
  const documentNo = source?.documentNo || '自动生成';
  const status = source?.status || '草稿';

  const visibleLines = useMemo(
    () => lines.filter((line) => !lineScan || includesText(line.assetTag, lineScan) || includesText(line.sn, lineScan)),
    [lines, lineScan]
  );

  const materialColumns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 220 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 130 },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'right' },
    { title: '公司', dataIndex: 'company', width: 160 },
    { title: '板块', dataIndex: 'plate', width: 120 },
    { title: '资产标记', dataIndex: 'assetMark', width: 120 },
    { title: '启用日期', dataIndex: 'enabledDate', width: 130 },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130 },
    { title: '移库状态', dataIndex: 'moveStatus', width: 130, render: (value) => <StatusTag value={value || '草稿'} /> },
    ...(editable ? [{ title: '操作', key: 'operation', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => { setEditingLine(row); setLineModalOpen(true); }}>编辑</Button> }] : []),
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

  const deleteLines = () => {
    if (!selectedLineKeys.length) return messageApi.warning('请先选择需要删除的物资');
    const selected = new Set(selectedLineKeys);
    setLines((current) => current.filter((line) => !selected.has(line.id)));
    setSelectedLineKeys([]);
  };

  const payload = () => ({ currentWarehouse, receiveWarehouse, remark, lines });

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>移库单</PageTitle>

      <Card size="small" title="移库单信息">
        <DetailGrid columns={3} labelWidth={96}>
          <DetailItem label="移库单号"><Readonly>{documentNo}</Readonly></DetailItem>
          <DetailItem label="单据类型"><Readonly>移库单</Readonly></DetailItem>
          <DetailItem label="单据状态"><StatusTag value={status} /></DetailItem>
          <DetailItem label="当前仓库">
            {isNew ? <Select className="w-full" value={currentWarehouse} options={WAREHOUSES.map((value) => ({ label: value, value }))} onChange={setCurrentWarehouse} /> : <Readonly>{currentWarehouse}</Readonly>}
          </DetailItem>
          <DetailItem label={<RequiredLabel>接收仓库</RequiredLabel>}><LookupInput value={receiveWarehouse} placeholder="请选择接收仓库" disabled={!editable} onOpen={() => setWarehouseModalOpen(true)} /></DetailItem>
          <DetailItem label="制单人"><Readonly>{source?.creator || 'admin-系统管理员'}</Readonly></DetailItem>
          <DetailItem label="制单时间"><Readonly>{createdDate}</Readonly></DetailItem>
          <DetailItem label="备注" span={3}>{editable ? <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={remark} onChange={(event) => setRemark(event.target.value)} /> : <Readonly>{remark}</Readonly>}</DetailItem>
        </DetailGrid>
      </Card>

      <Card
        size="small"
        title="移库物资"
        extra={editable ? <Space>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditingLine(null); setLineModalOpen(true); }}>添加物资</Button>
          <Button danger icon={<Trash2 size={14} />} onClick={deleteLines}>删除物资</Button>
          <Button icon={<Upload size={14} />} onClick={() => messageApi.info('Excel导入沿用移库模板')}>Excel导入</Button>
        </Space> : null}
      >
        <div className="mb-3">
          <QueryBar onQuery={() => setLineScan(lineScanDraft)} onReset={() => { setLineScanDraft(''); setLineScan(''); }}>
            <QueryItem label="资产扫描">
              <Input value={lineScanDraft} allowClear placeholder="扫码或手输资产标签号/SN号" onChange={(event) => setLineScanDraft(event.target.value)} onPressEnter={() => setLineScan(lineScanDraft)} />
            </QueryItem>
          </QueryBar>
        </div>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={materialColumns}
          dataSource={visibleLines}
          rowSelection={editable ? { selectedRowKeys: selectedLineKeys, onChange: setSelectedLineKeys, fixed: true, columnTitle: '选择' } : undefined}
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </Card>

      <div className="flex justify-center gap-3">
        {editable && <Button type="primary" onClick={() => onSave(payload())}>保存草稿</Button>}
        <Button onClick={onBack}>返回</Button>
      </div>

      <SelectModal
        open={warehouseModalOpen}
        title="选择接收仓库"
        dataSource={RECEIVE_WAREHOUSES}
        columns={[{ title: '接收仓库', dataIndex: 'name' }]}
        searchFields={[{ label: '接收仓库', name: 'name', dataIndex: 'name' }]}
        onCancel={() => setWarehouseModalOpen(false)}
        onConfirm={(record) => { setReceiveWarehouse(record.name); setWarehouseModalOpen(false); }}
      />

      <MoveItemModal
        key={`${lineModalOpen}-${editingLine?.id || 'new'}-${currentWarehouse}`}
        open={lineModalOpen}
        currentWarehouse={currentWarehouse}
        initialLine={editingLine}
        onCancel={() => { setLineModalOpen(false); setEditingLine(null); }}
        onConfirm={saveLine}
      />
    </Space>
  );
}

export default function MovePage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeTab, setActiveTab] = useState('initiated');
  const [view, setView] = useState('list');
  const [activeRow, setActiveRow] = useState(null);
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [receiveDetailOpen, setReceiveDetailOpen] = useState(false);

  const creators = useMemo(
    () => [...new Set(rows.map((row) => row.creator))].map((name, index) => ({ id: index + 1, name })),
    [rows]
  );

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, filters.documentNo)
    && (!filters.status || row.status === filters.status)
    && includesText(row.creator, filters.creator)
    && inDateRange(row.createdDate, filters.createdFrom, filters.createdTo)
    && rowContainsAsset(row, filters.assetScan)
  )), [rows, filters]);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));

  const deleteRows = () => {
    if (!selectedRowKeys.length) return messageApi.warning('请先选择需要删除的移库单');
    Modal.confirm({
      title: '确认删除所选移库单？',
      content: `共选择 ${selectedRowKeys.length} 条。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const selected = new Set(selectedRowKeys);
        setRows((current) => current.filter((row) => !selected.has(row.id)));
        setSelectedRowKeys([]);
        messageApi.success('已删除所选移库单');
      },
    });
  };

  const openEditor = (row = null) => {
    setActiveRow(row);
    setView('editor');
  };

  const saveDraft = ({ currentWarehouse, receiveWarehouse, remark, lines }) => {
    if (!receiveWarehouse) return messageApi.warning('请选择接收仓库');
    if (activeRow) {
      setRows((current) => current.map((row) => row.id === activeRow.id ? {
        ...row,
        fromWarehouse: currentWarehouse,
        toWarehouse: receiveWarehouse,
        remark,
        lines,
        quantity: lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0),
        status: '草稿',
      } : row));
      messageApi.success('移库单草稿已保存');
      return;
    }
    const id = Math.max(0, ...rows.map((row) => row.id)) + 1;
    const created = {
      id,
      documentNo: `TS-${dayjs().format('YYYYMMDD')}${String(id).padStart(4, '0')}`,
      status: '草稿',
      fromWarehouse: currentWarehouse,
      toWarehouse: receiveWarehouse,
      createdDate: dayjs().format('YYYY-MM-DD'),
      creator: 'admin-系统管理员',
      quantity: lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0),
      remark,
      lines,
    };
    setRows((current) => [created, ...current]);
    setActiveRow(created);
    messageApi.success(`已生成移库单 ${created.documentNo}`);
  };

  if (view === 'editor') {
    return (
      <>
        {contextHolder}
        <MoveEditor source={activeRow} onBack={() => { setView('list'); setActiveRow(null); }} onSave={saveDraft} />
      </>
    );
  }

  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '移库单号', dataIndex: 'documentNo', width: 190, render: (value, row) => <Button type="link" className="px-0" onClick={() => openEditor(row)}>{value}</Button> },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '移出仓库', dataIndex: 'fromWarehouse', width: 320 },
    { title: '移入仓库', dataIndex: 'toWarehouse', width: 320 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>移库</PageTitle>
      {!(activeTab === 'received' && receiveDetailOpen) && (
        <Card size="small">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => { setActiveTab(key); setSelectedRowKeys([]); setReceiveDetailOpen(false); }}
            items={[
              { key: 'initiated', label: '发起单据' },
              { key: 'received', label: '接收单据' },
            ]}
          />
        </Card>
      )}

      {activeTab === 'received' ? (
        <MoveReceiveContent onDetailChange={setReceiveDetailOpen} />
      ) : (
        <>
          <QueryBar
            onQuery={() => { setFilters({ ...draft }); setSelectedRowKeys([]); }}
            onReset={() => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setSelectedRowKeys([]); }}
          >
            <QueryItem label="移库单号"><Input value={draft.documentNo} allowClear placeholder="请输入移库单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
            <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={['草稿', '已完成'].map((value) => ({ label: value, value }))} onChange={(value) => update('status', value)} /></QueryItem>
            <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setCreatorModalOpen(true)} /></QueryItem>
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
            <QueryItem label="资产扫描">
              <Input value={draft.assetScan} allowClear placeholder="扫码或手输资产标签号/SN号" onChange={(event) => update('assetScan', event.target.value)} onPressEnter={() => { setFilters({ ...draft }); setSelectedRowKeys([]); }} />
            </QueryItem>
          </QueryBar>

          <Card size="small" title="移库单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
            <div className="mb-3 flex justify-end">
              <Space>
                <Button type="primary" icon={<Plus size={14} />} onClick={() => openEditor()}>创建</Button>
                <Button danger icon={<Trash2 size={14} />} onClick={deleteRows}>删除</Button>
              </Space>
            </div>
            <Table
              rowKey="id"
              size="small"
              bordered
              columns={columns}
              dataSource={filteredRows}
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, fixed: true }}
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 10, showSizeChanger: true }}
            />
          </Card>
        </>
      )}

      <SelectModal
        open={creatorModalOpen}
        title="选择制单人"
        dataSource={creators}
        columns={[{ title: '名称', dataIndex: 'name' }]}
        searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]}
        onCancel={() => setCreatorModalOpen(false)}
        onConfirm={(record) => { update('creator', record.name); setCreatorModalOpen(false); }}
      />
    </Space>
  );
}
