import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { Download, Plus, Search, Trash2, Upload } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import { CURRENT_EMPLOYEE } from '../../mock/employeeSelfServiceMock';
import { INVENTORY_ASSET_POOL } from '../../mock/inventoryAssetPool';

const { TextArea } = Input;

const EMPTY_FILTERS = {
  documentNo: '',
  reason: '',
  status: '',
  company: '',
  outDept: '',
  outLocation: '',
  plate: '',
  inDept: '',
  inLocation: '',
  creator: '',
  createdFrom: '',
  createdTo: '',
};

const INITIAL_ROWS = [
  { id: 1, documentNo: 'AT-202608070001', applicationNo: 'ETA-202608070001', status: '已完成', company: '201.焦点互动', createdDate: '2026-08-07', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 2, documentNo: 'AT-202608060002', applicationNo: 'ETA-202608060022', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-06', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 3, documentNo: 'AT-202608060001', applicationNo: 'ETA-202608060021', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-06', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 4, documentNo: 'AT-202608040001', applicationNo: 'ETA-202608030001', status: '已完成', company: '112.北京新动力', createdDate: '2026-08-04', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 5, documentNo: 'AT-202607300021', applicationNo: 'ETA-202607290001', status: '已完成', company: '114.新媒体', createdDate: '2026-07-30', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 6, documentNo: 'AT-202607300001', applicationNo: 'ETA-202607280003', status: '已完成', company: '114.新媒体', createdDate: '2026-07-30', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 7, documentNo: 'AT-202607290001', applicationNo: 'ETA-202607280002', status: '已完成', company: '114.新媒体', createdDate: '2026-07-29', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 8, documentNo: 'AT-202607280001', applicationNo: 'ETA-202607280001', status: '已完成', company: '132.千钧', createdDate: '2026-07-28', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 9, documentNo: 'AT-202607240002', applicationNo: 'ETA-202607240021', status: '已完成', company: '112.北京新动力', createdDate: '2026-07-24', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
  { id: 10, documentNo: 'AT-202607240001', applicationNo: 'ETA-202607230002', status: '已完成', company: '114.新媒体', createdDate: '2026-07-24', creator: 'admin-系统管理员', quantity: 1, reason: '', outDept: '', outLocation: '', plate: '', inDept: '', inLocation: '', lines: [] },
];

const DEFAULT_FINANCIAL_COMPANY = '114.新媒体';
const CURRENT_EMPLOYEE_COMPANY = CURRENT_EMPLOYEE.company || '';
const CURRENT_LOGIN_USER = `${CURRENT_EMPLOYEE.id}-${CURRENT_EMPLOYEE.name}`;

const SOURCE_ASSETS = INVENTORY_ASSET_POOL
  .filter((item) => item.materialGroup === '1.资产')
  .map((item) => {
    const [ownerId = '', ...ownerNameParts] = String(item.responsiblePerson || '').split('-');
    return {
      ...item,
      assetQty: Number(item.quantity || item.availableQty || 1),
      brand: item.brand || String(item.materialDesc || '').split('.')[0] || '',
      model: item.model || '',
      ownerId,
      ownerName: ownerNameParts.join('-'),
    };
  });

const COMPANY_OPTIONS = [...new Set([
  DEFAULT_FINANCIAL_COMPANY,
  ...SOURCE_ASSETS.map((item) => item.company),
  '117.焦点互动',
  '112.北京新动力',
  '132.千钧',
].filter(Boolean))];
const PURPOSE_OPTIONS = ['员工用机', '部门公用', '其他用途', '专业用途'];
const RECEIVER_OPTIONS = [
  {
    id: 'current',
    name: CURRENT_LOGIN_USER,
    company: CURRENT_EMPLOYEE_COMPANY,
    department: CURRENT_EMPLOYEE.department || '',
    plate: '',
    costCenter: CURRENT_EMPLOYEE.costCenter || '',
  },
  { id: 1, name: '114111-杨羊', company: '', department: '集团总部.员工服务中心.资产部', plate: '0.*', costCenter: '0.*' },
];
const SIMPLE_ZERO_OPTION = [{ id: 1, name: '0.*' }];

function isServerAsset(asset) {
  const values = [asset?.materialGroup, asset?.assetClass, asset?.assetSubClass]
    .map((value) => String(value || '').toUpperCase());
  return values.some((value) => value.includes('SERVER') || value.includes('服务器'));
}

function hasSpecialNoInfo(asset) {
  return Boolean(
    asset?.isNoSpecial
    || asset?.noLocation
    || asset?.service
    || asset?.subService
  );
}

function compareText(left, right) {
  return String(left || '').localeCompare(String(right || ''), 'zh-CN', { numeric: true });
}

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function inDateRange(value, from, to) {
  if (!value) return !from && !to;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function toSelectData(values) {
  return [...new Set(values.filter(Boolean))].map((name, index) => ({ id: index + 1, name }));
}

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function RequiredLabel({ children }) {
  return <><span className="text-[#ff4d4f] mr-1">*</span>{children}</>;
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} />} />
    </div>
  );
}

function SelectorModal({ config, onClose }) {
  if (!config) return null;
  return <SelectModal open title={config.title} width={config.width || 700} dataSource={config.dataSource || []} columns={config.columns || [{ title: '名称', dataIndex: 'name' }]} searchFields={config.searchFields || [{ label: '名称', name: 'name', dataIndex: 'name' }]} onCancel={onClose} onConfirm={(record) => { config.onConfirm(record); onClose(); }} />;
}

function TransferItemModal({ open, currentCompany, availableAssets, initialLine, onCancel, onConfirm }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [asset, setAsset] = useState(initialLine ? { ...initialLine } : null);
  const [selectorType, setSelectorType] = useState('');
  const [form, setForm] = useState(() => ({
    inPerson: initialLine?.inPerson || '',
    inCompany: initialLine?.inCompany || '',
    inPlate: initialLine?.inPlate || '',
    inDept: initialLine?.inDept || '',
    inCostCenter: initialLine?.inCostCenter || '',
    city: initialLine?.city || '',
    building: initialLine?.building || '',
    floor: initialLine?.floor || '',
    room: initialLine?.room || '',
    purpose: initialLine?.purpose || '',
    businessLine: initialLine?.targetBusinessLine || '0.*',
    project: initialLine?.targetProject || '0.*',
    transferReason: initialLine?.transferReason || '',
    transferDate: initialLine?.transferDate || dayjs().format('YYYY-MM-DD'),
    usageDescription: initialLine?.usageDescription || '',
    newSn: initialLine?.newSn || '',
    newNoLocation: initialLine?.newNoLocation || '',
    newService: initialLine?.newService || '',
    newSubService: initialLine?.newSubService || '',
  }));
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value || '' }));
  const chooseAsset = (record) => {
    const receiver = RECEIVER_OPTIONS.find((item) => item.name === form.inPerson);
    setAsset({ ...record });
    setForm((current) => ({
      ...current,
      inPlate: receiver?.plate || current.inPlate,
      inDept: receiver?.department || current.inDept,
      inCostCenter: isServerAsset(record) ? (record.costCenter || '') : (receiver?.costCenter || current.inCostCenter),
    }));
  };
  const selectorConfig = {
    asset: {
      title: '选择转移资产',
      width: 960,
      dataSource: availableAssets || [],
      columns: [
        { title: '标签号', dataIndex: 'assetTag', width: 150 },
        { title: '公司', dataIndex: 'company', width: 130 },
        { title: '板块', dataIndex: 'plate', width: 120, render: (value) => value || '-' },
        { title: '资产大类', dataIndex: 'assetClass', width: 130, render: (value) => value || '-' },
        { title: '资产小类', dataIndex: 'assetSubClass', width: 150, render: (value) => value || '-' },
        { title: '资产说明', dataIndex: 'materialDesc', width: 220 },
        { title: '品牌', dataIndex: 'brand', width: 100, render: (value) => value || '-' },
        { title: '数量', dataIndex: 'quantity', width: 90, align: 'right' },
        { title: '原值', dataIndex: 'originalValue', width: 110, align: 'right', render: (value) => value === 0 ? 0 : (value || '-') },
        { title: '资产责任人', dataIndex: 'responsiblePerson', width: 150, render: (value) => value || '-' },
        { title: '资产状态', dataIndex: 'assetStatus', width: 130, render: (value) => value || '-' },
        { title: '成本中心', dataIndex: 'costCenter', width: 150, render: (value) => value || '-' },
        { title: '启用日期', dataIndex: 'enabledDate', width: 120, render: (value) => value || '-' },
      ],
      searchFields: [
        { label: '标签号', name: 'assetTag', dataIndex: 'assetTag' },
        { label: 'SN号', name: 'sn', dataIndex: 'sn' },
        { label: '板块', name: 'plate', dataIndex: 'plate' },
        { label: '资产说明', name: 'materialDesc', dataIndex: 'materialDesc' },
      ],
      onConfirm: chooseAsset,
    },
    receiver: {
      title: '选择转入人',
      dataSource: RECEIVER_OPTIONS,
      onConfirm: (record) => setForm((current) => ({
        ...current,
        inPerson: record.name,
        inCompany: record.company || '',
        inPlate: record.plate || '',
        inDept: record.department || '',
        inCostCenter: isServerAsset(asset) ? (asset?.costCenter || '') : (record.costCenter || ''),
      })),
    },
    city: { title: '选择 City', dataSource: [{ id: 1, name: '北京市' }], onConfirm: (record) => update('city', record.name) },
    building: { title: '选择 Building', dataSource: [{ id: 1, name: '搜狐媒体大厦' }], onConfirm: (record) => update('building', record.name) },
    businessLine: { title: '选择业务线', dataSource: SIMPLE_ZERO_OPTION, onConfirm: (record) => update('businessLine', record.name) },
    project: { title: '选择项目', dataSource: SIMPLE_ZERO_OPTION, onConfirm: (record) => update('project', record.name) },
  }[selectorType];

  const submit = (keepOpen) => {
    if (!asset) return messageApi.warning('请先选择资产');
    const required = [['转入人', form.inPerson], ['转入成本中心', form.inCostCenter], ['City', form.city], ['Building', form.building], ['Floor', form.floor], ['用途', form.purpose], ['转移日期', form.transferDate]];
    const missing = required.find(([, value]) => !value);
    if (missing) return messageApi.warning(`请填写${missing[0]}`);

    const commit = () => {
      onConfirm({
        ...asset,
        ...form,
        transferQty: Number(asset.assetQty || asset.availableQty || 1),
        outPerson: asset.responsiblePerson || '',
        outCostCenter: asset.costCenter || '',
        targetAssetStatus: asset.assetStatus || '',
        targetBusinessLine: form.businessLine,
        targetProject: form.project,
      }, keepOpen);
      if (keepOpen) {
        setAsset(null);
        setForm((current) => ({ ...current, transferReason: '', usageDescription: '' }));
      }
    };

    const companyMismatch = asset.company && form.inCompany && asset.company !== form.inCompany;
    const plateMismatch = asset.plate && form.inPlate && asset.plate !== form.inPlate;
    if (companyMismatch || plateMismatch) {
      Modal.confirm({
        title: '确认保存转移明细？',
        content: '待转移物资公司或板块同转入人信息不一致，是否确认？',
        okText: '确认',
        cancelText: '取消',
        onOk: commit,
      });
      return undefined;
    }

    commit();
    return undefined;
  };

  return (
    <Modal open={open} title="添加转移物资" width={1000} rootClassName="mmp-transfer-item-modal" onCancel={onCancel} destroyOnHidden footer={[
      <Button key="continue" type="primary" onClick={() => submit(true)}>添加并继续</Button>,
      <Button key="close" type="primary" onClick={() => submit(false)}>添加并关闭</Button>,
      <Button key="cancel" onClick={onCancel}>取消</Button>,
    ]}>
      {contextHolder}
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Text>当前财务公司：{currentCompany || '-'}</Typography.Text>
        <Card size="small" title="选择转移资产">
          <DetailGrid columns={1} labelWidth={96}>
            <DetailItem label="转移资产"><LookupInput value={asset?.assetTag || ''} placeholder="请选择转移资产" onOpen={() => setSelectorType('asset')} /></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="物资信息">
          <DetailGrid columns={4} labelWidth={96}>
            <DetailItem label="资产标签号"><Readonly>{asset?.assetTag}</Readonly></DetailItem>
            <DetailItem label="SN号"><Readonly>{asset?.sn}</Readonly></DetailItem>
            <DetailItem label="物资说明"><Readonly>{asset?.materialDesc}</Readonly></DetailItem>
            <DetailItem label="可用数量"><Readonly>{asset?.availableQty}</Readonly></DetailItem>
            <DetailItem label="物资总类"><Readonly>{asset?.materialGroup}</Readonly></DetailItem>
            <DetailItem label="物资大类"><Readonly>{asset?.assetClass}</Readonly></DetailItem>
            <DetailItem label="物资小类"><Readonly>{asset?.assetSubClass}</Readonly></DetailItem>
            <DetailItem label="资产数量"><Readonly>{asset?.assetQty}</Readonly></DetailItem>
            <DetailItem label="品牌"><Readonly>{asset?.brand}</Readonly></DetailItem>
            <DetailItem label="规格/型号"><Readonly>{asset?.model}</Readonly></DetailItem>
            <DetailItem label="配置"><Readonly>{asset?.config}</Readonly></DetailItem>
            <DetailItem label="计量单位"><Readonly>{asset?.unit}</Readonly></DetailItem>
            <DetailItem label="资产标记"><Readonly>{asset?.assetMark}</Readonly></DetailItem>
            <DetailItem label="原值"><Readonly>{asset?.originalValue}</Readonly></DetailItem>
            <DetailItem label="净值"><Readonly>{asset?.netValue}</Readonly></DetailItem>
            <DetailItem label="资产状态"><Readonly>{asset?.assetStatus}</Readonly></DetailItem>
            <DetailItem label="公司"><Readonly>{asset?.company}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{asset?.plate}</Readonly></DetailItem>
            <DetailItem label="部门"><Readonly>{asset?.department}</Readonly></DetailItem>
            <DetailItem label="成本中心"><Readonly>{asset?.costCenter}</Readonly></DetailItem>
            <DetailItem label="业务线"><Readonly>{asset?.businessLine}</Readonly></DetailItem>
            <DetailItem label="项目"><Readonly>{asset?.project}</Readonly></DetailItem>
            <DetailItem label="费用账户"><Readonly>{asset?.expenseAccount}</Readonly></DetailItem>
            <DetailItem label="责任人"><Readonly>{asset?.responsiblePerson}</Readonly></DetailItem>
            <DetailItem label="City"><Readonly>{asset?.city}</Readonly></DetailItem>
            <DetailItem label="Building"><Readonly>{asset?.building}</Readonly></DetailItem>
            <DetailItem label="Floor"><Readonly>{asset?.floor}</Readonly></DetailItem>
            <DetailItem label="Room"><Readonly>{asset?.room}</Readonly></DetailItem>
            <DetailItem label="启用日期"><Readonly>{asset?.enabledDate}</Readonly></DetailItem>
            <DetailItem label="印刷号"><Readonly>{asset?.printNo}</Readonly></DetailItem>
            <DetailItem label="用途"><Readonly>{asset?.usage}</Readonly></DetailItem>
            <DetailItem label="备注"><Readonly>{asset?.remark}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="转移单信息">
          <DetailGrid columns={4} labelWidth={108}>
            <DetailItem label={<RequiredLabel>转入人</RequiredLabel>}><LookupInput value={form.inPerson} placeholder="请选择转入人" onOpen={() => setSelectorType('receiver')} /></DetailItem>
            <DetailItem label="转入板块"><Readonly>{form.inPlate}</Readonly></DetailItem>
            <DetailItem label="转入部门"><Readonly>{form.inDept}</Readonly></DetailItem>
            <DetailItem label={<RequiredLabel>转入成本中心</RequiredLabel>}><Readonly>{form.inCostCenter}</Readonly></DetailItem>
            <DetailItem label={<RequiredLabel>City</RequiredLabel>}><LookupInput value={form.city} placeholder="请选择 City" onOpen={() => setSelectorType('city')} /></DetailItem>
            <DetailItem label={<RequiredLabel>Building</RequiredLabel>}><LookupInput value={form.building} placeholder="请选择 Building" onOpen={() => setSelectorType('building')} /></DetailItem>
            <DetailItem label={<RequiredLabel>Floor</RequiredLabel>}><Select className="w-full" value={form.floor || undefined} placeholder="请选择" options={['17层'].map((value) => ({ label: value, value }))} onChange={(value) => update('floor', value)} /></DetailItem>
            <DetailItem label="Room"><Input value={form.room} onChange={(event) => update('room', event.target.value)} /></DetailItem>
            <DetailItem label={<RequiredLabel>用途</RequiredLabel>}><Select className="w-full" value={form.purpose || undefined} placeholder="请选择" options={PURPOSE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => update('purpose', value)} /></DetailItem>
            <DetailItem label="资产状态"><Readonly>{asset?.assetStatus}</Readonly></DetailItem>
            <DetailItem label="业务线"><LookupInput value={form.businessLine} placeholder="请选择业务线" onOpen={() => setSelectorType('businessLine')} /></DetailItem>
            <DetailItem label="项目"><LookupInput value={form.project} placeholder="请选择项目" onOpen={() => setSelectorType('project')} /></DetailItem>
            <DetailItem label="转移原因" span={3}><Input value={form.transferReason} onChange={(event) => update('transferReason', event.target.value)} /></DetailItem>
            <DetailItem label={<RequiredLabel>转移日期</RequiredLabel>}><DatePicker className="w-full" value={form.transferDate ? dayjs(form.transferDate) : null} format="YYYY-MM-DD" onChange={(date) => update('transferDate', date ? date.format('YYYY-MM-DD') : '')} /></DetailItem>
            <DetailItem label="使用说明" span={4}><TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={form.usageDescription} onChange={(event) => update('usageDescription', event.target.value)} /></DetailItem>
          </DetailGrid>
        </Card>

        {hasSpecialNoInfo(asset) && (
          <Card size="small" title="NO 资产变更信息">
            <DetailGrid columns={4} labelWidth={108}>
              <DetailItem label="原 SN 号"><Readonly>{asset?.sn}</Readonly></DetailItem>
              <DetailItem label="新 SN 号"><Input value={form.newSn} onChange={(event) => update('newSn', event.target.value)} /></DetailItem>
              <DetailItem label="原 NO 地点"><Readonly>{asset?.noLocation}</Readonly></DetailItem>
              <DetailItem label="新 NO 地点"><Input value={form.newNoLocation} onChange={(event) => update('newNoLocation', event.target.value)} /></DetailItem>
              <DetailItem label="原服务"><Readonly>{asset?.service}</Readonly></DetailItem>
              <DetailItem label="新服务"><Input value={form.newService} onChange={(event) => update('newService', event.target.value)} /></DetailItem>
              <DetailItem label="原子服务"><Readonly>{asset?.subService}</Readonly></DetailItem>
              <DetailItem label="新子服务"><Input value={form.newSubService} onChange={(event) => update('newSubService', event.target.value)} /></DetailItem>
            </DetailGrid>
          </Card>
        )}
      </Space>
      <SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />
    </Modal>
  );
}

function exportTransferDetail(transferDocument) {
  const headers = ['行号', '资产标签号', 'SN号', '物资说明', '转移数量', '转出人', '转出成本中心', '转入人', '转入成本中心', 'City', 'Building', 'Floor', 'Room', '转移日期', '用途', '使用说明'];
  const rows = (transferDocument.lines || []).map((line, index) => [
    index + 1,
    line.assetTag,
    line.sn,
    line.materialDesc,
    line.transferQty,
    line.outPerson,
    line.outCostCenter,
    line.inPerson,
    line.inCostCenter,
    line.city,
    line.building,
    line.floor,
    line.room,
    line.transferDate,
    line.purpose,
    line.usageDescription,
  ]);
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${transferDocument.documentNo || '转移单'}-明细.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function TransferDetail({ document: transferDocument, onBack }) {
  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: 'SN号', dataIndex: 'sn', width: 160, render: (value) => value || '-' },
    { title: '物资说明', dataIndex: 'materialDesc', width: 260 },
    { title: '转移数量', dataIndex: 'transferQty', width: 100, align: 'right' },
    { title: '转出人', dataIndex: 'outPerson', width: 160, render: (value) => value || '-' },
    { title: '转出成本中心', dataIndex: 'outCostCenter', width: 180, render: (value) => value || '-' },
    { title: '转入人', dataIndex: 'inPerson', width: 160, render: (value) => value || '-' },
    { title: '转入成本中心', dataIndex: 'inCostCenter', width: 180, render: (value) => value || '-' },
    { title: 'City', dataIndex: 'city', width: 120, render: (value) => value || '-' },
    { title: 'Building', dataIndex: 'building', width: 180, render: (value) => value || '-' },
    { title: 'Floor', dataIndex: 'floor', width: 100, render: (value) => value || '-' },
    { title: 'Room', dataIndex: 'room', width: 100, render: (value) => value || '-' },
    { title: '转移日期', dataIndex: 'transferDate', width: 130, render: (value) => value || '-' },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      <PageTitle>转移单详情</PageTitle>
      <Card size="small" title="转移单信息">
        <DetailGrid columns={3} labelWidth={96}>
          <DetailItem label="转移单号"><Readonly>{transferDocument.documentNo}</Readonly></DetailItem>
          <DetailItem label="申请单号"><Readonly>{transferDocument.applicationNo}</Readonly></DetailItem>
          <DetailItem label="单据状态"><StatusTag value={transferDocument.status} /></DetailItem>
          <DetailItem label="公司"><Readonly>{transferDocument.company}</Readonly></DetailItem>
          <DetailItem label="制单人"><Readonly>{transferDocument.creator}</Readonly></DetailItem>
          <DetailItem label="制单日期"><Readonly>{transferDocument.createdDate}</Readonly></DetailItem>
          <DetailItem label="完成人"><Readonly>{transferDocument.completedBy}</Readonly></DetailItem>
          <DetailItem label="完成时间"><Readonly>{transferDocument.completedAt}</Readonly></DetailItem>
          <DetailItem label="物资数量"><Readonly>{transferDocument.quantity}</Readonly></DetailItem>
          <DetailItem label="备注" span={3}><Readonly>{transferDocument.remark}</Readonly></DetailItem>
        </DetailGrid>
      </Card>
      <Card size="small" title="转移物资" extra={<Typography.Text type="secondary">共 {(transferDocument.lines || []).length} 条</Typography.Text>}>
        <Table
          rowKey={(record) => record.id || record.assetTag}
          size="small"
          bordered
          columns={columns}
          dataSource={transferDocument.lines || []}
          scroll={{ x: 'max-content' }}
          pagination={false}
          locale={{ emptyText: '暂无转移物资明细' }}
        />
      </Card>
      <div className="flex justify-center gap-3">
        {transferDocument.status === '已完成' && <Button onClick={() => window.print()}>打印</Button>}
        <Button icon={<Download size={14} />} disabled={!(transferDocument.lines || []).length} onClick={() => exportTransferDetail(transferDocument)}>导出明细</Button>
        <Button onClick={onBack}>返回</Button>
      </div>
    </Space>
  );
}

function TransferEditor({ initialDocument, lockedAssetTags = new Set(), onBack, onPersist, onComplete }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [company, setCompany] = useState(initialDocument?.company || DEFAULT_FINANCIAL_COMPANY);
  const [remark, setRemark] = useState(initialDocument?.remark || '');
  const [documentId, setDocumentId] = useState(initialDocument?.id || null);
  const [documentNo, setDocumentNo] = useState(initialDocument?.documentNo || '');
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [lines, setLines] = useState(initialDocument?.lines || []);
  const createdDate = initialDocument?.createdDate || dayjs().format('YYYY-MM-DD');
  const availableAssets = SOURCE_ASSETS.filter((item) => (
    item.company === company
    && item.locked !== true
    && (!lockedAssetTags.has(item.assetTag) || lines.some((line) => line.assetTag === item.assetTag))
  ));
  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    { title: '资产标签号', dataIndex: 'assetTag', width: 160 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 300 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 120, render: (value) => value || '-' },
    { title: '物资大类.小类', key: 'assetClass', width: 180, render: (_, row) => [row.assetClass, row.assetSubClass].filter(Boolean).join(' / ') || '-' },
    { title: '转移数量', dataIndex: 'transferQty', width: 100, align: 'right' },
    { title: '转出人', dataIndex: 'outPerson', width: 150, render: (value) => value || '-' },
    { title: '转出成本中心', dataIndex: 'outCostCenter', width: 180, render: (value) => value || '-' },
    { title: '转入人', dataIndex: 'inPerson', width: 150 },
    { title: '转入成本中心', dataIndex: 'inCostCenter', width: 180 },
    { title: '转入城市', dataIndex: 'city', width: 130 },
    { title: '转入建筑物', dataIndex: 'building', width: 180 },
  ];
  const persistDraft = (nextLines = lines) => {
    if (!company) {
      messageApi.warning('请选择公司');
      return null;
    }
    const saved = onPersist({
      id: documentId,
      documentNo,
      company,
      remark,
      lines: nextLines,
    });
    if (saved) {
      setDocumentId(saved.id);
      setDocumentNo(saved.documentNo);
    }
    return saved;
  };

  const ensureHeaderSaved = () => {
    if (documentNo) return true;
    const saved = persistDraft(lines);
    if (!saved) return false;
    messageApi.success(`已自动保存转移单 ${saved.documentNo}`);
    return true;
  };

  const openAddMaterial = () => {
    if (!ensureHeaderSaved()) return;
    setEditingLine(null);
    setLineModalOpen(true);
  };

  const saveLine = (line, keepOpen) => {
    const duplicate = lines.find((item) => item.id !== editingLine?.id && item.assetTag === line.assetTag);
    if (duplicate) {
      messageApi.warning('同一转移单内不能重复添加同一资产');
      return;
    }

    const peerLine = lines.find((item) => item.id !== editingLine?.id);
    if (peerLine && (peerLine.outPerson !== line.outPerson || peerLine.inPerson !== line.inPerson)) {
      messageApi.warning('同一转移单内多条资产的转出人及转入人必须保持一致');
      return;
    }

    let nextLines;
    if (editingLine) {
      nextLines = lines.map((item) => item.id === editingLine.id ? { ...line, id: editingLine.id } : item);
      setEditingLine(null);
      setLineModalOpen(false);
    } else {
      nextLines = [...lines, { ...line, id: `${Date.now()}-${lines.length + 1}` }];
      if (!keepOpen) setLineModalOpen(false);
    }
    setLines(nextLines);
    persistDraft(nextLines);
  };

  const saveDraft = () => {
    const saved = persistDraft(lines);
    if (!saved) return undefined;
    messageApi.success(`转移单 ${saved.documentNo} 草稿已保存`);
    onBack();
    return undefined;
  };

  const confirmTransfer = () => {
    const saved = persistDraft(lines);
    if (!saved) return undefined;
    if (!lines.length) {
      messageApi.warning('请先添加转移物资');
      return undefined;
    }

    const duplicateTags = lines.filter((line, index) => lines.findIndex((item) => item.assetTag === line.assetTag) !== index);
    if (duplicateTags.length) {
      messageApi.warning('同一转移单内存在重复资产，请先调整');
      return undefined;
    }
    if (lines.some((line) => !line.transferDate)) {
      messageApi.warning('存在未维护转移日期的物资');
      return undefined;
    }

    const firstLine = lines[0];
    if (lines.some((line) => line.outPerson !== firstLine.outPerson || line.inPerson !== firstLine.inPerson)) {
      messageApi.warning('同一转移单内多条资产的转出人及转入人必须保持一致');
      return undefined;
    }

    const staleLine = lines.find((line) => {
      const currentAsset = SOURCE_ASSETS.find((asset) => asset.assetTag === line.assetTag);
      return currentAsset && currentAsset.locked === true;
    });
    if (staleLine) {
      messageApi.warning(`资产 ${staleLine.assetTag} 当前已被其他业务锁定，无法转移确认`);
      return undefined;
    }

    Modal.confirm({
      title: '确认执行转移？',
      content: `转移单 ${saved.documentNo} 共 ${lines.length} 条物资，确认后单据将更新为已完成，不能继续编辑。`,
      okText: '转移确认',
      cancelText: '取消',
      onOk: () => {
        onComplete({
          ...saved,
          lines: lines.map((line) => ({
            ...line,
            transferSnapshot: {
              responsiblePerson: line.outPerson,
              costCenter: line.outCostCenter,
              company: line.company,
              plate: line.plate,
              department: line.department,
              city: line.city,
              building: line.building,
              floor: line.floor,
              room: line.room,
              assetStatus: line.assetStatus,
            },
          })),
        });
        messageApi.success(`转移单 ${saved.documentNo} 已完成`);
        onBack();
      },
    });
    return undefined;
  };
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>转移单</PageTitle>
      <Card size="small" title="转移单信息">
        <DetailGrid columns={3} labelWidth={96}>
          <DetailItem label="转移单号"><Readonly>{documentNo || '自动生成'}</Readonly></DetailItem>
          <DetailItem label="单据类型"><Readonly>转移单</Readonly></DetailItem>
          <DetailItem label="单据状态"><StatusTag value="草稿" /></DetailItem>
          <DetailItem label="财务公司">{lines.length > 0 ? <Readonly>{company}</Readonly> : <LookupInput value={company} placeholder="请选择财务公司" onOpen={() => setCompanyModalOpen(true)} />}</DetailItem>
          <DetailItem label="制单人"><Readonly>{initialDocument?.creator || CURRENT_LOGIN_USER}</Readonly></DetailItem>
          <DetailItem label="制单时间"><Readonly>{createdDate}</Readonly></DetailItem>
          <DetailItem label="备注" span={3}>{lines.length > 0 ? <Readonly>{remark}</Readonly> : <TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={remark} onChange={(event) => setRemark(event.target.value)} />}</DetailItem>
        </DetailGrid>
      </Card>
      <Card size="small" title="转移物资" extra={<Space>
        <Button type="primary" icon={<Plus size={14} />} onClick={openAddMaterial}>添加物资</Button>
        <Button icon={<Download size={14} />} onClick={() => messageApi.info('转移模板下载入口已保留；模板精确列定义需以旧系统 transfer 模板为准')}>模板下载</Button>
        <Button icon={<Upload size={14} />} onClick={() => messageApi.info('Excel 导入 uploadType=transfer；精确逐列校验、失败行回传及批量锁定规则需继续以旧系统上传处理链路为准')}>Excel导入</Button>
      </Space>}>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={lines} scroll={{ x: 'max-content' }} pagination={false} />
      </Card>
      <div className="flex justify-center gap-3">
        <Button type="primary" onClick={saveDraft}>保存草稿</Button>
        {documentNo && lines.length > 0 && <Button type="primary" onClick={confirmTransfer}>转移确认</Button>}
        <Button onClick={onBack}>返回</Button>
      </div>
      <SelectModal open={companyModalOpen} title="选择财务公司" dataSource={COMPANY_OPTIONS.map((name, index) => ({ id: index + 1, name }))} columns={[{ title: '财务公司', dataIndex: 'name' }]} searchFields={[{ label: '财务公司', name: 'name', dataIndex: 'name' }]} onCancel={() => setCompanyModalOpen(false)} onConfirm={(record) => { setCompany(record.name); setCompanyModalOpen(false); }} />
      <TransferItemModal key={`${lineModalOpen}-${editingLine?.id || 'new'}-${company}`} open={lineModalOpen} currentCompany={company} availableAssets={availableAssets} initialLine={editingLine} onCancel={() => { setLineModalOpen(false); setEditingLine(null); }} onConfirm={saveLine} />
    </Space>
  );
}

export default function TransferPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectorType, setSelectorType] = useState('');
  const [view, setView] = useState('list');
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const creatorData = useMemo(() => toSelectData(rows.map((row) => row.creator)), [rows]);
  const companyData = useMemo(() => toSelectData([...COMPANY_OPTIONS, ...rows.map((row) => row.company)]), [rows]);
  const draftLockedAssetTags = useMemo(() => new Set(
    rows
      .filter((row) => row.status === '草稿')
      .flatMap((row) => (row.lines || []).map((line) => line.assetTag))
      .filter(Boolean)
  ), [rows]);
  const activeDocument = rows.find((row) => row.id === activeDocumentId) || null;
  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.documentNo, filters.documentNo)
    && includesText(row.reason, filters.reason)
    && (!filters.status || row.status === filters.status)
    && includesText(row.company, filters.company)
    && includesText(row.outDept, filters.outDept)
    && includesText(row.outLocation, filters.outLocation)
    && includesText(row.plate, filters.plate)
    && includesText(row.inDept, filters.inDept)
    && includesText(row.inLocation, filters.inLocation)
    && includesText(row.creator, filters.creator)
    && inDateRange(row.createdDate, filters.createdFrom, filters.createdTo)
  )), [rows, filters]);
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));
  const emptyLookup = (title, field) => ({ title, dataSource: [], onConfirm: (record) => update(field, record.name) });
  const selectorConfig = {
    company: { title: '选择公司', dataSource: companyData, onConfirm: (record) => update('company', record.name) },
    creator: { title: '选择制单人', dataSource: creatorData, onConfirm: (record) => update('creator', record.name) },
    outDept: emptyLookup('选择转出部门', 'outDept'),
    outLocation: emptyLookup('选择转出地点', 'outLocation'),
    plate: emptyLookup('选择板块', 'plate'),
    inDept: emptyLookup('选择转入部门', 'inDept'),
    inLocation: emptyLookup('选择转入地点', 'inLocation'),
  }[selectorType];
  const deleteRows = () => {
    if (!selectedRowKeys.length) return messageApi.warning('请先选择需要删除的转移单');
    const selectedRows = rows.filter((row) => selectedRowKeys.includes(row.id));
    const deletableRows = selectedRows.filter((row) => row.status === '草稿');
    const retainedRows = selectedRows.filter((row) => row.status !== '草稿');

    if (!deletableRows.length) {
      messageApi.warning('已完成转移单不可删除');
      return undefined;
    }

    Modal.confirm({
      title: '确认删除所选草稿转移单？',
      content: retainedRows.length
        ? `本次将删除 ${deletableRows.length} 条草稿；${retainedRows.length} 条已完成单据将保留。`
        : `本次将删除 ${deletableRows.length} 条草稿转移单。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const deletableIds = new Set(deletableRows.map((row) => row.id));
        setRows((current) => current.filter((row) => !deletableIds.has(row.id)));
        setSelectedRowKeys([]);
        messageApi.success(retainedRows.length
          ? `已删除 ${deletableRows.length} 条草稿，${retainedRows.length} 条已完成单据已保留`
          : `已删除 ${deletableRows.length} 条草稿转移单`);
      },
    });
    return undefined;
  };
  const persistDraft = ({ id: existingId, documentNo: existingDocumentNo, company, remark, lines }) => {
    const id = existingId || (Math.max(0, ...rows.map((row) => Number(row.id) || 0)) + 1);
    const existing = rows.find((row) => row.id === id);
    const firstLine = lines[0] || {};
    const saved = {
      ...existing,
      id,
      documentNo: existingDocumentNo || existing?.documentNo || `AT-${dayjs().format('YYYYMMDD')}${String(id).padStart(4, '0')}`,
      applicationNo: existing?.applicationNo || '',
      status: '草稿',
      company,
      createdDate: existing?.createdDate || dayjs().format('YYYY-MM-DD'),
      creator: existing?.creator || CURRENT_LOGIN_USER,
      quantity: lines.reduce((sum, line) => sum + Number(line.transferQty || 0), 0),
      reason: firstLine.transferReason || '',
      outDept: firstLine.department || '',
      outLocation: [firstLine.city, firstLine.building].filter(Boolean).join(' / '),
      plate: firstLine.inPlate || '',
      inDept: firstLine.inDept || '',
      inLocation: [firstLine.city, firstLine.building].filter(Boolean).join(' / '),
      remark,
      lines,
    };
    setRows((current) => (
      current.some((row) => row.id === id)
        ? current.map((row) => row.id === id ? saved : row)
        : [saved, ...current]
    ));
    return saved;
  };
  const completeTransfer = (document) => {
    const completed = {
      ...document,
      status: '已完成',
      completedBy: CURRENT_LOGIN_USER,
      completedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    setRows((current) => current.map((row) => row.id === completed.id ? completed : row));
    return completed;
  };

  const backToList = () => {
    setActiveDocumentId(null);
    setView('list');
  };

  if (view === 'create') {
    return <>{contextHolder}<TransferEditor lockedAssetTags={draftLockedAssetTags} onBack={backToList} onPersist={persistDraft} onComplete={completeTransfer} /></>;
  }
  if (view === 'edit' && activeDocument) {
    return <>{contextHolder}<TransferEditor initialDocument={activeDocument} lockedAssetTags={draftLockedAssetTags} onBack={backToList} onPersist={persistDraft} onComplete={completeTransfer} /></>;
  }
  if (view === 'view' && activeDocument) {
    return <>{contextHolder}<TransferDetail document={activeDocument} onBack={backToList} /></>;
  }
  const openDocument = (row) => {
    setActiveDocumentId(row.id);
    setView(row.status === '草稿' ? 'edit' : 'view');
  };
  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => (page - 1) * pageSize + index + 1 },
    {
      title: '转移单号',
      dataIndex: 'documentNo',
      width: 190,
      sorter: (a, b) => compareText(a.documentNo, b.documentNo),
      render: (value, row) => <Button type="link" className="px-0" onClick={() => openDocument(row)}>{value}</Button>,
    },
    { title: '申请单号', dataIndex: 'applicationNo', width: 220, sorter: (a, b) => compareText(a.applicationNo, b.applicationNo), render: (value) => value || '-' },
    { title: '单据状态', dataIndex: 'status', width: 120, sorter: (a, b) => compareText(a.status, b.status), render: (value) => <StatusTag value={value} /> },
    { title: '公司', dataIndex: 'company', width: 180, sorter: (a, b) => compareText(a.company, b.company) },
    { title: '制单日期', dataIndex: 'createdDate', width: 130, sorter: (a, b) => compareText(a.createdDate, b.createdDate), defaultSortOrder: 'descend' },
    { title: '制单人', dataIndex: 'creator', width: 180, sorter: (a, b) => compareText(a.creator, b.creator) },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right', sorter: (a, b) => Number(a.quantity || 0) - Number(b.quantity || 0) },
    {
      title: '操作',
      key: 'operation',
      width: 90,
      fixed: 'right',
      render: (_, row) => <Button type="link" className="px-0" onClick={() => openDocument(row)}>{row.status === '草稿' ? '编辑' : '查看'}</Button>,
    },
  ];
  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>转移</PageTitle>
      <QueryBar onQuery={() => {
        if (draft.createdFrom && draft.createdTo && draft.createdTo < draft.createdFrom) {
          messageApi.warning('制单日期结束日期不得早于开始日期');
          return;
        }
        setFilters({ ...draft });
        setSelectedRowKeys([]);
        setPage(1);
      }} onReset={() => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setSelectedRowKeys([]); setPage(1); }}>
        <QueryItem label="转移单号"><Input value={draft.documentNo} allowClear placeholder="请输入转移单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
        <QueryItem label="转移原因"><Input value={draft.reason} allowClear placeholder="请输入转移原因" onChange={(event) => update('reason', event.target.value)} /></QueryItem>
        <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={['草稿', '已完成'].map((value) => ({ label: value, value }))} onChange={(value) => update('status', value)} /></QueryItem>
        <QueryItem label="公司"><LookupInput value={draft.company} placeholder="请选择公司" onOpen={() => setSelectorType('company')} /></QueryItem>
        <QueryItem label="转出部门"><LookupInput value={draft.outDept} placeholder="请选择转出部门" onOpen={() => setSelectorType('outDept')} /></QueryItem>
        <QueryItem label="转出地点"><LookupInput value={draft.outLocation} placeholder="请选择转出地点" onOpen={() => setSelectorType('outLocation')} /></QueryItem>
        <QueryItem label="板块"><LookupInput value={draft.plate} placeholder="请选择板块" onOpen={() => setSelectorType('plate')} /></QueryItem>
        <QueryItem label="转入部门"><LookupInput value={draft.inDept} placeholder="请选择转入部门" onOpen={() => setSelectorType('inDept')} /></QueryItem>
        <QueryItem label="转入地点"><LookupInput value={draft.inLocation} placeholder="请选择转入地点" onOpen={() => setSelectorType('inLocation')} /></QueryItem>
        <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setSelectorType('creator')} /></QueryItem>
        <QueryItem label="制单日期">
          <DatePicker.RangePicker
            className="w-full"
            value={[
              draft.createdFrom ? dayjs(draft.createdFrom) : null,
              draft.createdTo ? dayjs(draft.createdTo) : null,
            ]}
            format="YYYY-MM-DD"
            onChange={(dates) => {
              setDraft((current) => ({
                ...current,
                createdFrom: dates?.[0] ? dates[0].format('YYYY-MM-DD') : '',
                createdTo: dates?.[1] ? dates[1].format('YYYY-MM-DD') : '',
              }));
            }}
          />
        </QueryItem>
      </QueryBar>
      <Card size="small" title="转移单列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => { setActiveDocumentId(null); setView('create'); }}>创建</Button>
            <Button danger icon={<Trash2 size={14} />} onClick={deleteRows}>删除</Button>
          </Space>
        </div>
        <Table rowKey="id" size="small" bordered columns={columns} dataSource={filteredRows} rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, fixed: true, columnTitle: '选择', columnWidth: 64 }} scroll={{ x: 'max-content' }} pagination={{ current: page, pageSize, showSizeChanger: true, onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize); } }} />
      </Card>
      <SelectorModal config={selectorConfig} onClose={() => setSelectorType('')} />
    </Space>
  );
}
