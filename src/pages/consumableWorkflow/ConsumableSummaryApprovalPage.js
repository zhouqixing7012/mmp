import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Input,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import { approveSummary, getConsumableWorkflowState } from '../../services/consumableWorkflowService';

const { TextArea } = Input;

function money(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function PageHeader({ number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
      <Typography.Title level={4} className="mb-0">耗材汇总审批</Typography.Title>
      <Typography.Text type="secondary">汇总单号：{number}</Typography.Text>
    </div>
  );
}

function buildDepartmentRows(rows) {
  const grouped = rows.filter((row) => row.approved).reduce((result, row) => {
    const key = row.department || '-';
    if (!result[key]) result[key] = { department: key, quantity: 0, amount: 0 };
    result[key].quantity += Number(row.quantity || 0);
    result[key].amount += Number(row.estimatedAmount || 0);
    return result;
  }, {});
  return Object.values(grouped).map((row, index) => ({ ...row, id: `${row.department}-${index}`, index: index + 1 }));
}

function DepartmentSummaryCard({ rows }) {
  const dataSource = buildDepartmentRows(rows);
  const totalQuantity = dataSource.reduce((sum, row) => sum + row.quantity, 0);
  const totalAmount = dataSource.reduce((sum, row) => sum + row.amount, 0);
  const columns = [
    { title: '序号', dataIndex: 'index', width: 80, align: 'center' },
    { title: '部门', dataIndex: 'department' },
    { title: '申请采购数量', dataIndex: 'quantity', width: 160, align: 'center' },
    { title: '预计采购费用（元）', dataIndex: 'amount', width: 180, align: 'right', render: money },
  ];

  return (
    <Card size="small" title="部门汇总信息">
      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2} align="center">合计</Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="center">{totalQuantity}</Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">{money(totalAmount)}</Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div className="mt-2 text-sm text-red-500">此汇总申请中的价格仅供参考，最终采购价格以 PR 单为准。</div>
    </Card>
  );
}

function SummaryApplicationTable({ rows, onExport }) {
  const approvedRows = rows.filter((row) => row.approved);
  const totalQuantity = approvedRows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const totalAmount = approvedRows.reduce((sum, row) => sum + Number(row.estimatedAmount || 0), 0);
  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '部门', dataIndex: 'department', width: 210 },
    { title: '申请单号', dataIndex: 'applicationId', width: 180 },
    { title: '申请人', dataIndex: 'applicant', width: 150 },
    { title: '耗材小类', dataIndex: 'category', width: 140 },
    { title: '耗材说明', dataIndex: 'materialDesc', width: 240 },
    { title: '采购数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '预计费用（元）', dataIndex: 'estimatedAmount', width: 140, align: 'right', render: money },
    { title: '申请原因', dataIndex: 'detail', width: 210, render: (value) => value || '-' },
    { title: 'ES建议', dataIndex: 'esAdvice', width: 170, render: (value) => value || '-' },
  ];

  return (
    <Card
      size="small"
      title="申请明细"
      extra={<Button icon={<Download size={14} />} onClick={onExport}>导出</Button>}
    >
      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={approvedRows}
        pagination={false}
        scroll={{ x: 1550 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={6} align="center">合计</Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="center">{totalQuantity}</Table.Summary.Cell>
            <Table.Summary.Cell index={7} align="right">{money(totalAmount)}</Table.Summary.Cell>
            <Table.Summary.Cell index={8} colSpan={2} />
          </Table.Summary.Row>
        )}
      />
    </Card>
  );
}

const approvalColumns = [
  { title: '审批环节', dataIndex: 'node', width: 150 },
  { title: '申请人/审批人', dataIndex: 'person', width: 190 },
  {
    title: '审批状态',
    dataIndex: 'status',
    width: 120,
    align: 'center',
    render: (value) => <StatusTag value={value} type="business" />,
  },
  { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
  { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
];

export default function ConsumableSummaryApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const summary = useMemo(() => (
    getConsumableWorkflowState().summaries
      .find((item) => item.status === '处理中' && ['ES主管', 'ES总监'].includes(item.currentNode)) || null
  ), [version]);

  const decide = (decision) => {
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }
    approveSummary(summary.id, decision, comment.trim());
    setComment('');
    setVersion((value) => value + 1);
    messageApi.success(decision === '同意' ? '审批已通过并进入下一节点' : '已驳回至 ES 汇总草稿');
  };

  const exportApplicationDetails = () => {
    const exportRows = (summary?.rows || []).filter((row) => row.approved);
    if (!exportRows.length) {
      messageApi.warning('暂无可导出的申请明细');
      return;
    }
    const headers = ['序号', '部门', '申请单号', '申请人', '耗材小类', '耗材说明', '采购数量', '预计费用（元）', '申请原因', 'ES建议'];
    const csvRows = exportRows.map((row, index) => [
      index + 1,
      row.department,
      row.applicationId,
      row.applicant,
      row.category,
      row.materialDesc,
      row.quantity,
      Number(row.estimatedAmount || 0).toFixed(2),
      row.detail || '',
      row.esAdvice || '',
    ]);
    const csv = `\uFEFF${[headers, ...csvRows].map((row) => row.map(csvCell).join(',')).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `耗材汇总审批-${summary.id}-申请明细.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    messageApi.success(`已导出 ${exportRows.length} 条申请明细`);
  };

  if (!summary) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待审批的耗材汇总申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader number={summary.id} />
      <Card size="small" title="ES汇总说明">
        <div className="min-h-[96px] whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
          {summary.summaryDescription || '-'}
        </div>
      </Card>
      <DepartmentSummaryCard rows={summary.rows} />
      <SummaryApplicationTable rows={summary.rows} onExport={exportApplicationDetails} />
      <Card size="small" title="审批信息">
        <Table
          rowKey={(record, index) => `${record.node}-${index}`}
          size="small"
          bordered
          columns={approvalColumns}
          dataSource={summary.history}
          pagination={false}
        />
        <div className="mt-4">
          <Typography.Text strong>审批意见</Typography.Text>
          <TextArea
            className="mt-2"
            rows={3}
            maxLength={400}
            showCount
            value={comment}
            placeholder="同意时可不填写，驳回时必填"
            onChange={(event) => setComment(event.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <Button type="primary" onClick={() => decide('同意')}>同意</Button>
          <Button danger onClick={() => decide('驳回')}>驳回</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
        </div>
      </Card>
    </Space>
  );
}
