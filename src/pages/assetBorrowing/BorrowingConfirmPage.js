import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  QRCode,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import { BORROW_CUSTODY_TEXT } from '../../mock/assetBorrowingMock';
import {
  getBorrowingApplicationByNode,
  updateAssetBorrowingApplication,
} from '../../services/assetBorrowingService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';
import { nowText } from './utils';

export default function BorrowingConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getBorrowingApplicationByNode('员工确认'));
  const [identityValue, setIdentityValue] = useState('');
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const confirm = (method) => {
    if (!application) return;
    if (method === '刷卡确认' && identityValue.trim() !== application.applicant.id) {
      messageApi.error('当前刷卡人员与借用申请人不一致，无法完成确认。');
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
          method,
          confirmedBy: `${record.applicant.id}-${record.applicant.name}`,
          confirmedAt,
        },
        approvalHistory: [
          ...record.approvalHistory,
          {
            node: '员工确认',
            person: `${record.applicant.id}-${record.applicant.name}`,
            status: '已确认',
            time: confirmedAt,
            comment: method,
          },
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
    {
      title: '行号',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '资产标签号',
      width: 170,
      render: (_, record) => record.matchedAsset?.assetTag || '-',
    },
    { title: '资产说明', dataIndex: 'assetDesc', width: 240 },
    { title: '配置', dataIndex: 'config', width: 250, render: (value) => value || '-' },
    {
      title: '借用开始时间',
      width: 150,
      render: (_, record) => formatDateText(record.startDate),
    },
    {
      title: '借用结束时间',
      width: 150,
      render: (_, record) => formatDateText(record.endDate),
    },
    {
      title: '资产用途',
      width: 130,
      render: (_, record) => record.issuePurpose || application?.purpose || '-',
    },
    {
      title: '使用说明',
      width: 260,
      render: (_, record) => record.issueUsageNote || application?.usageNote || '-',
    },
  ];

  if (!application) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          {completed ? (
            <Alert type="success" showIcon message="借用确认已完成" description="库管员可返回借用发放页面执行出库。" />
          ) : (
            <Empty description="暂无待确认的资产借用单" />
          )}
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">员工借用确认</Typography.Title>
          <Typography.Text type="secondary">借用单号：{application.id}</Typography.Text>
        </div>

        <Card title="申请人信息" size="small">
          <DetailGrid>
            <DetailItem label="使用人">{application.applicant.id}-{application.applicant.name}</DetailItem>
            <DetailItem label="部门" span={2}>{formatDepartment(application.applicant.department)}</DetailItem>
          </DetailGrid>
        </Card>

        <Card title="借用资产明细" size="small">
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={columns}
            dataSource={application.details}
            pagination={false}
            scroll={{ x: 1420 }}
          />
        </Card>

        <Card title="确认提示及保管职责" size="small">
          <Typography.Paragraph className="mb-3 font-medium text-red-500">
            提示：我已阅读并确认保管职责说明，特此刷卡确认！
          </Typography.Paragraph>
          <Typography.Paragraph className="mb-0 text-red-500">
            <Typography.Text strong className="text-red-500">保管职责：</Typography.Text>
            {BORROW_CUSTODY_TEXT}
          </Typography.Paragraph>
        </Card>

        <Card title="刷卡/扫码确认" size="small">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px] lg:items-center">
            <div>
              <Typography.Text strong>刷卡借用确认</Typography.Text>
              <Typography.Paragraph type="secondary" className="mt-1 mb-3">
                请刷员工卡，或由管理员录入借用人员工工号后确认。
              </Typography.Paragraph>
              <Space.Compact className="w-full max-w-xl">
                <Input
                  value={identityValue}
                  placeholder="请刷员工卡或输入申请人工号"
                  onChange={(event) => setIdentityValue(event.target.value)}
                  onPressEnter={() => confirm('刷卡确认')}
                />
                <Button
                  type="primary"
                  loading={submitting}
                  onClick={() => confirm('刷卡确认')}
                >
                  确认
                </Button>
              </Space.Compact>
            </div>

            <div className="flex flex-col items-center justify-center">
              <QRCode value={`asset-borrowing:${application.id}:${application.applicant.id}`} size={156} />
              <Typography.Text strong className="mt-3">狐小 e 扫码确认</Typography.Text>
              <Button
                className="mt-3"
                loading={submitting}
                onClick={() => confirm('狐小e扫码确认')}
              >
                模拟扫码确认
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex justify-center py-2">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '借用发放' } })}>返回</Button>
        </div>
      </Space>
    </>
  );
}
