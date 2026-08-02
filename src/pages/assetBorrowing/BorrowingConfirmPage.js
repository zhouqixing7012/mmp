import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  QRCode,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import { BORROW_CUSTODY_TEXT } from '../../mock/assetBorrowingMock';
import {
  getBorrowingApplicationByNode,
  updateAssetBorrowingApplication,
} from '../../services/assetBorrowingService';
import { nowText } from './utils';

export default function BorrowingConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getBorrowingApplicationByNode('员工确认'));
  const [custodyAccepted, setCustodyAccepted] = useState(false);
  const [identityValue, setIdentityValue] = useState('');
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const confirmMethod = application?.confirmation?.method || application?.confirmMethod || '狐小e扫码确认';

  const confirm = () => {
    if (!application) return;
    if (!custodyAccepted) {
      messageApi.warning('请阅读并同意资产保管职责。');
      return;
    }
    if (confirmMethod !== '狐小e扫码确认' && identityValue.trim() !== application.applicant.id) {
      messageApi.error('当前确认人员与借用申请人不一致，无法完成确认。');
      return;
    }

    setSubmitting(true);
    try {
      const confirmedAt = nowText();
      updateAssetBorrowingApplication(application.id, (record) => ({
        ...record,
        currentNode: '库管员发放',
        confirmation: {
          status: '已确认',
          method: confirmMethod,
          confirmedBy: `${record.applicant.id}-${record.applicant.name}`,
          confirmedAt,
        },
        approvalHistory: [
          ...record.approvalHistory,
          { node: '员工确认', person: `${record.applicant.id}-${record.applicant.name}`, status: '已确认', time: confirmedAt, comment: confirmMethod },
        ],
      }));
      setCompleted(true);
      setApplication(null);
      messageApi.success('借用确认成功，已通知库管员执行出库。');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: '资产标签号', width: 170, render: (_, record) => record.matchedAsset?.assetTag || '-' },
    { title: '资产说明', dataIndex: 'assetDesc', width: 230 },
    { title: '配置', dataIndex: 'config', width: 230 },
    { title: 'SN号', width: 150, render: (_, record) => record.matchedAsset?.sn || '-' },
    { title: '借用开始日期', dataIndex: 'startDate', width: 140 },
    { title: '借用结束日期', dataIndex: 'endDate', width: 140 },
    { title: '升级耗材信息', width: 220, render: (_, record) => record.matchedAsset?.upgradeConsumables?.join('；') || '-' },
  ];

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        {contextHolder}
        <Card>
          {completed ? (
            <Alert type="success" showIcon message="借用确认已完成" description="库管员可返回借用发放页面执行出库。" />
          ) : (
            <Empty description="暂无待确认的资产借用单" />
          )}
          <div className="mt-4 flex justify-center"><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">员工借用确认</Typography.Title>
          <Typography.Text type="secondary">借用单号：{application.id}</Typography.Text>
        </div>

        <Alert type="info" showIcon message={`申请人：${application.applicant.name}（${application.applicant.id}）`} description={`确认方式：${confirmMethod}`} />

        <Card title="借用资产信息" size="small">
          <Table rowKey="id" columns={columns} dataSource={application.details} pagination={false} scroll={{ x: 1250 }} />
        </Card>

        <Card title="资产保管职责" size="small">
          <Typography.Paragraph>{BORROW_CUSTODY_TEXT}</Typography.Paragraph>
          <Checkbox checked={custodyAccepted} onChange={(event) => setCustodyAccepted(event.target.checked)}>
            我已阅读并同意资产保管职责
          </Checkbox>
        </Card>

        <Card title={confirmMethod} size="small">
          <div className="flex min-h-52 flex-col items-center justify-center gap-4">
            {confirmMethod === '狐小e扫码确认' ? (
              <>
                <QRCode value={`asset-borrowing:${application.id}:${application.applicant.id}`} size={160} />
                <Typography.Text type="secondary">请申请人使用本人狐小e扫描二维码</Typography.Text>
              </>
            ) : (
              <Input
                style={{ width: 320 }}
                value={identityValue}
                placeholder={confirmMethod === '刷卡确认' ? '请刷员工卡或输入读卡结果' : '请输入申请人工号'}
                onChange={(event) => setIdentityValue(event.target.value)}
              />
            )}
          </div>
        </Card>

        <div className="flex justify-center gap-3 rounded-lg bg-white px-5 py-4 shadow-sm">
          <Button type="primary" icon={<CheckCircle2 size={14} />} loading={submitting} onClick={confirm}>确认借用</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '借用发放' } })}>取消</Button>
        </div>
      </Space>
    </div>
  );
}
