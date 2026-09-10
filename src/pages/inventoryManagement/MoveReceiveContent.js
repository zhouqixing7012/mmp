import React, { useMemo, useState } from 'react';
import { Button, Card, DatePicker, Input, Modal, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import dayjs from 'dayjs';
import { Search } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const { RangePicker } = DatePicker;

const EMPTY_FILTERS = {
  documentNo: '',
  status: '',
  creator: '',
  createdFrom: '',
  createdTo: '',
  assetScan: '',
};

const RECEIVE_ASSET_DETAIL = {
  id: 1,
  lineNo: 1,
  verification: '已验证',
  moveStatus: '待接收',
  assetTag: '1141100184-V',
  sn: 'SOHUXX156170',
  materialDesc: '惠普.LE2202x显示器',
  availableQty: 1,
  materialGroup: '资产',
  assetClass: 'PC',
  assetSubClass: '显示器-标准显示器',
  assetQty: 1,
  warehouse: 'V00001.集团在途总库（新媒体）',
  area: '',
  location: '',
  applicationBatch: '',
  brand: '惠普',
  model: '',
  config: '',
  unit: '台',
  assetMark: '',
  originalValue: 888.89,
  netValue: 0,
  assetStatus: '在库-待处理',
  company: '114.新媒体',
  plate: '16.视频',
  department: '虚拟组织',
  costCenter: '169001.视频_分摊费用',
  businessLine: '0.*',
  project: '',
  expenseAccount: '114.16.909003.72101...',
  responsiblePerson: 'SOHU05-库房管理员-...',
  city: '北京市',
  building: '搜狐媒体大厦',
  floor: 'B2',
  room: '',
  enabledDate: '2013-03-15',
  printNo: '10018401',
  usage: '',
  remark: '',
  quantity: 1,
  verificationDesc: '1',
  receiveWarehouse: 'I0024.资产网络大厦库（新媒体）',
  outboundDesc: '',
};

const INITIAL_RECEIVE_ROWS = [
  {
    id: 1,
    documentNo: 'TS-202609090004',
    status: '出库待接收',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0024.资产网络大厦库（新媒体）',
    createdDate: '2026-09-09',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '测试',
    lines: [RECEIVE_ASSET_DETAIL],
  },
  { id: 2, documentNo: 'TS-202609090003', status: '已完成', fromWarehouse: 'I0024.资产网络大厦库（新媒体）', toWarehouse: 'I0001.资产集团总库（新媒体）', createdDate: '2026-09-09', creator: '114111-杨芊', quantity: 1, remark: '', lines: [] },
  { id: 3, documentNo: 'TS-202607290008', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）', toWarehouse: 'I0024.资产网络大厦库（新媒体）', createdDate: '2026-07-29', creator: 'admin-系统管理员', quantity: 1, remark: '', lines: [] },
  { id: 4, documentNo: 'TS-202607290007', status: '已完成', fromWarehouse: 'I0024.资产网络大厦库（新媒体）', toWarehouse: 'I0001.资产集团总库（新媒体）', createdDate: '2026-07-29', creator: 'admin-系统管理员', quantity: 1, remark: '', lines: [] },
  { id: 5, documentNo: 'TS-202607290006', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）', toWarehouse: 'I0024.资产网络大厦库（新媒体）', createdDate: '2026-07-29', creator: 'admin-系统管理员', quantity: 2, remark: '', lines: [] },
  { id: 6, documentNo: 'TS-202607290003', status: '出库待接收', fromWarehouse: 'I0001.资产集团总库（新媒体）', toWarehouse: 'I0031.资产北京家具库（新媒体）', createdDate: '2026-07-29', creator: 'admin-系统管理员', quantity: 1, remark: '', lines: [] },
  { id: 7, documentNo: 'TS-202607290001', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）', toWarehouse: 'I0033.资产MIS备货库（新媒体）', createdDate: '2026-07-29', creator: 'admin-系统管理员', quantity: 1, remark: '', lines: [] },
  { id: 8, documentNo: 'TS-202602090009', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）', toWarehouse: 'I0031.资产北京家具库（新媒体）', createdDate: '2026-02-09', creator: 'admin-系统管理员', quantity: 1, remark: '', lines: [] },
  { id: 9, documentNo: 'TS-202602090008', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）', toWarehouse: 'I0033.资产MIS备货库（新媒体）', createdDate: '2026-02-09', creator: 'admin-系统管理员', quantity: 1, remark: '', lines: [] },
  { id: 10, documentNo: 'TS-202602090007', status: '已完成', fromWarehouse: 'I0001.资产集团总库（新媒体）', toWarehouse: 'I0013.资产集团前台库（新媒体）', createdDate: '2026-02-09', creator: 'admin-系统管理员', quantity: 1, remark: '', lines: [] },
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

function rowContainsAsset(row, query) {
  if (!query) return true;
  return (row.lines || []).some((asset) => includesText(asset.assetTag, query) || includesText(asset.sn, query));
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} />} />
    </div>
  );
}

function ReceiveAssetDetailModal({ open, document, asset, onCancel }) {
  if (!document || !asset) return null;
  return (
    <Modal
      open={open}
      title="移库资产明细"
      width={1180}
      footer={<Button onClick={onCancel}>关闭</Button>}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Space direction="vertical" size={16} className="w-full">
        <Card size="small" title="移库单信息">
          <DetailGrid columns={4} labelWidth={110} minWidth={1040}>
            <DetailItem label="移库单号"><Readonly>{document.documentNo}</Readonly></DetailItem>
            <DetailItem label="移库单行号"><Readonly>{asset.lineNo}</Readonly></DetailItem>
            <DetailItem label="出库仓库"><Readonly>{document.fromWarehouse}</Readonly></DetailItem>
            <DetailItem label="出库仓库管理员"><Readonly>{document.creator}</Readonly></DetailItem>
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
            <DetailItem label="仓库"><Readonly>{asset.warehouse}</Readonly></DetailItem>
            <DetailItem label="库区"><Readonly>{asset.area}</Readonly></DetailItem>
            <DetailItem label="货位"><Readonly>{asset.location}</Readonly></DetailItem>
            <DetailItem label="申请批次"><Readonly>{asset.applicationBatch}</Readonly></DetailItem>
            <DetailItem label="品牌"><Readonly>{asset.brand}</Readonly></DetailItem>
            <DetailItem label="规格/型号"><Readonly>{asset.model}</Readonly></DetailItem>
            <DetailItem label="配置"><Readonly>{asset.config}</Readonly></DetailItem>
            <DetailItem label="计量单位"><Readonly>{asset.unit}</Readonly></DetailItem>
            <DetailItem label="资产标记"><Readonly>{asset.assetMark}</Readonly></DetailItem>
            <DetailItem label="原值"><Readonly>{Number(asset.originalValue || 0).toFixed(2)}</Readonly></DetailItem>
            <DetailItem label="净值"><Readonly>{Number(asset.netValue || 0).toFixed(2)}</Readonly></DetailItem>
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
            <DetailItem label="印刷号"><Readonly>{asset.printNo}</Readonly></DetailItem>
            <DetailItem label="用途"><Readonly>{asset.usage}</Readonly></DetailItem>
            <DetailItem label="备注"><Readonly>{asset.remark}</Readonly></DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="移库入库信息">
          <DetailGrid columns={3} labelWidth={110}>
            <DetailItem label="接收仓库"><Readonly>{asset.receiveWarehouse}</Readonly></DetailItem>
            <DetailItem label="移库数量"><Readonly>{asset.quantity}</Readonly></DetailItem>
            <DetailItem label="移库出库说明" span={3}><Readonly>{asset.outboundDesc}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
      </Space>
    </Modal>
  );
}

function ReceiveDetail({ row, onBack, onLinesChange }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [scanAsset, setScanAsset] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [detailAsset, setDetailAsset] = useState(null);
  const [lines, setLines] = useState(row.lines || []);

  const openAsset = (asset) => setDetailAsset(asset);
  const handleScan = () => {
    const value = scanAsset.trim();
    if (!value) return;
    const asset = lines.find((item) => item.assetTag === value || item.sn === value);
    if (!asset) return messageApi.warning('当前移库单中未找到该资产');
    setSelectedKeys([asset.id]);
  };

  const columns = [
    { title: '资产验证', dataIndex: 'verification', width: 110, render: (value) => <StatusTag value={value} /> },
    { title: '移库状态', dataIndex: 'moveStatus', width: 110, render: (value) => <StatusTag value={value} /> },
    { title: '资产标签号', dataIndex: 'assetTag', width: 170, render: (value, asset) => <Button type="link" className="px-0" onClick={() => openAsset(asset)}>{value}</Button> },
    { title: '物资说明', dataIndex: 'materialDesc', width: 220 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 120 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
    { title: '公司', dataIndex: 'company', width: 150 },
    { title: '板块', dataIndex: 'plate', width: 110 },
    { title: '资产标记', dataIndex: 'assetMark', width: 110, render: (value) => value || '-' },
    { title: '启用日期', dataIndex: 'enabledDate', width: 120 },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130, render: (value) => <StatusTag value={value} /> },
    { title: '验证说明', dataIndex: 'verificationDesc', width: 120 },
  ];

  const deriveDocumentStatus = (nextLines) => {
    if (!nextLines.length) return row.status;
    if (nextLines.every((line) => line.moveStatus === '已接收')) return '已完成';
    if (nextLines.every((line) => line.moveStatus === '已驳回')) return '已驳回';
    return '出库待接收';
  };

  const changeSelectedLines = (nextMoveStatus) => {
    if (!selectedKeys.length) return messageApi.warning('请先选择需要处理的物资');
    const selected = new Set(selectedKeys);
    const nextLines = lines.map((line) => selected.has(line.id) ? {
      ...line,
      moveStatus: nextMoveStatus,
      verification: nextMoveStatus === '已接收' ? '已验证' : line.verification,
    } : line);
    const nextStatus = deriveDocumentStatus(nextLines);
    setLines(nextLines);
    setSelectedKeys([]);
    onLinesChange(row.id, nextLines, nextStatus);
    messageApi.success(nextMoveStatus === '已接收' ? '所选物资已确认接收' : '所选物资已驳回');
  };

  const receive = () => {
    Modal.confirm({
      title: `确认接收已选择的 ${selectedKeys.length} 条物资？`,
      okText: '确认接收',
      cancelText: '取消',
      onOk: () => changeSelectedLines('已接收'),
    });
  };

  const reject = () => {
    Modal.confirm({
      title: `确认驳回已选择的 ${selectedKeys.length} 条物资？`,
      okText: '驳回',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => changeSelectedLines('已驳回'),
    });
  };

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <Typography.Title level={3} className="mb-0">移库接收</Typography.Title>

      <Card size="small" title="移库单信息">
        <DetailGrid columns={3} labelWidth={96}>
          <DetailItem label="移库单号"><Readonly>{row.documentNo}</Readonly></DetailItem>
          <DetailItem label="单据类型"><Readonly>移库单</Readonly></DetailItem>
          <DetailItem label="单据状态"><StatusTag value={row.status} /></DetailItem>
          <DetailItem label="出库仓库"><Readonly>{row.fromWarehouse}</Readonly></DetailItem>
          <DetailItem label="接收仓库"><Readonly>{row.toWarehouse}</Readonly></DetailItem>
          <DetailItem label="制单人"><Readonly>{row.creator}</Readonly></DetailItem>
          <DetailItem label="制单时间"><Readonly>{row.createdDate}</Readonly></DetailItem>
          <DetailItem label="备注" span={3}><Readonly>{row.remark}</Readonly></DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title="接收物资" extra={<Typography.Text type="secondary">共 {lines.length} 条</Typography.Text>}>
        <div className="mb-3">
          <QueryBar onQuery={handleScan} onReset={() => { setScanAsset(''); setSelectedKeys([]); }}>
            <QueryItem label="资产扫描">
              <Input value={scanAsset} allowClear placeholder="扫码或手输资产标签号/SN号" onChange={(event) => setScanAsset(event.target.value)} onPressEnter={handleScan} />
            </QueryItem>
          </QueryBar>
        </div>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={lines}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, fixed: true, columnTitle: '选择' }}
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </Card>

      <div className="flex justify-center gap-3">
        {row.status === '出库待接收' && <Button type="primary" onClick={receive}>移库接收确认</Button>}
        {row.status === '出库待接收' && <Button danger onClick={reject}>移库驳回</Button>}
        <Button onClick={onBack}>返回</Button>
      </div>

      <ReceiveAssetDetailModal
        open={Boolean(detailAsset)}
        document={row}
        asset={detailAsset}
        onCancel={() => setDetailAsset(null)}
      />
    </Space>
  );
}

export default function MoveReceiveContent({ onDetailChange }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INITIAL_RECEIVE_ROWS);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState(null);

  const creators = useMemo(
    () => [...new Set(rows.map((row) => row.creator))].map((name, index) => ({ id: index + 1, name })),
    [rows]
  );

  const activeRow = rows.find((row) => row.id === activeRowId) || null;
  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, filters.documentNo)
    && (!filters.status || row.status === filters.status)
    && includesText(row.creator, filters.creator)
    && inDateRange(row.createdDate, filters.createdFrom, filters.createdTo)
    && rowContainsAsset(row, filters.assetScan)
  )), [rows, filters]);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));

  const openDetail = (row) => {
    setActiveRowId(row.id);
    onDetailChange?.(true);
  };

  const closeDetail = () => {
    setActiveRowId(null);
    onDetailChange?.(false);
  };

  const updateLines = (id, lines, status) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, lines, status } : row));
  };

  if (activeRow) {
    return <ReceiveDetail row={activeRow} onBack={closeDetail} onLinesChange={updateLines} />;
  }

  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '移库单号', dataIndex: 'documentNo', width: 190, render: (value, row) => <Button type="link" className="px-0" onClick={() => openDetail(row)}>{value}</Button> },
    { title: '单据状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} /> },
    { title: '移出仓库', dataIndex: 'fromWarehouse', width: 320 },
    { title: '移入仓库', dataIndex: 'toWarehouse', width: 320 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 170 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <QueryBar
        onQuery={() => setFilters({ ...draft })}
        onReset={() => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); }}
      >
        <QueryItem label="移库单号"><Input value={draft.documentNo} allowClear placeholder="请输入移库单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
        <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={['出库待接收', '已完成', '已驳回'].map((value) => ({ label: value, value }))} onChange={(value) => update('status', value)} /></QueryItem>
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
          <Input value={draft.assetScan} allowClear placeholder="扫码或手输资产标签号/SN号" onChange={(event) => update('assetScan', event.target.value)} onPressEnter={() => setFilters({ ...draft })} />
        </QueryItem>
      </QueryBar>

      <Card size="small" title="接收单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

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
