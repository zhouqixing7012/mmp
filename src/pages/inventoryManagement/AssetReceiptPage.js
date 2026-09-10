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
import { Search, Trash2, Upload } from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const PO_ROWS = [
  { id: 1, poNo: 'PO2608200004', receiptStatus: '待接收', poName: '电子设备采购订单', company: '北京新动力', plate: '搜狐网-web', supplier: '老六的公司', pushDate: '2026-08-20', purchaseType: '电子设备' },
  { id: 2, poNo: 'PO2410280002', receiptStatus: '待接收', poName: '服务器备件采购订单', company: '新媒体', plate: '', supplier: '上海华讯网络系统有限公司', pushDate: '2024-10-30', purchaseType: '服务器备件' },
  { id: 3, poNo: 'PO2103040001', receiptStatus: '待接收', poName: '服务器采购订单', company: '新媒体', plate: '', supplier: '北京亚康环宇科技有限公司', pushDate: '2021-06-08', purchaseType: '服务器' },
  { id: 4, poNo: 'PO2606030001', receiptStatus: '已入库', poName: '电子设备采购订单', company: '新媒体', plate: 'Corporate', supplier: '北京汉信成科技发展有限公司', pushDate: '2026-06-08', purchaseType: '电子设备' },
  { id: 5, poNo: 'PO2606020006', receiptStatus: '已入库', poName: '电子设备采购订单', company: '天津飞狐', plate: '视频', supplier: '北京荣泽嘉业商贸有限公司', pushDate: '2026-06-02', purchaseType: '电子设备' },
  { id: 6, poNo: 'PO2606020005', receiptStatus: '已入库', poName: '电子设备采购订单', company: '天津飞狐', plate: '视频', supplier: '北京一新科技有限责任公司', pushDate: '2026-06-05', purchaseType: '电子设备' },
  { id: 7, poNo: 'PO2606020004', receiptStatus: '已入库', poName: '电子设备采购订单', company: '北京新动力', plate: '视频', supplier: '北京汉信成科技发展有限公司', pushDate: '2026-06-08', purchaseType: '电子设备' },
  { id: 8, poNo: 'PO2606020003', receiptStatus: '已入库', poName: '电子设备采购订单', company: '天津飞狐', plate: '视频', supplier: '北京美捷美科技有限公司', pushDate: '2026-06-08', purchaseType: '电子设备' },
  { id: 9, poNo: 'PO2606020002', receiptStatus: '已入库', poName: '电子设备采购订单', company: '北京新动力', plate: '视频', supplier: '华盛天诚（北京）科技有限公司', pushDate: '2026-07-20', purchaseType: '电子设备' },
  { id: 10, poNo: 'PO2606020001', receiptStatus: '已入库', poName: '电子设备采购订单', company: '天津飞狐', plate: '视频', supplier: '北京汉信成科技有限公司', pushDate: '2026-06-08', purchaseType: '电子设备' },
];

const RECEIPT_ROWS = [
  {
    id: 1,
    receiptNo: 'REC-202606110001',
    status: '接收完成',
    poNo: 'PO2606030001',
    supplier: '北京汉信成科技发展有限公司',
    creator: '王英',
    createdAt: '2026-06-11 16:23:59',
  },
  {
    id: 2,
    receiptNo: 'REC-202608200001',
    status: '接收完成',
    poNo: 'PO2608200004',
    supplier: '老六的公司',
    creator: 'admin-系统管理员',
    createdAt: '2026-08-20 15:30:00',
  },
];

const ELECTRONIC_PO_DETAIL = {
  supplierPhone: '-',
  procurementUnit: '北京新动力',
  contractSubject: '北京搜狐新动力信息技术有限公司',
  untaxedAmount: '123.76',
  taxAmount: '1.24',
  totalAmount: '125.00',
  buyer: '114664.薛毛毛',
  buyerPhone: '18911208538',
  items: [
    {
      id: 1,
      editable: false,
      receiptStatus: '已入库',
      materialGroup: '1.资产',
      assetClass: '13.OFFICE EQUIPMENT',
      materialCode: '113028079006000',
      materialDesc: '曼富图.MVR901EPEX变焦手柄',
      poDesc: '曼富图.MVR901EPEX变焦手柄-16+512',
      config: '16+512',
      partQuantity: '-',
      partDesc: '-',
      currentReceiptQty: 0,
      purchaseQty: 1,
      untaxedUnitPrice: '-',
      untaxedSubtotal: '-',
      totalTax: '-',
      taxedUnitPrice: '-',
      taxedSubtotal: '-',
      taxRate: '-',
      receivedQty: 1,
      draftQty: 0,
      agreedArrivalDate: '-',
      prLineNo: '-',
      saLineNo: '-',
      applicationNo: '-',
      department: '-',
      businessLine: '-',
    },
    {
      id: 2,
      editable: true,
      receiptStatus: '待接收',
      materialGroup: '1.资产',
      assetClass: '13.OFFICE EQUIPMENT',
      materialCode: '113004066005000',
      materialDesc: '魅族.魅族 MX4 PRO(联通版)',
      poDesc: '魅族.魅族 MX4 PRO(联通版)-16+512',
      config: '16+512',
      partQuantity: '-',
      partDesc: '-',
      currentReceiptQty: 1,
      purchaseQty: 1,
      untaxedUnitPrice: '-',
      untaxedSubtotal: '-',
      totalTax: '-',
      taxedUnitPrice: '-',
      taxedSubtotal: '-',
      taxRate: '-',
      receivedQty: 0,
      draftQty: 0,
      agreedArrivalDate: '-',
      prLineNo: '-',
      saLineNo: '-',
      applicationNo: '-',
      department: '-',
      businessLine: '-',
    },
  ],
};

const SERVER_PO_DETAIL = {
  supplierPhone: '1058834065',
  procurementUnit: '新媒体',
  contractSubject: '北京搜狐新媒体信息技术有限公司',
  untaxedAmount: '49,800.77',
  taxAmount: '6,474.10',
  totalAmount: '56,274.87',
  buyer: '114664.薛毛毛',
  buyerPhone: '010-62728109',
  items: [
    {
      id: 1,
      editable: true,
      receiptStatus: '待接收',
      materialGroup: '1.资产',
      assetClass: '14.SERVER',
      materialCode: '114008042010000',
      materialDesc: 'Dell.R740',
      poDesc: 'Dell.R740-Intel Silver4210*2,DDR4_2933MHz_16G*8,Seagate_SAS12Gb_2.5寸_10k_600GB*8,双口千兆+双光口万兆(Intel X710)*1,H740P_电池*1,白金750W热插拔*2,2U2.5寸8盘位机箱*1',
      config: 'Intel Silver4210*2,DDR4_2933MHz_16G*8,Seagate_SAS12Gb_2.5寸_10k_600GB*8,双口千兆+双光口万兆(Intel X710)*1,H740P_电池*1,白金750W热插拔*2,2U2.5寸8盘位机箱*1',
      partQuantity: '-',
      partDesc: '-',
      currentReceiptQty: 1,
      purchaseQty: 1,
      untaxedUnitPrice: '-',
      untaxedSubtotal: '-',
      totalTax: '-',
      taxedUnitPrice: '-',
      taxedSubtotal: '-',
      taxRate: '-',
      receivedQty: 0,
      draftQty: 0,
      agreedArrivalDate: '-',
      prLineNo: '-',
      saLineNo: '-',
      applicationNo: '-',
      department: '-',
      businessLine: '-',
    },
  ],
};

const EMPTY_PO_FILTERS = {
  company: '',
  plate: '',
  poNo: '',
  supplier: '',
  receiptStatus: '',
  purchaseType: '',
};

const EMPTY_RECEIPT_FILTERS = {
  receiptNo: '',
  poNo: '',
  status: '',
  creator: '',
  createdFrom: '',
  createdTo: '',
  supplier: '',
};

const DIRECT_INBOUND_TYPES = new Set(['服务器', '服务器备件', '网络设备', '网络设备备件']);

function includesText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).trim().toLowerCase());
}

function toSelectData(values) {
  return [...new Set(values.filter(Boolean))].map((name, index) => ({ id: index + 1, name }));
}

function getPoDetail(po) {
  if (!po) return {};
  if (po.purchaseType === '电子设备') return ELECTRONIC_PO_DETAIL;
  if (po.purchaseType === '服务器') return SERVER_PO_DETAIL;
  return {};
}

function SelectorInput({ value, placeholder, onOpen }) {
  return (
    <div className="cursor-pointer" onClick={onOpen}>
      <Input
        value={value}
        readOnly
        allowClear={false}
        placeholder={placeholder}
        className="pointer-events-none"
        suffix={<Search size={14} className="text-[#1677ff]" />}
      />
    </div>
  );
}

function PageTitle({ children }) {
  return <Typography.Title level={3} className="mb-0">{children}</Typography.Title>;
}

function Readonly({ children }) {
  return <Typography.Text>{children === 0 ? 0 : (children || '-')}</Typography.Text>;
}

export default function AssetReceiptPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [view, setView] = useState('poList');
  const [activePO, setActivePO] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [poDraftFilters, setPoDraftFilters] = useState(EMPTY_PO_FILTERS);
  const [poAppliedFilters, setPoAppliedFilters] = useState(EMPTY_PO_FILTERS);
  const [receiptDraftFilters, setReceiptDraftFilters] = useState(EMPTY_RECEIPT_FILTERS);
  const [receiptAppliedFilters, setReceiptAppliedFilters] = useState(EMPTY_RECEIPT_FILTERS);
  const [receiptRows, setReceiptRows] = useState(RECEIPT_ROWS);
  const [selectedReceiptKeys, setSelectedReceiptKeys] = useState([]);
  const [selectedReceiptLineKeys, setSelectedReceiptLineKeys] = useState([]);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const [detailPlate, setDetailPlate] = useState('');
  const [applicationBatch, setApplicationBatch] = useState('');
  const [selectorType, setSelectorType] = useState('');

  const companyData = useMemo(() => toSelectData(PO_ROWS.map((item) => item.company)), []);
  const plateData = useMemo(() => toSelectData(PO_ROWS.map((item) => item.plate)), []);
  const supplierData = useMemo(() => toSelectData(PO_ROWS.map((item) => item.supplier)), []);

  const filteredPoRows = useMemo(() => PO_ROWS.filter((row) => (
    includesText(row.company, poAppliedFilters.company)
    && includesText(row.plate, poAppliedFilters.plate)
    && includesText(row.poNo, poAppliedFilters.poNo)
    && includesText(row.supplier, poAppliedFilters.supplier)
    && (!poAppliedFilters.receiptStatus || row.receiptStatus === poAppliedFilters.receiptStatus)
    && (!poAppliedFilters.purchaseType || row.purchaseType === poAppliedFilters.purchaseType)
  )), [poAppliedFilters]);

  const filteredReceiptRows = useMemo(() => receiptRows.filter((row) => {
    const date = row.createdAt ? row.createdAt.slice(0, 10) : '';
    if (!includesText(row.receiptNo, receiptAppliedFilters.receiptNo)) return false;
    if (!includesText(row.poNo, receiptAppliedFilters.poNo)) return false;
    if (!includesText(row.status, receiptAppliedFilters.status)) return false;
    if (!includesText(row.creator, receiptAppliedFilters.creator)) return false;
    if (!includesText(row.supplier, receiptAppliedFilters.supplier)) return false;
    if (receiptAppliedFilters.createdFrom && date < receiptAppliedFilters.createdFrom) return false;
    if (receiptAppliedFilters.createdTo && date > receiptAppliedFilters.createdTo) return false;
    return true;
  }), [receiptRows, receiptAppliedFilters]);

  const updatePoFilter = (field, value) => {
    setPoDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const updateReceiptFilter = (field, value) => {
    setReceiptDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const updateReceiptDateRange = (dates) => {
    setReceiptDraftFilters((current) => ({
      ...current,
      createdFrom: dates?.[0] ? dates[0].format('YYYY-MM-DD') : '',
      createdTo: dates?.[1] ? dates[1].format('YYYY-MM-DD') : '',
    }));
  };

  const openPoDetail = (row) => {
    setActivePO(row);
    setDetailPlate(row.plate || '');
    setApplicationBatch('');
    setSelectedItemKeys([]);
    setView('poDetail');
  };

  const openReceiptList = (row) => {
    const filters = { ...EMPTY_RECEIPT_FILTERS, poNo: row.poNo };
    setActivePO(row);
    setActiveReceipt(null);
    setReceiptDraftFilters(filters);
    setReceiptAppliedFilters(filters);
    setSelectedReceiptKeys([]);
    setView('receiptList');
  };

  const openReceiptDetail = (row) => {
    setActiveReceipt(row);
    setActivePO(PO_ROWS.find((item) => item.poNo === row.poNo) || activePO);
    setSelectedReceiptLineKeys([]);
    setView('receiptDetail');
  };

  const selectorConfig = {
    company: {
      title: '选择公司',
      dataSource: companyData,
      onConfirm: (record) => updatePoFilter('company', record.name),
    },
    plate: {
      title: '选择板块',
      dataSource: plateData,
      onConfirm: (record) => updatePoFilter('plate', record.name),
    },
    supplier: {
      title: '选择供应商',
      dataSource: supplierData,
      onConfirm: (record) => updatePoFilter('supplier', record.name),
    },
    detailPlate: {
      title: '选择板块',
      dataSource: plateData,
      onConfirm: (record) => setDetailPlate(record.name),
    },
  }[selectorType];

  const poColumns = [
    { title: '行号', dataIndex: 'id', width: 72, align: 'center' },
    {
      title: 'PO单号',
      dataIndex: 'poNo',
      width: 170,
      render: (value, row) => (
        <Button type="link" className="px-0" onClick={() => openPoDetail(row)}>
          {value}
        </Button>
      ),
    },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 120, render: (value) => <StatusTag value={value} /> },
    { title: 'PO单名称', dataIndex: 'poName', width: 220 },
    { title: '公司', dataIndex: 'company', width: 150 },
    { title: '板块', dataIndex: 'plate', width: 130, render: (value) => value || '-' },
    { title: '供应商', dataIndex: 'supplier', width: 280 },
    { title: '推送日期', dataIndex: 'pushDate', width: 130 },
    { title: '采购类型', dataIndex: 'purchaseType', width: 140 },
    {
      title: '操作',
      key: 'operation',
      width: 130,
      fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          <Button type="link" className="px-0" onClick={() => openPoDetail(row)}>接收</Button>
          <Button type="link" className="px-0" onClick={() => openReceiptList(row)}>查看</Button>
        </Space>
      ),
    },
  ];

  const receiptColumns = [
    { title: '行号', dataIndex: 'id', width: 72, align: 'center' },
    {
      title: '接收单号',
      dataIndex: 'receiptNo',
      width: 210,
      render: (value, row) => <Typography.Link onClick={() => openReceiptDetail(row)}>{value}</Typography.Link>,
    },
    { title: '单据状态', dataIndex: 'status', width: 140, render: (value) => <StatusTag value={value} /> },
    { title: 'PO单号', dataIndex: 'poNo', width: 180 },
    { title: '供应商', dataIndex: 'supplier', width: 280 },
    { title: '制单人', dataIndex: 'creator', width: 140 },
    { title: '制单时间', dataIndex: 'createdAt', width: 190 },
  ];

  const itemColumns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    {
      title: '操作',
      key: 'operation',
      width: 80,
      fixed: 'left',
      render: (_, row) => row.editable
        ? <Button type="link" className="px-0" onClick={() => messageApi.info('物资编辑字段待确认')}>编辑</Button>
        : '-',
    },
    { title: '接收状态', dataIndex: 'receiptStatus', width: 120, render: (value) => value ? <StatusTag value={value} /> : '-' },
    { title: '物资总类', dataIndex: 'materialGroup', width: 120 },
    { title: '资产大类', dataIndex: 'assetClass', width: 180 },
    { title: '物料编码', dataIndex: 'materialCode', width: 170 },
    { title: '物料说明', dataIndex: 'materialDesc', width: 230 },
    { title: 'PO单说明', dataIndex: 'poDesc', width: 360 },
    { title: '配置', dataIndex: 'config', width: 300 },
    { title: '部件数量', dataIndex: 'partQuantity', width: 110 },
    { title: '部件说明', dataIndex: 'partDesc', width: 180 },
    { title: '本次接收数量', dataIndex: 'currentReceiptQty', width: 130, align: 'right' },
    { title: '采购数量', dataIndex: 'purchaseQty', width: 100, align: 'right' },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 120, align: 'right' },
    { title: '不含税金额小计', dataIndex: 'untaxedSubtotal', width: 140, align: 'right' },
    { title: '总税额', dataIndex: 'totalTax', width: 100, align: 'right' },
    { title: '含税单价', dataIndex: 'taxedUnitPrice', width: 110, align: 'right' },
    { title: '含税小计', dataIndex: 'taxedSubtotal', width: 110, align: 'right' },
    { title: '税率', dataIndex: 'taxRate', width: 90, align: 'right' },
    { title: '已接收数量', dataIndex: 'receivedQty', width: 120, align: 'right' },
    { title: '草稿数量', dataIndex: 'draftQty', width: 100, align: 'right' },
    { title: '约定到货日期', dataIndex: 'agreedArrivalDate', width: 130 },
    { title: 'PR单/行号', dataIndex: 'prLineNo', width: 140 },
    { title: 'SA单/行号', dataIndex: 'saLineNo', width: 140 },
    { title: '申请单号', dataIndex: 'applicationNo', width: 160 },
    { title: '部门', dataIndex: 'department', width: 180 },
    { title: '业务线', dataIndex: 'businessLine', width: 140 },
  ];

  const receiptDetailColumns = [
    { title: '行号', dataIndex: 'id', width: 70, align: 'center' },
    { title: '物料说明', dataIndex: 'materialDesc', width: 240 },
    { title: '配置', dataIndex: 'config', width: 220 },
    { title: '部件数量', dataIndex: 'partQuantity', width: 110 },
    { title: '部件说明', dataIndex: 'partDesc', width: 180 },
    { title: '本次接收数量', dataIndex: 'currentReceiptQty', width: 130, align: 'right' },
    { title: '采购数量', dataIndex: 'purchaseQty', width: 100, align: 'right' },
    { title: '不含税单价', dataIndex: 'untaxedUnitPrice', width: 120, align: 'right' },
    { title: '不含税金额小计', dataIndex: 'untaxedSubtotal', width: 140, align: 'right' },
    { title: '税额', dataIndex: 'totalTax', width: 100, align: 'right' },
    { title: '含税单价', dataIndex: 'taxedUnitPrice', width: 110, align: 'right' },
    { title: '含税小计', dataIndex: 'taxedSubtotal', width: 110, align: 'right' },
    { title: '税率', dataIndex: 'taxRate', width: 90, align: 'right' },
    { title: '约定到货日期', dataIndex: 'agreedArrivalDate', width: 130 },
    { title: 'PR单/行号', dataIndex: 'prLineNo', width: 140 },
    { title: 'SA单/行号', dataIndex: 'saLineNo', width: 140 },
    { title: '申请单号', dataIndex: 'applicationNo', width: 160 },
    { title: '部门', dataIndex: 'department', width: 180 },
    { title: '业务线', dataIndex: 'businessLine', width: 140 },
  ];

  if (view === 'poDetail' && activePO) {
    const detail = getPoDetail(activePO);
    const itemRows = detail.items || [];
    const canCreateReceipt = activePO.purchaseType === '电子设备';
    const canExecuteInbound = DIRECT_INBOUND_TYPES.has(activePO.purchaseType);

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>资产接收</PageTitle>

        <Card size="small" title="PO单信息">
          <DetailGrid columns={3} labelWidth={112}>
            <DetailItem label="PO单号"><Readonly>{activePO.poNo}</Readonly></DetailItem>
            <DetailItem label="供应商"><Readonly>{activePO.supplier}</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{detail.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{activePO.poName}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{detail.procurementUnit || activePO.company}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{detail.contractSubject}</Readonly></DetailItem>
            <DetailItem label="不含税合计"><Readonly>{detail.untaxedAmount}</Readonly></DetailItem>
            <DetailItem label="合计税额"><Readonly>{detail.taxAmount}</Readonly></DetailItem>
            <DetailItem label="合计金额"><Readonly>{detail.totalAmount}</Readonly></DetailItem>
            <DetailItem label="采购员"><Readonly>{detail.buyer}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{detail.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="推送日期"><Readonly>{activePO.pushDate}</Readonly></DetailItem>
            <DetailItem label="板块">
              <SelectorInput value={detailPlate} placeholder="请选择板块" onOpen={() => setSelectorType('detailPlate')} />
            </DetailItem>
            <DetailItem label="申请批次">
              <Input value={applicationBatch} placeholder="请输入申请批次" onChange={(event) => setApplicationBatch(event.target.value)} />
            </DetailItem>
          </DetailGrid>
        </Card>

        <Card size="small" title="PO物资明细" extra={<Typography.Text type="secondary">共 {itemRows.length} 条</Typography.Text>}>
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={itemColumns}
            dataSource={itemRows}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedItemKeys,
              onChange: setSelectedItemKeys,
              fixed: true,
              columnTitle: '选择',
              columnWidth: 64,
              getCheckboxProps: (record) => ({ disabled: record.receiptStatus === '已入库' }),
            }}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Card>

        <div className="flex justify-center gap-3">
          {canCreateReceipt && (
            <Button
              type="primary"
              onClick={() => {
                if (selectedItemKeys.length === 0) {
                  messageApi.warning('请先选择需要创建接收单的物资');
                  return;
                }
                messageApi.success('创建接收单操作已记录（原型）');
              }}
            >
              创建接收单
            </Button>
          )}
          {canExecuteInbound && (
            <Button
              type="primary"
              onClick={() => {
                if (selectedItemKeys.length === 0) {
                  messageApi.warning('请先选择需要入库的物资');
                  return;
                }
                messageApi.info('执行入库的后续字段待确认');
              }}
            >
              执行入库
            </Button>
          )}
          <Button onClick={() => setView('poList')}>返回</Button>
        </div>

        {selectorConfig && (
          <SelectModal
            open
            title={selectorConfig.title}
            dataSource={selectorConfig.dataSource}
            columns={[{ title: '名称', dataIndex: 'name' }]}
            searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]}
            onCancel={() => setSelectorType('')}
            onConfirm={selectorConfig.onConfirm}
          />
        )}
      </Space>
    );
  }

  if (view === 'receiptDetail' && activeReceipt) {
    const receiptPO = PO_ROWS.find((item) => item.poNo === activeReceipt.poNo) || activePO;
    const detail = getPoDetail(receiptPO);
    const detailItems = detail.items || [];
    const receiptItems = detailItems.filter((item) => Number(item.currentReceiptQty || 0) > 0);
    const visibleReceiptItems = receiptItems.length > 0 ? receiptItems : detailItems;

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>资产接收</PageTitle>

        <Card size="small" title="接收单信息">
          <DetailGrid columns={3} labelWidth={120}>
            <DetailItem label="采购接收单号"><Readonly>{activeReceipt.receiptNo}</Readonly></DetailItem>
            <DetailItem label="PO单号"><Readonly>{activeReceipt.poNo}</Readonly></DetailItem>
            <DetailItem label="PO单说明"><Readonly>{receiptPO?.poName}</Readonly></DetailItem>
            <DetailItem label="供应商"><Readonly>{activeReceipt.supplier}</Readonly></DetailItem>
            <DetailItem label="联系人"><Readonly>-</Readonly></DetailItem>
            <DetailItem label="供应商联系电话"><Readonly>{detail.supplierPhone}</Readonly></DetailItem>
            <DetailItem label="采购单位"><Readonly>{detail.procurementUnit || receiptPO?.company}</Readonly></DetailItem>
            <DetailItem label="采购员"><Readonly>{detail.buyer}</Readonly></DetailItem>
            <DetailItem label="采购员联系电话"><Readonly>{detail.buyerPhone}</Readonly></DetailItem>
            <DetailItem label="合同主体"><Readonly>{detail.contractSubject}</Readonly></DetailItem>
            <DetailItem label="板块"><Readonly>{receiptPO?.plate}</Readonly></DetailItem>
            <DetailItem label="接收人"><Readonly>{activeReceipt.creator}</Readonly></DetailItem>
            <DetailItem label="接收单状态"><StatusTag value={activeReceipt.status} /></DetailItem>
            <DetailItem label="接收时间"><Readonly>{activeReceipt.createdAt?.slice(0, 10)}</Readonly></DetailItem>
            <DetailItem label="申请批次"><Readonly>-</Readonly></DetailItem>
          </DetailGrid>
        </Card>

        <Card
          size="small"
          title="接收物资明细"
          extra={(
            <Space>
              <Button
                danger
                icon={<Trash2 size={14} />}
                onClick={() => {
                  if (selectedReceiptLineKeys.length === 0) {
                    messageApi.warning('请先选择需要删除的接收行');
                    return;
                  }
                  Modal.confirm({
                    title: '确认删除所选接收行？',
                    content: `共选择 ${selectedReceiptLineKeys.length} 条。`,
                    okText: '删除',
                    cancelText: '取消',
                    okButtonProps: { danger: true },
                    onOk: () => {
                      setSelectedReceiptLineKeys([]);
                      messageApi.success('删除接收行操作已记录（原型）');
                    },
                  });
                }}
              >
                删除接收行
              </Button>
              <Button onClick={() => messageApi.info('维护接收明细字段待确认')}>维护接收明细</Button>
              <Button icon={<Upload size={14} />} onClick={() => messageApi.info('导入规则待确认')}>导入</Button>
            </Space>
          )}
        >
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={receiptDetailColumns}
            dataSource={visibleReceiptItems}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedReceiptLineKeys,
              onChange: setSelectedReceiptLineKeys,
              fixed: true,
              columnTitle: '选择',
              columnWidth: 64,
            }}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Card>

        <div className="flex justify-center gap-3">
          {activeReceipt.status === '草稿' && (
            <>
              <Button danger onClick={() => messageApi.info('取消接收规则待确认')}>取消接收</Button>
              <Button type="primary" onClick={() => messageApi.info('接收确认规则待确认')}>接收确认</Button>
            </>
          )}
          <Button onClick={() => setView('receiptList')}>返回</Button>
        </div>
      </Space>
    );
  }

  if (view === 'receiptList') {
    const receiptDateRange = receiptDraftFilters.createdFrom && receiptDraftFilters.createdTo
      ? [dayjs(receiptDraftFilters.createdFrom), dayjs(receiptDraftFilters.createdTo)]
      : null;

    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <PageTitle>资产接收</PageTitle>

        <QueryBar
          onQuery={() => {
            setReceiptAppliedFilters({ ...receiptDraftFilters });
            setSelectedReceiptKeys([]);
          }}
          onReset={() => {
            const filters = activePO ? { ...EMPTY_RECEIPT_FILTERS, poNo: activePO.poNo } : EMPTY_RECEIPT_FILTERS;
            setReceiptDraftFilters(filters);
            setReceiptAppliedFilters(filters);
            setSelectedReceiptKeys([]);
          }}
        >
          <QueryItem label="接收单号">
            <Input value={receiptDraftFilters.receiptNo} allowClear placeholder="请输入接收单号" onChange={(event) => updateReceiptFilter('receiptNo', event.target.value)} />
          </QueryItem>
          <QueryItem label="PO单号">
            <Input value={receiptDraftFilters.poNo} allowClear placeholder="请输入PO单号" onChange={(event) => updateReceiptFilter('poNo', event.target.value)} />
          </QueryItem>
          <QueryItem label="单据状态">
            <Select
              value={receiptDraftFilters.status || undefined}
              allowClear
              placeholder="请选择"
              options={[
                { label: '草稿', value: '草稿' },
                { label: '接收完成', value: '接收完成' },
              ]}
              onChange={(value) => updateReceiptFilter('status', value)}
            />
          </QueryItem>
          <QueryItem label="制单人">
            <Input value={receiptDraftFilters.creator} allowClear placeholder="请输入制单人" onChange={(event) => updateReceiptFilter('creator', event.target.value)} />
          </QueryItem>
          <QueryItem label="制单时间">
            <DatePicker.RangePicker
              value={receiptDateRange}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              allowClear
              onChange={updateReceiptDateRange}
            />
          </QueryItem>
          <QueryItem label="供应商">
            <Input value={receiptDraftFilters.supplier} allowClear placeholder="请输入供应商" onChange={(event) => updateReceiptFilter('supplier', event.target.value)} />
          </QueryItem>
        </QueryBar>

        <Card size="small" title="接收单列表" extra={<Typography.Text type="secondary">共 {filteredReceiptRows.length} 条</Typography.Text>}>
          <div className="mb-3 flex justify-end">
            <Button
              danger
              icon={<Trash2 size={14} />}
              onClick={() => {
                if (selectedReceiptKeys.length === 0) {
                  messageApi.warning('请先选择需要删除的接收单');
                  return;
                }
                const selected = new Set(selectedReceiptKeys);
                setReceiptRows((current) => current.filter((row) => !selected.has(row.id)));
                setSelectedReceiptKeys([]);
                messageApi.success('已删除所选接收单');
              }}
            >
              删除接收单
            </Button>
          </div>
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={receiptColumns}
            dataSource={filteredReceiptRows}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedReceiptKeys,
              onChange: setSelectedReceiptKeys,
              fixed: true,
              columnTitle: '选择',
              columnWidth: 64,
            }}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>

        <div className="flex justify-center gap-3">
          <Button onClick={() => setView('poList')}>返回</Button>
        </div>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <PageTitle>资产接收</PageTitle>

      <QueryBar
        onQuery={() => setPoAppliedFilters({ ...poDraftFilters })}
        onReset={() => {
          setPoDraftFilters(EMPTY_PO_FILTERS);
          setPoAppliedFilters(EMPTY_PO_FILTERS);
        }}
      >
        <QueryItem label="公司">
          <SelectorInput value={poDraftFilters.company} placeholder="请选择公司" onOpen={() => setSelectorType('company')} />
        </QueryItem>
        <QueryItem label="板块">
          <SelectorInput value={poDraftFilters.plate} placeholder="请选择板块" onOpen={() => setSelectorType('plate')} />
        </QueryItem>
        <QueryItem label="PO单号">
          <Input value={poDraftFilters.poNo} allowClear placeholder="请输入PO单号" onChange={(event) => updatePoFilter('poNo', event.target.value)} />
        </QueryItem>
        <QueryItem label="供应商">
          <SelectorInput value={poDraftFilters.supplier} placeholder="请选择供应商" onOpen={() => setSelectorType('supplier')} />
        </QueryItem>
        <QueryItem label="接收状态">
          <Select
            value={poDraftFilters.receiptStatus || undefined}
            allowClear
            placeholder="全部"
            options={[
              { label: '待接收', value: '待接收' },
              { label: '已入库', value: '已入库' },
            ]}
            onChange={(value) => updatePoFilter('receiptStatus', value)}
          />
        </QueryItem>
        <QueryItem label="采购类型">
          <Select
            value={poDraftFilters.purchaseType || undefined}
            allowClear
            placeholder="全部"
            options={[
              { label: '电子设备', value: '电子设备' },
              { label: '服务器', value: '服务器' },
              { label: '服务器备件', value: '服务器备件' },
              { label: '网络设备', value: '网络设备' },
              { label: '网络设备备件', value: '网络设备备件' },
            ]}
            onChange={(value) => updatePoFilter('purchaseType', value)}
          />
        </QueryItem>
      </QueryBar>

      <Card size="small" title="PO单列表" extra={<Typography.Text type="secondary">共 {filteredPoRows.length} 条</Typography.Text>}>
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={poColumns}
          dataSource={filteredPoRows}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      {selectorConfig && (
        <SelectModal
          open
          title={selectorConfig.title}
          dataSource={selectorConfig.dataSource}
          columns={[{ title: '名称', dataIndex: 'name' }]}
          searchFields={[{ label: '名称', name: 'name', dataIndex: 'name' }]}
          onCancel={() => setSelectorType('')}
          onConfirm={selectorConfig.onConfirm}
        />
      )}
    </Space>
  );
}
