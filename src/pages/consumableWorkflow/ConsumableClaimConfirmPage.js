import React, { useMemo, useState } from 'react';
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
import { formatDepartment } from '../../utils/displayFormat';
import { confirmConsumableClaim, getConsumableWorkflowState } from '../../services/consumableWorkflowService';

export default function ConsumableClaimConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [employeeId, setEmployeeId] = useState('');
  const [confirmedResult, setConfirmedResult] = useState(null);
  const claim = useMemo(
    () => getConsumableWorkflowState().claims.find((item) => (
      item.status === '处理中'
      && item.currentNode === '员工领用确认'
      && item.confirmationStatus === '待确认'
    )) || null,
    [version]
  );
  const current = claim || confirmedResult;

  const confirm = (method, targetEmployeeId) => {
    if (!claim) return;
    if (!targetEmployeeId) {
      messageApi.warning('请输入员工工号');
      return;
    }
    try {
      const updated = confirmConsumableClaim(claim.id, targetEmployeeId, method);
      setConfirmedResult(updated);
      setEmployeeId('');
      setVersion((value) => value + 1);
      messageApi.success('员工耗材领用确认成功');
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  if (!current) {
    return (
      <>
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待确认的耗材领用任务" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </>
    );
  }

  const confirmed = Boolean(confirmedResult) || current.confirmationStatus === '已确认';
  const responsibility = '领用人确认已收到上述耗材，认同公司耗材仅作为工作用途使用。如无使用需要，应置于公司办公场所保存。领用人应承担妥善保管耗材的责任，除自然损耗外，不得人为损坏或者疏于维护。';
  const detailColumns = [
    {
      title: '行号',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '耗材说明',
      width: 260,
      render: (_, record) => record.item.materialDesc || '-',
    },
    {
      title: '数量',
      width: 90,
      align: 'center',
      render: (_, record) => record.item.quantity || 1,
    },
    {
      title: '耗材标签号',
      width: 160,
      render: (_, record) => record.stock?.assetTag || '-',
    },
    {
      title: '主资产标签号',
      width: 170,
      render: (_, record) => record.item.mainAssetTag || '-',
    },
    {
      title: '主资产说明',
      width: 260,
      render: (_, record) => record.item.mainAssetDesc || '-',
    },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">员工耗材领用确认</Typography.Title>
          <Typography.Text type="secondary">领用单号：{current.id}</Typography.Text>
        </div>

        <Card size="small" title="领用人信息">
          <DetailGrid>
            <DetailItem label="领用人">{current.applicant.id}-{current.applicant.name}</DetailItem>
            <DetailItem label="部门" span={2}>{formatDepartment(current.applicant.department)}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="领用耗材明细">
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={detailColumns}
            dataSource={[current]}
            pagination={false}
            scroll={{ x: 1010 }}
          />
        </Card>

        <Card size="small" title="确认提示及保管职责">
          <Typography.Paragraph type="danger" className="mb-0">
            <strong>保管职责：</strong>{responsibility}
          </Typography.Paragraph>
        </Card>

        <Card size="small" title="刷卡/扫码确认">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <Typography.Text strong>刷卡领用确认</Typography.Text>
              <Typography.Paragraph type="secondary" className="mt-1 mb-3">
                请刷员工卡，或由管理员录入领用人员工工号后确认。
              </Typography.Paragraph>
              <Space.Compact className="w-full max-w-xl">
                <Input
                  value={employeeId}
                  disabled={confirmed}
                  placeholder="请输入员工工号"
                  onPressEnter={() => confirm('刷卡确认', employeeId.trim())}
                  onChange={(event) => setEmployeeId(event.target.value)}
                />
                <Button type="primary" disabled={confirmed} onClick={() => confirm('刷卡确认', employeeId.trim())}>确认</Button>
              </Space.Compact>
            </div>

            <div className="flex flex-col items-center">
              <Typography.Text strong>狐小 e 扫码确认</Typography.Text>
              <button
                type="button"
                disabled={confirmed}
                className="mt-3 rounded-md border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => confirm('狐小e扫码确认', current.applicant.id)}
              >
                <QRCode value={`${current.id}-${current.item.materialDesc}`} size={156} bordered={false} />
              </button>
            </div>
          </div>

          {confirmed && (
            <div className="mt-5">
              <DetailGrid>
                <DetailItem label="识别员工工号">{current.confirmationEmployeeId}（{current.applicant.name}）</DetailItem>
                <DetailItem label="确认时间">{current.confirmationTime || '-'}</DetailItem>
                <DetailItem label="确认方式">{current.confirmationMethod || '-'}</DetailItem>
                <DetailItem label="确认结果" span={3}><StatusTag value="已确认" type="business" /></DetailItem>
              </DetailGrid>
              <Alert className="mt-4" type="success" showIcon message="确认成功，库管员可继续执行耗材出库" />
            </div>
          )}
        </Card>

        <div className="flex justify-center py-2">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '耗材领用' } })}>返回</Button>
        </div>
      </Space>
    </>
  );
}
