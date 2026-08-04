import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Empty,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import StatusTag from '../../components/StatusTag';
import { formatDepartment } from '../../utils/displayFormat';
import {
  CONSUMABLE_APPLICATION_NOTICE,
  CONSUMABLE_CATALOG,
  CONSUMABLE_MAIN_ASSETS,
  CONSUMABLE_REASON_OPTIONS,
  CONSUMABLE_STOCK,
} from '../../mock/consumableWorkflowMock';
import {
  abandonConsumableClaim,
  approveSummary,
  completeConsumableClaim,
  confirmConsumableClaim,
  createConsumableApplication,
  getConsumableWorkflowState,
  saveClaimFields,
  saveMisDraft,
  startConsumableClaimConfirmation,
  submitAllocationDecision,
  submitLeaderDecision,
  submitMisDecision,
  submitSummary,
  updateSummary,
} from '../../services/consumableWorkflowService';

const { TextArea } = Input;
const QR_SIZE = 21;

function PageHeader({ title, numberLabel, number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-sm">
      <Typography.Title level={4} className="mb-0">{title}</Typography.Title>
      {number && <Typography.Text type="secondary">{numberLabel || '单据编号'}：{number}</Typography.Text>}
    </div>
  );
}

function ApplicantCard({ applicant, applyDate, reason, onViewAssets }) {
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
        {reason && <Descriptions.Item label="申请原因" span={3}>{reason}</Descriptions.Item>}
      </Descriptions>
    </Card>
  );
}

function ApprovalHistoryCard({ records = [] }) {
  const columns = [
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
  return (
    <Card size="small" title="审批信息">
      <Table rowKey={(record, index) => `${record.node}-${index}`} size="small" bordered columns={columns} dataSource={records} pagination={false} />
    </Card>
  );
}

function EmptyPage({ contextHolder, description, onBack }) {
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <Card size="small">
        <Empty description={description} />
        <div className="mt-4 flex justify-center"><Button onClick={onBack}>返回工作台</Button></div>
      </Card>
    </Space>
  );
}

function MaterialSelectModal({ open, onCancel, onConfirm }) {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [keyword, setKeyword] = useState('');
  const rows = useMemo(() => CONSUMABLE_CATALOG.filter((item) => (
    !keyword || [item.materialType, item.category, item.subCategory, item.brand, item.model, item.materialDesc]
      .join(' ')
      .toLowerCase()
      .includes(keyword.toLowerCase())
  )), [keyword]);
  const columns = [
    { title: '物料类型', dataIndex: 'materialType', width: 110 },
    { title: '耗材大类', dataIndex: 'category', width: 120 },
    { title: '耗材小类', dataIndex: 'subCategory', width: 120 },
    { title: '品牌', dataIndex: 'brand', width: 100 },
    { title: '规格型号', dataIndex: 'model', width: 150 },
    { title: '配置', dataIndex: 'config', width: 180 },
    { title: '参考单价', dataIndex: 'referencePrice', width: 110, render: (value) => `¥${Number(value || 0).toFixed(2)}` },
  ];
  const close = () => {
    setSelectedKeys([]);
    setKeyword('');
    onCancel();
  };
  return (
    <Modal
      title="添加耗材"
      open={open}
      width={980}
      onCancel={close}
      footer={(
        <div className="flex items-center justify-between">
          <Typography.Text type="secondary">已选择 {selectedKeys.length} 项</Typography.Text>
          <Space>
            <Button type="primary" disabled={!selectedKeys.length} onClick={() => {
              onConfirm(CONSUMABLE_CATALOG.filter((item) => selectedKeys.includes(item.id)));
              setSelectedKeys([]);
              setKeyword('');
            }}>确定</Button>
            <Button onClick={close}>取消</Button>
          </Space>
        </div>
      )}
    >
      <div className="mb-3 max-w-sm"><Input.Search value={keyword} placeholder="搜索耗材类别、品牌或型号" onChange={(event) => setKeyword(event.target.value)} /></div>
      <Table
        rowKey="id"
        size="small"
        bordered
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
      />
    </Modal>
  );
}

function isFinderCell(row, column, startRow, startColumn) {
  const localRow = row - startRow;
  const localColumn = column - startColumn;
  if (localRow < 0 || localRow > 6 || localColumn < 0 || localColumn > 6) return false;
  const border = localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6;
  const core = localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;
  return border || core;
}

function buildQrCells(seed = '') {
  const safeSeed = seed || 'consumable-confirm';
  return Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
    const row = Math.floor(index / QR_SIZE);
    const column = index % QR_SIZE;
    if (
      isFinderCell(row, column, 0, 0)
      || isFinderCell(row, column, 0, QR_SIZE - 7)
      || isFinderCell(row, column, QR_SIZE - 7, 0)
    ) return true;
    if (row === 6 || column === 6) return (row + column) % 2 === 0;
    const code = safeSeed.charCodeAt((row * QR_SIZE + column) % safeSeed.length);
    return ((row * 11) + (column * 7) + code) % 9 < 4;
  });
}

function ConfirmationQr({ seed, disabled, onConfirm }) {
  const cells = useMemo(() => buildQrCells(seed), [seed]);
  return (
    <div className="flex flex-col items-center">
      <Typography.Text strong>扫码确认</Typography.Text>
      <button type="button" disabled={disabled} className="mt-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm disabled:opacity-50" onClick={onConfirm}>
        <div className="grid h-[168px] w-[168px] bg-white" style={{ gridTemplateColumns: `repeat(${QR_SIZE}, minmax(0, 1fr))` }}>
          {cells.map((dark, index) => <span key={index} className={dark ? 'bg-black' : 'bg-white'} />)}
        </div>
      </button>
    </div>
  );
}

export function ConsumableApplyPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [items, setItems] = useState([]);
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [items]);

  const updateItem = (id, patch) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  const addItems = (records) => {
    let duplicateCount = 0;
    setItems((current) => {
      const next = [...current];
      records.forEach((record) => {
        const existingIndex = next.findIndex((item) => item.id === record.id);
        if (existingIndex >= 0) {
          duplicateCount += 1;
          next[existingIndex] = { ...next[existingIndex], quantity: Number(next[existingIndex].quantity || 0) + 1 };
        } else {
          next.push({
            ...record,
            quantity: 1,
            reason: '',
            detail: '',
            mainAssetTag: '',
            mainAssetDesc: '',
          });
        }
      });
      return next;
    });
    setMaterialOpen(false);
    messageApi.success(duplicateCount ? '同类型耗材已合并并增加申请数量' : `已添加 ${records.length} 项耗材`);
  };

  const validate = () => {
    if (!items.length) return messageApi.warning('请至少添加一项耗材'), false;
    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) return messageApi.warning('申请数量必须为大于等于1的整数'), false;
    if (items.some((item) => !item.reason)) return messageApi.warning('请填写每行申请原因'), false;
    if (items.some((item) => !item.detail.trim())) return messageApi.warning('请填写每行详细说明'), false;
    if (items.some((item) => item.requiresMainAsset && !item.mainAssetTag)) return messageApi.warning('需关联主资产的耗材必须选择主资产标签号'), false;
    return true;
  };

  const submit = () => {
    const application = createConsumableApplication(items);
    setItems([]);
    setPreview(false);
    messageApi.success(`耗材申请已提交，申请单号：${application.id}`);
  };

  const columns = [
    { title: '耗材说明', dataIndex: 'materialDesc', width: 220 },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'center', render: (value, record) => preview ? value : <InputNumber min={1} precision={0} value={value} onChange={(next) => updateItem(record.id, { quantity: next || 1 })} /> },
    { title: '申请原因', dataIndex: 'reason', width: 170, render: (value, record) => preview ? (value || '-') : <Select className="w-full" value={value || undefined} placeholder="请选择" options={CONSUMABLE_REASON_OPTIONS.map((option) => ({ label: option, value: option }))} onChange={(next) => updateItem(record.id, { reason: next })} /> },
    {
      title: '主资产标签号',
      dataIndex: 'mainAssetTag',
      width: 190,
      render: (value, record) => {
        if (!record.requiresMainAsset) return '-';
        if (preview) return value || '-';
        const options = CONSUMABLE_MAIN_ASSETS.filter((asset) => !record.mainAssetCategory || asset.category === record.mainAssetCategory);
        return <Select className="w-full" value={value || undefined} placeholder="请选择主资产" options={options.map((asset) => ({ label: asset.assetTag, value: asset.assetTag }))} onChange={(next) => {
          const asset = options.find((item) => item.assetTag === next);
          updateItem(record.id, { mainAssetTag: next, mainAssetDesc: asset?.assetDesc || '' });
        }} />;
      },
    },
    { title: '主资产说明', dataIndex: 'mainAssetDesc', width: 230, render: (value, record) => record.requiresMainAsset ? (value || '-') : '-' },
    { title: '详细说明', dataIndex: 'detail', width: 280, render: (value, record) => preview ? (value || '-') : <TextArea rows={2} maxLength={400} showCount value={value} placeholder="必填，最多400字" onChange={(event) => updateItem(record.id, { detail: event.target.value })} /> },
    ...(!preview ? [{ title: '操作', width: 70, align: 'center', render: (_, record) => <Button danger type="link" size="small" onClick={() => setItems((current) => current.filter((item) => item.id !== record.id))}>删除</Button> }] : []),
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader title={preview ? '耗材申请预览' : '耗材申请'} />
      <Card size="small" title={preview ? '申请耗材信息' : '申领耗材信息'} extra={!preview ? <Space><Typography.Text type="secondary">共 {total} 件</Typography.Text><Button type="primary" onClick={() => setMaterialOpen(true)}>添加耗材</Button></Space> : <Typography.Text type="secondary">共 {total} 件</Typography.Text>}>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={items} pagination={false} scroll={{ x: 1200 }} locale={{ emptyText: <Empty description="请添加申请耗材" /> }} />
      </Card>
      <Card size="small">
        <div className="flex justify-center gap-3">
          {preview ? (
            <><Button onClick={() => setPreview(false)}>上一步</Button><Button type="primary" onClick={submit}>提交</Button></>
          ) : (
            <><Button type="primary" onClick={() => validate() && setPreview(true)}>预览</Button><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button></>
          )}
        </div>
      </Card>
      <Modal title="申请须知" open={noticeOpen} closable={false} maskClosable={false} footer={null}>
        <Typography.Title level={5}>【申请原则】</Typography.Title>
        {CONSUMABLE_APPLICATION_NOTICE.map((item, index) => <Typography.Paragraph key={item}>{index + 1}、{item}</Typography.Paragraph>)}
        <div className="flex justify-center"><Button type="primary" onClick={() => setNoticeOpen(false)}>已阅读</Button></div>
      </Modal>
      <MaterialSelectModal open={materialOpen} onCancel={() => setMaterialOpen(false)} onConfirm={addItems} />
    </Space>
  );
}

export function ConsumableMisApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const application = useMemo(() => getConsumableWorkflowState().applications.find((item) => item.status === '处理中' && item.currentNode === 'MIS鉴定') || null, [version]);
  const visibleItems = application?.items.filter((item) => item.requiresMis && item.lineStatus !== '已驳回') || [];
  const [values, setValues] = useState({});

  const mergedValues = useMemo(() => Object.fromEntries(visibleItems.map((item) => [item.id, { misOpinion: values[item.id]?.misOpinion ?? item.misOpinion, misDescription: values[item.id]?.misDescription ?? item.misDescription }])), [visibleItems, values]);
  const decide = (decision) => {
    if (visibleItems.some((item) => !mergedValues[item.id]?.misOpinion)) return messageApi.warning('MIS 意见未选择!');
    if (visibleItems.some((item) => !mergedValues[item.id]?.misDescription?.trim())) return messageApi.warning('意见说明未填写!');
    const requiredOpinion = decision === '同意' ? '同意申请' : '不同意申请';
    if (visibleItems.some((item) => mergedValues[item.id]?.misOpinion !== requiredOpinion)) return messageApi.warning(`请将全部 MIS 意见选择为“${requiredOpinion}”`);
    saveMisDraft(application.id, mergedValues);
    submitMisDecision(application.id, decision, mergedValues);
    setValues({});
    setVersion((current) => current + 1);
    messageApi.success(decision === '同意' ? 'MIS鉴定已通过，进入5级审批' : 'MIS鉴定已驳回相关申请行');
  };
  if (!application) return <EmptyPage contextHolder={contextHolder} description="暂无待鉴定的耗材申请" onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })} />;

  const columns = [
    { title: '耗材说明', dataIndex: 'materialDesc', width: 210 },
    { title: '配置', dataIndex: 'config', width: 170 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '申请原因', dataIndex: 'reason', width: 150 },
    { title: '详细说明', dataIndex: 'detail', width: 220 },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 170, render: (value) => value || '-' },
    { title: '主资产说明', dataIndex: 'mainAssetDesc', width: 220, render: (value) => value || '-' },
    { title: 'MIS意见', width: 160, render: (_, record) => <Select className="w-full" value={mergedValues[record.id]?.misOpinion || undefined} placeholder="请选择" options={['同意申请', '不同意申请'].map((option) => ({ label: option, value: option }))} onChange={(next) => setValues((current) => ({ ...current, [record.id]: { ...mergedValues[record.id], misOpinion: next } }))} /> },
    { title: '意见说明', width: 240, render: (_, record) => <TextArea rows={2} maxLength={400} showCount value={mergedValues[record.id]?.misDescription || ''} onChange={(event) => setValues((current) => ({ ...current, [record.id]: { ...mergedValues[record.id], misDescription: event.target.value } }))} /> },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader title="耗材 MIS 鉴定" numberLabel="申请单号" number={application.id} />
      <ApplicantCard applicant={application.applicant} applyDate={application.applyDate} />
      <Card size="small" title="申请耗材信息"><Table rowKey="id" size="small" bordered columns={columns} dataSource={visibleItems} pagination={false} scroll={{ x: 1650 }} /></Card>
      <ApprovalHistoryCard records={application.history} />
      <Card size="small"><div className="flex justify-center gap-3"><Button type="primary" onClick={() => decide('同意')}>同意</Button><Button danger onClick={() => decide('驳回')}>驳回</Button><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button></div></Card>
    </Space>
  );
}

export function ConsumableLeaderApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const [countersignOpen, setCountersignOpen] = useState(false);
  const [countersignPerson, setCountersignPerson] = useState('');
  const application = useMemo(() => getConsumableWorkflowState().applications.find((item) => item.status === '处理中' && item.currentNode === '5级审批') || null, [version]);
  const decide = (decision) => {
    if (decision === '驳回' && !comment.trim()) return messageApi.warning('驳回时审批意见必填');
    submitLeaderDecision(application.id, decision, comment.trim());
    setComment('');
    setVersion((current) => current + 1);
    messageApi.success(decision === '同意' ? '审批已通过，已按申请行生成耗材配给单' : '耗材申请已驳回');
  };
  if (!application) return <EmptyPage contextHolder={contextHolder} description="暂无待审批的耗材申请" onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })} />;
  const columns = [
    { title: '耗材说明', dataIndex: 'materialDesc', width: 210 },
    { title: '配置', dataIndex: 'config', width: 170 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '申请原因', dataIndex: 'reason', width: 150 },
    { title: '详细说明', dataIndex: 'detail', width: 220 },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 170, render: (value) => value || '-' },
    { title: '主资产说明', dataIndex: 'mainAssetDesc', width: 220, render: (value) => value || '-' },
    { title: 'MIS鉴定结果', dataIndex: 'misOpinion', width: 140, render: (value) => value || '-' },
    { title: 'MIS鉴定说明', dataIndex: 'misDescription', width: 220, render: (value) => value || '-' },
    { title: '行状态', dataIndex: 'lineStatus', width: 110, align: 'center', render: (value) => <StatusTag value={value} type="business" /> },
  ];
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader title="耗材申请审批" numberLabel="申请单号" number={application.id} />
      <ApplicantCard applicant={application.applicant} applyDate={application.applyDate} />
      <Card size="small" title="申请耗材信息"><Table rowKey="id" size="small" bordered columns={columns} dataSource={application.items} pagination={false} scroll={{ x: 1700 }} /></Card>
      <ApprovalHistoryCard records={application.history} />
      <Card size="small" title="审批操作">
        <TextArea rows={3} maxLength={400} showCount value={comment} placeholder="同意时可不填写，驳回时必填" onChange={(event) => setComment(event.target.value)} />
        <div className="mt-4 flex justify-center gap-3"><Button type="primary" onClick={() => decide('同意')}>同意</Button><Button danger onClick={() => decide('驳回')}>驳回</Button><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button><Button onClick={() => setCountersignOpen(true)}>加签</Button></div>
      </Card>
      <Modal title="加签" open={countersignOpen} onCancel={() => setCountersignOpen(false)} onOk={() => {
        if (!countersignPerson.trim()) return messageApi.warning('请输入加签人员');
        messageApi.success(`已加签：${countersignPerson.trim()}`);
        setCountersignPerson('');
        setCountersignOpen(false);
      }} okText="确认加签" cancelText="取消"><Input value={countersignPerson} placeholder="请输入姓名或工号" onChange={(event) => setCountersignPerson(event.target.value)} /></Modal>
    </Space>
  );
}

export function ConsumableAllocationPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [matchingStatus, setMatchingStatus] = useState('');
  const [rejectType, setRejectType] = useState('');
  const [esAdvice, setEsAdvice] = useState('');
  const [matchedStock, setMatchedStock] = useState(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [countersignOpen, setCountersignOpen] = useState(false);
  const allocation = useMemo(() => getConsumableWorkflowState().allocations.find((item) => item.status === '待配给') || null, [version]);
  const reset = () => { setMatchingStatus(''); setRejectType(''); setEsAdvice(''); setMatchedStock(null); };
  const submit = (rejected = false) => {
    if (!allocation) return;
    if (rejected) {
      if (matchingStatus !== '驳回') return messageApi.warning('驳回时匹配状态必须选择“驳回”');
      if (!rejectType) return messageApi.warning('请选择驳回类型');
      if (!esAdvice.trim()) return messageApi.warning('驳回时 ES 建议必填');
    } else {
      if (!['库存领用', '统一采购'].includes(matchingStatus)) return messageApi.warning('提交时匹配状态只能选择“库存领用”或“统一采购”');
      if (matchingStatus === '库存领用' && !matchedStock) return messageApi.warning('库存领用必须匹配耗材');
    }
    submitAllocationDecision(allocation.id, { matchingStatus, rejectType, esAdvice: esAdvice.trim(), matchedStock });
    reset();
    setVersion((current) => current + 1);
    messageApi.success(rejected ? '耗材配给单已驳回' : matchingStatus === '库存领用' ? '已生成耗材领用单' : '已转入耗材汇总采购');
  };
  if (!allocation) return <EmptyPage contextHolder={contextHolder} description="暂无待配给的耗材申请" onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })} />;
  const item = allocation.item;
  const detailColumns = [
    { title: '耗材说明', dataIndex: 'materialDesc', width: 220 },
    { title: '参考单价', dataIndex: 'referencePrice', width: 110, render: (value) => `¥${Number(value || 0).toFixed(2)}` },
    { title: '申请原因', dataIndex: 'reason', width: 160 },
    { title: '详细说明', dataIndex: 'detail', width: 220 },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'center' },
    { title: '主资产标签号', dataIndex: 'mainAssetTag', width: 170, render: (value) => value || '-' },
    { title: '主资产说明', dataIndex: 'mainAssetDesc', width: 220, render: (value) => value || '-' },
    { title: 'MIS鉴定结果', dataIndex: 'misOpinion', width: 140, render: (value) => value || '-' },
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
      <Card size="small" title="申请耗材明细"><Table rowKey="id" size="small" bordered columns={detailColumns} dataSource={[item]} pagination={false} scroll={{ x: 1400 }} /></Card>
      <Card size="small" title="ES 配给处理">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> 匹配状态</span>} span={3}>
            <Radio.Group value={matchingStatus} options={['库存领用', '统一采购', '驳回'].map((value) => ({ label: value, value }))} onChange={(event) => { setMatchingStatus(event.target.value); setMatchedStock(null); setRejectType(''); }} />
            {matchingStatus === '库存领用' && <Button className="ml-3" onClick={() => setStockOpen(true)}>匹配耗材</Button>}
          </Descriptions.Item>
          {matchingStatus === '库存领用' && <Descriptions.Item label="已匹配耗材" span={3}>{matchedStock ? `${matchedStock.assetTag} / ${matchedStock.materialDesc}` : '-'}</Descriptions.Item>}
          {matchingStatus === '驳回' && <Descriptions.Item label={<span><span className="text-red-500">*</span> 驳回类型</span>} span={3}><Select style={{ width: 320 }} value={rejectType || undefined} placeholder="请选择" options={['取消申请', '取消申请（填写错误）', '取消申请（转为资产申请）'].map((value) => ({ label: value, value }))} onChange={setRejectType} /></Descriptions.Item>}
          <Descriptions.Item label="ES 建议" span={3}><TextArea rows={4} maxLength={400} showCount value={esAdvice} placeholder="请输入 ES 建议" onChange={(event) => setEsAdvice(event.target.value)} /></Descriptions.Item>
        </Descriptions>
      </Card>
      <ApprovalHistoryCard records={allocation.history} />
      <Card size="small"><div className="flex justify-center gap-3"><Button type="primary" onClick={() => submit(false)}>提交</Button><Button danger onClick={() => submit(true)}>驳回</Button><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button><Button onClick={() => setCountersignOpen(true)}>加签</Button></div></Card>
      <Modal title="选择库存耗材" open={stockOpen} width={900} onCancel={() => setStockOpen(false)} footer={null}><Table rowKey="id" size="small" bordered columns={stockColumns} dataSource={CONSUMABLE_STOCK.filter((stock) => stock.materialDesc === item.materialDesc)} pagination={false} onRow={(record) => ({ onClick: () => { setMatchedStock(record); setStockOpen(false); } })} /></Modal>
      <Modal title="员工名下资产" open={assetsOpen} width={760} onCancel={() => setAssetsOpen(false)} footer={null}><Table rowKey="id" size="small" bordered pagination={false} dataSource={CONSUMABLE_MAIN_ASSETS} columns={[{ title: '资产标签号', dataIndex: 'assetTag' }, { title: '资产说明', dataIndex: 'assetDesc' }, { title: '资产状态', dataIndex: 'status', render: (value) => <StatusTag value={value} type="business" /> }]} /></Modal>
      <Modal title="加签" open={countersignOpen} onCancel={() => setCountersignOpen(false)} onOk={() => { messageApi.success('已发送加签待办'); setCountersignOpen(false); }} okText="确认加签" cancelText="取消"><Input placeholder="请输入具备耗材配给权限的人员" /></Modal>
    </Space>
  );
}

export function ConsumableClaimPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const claim = useMemo(() => getConsumableWorkflowState().claims.find((item) => item.status === '处理中' && ['库管员领用', '员工领用确认'].includes(item.currentNode)) || null, [version]);
  const [fields, setFields] = useState({});
  const [opinion, setOpinion] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const current = claim ? { ...claim, ...fields } : null;
  const updateField = (field, value) => setFields((state) => ({ ...state, [field]: value }));
  const primary = () => {
    if (!claim) return;
    const savedFields = {
      warehouse: current.warehouse,
      documentRemark: current.documentRemark,
      city: current.city,
      building: current.building,
      floor: current.floor,
      usageNote: current.usageNote,
      extendScrapDate: current.extendScrapDate,
      confirmationMode: current.confirmationMode,
    };
    saveClaimFields(claim.id, savedFields);
    if (claim.confirmationStatus === '待确认') return messageApi.info('员工尚未完成领用确认');
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
    if (!opinion.trim()) return messageApi.warning('弃领时处理意见必填');
    abandonConsumableClaim(claim.id, opinion.trim());
    messageApi.success('本次耗材领用已弃领');
    setVersion((value) => value + 1);
  };
  if (!claim) return <EmptyPage contextHolder={contextHolder} description="暂无待办理的耗材领用单" onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })} />;
  const item = claim.item;
  const isExtendable = item.materialType === '低值耐用品' && ['内存', '硬盘'].includes(item.subCategory) && item.mainAssetTag;
  const primaryText = claim.confirmationStatus === '已确认' ? '执行出库' : claim.confirmationStatus === '待确认' ? '等待员工确认' : '发起领用确认';
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader title="耗材领用" numberLabel="领用单号" number={claim.id} />
      <Card size="small" title="申请人信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label={<span><span className="text-red-500">*</span> 当前仓库</span>} span={3}><Select style={{ width: 420, maxWidth: '100%' }} value={current.warehouse} options={['北京总部耗材仓', '北京搜狐媒体大厦仓', '上海办公区耗材仓'].map((value) => ({ label: value, value }))} onChange={(value) => updateField('warehouse', value)} /></Descriptions.Item>
          <Descriptions.Item label="申请人">{claim.applicant.id}-{claim.applicant.name}</Descriptions.Item>
          <Descriptions.Item label="申请日期">{claim.applyDate}</Descriptions.Item>
          <Descriptions.Item label="公司">{claim.applicant.company}</Descriptions.Item>
          <Descriptions.Item label="办公区">{claim.applicant.officeArea}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{claim.applicant.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{claim.applicant.email}</Descriptions.Item>
          <Descriptions.Item label="部门" span={3}>{formatDepartment(claim.applicant.department)}</Descriptions.Item>
          <Descriptions.Item label="单据备注" span={3}><TextArea rows={2} maxLength={400} showCount value={current.documentRemark} onChange={(event) => updateField('documentRemark', event.target.value)} /></Descriptions.Item>
        </Descriptions>
      </Card>
      <Card size="small" title="申请耗材明细">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="耗材标签号">{item.materialType === '低值耐用品' ? (claim.stock?.assetTag || '-') : '-'}</Descriptions.Item>
          <Descriptions.Item label="序列号">{item.materialType === '低值耐用品' ? (claim.stock?.serialNo || '-') : '-'}</Descriptions.Item>
          <Descriptions.Item label="实际耗材说明">{item.materialDesc}</Descriptions.Item>
          <Descriptions.Item label="配置">{item.config || '-'}</Descriptions.Item>
          <Descriptions.Item label="数量">{item.quantity}</Descriptions.Item>
          <Descriptions.Item label="主资产标签号">{item.mainAssetTag || '-'}</Descriptions.Item>
          <Descriptions.Item label="主资产说明" span={3}>{item.mainAssetDesc || '-'}</Descriptions.Item>
          <Descriptions.Item label="申请原因">{item.reason}</Descriptions.Item>
          <Descriptions.Item label="详细说明" span={2}>{item.detail}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card size="small" title="领用信息维护">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="城市"><Select className="w-full" value={current.city} options={['北京市', '上海市', '广州市'].map((value) => ({ label: value, value }))} onChange={(value) => updateField('city', value)} /></Descriptions.Item>
          <Descriptions.Item label="楼宇"><Select className="w-full" value={current.building} options={['搜狐媒体大厦', '融科资讯中心', '上海办公区'].map((value) => ({ label: value, value }))} onChange={(value) => updateField('building', value)} /></Descriptions.Item>
          <Descriptions.Item label="楼层"><Select className="w-full" value={current.floor} options={['8层', '10层', '12层'].map((value) => ({ label: value, value }))} onChange={(value) => updateField('floor', value)} /></Descriptions.Item>
          <Descriptions.Item label="领用确认方式" span={3}><Radio.Group value={current.confirmationMode} options={['狐小e电子签', '刷卡确认'].map((value) => ({ label: value, value }))} onChange={(event) => updateField('confirmationMode', event.target.value)} /></Descriptions.Item>
          {isExtendable && <Descriptions.Item label="是否延长报废期"><Checkbox checked={current.extendScrapDate} onChange={(event) => updateField('extendScrapDate', event.target.checked)}>延长1年</Checkbox></Descriptions.Item>}
          {isExtendable && <Descriptions.Item label="ES实物报废期" span={2}>{current.esPhysicalScrapDate}</Descriptions.Item>}
          <Descriptions.Item label="使用说明" span={3}><TextArea rows={3} maxLength={400} showCount value={current.usageNote} onChange={(event) => updateField('usageNote', event.target.value)} /></Descriptions.Item>
          <Descriptions.Item label="确认状态" span={3}><StatusTag value={claim.confirmationStatus} type="business" /></Descriptions.Item>
        </Descriptions>
      </Card>
      <ApprovalHistoryCard records={claim.history} />
      <Card size="small" title="办理操作">
        <TextArea rows={2} maxLength={400} showCount value={opinion} placeholder="弃领时处理意见必填" onChange={(event) => setOpinion(event.target.value)} />
        <div className="mt-4 flex justify-center gap-3"><Button type="primary" disabled={claim.confirmationStatus === '待确认'} onClick={primary}>{primaryText}</Button><Button danger onClick={abandon}>弃领</Button><Button onClick={() => messageApi.success('领用通知已发送给申请人和库管员')}>发送领用通知</Button><Button onClick={() => setTransferOpen(true)}>转签</Button><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button></div>
      </Card>
      <Modal title="转签" open={transferOpen} onCancel={() => setTransferOpen(false)} onOk={() => { messageApi.success('已转签给具备当前仓库出库权限的人员'); setTransferOpen(false); }} okText="确认转签" cancelText="取消"><Select className="w-full" placeholder="请选择当前仓库有出库权限的人员" options={['119039-刘建', '213852-孙志强'].map((value) => ({ label: value, value }))} /></Modal>
    </Space>
  );
}

export function ConsumableClaimConfirmPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [confirmedResult, setConfirmedResult] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [read, setRead] = useState(false);
  const [signatureText, setSignatureText] = useState('');
  const claim = useMemo(() => getConsumableWorkflowState().claims.find((item) => item.status === '处理中' && item.currentNode === '员工领用确认' && item.confirmationStatus === '待确认') || null, [version]);
  const current = claim || confirmedResult;
  const confirm = (method, targetEmployeeId, signature = '') => {
    if (!claim) return;
    if (!read) return messageApi.warning('请先阅读并确认耗材保管职责');
    try {
      const updated = confirmConsumableClaim(claim.id, targetEmployeeId, method, signature);
      setConfirmedResult(updated);
      setEmployeeId('');
      setVersion((value) => value + 1);
      messageApi.success('员工耗材领用确认成功');
    } catch (error) {
      messageApi.error(error.message);
    }
  };
  if (!current) return <EmptyPage contextHolder={contextHolder} description="暂无待确认的耗材领用任务" onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })} />;
  const confirmed = Boolean(confirmedResult) || current.confirmationStatus === '已确认';
  const responsibility = '领用人确认已收到上述耗材，认同公司耗材仅作为工作用途使用。如无使用需要，应置于公司办公场所保存。领用人应承担妥善保管耗材的责任，除自然损耗外，不得人为损坏或者疏于维护。';
  const tabs = [
    {
      key: '电子签确认',
      label: '电子签确认',
      children: (
        <div className="pt-2">
          <div className="flex min-h-[150px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xl text-slate-500">{signatureText || '电子签名区域'}</div>
          <div className="mt-3 flex justify-center gap-3"><Button disabled={confirmed} onClick={() => setSignatureText('')}>清除</Button><Button type="primary" disabled={confirmed} onClick={() => {
            const signature = signatureText || `${current.applicant.name}（电子签名）`;
            setSignatureText(signature);
            confirm('狐小e电子签', current.applicant.id, signature);
          }}>确认签名</Button></div>
        </div>
      ),
    },
    {
      key: '刷卡/扫码确认',
      label: '刷卡/扫码确认',
      children: (
        <div className="grid gap-8 pt-2 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <div><Typography.Text strong>刷卡领用确认</Typography.Text><Space.Compact className="mt-3 w-full max-w-xl"><Input value={employeeId} disabled={confirmed} placeholder="请输入员工工号" onPressEnter={() => confirm('刷卡确认', employeeId.trim())} onChange={(event) => setEmployeeId(event.target.value)} /><Button type="primary" disabled={confirmed} onClick={() => confirm('刷卡确认', employeeId.trim())}>确认</Button></Space.Compact></div>
          <ConfirmationQr seed={`${current.id}-${current.item.materialDesc}`} disabled={confirmed} onConfirm={() => confirm('狐小e扫码确认', current.applicant.id)} />
        </div>
      ),
    },
  ];
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageHeader title="员工耗材领用确认" numberLabel="领用单号" number={current.id} />
      <Card size="small" title="领用确认信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="领用人">{current.applicant.id}-{current.applicant.name}</Descriptions.Item>
          <Descriptions.Item label="部门" span={2}>{formatDepartment(current.applicant.department)}</Descriptions.Item>
          <Descriptions.Item label="耗材说明">{current.item.materialDesc}</Descriptions.Item>
          <Descriptions.Item label="数量">{current.item.quantity}</Descriptions.Item>
          <Descriptions.Item label="耗材标签号">{current.stock?.assetTag || '-'}</Descriptions.Item>
          <Descriptions.Item label="主资产标签号">{current.item.mainAssetTag || '-'}</Descriptions.Item>
          <Descriptions.Item label="主资产说明" span={2}>{current.item.mainAssetDesc || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card size="small" title="确认提示及保管职责">
        <Typography.Paragraph type="danger" className="mb-3"><strong>保管职责：</strong>{responsibility}</Typography.Paragraph>
        <div className="flex justify-center"><Checkbox checked={read} disabled={confirmed} onChange={(event) => setRead(event.target.checked)}>我已阅读并确认耗材保管职责</Checkbox></div>
      </Card>
      <Card size="small" title="领用确认"><Tabs size="small" defaultActiveKey={current.confirmationMode === '刷卡确认' ? '刷卡/扫码确认' : '电子签确认'} items={tabs} />
        {confirmed && <div className="mt-5"><Descriptions bordered size="small" column={3}><Descriptions.Item label="识别员工工号">{current.confirmationEmployeeId}（{current.applicant.name}）</Descriptions.Item><Descriptions.Item label="确认时间">{current.confirmationTime || '-'}</Descriptions.Item><Descriptions.Item label="确认方式">{current.confirmationMethod || '-'}</Descriptions.Item><Descriptions.Item label="确认结果" span={3}><StatusTag value="已确认" type="business" /></Descriptions.Item></Descriptions><Alert className="mt-4" type="success" showIcon message="确认成功，库管员可继续执行耗材出库" /></div>}
      </Card>
      <Card size="small"><div className="flex justify-center"><Button onClick={() => navigate('/yewurules', { state: { workspace: '耗材领用' } })}>返回</Button></div></Card>
    </Space>
  );
}

export function ConsumableSummaryPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const summary = useMemo(() => getConsumableWorkflowState().summaries.find((item) => item.status === '草稿' && item.currentNode === 'ES汇总') || null, [version]);
  const [view, setView] = useState('list');
  const [draft, setDraft] = useState(null);
  const current = summary ? { ...summary, ...(draft || {}) } : null;
  const rows = current?.rows || [];
  const totalQuantity = rows.filter((row) => row.approved).reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const totalAmount = rows.filter((row) => row.approved).reduce((sum, row) => sum + Number(row.estimatedAmount || 0), 0);
  const updateRow = (id, patch) => setDraft((state) => ({ ...(state || {}), rows: rows.map((row) => row.id === id ? { ...row, ...patch } : row) }));
  const save = () => {
    updateSummary(summary.id, { summaryDescription: current.summaryDescription, projectPurpose: current.projectPurpose, rows });
    messageApi.success('耗材汇总草稿已保存');
    setVersion((value) => value + 1);
  };
  const submit = () => {
    save();
    submitSummary(summary.id);
    messageApi.success('耗材汇总已提交至 ES 主管审批');
    setVersion((value) => value + 1);
  };
  if (!summary) return <EmptyPage contextHolder={contextHolder} description="暂无待处理的耗材汇总草稿" onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })} />;
  const detailColumns = [
    { title: '申请人', dataIndex: 'applicant', width: 150 },
    { title: '申请部门', dataIndex: 'department', width: 220 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 220 },
    { title: '采购数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '预计费用（元）', dataIndex: 'estimatedAmount', width: 140, align: 'right', render: (value) => Number(value || 0).toFixed(2) },
    { title: '详情说明', dataIndex: 'detail', width: 180 },
    { title: 'ES建议', dataIndex: 'esAdvice', width: 240, render: (value, record) => <Input value={value} onChange={(event) => updateRow(record.id, { esAdvice: event.target.value })} /> },
    { title: '是否通过', dataIndex: 'approved', width: 140, render: (value, record) => <Radio.Group value={value} options={[{ label: '通过', value: true }, { label: '驳回', value: false }]} onChange={(event) => updateRow(record.id, { approved: event.target.value })} /> },
  ];
  const readonlyColumns = detailColumns.filter((column) => !['ES建议', '是否通过'].includes(column.title)).concat([
    { title: 'ES建议', dataIndex: 'esAdvice', width: 180 },
    { title: '汇总结果', dataIndex: 'approved', width: 100, render: (value) => <StatusTag value={value ? '已同意' : '已驳回'} type="business" /> },
  ]);
  if (view === 'list') return (
    <Space direction="vertical" size={16} className="w-full">{contextHolder}<PageHeader title="耗材汇总" /><Card size="small"><Table rowKey="id" size="small" bordered pagination={false} dataSource={[summary]} columns={[{ title: '汇总公司', dataIndex: 'company', render: (value) => <Button type="link" size="small" className="px-0" onClick={() => setView('detail')}>{value}</Button> }, { title: '申请数量', render: () => totalQuantity, width: 120, align: 'center' }, { title: '汇总周期', dataIndex: 'period', width: 220 }, { title: '操作', width: 100, render: () => <Button type="link" size="small" onClick={() => setView('detail')}>查看</Button> }]} /></Card></Space>
  );
  if (view === 'detail') return (
    <Space direction="vertical" size={16} className="w-full">{contextHolder}<PageHeader title="耗材汇总明细" numberLabel="汇总单号" number={summary.id} /><Card size="small" title="统一申请汇总"><Table rowKey="id" size="small" bordered columns={detailColumns} dataSource={rows} pagination={false} scroll={{ x: 1450 }} /></Card><Card size="small"><div className="flex justify-center gap-3"><Button type="primary" onClick={() => setView('summary')}>下一步</Button><Button onClick={save}>保存</Button><Button onClick={() => setView('list')}>返回</Button></div></Card></Space>
  );
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}<PageHeader title="耗材汇总申请" numberLabel="汇总单号" number={summary.id} />
      <Card size="small" title="ES 汇总说明"><TextArea rows={5} maxLength={1000} showCount value={current.summaryDescription} onChange={(event) => setDraft((state) => ({ ...(state || {}), summaryDescription: event.target.value }))} /></Card>
      <Card size="small" title="项目用途说明"><TextArea rows={3} maxLength={400} showCount value={current.projectPurpose} onChange={(event) => setDraft((state) => ({ ...(state || {}), projectPurpose: event.target.value }))} /><div className="mt-2 text-sm text-red-500">此信息将同步至 PR 系统。</div></Card>
      <Card size="small" title="公司汇总"><Descriptions bordered size="small" column={3}><Descriptions.Item label="汇总公司">{current.company}</Descriptions.Item><Descriptions.Item label="申请采购数量">{totalQuantity}</Descriptions.Item><Descriptions.Item label="预计采购费用（元）">{totalAmount.toFixed(2)}</Descriptions.Item></Descriptions></Card>
      <Card size="small" title="申请明细"><Table rowKey="id" size="small" bordered columns={readonlyColumns} dataSource={rows} pagination={false} scroll={{ x: 1350 }} /></Card>
      {current.poList?.length > 0 && <Card size="small" title="PO 单信息"><Table rowKey="poNo" size="small" bordered pagination={false} dataSource={current.poList} columns={[{ title: 'PO单号', dataIndex: 'poNo' }, { title: 'PO单状态', dataIndex: 'status' }]} /></Card>}
      <Card size="small"><div className="flex justify-center gap-3"><Button type="primary" onClick={submit}>提交</Button><Button onClick={() => setView('detail')}>修改</Button></div></Card>
    </Space>
  );
}

export function ConsumableSummaryApprovalPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [version, setVersion] = useState(0);
  const [comment, setComment] = useState('');
  const summary = useMemo(() => getConsumableWorkflowState().summaries.find((item) => item.status === '处理中' && ['ES主管', 'ES总监'].includes(item.currentNode)) || null, [version]);
  const decide = (decision) => {
    if (decision === '驳回' && !comment.trim()) return messageApi.warning('驳回时审批意见必填');
    approveSummary(summary.id, decision, comment.trim());
    setComment('');
    setVersion((value) => value + 1);
    messageApi.success(decision === '同意' ? '审批已通过并进入下一节点' : '已驳回至 ES 汇总草稿');
  };
  if (!summary) return <EmptyPage contextHolder={contextHolder} description="暂无待审批的耗材汇总申请" onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })} />;
  const columns = [
    { title: '申请人', dataIndex: 'applicant', width: 150 },
    { title: '申请部门', dataIndex: 'department', width: 220 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 220 },
    { title: '采购数量', dataIndex: 'quantity', width: 100, align: 'center' },
    { title: '预计费用（元）', dataIndex: 'estimatedAmount', width: 140, align: 'right', render: (value) => Number(value || 0).toFixed(2) },
    { title: '详情说明', dataIndex: 'detail', width: 180 },
    { title: 'ES建议', dataIndex: 'esAdvice', width: 180 },
    { title: '汇总结果', dataIndex: 'approved', width: 100, render: (value) => <StatusTag value={value ? '已同意' : '已驳回'} type="business" /> },
  ];
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}<PageHeader title="耗材汇总审批" numberLabel="汇总单号" number={summary.id} />
      <Card size="small" title="汇总信息"><Descriptions bordered size="small" column={3}><Descriptions.Item label="当前审批节点">{summary.currentNode}</Descriptions.Item><Descriptions.Item label="汇总公司">{summary.company}</Descriptions.Item><Descriptions.Item label="汇总周期">{summary.period}</Descriptions.Item><Descriptions.Item label="ES汇总说明" span={3}>{summary.summaryDescription}</Descriptions.Item><Descriptions.Item label="项目用途说明" span={3}>{summary.projectPurpose}</Descriptions.Item></Descriptions></Card>
      <Card size="small" title="申请明细"><Table rowKey="id" size="small" bordered columns={columns} dataSource={summary.rows} pagination={false} scroll={{ x: 1350 }} /></Card>
      <ApprovalHistoryCard records={summary.history} />
      <Card size="small" title="审批操作"><TextArea rows={3} maxLength={400} showCount value={comment} placeholder="同意时可不填写，驳回时必填" onChange={(event) => setComment(event.target.value)} /><div className="mt-4 flex justify-center gap-3"><Button type="primary" onClick={() => decide('同意')}>同意</Button><Button danger onClick={() => decide('驳回')}>驳回</Button><Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回</Button></div></Card>
    </Space>
  );
}
