import React, { useMemo, useState } from 'react';
import { Button, Card, Input, QRCode, Space, Table, Typography, message as antdMessage } from 'antd';
import DetailGrid, { DetailItem } from '../components/DetailGrid';
import { assetClaimApplication, assetClaimNotice } from '../mock/assetClaimMock';

export default function EmployeeAssetClaimConfirm() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [cardNo, setCardNo] = useState('');
  const application = assetClaimApplication;

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
    { title: '物资说明', dataIndex: 'description', width: 220 },
    { title: '配置', dataIndex: 'configuration', width: 180 },
    { title: '申请数量', dataIndex: 'applyQuantity', width: 100, align: 'center' },
    { title: '领用数量', dataIndex: 'claimQuantity', width: 100, align: 'center' },
    { title: '资产用途', dataIndex: 'purpose', width: 140 },
    { title: '使用说明', dataIndex: 'usageDescription', width: 180 },
  ];

  const handleConfirm = () => {
    if (!cardNo.trim()) {
      messageApi.warning('请先输入员工卡号');
      return;
    }
    messageApi.success('刷卡领用确认成功');
  };

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">员工领用确认</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.applicationNo}</Typography.Text>
        </div>

        <Card title="领用人信息" size="small">
          <DetailGrid>
            <DetailItem label="使用人">{application.applicant}</DetailItem>
            <DetailItem label="部门" span={2}>{application.department}</DetailItem>
          </DetailGrid>
        </Card>

        <Card title="领用物资明细" size="small">
          <Table
            rowKey="key"
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 1200 }}
          />
        </Card>

        <Card title="确认提示及保管职责" size="small">
          <Typography.Paragraph type="danger" strong className="mb-3">
            提示：我已阅读并确认保管职责说明，特此刷卡确认！
          </Typography.Paragraph>
          <Typography.Paragraph type="danger" className="mb-0 leading-7">
            <strong>保管职责：</strong>{assetClaimNotice}
          </Typography.Paragraph>
        </Card>

        <Card title="刷卡/扫码确认" size="small">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <Typography.Text strong>刷卡领用确认</Typography.Text>
              <Typography.Paragraph type="secondary" className="mt-1 mb-3">
                请刷员工卡，或手工输入员工卡号后确认领用。
              </Typography.Paragraph>
              <Space.Compact className="w-full max-w-xl">
                <Input
                  value={cardNo}
                  onChange={(event) => setCardNo(event.target.value)}
                  onPressEnter={handleConfirm}
                  placeholder="请输入员工卡号"
                />
                <Button type="primary" onClick={handleConfirm}>确认领用</Button>
              </Space.Compact>
            </div>

            <div className="flex flex-col items-center justify-center">
              <QRCode value={`asset-claim:${application.applicationNo}:${application.asset.tag}`} size={156} />
              <Typography.Text strong className="mt-3">狐小 e 扫码确认</Typography.Text>
              <Typography.Text type="secondary" className="mt-1 text-center">使用移动端扫码核对并确认领用信息</Typography.Text>
            </div>
          </div>
        </Card>

        <div className="flex justify-center py-2">
          <Button onClick={() => window.history.back()}>返回</Button>
        </div>
      </Space>
    </>
  );
}
