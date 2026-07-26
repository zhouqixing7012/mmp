import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Save, UploadCloud } from 'lucide-react';
import {
  Button,
  Card,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message as antdMessage,
} from 'antd';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import { DEPARTMENT_ASSET_USAGE } from '../../mock/employeeSelfServiceWorkflowMock';
import {
  completePurchaseSummary,
  syncPurchaseSummaries,
  updatePurchaseSummary,
} from '../../services/employeeSelfServiceWorkflowService';

const { TextArea } = Input;

function formatMoney(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildSummaryText(summary) {
  const quantity = summary.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const amount = summary.items.reduce((sum, item) => sum + Number(item.estimatedAmount || 0), 0);
  const month = new Date().toISOString().slice(0, 7).replace('-', '年') + '月';
  return `${month}${summary.department}统一申请已统计完毕，申请采购资产共计 ${quantity} 件，预计采购费用 ${formatMoney(amount)} 元。ES 已核实员工申请需求，目前无可用库存进行调配。`;
}

export default function EmployeePurchaseSummaryPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [summaries, setSummaries] = useState(() => syncPurchaseSummaries());
  const [selectedId, setSelectedId] = useState('');
  const [department, setDepartment] = useState('');
  const [queryDepartment, setQueryDepartment] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [projectPurpose, setProjectPurpose] = useState('');
  const [items, setItems] = useState([]);
  const [fileList, setFileList] = useState([]);

  const selectedSummary = summaries.find((item) => item.id === selectedId);
  const filteredSummaries = useMemo(() => summaries.filter((item) => (
    !queryDepartment || item.department.includes(queryDepartment)
  )), [summaries, queryDepartment]);

  const openSummary = (summary) => {
    setSelectedId(summary.id);
    setSummaryText(summary.summaryText || buildSummaryText(summary));
    setProjectPurpose(summary.projectPurpose || '部门办公设备更新及项目保障');
    setItems(summary.items.map((item) => ({ ...item })));
    setFileList(summary.attachments || []);
  };

  const refresh = () => setSummaries(syncPurchaseSummaries());

  const updateItem = (id, field, value) => {
    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const saveSummary = (submit = false) => {
    if (!selectedSummary) return;
    const rejected = items.filter((item) => item.handling === '驳回' && !item.rejectReason.trim());
    if (rejected.length > 0) {
      messageApi.warning('处理方式为驳回时，驳回原因必填');
      return;
    }
    if (submit && !projectPurpose.trim()) {
      messageApi.warning('请填写项目用途与说明');
      return;
    }

    updatePurchaseSummary(selectedSummary.id, {
      summaryText,
      projectPurpose,
      items,
      attachments: fileList,
      status: submit ? '已汇总' : selectedSummary.status,
      submittedAt: submit ? new Date().toLocaleString('zh-CN', { hour12: false }) : selectedSummary.submittedAt,
    });
    if (submit) completePurchaseSummary(selectedSummary.id);
    refresh();
    messageApi.success(submit ? '汇总申请已提交采购系统' : '汇总内容已保存');
    if (submit) setSelectedId('');
  };

  const listColumns = [
    { title: '汇总单号', dataIndex: 'id', width: 210 },
    { title: '公司', dataIndex: 'company', width: 140 },
    { title: '部门', dataIndex: 'department' },
    {
      title: '汇总数量',
      width: 100,
      align: 'center',
      render: (_, record) => record.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    },
    {
      title: '预计费用（元）',
      width: 150,
      align: 'right',
      render: (_, record) => formatMoney(record.items.reduce((sum, item) => sum + Number(item.estimatedAmount || 0), 0)),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => <Tag color={value === '已汇总' ? 'success' : 'warning'}>{value}</Tag>,
    },
    {
      title: '操作',
      width: 90,
      align: 'center',
      render: (_, record) => <Button type="link" onClick={() => openSummary(record)}>{record.status === '待汇总' ? '处理' : '查看'}</Button>,
    },
  ];

  const itemColumns = [
    { title: '申请人', dataIndex: 'applicant', width: 140 },
    { title: '申请单号', dataIndex: 'applicationId', width: 190 },
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 180 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' },
    { title: '预计费用（元）', dataIndex: 'estimatedAmount', width: 130, align: 'right', render: formatMoney },
    { title: '是否超标', dataIndex: 'overStandard', width: 90, align: 'center', render: (value) => <Tag color={value ? 'error' : 'default'}>{value ? '超标' : '未超标'}</Tag> },
    { title: 'ES 建议', dataIndex: 'esComment', width: 180 },
    {
      title: '处理方式',
      dataIndex: 'handling',
      width: 110,
      render: (value, record) => (
        <Select
          disabled={selectedSummary?.status !== '待汇总'}
          value={value}
          options={['采购', '驳回'].map((item) => ({ label: item, value: item }))}
          onChange={(next) => updateItem(record.id, 'handling', next)}
        />
      ),
    },
    {
      title: '驳回原因',
      dataIndex: 'rejectReason',
      width: 200,
      render: (value, record) => record.handling === '驳回'
        ? <Input disabled={selectedSummary?.status !== '待汇总'} value={value} placeholder="必填" onChange={(event) => updateItem(record.id, 'rejectReason', event.target.value)} />
        : '-',
    },
  ];

  const usageRows = useMemo(() => {
    if (!selectedSummary) return [];
    const purchaseByCategory = items.reduce((map, item) => {
      const category = item.assetDesc.split('.')[0] || item.assetDesc;
      map[category] = (map[category] || 0) + Number(item.quantity || 0);
      return map;
    }, {});
    return DEPARTMENT_ASSET_USAGE
      .filter((item) => Object.prototype.hasOwnProperty.call(purchaseByCategory, item.category))
      .map((item) => ({
        ...item,
        purchaseQuantity: purchaseByCategory[item.category],
        currentAverage: item.currentQuantity / item.employeeCount,
        afterAverage: (item.currentQuantity + purchaseByCategory[item.category]) / item.employeeCount,
      }));
  }, [items, selectedSummary]);

  const usageColumns = [
    { title: '资产类别', dataIndex: 'category', width: 120 },
    { title: '现使用量', dataIndex: 'currentQuantity', width: 100, align: 'center' },
    { title: '现人均用量', dataIndex: 'currentAverage', width: 120, align: 'right', render: (value) => value.toFixed(2) },
    { title: '申请采购量', dataIndex: 'purchaseQuantity', width: 110, align: 'center' },
    { title: '采购后人均用量', dataIndex: 'afterAverage', width: 140, align: 'right', render: (value) => value.toFixed(2) },
    { title: '公司人均用量', dataIndex: 'companyAverage', width: 130, align: 'right', render: (value) => value.toFixed(2) },
  ];

  if (!selectedSummary) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <QueryBar
          onQuery={() => setQueryDepartment(department)}
          onReset={() => { setDepartment(''); setQueryDepartment(''); }}
        >
          <QueryItem label="部门">
            <Input value={department} placeholder="请输入部门" onChange={(event) => setDepartment(event.target.value)} />
          </QueryItem>
        </QueryBar>
        <Card title="员工自助新版-汇总采购" extra={<Button onClick={refresh}>刷新待汇总池</Button>}>
          <Table rowKey="id" columns={listColumns} dataSource={filteredSummaries} locale={{ emptyText: <Empty description="暂无待汇总数据" /> }} pagination={{ pageSize: 10 }} />
        </Card>
      </div>
    );
  }

  const readonly = selectedSummary.status !== '待汇总';

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Button icon={<ArrowLeft size={14} />} onClick={() => setSelectedId('')}>返回列表</Button>
        <Card title={`汇总单：${selectedSummary.id}`} size="small" extra={<Tag color={readonly ? 'success' : 'warning'}>{selectedSummary.status}</Tag>}>
          <div className="mb-2 text-sm font-medium">ES 汇总说明</div>
          <TextArea rows={3} disabled={readonly} value={summaryText} onChange={(event) => setSummaryText(event.target.value)} />
          <div className="mb-2 mt-4 text-sm font-medium">项目用途与说明</div>
          <TextArea rows={3} disabled={readonly} value={projectPurpose} onChange={(event) => setProjectPurpose(event.target.value)} />
        </Card>
        <Card title="部门申请明细" size="small">
          <Table rowKey="id" columns={itemColumns} dataSource={items} pagination={false} scroll={{ x: 1600 }} />
        </Card>
        <Card title="部门现资产参考使用量" size="small">
          <Table rowKey="id" columns={usageColumns} dataSource={usageRows} pagination={false} />
        </Card>
        <Card title="附件信息" size="small">
          <Upload
            disabled={readonly}
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: next }) => setFileList(next)}
          >
            <Button icon={<UploadCloud size={14} />} disabled={readonly}>上传附件</Button>
          </Upload>
        </Card>
        {!readonly && (
          <Card size="small">
            <div className="flex justify-center gap-3">
              <Button icon={<Save size={14} />} onClick={() => saveSummary(false)}>保存</Button>
              <Button type="primary" icon={<CheckCircle2 size={14} />} onClick={() => saveSummary(true)}>提交采购</Button>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
}
