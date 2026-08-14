import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Modal,
  Radio,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import { Eye } from 'lucide-react';
import StatusTag from '../../components/StatusTag';
import { formatDepartment } from '../../utils/displayFormat';
import { CONSUMABLE_MAIN_ASSETS, CONSUMABLE_STOCK } from '../../mock/consumableWorkflowMock';
import { getConsumableWorkflowState, submitAllocationDecision } from '../../services/consumableWorkflowService';

const { TextArea } = Input;

function PageHeader({ number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
      <Typography.Title level={4} className="mb-0">耗材配给</Typography.Title>
      <Typography.Text type="secondary">配给单号：{number}</Typography.Text>
    </div>
  );
}

function ApplicantCard({ applicant, applyDate, onViewAssets }) {
  return (
    <Card size="small" title="申请人信息">
      <Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="申请人">
          <Space size={8}>
            <span>{applicant.id}-{applicant.name}</span>
            <Button
              type="link"
              size="small"
              className="px-0"
              icon={<Eye size={14} />}
              onClick={onViewAssets}
            >
              查看名下资产
            </Button>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="申请日期">{applyDate || '-'}</Descriptions.Item>
        <Descriptions.Item label="公司">{applicant.company || '-'}</Descriptions.Item>
        <Descriptions.Item label="办公区">{applicant.officeArea || '-'}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{applicant.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{applicant.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="部门" span={3}>{formatDepartment(applicant.department)}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

const approvalColumns = [
  { title: '审批环节', dataIndex: 'node', width: 150 },
  { title: '申请人/审批人', dataIndex: 'person', width: 190 },
  { title: '审批状态', dataIndex: 'status', width: 120, align: 'center', render: (value) => <StatusTag value={value} type="business" /> },
  { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
  { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
];

export default function ConsumableAllocationPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [matchingStatus, setMatchingStatus] = useState('');
  const [esAdvice, setEsAdvice] = useState('');
  const [matchedStock, setMatchedStock] = useState(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [countersignOpen, setCountersignOpen] = useState(false);
  const allocation = useMemo(
    () => getConsumableWorkflowState().allocations.find((item) => item.status === '待配给') || null,
    [version]
  );

  const reset = () => {
    setMatchingStatus('');
    setEsAdvice('');
    setMatchedStock(null);
  };

  const submit = () => {
    if (!['库存领用', '统一采购'].includes(matchingStatus)) {
      messageApi.warning('请选择匹配状态');
      return;
    }
    if (matchingStatus === '库存领用' && !matchedStock) {
      messageApi.warning('库存领用必须匹配耗材');
      return;
    }
    submitAllocationDecision(allocation.id, {
      matchingStatus,
      rejectType: '',
      esAdvice: esAdvice.trim(),
      matchedStock,
    });
    reset();
    setVersion((current) => current + 1);
    messageApi.success(matchingStatus === '库存领用' ? '已生成耗材领用单' : '已转入耗材汇总采购');
  };

  const reject = () => {
    if (!esAdvice.trim()) {
      messageApi.warning('驳回时 ES 建议必填');
      return;
    }
    submitAllocationDecision(allocation.id, {
      matchingStatus: '驳回',
      rejectType: '',
      esAdvice: esAdvice.trim(),
      matchedStock: null,
    });
    reset();
    setVersion((current) => current + 1);
    messageApi.success('耗材配给单已驳回');
  };

  if (!allocation) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待配给的耗材申请" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </Space>
    );
  }

  const item = allocation.item;
  const detailColumns = [
    { title: '耗材说明', dataIndex: 'materialDesc', width: 220 },
    { title: '参考单价', dataIndex: 'referencePrice', width: 110, render: (value) => `¥${Number(value || 0).toFixed(2)}` },
    { title: '申请原因', dataIndex: 'reason', width: 170 },
    { title: '详细说明', dataIndex: 'detail', width: 220, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 170, render: (value) => value || '-' },
    { title: '主资产说明', dataIndex: 'mainAssetDesc', width: 220, render: (value) => value || '-' },
    { title: 'MIS鉴定结果', dataIndex: 'misOpinion', width: 140, render: (value) => value === '同意申请' ? '鉴定通过' : value === '不同意申请' ? '鉴定不通过' : (value || '-') },
    { title: 'MIS鉴定说明', dataIndex: 'misDescription', width: 220, render: (value) => value || '-' },
  ];
  const stockColumns = [
    { title: '耗材标签号', dataIndex: 'assetTag', width: 150 },
    { title: '序列号', dataIndex: 'serialNo', width: 150 },
    { title: '耗材说明', dataIndex: 'materialDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 180 },
    { title: '仓库', dataIndex: 'warehouse', width: 170 },
    { title: '状态', dataIndex: 'status', width: 100, render: (value) => <StatusTag value={value} type="business" /> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader number={allocation.id} />
      <ApplicantCard applicant={allocation.applicant} applyDate={allocation.applyDate} onViewAssets={() => setAssetsOpen(true)} />
      <Card size="small" title="申请耗材明细">
        <Table rowKey="id" size="small" bordered columns={detailColumns} dataSource={[item]} pagination={false} scroll={{ x: 1400 }} />
      </Card>
      <Card size="small" title="ES配给处理">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> 匹配状态</span>} span={3}>
            <Radio.Group
              value={matchingStatus}
              options={['库存领用', '统一采购'].map((value) => ({ label: value, value }))}
              onChange={(event) => {
                setMatchingStatus(event.target.value);
                setMatchedStock(null);
              }}
            />
            {matchingStatus === '库存领用' && <Button className="ml-3" onClick={() => setStockOpen(true)}>匹配耗材</Button>}
          </Descriptions.Item>
          {matchingStatus === '库存领用' && (
            <Descriptions.Item label="已匹配耗材" span={3}>
              {matchedStock ? `${matchedStock.assetTag} / ${matchedStock.materialDesc}` : '-'}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="ES建议" span={3}>
            <TextArea rows={4} maxLength={400} showCount value={esAdvice} placeholder="驳回时必填" onChange={(event) => setEsAdvice(event.target.value)} />
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card size="small" title="审批信息">
        <Table rowKey={(record, index) => `${record.node}-${index}`} size="small" bordered columns={approvalColumns} dataSource={allocation.history} pagination={false} />
      </Card>
      <Card size="small">
        <div className="flex justify-center gap-3">
          <Button type="primary" onClick={submit}>提交</Button>
          <Button danger onClick={reject}>驳回</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          <Button onClick={() => setCountersignOpen(true)}>加签</Button>
        </div>
      </Card>

      <Modal title="选择库存耗材" open={stockOpen} width={900} onCancel={() => setStockOpen(false)} footer={null}>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={stockColumns}
          dataSource={CONSUMABLE_STOCK.filter((stock) => stock.materialDesc === item.materialDesc)}
          pagination={false}
          onRow={(record) => ({ onClick: () => { setMatchedStock(record); setStockOpen(false); } })}
        />
      </Modal>
      <Modal title="员工名下资产" open={assetsOpen} width={760} onCancel={() => setAssetsOpen(false)} footer={null}>
        <Table
          rowKey="id"
          size="small"
          bordered
          pagination={false}
          dataSource={CONSUMABLE_MAIN_ASSETS}
          columns={[
            { title: '资产标签号', dataIndex: 'assetTag' },
            { title: '资产说明', dataIndex: 'assetDesc' },
            { title: '资产状态', dataIndex: 'status', render: (value) => <StatusTag value={value} type="business" /> },
          ]}
        />
      </Modal>
      <Modal
        title="加签"
        open={countersignOpen}
        onCancel={() => setCountersignOpen(false)}
        onOk={() => { messageApi.success('已发送加签待办'); setCountersignOpen(false); }}
        okText="确认加签"
        cancelText="取消"
      >
        <Input placeholder="请输入具备耗材配给权限的人员" />
      </Modal>
    </Space>
  );
}
