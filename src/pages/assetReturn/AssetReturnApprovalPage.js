import React, { useMemo, useState } from 'react';
import { CheckCircle2, Wrench, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  getAssetReturnApplications,
  submitAssetReturnMisDecision,
} from '../../services/assetReturnService';

const { TextArea } = Input;

function DetailCard({ application }) {
  const asset = application.asset;
  const componentCount = asset.component && asset.component !== '-' ? 1 : 0;

  return (
    <Space direction="vertical" size={16} className="w-full">
      <Card size="small" title="申请人信息">
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="申请人">{application.applicant.id}-{application.applicant.name}</Descriptions.Item>
          <Descriptions.Item label="申请时间">{application.applyTime}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{application.applicant.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{application.applicant.email}</Descriptions.Item>
          <Descriptions.Item label="部门" span={2}>{application.applicant.department}</Descriptions.Item>
          <Descriptions.Item label="退库类型">{application.returnType}</Descriptions.Item>
          <Descriptions.Item label="退库原因">{application.reason || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title="资产信息">
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="资产说明">{asset.assetDesc}</Descriptions.Item>
          <Descriptions.Item label="SN号">{asset.sn || '-'}</Descriptions.Item>
          <Descriptions.Item label="资产标签号">{asset.assetTag}</Descriptions.Item>
          <Descriptions.Item label="数量">{asset.quantity || 1}</Descriptions.Item>
          <Descriptions.Item label="资产状态">{asset.status || '-'}</Descriptions.Item>
          <Descriptions.Item label="资产小类">{asset.subCategory || '-'}</Descriptions.Item>
          <Descriptions.Item label="资产大类">{asset.category || '-'}</Descriptions.Item>
          <Descriptions.Item label="部件数量">{componentCount}</Descriptions.Item>
          <Descriptions.Item label="配置">{asset.config || '-'}</Descriptions.Item>
          <Descriptions.Item label="城市">{asset.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="启用日期">{asset.enabledDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="建筑">{asset.building || '-'}</Descriptions.Item>
          <Descriptions.Item label="楼层">{asset.floor || '-'}</Descriptions.Item>
          <Descriptions.Item label="备注">{asset.note || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}

export default function AssetReturnApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const [misResult, setMisResult] = useState('鉴定通过');
  const [misDescription, setMisDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const applications = useMemo(() => getAssetReturnApplications(), [version]);
  const selected = applications.find((item) => item.status === '处理中' && item.currentNode === 'MIS鉴定') || null;

  const submit = (decision) => {
    if (!selected) return;
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时请填写审批意见');
      return;
    }
    if (decision === '同意' && misResult !== '鉴定通过') {
      messageApi.warning('鉴定结果为鉴定通过时方可同意');
      return;
    }
    if (decision === '驳回' && misResult !== '鉴定不通过') {
      messageApi.warning('鉴定结果为鉴定不通过时方可驳回');
      return;
    }
    if (misResult === '鉴定不通过' && !misDescription.trim()) {
      messageApi.warning('鉴定不通过时请填写鉴定说明');
      return;
    }

    setLoading(true);
    try {
      submitAssetReturnMisDecision(selected.id, {
        result: misResult,
        description: misDescription.trim(),
        decision,
        comment: comment.trim(),
      });
      messageApi.success(decision === '同意' ? '鉴定已通过' : '退库申请已驳回');
      setComment('');
      setMisDescription('');
      setMisResult('鉴定通过');
      setVersion((value) => value + 1);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selected) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          <Empty description="暂无MIS鉴定待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  const historyColumns = [
    { title: '审批环节', dataIndex: 'node', width: 160 },
    { title: '申请人/审批人', dataIndex: 'person', width: 220 },
    { title: '代理人', width: 120, render: () => '-' },
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (value) => {
        const color = value === '已驳回' ? 'error' : value === '待审批' ? 'warning' : value === '已同意' || value === '已提交' ? 'success' : 'default';
        return <Tag color={color}>{value}</Tag>;
      },
    },
    { title: '审批时间', dataIndex: 'time', width: 180 },
    { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">MIS 鉴定</Typography.Title>
          <Typography.Text type="secondary">退库单号：{selected.id}</Typography.Text>
        </div>

        <DetailCard application={selected} />

        <Card size="small" title="MIS 鉴定处理">
          <div>
            <Typography.Text strong><span className="text-red-500">*</span> 鉴定结果：</Typography.Text>
            <Radio.Group
              className="ml-4"
              value={misResult}
              options={['鉴定通过', '鉴定不通过'].map((value) => ({ label: value, value }))}
              onChange={(event) => setMisResult(event.target.value)}
            />
          </div>
          <div className="mt-4">
            <Typography.Text strong>鉴定说明：</Typography.Text>
            <TextArea
              className="mt-2"
              rows={3}
              maxLength={400}
              showCount
              value={misDescription}
              onChange={(event) => setMisDescription(event.target.value)}
            />
          </div>
        </Card>

        <Card size="small" title="审批信息">
          <Table
            rowKey={(record, index) => `${record.node}-${record.time}-${index}`}
            columns={historyColumns}
            dataSource={selected.history || []}
            pagination={false}
            size="small"
            bordered
          />
          <div className="mt-4">
            <Typography.Text strong>审批意见</Typography.Text>
            <TextArea
              className="mt-2"
              rows={3}
              maxLength={400}
              showCount
              value={comment}
              placeholder="同意时非必填，驳回时必填"
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" icon={<CheckCircle2 size={14} />} loading={loading} onClick={() => submit('同意')}>鉴定通过</Button>
            <Button danger icon={<XCircle size={14} />} loading={loading} onClick={() => submit('驳回')}>鉴定不通过</Button>
            <Button icon={<Wrench size={14} />} onClick={() => messageApi.success('已模拟打开维修记录')}>维修记录</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>
    </div>
  );
}
