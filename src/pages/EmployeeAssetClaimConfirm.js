import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Input, QRCode, Space, Table, Typography, message as antdMessage } from 'antd';
import { BadgeCheck, CreditCard, FileCheck2, PackageCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <PackageCheck size={20} />
            </div>
            <div>
              <Typography.Title level={4} className="mb-0">员工领用确认</Typography.Title>
              <Typography.Text type="secondary">请员工核对领用信息后完成刷卡或扫码确认</Typography.Text>
            </div>
          </div>
          <Typography.Text type="secondary">申请单号：{application.applicationNo}</Typography.Text>
        </div>

        <Card title={<Space><FileCheck2 size={16} />领用人信息</Space>} size="small">
          <Descriptions bordered column={3} size="small">
            <Descriptions.Item label="使用人">{application.applicant}</Descriptions.Item>
            <Descriptions.Item label="公司">{application.company}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{application.phone}</Descriptions.Item>
            <Descriptions.Item label="部门" span={2}>{application.department}</Descriptions.Item>
            <Descriptions.Item label="办公区">{application.officeArea}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title={<Space><PackageCheck size={16} />领用物资明细</Space>} size="small">
          <Table rowKey="key" columns={columns} dataSource={rows} pagination={false} size="small" scroll={{ x: 1200 }} />
        </Card>

        <Alert
          type="warning"
          showIcon
          message="提示：我已阅读并确认保管职责说明，特此刷卡确认！"
        />

        <Card title={<Space><CreditCard size={16} />员工身份确认</Space>} size="small">
          <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-8">
            <div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <Typography.Text strong>刷卡领用确认</Typography.Text>
                <Typography.Paragraph type="secondary" className="mt-1 mb-4">
                  请刷员工卡，或手工输入员工卡号后确认领用。
                </Typography.Paragraph>
                <Space.Compact className="w-full max-w-xl">
                  <Input
                    prefix={<CreditCard size={15} className="text-slate-400" />}
                    value={cardNo}
                    onChange={(event) => setCardNo(event.target.value)}
                    onPressEnter={handleConfirm}
                    placeholder="请输入员工卡号"
                  />
                  <Button type="primary" icon={<BadgeCheck size={15} />} onClick={handleConfirm}>确认领用</Button>
                </Space.Compact>
              </div>

              <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-7 text-red-600">
                <Typography.Text strong type="danger">保管职责：</Typography.Text>
                {assetClaimNotice}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-5">
              <QRCode value={`asset-claim:${application.applicationNo}:${application.asset.tag}`} size={156} />
              <Typography.Text strong className="mt-3">扫码确认领用</Typography.Text>
              <Typography.Text type="secondary" className="mt-1 text-center">使用移动端扫码核对并确认领用信息</Typography.Text>
            </div>
          </div>
        </Card>

        <Card size="small">
          <div className="flex justify-center">
            <Button onClick={() => window.history.back()}>返回</Button>
          </div>
        </Card>
      </Space>
    </div>
  );
}
