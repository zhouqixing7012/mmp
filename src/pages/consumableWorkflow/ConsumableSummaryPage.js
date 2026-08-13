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
  Upload,
  message as antdMessage,
} from 'antd';
import { getConsumableWorkflowState, submitSummary, updateSummary } from '../../services/consumableWorkflowService';

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

function PageHeader({ title, number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
      <Typography.Title level={4} className="mb-0">{title}</Typography.Title>
      {number && <Typography.Text type="secondary">汇总单号：{number}</Typography.Text>}
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
    { title: '物资类别', dataIndex: 'category', width: 140 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 240 },
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

export default function ConsumableSummaryPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [view, setView] = useState('list');
  const [draft, setDraft] = useState(null);
  const [fileList, setFileList] = useState([]);
  const summary = useMemo(
    () => getConsumableWorkflowState().summaries.find((item) => item.status === '草稿' && item.currentNode === 'ES汇总') || null,
    [version]
  );
  const current = summary ? { ...summary, ...(draft || {}) } : null;
  const rows = current?.rows || [];
  const totalQuantity = rows.filter((row) => row.approved).reduce((sum, row) => sum + Number(row.quantity || 0), 0);

  const setRows = (nextRows) => setDraft((state) => ({ ...(state || {}), rows: nextRows }));
  const updateRow = (id, patch) => setRows(rows.map((row) => row.id === id ? { ...row, ...patch } : row));

  const rejectApplicant = (record) => {
    setRows(rows.map((row) => (
      row.applicationId === record.applicationId && row.applicant === record.applicant
        ? { ...row, approved: false }
        : row
    )));
    messageApi.warning(`${record.applicant} 已标记为驳回`);
  };

  const exportApplicationDetails = () => {
    const exportRows = rows.filter((row) => row.approved);
    if (!exportRows.length) {
      messageApi.warning('暂无可导出的申请明细');
      return;
    }
    const headers = ['序号', '部门', '申请单号', '申请人', '物资类别', '物料说明', '采购数量', '预计费用（元）', '申请原因', 'ES建议'];
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
    link.download = `耗材汇总-${summary.id}-申请明细.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    messageApi.success(`已导出 ${exportRows.length} 条申请明细`);
  };

  const save = () => {
    updateSummary(summary.id, {
      summaryDescription: current.summaryDescription,
      projectPurpose: current.projectPurpose,
      rows,
    });
    messageApi.success('耗材汇总草稿已保存');
    setVersion((value) => value + 1);
  };

  const submit = () => {
    updateSummary(summary.id, {
      summaryDescription: current.summaryDescription,
      projectPurpose: current.projectPurpose,
      rows,
    });
    submitSummary(summary.id);
    messageApi.success('耗材汇总已提交至 ES 主管审批');
    setVersion((value) => value + 1);
  };

  if (!summary) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待处理的耗材汇总草稿" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </Space>
    );
  }

  const groupedApplicants = Object.values(rows.reduce((result, row) => {
    const key = `${row.applicant}-${row.applicationId}-${row.department}`;
    if (!result[key]) result[key] = { key, applicant: row.applicant, applicationId: row.applicationId, department: row.department, items: [] };
    result[key].items.push(row);
    return result;
  }, {}));

  const detailColumns = [
    { title: '物资类别', dataIndex: 'category', width: 150 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 240 },
    { title: '采购数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '预计费用（元）', dataIndex: 'estimatedAmount', width: 140, align: 'right', render: money },
    { title: '详细说明', dataIndex: 'detail', width: 220, render: (value) => value || '-' },
    { title: 'ES建议', dataIndex: 'esAdvice', width: 260, render: (value, record) => <Input value={value} onChange={(event) => updateRow(record.id, { esAdvice: event.target.value })} /> },
  ];

  if (view === 'list') {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageHeader title="耗材汇总" />
        <Card size="small">
          <Table
            rowKey="id"
            size="small"
            bordered
            pagination={false}
            dataSource={[summary]}
            columns={[
              { title: '汇总公司', dataIndex: 'company', render: (value) => <Button type="link" size="small" className="px-0" onClick={() => setView('detail')}>{value}</Button> },
              { title: '申请数量', width: 120, align: 'center', render: () => totalQuantity },
              { title: '汇总周期', dataIndex: 'period', width: 220 },
              { title: '操作', width: 100, render: () => <Button type="link" size="small" onClick={() => setView('detail')}>查看</Button> },
            ]}
          />
        </Card>
      </Space>
    );
  }

  if (view === 'detail') {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageHeader title="耗材汇总明细" number={summary.id} />
        {groupedApplicants.map((record) => (
          <Card key={record.key} size="small">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
              <Space wrap>
                <span>申请人：{record.applicant}</span>
                <span>申请单号：{record.applicationId}</span>
                <span>申请部门：{record.department}</span>
              </Space>
              <Button danger onClick={() => rejectApplicant(record)}>驳回</Button>
            </div>
            <Table rowKey="id" size="small" bordered columns={detailColumns} dataSource={record.items} pagination={false} scroll={{ x: 1150 }} />
          </Card>
        ))}
        <Card size="small">
          <div className="flex justify-center gap-3">
            <Button type="primary" onClick={() => setView('summary')}>下一步</Button>
            <Button onClick={save}>保存</Button>
            <Button onClick={() => setView('list')}>返回</Button>
          </div>
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader title="耗材汇总申请" number={summary.id} />
      <Card size="small" title="ES汇总说明">
        <TextArea rows={5} maxLength={1000} showCount value={current.summaryDescription} onChange={(event) => setDraft((state) => ({ ...(state || {}), summaryDescription: event.target.value }))} />
      </Card>
      <Card size="small" title="项目用途说明">
        <TextArea rows={3} maxLength={400} showCount value={current.projectPurpose} onChange={(event) => setDraft((state) => ({ ...(state || {}), projectPurpose: event.target.value }))} />
        <div className="mt-2 text-sm text-red-500">备注：此信息会同步至 PR 系统。</div>
      </Card>
      <DepartmentSummaryCard rows={rows} />
      <SummaryApplicationTable rows={rows} onExport={exportApplicationDetails} />
      <Card size="small" title="附件信息">
        <Upload beforeUpload={() => false} fileList={fileList} onChange={({ fileList: next }) => setFileList(next)}>
          <Button>上传附件</Button>
        </Upload>
      </Card>
      <Card size="small">
        <div className="flex justify-center gap-3">
          <Button type="primary" onClick={submit}>提交</Button>
          <Button onClick={() => setView('detail')}>修改</Button>
        </div>
      </Card>
    </Space>
  );
}
