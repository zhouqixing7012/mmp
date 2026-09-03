import React, { useMemo, useState } from 'react';
import { CheckCircle2, Download, FileText, Save, UploadCloud } from 'lucide-react';
import { Button, Card, Empty, Input, Space, Table, Upload, message as antdMessage } from 'antd';
import {
  DEPARTMENT_SUMMARY_ROWS,
  NON_OVER_STANDARD_ROWS,
  SUMMARY_TEXT,
  UNIFIED_SUMMARY_APPLICANTS,
  UNIFIED_SUMMARY_LIST,
} from '../mock/unifiedAssetSummaryMock';

const { TextArea } = Input;
const OVER_STANDARD_ROWS = [];
const SIMPLE_EMPTY_TEXT = <div className="py-6 text-center text-sm text-slate-400">无展示数据</div>;
const APPLICANT_DEPARTMENT_MAP = Object.fromEntries(
  UNIFIED_SUMMARY_APPLICANTS.map((record) => [record.applicant, record.department])
);

function formatMoney(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function totalBy(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function PageHeader({ title }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
      <FileText size={20} className="text-blue-600" />
      {title}
    </div>
  );
}

function ReadonlyText({ value }) {
  return (
    <div className="min-h-[96px] whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
      {value || '-'}
    </div>
  );
}

export default function UnifiedAssetApplySummary() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [currentView, setCurrentView] = useState('list');
  const [projectPurpose, setProjectPurpose] = useState('');
  const [summaryText, setSummaryText] = useState(SUMMARY_TEXT.join('\n'));
  const [fileList, setFileList] = useState([]);
  const [detailRows, setDetailRows] = useState(() => (
    UNIFIED_SUMMARY_APPLICANTS.map((record) => ({
      ...record,
      items: record.items.map((item) => ({ ...item })),
    }))
  ));

  const departmentTotals = useMemo(
    () => ({
      quantity: totalBy(DEPARTMENT_SUMMARY_ROWS, 'quantity'),
      amount: totalBy(DEPARTMENT_SUMMARY_ROWS, 'amount'),
    }),
    []
  );

  const nonOverTotals = useMemo(
    () => ({
      quantity: totalBy(NON_OVER_STANDARD_ROWS, 'quantity'),
      amount: totalBy(NON_OVER_STANDARD_ROWS, 'amount'),
    }),
    []
  );

  const openSummaryDetail = () => setCurrentView('detail');

  const listColumns = [
    {
      title: '申请部门',
      dataIndex: 'department',
      render: (value) => <Button type="link" className="p-0" onClick={openSummaryDetail}>{value}</Button>,
    },
    { title: '申请数量', dataIndex: 'quantity', width: 120, align: 'center' },
    { title: '汇总时间', dataIndex: 'summaryTime', width: 180 },
    {
      title: '操作',
      width: 120,
      align: 'center',
      render: () => <Button type="link" onClick={openSummaryDetail}>查看</Button>,
    },
  ];

  const updateEsAdvice = (recordKey, itemKey, value) => {
    setDetailRows((current) => current.map((record) => (
      record.key === recordKey
        ? {
          ...record,
          items: record.items.map((item) => (
            item.key === itemKey ? { ...item, esAdvice: value } : item
          )),
        }
        : record
    )));
  };

  const detailColumns = (recordKey) => [
    { title: '物料小类', dataIndex: 'category', width: 180 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 100 },
    { title: '申请原因', dataIndex: 'detail' },
    { title: '价格', dataIndex: 'price', width: 100, align: 'right', render: formatMoney },
    { title: '是否超标', dataIndex: 'overStandard', width: 80, align: 'center' },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    {
      title: 'ES建议',
      dataIndex: 'esAdvice',
      width: 260,
      render: (value, item) => (
        <TextArea
          value={value}
          rows={3}
          maxLength={400}
          showCount
          placeholder="请输入ES建议，最多400字"
          onChange={(event) => updateEsAdvice(recordKey, item.key, event.target.value)}
        />
      ),
    },
  ];

  const departmentColumns = [
    { title: '序号', dataIndex: 'index', width: 80, align: 'center' },
    { title: '物资类别', dataIndex: 'category' },
    { title: '申请采购数量', dataIndex: 'quantity', width: 140, align: 'center' },
    { title: '预计采购费用(元)', dataIndex: 'amount', width: 180, align: 'right', render: formatMoney },
  ];

  const applicationColumns = (isEditable) => [
    { title: '申请人', dataIndex: 'applicant', width: 150 },
    ...(isEditable ? [{
      title: '申请部门',
      dataIndex: 'department',
      width: 230,
      render: (_, record) => APPLICANT_DEPARTMENT_MAP[record.applicant] || '-',
    }] : []),
    { title: isEditable ? '资产小类' : '物资类别', dataIndex: 'category', width: 180 },
    { title: isEditable ? '资产说明' : '物料说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 120 },
    { title: '采购数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '预计费用(元)', dataIndex: 'amount', width: 150, align: 'right', render: formatMoney },
    { title: isEditable ? '申请原因' : '详细说明', dataIndex: 'detail', width: 180 },
    { title: '在用资产', dataIndex: 'currentAssets', width: 100, align: 'center' },
    { title: 'ES建议', dataIndex: 'esAdvice', width: 120 },
  ];

  const currentUsageColumns = [
    { title: '序号', dataIndex: 'index', width: 80, align: 'center' },
    { title: '物资类别', dataIndex: 'category', width: 180 },
    { title: '现使用量', dataIndex: 'currentQuantity', width: 120, align: 'center' },
    { title: '现人均用量', dataIndex: 'currentPerCapita', width: 130, align: 'center' },
    { title: '申请采购量', dataIndex: 'purchaseQuantity', width: 130, align: 'center' },
    { title: '采购后人均用量', dataIndex: 'afterPurchasePerCapita', width: 150, align: 'center' },
    { title: '公司人均用量', dataIndex: 'companyPerCapita', width: 130, align: 'center' },
  ];

  const handleExport = () => {
    const rows = [...OVER_STANDARD_ROWS, ...NON_OVER_STANDARD_ROWS];
    const headers = ['申请人', '申请部门', '资产小类', '资产说明', '配置', '采购数量', '预计费用(元)', '申请原因', '在用资产', 'ES建议'];
    const csvRows = rows.map((row) => [
      row.applicant,
      APPLICANT_DEPARTMENT_MAP[row.applicant] || '-',
      row.category,
      row.assetDesc,
      row.config,
      row.quantity,
      Number(row.amount || 0).toFixed(2),
      row.detail,
      row.currentAssets,
      row.esAdvice,
    ]);
    const csv = `\uFEFF${[headers, ...csvRows].map((row) => row.map(csvCell).join(',')).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '统一申请汇总-申请明细.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    messageApi.success(`已导出 ${rows.length} 条申请明细`);
  };

  const handleReject = (applicant) => {
    messageApi.warning(`${applicant} 已标记为驳回演示状态`);
  };

  const handleSave = () => {
    messageApi.success('汇总明细已保存');
  };

  const handleSubmit = () => {
    messageApi.success('统一申请汇总已提交至审批');
    setCurrentView('approval');
  };

  const handleApproveSummary = () => {
    messageApi.success('统一申请汇总审批已同意');
  };

  const handleRejectSummary = () => {
    messageApi.warning('统一申请汇总审批已驳回');
  };

  const renderList = () => (
    <Card>
      <Table
        rowKey="id"
        columns={listColumns}
        dataSource={UNIFIED_SUMMARY_LIST}
        pagination={false}
        locale={{ emptyText: <Empty description="暂无汇总数据" /> }}
      />
    </Card>
  );

  const renderDetail = () => (
    <Space direction="vertical" size={16} className="w-full">
      {detailRows.map((record) => (
        <Card key={record.key} size="small">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
            <Space wrap>
              <span>申请人：{record.applicant}</span>
              <span>申请单号：{record.formNo}</span>
              <span>申请部门：{record.department}</span>
            </Space>
            <Button danger onClick={() => handleReject(record.applicant)}>驳回</Button>
          </div>
          <Table rowKey="key" columns={detailColumns(record.key)} dataSource={record.items} pagination={false} size="small" scroll={{ x: 1200 }} />
        </Card>
      ))}

      <Card size="small">
        <div className="flex justify-center gap-3">
          <Button type="primary" onClick={() => setCurrentView('summary')}>下一步</Button>
          <Button icon={<Save size={14} />} onClick={handleSave}>保存</Button>
          <Button onClick={() => setCurrentView('list')}>返回</Button>
        </div>
      </Card>
    </Space>
  );

  const renderDepartmentSummary = () => (
    <Card title="部门汇总信息" size="small">
      <Table
        rowKey="key"
        columns={departmentColumns}
        dataSource={DEPARTMENT_SUMMARY_ROWS}
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2} align="center">合计</Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="center">{departmentTotals.quantity}</Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">{formatMoney(departmentTotals.amount)}</Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div className="mt-2 text-sm text-red-500">此汇总申请中的价格仅供参考，最终采购价格以PR单为准。</div>
    </Card>
  );

  const renderApplicationTables = (isEditable) => (
    <>
      <div className="flex justify-end">
        <Button icon={<Download size={14} />} onClick={handleExport}>导出申请明细</Button>
      </div>

      <Card title="超标申请" size="small">
        <Table rowKey="key" columns={applicationColumns(isEditable)} dataSource={OVER_STANDARD_ROWS} pagination={false} size="small" scroll={{ x: isEditable ? 1480 : 1250 }} locale={{ emptyText: SIMPLE_EMPTY_TEXT }} />
      </Card>

      <Card title="非超标申请" size="small">
        <Table
          rowKey="key"
          columns={applicationColumns(isEditable)}
          dataSource={NON_OVER_STANDARD_ROWS}
          pagination={false}
          size="small"
          scroll={{ x: isEditable ? 1480 : 1250 }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={isEditable ? 5 : 4} align="center">合计</Table.Summary.Cell>
              <Table.Summary.Cell index={isEditable ? 5 : 4} align="center">{nonOverTotals.quantity}</Table.Summary.Cell>
              <Table.Summary.Cell index={isEditable ? 6 : 5} align="right">{formatMoney(nonOverTotals.amount)}</Table.Summary.Cell>
              <Table.Summary.Cell index={isEditable ? 7 : 6} colSpan={3} />
            </Table.Summary.Row>
          )}
        />
      </Card>
    </>
  );

  const renderCurrentUsage = () => (
    <Card title="部门现资产参考使用量" size="small">
      <Table rowKey="key" columns={currentUsageColumns} dataSource={[]} pagination={false} size="small" scroll={{ x: 920 }} locale={{ emptyText: SIMPLE_EMPTY_TEXT }} />
    </Card>
  );

  const renderSummary = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Card title="ES汇总说明" size="small">
        <TextArea rows={6} value={summaryText} onChange={(event) => setSummaryText(event.target.value)} placeholder="请输入ES汇总说明" maxLength={1000} showCount />
      </Card>

      <Card title="项目用途说明" size="small">
        <TextArea rows={4} value={projectPurpose} onChange={(event) => setProjectPurpose(event.target.value)} placeholder="请输入项目用途说明" maxLength={300} showCount />
        <div className="mt-2 text-sm text-red-500">备注：此信息会同步至PR系统。</div>
      </Card>

      {renderDepartmentSummary()}
      {renderApplicationTables(true)}

      <Card title="附件信息" size="small">
        <Upload fileList={fileList} beforeUpload={() => false} onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}>
          <Button icon={<UploadCloud size={14} />}>上传附件</Button>
        </Upload>
      </Card>

      {renderCurrentUsage()}

      <Card size="small">
        <div className="flex justify-center gap-3">
          <Button type="primary" icon={<CheckCircle2 size={14} />} onClick={handleSubmit}>提交</Button>
          <Button onClick={() => setCurrentView('detail')}>修改</Button>
        </div>
      </Card>
    </Space>
  );

  const renderApproval = () => (
    <Space direction="vertical" size={16} className="w-full">
      <Card title="ES汇总说明" size="small">
        <ReadonlyText value={summaryText} />
      </Card>

      <Card title="项目用途说明" size="small">
        <ReadonlyText value={projectPurpose} />
        <div className="mt-2 text-sm text-red-500">备注：此信息会同步至PR系统。</div>
      </Card>

      {renderDepartmentSummary()}
      {renderApplicationTables(false)}

      <Card title="附件信息" size="small">
        {fileList.length > 0 ? (
          <div className="space-y-2 text-sm text-slate-700">
            {fileList.map((file) => <div key={file.uid || file.name}>{file.name}</div>)}
          </div>
        ) : SIMPLE_EMPTY_TEXT}
      </Card>

      {renderCurrentUsage()}

      <Card size="small">
        <div className="flex justify-center gap-3">
          <Button type="primary" onClick={handleApproveSummary}>同意</Button>
          <Button danger onClick={handleRejectSummary}>驳回</Button>
          <Button onClick={() => setCurrentView('summary')}>返回</Button>
        </div>
      </Card>
    </Space>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <PageHeader title={currentView === 'approval' ? '统一申请汇总审批' : '统一申请汇总'} />
      {currentView === 'list' && renderList()}
      {currentView === 'detail' && renderDetail()}
      {currentView === 'summary' && renderSummary()}
      {currentView === 'approval' && renderApproval()}
    </div>
  );
}
