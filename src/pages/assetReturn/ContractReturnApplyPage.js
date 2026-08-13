import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, Empty, Input, Modal, Space, Table, Typography, message as antdMessage } from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import { createContractReturnApplications, getContractReturnEligibility, getEmployeeContractNumbers } from '../../services/assetReturnService';

const { TextArea } = Input;

function SectionTitle({ children }) {
  return <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-1 rounded-sm bg-blue-500" /><span>{children}</span></span>;
}

function todayText() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function ContractReturnApplyPage() {
  const location = useLocation();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const numbers = useMemo(() => getEmployeeContractNumbers(), [version]);
  const applyDate = useMemo(() => todayText(), []);
  const [selectedIds, setSelectedIds] = useState(() => {
    const prefillNumbers = location.state?.prefillContractNumbers || [];
    if (!prefillNumbers.length) return [];
    const currentNumbers = getEmployeeContractNumbers();
    return prefillNumbers.map((number) => currentNumbers.find((item) => item.number === number)?.id).filter(Boolean);
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftSelectedIds, setDraftSelectedIds] = useState([]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedNumbers = useMemo(() => selectedIds.map((id) => numbers.find((item) => item.id === id)).filter(Boolean), [numbers, selectedIds]);

  const openPicker = () => {
    setDraftSelectedIds(selectedIds);
    setPickerOpen(true);
  };

  const confirmPicker = () => {
    setSelectedIds(draftSelectedIds);
    setPickerOpen(false);
  };

  const reset = () => {
    setSelectedIds([]);
    setDraftSelectedIds([]);
    setReason('');
  };

  const submit = async () => {
    if (!selectedIds.length) {
      messageApi.warning('请先添加需要退库的合约号码');
      return;
    }
    if (!reason.trim()) {
      messageApi.warning('请填写退库原因');
      return;
    }
    setSubmitting(true);
    try {
      const created = createContractReturnApplications(selectedIds, { reason: reason.trim() });
      reset();
      setVersion((value) => value + 1);
      messageApi.success(`提交成功，已按一号一单生成 ${created.length} 张合约号码退库单`);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const numberColumns = [
    { title: '合约号码', dataIndex: 'number', width: 180, render: (value) => value || '-' },
    { title: '合约号码说明', dataIndex: 'description', render: (value) => value || '-' },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Title level={4} className="mb-0">合约号码退库</Typography.Title>
        <Card size="small" title={<SectionTitle>申请信息</SectionTitle>}>
          <DetailGrid className="!overflow-x-hidden">
            <DetailItem label="申请人">213852-孙志强</DetailItem>
            <DetailItem label="部门">集团.资产管理部.员工服务中心</DetailItem>
            <DetailItem label="申请日期">{applyDate}</DetailItem>
            <DetailItem label={<><span className="text-red-500">*</span> 退库原因</>} span={3}>
              <TextArea autoSize={{ minRows: 2 }} maxLength={400} showCount value={reason} placeholder="请填写退库原因，最多400字" onChange={(event) => setReason(event.target.value)} />
            </DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title={<SectionTitle>合约号码明细</SectionTitle>}>
          <div className="mb-3 flex items-center justify-between">
            <Button type="primary" onClick={openPicker}>添加物资</Button>
            <Typography.Text type="secondary">已添加 {selectedNumbers.length} 项</Typography.Text>
          </div>
          <Table rowKey="id" size="small" bordered columns={numberColumns} dataSource={selectedNumbers} pagination={false} locale={{ emptyText: <Empty description="暂未添加合约号码" /> }} />
        </Card>
        <div className="flex justify-center gap-3"><Button type="primary" loading={submitting} onClick={submit}>提交</Button><Button onClick={reset}>返回</Button></div>
      </Space>
      <Modal title="选择本人名下合约号码" open={pickerOpen} width={760} onCancel={() => setPickerOpen(false)} footer={<div className="flex justify-center gap-3"><Button type="primary" onClick={confirmPicker}>确定</Button><Button onClick={() => setPickerOpen(false)}>取消</Button></div>}>
        <Table rowKey="id" size="small" bordered columns={numberColumns} dataSource={numbers} rowSelection={{ selectedRowKeys: draftSelectedIds, onChange: setDraftSelectedIds, getCheckboxProps: (record) => { const eligibility = getContractReturnEligibility(record); return { disabled: !eligibility.allowed, title: eligibility.reason || '' }; } }} pagination={false} locale={{ emptyText: <Empty description="暂无本人名下合约号码" /> }} />
      </Modal>
    </>
  );
}
