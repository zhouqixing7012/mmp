import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Empty, Input, Select, Space, Table, Typography, message as antdMessage } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import { CONTRACT_WAREHOUSES } from '../../mock/assetReturnMock';
import {
  completeContractReturn,
  finishContractReturn,
  getContractReturnApplications,
  requestContractReturnConfirmation,
} from '../../services/assetReturnService';
import { formatDateText, formatDepartment } from '../../utils/displayFormat';

const { TextArea } = Input;

function SectionTitle({ children }) {
  return <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-1 rounded-sm bg-blue-500" /><span>{children}</span></span>;
}

export default function ContractReturnHandlingPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const applications = useMemo(() => getContractReturnApplications(), [version]);
  const selected = applications.find((item) => item.status === '处理中' && ['号码退库办理', '员工号码退库确认'].includes(item.currentNode)) || null;
  const [warehouse, setWarehouse] = useState('北京总部号码仓');
  const [usageNote, setUsageNote] = useState('');
  const [opinion, setOpinion] = useState('');
  const [loadingAction, setLoadingAction] = useState('');

  useEffect(() => {
    if (!selected) return;
    setWarehouse(selected.handling.warehouse || '北京总部号码仓');
    setUsageNote(selected.handling.usageNote || '');
    setOpinion(selected.handling.opinion || '');
  }, [selected?.id, selected?.handling.confirmationStatus]);

  const refresh = () => setVersion((value) => value + 1);

  const handlePrimaryAction = async () => {
    if (!selected) return;
    if (!warehouse) return messageApi.warning('请选择退库仓库');
    const confirmationStatus = selected.handling.confirmationStatus;
    if (confirmationStatus === '待确认') return messageApi.info('员工尚未完成退库确认');

    setLoadingAction('primary');
    try {
      if (confirmationStatus !== '已确认') {
        requestContractReturnConfirmation(selected.id);
        messageApi.success('已发起员工合约号码退库确认');
        refresh();
        return;
      }
      completeContractReturn(selected.id, {
        warehouse,
        returnDate: formatDateText(selected.handling.confirmationTime),
        usageNote: usageNote.trim(),
        opinion: opinion.trim(),
      });
      messageApi.success('合约号码入库成功，号码状态已更新为“在库（旧）”');
      refresh();
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setLoadingAction('');
    }
  };

  const reject = () => {
    if (!selected) return;
    if (!opinion.trim()) return messageApi.warning('驳回时审批意见必填');
    setLoadingAction('reject');
    try {
      finishContractReturn(selected.id, '驳回', opinion.trim());
      messageApi.success('合约号码退库申请已驳回');
      refresh();
    } finally {
      setLoadingAction('');
    }
  };

  if (!selected) {
    return <>{contextHolder}<Card size="small"><Empty description="暂无合约号码退库办理待办" /><div className="mt-4 flex justify-center"><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button></div></Card></>;
  }

  const number = selected.contractNumber;
  const confirmationStatus = selected.handling.confirmationStatus;
  const confirmedReturnDate = selected.handling.confirmationTime ? formatDateText(selected.handling.confirmationTime) : '-';
  const primaryText = confirmationStatus === '已确认' ? '确认入库' : confirmationStatus === '待确认' ? '等待员工确认' : '退库确认';
  const historyColumns = [
    { title: '审批环节', dataIndex: 'node', width: 180 },
    { title: '申请人/审批人', dataIndex: 'person', width: 200 },
    { title: '审批状态', dataIndex: 'status', width: 120, align: 'center', render: (value) => <StatusTag value={value} type="business" /> },
    { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
    { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between">
          <Typography.Title level={4} className="mb-0">合约号码退库办理</Typography.Title>
          <Typography.Text type="secondary">退库单号：{selected.id}</Typography.Text>
        </div>
        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="申请人">{selected.applicant.id}-{selected.applicant.name}</DetailItem>
            <DetailItem label="申请日期">{formatDateText(selected.applyTime)}</DetailItem>
            <DetailItem label="联系电话">{selected.applicant.phone || '-'}</DetailItem>
            <DetailItem label="公司">{selected.applicant.company || '-'}</DetailItem>
            <DetailItem label="板块">{selected.applicant.block || '-'}</DetailItem>
            <DetailItem label="办公区">{selected.applicant.officeArea || '-'}</DetailItem>
            <DetailItem label="成本中心">{selected.applicant.costCenter || '-'}</DetailItem>
            <DetailItem label="部门" span={2}>{formatDepartment(selected.applicant.department)}</DetailItem>
            <DetailItem label="退库原因" span={3}>{selected.reason || '-'}</DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title={<SectionTitle>退库合约号码信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="合约号码">{number.number || '-'}</DetailItem>
            <DetailItem label="合约号码说明">{number.description || '-'}</DetailItem>
            <DetailItem label="号码状态"><StatusTag value={number.status || '-'} type="business" /></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title={<SectionTitle>退库信息维护</SectionTitle>}>
          <DetailGrid>
            <DetailItem label={<><span className="text-red-500">*</span> 退库仓库</>}>
              <Select className="w-full" value={warehouse} options={CONTRACT_WAREHOUSES.map((value) => ({ label: value, value }))} onChange={setWarehouse} />
            </DetailItem>
            <DetailItem label="责任人">{selected.handling.responsiblePerson || '号码库管员'}</DetailItem>
            <DetailItem label="退库日期">{confirmedReturnDate}</DetailItem>
            <DetailItem label="使用说明" span={3}>
              <Input maxLength={200} value={usageNote} placeholder="请输入退库情况或其他补充说明" onChange={(event) => setUsageNote(event.target.value)} />
            </DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title={<SectionTitle>审批信息</SectionTitle>}>
          <Table rowKey={(record, index) => `${record.node}-${index}`} size="small" bordered columns={historyColumns} dataSource={selected.history || []} pagination={false} scroll={{ x: 980 }} />
          <div className="mt-4">
            <Typography.Text strong>审批意见</Typography.Text>
            <TextArea className="mt-2" rows={3} maxLength={400} showCount value={opinion} placeholder="确认入库时可不填写，驳回时必填" onChange={(event) => setOpinion(event.target.value)} />
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <Button type="primary" loading={loadingAction === 'primary'} disabled={confirmationStatus === '待确认'} onClick={handlePrimaryAction}>{primaryText}</Button>
            <Button danger loading={loadingAction === 'reject'} onClick={reject}>驳回</Button>
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          </div>
        </Card>
      </Space>
    </>
  );
}
