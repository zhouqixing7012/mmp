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
  Tabs,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { Download, Plus, Search, Trash2, Upload } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import MoveReceiveContent from './MoveReceiveContent';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const TRANSIT_WAREHOUSE = 'V00001.集团在途总库';
const CURRENT_USER = 'admin-系统管理员';
const DOCUMENT_STATUSES = ['草稿', '出库待接收', '已完成', '已驳回'];
const SUPPORTED_MATERIAL_GROUPS = new Set(['1.资产', '2.低值耐用品']);

const WAREHOUSE_OPTIONS = [
  { id: 1, name: 'I0001.资产集团总库（新媒体）', financeCompany: '114.新媒体', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: 'B2', keeper: 'SOHU05-库房管理员' },
  { id: 2, name: 'I0013.资产集团前台库（新媒体）', financeCompany: '114.新媒体', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '1F', keeper: 'SOHU13-前台库管员' },
  { id: 3, name: 'I0024.资产网络大厦库（新媒体）', financeCompany: '114.新媒体', city: '010.北京市', building: '129754.搜狐网络大厦', floor: 'B1', keeper: 'SOHU24-库房管理员' },
  { id: 4, name: 'I0033.资产MIS备货库（新媒体）', financeCompany: '114.新媒体', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '17F', keeper: 'SOHU33-MIS库管员' },
  { id: 5, name: 'I0022.资产集团前台库（焦点互动）', financeCompany: '117.焦点互动', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: '2F', keeper: 'SOHU22-前台库管员' },
  { id: 6, name: 'I0010.资产集团总库（焦点互动）', financeCompany: '117.焦点互动', city: '010.北京市', building: '129753.搜狐媒体大厦', floor: 'B2', keeper: 'SOHU10-库房管理员' },
];

const OUTBOUND_WAREHOUSE_NAMES = [
  'I0001.资产集团总库（新媒体）',
  'I0013.资产集团前台库（新媒体）',
  'I0022.资产集团前台库（焦点互动）',
];

const ASSET_POOL = [
  {
    id: 'asset-laptop-1', assetTag: 'AST-2409010068', sn: 'SN-T14-0068', materialDesc: '联想.ThinkPad T14', materialGroup: '1.资产',
    assetClass: '10.电脑', assetSubClass: '笔记本电脑', quantity: 1, availableQty: 1, applicationBatch: '2026Q3', config: 'i7 / 32G / 1T SSD', unit: '台',
    assetMark: '主资产', originalValue: 8200, netValue: 6800, assetStatus: '在库-新增', company: '114.新媒体', plate: '集团', department: 'ERP部',
    costCenter: 'ERP部', businessLine: '0.*', expenseAccount: '固定资产', responsiblePerson: '206984-何文', city: '010.北京市', building: '129753.搜狐媒体大厦',
    floor: '15F', room: '1508', enabledDate: '2026-09-10', usage: '办公', remark: '-', warehouse: 'I0001.资产集团总库（新媒体）', locked: false,
  },
  {
    id: 'asset-monitor-1', assetTag: 'AST-2409010072', sn: 'SN-U2723-0072', materialDesc: '戴尔.U2723QE显示器', materialGroup: '1.资产',
    assetClass: '11.办公设备', assetSubClass: '显示器', quantity: 1, availableQty: 1, applicationBatch: '2026Q3', config: '27英寸 / 4K', unit: '台',
    assetMark: '主资产', originalValue: 3200, netValue: 2600, assetStatus: '在库-再利用', company: '114.新媒体', plate: '集团', department: 'ES部',
    costCenter: 'ES部', businessLine: '媒体', expenseAccount: '固定资产', responsiblePerson: '114111-杨芊', city: '010.北京市', building: '129753.搜狐媒体大厦',
    floor: 'B2', room: '', enabledDate: '2025-08-01', usage: '办公', remark: '可再次领用', warehouse: 'I0001.资产集团总库（新媒体）', locked: false,
  },
  {
    id: 'durable-keyboard-1', assetTag: 'CON-26070018', sn: 'MXK-0018', materialDesc: '罗技.MX Keys键盘', materialGroup: '2.低值耐用品',
    assetClass: '30.办公耗材设备', assetSubClass: '键盘', quantity: 1, availableQty: 1, applicationBatch: '2026Q3', config: '无线键盘', unit: '个',
    assetMark: '普通', originalValue: 699, netValue: 620, assetStatus: '在库-新增', company: '114.新媒体', plate: '集团', department: 'ERP部',
    costCenter: 'ERP部', businessLine: '研发', expenseAccount: '低值耐用品', responsiblePerson: '206984-何文', city: '010.北京市', building: '129753.搜狐媒体大厦',
    floor: 'B2', room: '', enabledDate: '2026-07-20', usage: '办公', remark: '-', warehouse: 'I0001.资产集团总库（新媒体）', locked: false,
  },
  {
    id: 'asset-locked-1', assetTag: 'AST-LOCK-0001', sn: 'LOCK-SN-01', materialDesc: '联想.X1 Carbon', materialGroup: '1.资产',
    assetClass: '10.电脑', assetSubClass: '笔记本电脑', quantity: 1, availableQty: 1, applicationBatch: '2026Q3', config: '演示', unit: '台',
    assetMark: '主资产', originalValue: 9000, netValue: 8500, assetStatus: '在库-新增', company: '114.新媒体', plate: '集团', department: 'ERP部',
    costCenter: 'ERP部', businessLine: '研发', expenseAccount: '固定资产', responsiblePerson: '206984-何文', city: '010.北京市', building: '129753.搜狐媒体大厦',
    floor: 'B2', room: '', enabledDate: '2026-08-01', usage: '办公', remark: '已被其他业务锁定', warehouse: 'I0001.资产集团总库（新媒体）', locked: true,
  },
  {
    id: 'asset-frontdesk-1', assetTag: 'AST-2409010091', sn: 'SN-MINI-0091', materialDesc: '苹果.Mac mini', materialGroup: '1.资产',
    assetClass: '10.电脑', assetSubClass: '台式机', quantity: 1, availableQty: 1, applicationBatch: '2026Q3', config: 'M4 / 24G / 512G', unit: '台',
    assetMark: '主资产', originalValue: 7600, netValue: 7100, assetStatus: '在库-待处理', company: '114.新媒体', plate: '集团', department: 'ES部',
    costCenter: 'ES部', businessLine: '媒体', expenseAccount: '固定资产', responsiblePerson: '114111-杨芊', city: '010.北京市', building: '129753.搜狐媒体大厦',
    floor: '1F', room: '', enabledDate: '2026-08-20', usage: '办公', remark: '-', warehouse: 'I0013.资产集团前台库（新媒体）', locked: false,
  },
];

function cloneLine(asset, extras = {}) {
  return {
    ...asset,
    id: extras.id || `${asset.id}-${Math.random().toString(36).slice(2, 7)}`,
    lineNo: extras.lineNo || 1,
    moveDesc: extras.moveDesc || '',
    receiveDesc: extras.receiveDesc || '',
    verification: extras.verification || '未验证',
    verificationDesc: extras.verificationDesc || '',
    verificationMethod: extras.verificationMethod || '',
    verificationTime: extras.verificationTime || '',
    moveStatus: extras.moveStatus || '草稿',
    receiver: extras.receiver || '',
    receiveTime: extras.receiveTime || '',
    rejectReason: extras.rejectReason || '',
    transactionOut: extras.transactionOut || '',
    transactionIn: extras.transactionIn || '',
    originalLockStatus: Boolean(asset.locked),
    snapshot: extras.snapshot || null,
    ...extras,
  };
}

const HISTORICAL_ASSET = {
  ...ASSET_POOL[0],
  id: 'hist-asset-1',
  assetTag: '1141100184-V',
  sn: 'SOHUXX156170',
  materialDesc: '惠普.LE2202x显示器',
  originalValue: 888.89,
  netValue: 0,
  enabledDate: '2013-03-15',
  plate: '16.视频',
};

const INITIAL_DOCUMENTS = [
  {
    id: 1,
    documentNo: 'TS-202609120001',
    status: '草稿',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0024.资产网络大厦库（新媒体）',
    createdDate: '2026-09-12',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '待提交普通资产移库',
    lines: [cloneLine(ASSET_POOL[1], { id: 'draft-1', lineNo: 1, moveDesc: '前台库存调整' })],
  },
  {
    id: 2,
    documentNo: 'TS-202609110002',
    status: '草稿',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0033.资产MIS备货库（新媒体）',
    createdDate: '2026-09-11',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '低值耐用品移库演示',
    lines: [cloneLine(ASSET_POOL[2], { id: 'draft-2', lineNo: 1, moveDesc: 'MIS备货' })],
  },
  {
    id: 3,
    documentNo: 'TS-202609090004',
    status: '出库待接收',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0024.资产网络大厦库（新媒体）',
    createdDate: '2026-09-09',
    creator: '114111-杨芊',
    quantity: 2,
    remark: '部分已验证，支持分批接收',
    notificationStatus: '已通知',
    reminderStatus: '未超期',
    lines: [
      cloneLine(HISTORICAL_ASSET, { id: 'receive-1', lineNo: 1, warehouse: TRANSIT_WAREHOUSE, moveStatus: '待接收', verification: '已验证', verificationDesc: '扫码验证通过', verificationMethod: '扫码', verificationTime: '2026-09-09 10:20', transactionOut: '24', snapshot: { ...HISTORICAL_ASSET } }),
      cloneLine({ ...ASSET_POOL[2], assetTag: 'CON-26070019', sn: 'MXK-0019' }, { id: 'receive-2', lineNo: 2, warehouse: TRANSIT_WAREHOUSE, moveStatus: '待接收', verification: '未验证', transactionOut: '24', snapshot: { ...ASSET_POOL[2], assetTag: 'CON-26070019', sn: 'MXK-0019' } }),
    ],
  },
  {
    id: 4,
    documentNo: 'TS-202609050003',
    status: '已完成',
    fromWarehouse: 'I0013.资产集团前台库（新媒体）',
    toWarehouse: 'I0001.资产集团总库（新媒体）',
    createdDate: '2026-09-05',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '正常移库完成',
    notificationStatus: '已结束',
    reminderStatus: '已结束',
    lines: [cloneLine({ ...ASSET_POOL[4], assetTag: 'AST-HIS-0091' }, { id: 'completed-1', lineNo: 1, moveStatus: '已接收', verification: '已验证', receiveDesc: '核对无误', receiver: '114111-杨芊', receiveTime: '2026-09-05 15:30', transactionOut: '24', transactionIn: '25', warehouse: 'I0001.资产集团总库（新媒体）', snapshot: { ...ASSET_POOL[4], assetTag: 'AST-HIS-0091' } })],
  },
  {
    id: 5,
    documentNo: 'TS-202609040004',
    status: '已完成',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0024.资产网络大厦库（新媒体）',
    createdDate: '2026-09-04',
    creator: '114111-杨芊',
    quantity: 2,
    remark: '部分接收、部分驳回',
    reverseDocumentNos: ['TS-R202609040001'],
    lines: [
      cloneLine({ ...HISTORICAL_ASSET, assetTag: 'AST-MIX-0001', sn: 'MIX-SN-001' }, { id: 'mix-1', lineNo: 1, moveStatus: '已接收', verification: '已验证', receiver: '114111-杨芊', receiveTime: '2026-09-04 17:00', transactionOut: '24', transactionIn: '25', warehouse: 'I0024.资产网络大厦库（新媒体）', snapshot: { ...HISTORICAL_ASSET, assetTag: 'AST-MIX-0001', sn: 'MIX-SN-001' } }),
      cloneLine({ ...ASSET_POOL[1], assetTag: 'AST-MIX-0002', sn: 'MIX-SN-002' }, { id: 'mix-2', lineNo: 2, moveStatus: '已驳回', verification: '已验证', rejectReason: '目标仓无对应存放位置', transactionOut: '24', warehouse: TRANSIT_WAREHOUSE, snapshot: { ...ASSET_POOL[1], assetTag: 'AST-MIX-0002', sn: 'MIX-SN-002' } }),
    ],
  },
  {
    id: 6,
    documentNo: 'TS-R202609040001',
    status: '出库待接收',
    fromWarehouse: 'I0024.资产网络大厦库（新媒体）',
    toWarehouse: 'I0001.资产集团总库（新媒体）',
    createdDate: '2026-09-04',
    creator: 'system-系统',
    quantity: 1,
    remark: '目标仓无对应存放位置',
    reverseMove: true,
    sourceDocumentNo: 'TS-202609040004',
    notificationStatus: '已通知',
    reminderStatus: '未超期',
    lines: [cloneLine({ ...ASSET_POOL[1], assetTag: 'AST-MIX-0002', sn: 'MIX-SN-002' }, { id: 'reverse-1', lineNo: 1, moveStatus: '待接收', verification: '未验证', transactionOut: '', warehouse: TRANSIT_WAREHOUSE, snapshot: { ...ASSET_POOL[1], assetTag: 'AST-MIX-0002', sn: 'MIX-SN-002' } })],
  },
  {
    id: 7,
    documentNo: 'TS-202609030007',
    status: '已驳回',
    fromWarehouse: 'I0001.资产集团总库（新媒体）',
    toWarehouse: 'I0033.资产MIS备货库（新媒体）',
    createdDate: '2026-09-03',
    creator: '114111-杨芊',
    quantity: 1,
    remark: '整单驳回演示',
    reverseDocumentNos: ['TS-R202609030001'],
    lines: [cloneLine({ ...ASSET_POOL[0], assetTag: 'AST-REJ-0001', sn: 'REJ-SN-001' }, { id: 'reject-1', lineNo: 1, moveStatus: '已驳回', verification: '已验证', rejectReason: '目标仓拒绝接收', transactionOut: '24', warehouse: TRANSIT_WAREHOUSE, snapshot: { ...ASSET_POOL[0], assetTag: 'AST-REJ-0001', sn: 'REJ-SN-001' } })],
  },
  {
    id: 8,
    documentNo: 'TS-R202609030001',
    status: '出库待接收',
    fromWarehouse: 'I0033.资产MIS备货库（新媒体）',
    toWarehouse: 'I0001.资产集团总库（新媒体）',
    createdDate: '2026-09-03',
    creator: 'system-系统',
    quantity: 1,
    remark: '目标仓拒绝接收',
    reverseMove: true,
    sourceDocumentNo: 'TS-202609030007',
    notificationStatus: '已通知',
    reminderStatus: '每日催办中',
    lines: [cloneLine({ ...ASSET_POOL[0], assetTag: 'AST-REJ-0001', sn: 'REJ-SN-001' }, { id: 'reverse-2', lineNo: 1, moveStatus: '待接收', verification: '未验证', warehouse: TRANSIT_WAREHOUSE, snapshot: { ...ASSET_POOL[0], assetTag: 'AST-REJ-0001', sn: 'REJ-SN-001' } })],
  },
];

const EMPTY_FILTERS = {
  documentNo: '', status: '', creator: '', createdFrom: '', createdTo: '', assetScan: '',
};

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

function rowContainsAsset(row, query) {
  if (!query) return true;
  return (row.lines || []).some((asset) => includesText(asset.assetTag, query) || includesText(asset.sn, query));
}

function getWarehouse(name) {
  return WAREHOUSE_OPTIONS.find((item) => item.name === name) || null;
}

function createDocumentNo(documents) {
  const count = documents.filter((item) => String(item.documentNo || '').startsWith(`TS-${dayjs().format('YYYYMMDD')}`)).length + 1;
  return `TS-${dayjs().format('YYYYMMDD')}${String(count).padStart(4, '0')}`;
}

function formatMoney(value) {
  if (value === undefined || value === null || value === '') return '-';
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

function RequiredLabel({ children }) {
  return <span>{children}<span className="ml-0.5 text-red-500">*</span></span>;
}

function LookupInput({ value, placeholder, onOpen, disabled = false }) {
  if (disabled) return <Readonly>{value}</Readonly>;
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input value={value} readOnly placeholder={placeholder} className="pointer-events-none" suffix={<Search size={14} />} />
    </div>
  );
}

function MoveAssetDetailModal({ open, document, asset, onCancel }) {
  if (!asset) return null;
  const snapshot = asset.snapshot || asset;
  return (
    <Modal open={open} title="移库物资信息" width={980} footer={null} onCancel={onCancel} destroyOnHidden>
      <Space direction="vertical" size={16} className="w-full">
        <Card size="small" title="移库单信息">
          <DetailGrid columns={3} labelWidth={110}>
            <DetailItem label="移库单号"><Readonly>{document?.documentNo}</Readonly></DetailItem>
            <DetailItem label="当前仓库"><Readonly>{document?.fromWarehouse}</Readonly></DetailItem>
            <DetailItem label="对方仓库"><Readonly>{document?.toWarehouse}</Readonly></DetailItem>
            <DetailItem label="来源移库单号"><Readonly>{document?.sourceDocumentNo}</Readonly></DetailItem>
            <DetailItem label="出库仓库管理员"><Readonly>{document?.creator}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="资产信息">
          <DetailGrid columns={3} labelWidth={110}>
            <DetailItem label="标签号"><Readonly>{snapshot.assetTag}</Readonly></DetailItem>
            <DetailItem label="SN"><Readonly>{snapshot.sn}</Readonly></DetailItem>
            <DetailItem label="物资总类"><Readonly>{snapshot.materialGroup}</Readonly></DetailItem>
            <DetailItem label="原值"><Readonly>{formatMoney(snapshot.originalValue)}</Readonly></DetailItem>
            <DetailItem label="净值"><Readonly>{formatMoney(snapshot.netValue)}</Readonly></DetailItem>
            <DetailItem label="资产状态"><Readonly>{snapshot.assetStatus}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{snapshot.plate}</Readonly></DetailItem>
            <DetailItem label="使用公司"><Readonly>{snapshot.company}</Readonly></DetailItem>
            <DetailItem label="使用部门"><Readonly>{snapshot.department}</Readonly></DetailItem>
            <DetailItem label="成本中心"><Readonly>{snapshot.costCenter}</Readonly></DetailItem>
            <DetailItem label="业务线"><Readonly>{snapshot.businessLine}</Readonly></DetailItem>
            <DetailItem label="项目"><Readonly>{snapshot.project}</Readonly></DetailItem>
            <DetailItem label="费用账户"><Readonly>{snapshot.expenseAccount}</Readonly></DetailItem>
            <DetailItem label="管理人"><Readonly>{snapshot.responsiblePerson}</Readonly></DetailItem>
            <DetailItem label="City"><Readonly>{snapshot.city}</Readonly></DetailItem>
            <DetailItem label="Building"><Readonly>{snapshot.building}</Readonly></DetailItem>
            <DetailItem label="Floor"><Readonly>{snapshot.floor}</Readonly></DetailItem>
            <DetailItem label="Room"><Readonly>{snapshot.room}</Readonly></DetailItem>
            <DetailItem label="启用日期"><Readonly>{snapshot.enabledDate}</Readonly></DetailItem>
            <DetailItem label="用途"><Readonly>{snapshot.usage}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
        <Card size="small" title="移库结果">
          <DetailGrid columns={3} labelWidth={110}>
            <DetailItem label="目标仓"><Readonly>{document?.toWarehouse}</Readonly></DetailItem>
            <DetailItem label="数量"><Readonly>{asset.quantity}</Readonly></DetailItem>
            <DetailItem label="资产验证"><Readonly>{asset.verification}</Readonly></DetailItem>
            <DetailItem label="接收仓管员"><Readonly>{asset.receiver}</Readonly></DetailItem>
            <DetailItem label="接收时间"><Readonly>{asset.receiveTime}</Readonly></DetailItem>
            <DetailItem label="移库状态"><StatusTag value={asset.moveStatus} /></DetailItem>
            <DetailItem label="移库说明" span={3}><Readonly>{asset.moveDesc}</Readonly></DetailItem>
            <DetailItem label="接收说明" span={3}><Readonly>{asset.receiveDesc}</Readonly></DetailItem>
          </DetailGrid>
        </Card>
      </Space>
    </Modal>
  );
}

function MoveItemModal({ open, currentWarehouse, initialLine, existingTags, onCancel, onConfirm }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [selectedAssets, setSelectedAssets] = useState(() => initialLine ? [initialLine] : []);
  const [moveDesc, setMoveDesc] = useState(initialLine?.moveDesc || '');
  const [selectorOpen, setSelectorOpen] = useState(false);

  const selectableAssets = useMemo(() => ASSET_POOL.filter((item) => (
    item.warehouse === currentWarehouse
    && item.availableQty > 0
    && SUPPORTED_MATERIAL_GROUPS.has(item.materialGroup)
    && !item.locked
    && (!existingTags.has(item.assetTag) || item.assetTag === initialLine?.assetTag)
  )), [currentWarehouse, existingTags, initialLine?.assetTag]);

  const selectorAssets = useMemo(() => selectableAssets.map((item) => ({
    ...item,
    brand: item.brand || String(item.materialDesc || '').split('.')[0] || '-',
    originalValueDisplay: formatMoney(item.originalValue),
  })), [selectableAssets]);

  const displayAsset = selectedAssets[0] || null;
  const selectedAssetDisplay = displayAsset
    ? [displayAsset.assetTag, displayAsset.sn, displayAsset.materialDesc].filter(Boolean).join(' / ')
    : '';

  const submit = (keepOpen) => {
    if (!selectedAssets.length) return messageApi.warning('请选择需要移库的物资');
    const payloads = selectedAssets.map((item) => ({
      ...item,
      warehouse: currentWarehouse,
      quantity: Number(item.quantity || item.assetQty || 1),
      moveDesc,
      moveStatus: '草稿',
      verification: '未验证',
      originalLockStatus: Boolean(item.locked),
    }));
    const saved = onConfirm(payloads, keepOpen);
    if (saved === false) return undefined;
    if (keepOpen && !initialLine) {
      setSelectedAssets([]);
      setMoveDesc('');
    }
    return undefined;
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={initialLine ? '编辑移库物资' : '添加移库物资'}
        width={1060}
        onCancel={onCancel}
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={onCancel}>取消</Button>,
          !initialLine && <Button key="continue" onClick={() => submit(true)}>添加并继续</Button>,
          <Button key="close" type="primary" onClick={() => submit(false)}>{initialLine ? '保存' : '添加并关闭'}</Button>,
        ].filter(Boolean)}
      >
        <Space direction="vertical" size={16} className="w-full">
          <Typography.Text>当前仓库：{currentWarehouse}</Typography.Text>
          <Card size="small" title="选择物资">
            <DetailGrid columns={3} labelWidth={96}>
              <DetailItem label="移库物资" span={3}>
                <LookupInput
                  value={selectedAssetDisplay}
                  placeholder="请选择移库物资"
                  onOpen={() => setSelectorOpen(true)}
                  disabled={Boolean(initialLine)}
                />
              </DetailItem>
            </DetailGrid>
          </Card>

          <Card size="small" title="物资信息">
            <DetailGrid columns={3} labelWidth={100}>
              <DetailItem label="标签号"><Readonly>{displayAsset?.assetTag}</Readonly></DetailItem>
              <DetailItem label="SN号"><Readonly>{displayAsset?.sn}</Readonly></DetailItem>
              <DetailItem label="资产说明"><Readonly>{displayAsset?.materialDesc}</Readonly></DetailItem>
              <DetailItem label="可用数量"><Readonly>{displayAsset?.availableQty}</Readonly></DetailItem>
              <DetailItem label="物资总类"><Readonly>{displayAsset?.materialGroup}</Readonly></DetailItem>
              <DetailItem label="物资大类"><Readonly>{displayAsset?.assetClass}</Readonly></DetailItem>
              <DetailItem label="物资小类"><Readonly>{displayAsset?.assetSubClass}</Readonly></DetailItem>
              <DetailItem label="数量"><Readonly>{displayAsset?.quantity}</Readonly></DetailItem>
              <DetailItem label="仓库"><Readonly>{currentWarehouse}</Readonly></DetailItem>
              <DetailItem label="申请批次"><Readonly>{displayAsset?.applicationBatch}</Readonly></DetailItem>
              <DetailItem label="配置"><Readonly>{displayAsset?.config}</Readonly></DetailItem>
              <DetailItem label="计量单位"><Readonly>{displayAsset?.unit}</Readonly></DetailItem>
              <DetailItem label="资产标记"><Readonly>{displayAsset?.assetMark}</Readonly></DetailItem>
              <DetailItem label="原值"><Readonly>{formatMoney(displayAsset?.originalValue)}</Readonly></DetailItem>
              <DetailItem label="净值"><Readonly>{formatMoney(displayAsset?.netValue)}</Readonly></DetailItem>
              <DetailItem label="资产状态"><Readonly>{displayAsset?.assetStatus}</Readonly></DetailItem>
              <DetailItem label="公司"><Readonly>{displayAsset?.company}</Readonly></DetailItem>
              <DetailItem label="板块"><Readonly>{displayAsset?.plate}</Readonly></DetailItem>
              <DetailItem label="部门"><Readonly>{displayAsset?.department}</Readonly></DetailItem>
              <DetailItem label="成本中心"><Readonly>{displayAsset?.costCenter}</Readonly></DetailItem>
              <DetailItem label="业务线"><Readonly>{displayAsset?.businessLine}</Readonly></DetailItem>
              <DetailItem label="项目"><Readonly>{displayAsset?.project}</Readonly></DetailItem>
              <DetailItem label="费用账户"><Readonly>{displayAsset?.expenseAccount}</Readonly></DetailItem>
              <DetailItem label="责任人"><Readonly>{displayAsset?.responsiblePerson}</Readonly></DetailItem>
              <DetailItem label="City"><Readonly>{displayAsset?.city}</Readonly></DetailItem>
              <DetailItem label="Building"><Readonly>{displayAsset?.building}</Readonly></DetailItem>
              <DetailItem label="Floor"><Readonly>{displayAsset?.floor}</Readonly></DetailItem>
              <DetailItem label="Room"><Readonly>{displayAsset?.room}</Readonly></DetailItem>
              <DetailItem label="启用日期"><Readonly>{displayAsset?.enabledDate}</Readonly></DetailItem>
              <DetailItem label="用途"><Readonly>{displayAsset?.usage}</Readonly></DetailItem>
              <DetailItem label="备注" span={3}><Readonly>{displayAsset?.remark}</Readonly></DetailItem>
            </DetailGrid>
          </Card>

          <Card size="small" title="移库信息">
            <DetailGrid columns={3} labelWidth={96}>
              <DetailItem label="移库说明" span={3}><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={moveDesc} onChange={(event) => setMoveDesc(event.target.value)} /></DetailItem>
            </DetailGrid>
          </Card>
        </Space>
      </Modal>

      <SelectModal
        open={selectorOpen}
        title="选择移库物资"
        width="94vw"
        dataSource={selectorAssets}
        initialSelectedKeys={displayAsset ? [displayAsset.id] : []}
        columns={[
          { title: '标签号', dataIndex: 'assetTag' },
          { title: '公司', dataIndex: 'company' },
          { title: '板块', dataIndex: 'plate' },
          { title: '资产大类', dataIndex: 'assetClass' },
          { title: '资产小类', dataIndex: 'assetSubClass' },
          { title: '资产说明', dataIndex: 'materialDesc' },
          { title: '品牌', dataIndex: 'brand' },
          { title: '数量', dataIndex: 'quantity' },
          { title: '原值', dataIndex: 'originalValueDisplay' },
          { title: '资产责任人', dataIndex: 'responsiblePerson' },
          { title: '资产状态', dataIndex: 'assetStatus' },
          { title: '成本中心', dataIndex: 'costCenter' },
          { title: '启用日期', dataIndex: 'enabledDate' },
        ]}
        searchFields={[
          { label: '标签号', name: 'assetTag', dataIndex: 'assetTag' },
          { label: 'SN号', name: 'sn', dataIndex: 'sn' },
          { label: '板块', name: 'plate', dataIndex: 'plate' },
          { label: '资产说明', name: 'materialDesc', dataIndex: 'materialDesc' },
        ]}
        onCancel={() => setSelectorOpen(false)}
        onConfirm={(record) => {
          setSelectedAssets(record ? [record] : []);
          setSelectorOpen(false);
        }}
      />
    </>
  );
}

function MoveImportModal({ open, currentWarehouse, existingTags, onCancel, onSuccess }) {
  const [errors, setErrors] = useState([]);
  const validAssets = ASSET_POOL.filter((item) => item.warehouse === currentWarehouse && !item.locked && SUPPORTED_MATERIAL_GROUPS.has(item.materialGroup) && !existingTags.has(item.assetTag));

  const importValid = () => {
    const picked = validAssets.slice(0, 2).map((item, index) => ({ ...item, id: `import-${Date.now()}-${index}`, moveDesc: 'Excel导入', moveStatus: '草稿', verification: '未验证', originalLockStatus: false }));
    if (!picked.length) {
      setErrors([{ row: 2, field: '标签号', reason: '当前仓库没有可导入的资产/低值耐用品' }]);
      return;
    }
    onSuccess(picked);
    setErrors([]);
    onCancel();
  };

  return (
    <Modal open={open} title="Excel导入移库物资" width={720} onCancel={onCancel} footer={<Button onClick={onCancel}>关闭</Button>} destroyOnHidden>
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Text>仅支持 .xls / .xlsx。标签号与SN至少填写一项；任一行校验失败时，本次导入整体不保存。</Typography.Text>
        <Space>
          <Button type="primary" onClick={importValid}>模拟选择有效文件</Button>
          <Button onClick={() => setErrors([
            { row: 2, field: '标签号', reason: '当前资产已被其他业务锁定，无法移库' },
            { row: 3, field: '标签号/SN', reason: '标签号、SN至少填写一项' },
          ])}>模拟校验失败</Button>
        </Space>
        {errors.length > 0 && (
          <>
            <Typography.Text type="danger">数据校验失败，请下载结果查看！</Typography.Text>
            <Table
              rowKey={(row) => `${row.row}-${row.field}`}
              size="small"
              bordered
              pagination={false}
              dataSource={errors}
              columns={[
                { title: 'Excel行号', dataIndex: 'row', width: 100 },
                { title: '字段', dataIndex: 'field', width: 150 },
                { title: '导入结果', dataIndex: 'reason' },
              ]}
            />
          </>
        )}
      </Space>
    </Modal>
  );
}

function MoveEditor({ source, onBack, onSave, onSubmit }) {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const editable = !source || source.status === '草稿';
  const [currentWarehouse, setCurrentWarehouse] = useState(source?.fromWarehouse || '');
  const [receiveWarehouse, setReceiveWarehouse] = useState(source?.toWarehouse || '');
  const [remark, setRemark] = useState(source?.remark || '');
  const [lineScanDraft, setLineScanDraft] = useState('');
  const [lineScan, setLineScan] = useState('');
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [lines, setLines] = useState(source?.lines || []);
  const [selectedLineKeys, setSelectedLineKeys] = useState([]);
  const [editingLine, setEditingLine] = useState(null);
  const [detailAsset, setDetailAsset] = useState(null);
  const documentNo = source?.documentNo || '保存后自动生成';
  const status = source?.status || '草稿';
  const createdDate = source?.createdDate || dayjs().format('YYYY-MM-DD');
  const existingTags = useMemo(() => new Set(lines.map((item) => item.assetTag)), [lines]);

  const visibleLines = useMemo(
    () => lines.filter((line) => !lineScan || includesText(line.assetTag, lineScan) || includesText(line.sn, lineScan)),
    [lines, lineScan]
  );

  const receiveWarehouseOptions = useMemo(() => {
    const current = getWarehouse(currentWarehouse);
    if (!current) return [];
    return WAREHOUSE_OPTIONS.filter((item) => item.financeCompany === current.financeCompany && item.name !== currentWarehouse);
  }, [currentWarehouse]);

  const openAdd = () => {
    if (!currentWarehouse) return messageApi.warning('请先选择当前仓库');
    setEditingLine(null);
    setLineModalOpen(true);
    return undefined;
  };

  const saveLines = (payloads, keepOpen) => {
    const rows = Array.isArray(payloads) ? payloads : [payloads];
    const duplicateInBatch = rows.some((row, index) => rows.findIndex((item) => item.assetTag === row.assetTag) !== index);
    if (duplicateInBatch) {
      messageApi.warning('本次选择中存在重复标签号，请重新选择');
      return false;
    }
    const otherLines = lines.filter((item) => item.id !== editingLine?.id);
    if (rows.some((row) => otherLines.some((item) => item.assetTag === row.assetTag))) {
      messageApi.warning('该资产已添加，请扫描验证其他资产');
      return false;
    }
    if (rows.some((row) => row.locked)) {
      messageApi.warning('当前资产已被其他业务锁定，无法移库');
      return false;
    }
    if (rows.some((row) => !SUPPORTED_MATERIAL_GROUPS.has(row.materialGroup))) {
      messageApi.warning('当前物资类型暂不支持移库');
      return false;
    }

    if (editingLine) {
      setLines((current) => current.map((item) => item.id === editingLine.id ? { ...rows[0], id: editingLine.id, lineNo: item.lineNo } : item));
      setEditingLine(null);
      setLineModalOpen(false);
      messageApi.success('移库物资已更新');
      return true;
    }

    setLines((current) => {
      const start = current.length;
      return [...current, ...rows.map((row, index) => ({ ...row, id: `${Date.now()}-${start + index}`, lineNo: start + index + 1 }))];
    });
    if (!keepOpen) setLineModalOpen(false);
    messageApi.success(keepOpen ? '物资已添加，可继续选择' : `已添加 ${rows.length} 条物资`);
    return true;
  };

  const deleteLines = () => {
    if (!selectedLineKeys.length) return messageApi.warning('请选中要删除的物资行！');
    Modal.confirm({
      title: '确认删除所选移库物资？',
      content: '删除草稿明细后，将同步释放本移库流程产生的资产锁。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const selected = new Set(selectedLineKeys);
        setLines((current) => current.filter((line) => !selected.has(line.id)).map((line, index) => ({ ...line, lineNo: index + 1 })));
        setSelectedLineKeys([]);
        messageApi.success('已删除所选物资并释放当前移库占用');
      },
    });
    return undefined;
  };

  const changeCurrentWarehouse = (value) => {
    if (!lines.length) {
      setCurrentWarehouse(value);
      if (receiveWarehouse === value) setReceiveWarehouse('');
      return;
    }
    Modal.confirm({
      title: '修改当前仓库？',
      content: '修改当前仓库后将清空当前移库明细，是否继续？',
      okText: '确认修改',
      cancelText: '取消',
      onOk: () => {
        setCurrentWarehouse(value);
        setReceiveWarehouse('');
        setLines([]);
        setSelectedLineKeys([]);
        messageApi.success('当前仓库已修改，原移库明细及本流程占用已清空');
      },
    });
  };

  const validate = (requireLines = false) => {
    if (!currentWarehouse) return '当前仓库必须选择';
    if (!receiveWarehouse) return '对方仓库必须选择';
    if (currentWarehouse === receiveWarehouse) return '当前仓库和对方仓库不能相同';
    const from = getWarehouse(currentWarehouse);
    const to = getWarehouse(receiveWarehouse);
    if (!from || !to || from.financeCompany !== to.financeCompany) return '对方仓库必须与当前仓库属于同一财务公司';
    if (remark.length > 60) return '备注最多允许填写60个字';
    if (requireLines && !lines.length) return '移库单还没有添加资产信息';
    const tags = lines.map((line) => line.assetTag);
    if (new Set(tags).size !== tags.length) return '以下资产标签号重复，请先删除';
    if (lines.some((line) => line.warehouse !== currentWarehouse)) return '该资产不在当前仓库！';
    if (lines.some((line) => line.locked)) return '当前资产已被其他业务锁定，无法移库';
    if (lines.some((line) => !SUPPORTED_MATERIAL_GROUPS.has(line.materialGroup))) return '当前物资类型暂不支持移库';
    return '';
  };

  const payload = () => ({ currentWarehouse, receiveWarehouse, remark, lines });

  const saveDraft = () => {
    const error = validate(false);
    if (error) return messageApi.warning(error);
    onSave(payload());
    return undefined;
  };

  const submitMove = () => {
    const error = validate(true);
    if (error) return messageApi.warning(error);
    Modal.confirm({
      title: '确认执行移库调出？',
      content: `提交后 ${lines.length} 条物资将进入 ${TRANSIT_WAREHOUSE}，单据状态变为“出库待接收”。`,
      okText: '移库提交',
      cancelText: '取消',
      onOk: () => onSubmit(payload()),
    });
    return undefined;
  };

  const materialColumns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => index + 1 },
    {
      title: '标签号',
      dataIndex: 'assetTag',
      width: 165,
      render: (value, row) => (
        <Button
          type="link"
          className="px-0 select-text"
          onClick={() => {
            if (editable) {
              setEditingLine(row);
              setLineModalOpen(true);
              return;
            }
            setDetailAsset(row);
          }}
        >
          {value}
        </Button>
      ),
    },
    { title: 'SN', dataIndex: 'sn', width: 150 },
    { title: '物资说明', dataIndex: 'materialDesc', width: 220 },
    { title: '物资总类', dataIndex: 'materialGroup', width: 130 },
    { title: '数量', dataIndex: 'quantity', width: 90, align: 'right', render: (value) => Number(value || 0).toLocaleString('zh-CN') },
    { title: '公司', dataIndex: 'company', width: 160 },
    { title: '板块', dataIndex: 'plate', width: 120 },
    { title: '资产标记', dataIndex: 'assetMark', width: 120 },
    { title: '启用日期', dataIndex: 'enabledDate', width: 130 },
    { title: '资产状态', dataIndex: 'assetStatus', width: 130 },
    { title: '移库状态', dataIndex: 'moveStatus', width: 130, render: (value) => <StatusTag value={value || '草稿'} /> },
    { title: '移库说明', dataIndex: 'moveDesc', width: 180, render: (value) => value || '-' },
    ...(editable ? [{ title: '操作', key: 'operation', width: 90, fixed: 'right', render: (_, row) => <Button type="link" className="px-0" onClick={() => { setEditingLine(row); setLineModalOpen(true); }}>编辑</Button> }] : []),
  ];

  const toolbar = editable ? (
    <Space>
      <Button type="primary" icon={<Plus size={14} />} onClick={openAdd}>添加物资</Button>
      <Button danger icon={<Trash2 size={14} />} onClick={deleteLines}>删除物资</Button>
      <Button icon={<Download size={14} />} onClick={() => messageApi.success('移库导入模板已准备（原型演示）')}>模板下载</Button>
      <Button icon={<Upload size={14} />} onClick={() => {
        if (!currentWarehouse) return messageApi.warning('请先选择当前仓库');
        setImportOpen(true);
        return undefined;
      }}>Excel导入</Button>
    </Space>
  ) : null;

  return (
    <div data-page-view-key={`move-editor-${status}`}>
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>移库单</PageTitle>

        <Card size="small" title="移库单信息">
          <DetailGrid columns={3} labelWidth={96}>
            <DetailItem label="移库单号"><Readonly>{documentNo}</Readonly></DetailItem>
            <DetailItem label="单据类型"><Readonly>移库单</Readonly></DetailItem>
            <DetailItem label="单据状态"><StatusTag value={status} /></DetailItem>
            <DetailItem label={<RequiredLabel>当前仓库</RequiredLabel>}>
              {editable ? (
                <Select
                  className="w-full"
                  value={currentWarehouse || undefined}
                  placeholder="请选择当前仓库"
                  options={WAREHOUSE_OPTIONS.filter((item) => OUTBOUND_WAREHOUSE_NAMES.includes(item.name)).map((item) => ({ label: item.name, value: item.name }))}
                  onChange={changeCurrentWarehouse}
                />
              ) : <Readonly>{currentWarehouse}</Readonly>}
            </DetailItem>
            <DetailItem label={<RequiredLabel>对方仓库</RequiredLabel>}>
              <LookupInput value={receiveWarehouse} placeholder="请选择对方仓库" disabled={!editable || !currentWarehouse} onOpen={() => setWarehouseModalOpen(true)} />
            </DetailItem>
            <DetailItem label="制单人"><Readonly>{source?.creator || CURRENT_USER}</Readonly></DetailItem>
            <DetailItem label="制单日期"><Readonly>{createdDate}</Readonly></DetailItem>
            {source?.sourceDocumentNo && <DetailItem label="来源移库单号"><Readonly>{source.sourceDocumentNo}</Readonly></DetailItem>}
            <DetailItem label="备注" span={3}>{editable ? <TextArea maxLength={60} showCount autoSize={{ minRows: 3, maxRows: 5 }} value={remark} onChange={(event) => setRemark(event.target.value)} /> : <Readonly>{remark}</Readonly>}</DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="移库物资" extra={<Typography.Text type="secondary">共 {visibleLines.length} 条</Typography.Text>}>
          <QueryBar onQuery={() => setLineScan(lineScanDraft)} onReset={() => { setLineScanDraft(''); setLineScan(''); }}>
            <QueryItem label="资产扫描">
              <Input value={lineScanDraft} allowClear placeholder="扫码或手输标签号/SN" onChange={(event) => setLineScanDraft(event.target.value)} onPressEnter={() => setLineScan(lineScanDraft)} />
            </QueryItem>
          </QueryBar>
          {toolbar && <div className="mb-3 flex justify-end">{toolbar}</div>}
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={materialColumns}
            dataSource={visibleLines}
            rowSelection={editable ? { selectedRowKeys: selectedLineKeys, onChange: setSelectedLineKeys, fixed: true, columnTitle: '选择' } : undefined}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Card>

        <div className="flex justify-center gap-3">
          {editable && <Button onClick={saveDraft}>保存草稿</Button>}
          {editable && <Button type="primary" onClick={submitMove}>移库提交</Button>}
          {!editable && ['已完成', '已驳回'].includes(status) && <Button onClick={() => messageApi.info('移库单打印已生成（原型演示）')}>打印</Button>}
          {!editable && ['已完成', '已驳回'].includes(status) && <Button onClick={() => messageApi.success('移库明细已导出（原型演示）')}>导出</Button>}
          <Button onClick={onBack}>返回</Button>
        </div>

        <SelectModal
          open={warehouseModalOpen}
          title="选择对方仓库"
          dataSource={receiveWarehouseOptions}
          columns={[{ title: '仓库', dataIndex: 'name' }, { title: '财务公司', dataIndex: 'financeCompany' }]}
          searchFields={[{ label: '仓库', name: 'name', dataIndex: 'name' }, { label: '财务公司', name: 'financeCompany', dataIndex: 'financeCompany' }]}
          onCancel={() => setWarehouseModalOpen(false)}
          onConfirm={(record) => { setReceiveWarehouse(record.name); setWarehouseModalOpen(false); }}
        />

        <MoveItemModal
          key={`${lineModalOpen}-${editingLine?.id || 'new'}-${currentWarehouse}-${lines.length}`}
          open={lineModalOpen}
          currentWarehouse={currentWarehouse}
          initialLine={editingLine}
          existingTags={existingTags}
          onCancel={() => { setLineModalOpen(false); setEditingLine(null); }}
          onConfirm={saveLines}
        />

        <MoveImportModal
          key={`${importOpen}-${currentWarehouse}-${lines.length}`}
          open={importOpen}
          currentWarehouse={currentWarehouse}
          existingTags={existingTags}
          onCancel={() => setImportOpen(false)}
          onSuccess={(items) => {
            saveLines(items, false);
            messageApi.success(`Excel导入成功，共 ${items.length} 条`);
          }}
        />

        <MoveAssetDetailModal open={Boolean(detailAsset)} document={source || { documentNo, fromWarehouse: currentWarehouse, toWarehouse: receiveWarehouse, creator: CURRENT_USER }} asset={detailAsset} onCancel={() => setDetailAsset(null)} />
      </Space>
    </div>
  );
}

export default function MovePage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeTab, setActiveTab] = useState('initiated');
  const [view, setView] = useState('list');
  const [activeRow, setActiveRow] = useState(null);
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [receiveDetailOpen, setReceiveDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const creators = useMemo(
    () => [...new Set(documents.map((row) => row.creator))].map((name, index) => ({ id: index + 1, name })),
    [documents]
  );

  const filteredRows = useMemo(() => documents.filter((row) => (
    includesText(row.documentNo, filters.documentNo)
    && (!filters.status || row.status === filters.status)
    && includesText(row.creator, filters.creator)
    && inDateRange(row.createdDate, filters.createdFrom, filters.createdTo)
    && rowContainsAsset(row, filters.assetScan)
  )), [documents, filters]);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value || '' }));

  const deleteRows = () => {
    if (!selectedRowKeys.length) return messageApi.warning('请先选择需要操作的移库单');
    const selectedRows = documents.filter((row) => selectedRowKeys.includes(row.id));
    if (selectedRows.some((row) => row.status !== '草稿')) return messageApi.warning('仅草稿移库单允许删除');
    Modal.confirm({
      title: '确认删除所选移库单？',
      content: `共选择 ${selectedRowKeys.length} 条。删除后同步释放当前移库流程产生的资产锁。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const selected = new Set(selectedRowKeys);
        setDocuments((current) => current.filter((row) => !selected.has(row.id)));
        setSelectedRowKeys([]);
        messageApi.success('已删除所选草稿移库单');
      },
    });
    return undefined;
  };

  const openEditor = (row = null) => {
    setActiveRow(row);
    setView('editor');
  };

  const saveDraft = ({ currentWarehouse, receiveWarehouse, remark, lines }) => {
    if (activeRow) {
      const next = {
        ...activeRow,
        status: '草稿',
        fromWarehouse: currentWarehouse,
        toWarehouse: receiveWarehouse,
        remark,
        lines: lines.map((line, index) => ({ ...line, lineNo: index + 1 })),
        quantity: lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0),
      };
      setDocuments((current) => current.map((row) => row.id === activeRow.id ? next : row));
      setActiveRow(next);
      messageApi.success('移库单草稿已保存');
      return;
    }
    const id = Math.max(0, ...documents.map((row) => Number(row.id) || 0)) + 1;
    const created = {
      id,
      documentNo: createDocumentNo(documents),
      status: '草稿',
      fromWarehouse: currentWarehouse,
      toWarehouse: receiveWarehouse,
      createdDate: dayjs().format('YYYY-MM-DD'),
      creator: CURRENT_USER,
      quantity: lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0),
      remark,
      lines: lines.map((line, index) => ({ ...line, lineNo: index + 1 })),
    };
    setDocuments((current) => [created, ...current]);
    setActiveRow(created);
    messageApi.success(`已生成移库单 ${created.documentNo}`);
  };

  const submitMove = ({ currentWarehouse, receiveWarehouse, remark, lines }) => {
    const id = activeRow?.id || Math.max(0, ...documents.map((row) => Number(row.id) || 0)) + 1;
    const documentNo = activeRow?.documentNo || createDocumentNo(documents);
    const submitted = {
      ...(activeRow || {}),
      id,
      documentNo,
      status: '出库待接收',
      fromWarehouse: currentWarehouse,
      toWarehouse: receiveWarehouse,
      createdDate: activeRow?.createdDate || dayjs().format('YYYY-MM-DD'),
      creator: activeRow?.creator || CURRENT_USER,
      quantity: lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0),
      remark,
      notificationStatus: '已通知',
      reminderStatus: '未超期',
      outboundTime: dayjs().format('YYYY-MM-DD HH:mm'),
      lines: lines.map((line, index) => ({
        ...line,
        lineNo: index + 1,
        snapshot: line.snapshot || { ...line },
        warehouse: TRANSIT_WAREHOUSE,
        moveStatus: '待接收',
        verification: '未验证',
        verificationDesc: '',
        verificationMethod: '',
        verificationTime: '',
        receiver: '',
        receiveTime: '',
        transactionOut: '24',
        transactionIn: '',
      })),
    };
    setDocuments((current) => activeRow
      ? current.map((row) => row.id === activeRow.id ? submitted : row)
      : [submitted, ...current]);
    messageApi.success(`移库单 ${documentNo} 已调出至集团在途总库，等待目标仓接收`);
    setView('list');
    setActiveRow(null);
  };

  if (view === 'editor') {
    return (
      <>
        {contextHolder}
        <MoveEditor
          source={activeRow}
          onBack={() => { setView('list'); setActiveRow(null); }}
          onSave={saveDraft}
          onSubmit={submitMove}
        />
      </>
    );
  }

  const columns = [
    { title: '行号', width: 70, align: 'center', render: (_, __, index) => (page - 1) * pageSize + index + 1 },
    { title: '移库单号', dataIndex: 'documentNo', width: 190, render: (value, row) => <Button type="link" className="px-0 select-text" onClick={() => openEditor(row)}>{value}</Button> },
    { title: '单据状态', dataIndex: 'status', width: 130, render: (value) => <StatusTag value={value} /> },
    { title: '移出仓库', dataIndex: 'fromWarehouse', width: 320 },
    { title: '移入仓库', dataIndex: 'toWarehouse', width: 320 },
    { title: '制单日期', dataIndex: 'createdDate', width: 130 },
    { title: '制单人', dataIndex: 'creator', width: 170 },
    { title: '物资数量', dataIndex: 'quantity', width: 110, align: 'right', render: (value) => Number(value || 0).toLocaleString('zh-CN') },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full" data-page-view-key={`move-list-${activeTab}`}>
      {contextHolder}
      <PageTitle>移库</PageTitle>
      {!(activeTab === 'received' && receiveDetailOpen) && (
        <Card size="small">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => { setActiveTab(key); setSelectedRowKeys([]); setReceiveDetailOpen(false); }}
            items={[
              { key: 'initiated', label: '发起单据' },
              { key: 'received', label: '接收单据' },
            ]}
          />
        </Card>
      )}

      {activeTab === 'received' ? (
        <MoveReceiveContent documents={documents} setDocuments={setDocuments} onDetailChange={setReceiveDetailOpen} />
      ) : (
        <>
          <QueryBar
            onQuery={() => { setFilters({ ...draft }); setSelectedRowKeys([]); setPage(1); }}
            onReset={() => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setSelectedRowKeys([]); setPage(1); }}
          >
            <QueryItem label="移库单号"><Input value={draft.documentNo} allowClear placeholder="请输入移库单号" onChange={(event) => update('documentNo', event.target.value)} /></QueryItem>
            <QueryItem label="单据状态"><Select className="w-full" value={draft.status || undefined} allowClear placeholder="全部" options={DOCUMENT_STATUSES.map((value) => ({ label: value, value }))} onChange={(value) => update('status', value)} /></QueryItem>
            <QueryItem label="制单人"><LookupInput value={draft.creator} placeholder="请选择制单人" onOpen={() => setCreatorModalOpen(true)} /></QueryItem>
            <QueryItem label="制单日期">
              <RangePicker
                className="w-full"
                value={[draft.createdFrom ? dayjs(draft.createdFrom) : null, draft.createdTo ? dayjs(draft.createdTo) : null]}
                onChange={(dates) => {
                  update('createdFrom', dates?.[0]?.format('YYYY-MM-DD') || '');
                  update('createdTo', dates?.[1]?.format('YYYY-MM-DD') || '');
                }}
              />
            </QueryItem>
            <QueryItem label="资产扫描">
              <Input value={draft.assetScan} allowClear placeholder="扫码或手输标签号/SN" onChange={(event) => update('assetScan', event.target.value)} onPressEnter={() => { setFilters({ ...draft }); setSelectedRowKeys([]); setPage(1); }} />
            </QueryItem>
          </QueryBar>

          <Card
            size="small"
            title="移库单列表"
            extra={<Space><Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text><Button type="primary" icon={<Plus size={14} />} onClick={() => openEditor()}>创建</Button><Button danger icon={<Trash2 size={14} />} onClick={deleteRows}>删除</Button><Button icon={<Download size={14} />} onClick={() => messageApi.success('当前查询结果已导出（原型演示）')}>导出</Button></Space>}
          >
            <Table
              rowKey="id"
              size="small"
              bordered
              columns={columns}
              dataSource={filteredRows}
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, fixed: true }}
              scroll={{ x: 'max-content' }}
              pagination={{
                current: page,
                pageSize,
                showSizeChanger: true,
                onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize); },
              }}
            />
          </Card>
        </>
      )}

      <SelectModal
        open={creatorModalOpen}
        title="选择制单人"
        dataSource={creators}
        columns={[{ title: '名称', dataIndex: 'name' }]}
        searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]}
        onCancel={() => setCreatorModalOpen(false)}
        onConfirm={(record) => { update('creator', record.name); setCreatorModalOpen(false); }}
      />
    </Space>
  );
}
