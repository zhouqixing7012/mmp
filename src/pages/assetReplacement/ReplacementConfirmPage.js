import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Empty, Input, QRCode, Space, Table, Typography, message as antdMessage } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { confirmReplacementByEmployee, getAssetReplacementApplications } from '../../services/assetReplacementService';
import { formatDepartment } from '../../utils/displayFormat';

const OLD_SCENE = '旧资产退回';
const NEW_SCENE = '新资产领取';

function SectionTitle({ children }) {
  return <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-1 rounded-sm bg-blue-500" /><span>{children}</span></span>;
}

export default function ReplacementConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [employeeId, setEmployeeId] = useState('');
  const [confirmedResult, setConfirmedResult] = useState(null);
  const applications = useMemo(() => getAssetReplacementApplications(), [version]);
  const requestedScene = location.state?.replacementConfirmScene;
  const requestedId = location.state?.replacementApplicationId;

  const pendingItems = applications.flatMap((application) => {
    const items = [];
    if (application.returnProcess.confirmStatus === '待确认') items.push({ application, scene: OLD_SCENE });
    if (application.issueProcess.confirmStatus === '待确认') items.push({ application, scene: NEW_SCENE });
    return items;
  });
  const pending = pendingItems.find((item) => item.application.id === requestedId && item.scene === requestedScene)
    || pendingItems.find((item) => item.scene === requestedScene)
    || pendingItems[0]
    || null;
  const current = pending || confirmedResult;

  if (!current) {
    return <Card size="small">{contextHolder}<Empty description="暂无待确认的资产更换任务" /></Card>;
  }

  const { application, scene } = current;
  const isReturn = scene === OLD_SCENE;
  const asset = isReturn ? application.oldAsset : application.newAsset;
  const confirmed = Boolean(confirmedResult);
  const columns = isReturn
    ? [
      { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
      { title: '资产标签号', dataIndex: 'assetTag', width: 170 },
      { title: '资产说明', dataIndex: 'assetDesc', width: 260 },
      { title: '配置', dataIndex: 'config', width: 300, render: (value) => value || '-' },
      { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value) => value || 1 },
      { title: '更换原因', dataIndex: 'reason', width: 240 },
      { title: '使用说明', dataIndex: 'usageNote', width: 240 },
    ]
    : [
      { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
      { title: '资产标签号', dataIndex: 'assetTag', width: 170 },
      { title: '资产说明', dataIndex: 'assetDesc', width: 260 },
      { title: '配置', dataIndex: 'config', width: 300, render: (value) => value || '-' },
      { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value) => value || 1 },
      { title: '使用说明', dataIndex: 'usageNote', width: 260 },
    ];
  const dataSource = asset ? [{
    ...asset,
    reason: application.reason || '-',
    usageNote: isReturn ? (application.returnProcess.usageNote || '-') : (application.issueProcess.usageNote || '-'),
  }] : [];

  const confirm = (method, id) => {
    if (!pending) return;
    const targetId = id || employeeId.trim();
    if (!targetId) return messageApi.warning('请输入员工工号');
    if (targetId !== application.applicant.id) return messageApi.error('员工工号不匹配！');
    confirmReplacementByEmployee(application.id, scene, method);
    setConfirmedResult({ application, scene, method, time: new Date().toLocaleString('zh-CN', { hour12: false }) });
    setVersion((value) => value + 1);
    setEmployeeId('');
    messageApi.success(isReturn ? '退库确认成功' : '领用确认成功');
  };

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">员工资产确认</Typography.Title>
          <Typography.Text type="secondary">申请单号：{application.id}</Typography.Text>
        </div>
        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="申请人">{application.applicant.id}-{application.applicant.name}</DetailItem>
            <DetailItem label="部门" span={2}>{formatDepartment(application.applicant.department)}</DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title={<SectionTitle>{isReturn ? '退库资产明细' : '待发放资产明细'}</SectionTitle>}>
          <Table rowKey="assetTag" size="small" bordered columns={columns} dataSource={dataSource} pagination={false} scroll={{ x: isReturn ? 1370 : 1150 }} />
        </Card>
        <Card size="small" title={<SectionTitle>确认提示及保管职责</SectionTitle>}>
          <Typography.Paragraph type="danger" strong className="mb-0">
            {isReturn ? '提示：请核对退库资产明细后完成刷卡或扫码确认。' : '提示：请核对待发放资产明细后完成刷卡或扫码确认。'}
          </Typography.Paragraph>
          {!isReturn && (
            <Typography.Paragraph type="danger" className="mb-0 mt-2">
              <strong>保管职责：</strong>领用人须承担妥善保管物资的责任，除自然损耗外，不得人为损坏或者疏于维护，否则承担相应的赔偿责任。应公司需要，领用人应当配合及时调换或归还借用物资，如延迟甚至拒绝交还公司物资，公司保留采取进一步手段的权利，包括但不限于留置领用人工资、奖金或者其他个人物资。
            </Typography.Paragraph>
          )}
        </Card>
        <Card size="small" title={<SectionTitle>刷卡/扫码确认</SectionTitle>}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <Space.Compact className="w-full max-w-xl">
              <Input value={employeeId} disabled={confirmed} placeholder="请刷员工卡或录入员工工号" onChange={(event) => setEmployeeId(event.target.value)} onPressEnter={() => confirm('刷卡确认')} />
              <Button type="primary" disabled={confirmed} onClick={() => confirm('刷卡确认')}>确认</Button>
            </Space.Compact>
            <button type="button" disabled={confirmed} className="border-0 bg-transparent" onClick={() => confirm('狐小e扫码确认', application.applicant.id)}>
              <QRCode value={`${application.id}-${scene}`} size={168} bordered={false} />
            </button>
          </div>
          {confirmed && <Alert className="mt-4" type="success" showIcon message={isReturn ? '退库确认成功，可返回办理页执行入库' : '领用确认成功，可返回办理页执行出库'} />}
          {confirmed && (
            <div className="mt-4"><StatusTag value="已确认" type="business" /> {confirmedResult.method} · {confirmedResult.time}</div>
          )}
        </Card>
        <div className="flex justify-center"><Button onClick={() => navigate('/yewurules', { state: { workspace: '资产更换办理' } })}>返回</Button></div>
      </Space>
    </>
  );
}
