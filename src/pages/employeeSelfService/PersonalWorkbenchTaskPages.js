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
} from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';

const { RangePicker } = DatePicker;

const APPROVAL_ROWS = [
  {
    key: '1',
    documentNo: 'AS2608190012',
    documentType: '资产申请',
    status: '处理中',
    approvalNode: '直属5级及以上领导审批',
    approver: '110001-张朝阳',
    applicant: '220784-周琦星',
    applicationDate: '2026-08-19',
    company: '1000.搜狐集团',
    board: '01.集团职能',
    department: '集团总部.采购管理中心',
    assetTag: 'A2024001234',
  },
  {
    key: '2',
    documentNo: 'RT2608180007',
    documentType: '员工退库',
    status: '处理中',
    approvalNode: '直属领导审批',
    approver: '110114-吕艳丰',
    applicant: '213852-孙志强',
    applicationDate: '2026-08-18',
    company: '1000.搜狐集团',
    board: '02.研发板块',
    department: '技术中心.前端架构组',
    assetTag: 'A2024002345',
  },
  {
    key: '3',
    documentNo: 'TR2608170004',
    documentType: '员工转移',
    status: '已完成',
    approvalNode: '接收部门经理审批',
    approver: '111681-章宇东',
    applicant: '210001-李明',
    applicationDate: '2026-08-17',
    company: '1000.搜狐集团',
    board: '03.业务板块',
    department: '财务中心.核算部',
    assetTag: 'A2024003456',
  },
  {
    key: '4',
    documentNo: 'BR2608160003',
    documentType: '员工借用',
    status: '已驳回',
    approvalNode: '直属5级及以上领导审批',
    approver: '110139-张雪梅',
    applicant: '208811-张三',
    applicationDate: '2026-08-16',
    company: '1000.搜狐集团',
    board: '02.研发板块',
    department: '技术中心.后端业务组',
    assetTag: 'A2024004567',
  },
];

const APPLICATION_ROWS = [
  { key: '1', documentType: '资产申请', applicationNo: 'AS2608190012', assetTag: 'A2024001234', applicationDate: '2026-08-19', materialCount: 2, status: '处理中' },
  { key: '2', documentType: '耗材申请', applicationNo: 'CS2608180009', assetTag: 'CON-2023001', applicationDate: '2026-08-18', materialCount: 1, status: '已完成' },
  { key: '3', documentType: '员工借用', applicationNo: 'BR2608170008', assetTag: 'A2024002345', applicationDate: '2026-08-17', materialCount: 1, status: '处理中' },
  { key: '4', documentType: '员工退库', applicationNo: 'RT2608160006', assetTag: 'A2024003456', applicationDate: '2026-08-16', materialCount: 1, status: '已完成' },
  { key: '5', documentType: '员工转移', applicationNo: 'TR2608150004', assetTag: 'A2024004567', applicationDate: '2026-08-15', materialCount: 2, status: '已完成' },
  { key: '6', documentType: '新员工领用', applicationNo: 'NE2608140003', assetTag: 'A2024005678', applicationDate: '2026-08-14', materialCount: 1, status: '已完成' },
  { key: '7', documentType: '合约号码申请', applicationNo: 'CN2608130002', assetTag: '-', applicationDate: '2026-08-13', materialCount: 1, status: '已完成' },
  { key: '8', documentType: '合约号码退库', applicationNo: 'CR2608120005', assetTag: '-', applicationDate: '2026-08-12', materialCount: 1, status: '处理中' },
  { key: '9', documentType: '资产更换', applicationNo: 'RP2608110001', assetTag: 'A2024006789', applicationDate: '2026-08-11', materialCount: 1, status: '已驳回' },
];

const EMPLOYEE_OPTIONS = [
  { label: '220784-周琦星', value: '220784-周琦星' },
  { label: '213852-孙志强', value: '213852-孙志强' },
  { label: '210001-李明', value: '210001-李明' },
  { label: '208811-张三', value: '208811-张三' },
];

const COMPANY_OPTIONS = [
  { label: '1000.搜狐集团', value: '1000.搜狐集团' },
];

const BOARD_OPTIONS = [
  { label: '01.集团职能', value: '01.集团职能' },
  { label: '02.研发板块', value: '02.研发板块' },
  { label: '03.业务板块', value: '03.业务板块' },
];

const DEPARTMENT_OPTIONS = [
  { label: '集团总部.采购管理中心', value: '集团总部.采购管理中心' },
  { label: '技术中心.前端架构组', value: '技术中心.前端架构组' },
  { label: '财务中心.核算部', value: '财务中心.核算部' },
  { label: '技术中心.后端业务组', value: '技术中心.后端业务组' },
];

const DOCUMENT_TYPE_OPTIONS = [
  '资产申请',
  '耗材申请',
  '员工借用',
  '员工退库',
  '员工转移',
  '新员工领用',
  '合约号码申请',
  '合约号码退库',
  '资产更换',
].map((value) => ({ label: value, value }));

const STATUS_OPTIONS = ['已完成', '处理中', '已驳回'].map((value) => ({ label: value, value }));

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

function FlowModal({ open, onClose, record }) {
  if (!record) return null;
  const rows = [
    { key: '1', node: '申请提交', handler: record.applicant || '220784-周琦星', result: '提交', time: `${record.applicationDate || '2026-08-19'} 09:30` },
    { key: '2', node: record.approvalNode || '业务审批', handler: record.approver || '110001-张朝阳', result: record.status === '已驳回' ? '驳回' : record.status === '已完成' ? '同意' : '处理中', time: record.status === '处理中' ? '-' : `${record.applicationDate || '2026-08-19'} 14:20` },
  ];
  return (
    <Modal title="审批流程" open={open} onCancel={onClose} footer={<Button onClick={onClose}>关闭</Button>} width={760}>
      <Table
        rowKey="key"
        size="small"
        bordered
        pagination={false}
        dataSource={rows}
        columns={[
          { title: '审批节点', dataIndex: 'node' },
          { title: '处理人', dataIndex: 'handler', width: 180 },
          { title: '处理结果', dataIndex: 'result', width: 110 },
          { title: '处理时间', dataIndex: 'time', width: 170 },
        ]}
      />
    </Modal>
  );
}

function ApplicationDetailModal({ open, onClose, record, defaultTab = 'detail' }) {
  if (!record) return null;
  const hasApproval = record.documentType !== '新员工领用';
  const detail = (
    <Card size="small" title={<SectionTitle>申请信息</SectionTitle>}>
      <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
        <div><Typography.Text type="secondary">单据类型</Typography.Text><div className="mt-1">{record.documentType}</div></div>
        <div><Typography.Text type="secondary">申请单号</Typography.Text><div className="mt-1">{record.applicationNo}</div></div>
        <div><Typography.Text type="secondary">申请日期</Typography.Text><div className="mt-1">{record.applicationDate}</div></div>
        <div><Typography.Text type="secondary">物资数量</Typography.Text><div className="mt-1">{record.materialCount}</div></div>
        <div><Typography.Text type="secondary">单据状态</Typography.Text><div className="mt-1"><StatusTag type="business" value={record.status} /></div></div>
        <div><Typography.Text type="secondary">资产标签号</Typography.Text><div className="mt-1">{record.assetTag || '-'}</div></div>
      </div>
    </Card>
  );
  const approval = hasApproval ? (
    <Table
      rowKey="key"
      size="small"
      bordered
      pagination={false}
      dataSource={[
        { key: '1', node: '申请提交', handler: '220784-周琦星', result: '提交', time: `${record.applicationDate} 09:30` },
        { key: '2', node: '业务审批', handler: '110001-张朝阳', result: record.status === '已驳回' ? '驳回' : record.status === '已完成' ? '同意' : '处理中', time: record.status === '处理中' ? '-' : `${record.applicationDate} 14:20` },
      ]}
      columns={[
        { title: '审批节点', dataIndex: 'node' },
        { title: '处理人', dataIndex: 'handler', width: 180 },
        { title: '处理结果', dataIndex: 'result', width: 110 },
        { title: '处理时间', dataIndex: 'time', width: 170 },
      ]}
    />
  ) : <Typography.Text type="secondary">新员工领用无审批流程。</Typography.Text>;

  return (
    <Modal title={`${record.documentType}详情`} open={open} onCancel={onClose} footer={<Button onClick={onClose}>关闭</Button>} width={860}>
      <Tabs
        defaultActiveKey={defaultTab}
        items={[
          { key: 'detail', label: '单据详情', children: detail },
          ...(hasApproval ? [{ key: 'approval', label: '审批记录', children: approval }] : []),
        ]}
      />
    </Modal>
  );
}

function ApprovalTaskPage({ mode }) {
  const isPending = mode === 'pending';
  const title = isPending ? '待审批' : '已审批';
  const [draft, setDraft] = useState({ documentType: '', documentNo: '', status: isPending ? '处理中' : '', applicant: '', company: '', board: '', department: '', assetTag: '' });
  const [applied, setApplied] = useState(draft);
  const [flowRecord, setFlowRecord] = useState(null);

  const source = useMemo(() => APPROVAL_ROWS.filter((item) => isPending ? item.status === '处理中' : item.status !== '处理中'), [isPending]);
  const data = useMemo(() => source.filter((item) => {
    if (applied.documentType && item.documentType !== applied.documentType) return false;
    if (applied.documentNo && item.documentNo !== applied.documentNo.trim()) return false;
    if (applied.status && item.status !== applied.status) return false;
    if (applied.applicant && item.applicant !== applied.applicant) return false;
    if (applied.company && item.company !== applied.company) return false;
    if (applied.board && item.board !== applied.board) return false;
    if (applied.department && item.department !== applied.department) return false;
    if (applied.assetTag && item.assetTag !== applied.assetTag.trim()) return false;
    return true;
  }), [applied, source]);

  const reset = () => {
    const next = { documentType: '', documentNo: '', status: isPending ? '处理中' : '', applicant: '', company: '', board: '', department: '', assetTag: '' };
    setDraft(next);
    setApplied(next);
  };

  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '单据编号', dataIndex: 'documentNo', width: 150, render: (value, record) => <Button type="link" size="small" className="px-0" onClick={() => setFlowRecord(record)}>{value}</Button> },
    { title: '单据类型', dataIndex: 'documentType', width: 120 },
    { title: '单据状态', dataIndex: 'status', width: 110, render: (value) => <StatusTag type="business" value={value} /> },
    { title: '审批环节', dataIndex: 'approvalNode', width: 190 },
    { title: '审批人', dataIndex: 'approver', width: 160 },
    { title: '申请人', dataIndex: 'applicant', width: 160 },
    { title: '申请时间', dataIndex: 'applicationDate', width: 120 },
    { title: '公司', dataIndex: 'company', width: 160 },
    { title: '板块', dataIndex: 'board', width: 140 },
    { title: '部门', dataIndex: 'department', width: 220 },
    { title: '操作', fixed: 'right', width: 100, render: (_, record) => <Button type="link" size="small" onClick={() => setFlowRecord(record)}>查看流程</Button> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Typography.Title level={4} className="mb-0">{title}</Typography.Title>
      <Card size="small" title={<SectionTitle>查询条件</SectionTitle>}>
        <QueryBar onQuery={() => setApplied({ ...draft })} onReset={reset}>
          <QueryItem label="单据类型"><Select allowClear placeholder="请选择单据类型" options={DOCUMENT_TYPE_OPTIONS} value={draft.documentType || undefined} onChange={(value) => setDraft((current) => ({ ...current, documentType: value || '' }))} /></QueryItem>
          <QueryItem label="单据编号"><Input allowClear placeholder="请输入单据编号" value={draft.documentNo} onChange={(event) => setDraft((current) => ({ ...current, documentNo: event.target.value }))} /></QueryItem>
          <QueryItem label="单据状态"><Select allowClear={!isPending} disabled={isPending} placeholder="请选择单据状态" options={STATUS_OPTIONS} value={draft.status || undefined} onChange={(value) => setDraft((current) => ({ ...current, status: value || '' }))} /></QueryItem>
          <QueryItem label="申请人"><Select allowClear showSearch placeholder="请选择申请人" options={EMPLOYEE_OPTIONS} value={draft.applicant || undefined} onChange={(value) => setDraft((current) => ({ ...current, applicant: value || '' }))} /></QueryItem>
          <QueryItem label="公司"><Select allowClear placeholder="请选择公司" options={COMPANY_OPTIONS} value={draft.company || undefined} onChange={(value) => setDraft((current) => ({ ...current, company: value || '' }))} /></QueryItem>
          <QueryItem label="板块"><Select allowClear placeholder="请选择板块" options={BOARD_OPTIONS} value={draft.board || undefined} onChange={(value) => setDraft((current) => ({ ...current, board: value || '' }))} /></QueryItem>
          <QueryItem label="部门"><Select allowClear showSearch placeholder="请选择部门" options={DEPARTMENT_OPTIONS} value={draft.department || undefined} onChange={(value) => setDraft((current) => ({ ...current, department: value || '' }))} /></QueryItem>
          <QueryItem label="申请时间"><RangePicker className="w-full" /></QueryItem>
          <QueryItem label="资产标签号"><Input allowClear placeholder="请输入资产标签号" value={draft.assetTag} onChange={(event) => setDraft((current) => ({ ...current, assetTag: event.target.value }))} /></QueryItem>
        </QueryBar>
      </Card>
      <Card size="small" title={<SectionTitle>{isPending ? '审批任务列表' : '审批记录列表'}</SectionTitle>} extra={<Typography.Text type="secondary">共 {data.length} 条</Typography.Text>}>
        <Table rowKey="key" size="small" bordered columns={columns} dataSource={data} scroll={{ x: 1750 }} pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (total) => `共 ${total} 条` }} />
      </Card>
      <FlowModal open={Boolean(flowRecord)} record={flowRecord} onClose={() => setFlowRecord(null)} />
    </Space>
  );
}

function AppliedPage() {
  const [draft, setDraft] = useState({ documentType: '', applicationNo: '', assetTag: '', status: '' });
  const [applied, setApplied] = useState(draft);
  const [detailState, setDetailState] = useState(null);

  const data = useMemo(() => APPLICATION_ROWS.filter((item) => {
    if (applied.documentType && item.documentType !== applied.documentType) return false;
    if (applied.applicationNo && !item.applicationNo.toLowerCase().includes(applied.applicationNo.trim().toLowerCase())) return false;
    if (applied.assetTag && !String(item.assetTag || '').toLowerCase().includes(applied.assetTag.trim().toLowerCase())) return false;
    if (applied.status && item.status !== applied.status) return false;
    return true;
  }), [applied]);

  const reset = () => {
    const next = { documentType: '', applicationNo: '', assetTag: '', status: '' };
    setDraft(next);
    setApplied(next);
  };

  const openDetail = (record, defaultTab = 'detail') => setDetailState({ record, defaultTab });
  const openProgress = (record) => {
    if (record.documentType === '新员工领用') {
      openDetail(record, 'detail');
      return;
    }
    if (record.documentType === '资产申请' || record.documentType === '耗材申请' || record.materialCount > 1) {
      openDetail(record, 'approval');
      return;
    }
    openDetail(record, 'approval');
  };

  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '单据类型', dataIndex: 'documentType', width: 140 },
    { title: '申请单号', dataIndex: 'applicationNo', width: 160, render: (value, record) => <Button type="link" size="small" className="px-0" onClick={() => openDetail(record)}>{value}</Button> },
    { title: '申请日期', dataIndex: 'applicationDate', width: 130 },
    { title: '物资数量', dataIndex: 'materialCount', width: 100, align: 'center' },
    { title: '单据状态', dataIndex: 'status', width: 120, render: (value, record) => <Button type="link" size="small" className="px-0" onClick={() => openDetail(record, 'approval')}><StatusTag type="business" value={value} /></Button> },
    { title: '操作', fixed: 'right', width: 110, render: (_, record) => record.documentType === '新员工领用' ? <Typography.Text type="secondary">-</Typography.Text> : <Button type="link" size="small" onClick={() => openProgress(record)}>查看进度</Button> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Typography.Title level={4} className="mb-0">已申请</Typography.Title>
      <Card size="small" title={<SectionTitle>查询条件</SectionTitle>}>
        <QueryBar onQuery={() => setApplied({ ...draft })} onReset={reset}>
          <QueryItem label="单据类型"><Select allowClear placeholder="请选择单据类型" options={DOCUMENT_TYPE_OPTIONS} value={draft.documentType || undefined} onChange={(value) => setDraft((current) => ({ ...current, documentType: value || '' }))} /></QueryItem>
          <QueryItem label="申请单号"><Input allowClear placeholder="请输入申请单号" value={draft.applicationNo} onChange={(event) => setDraft((current) => ({ ...current, applicationNo: event.target.value }))} /></QueryItem>
          <QueryItem label="资产标签号"><Input allowClear placeholder="请输入资产标签号" value={draft.assetTag} onChange={(event) => setDraft((current) => ({ ...current, assetTag: event.target.value }))} /></QueryItem>
          <QueryItem label="申请日期"><RangePicker className="w-full" /></QueryItem>
          <QueryItem label="单据状态"><Select allowClear placeholder="请选择单据状态" options={STATUS_OPTIONS} value={draft.status || undefined} onChange={(value) => setDraft((current) => ({ ...current, status: value || '' }))} /></QueryItem>
        </QueryBar>
      </Card>
      <Card size="small" title={<SectionTitle>申请单列表</SectionTitle>} extra={<Typography.Text type="secondary">共 {data.length} 条</Typography.Text>}>
        <Table rowKey="key" size="small" bordered columns={columns} dataSource={data} pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 980 }} />
      </Card>
      <ApplicationDetailModal
        open={Boolean(detailState)}
        record={detailState?.record}
        defaultTab={detailState?.defaultTab}
        onClose={() => setDetailState(null)}
      />
    </Space>
  );
}

export function PendingApprovalPage() {
  return <ApprovalTaskPage mode="pending" />;
}

export function ApprovedTasksPage() {
  return <ApprovalTaskPage mode="approved" />;
}

export function AppliedApplicationsPage() {
  return <AppliedPage />;
}
