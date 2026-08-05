import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import { formatDepartment } from '../../utils/displayFormat';
import { CONSUMABLE_STOCK } from '../../mock/consumableWorkflowMock';
import {
  abandonConsumableClaim,
  completeConsumableClaim,
  getConsumableWorkflowState,
  saveClaimFields,
  startConsumableClaimConfirmation,
} from '../../services/consumableWorkflowService';

const { TextArea } = Input;

export default function ConsumableClaimPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [fields, setFields] = useState({});
  const [opinion, setOpinion] = useState('');
  const [stockOpen, setStockOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const claim = useMemo(
    () => getConsumableWorkflowState().claims.find((item) => (
      item.status === '处理中' && ['库管员领用', '员工领用确认'].includes(item.currentNode)
    )) || null,
    [version]
  );
  const current = claim ? { ...claim, ...fields } : null;
  const updateField = (field, value) => setFields((state) => ({ ...state, [field]: value }));

  const primary = () => {
    const savedFields = {
      warehouse: current.warehouse,
      stock: current.stock,
      documentRemark: current.documentRemark,
      city: current.city,
      building: current.building,
      floor: current.floor,
      usageNote: current.usageNote,
      extendScrapDate: current.extendScrapDate,
    };
    saveClaimFields(claim.id, savedFields);
    if (claim.confirmationStatus === '待确认') {
      messageApi.info('员工尚未完成领用确认');
      return;
    }
    if (claim.confirmationStatus !== '已确认') {
      startConsumableClaimConfirmation(claim.id, savedFields);
      messageApi.success('已发起员工耗材领用确认');
      setVersion((value) => value + 1);
      return;
    }
    completeConsumableClaim(claim.id, savedFields);
    messageApi.success('耗材出库完成，已生成出库单并更新台账');
    setVersion((value) => value + 1);
  };

  const abandon = () => {
    if (!opinion.trim()) {
      messageApi.warning('弃领时处理意见必填');
      return;
    }
    abandonConsumableClaim(claim.id, opinion.trim());
    messageApi.success('本次耗材领用已弃领');
    setVersion((value) => value + 1);
  };

  if (!claim) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <Card size="small">
          <Empty description="暂无待办理的耗材领用单" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </Space>
    );
  }

  const item = claim.item;
  const stock = current.stock || {};
  const isLowValue = item.materialType === '低值耐用品';
  const isExtendable = isLowValue && ['内存', '硬盘'].includes(item.subCategory) && item.mainAssetTag;
  const primaryText = claim.confirmationStatus === '已确认'
    ? '执行出库'
    : claim.confirmationStatus === '待确认'
      ? '等待员工确认'
      : '发起领用确认';
  const stockColumns = [
    { title: '耗材标签号', dataIndex: 'assetTag', width: 150 },
    { title: '序列号', dataIndex: 'serialNo', width: 150 },
    { title: '耗材说明', dataIndex: 'materialDesc', width: 220 },
    { title: '配置', dataIndex: 'config', width: 180 },
    { title: '所在仓库', dataIndex: 'warehouse', width: 180 },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
        <Typography.Title level={4} className="mb-0">耗材领用</Typography.Title>
        <Typography.Text type="secondary">领用单号：{claim.id}</Typography.Text>
      </div>

      <Card size="small" title="申请人信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> 当前仓库</span>} span={3}>
            <Select
              style={{ width: 420, maxWidth: '100%' }}
              value={current.warehouse}
              options={['北京总部耗材仓', '北京搜狐媒体大厦仓', '上海办公区耗材仓'].map((value) => ({ label: value, value }))}
              onChange={(value) => updateField('warehouse', value)}
            />
          </Descriptions.Item>
          <Descriptions.Item label="申请人">{claim.applicant.id}-{claim.applicant.name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{claim.applicant.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{claim.applicant.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="公司">{claim.applicant.company || '-'}</Descriptions.Item>
          <Descriptions.Item label="办公区">{claim.applicant.officeArea || '-'}</Descriptions.Item>
          <Descriptions.Item label="申请日期">{claim.applyDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="部门" span={3}>{formatDepartment(claim.applicant.department)}</Descriptions.Item>
          <Descriptions.Item label="单据备注" span={3}>
            <TextArea rows={2} maxLength={400} showCount value={current.documentRemark || ''} placeholder="请输入单据备注" onChange={(event) => updateField('documentRemark', event.target.value)} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title="申请耗材信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label={<span>{isLowValue && <span className="text-red-500">*</span>} 耗材标签号</span>}>
            <Space.Compact className="w-full">
              <Input readOnly value={isLowValue ? (stock.assetTag || '') : ''} placeholder={isLowValue ? '请选择耗材标签号' : '普通耗材无需标签号'} />
              {isLowValue && <Button onClick={() => setStockOpen(true)}>选择</Button>}
            </Space.Compact>
          </Descriptions.Item>
          <Descriptions.Item label="序列号">{isLowValue ? (stock.serialNo || '-') : '-'}</Descriptions.Item>
          <Descriptions.Item label="所在仓库">{stock.warehouse || current.warehouse || '-'}</Descriptions.Item>
          <Descriptions.Item label="实际耗材说明">{item.materialDesc || '-'}</Descriptions.Item>
          <Descriptions.Item label="配置">{item.config || '-'}</Descriptions.Item>
          <Descriptions.Item label="数量">{item.quantity || 1}</Descriptions.Item>
          <Descriptions.Item label="公司">{stock.company || claim.applicant.company || '-'}</Descriptions.Item>
          <Descriptions.Item label="板块">{stock.block || claim.applicant.block || '-'}</Descriptions.Item>
          <Descriptions.Item label="启用日期">{claim.applyDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="城市">
            <Select className="w-full" value={current.city} options={['北京市', '上海市', '广州市'].map((value) => ({ label: value, value }))} onChange={(value) => updateField('city', value)} />
          </Descriptions.Item>
          <Descriptions.Item label="建筑">
            <Select className="w-full" value={current.building} options={['搜狐媒体大厦', '融科资讯中心', '上海办公区'].map((value) => ({ label: value, value }))} onChange={(value) => updateField('building', value)} />
          </Descriptions.Item>
          <Descriptions.Item label="楼层">
            <Select className="w-full" value={current.floor} options={['8层', '10层', '12层'].map((value) => ({ label: value, value }))} onChange={(value) => updateField('floor', value)} />
          </Descriptions.Item>
          <Descriptions.Item label="主资产标签号">{item.mainAssetTag || '-'}</Descriptions.Item>
          <Descriptions.Item label="主资产说明" span={2}>{item.mainAssetDesc || '-'}</Descriptions.Item>
          {isExtendable && (
            <Descriptions.Item label="是否延长报废期">
              <Checkbox checked={Boolean(current.extendScrapDate)} onChange={(event) => updateField('extendScrapDate', event.target.checked)}>延长1年</Checkbox>
            </Descriptions.Item>
          )}
          {isExtendable && <Descriptions.Item label="ES实物报废期" span={2}>{current.esPhysicalScrapDate || '-'}</Descriptions.Item>}
          <Descriptions.Item label="使用说明" span={3}>
            <TextArea rows={3} maxLength={400} showCount value={current.usageNote || ''} placeholder="请输入使用说明" onChange={(event) => updateField('usageNote', event.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="申请耗材说明">{item.materialDesc || '-'}</Descriptions.Item>
          <Descriptions.Item label="申请原因">{item.reason || '-'}</Descriptions.Item>
          <Descriptions.Item label="详细说明">{item.detail || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small">
        <div className="mb-4">
          <TextArea rows={2} maxLength={400} showCount value={opinion} placeholder="弃领时处理意见必填" onChange={(event) => setOpinion(event.target.value)} />
        </div>
        <div className="flex justify-center gap-3">
          <Button type="primary" disabled={claim.confirmationStatus === '待确认'} onClick={primary}>{primaryText}</Button>
          <Button danger onClick={abandon}>弃领</Button>
          <Button onClick={() => setTransferOpen(true)}>加签</Button>
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button>
          <Button onClick={() => messageApi.success('领用通知已发送给申请人和库管员')}>发送领用通知</Button>
        </div>
      </Card>

      <Modal title="选择耗材" open={stockOpen} width={920} onCancel={() => setStockOpen(false)} footer={null}>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={stockColumns}
          dataSource={CONSUMABLE_STOCK.filter((record) => record.materialDesc === item.materialDesc)}
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              updateField('stock', record);
              updateField('warehouse', record.warehouse);
              setStockOpen(false);
            },
          })}
        />
      </Modal>
      <Modal
        title="加签"
        open={transferOpen}
        onCancel={() => setTransferOpen(false)}
        onOk={() => { messageApi.success('已加签给具备当前仓库出库权限的人员'); setTransferOpen(false); }}
        okText="确认加签"
        cancelText="取消"
      >
        <Select className="w-full" placeholder="请选择当前仓库有出库权限的人员" options={['119039-刘建', '213852-孙志强'].map((value) => ({ label: value, value }))} />
      </Modal>
    </Space>
  );
}
