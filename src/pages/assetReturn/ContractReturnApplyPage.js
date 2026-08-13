import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import StatusTag from '../../components/StatusTag';
import {
  createContractReturnApplications,
  getContractReturnEligibility,
  getEmployeeContractNumbers,
} from '../../services/assetReturnService';

const { TextArea } = Input;

function SectionTitle({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-1 rounded-sm bg-blue-500" />
      <span>{children}</span>
    </span>
  );
}

export default function ContractReturnApplyPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const numbers = useMemo(() => getEmployeeContractNumbers(), [version]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setSelectedIds([]);
    setReason('');
  };

  const submit = async () => {
    if (!selectedIds.length) {
      messageApi.warning('请至少选择一个合约号码');
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
    { title: '合约号码', dataIndex: 'number', width: 150, render: (value) => value || '-' },
    { title: '标签号', dataIndex: 'assetTag', width: 160, render: (value) => value || '-' },
    { title: '合约号码说明', dataIndex: 'description', width: 220, render: (value) => value || '-' },
    { title: '套餐内容', dataIndex: 'packageContent', width: 280, render: (value) => value || '-' },
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
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Title level={4} className="mb-0">合约号码退库</Typography.Title>

        <Card size="small" title={<SectionTitle>申请人信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label="申请人">213852-孙志强</DetailItem>
            <DetailItem label="公司">搜狐新动力信息技术有限公司</DetailItem>
            <DetailItem label="板块">集团</DetailItem>
            <DetailItem label="部门">集团.资产管理部.员工服务中心</DetailItem>
            <DetailItem label="办公区">北京-搜狐媒体大厦</DetailItem>
            <DetailItem label="联系电话">138****2852</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title={<SectionTitle>申请信息</SectionTitle>}>
          <DetailGrid>
            <DetailItem label={<><span className="text-red-500">*</span> 退库原因</>} span={3}>
              <TextArea
                rows={3}
                maxLength={400}
                showCount
                value={reason}
                placeholder="请填写退库原因，最多400字"
                onChange={(event) => setReason(event.target.value)}
              />
            </DetailItem>
          </DetailGrid>
          <Alert
            className="mt-3"
            type="info"
            showIcon
            message="如对电话卡申领政策存在疑问，可咨询 ES 孙志强（213852），分机 010-56601892。"
          />
        </Card>

        <Card size="small" title={<SectionTitle>合约号码明细</SectionTitle>} extra={<Typography.Text type="secondary">已选 {selectedIds.length} 项</Typography.Text>}>
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={numberColumns}
            dataSource={numbers}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: setSelectedIds,
              getCheckboxProps: (record) => {
                const eligibility = getContractReturnEligibility(record);
                return { disabled: !eligibility.allowed, title: eligibility.reason || '' };
              },
            }}
            pagination={false}
            scroll={{ x: 1050 }}
            locale={{ emptyText: <Empty description="暂无本人名下合约号码" /> }}
          />
        </Card>

        <div className="flex justify-center gap-3">
          <Button type="primary" loading={submitting} onClick={submit}>提交</Button>
          <Button onClick={reset}>返回</Button>
        </div>
      </Space>
    </>
  );
}
