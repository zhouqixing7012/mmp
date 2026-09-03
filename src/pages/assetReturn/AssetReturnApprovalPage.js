import React, { useMemo, useState } from 'react';
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
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import {
  getAssetReturnApplications,
  submitAssetReturnMisDecision,
} from '../../services/assetReturnService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';

const { TextArea } = Input;
const MIS_NODE = 'MIS鉴定';

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

export default function AssetReturnApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const applications = useMemo(() => getAssetReturnApplications(), [version]);
  const selected = applications.find((item) => item.status === '处理中' && item.currentNode === MIS_NODE) || null;

  const refresh = () => setVersion((value) => value + 1);

  const submit = (decision) => {
    if (!selected) return;
    if (decision === '驳回' && !comment.trim()) {
      messageApi.warning('驳回时审批意见必填');
      return;
    }

    const approved = decision === '同意';
    setLoading(true);
    try {
      submitAssetReturnMisDecision(selected.id, {
        result: approved ? '鉴定通过' : '鉴定不通过',
        description: approved ? '鉴定通过' : comment.trim(),
        decision,
        comment: comment.trim(),
      });
      messageApi.success(approved ? '已同意退库申请' : '退库申请已驳回');
      setComment('');
      refresh();
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selected) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          <Empty description="暂无退库审批待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  const asset = selected.asset;
  const componentCount = asset.component && asset.component !== '-' ? 1 : 0;

  const historyColumns = [
    { title: '审批环节', dataIndex: 'node', width: 160 },
    { title: '申请人/审批人', dataIndex: 'person', width: 220 },
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

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">退库审批</Typography.Title>
          <Typography.Text type="secondary">退库单号：{selected.id}</Typography.Text>
        </div>

        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="申请人">{selected.applicant.id}-{selected.applicant.name}</DetailItem>
            <DetailItem label="申请日期">{formatDateText(selected.applyTime)}</DetailItem>
            <DetailItem label="公司">{selected.applicant.company || '-'}</DetailItem>
            <DetailItem label="办公区">{selected.applicant.officeArea || '-'}</DetailItem>
            <DetailItem label="联系电话">{selected.applicant.phone || '-'}</DetailItem>
            <DetailItem label="邮箱">{selected.applicant.email || '-'}</DetailItem>
            <DetailItem label="部门" span={3}>{formatDepartment(selected.applicant.department)}</DetailItem>
            <DetailItem label="退库原因" span={3}>{selected.reason || '-'}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>退库资产信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="资产标签号">{asset.assetTag || '-'}</DetailItem>
            <DetailItem label="SN号">{asset.sn || '-'}</DetailItem>
            <DetailItem label="数量">{asset.quantity || 1}</DetailItem>
            <DetailItem label="资产大类">{asset.category || '-'}</DetailItem>
            <DetailItem label="资产小类">{asset.subCategory || '-'}</DetailItem>
            <DetailItem label="资产说明">{asset.assetDesc || '-'}</DetailItem>
            <DetailItem label="资产状态"><StatusTag value={asset.status} type="business" /></DetailItem>
            <DetailItem label="部件数量">{componentCount}</DetailItem>
            <DetailItem label="启用日期">{formatDateText(asset.enabledDate)}</DetailItem>
            <DetailItem label="城市">{asset.city || '-'}</DetailItem>
            <DetailItem label="建筑">{asset.building || '-'}</DetailItem>
            <DetailItem label="楼层">{asset.floor || '-'}</DetailItem>
            <DetailItem label="配置" span={3}>{asset.config || '-'}</DetailItem>
            <DetailItem label="备注" span={3}>{asset.note || '-'}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>审批信息</SectionTitle>}>
          <Table
            rowKey={(record, index) => `${record.node}-${record.time}-${index}`}
            columns={historyColumns}
            dataSource={selected.history || []}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 980 }}
          />

          <div className="mt-4">
            <Typography.Text strong>审批意见</Typography.Text>
            <TextArea
              className="mt-2"
              rows={3}
              maxLength={400}
              showCount
              value={comment}
              placeholder="驳回时必填"
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={loading} onClick={() => submit('同意')}>同意</Button>
            <Button danger loading={loading} onClick={() => submit('驳回')}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>
    </>
  );
}
