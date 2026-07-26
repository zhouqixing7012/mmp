import React, { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
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
import QueryBar, { QueryItem } from '../../components/QueryBar';
import StatusTag from '../../components/StatusTag';
import {
  getEmployeeSelfServiceProgress,
  resetEmployeeSelfServiceProgress,
} from '../../services/employeeSelfServiceProgressService';
import ApplicantInfoCard from './ApplicantInfoCard';
import ApprovalHistoryCard from './ApprovalHistoryCard';
import NotificationRecordsCard from './NotificationRecordsCard';
import ProgressTimelineCard from './ProgressTimelineCard';

const { RangePicker } = DatePicker;

export default function EmployeeMyApplicationsPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [applications, setApplications] = useState(() => getEmployeeSelfServiceProgress());
  const [selectedId, setSelectedId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState();
  const [dateRange, setDateRange] = useState([]);
  const [query, setQuery] = useState({ keyword: '', status: undefined, dateRange: [] });
  const [resetting, setResetting] = useState(false);

  const selectedApplication = applications.find((item) => item.id === selectedId);
  const filteredApplications = useMemo(() => applications.filter((item) => {
    const text = query.keyword.trim().toLowerCase();
    const matchedKeyword = !text
      || item.id.toLowerCase().includes(text)
      || item.materials.some((material) => material.assetDesc.toLowerCase().includes(text));
    const matchedStatus = !query.status || item.status === query.status;
    const matchedDate = query.dateRange.length !== 2
      || (item.applyDate >= query.dateRange[0] && item.applyDate <= query.dateRange[1]);
    return matchedKeyword && matchedStatus && matchedDate;
  }), [applications, query]);

  const refresh = () => setApplications(getEmployeeSelfServiceProgress());

  const handleResetData = () => {
    Modal.confirm({
      title: '确认重置员工自助新版演示数据？',
      content: '申请、审批、配给、汇总、领用、签名和出库记录都会恢复为初始状态。旧版页面数据不会受到影响。',
      okText: '确认重置',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setResetting(true);
        try {
          resetEmployeeSelfServiceProgress();
          setSelectedId('');
          setApplications(getEmployeeSelfServiceProgress());
          messageApi.success('员工自助新版演示数据已重置');
        } finally {
          setResetting(false);
        }
      },
    });
  };

  const listColumns = [
    { title: '申请单号', dataIndex: 'id', width: 200 },
    { title: '申请日期', dataIndex: 'applyDate', width: 120 },
    { title: '物资数量', dataIndex: 'materialCount', width: 100, align: 'center' },
    { title: '当前节点', dataIndex: 'currentNode', width: 210 },
    { title: '任务状态', dataIndex: 'taskStatus', width: 140 },
    {
      title: '单据状态',
      dataIndex: 'status',
      width: 110,
      align: 'center',
      render: (value) => <StatusTag value={value} type="workflow" />,
    },
    {
      title: '操作',
      width: 90,
      align: 'center',
      render: (_, record) => <Button type="link" onClick={() => setSelectedId(record.id)}>查看详情</Button>,
    },
  ];

  const materialColumns = [
    { title: '资产说明', dataIndex: 'assetDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '申请原因', dataIndex: 'reason', width: 120 },
    { title: '申请用途', dataIndex: 'purpose', width: 120 },
    { title: '详细说明', dataIndex: 'detail' },
    {
      title: '个人超标',
      dataIndex: 'overStandard',
      width: 100,
      align: 'center',
      render: (value) => <StatusTag value={value} />,
    },
  ];

  const documentColumns = [
    { title: '关联单号', dataIndex: 'id', width: 230 },
    { title: '单据类型', dataIndex: 'type', width: 150 },
    { title: '来源单号', dataIndex: 'source', width: 220 },
    { title: '状态', dataIndex: 'status', width: 110, render: (value) => <StatusTag value={value} type="workflow" /> },
    { title: '时间', dataIndex: 'time', width: 180 },
  ];

  if (!selectedApplication) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <QueryBar
          onQuery={() => setQuery({ keyword, status, dateRange })}
          onReset={() => {
            setKeyword('');
            setStatus(undefined);
            setDateRange([]);
            setQuery({ keyword: '', status: undefined, dateRange: [] });
          }}
        >
          <QueryItem label="申请单号/资产">
            <Input value={keyword} allowClear placeholder="请输入申请单号或资产说明" onChange={(event) => setKeyword(event.target.value)} />
          </QueryItem>
          <QueryItem label="申请日期">
            <RangePicker
              style={{ width: '100%' }}
              onChange={(_, values) => setDateRange(values?.[0] ? values : [])}
            />
          </QueryItem>
          <QueryItem label="单据状态">
            <Select
              value={status}
              allowClear
              placeholder="请选择"
              options={['处理中', '已完成', '已驳回'].map((item) => ({ label: item, value: item }))}
              onChange={setStatus}
            />
          </QueryItem>
        </QueryBar>
        <Card
          title="员工自助新版-我的申请"
          extra={(
            <Space>
              <Button onClick={refresh}>刷新进度</Button>
              <Button danger icon={<RotateCcw size={14} />} loading={resetting} onClick={handleResetData}>重置演示数据</Button>
            </Space>
          )}
        >
          <Table
            rowKey="id"
            columns={listColumns}
            dataSource={filteredApplications}
            locale={{ emptyText: <Empty description="暂无符合条件的申请" /> }}
            pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Button icon={<ArrowLeft size={14} />} onClick={() => setSelectedId('')}>返回列表</Button>
        <Card
          title={`资产申请单：${selectedApplication.id}`}
          size="small"
          extra={<StatusTag value={selectedApplication.status} type="workflow" />}
        >
          <Descriptions bordered size="small" column={4}>
            <Descriptions.Item label="当前节点">{selectedApplication.currentNode}</Descriptions.Item>
            <Descriptions.Item label="任务状态">{selectedApplication.taskStatus}</Descriptions.Item>
            <Descriptions.Item label="申请数量">{selectedApplication.materialCount}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{selectedApplication.applyDate}</Descriptions.Item>
            <Descriptions.Item label="关联配给单">{selectedApplication.relatedCounts.allocations}</Descriptions.Item>
            <Descriptions.Item label="关联汇总单">{selectedApplication.relatedCounts.summaries}</Descriptions.Item>
            <Descriptions.Item label="关联领用单">{selectedApplication.relatedCounts.claims}</Descriptions.Item>
            <Descriptions.Item label="关联出库单">{selectedApplication.relatedCounts.outbounds}</Descriptions.Item>
          </Descriptions>
        </Card>
        <ApplicantInfoCard applicant={selectedApplication.applicant} applyDate={selectedApplication.applyDate} />
        <Tabs
          defaultActiveKey="progress"
          items={[
            {
              key: 'progress',
              label: '全流程进度',
              children: <ProgressTimelineCard records={selectedApplication.timeline} />,
            },
            {
              key: 'materials',
              label: '申请资产',
              children: (
                <Card size="small">
                  <Table rowKey="id" columns={materialColumns} dataSource={selectedApplication.materials} pagination={false} />
                </Card>
              ),
            },
            {
              key: 'approval',
              label: '审批记录',
              children: <ApprovalHistoryCard records={selectedApplication.approvalHistory || []} />,
            },
            {
              key: 'documents',
              label: '关联单据',
              children: (
                <Card size="small">
                  <Table rowKey={(record) => `${record.type}-${record.id}`} columns={documentColumns} dataSource={selectedApplication.documents} pagination={false} />
                </Card>
              ),
            },
            {
              key: 'notifications',
              label: `通知记录（${selectedApplication.notifications.length}）`,
              children: <NotificationRecordsCard records={selectedApplication.notifications} />,
            },
          ]}
        />
        <Typography.Text type="secondary">
          采购系统和 PR 系统进度在当前演示版本中以汇总单提交状态表示，真实 PO 单号和 PO 状态需由采购系统回传。
        </Typography.Text>
      </Space>
    </div>
  );
}
