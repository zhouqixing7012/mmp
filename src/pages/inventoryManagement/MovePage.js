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
import { Plus, Search, Trash2 } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const { TextArea } = Input;

const INITIAL_ROWS = [
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

const EMPTY_FILTERS = {
  documentNo: '',
  status: '',
  creator: '',
  createdFrom: '',
  createdTo: '',
};

const CURRENT_WAREHOUSE = 'I0001.资产集团总库（新媒体）';
const OTHER_WAREHOUSES = [
  { id: 1, name: 'I2010.资产汽车北京库' },
];

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

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children || '-'}</Typography.Text>;
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input
        value={value}
        readOnly
        placeholder={placeholder}
        className="pointer-events-none"
        suffix={<Search size={14} />}
      />
    </div>
  );
}

function DateFilter({ value, onChange, placeholder }) {
  return (
    <DatePicker
      className="w-full"
      value={value ? dayjs(value) : null}
      format="YYYY-MM-DD"
      placeholder={placeholder}
      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
    />
  );
}

function MoveEditor({ onBack, onSave }) {
  const [otherWarehouse, setOtherWarehouse] = useState('I2010.资产汽车北京库');
  const [remark, setRemark] = useState('');
  const [scanAsset, setScanAsset] = useState('');
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const createdDate = dayjs().format('YYYY-MM-DD');

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
    { title: '移库状态', dataIndex: 'moveStatus', width: 130 },
    { title: '操作', key: 'operation', width: 90, fixed: 'right' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      <PageTitle>移库单</PageTitle>

      <Card size="small" title="移库单信息">
        <DetailGrid columns={3} labelWidth={96}>
          <DetailItem label="移库单号"><Readonly>自动生成</Readonly></DetailItem>
          <DetailItem label="单据类型"><Readonly>移库单</Readonly></DetailItem>
          <DetailItem label="单据状态"><StatusTag value="草稿" /></DetailItem>
          <DetailItem label="移库类型*"><Readonly>当前仓库角色为出库方</Readonly></DetailItem>
          <DetailItem label="对方仓库*">
            <LookupInput value={otherWarehouse} placeholder="请选择对方仓库" onOpen={() => setWarehouseModalOpen(true)} />
          </DetailItem>
          <DetailItem label="当前仓库"><Readonly>{CURRENT_WAREHOUSE}</Readonly></DetailItem>
          <DetailItem label="制单人"><Readonly>admin-系统管理员</Readonly></DetailItem>
          <DetailItem label="制单时间"><Readonly>{createdDate}</Readonly></DetailItem>
          <DetailItem label="备注" span={3}>
            <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={remark} onChange={(event) => setRemark(event.target.value)} />
          </DetailItem>
          <DetailItem label="资产扫描" span={3}>
            <Input value={scanAsset} placeholder="扫描添加资产" onChange={(event) => setScanAsset(event.target.value)} />
          </DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title="移库物资">
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={materialColumns}
          dataSource={[]}
          rowSelection={{ columnTitle: '选择', fixed: true }}
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </Card>

      <div className="flex justify-center gap-3">
        <Button type="primary" onClick={() => onSave({ otherWarehouse, remark })}>保存草稿</Button>
        <Button onClick={onBack}>返回</Button>
      </div>

      <SelectModal
        open={warehouseModalOpen}
        title="选择对方仓库"
        dataSource={OTHER_WAREHOUSES}
        columns={[{ title: '仓库', dataIndex: 'name' }]}
        searchFields={[{ label: '仓库', name: 'name', dataIndex: 'name' }]}
        onCancel={() => setWarehouseModalOpen(false)}
        onConfirm={(record) => setOtherWarehouse(record.name)}
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

  const creators = useMemo(
    () => [...new Set(rows.map((row) => row.creator))].map((name, index) => ({ id: index + 1, name })),
    [rows]
  );
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, filters.documentNo)
    && (!filters.status || row.status === filters.status)
    && includesText(row.creator, filters.creator)
    && inDateRange(row.createdDate, filters.createdFrom, filters.createdTo)
  )), [rows, filters]);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));

  const deleteRows = () => {
    if (!selectedRowKeys.length) {
      messageApi.warning('请先选择需要删除的移库单');
      return;
    }
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

  const saveDraft = ({ otherWarehouse, remark }) => {
    if (!otherWarehouse) {
      messageApi.warning('请选择对方仓库');
      return;
    }
    const id = Math.max(0, ...rows.map((row) => row.id)) + 1;
    const created = {
      id,
      documentNo: `TS-${dayjs().format('YYYYMMDD')}${String(id).padStart(4, '0')}`,
      status: '草稿',
      fromWarehouse: CURRENT_WAREHOUSE,
      toWarehouse: otherWarehouse,
      createdDate: dayjs().format('YYYY-MM-DD'),
      creator: 'admin-系统管理员',
      quantity: 0,
      remark,
    };
    setRows((current) => [created, ...current]);
    setView('list');
    messageApi.success(`已生成移库单 ${created.documentNo}`);
  };

  if (view === 'create') {
    return (
      <>
        {contextHolder}
        <MoveEditor onBack={() => setView('list')} onSave={saveDraft} />
      </>
    );
  }

  const columns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '移库单号', dataIndex: 'documentNo', width: 190 },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: '移出仓库', dataIndex: 'fromWarehouse', width: 320 },
    { title: '移入仓库', dataIndex: 'toWarehouse', width: 320 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 150 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
    { title: '操作', key: 'operation', width: 90, fixed: 'right' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>移库</PageTitle>
      <Card size="small">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'initiated', label: '发起单据' },
            { key: 'received', label: '接收单据' },
          ]}
        />
      </Card>

      {activeTab === 'received' ? (
        <Card size="small"><Empty description="接收单据字段待确认" /></Card>
      ) : (
        <>
          <QueryBar
            onQuery={() => { setFilters({ ...draft }); setSelectedRowKeys([]); }}
            onReset={() => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setSelectedRowKeys([]); }}
          >
            <QueryItem label="移库单号"><Input value={draft.documentNo} allowClear placeholder="请输入移库单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
            <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={['草稿', '已完成'].map((value) => ({ label: value, value }))} onChange={(value) => update('status', value)} /></QueryItem>
            <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setCreatorModalOpen(true)} /></QueryItem>
            <QueryItem label="制单日期从"><DateFilter value={draft.createdFrom} placeholder="开始日期" onChange={(value) => update('createdFrom', value)} /></QueryItem>
            <QueryItem label="制单日期至"><DateFilter value={draft.createdTo} placeholder="结束日期" onChange={(value) => update('createdTo', value)} /></QueryItem>
          </QueryBar>

          <Card size="small" title="移库单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
            <div className="mb-3 flex justify-end">
              <Space>
                <Button type="primary" icon={<Plus size={14} />} onClick={() => setView('create')}>创建</Button>
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
        onConfirm={(record) => update('creator', record.name)}
      />
    </Space>
  );
}
