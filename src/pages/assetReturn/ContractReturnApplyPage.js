import React, { useMemo, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button, Card, Empty, Input, Space, Table, Tag, Typography, Upload, message as antdMessage } from 'antd';
import {
  createContractReturnApplications,
  getContractReturnEligibility,
  getEmployeeContractNumbers,
} from '../../services/assetReturnService';

const { TextArea } = Input;

export default function ContractReturnApplyPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const numbers = useMemo(() => getEmployeeContractNumbers(), [version]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reason, setReason] = useState('');
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
      const created = createContractReturnApplications(selectedIds, { reason: reason.trim(), attachment: fileList[0]?.name || '' });
      setSelectedIds([]);
      setReason('');
      setFileList([]);
      setVersion((value) => value + 1);
      messageApi.success(`提交成功，已按一号一单生成 ${created.length} 张合约号码退库单`);
    } catch (error) {
      messageApi.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const numberColumns = [
    { title: '合约号码', dataIndex: 'number', width: 140 },
    { title: '合约机标签号', dataIndex: 'assetTag', width: 150, render: (value) => <Typography.Text className="text-blue-600">{value}</Typography.Text> },
    { title: '资产小类', dataIndex: 'category', width: 110 },
    { title: '品牌', dataIndex: 'brand', width: 100 },
    { title: '合约号码说明', dataIndex: 'description', width: 200 },
    { title: '套餐内容', dataIndex: 'packageContent', width: 240 },
    { title: '金额', dataIndex: 'amount', width: 90, render: (value) => `¥${value}` },
    { title: '当前号码状态', dataIndex: 'status', width: 120, render: (value) => <Tag color={value === '在用' ? 'success' : 'default'}>{value}</Tag> },
    { title: '是否可退库', width: 130, render: (_, record) => {
      const eligibility = getContractReturnEligibility(record);
      return eligibility.allowed ? <Tag color="success">是</Tag> : <div><Tag>否</Tag><div className="text-xs text-slate-500">{eligibility.reason}</div></div>;
    } },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} className="mb-0">合约号码退库</Typography.Title>
        </div>

        <Card size="small" title="申请人信息">
          <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div><Typography.Text type="secondary">申请人：</Typography.Text>孙志强-213852</div>
            <div><Typography.Text type="secondary">公司/板块：</Typography.Text>搜狐新动力信息技术有限公司 / 集团</div>
            <div><Typography.Text type="secondary">部门：</Typography.Text>集团 / 资产管理部 / 员工服务中心</div>
            <div><Typography.Text type="secondary">办公区：</Typography.Text>北京-搜狐媒体大厦</div>
            <div><Typography.Text type="secondary">联系电话：</Typography.Text>138****2852</div>
            <div><Typography.Text type="secondary">申请时间：</Typography.Text>提交时系统记录</div>
          </div>
        </Card>

        <Card size="small" title="申请信息">
          <Typography.Text strong><span className="text-red-500">*</span> 退库原因</Typography.Text>
          <TextArea className="mt-2" rows={3} maxLength={400} showCount value={reason} placeholder="请填写退库原因，最多400字" onChange={(event) => setReason(event.target.value)} />
          <div className="mt-4"><Upload beforeUpload={() => false} fileList={fileList} maxCount={1} onChange={({ fileList: next }) => setFileList(next)}><Button icon={<Paperclip size={14} />}>上传文件</Button></Upload></div>
          <div className="mt-3 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">如对电话卡申领政策存在疑问，可咨询 ES 孙志强（213852），分机 010-56601892。</div>
        </Card>

        <Card size="small" title="合约号码明细">
          <Table rowKey="id" columns={numberColumns} dataSource={numbers} rowSelection={{ selectedRowKeys: selectedIds, onChange: setSelectedIds, getCheckboxProps: (record) => ({ disabled: !getContractReturnEligibility(record).allowed }) }} pagination={false} scroll={{ x: 1200 }} locale={{ emptyText: <Empty description="暂无本人名下合约号码" /> }} />
        </Card>

        <div className="flex justify-center gap-3 rounded-lg bg-white px-5 py-4 shadow-sm">
          <Button type="primary" icon={<Send size={14} />} loading={submitting} onClick={submit}>提交</Button>
          <Button onClick={() => { setSelectedIds([]); setReason(''); setFileList([]); }}>返回</Button>
        </div>
      </Space>
    </div>
  );
}
