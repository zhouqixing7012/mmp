import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Input, QRCode, Space, Table, Typography, message as antdMessage } from 'antd';
import { assetClaimApplication, assetClaimNotice } from '../mock/assetClaimMock';

export default function EmployeeAssetClaimConfirm() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [cardNo, setCardNo] = useState('');
  const application = assetClaimApplication;
  const applicantName = application.applicant.includes('-')
    ? application.applicant.split('-').slice(1).join('-')
    : application.applicant;

  const rows = useMemo(() => [{
    key: '1',
    index: 1,
    tag: application.asset.tag,
    description: application.asset.description,
    configuration: application.asset.configuration,
    applyQuantity: application.asset.quantity,
    claimQuantity: application.asset.quantity,
    purpose: application.asset.purpose,
    usageDescription: application.asset.usageDescription || '-',
  }], [application]);

  const columns = [
    { title: '行号', dataIndex: 'index', width: 70, align: 'center' },
    { title: '资产标签号', dataIndex: 'tag', width: 180 },
    { title: '物资说明', dataIndex: 'description' },
    { title: '配置', dataIndex: 'configuration' },
    { title: '申请数量', dataIndex: 'applyQuantity', width: 100, align: 'center' },
    { title: '领用数量', dataIndex: 'claimQuantity', width: 100, align: 'center' },
    { title: '资产用途', dataIndex: 'purpose', width: 140 },
    { title: '使用说明', dataIndex: 'usageDescription' },
  ];

  const handleConfirm = () => {
    if (!cardNo.trim()) {
      messageApi.warning('请先输入员工卡号');
      return;
    }
    messageApi.success('刷卡领用确认成功');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Card
        title="员工领用确认"
        extra={<Button onClick={() => window.history.back()}>返回</Button>}
      >
        <Card type="inner" title="领用人信息" className="mb-4">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="使用人">{application.applicant}</Descriptions.Item>
            <Descriptions.Item label="部门">{application.department}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card type="inner" title="领用物资明细" className="mb-4">
          <Table rowKey="key" columns={columns} dataSource={rows} pagination={false} size="small" />
        </Card>

        <Alert
          type="warning"
          showIcon
          message={`${applicantName}，特此刷卡确认`}
          className="mb-4"
        />

        <div className="grid grid-cols-[minmax(0,1fr)_160px] gap-8 items-start">
          <div>
            <Space align="center" size="middle" className="mb-4">
              <Typography.Text strong>刷卡领用确认：</Typography.Text>
              <Input
                value={cardNo}
                onChange={(event) => setCardNo(event.target.value)}
                onPressEnter={handleConfirm}
                placeholder="请输入员工卡号"
                style={{ width: 280 }}
              />
              <Button type="primary" onClick={handleConfirm}>确认领用</Button>
            </Space>
            <Typography.Paragraph type="danger" className="leading-7">
              <Typography.Text strong type="danger">保管职责：</Typography.Text>
              {assetClaimNotice}
            </Typography.Paragraph>
          </div>
          <div className="flex flex-col items-center gap-2">
            <QRCode value={`asset-claim:${application.applicationNo}:${application.asset.tag}`} size={140} />
            <Typography.Text type="secondary">扫码查看领用单</Typography.Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
