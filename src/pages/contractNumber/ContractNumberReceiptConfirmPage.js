import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Empty, Input, QRCode, Space, Table, Typography, message as antdMessage } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { confirmContractNumberReceipt, getEmployeeContractNumberConfirmation } from '../../services/contractNumberAllocationService';
import { formatDepartment } from '../../utils/displayFormat';

const RESPONSIBILITY_TEXT = '领用人确认已收到上述合约号码，认同公司合约号码作为工作用途使用且仅享有使用权。领用人应承担妥善保管合约号码的责任，使用期间严禁转售、借出等，否则将承担包括但不限于上述行为造成的相应赔偿责任。应公司需要时，领用人应当配合及时归还合约号码。如领用人延迟甚至拒绝交还合约号码，公司保留采取进一步手段的权利，包括但不限于留置领用人工资、奖金或者其他个人资产。';

function SectionTitle({ children }) {
  return <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-1 rounded-sm bg-blue-500" /><span>{children}</span></span>;
}

export default function ContractNumberReceiptConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [application, setApplication] = useState(() => getEmployeeContractNumberConfirmation());
  const [confirmedResult, setConfirmedResult] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const current = application || confirmedResult;

  const confirm = (method, confirmedEmployeeId) => {
    if (!application) return;
    try {
      const updated = confirmContractNumberReceipt(application.id, confirmedEmployeeId, method);
      setConfirmedResult(updated);
      setApplication(getEmployeeContractNumberConfirmation());
      setEmployeeId('');
      messageApi.success('合约号码领取确认成功');
    } catch (error) {
      messageApi.error(error.message);
    }
  };

  const confirmByEmployeeId = () => {
    const value = employeeId.trim();
    if (!value) return messageApi.warning('请输入员工工号');
    confirm('刷卡/工号确认', value);
  };

  const rows = useMemo(() => {
    if (!current) return [];
    const number = current.assignedNumber || {};
    const handling = current.warehouseHandling || {};
    return [{
      id: current.id,
      assetTag: number.assetTag || '-',
      contractNumber: number.phoneNumber || number.imei || '-',
      description: number.packageName || '-',
      packageContent: number.packageContent || handling.packageContent || '-',
      applyReason: current.applyReason || '-',
    }];
  }, [current]);

  if (!current) {
    return <>{contextHolder}<Card size="small"><Empty description="暂无待确认的合约号码领取任务" /><div className="mt-4 flex justify-center"><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button></div></Card></>;
  }

  const applicant = current.applicant;
  const confirmed = Boolean(confirmedResult);
  const columns = [
    { title: '标签号', dataIndex: 'assetTag', width: 150 },
    { title: '合约号码', dataIndex: 'contractNumber', width: 170 },
    { title: '合约号码说明', dataIndex: 'description', width: 220 },
    { title: '套餐内容', dataIndex: 'packageContent', width: 260 },
    { title: '申请原因', dataIndex: 'applyReason', width: 280 },
  ];

  return <>{contextHolder}<Space direction="vertical" size={16} className="w-full">
    <div className="flex items-center justify-between"><Typography.Title level={4} className="mb-0">员工合约号码领取确认</Typography.Title><Typography.Text type="secondary">申请单号：{current.id}</Typography.Text></div>
    <Card title={<SectionTitle>领用人信息</SectionTitle>} size="small"><DetailGrid><DetailItem label="使用人">{applicant.id}-{applicant.name}</DetailItem><DetailItem label="联系电话">{applicant.phone || '-'}</DetailItem><DetailItem label="部门">{formatDepartment(applicant.department)}</DetailItem></DetailGrid></Card>
    <Card title={<SectionTitle>领用物资明细</SectionTitle>} size="small"><Table rowKey="id" columns={columns} dataSource={rows} pagination={false} size="small" bordered scroll={{ x: 1080 }} /></Card>
    <Card title={<SectionTitle>保管职责</SectionTitle>} size="small"><Typography.Paragraph type="danger" strong className="mb-3">提示：我已核对并确认领取上述合约号码，已阅读并确认保管职责，特此扫码确认！</Typography.Paragraph><Typography.Text type="danger" strong>保管职责：</Typography.Text><Typography.Paragraph type="danger" className="mt-1 mb-0 leading-7">{RESPONSIBILITY_TEXT}</Typography.Paragraph></Card>
    <Card title={<SectionTitle>刷卡/扫码确认</SectionTitle>} size="small">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center"><div><Typography.Text strong>刷卡领用确认</Typography.Text><Typography.Paragraph type="secondary" className="mt-1 mb-3">请刷员工卡，或由管理员录入领用人员工工号后确认。</Typography.Paragraph><Space.Compact className="w-full max-w-xl"><Input value={employeeId} disabled={confirmed} placeholder="请输入员工工号" onPressEnter={confirmByEmployeeId} onChange={(event) => setEmployeeId(event.target.value)} /><Button type="primary" disabled={confirmed} onClick={confirmByEmployeeId}>确认领用</Button></Space.Compact></div><div className="flex flex-col items-center justify-center"><QRCode value={`contract-number-confirm:${current.id}:${applicant.id}`} size={156} /><Typography.Text strong className="mt-3">狐小 e 扫码确认</Typography.Text><Button className="mt-3" disabled={confirmed} onClick={() => confirm('狐小 e 扫码确认', applicant.id)}>模拟扫码确认</Button></div></div>
      {confirmedResult && <div className="mt-5"><DetailGrid><DetailItem label="识别员工">{applicant.id}-{applicant.name}</DetailItem><DetailItem label="确认时间">{confirmedResult.warehouseHandling?.confirmationTime || '-'}</DetailItem><DetailItem label="确认方式">{confirmedResult.warehouseHandling?.confirmationMethod || '-'}</DetailItem><DetailItem label="确认结果" span={3}><StatusTag value="已确认" type="business" /></DetailItem></DetailGrid><Alert className="mt-4" type="success" showIcon message="确认成功，合约号码领取流程已完成" /></div>}
    </Card>
    <div className="flex justify-center py-2"><Button onClick={() => navigate('/yewurules', { state: { workspace: '合约号码库管员待办' } })}>返回</Button></div>
  </Space></>;
}
