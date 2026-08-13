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

export default function ContractReturnConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [employeeId, setEmployeeId] = useState('');
  const [, setVersion] = useState(0);
  const application = getActiveReturnConfirmation('contract');

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
      messageApi.success('员工合约号码退库确认成功');
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
          <Empty description="暂无待确认的合约号码退库单" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  const confirmed = application.handling.confirmationStatus === '已确认';
  const number = application.contractNumber;
  const detailColumns = [
    { title: '合约号码', dataIndex: 'number', width: 150, render: (value) => value || '-' },
    { title: '标签号', dataIndex: 'assetTag', width: 160, render: (value) => value || '-' },
    { title: '合约号码说明', dataIndex: 'description', width: 220, render: (value) => value || '-' },
    { title: '套餐内容', dataIndex: 'packageContent', width: 260, render: (value) => value || '-' },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      render: (value) => (value === undefined || value === null ? '-' : `¥${value}`),
    },
    {
      title: '号码状态',
      dataIndex: 'status',
      width: 120,
      render: (value) => <StatusTag value={value || '-'} type="business" />,
    },
    { title: '退库原因', dataIndex: 'returnReason', width: 220, render: (value) => value || '-' },
  ];

  const detailData = [{
    ...number,
    id: number.id || application.id,
    returnReason: application.reason || '-',
  }];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">员工合约号码退库确认</Typography.Title>
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
            size="small"
            bordered
            columns={detailColumns}
            dataSource={detailData}
            pagination={false}
            scroll={{ x: 1250 }}
          />
        </Card>

        <Card size="small" title={<SectionTitle>退库确认提示</SectionTitle>}>
          <Typography.Paragraph type="danger" strong className="mb-0">
            提示：我已确认将上述合约号码对应的实体电话卡交还库管员，确认无误后进行刷卡或扫码确认。
          </Typography.Paragraph>
        </Card>

        <Card size="small" title={<SectionTitle>刷卡/扫码确认</SectionTitle>}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <Typography.Text strong>刷卡确认</Typography.Text>
              <Space.Compact className="mt-3 w-full max-w-xl">
                <Input
                  value={employeeId}
                  disabled={confirmed}
                  placeholder="请刷员工卡或由管理员录入员工工号"
                  onPressEnter={() => confirm('刷卡确认')}
                  onChange={(event) => setEmployeeId(event.target.value)}
                />
                <Button type="primary" disabled={confirmed} onClick={() => confirm('刷卡确认')}>确认</Button>
              </Space.Compact>
            </div>

            <div className="flex flex-col items-center">
              <Typography.Text strong>狐小 e 扫码确认</Typography.Text>
              <button
                type="button"
                disabled={confirmed}
                className="mt-3 rounded-md border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => confirm('狐小e扫码确认', application.applicant.id)}
              >
                <QRCode value={`${application.id}-${number.number || ''}`} size={168} bordered={false} />
              </button>
            </div>
          </div>

          {confirmed && (
            <div className="mt-5">
              <DetailGrid>
                <DetailItem label="识别员工工号">
                  {application.handling.confirmationEmployeeId}（{application.applicant.name}）
                </DetailItem>
                <DetailItem label="确认时间">{application.handling.confirmationTime || '-'}</DetailItem>
                <DetailItem label="确认方式">{application.handling.confirmationMethod || '-'}</DetailItem>
                <DetailItem label="确认结果" span={3}>
                  <StatusTag value="已确认" type="business" />
                </DetailItem>
              </DetailGrid>
              <Alert className="mt-4" type="success" showIcon message="确认成功，库管员可继续执行号码入库" />
            </div>
          )}
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '合约号码退库办理' } })}>返回</Button>
        </div>
      </Space>
    </>
  );
}
