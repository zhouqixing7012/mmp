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
  Radio,
  Select,
  Space,
  Table,
  Typography,
  Upload,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import { formatDepartment } from '../../utils/displayFormat';
import {
  CONSUMABLE_MAIN_ASSETS,
  CONSUMABLE_STOCK,
} from '../../mock/consumableWorkflowMock';
import {
  abandonConsumableClaim,
  completeConsumableClaim,
  getConsumableWorkflowState,
  saveClaimFields,
  startConsumableClaimConfirmation,
  submitAllocationDecision,
  submitSummary,
  updateSummary,
} from '../../services/consumableWorkflowService';

const { TextArea } = Input;

function PageHeader({ title, numberLabel, number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
      <Typography.Title level={4} className="mb-0">{title}</Typography.Title>
      {number && <Typography.Text type="secondary">{numberLabel || '单据编号'}：{number}</Typography.Text>}
    </div>
  );
}

function EmptyPage({ contextHolder, description, onBack }) {
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <Card size="small">
        <Empty description={description} />
        <div className="mt-4 flex justify-center">
          <Button onClick={onBack}>返回工作台</Button>
        </div>
      </Card>
    </Space>
  );
}

function ApplicantCard({ applicant, applyDate, onViewAssets }) {
  return (
    <Card size="small" title="申请人信息">
      <Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="申请人">
          <Space size={8}>
            <span>{applicant.id}-{applicant.name}</span>
            {onViewAssets && (
              <Button type="link" size="small" className="px-0" onClick={onViewAssets}>查看名下资产</Button>
            )}
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
  {
    title: '审批状态',
    dataIndex: 'status',
    width: 120,
    align: 'center',
    render: (value) => <StatusTag value={value} type="business" />,
  },
  { title: '审批时间', dataIndex: 'time', width: 180, render: (value) => value || '-' },
  { title: '审批意见', dataIndex: 'comment', render: (value) => value || '-' },
];

function ApprovalHistoryCard({ records = [] }) {
  return (
    <Card size="small" title="审批信息">
      <Table
        rowKey={(record, index) => `${record.node}-${index}`}
        size="small"
        bordered
        columns={approvalColumns}
        dataSource={records}
        pagination={false}
      />
    </Card>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizeMisOpinion(value) {
  if (value === '同意申请') return '鉴定通过';
  if (value === '不同意申请') return '鉴定不通过';
  return value || '';
}

export function ConsumableAllocationPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [matchingStatus, setMatchingStatus] = useState('');
  const [esAdvice, setEsAdvice] = useState('');
  const [matchedStock, setMatchedStock] = useState(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [countersignOpen, setCountersignOpen] = useState(false);
  const allocation = useMemo(() => (
    getConsumableWorkflowState().allocations.find((item) => item.status === '待配给') || null
  ), [version]);

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
      <EmptyPage
        contextHolder={contextHolder}
        description="暂无待配给的耗材申请"
        onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}
      />
    );
  }

  const item = allocation.item;
  const detailColumns = [
    { title: '耗材说明', dataIndex: 'materialDesc', width: 220 },
    { title: '参考单价', dataIndex: 'referencePrice', width: 110, render: (value) => `¥${money(value)}` },
    { title: '申请原因', dataIndex: 'reason', width: 170 },
    { title: '详细说明', dataIndex: 'detail', width: 220, render: (value) => value || '-' },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 170, render: (value) => value || '-' },
    { title: '主资产说明', dataIndex: 'mainAssetDesc', width: 220, render: (value) => value || '-' },
    { title: 'MIS鉴定结果', dataIndex: 'misOpinion', width: 140, render: (value) => normalizeMisOpinion(value) || '-' },
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
      <PageHeader title="耗材配给" numberLabel="配给单号" number={allocation.id} />
      <ApplicantCard applicant={allocation.applicant} applyDate={allocation.applyDate} onViewAssets={() => setAssetsOpen(true)} />
      <Card size="small" title="申请耗材明细">
        <Table rowKey="id" size="small" bordered columns={detailColumns} dataSource={[item]} pagination={false} scroll={{ x: 1400 }} />
      </Card>
      <Card size="small" title="ES 配给处理">
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
            {matchingStatus === '库存领用' && (
              <Button className="ml-3" onClick={() => setStockOpen(true)}>匹配耗材</Button>
            )}
          </Descriptions.Item>
          {matchingStatus === '库存领用' && (
            <Descriptions.Item label="已匹配耗材" span={3}>
              {matchedStock ? `${matchedStock.assetTag} / ${matchedStock.materialDesc}` : '-'}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="ES 建议" span={3}>
            <TextArea rows={4} maxLength={400} showCount value={esAdvice} placeholder="请输入 ES 建议" onChange={(event) => setEsAdvice(event.target.value)} />
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <ApprovalHistoryCard records={allocation.history} />
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

export function ConsumableClaimPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [fields, setFields] = useState({});
  const [opinion, setOpinion] = useState('');
  const [stockOpen, setStockOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const claim = useMemo(() => (
    getConsumableWorkflowState().claims
      .find((item) => item.status === '处理中' && ['库管员领用', '员工领用确认'].includes(item.currentNode)) || null
  ), [version]);
  const current = claim ? { ...claim, ...fields } : null;
  const updateField = (field, value) => setFields((state) => ({ ...state, [field]: value }));

  const handlePrimary = () => {
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

    if (claim.confirmationStatus === '已确认') {
      completeConsumableClaim(claim.id, savedFields);
      messageApi.success('耗材出库完成，已生成出库单并更新台账');
      setVersion((value) => value + 1);
      return;
    }

    if (claim.confirmationStatus !== '待确认') {
      startConsumableClaimConfirmation(claim.id, savedFields);
    }
    navigate('/yewurules', { state: { workspace: '员工耗材领用确认' } });
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
      <EmptyPage
        contextHolder={contextHolder}
        description="暂无待办理的耗材领用单"
        onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}
      />
    );
  }

  const item = claim.item;
  const stock = current.stock || {};
  const isLowValue = item.materialType === '低值耐用品';
  const isExtendable = isLowValue && ['内存', '硬盘'].includes(item.subCategory) && item.mainAssetTag;
  const primaryText = claim.confirmationStatus === '已确认' ? '执行出库' : '领用确认';

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
      <PageHeader title="耗材领用" numberLabel="领用单号" number={claim.id} />
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
          <Descriptions.Item label="成本中心">{claim.applicant.costCenter || '-'}</Descriptions.Item>
          <Descriptions.Item label="部门" span={2}>{formatDepartment(claim.applicant.department)}</Descriptions.Item>
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
      <Card size="small" title="审批操作">
        <div className="mb-4">
          <TextArea rows={2} maxLength={400} showCount value={opinion} placeholder="弃领时处理意见必填" onChange={(event) => setOpinion(event.target.value)} />
        </div>
        <div className="flex justify-center gap-3">
          <Button type="primary" onClick={handlePrimary}>{primaryText}</Button>
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

function buildDepartmentRows(rows) {
  const grouped = rows.filter((row) => row.approved).reduce((result, row) => {
    const key = row.department || '-';
    if (!result[key]) result[key] = { department: key, quantity: 0, amount: 0 };
    result[key].quantity += Number(row.quantity || 0);
    result[key].amount += Number(row.estimatedAmount || 0);
    return result;
  }, {});
  return Object.values(grouped).map((row, index) => ({ ...row, id: `${row.department}-${index}`, index: index + 1 }));
}

function DepartmentSummaryCard({ rows }) {
  const departmentRows = buildDepartmentRows(rows);
  const totalQuantity = departmentRows.reduce((sum, row) => sum + row.quantity, 0);
  const totalAmount = departmentRows.reduce((sum, row) => sum + row.amount, 0);
  const columns = [
    { title: '序号', dataIndex: 'index', width: 80, align: 'center' },
    { title: '部门', dataIndex: 'department' },
    { title: '申请采购数量', dataIndex: 'quantity', width: 160, align: 'center' },
    { title: '预计采购费用（元）', dataIndex: 'amount', width: 180, align: 'right', render: money },
  ];
  return (
    <Card size="small" title="部门汇总信息">
      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={departmentRows}
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2} align="center">合计</Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="center">{totalQuantity}</Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">{money(totalAmount)}</Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div className="mt-2 text-sm text-red-500">此汇总申请中的价格仅供参考，最终采购价格以 PR 单为准。</div>
    </Card>
  );
}

function SummaryApplicationTable({ rows }) {
  const approvedRows = rows.filter((row) => row.approved);
  const totalQuantity = approvedRows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const totalAmount = approvedRows.reduce((sum, row) => sum + Number(row.estimatedAmount || 0), 0);
  const columns = [
    { title: '序号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '部门', dataIndex: 'department', width: 210 },
    { title: '申请单号', dataIndex: 'applicationId', width: 180 },
    { title: '申请人', dataIndex: 'applicant', width: 150 },
    { title: '物资类别', dataIndex: 'category', width: 140 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 240 },
    { title: '采购数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '预计费用（元）', dataIndex: 'estimatedAmount', width: 140, align: 'right', render: money },
    { title: '申请原因', dataIndex: 'detail', width: 210, render: (value) => value || '-' },
    { title: 'ES建议', dataIndex: 'esAdvice', width: 170, render: (value) => value || '-' },
  ];
  return (
    <Card size="small" title="申请明细">
      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={approvedRows}
        pagination={false}
        scroll={{ x: 1550 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={6} align="center">合计</Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="center">{totalQuantity}</Table.Summary.Cell>
            <Table.Summary.Cell index={7} align="right">{money(totalAmount)}</Table.Summary.Cell>
            <Table.Summary.Cell index={8} colSpan={2} />
          </Table.Summary.Row>
        )}
      />
    </Card>
  );
}

export function ConsumableSummaryPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [view, setView] = useState('list');
  const [draft, setDraft] = useState(null);
  const [fileList, setFileList] = useState([]);
  const summary = useMemo(() => (
    getConsumableWorkflowState().summaries.find((item) => item.status === '草稿' && item.currentNode === 'ES汇总') || null
  ), [version]);
  const current = summary ? { ...summary, ...(draft || {}) } : null;
  const rows = current?.rows || [];
  const totalQuantity = rows.filter((row) => row.approved).reduce((sum, row) => sum + Number(row.quantity || 0), 0);

  const updateRow = (id, patch) => setDraft((state) => ({
    ...(state || {}),
    rows: rows.map((row) => row.id === id ? { ...row, ...patch } : row),
  }));

  const rejectApplicant = (record) => {
    setDraft((state) => ({
      ...(state || {}),
      rows: rows.map((row) => record.items.some((item) => item.id === row.id) ? { ...row, approved: false } : row),
    }));
    messageApi.warning(`${record.applicant} 的申请已标记为驳回`);
  };

  const save = () => {
    updateSummary(summary.id, {
      summaryDescription: current.summaryDescription,
      projectPurpose: current.projectPurpose,
      rows,
    });
    messageApi.success('耗材汇总草稿已保存');
    setVersion((value) => value + 1);
  };

  const submit = () => {
    updateSummary(summary.id, {
      summaryDescription: current.summaryDescription,
      projectPurpose: current.projectPurpose,
      rows,
    });
    submitSummary(summary.id);
    messageApi.success('耗材汇总已提交至 ES 主管审批');
    setVersion((value) => value + 1);
  };

  if (!summary) {
    return (
      <EmptyPage
        contextHolder={contextHolder}
        description="暂无待处理的耗材汇总草稿"
        onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}
      />
    );
  }

  const groupedApplicants = Object.values(rows.reduce((result, row) => {
    const key = `${row.applicant}-${row.applicationId}-${row.department}`;
    if (!result[key]) result[key] = { key, applicant: row.applicant, applicationId: row.applicationId, department: row.department, items: [] };
    result[key].items.push(row);
    return result;
  }, {}));

  const detailColumns = [
    { title: '物资类别', dataIndex: 'category', width: 150 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 240 },
    { title: '采购数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '预计费用（元）', dataIndex: 'estimatedAmount', width: 140, align: 'right', render: money },
    { title: '详细说明', dataIndex: 'detail', width: 220, render: (value) => value || '-' },
    {
      title: 'ES建议',
      dataIndex: 'esAdvice',
      width: 260,
      render: (value, record) => (
        <Input value={value} onChange={(event) => updateRow(record.id, { esAdvice: event.target.value })} />
      ),
    },
  ];

  if (view === 'list') {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageHeader title="耗材汇总" />
        <Card size="small">
          <Table
            rowKey="id"
            size="small"
            bordered
            pagination={false}
            dataSource={[summary]}
            columns={[
              {
                title: '汇总公司',
                dataIndex: 'company',
                render: (value) => <Button type="link" size="small" className="px-0" onClick={() => setView('detail')}>{value}</Button>,
              },
              { title: '申请数量', width: 120, align: 'center', render: () => totalQuantity },
              { title: '汇总周期', dataIndex: 'period', width: 220 },
              { title: '操作', width: 100, render: () => <Button type="link" size="small" onClick={() => setView('detail')}>查看</Button> },
            ]}
          />
        </Card>
      </Space>
    );
  }

  if (view === 'detail') {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageHeader title="耗材汇总明细" numberLabel="汇总单号" number={summary.id} />
        {groupedApplicants.map((record) => (
          <Card key={record.key} size="small">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
              <Space wrap>
                <span>申请人：{record.applicant}</span>
                <span>申请单号：{record.applicationId}</span>
                <span>申请部门：{record.department}</span>
              </Space>
              <Button danger onClick={() => rejectApplicant(record)}>驳回</Button>
            </div>
            <Table rowKey="id" size="small" bordered columns={detailColumns} dataSource={record.items} pagination={false} scroll={{ x: 1150 }} />
          </Card>
        ))}
        <Card size="small">
          <div className="flex justify-center gap-3">
            <Button type="primary" onClick={() => setView('summary')}>下一步</Button>
            <Button onClick={save}>保存</Button>
            <Button onClick={() => setView('list')}>返回</Button>
          </div>
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader title="耗材汇总申请" numberLabel="汇总单号" number={summary.id} />
      <Card size="small" title="ES汇总说明">
        <TextArea rows={5} maxLength={1000} showCount value={current.summaryDescription} onChange={(event) => setDraft((state) => ({ ...(state || {}), summaryDescription: event.target.value }))} />
      </Card>
      <Card size="small" title="项目用途说明">
        <TextArea rows={3} maxLength={400} showCount value={current.projectPurpose} onChange={(event) => setDraft((state) => ({ ...(state || {}), projectPurpose: event.target.value }))} />
        <div className="mt-2 text-sm text-red-500">备注：此信息会同步至 PR 系统。</div>
      </Card>
      <DepartmentSummaryCard rows={rows} />
      <SummaryApplicationTable rows={rows} />
      <Card size="small" title="附件信息">
        <Upload
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: next }) => setFileList(next)}
        >
          <Button>上传附件</Button>
        </Upload>
      </Card>
      <Card size="small">
        <div className="flex justify-center gap-3">
          <Button type="primary" onClick={submit}>提交</Button>
          <Button onClick={() => setView('detail')}>修改</Button>
        </div>
      </Card>
    </Space>
  );
}
