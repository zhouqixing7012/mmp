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
import StatusTag from '../../components/StatusTag';
import { confirmReturnEmployee, getActiveReturnConfirmation } from '../../services/assetReturnService';
import { formatDepartment } from '../../utils/displayFormat';

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

export default function AssetReturnConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [employeeId, setEmployeeId] = useState('');
  const [, setVersion] = useState(0);
  const application = getActiveReturnConfirmation('asset');

  const confirm = (method, confirmedEmployeeId) => {
    if (!application) return;
    const targetEmployeeId = confirmedEmployeeId || employeeId.trim();
    if (!targetEmployeeId) {
      messageApi.warning('请输入员工工号');
      return;
    }
    try {
      confirmReturnEmployee(targetEmployeeId, method);
      setEmployeeId('');
      messageApi.success('员工退库确认成功，库管员可继续执行入库');
      setVersion((value) => value + 1);
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  if (!application) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待确认的资产退库单" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  const confirmed = application.handling.confirmationStatus === '已确认';
  const asset = application.asset;
  const rows = asset ? [{ ...asset, returnReason: application.reason || '-', usageNote: application.handling.usageNote || '-' }] : [];
  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 170, render: (value) => value || '-' },
    { title: '物资说明', dataIndex: 'assetDesc', width: 250, render: (value) => value || '-' },
    { title: '配置', dataIndex: 'config', width: 280, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value) => value || 1 },
    { title: '退库原因', dataIndex: 'returnReason', width: 220, render: (value) => value || '-' },
    { title: '使用说明', dataIndex: 'usageNote', width: 240, render: (value) => value || '-' },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">员工退库确认</Typography.Title>
          <Typography.Text type="secondary">退库单号：{application.id}</Typography.Text>
        </div>

        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="申请人">{application.applicant.id}-{application.applicant.name}</DetailItem>
            <DetailItem label="部门" span={2}>{formatDepartment(application.applicant.department)}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>退库资产明细</SectionTitle>}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 1320 }}
            locale={{ emptyText: <Empty description="暂无退库资产信息" /> }}
          />
        </Card>

        <Card size="small" title={<SectionTitle>刷卡/扫码确认</SectionTitle>}>
          <Typography.Paragraph type="danger" strong className="mb-4">
            提示：请核对以上退库资产信息，确认无误后通过刷卡或狐小 e 扫码完成退库确认。
          </Typography.Paragraph>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <Typography.Text strong>刷卡退库确认</Typography.Text>
              <Typography.Paragraph type="secondary" className="mt-1 mb-3">
                请刷员工卡，或由管理员录入申请人员工工号后确认。
              </Typography.Paragraph>
              <Space.Compact className="w-full max-w-xl">
                <Input
                  value={employeeId}
                  disabled={confirmed}
                  placeholder="请输入员工工号"
                  onPressEnter={() => confirm('刷卡/工号确认')}
                  onChange={(event) => setEmployeeId(event.target.value)}
                />
                <Button type="primary" disabled={confirmed} onClick={() => confirm('刷卡/工号确认')}>确认退库</Button>
              </Space.Compact>
            </div>

            <div className="flex flex-col items-center justify-center">
              <QRCode value={`asset-return:${application.id}:${application.applicant.id}`} size={156} />
              <Typography.Text strong className="mt-3">狐小 e 扫码确认</Typography.Text>
              <Button
                className="mt-3"
                disabled={confirmed}
                onClick={() => confirm('狐小 e 扫码确认', application.applicant.id)}
              >
                模拟扫码确认
              </Button>
            </div>
          </div>

          {confirmed && (
            <div className="mt-5">
              <DetailGrid>
                <DetailItem label="识别员工">{application.handling.confirmationEmployeeId}-{application.applicant.name}</DetailItem>
                <DetailItem label="确认时间">{application.handling.confirmationTime || '-'}</DetailItem>
                <DetailItem label="确认方式">{application.handling.confirmationMethod || '-'}</DetailItem>
                <DetailItem label="确认结果" span={3}>
                  <StatusTag value="已确认" type="business" />
                </DetailItem>
              </DetailGrid>
              <Alert className="mt-4" type="success" showIcon message="确认成功，库管员可继续执行资产入库" />
            </div>
          )}
        </Card>

        <div className="flex justify-center py-2">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '资产退库办理' } })}>返回</Button>
        </div>
      </Space>
    </>
  );
}
