import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Typography,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import { ArrowLeft, Eye, Printer, Search, Tags } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const { RangePicker } = DatePicker;

const DEFAULT_FILTERS = {
  companyCn: '',
  companyEn: '',
  department: '',
  plateCn: '',
  assetStatus: '',
  assetTag: '',
  serialNumber: '',
  userId: '',
  userName: '',
  underEmployee: '',
  assetCategory: '',
  labelType: '',
  city: '',
};

const DEFAULT_ROWS = [
  ['tag-print-1', '132121800162', '戴尔.Latitude E7280', '华东渠道_广告销售', '上海市.上海办公室.12层', '新媒体上海', 'New Media SH', '搜狐网-web', '5HF21N2', '11217', '在用-使用中'],
  ['tag-print-2', '132111800605-V', '戴尔.E2417H显示器', '市场_市场部', '上海市.上海办公室.12层', '新媒体上海', 'New Media SH', '搜狐网-web', 'CN-03K25V-QDC00-81M-124I-A03', '11124', '在用-使用中'],
  ['tag-print-3', '115121700002', '联想.THINKPAD X260', '员工服务中心_媒体', '上海市.上海办公室.12层', '新媒体上海', 'New Media SH', '搜狐网-web', 'PC0J3PJC', '11217', '在用-使用中'],
  ['tag-print-4', '1231400378', '浪潮.Inspur SA5212H2', '视频_技术成本', '上海市.上海长宽.1层', '飞狐信息', 'Fox Info', '视频', '213023819', '11411', '已报废-已处置'],
  ['tag-print-5', '1231400378-H1', '其他.10K 300G SAS', '视频_技术成本', '上海市.上海长宽.1层', '飞狐信息', 'Fox Info', '视频', '213023819-H1', '11412', '已报废-已处置'],
  ['tag-print-6', '1231400378-H2', '其他.7.2K 2T NL_SAS', '视频_技术成本', '上海市.上海长宽.1层', '飞狐信息', 'Fox Info', '视频', '213023819-H2', '11412', '已报废-已处置'],
  ['tag-print-7', '1231400381', '浪潮.Inspur SA5212H2', '视频_技术成本', '上海市.上海长宽.1层', '飞狐信息', 'Fox Info', '视频', '213023807', '11411', '已报废-已处置'],
  ['tag-print-8', '1231400381-H1', '其他.10K 300G SAS', '视频_技术成本', '上海市.上海长宽.1层', '飞狐信息', 'Fox Info', '视频', '213023807-H1', '11412', '已报废-已处置'],
  ['tag-print-9', '1231400381-H2', '其他.7.2K 2T NL_SAS', '视频_技术成本', '上海市.上海长宽.1层', '飞狐信息', 'Fox Info', '视频', '213023807-H2', '11412', '已报废-已处置'],
  ['tag-print-10', '1231400389', '浪潮.Inspur SA5212H2', '视频_技术成本', '上海市.上海长宽.1层', '飞狐信息', 'Fox Info', '视频', '213023826', '11411', '已报废-已处置'],
].map(([
  id,
  assetTag,
  assetName,
  department,
  location,
  companyCn,
  companyEn,
  plateCn,
  serialNumber,
  assetCategory,
  assetStatus,
]) => ({
  id,
  assetTag,
  assetName,
  department,
  location,
  companyCn,
  companyEn,
  plateCn,
  serialNumber,
  assetCategory,
  assetStatus,
  userId: '-',
  userName: '-',
  underEmployee: '-',
  labelType: '-',
  city: '上海市',
  printCount: 0,
}));

const PREPRINT_ROWS = [
  ['batch-1', 'TPB-202604100001', '-', 3, '是', '刘建', '2026-04-10'],
  ['batch-2', 'TPB-202603310001', '-', 4, '是', '刘建', '2026-03-31'],
  ['batch-3', 'TPB-202603200001', '-', 1, '是', '刘建', '2026-03-20'],
  ['batch-4', 'TPB-202603060021', '-', 1, '否', '刘建', '2026-03-06'],
  ['batch-5', 'TPB-202603060001', '-', 1, '否', '刘建', '2026-03-06'],
  ['batch-6', 'TPB-202602090001', 'REC-202602090001', 3, '是', '刘建', '2026-02-09'],
  ['batch-7', 'TPB-202602060001', 'REC-202602060021', 1, '是', '刘建', '2026-02-06'],
  ['batch-8', 'TPB-202601290001', 'REC-202601290001', 2, '是', '刘建', '2026-01-29'],
  ['batch-9', 'TPB-202601270001', '-', 1, '是', '刘建', '2026-01-27'],
  ['batch-10', 'TPB-202601260001', 'REC-202601260001', 2, '是', '刘建', '2026-01-26'],
].map(([id, batch, orderNo, labelCount, printed, creator, createdAt]) => ({
  id,
  batch,
  orderNo,
  labelCount,
  printed,
  creator,
  createdAt,
}));

const PRINT_HISTORY_ROWS = [
  ['history-1', 'TPB-202604100001', '114132601682', '2026-04-10', '10.2.156.220', '刘建'],
  ['history-2', 'TPB-202604100001', '114132601681', '2026-04-10', '10.2.156.220', '刘建'],
  ['history-3', 'TPB-202604100001', '114132601680', '2026-04-10', '10.2.156.220', '刘建'],
  ['history-4', 'TPB-202603310001', '114132601679', '2026-03-31', '10.2.156.45', '刘建'],
  ['history-5', 'TPB-202603310001', '114132601678', '2026-03-31', '10.2.156.45', '刘建'],
  ['history-6', 'TPB-202603310001', '114132601677', '2026-03-31', '10.2.156.45', '刘建'],
  ['history-7', 'TPB-202603310001', '114132601676', '2026-03-31', '10.2.156.45', '刘建'],
  ['history-8', 'TPB-202603200001', '123132600871', '2026-03-20', '10.2.156.45', '刘建'],
  ['history-9', 'TPB-202602060021', '114152601942', '2026-03-10', '10.2.156.45', '刘建'],
  ['history-10', 'TPB-202602060021', '114152601941', '2026-03-10', '10.2.156.45', '刘建'],
].map(([id, batch, tag, printedAt, printIp, printer]) => ({
  id,
  batch,
  tag,
  printedAt,
  printIp,
  printer,
}));

const INITIAL_LABEL_DETAIL_ROWS = [
  { id: 'label-202501130001-1', batch: 'TPB-202501130001', tag: '114122502032', printCount: 1, printed: '是' },
  ...PRINT_HISTORY_ROWS.map((row) => ({
    id: `label-${row.id}`,
    batch: row.batch,
    tag: row.tag,
    printCount: 1,
    printed: '是',
  })),
];

const DEFAULT_PREPRINT_FILTERS = {
  batch: '',
  printed: '',
  creator: '',
  orderNo: '',
  assetTag: '',
  createdFrom: '',
  createdTo: '',
};

const DEFAULT_HISTORY_FILTERS = {
  batch: '',
  tag: '',
  printer: '',
  printedFrom: '',
  printedTo: '',
};

const DEFAULT_LABEL_FILTERS = {
  tag: '',
  printed: '',
};

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function includesText(value, query) {
  if (!query) return true;
  return normalizeText(value).includes(normalizeText(query));
}

function displayText(value) {
  return value === undefined || value === null || value === '' ? '-' : value;
}

function uniqueValues(rows, field) {
  return [...new Set(rows.map((row) => row[field]).filter((value) => value && value !== '-'))];
}

function inDateRange(value, from, to) {
  if (!value) return false;
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <Input
      value={value || ''}
      readOnly
      placeholder={placeholder}
      suffix={<Search size={14} className="text-[#1677ff]" />}
      style={{ cursor: 'pointer' }}
      onClick={onOpen}
    />
  );
}

function DateFilter({ value, onChange }) {
  return (
    <DatePicker
      value={value ? dayjs(value) : null}
      format="YYYY-MM-DD"
      placeholder="请选择日期"
      onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
    />
  );
}

const RULE_GRID_CLASS = 'grid min-w-[1020px] grid-cols-[repeat(4,240px)] gap-x-5 gap-y-4';
const RULE_CONTROL_CLASS = 'mt-2 w-[220px]';

function RuleField({ label, children }) {
  return (
    <div className="w-[240px]">
      <Typography.Text className="text-[13px] text-gray-600">{label}</Typography.Text>
      <div>{children}</div>
    </div>
  );
}

function RuleRow({ active, title, onSelect, children }) {
  return (
    <div className={`rounded-md border p-4 transition-colors ${active ? 'border-[#91caff] bg-[#f5faff]' : 'border-[#f0f0f0] bg-[#fafafa]'}`}>
      <div className="grid grid-cols-[180px_1fr] items-start gap-5">
        <div className="pt-1">
          <Radio checked={active} onChange={onSelect}>
            <Typography.Text strong>{title}</Typography.Text>
          </Radio>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className={`${RULE_GRID_CLASS} ${active ? '' : 'opacity-55'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateLabelsPage({ onBack, messageApi }) {
  const [ledger, setLedger] = useState('101-新时代');
  const [rule, setRule] = useState('normal');
  const [assetType, setAssetType] = useState(undefined);
  const [normalYear, setNormalYear] = useState(null);
  const [consumableCategory, setConsumableCategory] = useState(undefined);
  const [consumableSubCategory, setConsumableSubCategory] = useState(undefined);
  const [consumableYear, setConsumableYear] = useState(null);
  const [furnitureType, setFurnitureType] = useState(undefined);
  const [sparePartType, setSparePartType] = useState(undefined);
  const [printCount, setPrintCount] = useState(1);
  const [sparePartCount, setSparePartCount] = useState(1);
  const [remark, setRemark] = useState('');

  const handleGenerate = () => {
    messageApi.success('生成标签操作已触发');
  };

  return (
    <Space direction="vertical" size={16} className="w-full pb-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-1 rounded bg-[#1677ff]" />
        <Typography.Title level={4} className="!mb-0">生成标签</Typography.Title>
      </div>

      <Card size="small" title="标签设置" className="shadow-sm">
        <div className="mb-5 flex items-center gap-5 border-b border-[#f0f0f0] pb-5">
          <Typography.Text strong className="w-[160px] shrink-0">选择账套</Typography.Text>
          <Select
            className="w-[260px]"
            value={ledger}
            options={[{ label: '101-新时代', value: '101-新时代' }]}
            onChange={setLedger}
          />
        </div>

        <div className="mb-3 text-[13px] font-medium text-gray-500">选择标签规则</div>
        <Space direction="vertical" size={10} className="w-full">
          <RuleRow active={rule === 'normal'} title="常规标签规则" onSelect={() => setRule('normal')}>
            <RuleField label="选择资产类型">
              <Select className={RULE_CONTROL_CLASS} placeholder="请选择" value={assetType} options={[]} onChange={setAssetType} disabled={rule !== 'normal'} />
            </RuleField>
            <RuleField label="选择年份">
              <DatePicker className={RULE_CONTROL_CLASS} picker="year" value={normalYear} onChange={setNormalYear} disabled={rule !== 'normal'} />
            </RuleField>
            <RuleField label="当前最大序号">
              <Input className={RULE_CONTROL_CLASS} value="-" readOnly disabled />
            </RuleField>
          </RuleRow>

          <RuleRow active={rule === 'consumable'} title="高耗标签规则" onSelect={() => setRule('consumable')}>
            <RuleField label="选择高耗大类">
              <Select className={RULE_CONTROL_CLASS} placeholder="请选择" value={consumableCategory} options={[]} onChange={setConsumableCategory} disabled={rule !== 'consumable'} />
            </RuleField>
            <RuleField label="选择高耗小类">
              <Select className={RULE_CONTROL_CLASS} placeholder="请选择" value={consumableSubCategory} options={[]} onChange={setConsumableSubCategory} disabled={rule !== 'consumable'} />
            </RuleField>
            <RuleField label="选择年份">
              <DatePicker className={RULE_CONTROL_CLASS} picker="year" value={consumableYear} onChange={setConsumableYear} disabled={rule !== 'consumable'} />
            </RuleField>
            <RuleField label="当前最大序号">
              <Input className={RULE_CONTROL_CLASS} value="-" readOnly disabled />
            </RuleField>
          </RuleRow>

          <RuleRow active={rule === 'furniture'} title="特殊规则-家具" onSelect={() => setRule('furniture')}>
            <RuleField label="选择家具类型">
              <Select className={RULE_CONTROL_CLASS} placeholder="请选择" value={furnitureType} options={[]} onChange={setFurnitureType} disabled={rule !== 'furniture'} />
            </RuleField>
            <RuleField label="当前最大序号">
              <Input className={RULE_CONTROL_CLASS} value="-" readOnly disabled />
            </RuleField>
          </RuleRow>

          <RuleRow active={rule === 'mobile'} title="特殊规则-手机" onSelect={() => setRule('mobile')}>
            <RuleField label="标签前缀">
              <Input className={RULE_CONTROL_CLASS} value="NE" readOnly />
            </RuleField>
            <RuleField label="当前最大序号">
              <Input className={RULE_CONTROL_CLASS} value="3792" readOnly />
            </RuleField>
          </RuleRow>

          <RuleRow active={rule === 'sparePart'} title="特殊规则-备件" onSelect={() => setRule('sparePart')}>
            <RuleField label="选择备件类型">
              <Select className={RULE_CONTROL_CLASS} placeholder="请选择" value={sparePartType} options={[]} onChange={setSparePartType} disabled={rule !== 'sparePart'} />
            </RuleField>
            <RuleField label="当前最大序号">
              <Input className={RULE_CONTROL_CLASS} value="-" readOnly disabled />
            </RuleField>
          </RuleRow>
        </Space>
      </Card>

      <Card size="small" title="标签生成" className="shadow-sm">
        <Descriptions bordered size="small" column={3} labelStyle={{ width: 128 }}>
          <Descriptions.Item label="打印标签数量">
            <InputNumber min={1} value={printCount} onChange={(value) => setPrintCount(value || 1)} style={{ width: 180 }} />
          </Descriptions.Item>
          <Descriptions.Item label="备件数量">
            <InputNumber min={1} value={sparePartCount} onChange={(value) => setSparePartCount(value || 1)} style={{ width: 180 }} />
          </Descriptions.Item>
          <Descriptions.Item label="标签批次">
            <Typography.Text type="danger">生成标签后自动生成</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="操作员">系统管理员</Descriptions.Item>
          <Descriptions.Item label="当前日期">{dayjs().format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="" />
          <Descriptions.Item label="备注说明" span={3}>
            <Input.TextArea
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              autoSize={{ minRows: 3, maxRows: 6 }}
              placeholder="请输入备注说明"
              style={{ maxWidth: 760 }}
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div className="sticky bottom-0 z-30 flex justify-center gap-3 border-t border-[#e5e7eb] bg-white/95 px-5 py-3 shadow-[0_-6px_20px_rgba(15,23,42,0.06)] backdrop-blur">
        <Button className="min-w-[96px]" icon={<ArrowLeft size={14} />} onClick={onBack}>返回</Button>
        <Button type="primary" className="min-w-[116px]" icon={<Tags size={14} />} onClick={handleGenerate}>生成标签</Button>
      </div>
    </Space>
  );
}

export default function TagPrintingPage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [lookupKey, setLookupKey] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [generateMode, setGenerateMode] = useState(false);
  const [preprintDraftFilters, setPreprintDraftFilters] = useState(DEFAULT_PREPRINT_FILTERS);
  const [preprintAppliedFilters, setPreprintAppliedFilters] = useState(DEFAULT_PREPRINT_FILTERS);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDraftFilters, setHistoryDraftFilters] = useState(DEFAULT_HISTORY_FILTERS);
  const [historyAppliedFilters, setHistoryAppliedFilters] = useState(DEFAULT_HISTORY_FILTERS);
  const [labelRows, setLabelRows] = useState(INITIAL_LABEL_DETAIL_ROWS);
  const [labelListOpen, setLabelListOpen] = useState(false);
  const [labelBatch, setLabelBatch] = useState('');
  const [labelDraftFilters, setLabelDraftFilters] = useState(DEFAULT_LABEL_FILTERS);
  const [labelAppliedFilters, setLabelAppliedFilters] = useState(DEFAULT_LABEL_FILTERS);
  const [labelSelectedKeys, setLabelSelectedKeys] = useState([]);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.companyCn, appliedFilters.companyCn)
    && includesText(row.companyEn, appliedFilters.companyEn)
    && includesText(row.department, appliedFilters.department)
    && includesText(row.plateCn, appliedFilters.plateCn)
    && includesText(row.assetStatus, appliedFilters.assetStatus)
    && includesText(row.assetTag, appliedFilters.assetTag)
    && includesText(row.serialNumber, appliedFilters.serialNumber)
    && includesText(row.userId, appliedFilters.userId)
    && includesText(row.userName, appliedFilters.userName)
    && includesText(row.underEmployee, appliedFilters.underEmployee)
    && includesText(row.assetCategory, appliedFilters.assetCategory)
    && includesText(row.labelType, appliedFilters.labelType)
    && includesText(row.city, appliedFilters.city)
  )), [rows, appliedFilters]);

  const filteredPreprintRows = useMemo(() => {
    const matchedBatches = preprintAppliedFilters.assetTag
      ? new Set(labelRows.filter((row) => includesText(row.tag, preprintAppliedFilters.assetTag)).map((row) => row.batch))
      : null;

    return PREPRINT_ROWS.filter((row) => (
      includesText(row.batch, preprintAppliedFilters.batch)
      && includesText(row.printed, preprintAppliedFilters.printed)
      && includesText(row.creator, preprintAppliedFilters.creator)
      && includesText(row.orderNo, preprintAppliedFilters.orderNo)
      && (!matchedBatches || matchedBatches.has(row.batch))
      && inDateRange(row.createdAt, preprintAppliedFilters.createdFrom, preprintAppliedFilters.createdTo)
    ));
  }, [labelRows, preprintAppliedFilters]);

  const filteredHistoryRows = useMemo(() => PRINT_HISTORY_ROWS.filter((row) => (
    includesText(row.batch, historyAppliedFilters.batch)
    && includesText(row.tag, historyAppliedFilters.tag)
    && includesText(row.printer, historyAppliedFilters.printer)
    && inDateRange(row.printedAt, historyAppliedFilters.printedFrom, historyAppliedFilters.printedTo)
  )), [historyAppliedFilters]);

  const filteredLabelRows = useMemo(() => labelRows.filter((row) => (
    row.batch === labelBatch
    && includesText(row.tag, labelAppliedFilters.tag)
    && includesText(row.printed, labelAppliedFilters.printed)
  )), [labelAppliedFilters, labelBatch, labelRows]);

  const statusOptions = useMemo(() => uniqueValues(rows, 'assetStatus').map((value) => ({ label: value, value })), [rows]);
  const cityOptions = useMemo(() => uniqueValues(rows, 'city').map((value) => ({ label: value, value })), [rows]);

  const activeLookup = lookupKey === 'department' || lookupKey === 'assetCategory' ? lookupKey : '';
  const lookupLabel = activeLookup === 'department' ? '部门' : '资产类别';
  const lookupData = useMemo(() => {
    if (!activeLookup) return [];
    return uniqueValues(rows, activeLookup).map((value, index) => ({ id: `${activeLookup}-${index}`, value }));
  }, [activeLookup, rows]);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const updatePreprintFilter = (field, value) => {
    setPreprintDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const updateHistoryFilter = (field, value) => {
    setHistoryDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const updateLabelFilter = (field, value) => {
    setLabelDraftFilters((current) => ({ ...current, [field]: value || '' }));
  };

  const handlePrint = (targetIds, actionName) => {
    if (targetIds.length === 0) {
      messageApi.warning(actionName === '打印所选' ? '请至少选择一条资产' : '当前没有可打印的数据');
      return;
    }
    const idSet = new Set(targetIds);
    setRows((current) => current.map((row) => (
      idSet.has(row.id) ? { ...row, printCount: Number(row.printCount || 0) + 1 } : row
    )));
    setSelectedRowKeys([]);
    messageApi.success(`${actionName}已提交，共 ${targetIds.length} 条`);
  };

  const handleLabelPrint = (targetIds, actionName) => {
    if (targetIds.length === 0) {
      messageApi.warning(actionName === '打印所选' ? '请至少选择一条标签' : '当前没有可打印的标签');
      return;
    }
    const idSet = new Set(targetIds);
    setLabelRows((current) => current.map((row) => (
      idSet.has(row.id)
        ? { ...row, printCount: Number(row.printCount || 0) + 1, printed: '是' }
        : row
    )));
    setLabelSelectedKeys([]);
    messageApi.success(`${actionName}已提交，共 ${targetIds.length} 条`);
  };

  const openHistory = (batch, tag = '') => {
    const filters = { ...DEFAULT_HISTORY_FILTERS, batch, tag };
    setHistoryDraftFilters(filters);
    setHistoryAppliedFilters(filters);
    setHistoryOpen(true);
  };

  const openLabelList = (batch) => {
    setLabelBatch(batch);
    setLabelDraftFilters(DEFAULT_LABEL_FILTERS);
    setLabelAppliedFilters(DEFAULT_LABEL_FILTERS);
    setLabelSelectedKeys([]);
    setLabelListOpen(true);
  };

  const columns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 150, fixed: 'left', render: displayText },
    { title: '资产名称', dataIndex: 'assetName', width: 220, render: displayText },
    { title: '部门', dataIndex: 'department', width: 190, render: displayText },
    { title: '地点', dataIndex: 'location', width: 210, render: displayText },
    { title: '公司中文名', dataIndex: 'companyCn', width: 140, render: displayText },
    { title: '公司英文名', dataIndex: 'companyEn', width: 150, render: displayText },
    { title: '版块中文名', dataIndex: 'plateCn', width: 140, render: displayText },
    { title: '序列号', dataIndex: 'serialNumber', width: 220, render: displayText },
    { title: '资产类别', dataIndex: 'assetCategory', width: 110, render: displayText },
    {
      title: '资产状态',
      dataIndex: 'assetStatus',
      width: 140,
      render: (value) => value && value !== '-' ? <StatusTag value={value} type="business" /> : '-',
    },
    { title: '使用人', dataIndex: 'userName', width: 140, render: displayText },
    { title: '打印次数', dataIndex: 'printCount', width: 100, align: 'right' },
  ];

  const preprintColumns = [
    { title: '标签批次', dataIndex: 'batch', width: 190, render: displayText },
    { title: '订单编号', dataIndex: 'orderNo', width: 190, render: displayText },
    { title: '生成标签数量', dataIndex: 'labelCount', width: 130, align: 'right' },
    { title: '是否已打印', dataIndex: 'printed', width: 120, align: 'center', render: (value) => <StatusTag value={value} type="yesNo" /> },
    { title: '创建人', dataIndex: 'creator', width: 120, render: displayText },
    { title: '创建时间', dataIndex: 'createdAt', width: 130, render: displayText },
    {
      title: '详细',
      dataIndex: 'detail',
      width: 110,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openLabelList(record.batch)}>标签清单</Button>
      ),
    },
    {
      title: '打印历史',
      dataIndex: 'history',
      width: 110,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openHistory(record.batch)}>打印历史</Button>
      ),
    },
  ];

  const labelColumns = [
    { title: '标签批次', dataIndex: 'batch', width: 210, render: displayText },
    { title: '标签号', dataIndex: 'tag', width: 200, render: displayText },
    { title: '打印次数', dataIndex: 'printCount', width: 120, align: 'right' },
    { title: '是否已打印', dataIndex: 'printed', width: 130, align: 'center', render: (value) => <StatusTag value={value} type="yesNo" /> },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openHistory(record.batch, record.tag)}>打印历史</Button>
      ),
    },
  ];

  const historyColumns = [
    { title: '标签批次', dataIndex: 'batch', width: 190, render: displayText },
    { title: '标签号', dataIndex: 'tag', width: 180, render: displayText },
    { title: '打印时间', dataIndex: 'printedAt', width: 140, render: displayText },
    { title: '打印IP', dataIndex: 'printIp', width: 150, render: displayText },
    { title: '打印人', dataIndex: 'printer', width: 120, render: displayText },
  ];

  if (previewMode && generateMode) {
    return (
      <>
        {contextHolder}
        <GenerateLabelsPage onBack={() => setGenerateMode(false)} messageApi={messageApi} />
      </>
    );
  }

  if (previewMode) {
    return (
      <Space direction="vertical" size={16} className="w-full">
        {contextHolder}
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft size={14} />} onClick={() => setPreviewMode(false)}>返回标签打印</Button>
          <Typography.Title level={4} className="mb-0">预打印</Typography.Title>
        </div>

        <QueryBar
          onQuery={() => setPreprintAppliedFilters({ ...preprintDraftFilters })}
          onReset={() => {
            setPreprintDraftFilters(DEFAULT_PREPRINT_FILTERS);
            setPreprintAppliedFilters(DEFAULT_PREPRINT_FILTERS);
          }}
        >
          <QueryItem label="标签批次">
            <Input value={preprintDraftFilters.batch} allowClear placeholder="请输入标签批次" onChange={(event) => updatePreprintFilter('batch', event.target.value)} />
          </QueryItem>
          <QueryItem label="是否已打印">
            <Select
              value={preprintDraftFilters.printed || undefined}
              allowClear
              placeholder="全部"
              options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]}
              onChange={(value) => updatePreprintFilter('printed', value)}
            />
          </QueryItem>
          <QueryItem label="创建人">
            <Select
              value={preprintDraftFilters.creator || undefined}
              allowClear
              placeholder="请选择"
              options={uniqueValues(PREPRINT_ROWS, 'creator').map((value) => ({ label: value, value }))}
              onChange={(value) => updatePreprintFilter('creator', value)}
            />
          </QueryItem>
          <QueryItem label="订单编号">
            <Input value={preprintDraftFilters.orderNo} allowClear placeholder="请输入订单编号" onChange={(event) => updatePreprintFilter('orderNo', event.target.value)} />
          </QueryItem>
          <QueryItem label="资产标签号">
            <Input value={preprintDraftFilters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => updatePreprintFilter('assetTag', event.target.value)} />
          </QueryItem>
          <QueryItem label="创建时间">
            <RangePicker
              className="w-full"
              value={preprintDraftFilters.createdFrom && preprintDraftFilters.createdTo
                ? [dayjs(preprintDraftFilters.createdFrom), dayjs(preprintDraftFilters.createdTo)]
                : null}
              format="YYYY-MM-DD"
              onChange={(dates) => {
                setPreprintDraftFilters((current) => ({
                  ...current,
                  createdFrom: dates?.[0] ? dates[0].format('YYYY-MM-DD') : '',
                  createdTo: dates?.[1] ? dates[1].format('YYYY-MM-DD') : '',
                }));
              }}
            />
          </QueryItem>
        </QueryBar>

        <Card
          size="small"
          title="预打印列表"
          extra={<Typography.Text type="secondary">共 {filteredPreprintRows.length} 条</Typography.Text>}
        >
          <div className="mb-3 flex justify-end">
            <Button type="primary" icon={<Tags size={14} />} onClick={() => setGenerateMode(true)}>生成标签</Button>
          </div>
          <Table
            rowKey="id"
            size="small"
            bordered
            columns={preprintColumns}
            dataSource={filteredPreprintRows}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>

        <Modal
          title="查看标签"
          open={labelListOpen}
          width={1050}
          onCancel={() => setLabelListOpen(false)}
          footer={(
            <div className="flex justify-center">
              <Button className="min-w-[96px]" icon={<ArrowLeft size={14} />} onClick={() => setLabelListOpen(false)}>返回</Button>
            </div>
          )}
        >
          <Space direction="vertical" size={14} className="w-full">
            <QueryBar
              onQuery={() => {
                setLabelAppliedFilters({ ...labelDraftFilters });
                setLabelSelectedKeys([]);
              }}
              onReset={() => {
                setLabelDraftFilters(DEFAULT_LABEL_FILTERS);
                setLabelAppliedFilters(DEFAULT_LABEL_FILTERS);
                setLabelSelectedKeys([]);
              }}
            >
              <QueryItem label="标签号">
                <Input value={labelDraftFilters.tag} allowClear placeholder="请输入标签号" onChange={(event) => updateLabelFilter('tag', event.target.value)} />
              </QueryItem>
              <QueryItem label="是否打印">
                <Select
                  value={labelDraftFilters.printed || undefined}
                  allowClear
                  placeholder="全部"
                  options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]}
                  onChange={(value) => updateLabelFilter('printed', value)}
                />
              </QueryItem>
            </QueryBar>

            <div className="flex items-center justify-between gap-3">
              <Typography.Text type="secondary">标签批次：{labelBatch || '-'}</Typography.Text>
              <Space wrap>
                <Button icon={<Printer size={14} />} onClick={() => handleLabelPrint(labelSelectedKeys, '打印所选')}>打印所选</Button>
                <Button icon={<Printer size={14} />} onClick={() => handleLabelPrint(filteredLabelRows.map((row) => row.id), '打印全部')}>打印全部</Button>
              </Space>
            </div>

            <Table
              rowKey="id"
              size="small"
              bordered
              columns={labelColumns}
              dataSource={filteredLabelRows}
              rowSelection={{
                selectedRowKeys: labelSelectedKeys,
                onChange: setLabelSelectedKeys,
                fixed: true,
                columnTitle: '选择',
              }}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              locale={{ emptyText: '暂无标签数据' }}
            />
          </Space>
        </Modal>

        <Modal
          title="打印历史"
          open={historyOpen}
          width={1100}
          footer={null}
          onCancel={() => setHistoryOpen(false)}
        >
          <QueryBar
            onQuery={() => setHistoryAppliedFilters({ ...historyDraftFilters })}
            onReset={() => {
              setHistoryDraftFilters(DEFAULT_HISTORY_FILTERS);
              setHistoryAppliedFilters(DEFAULT_HISTORY_FILTERS);
            }}
          >
            <QueryItem label="标签批次">
              <Input value={historyDraftFilters.batch} allowClear placeholder="请输入标签批次" onChange={(event) => updateHistoryFilter('batch', event.target.value)} />
            </QueryItem>
            <QueryItem label="标签号">
              <Input value={historyDraftFilters.tag} allowClear placeholder="请输入标签号" onChange={(event) => updateHistoryFilter('tag', event.target.value)} />
            </QueryItem>
            <QueryItem label="打印人">
              <Input value={historyDraftFilters.printer} allowClear placeholder="请输入打印人" onChange={(event) => updateHistoryFilter('printer', event.target.value)} />
            </QueryItem>
            <QueryItem label="打印时间从">
              <DateFilter value={historyDraftFilters.printedFrom} onChange={(value) => updateHistoryFilter('printedFrom', value)} />
            </QueryItem>
            <QueryItem label="打印时间至">
              <DateFilter value={historyDraftFilters.printedTo} onChange={(value) => updateHistoryFilter('printedTo', value)} />
            </QueryItem>
          </QueryBar>
          <div className="mt-4 flex justify-end text-sm text-gray-500">共 {filteredHistoryRows.length} 条</div>
          <Table
            className="mt-2"
            rowKey="id"
            size="small"
            bordered
            columns={historyColumns}
            dataSource={filteredHistoryRows}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Modal>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}

      <Typography.Title level={4} className="mb-0">标签打印</Typography.Title>

      <QueryBar
        onQuery={() => {
          setAppliedFilters({ ...draftFilters });
          setSelectedRowKeys([]);
        }}
        onReset={() => {
          setDraftFilters(DEFAULT_FILTERS);
          setAppliedFilters(DEFAULT_FILTERS);
          setSelectedRowKeys([]);
        }}
      >
        <QueryItem label="公司中文名称">
          <Input value={draftFilters.companyCn} allowClear placeholder="请输入公司中文名称" onChange={(event) => updateFilter('companyCn', event.target.value)} />
        </QueryItem>
        <QueryItem label="公司英文名称">
          <Input value={draftFilters.companyEn} allowClear placeholder="请输入公司英文名称" onChange={(event) => updateFilter('companyEn', event.target.value)} />
        </QueryItem>
        <QueryItem label="部门">
          <LookupInput value={draftFilters.department} placeholder="请选择部门" onOpen={() => setLookupKey('department')} />
        </QueryItem>
        <QueryItem label="版块中文名称">
          <Input value={draftFilters.plateCn} allowClear placeholder="请输入版块中文名称" onChange={(event) => updateFilter('plateCn', event.target.value)} />
        </QueryItem>
        <QueryItem label="资产状态">
          <Select value={draftFilters.assetStatus || undefined} allowClear placeholder="全部" options={statusOptions} onChange={(value) => updateFilter('assetStatus', value)} />
        </QueryItem>
        <QueryItem label="资产标签号">
          <Input value={draftFilters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => updateFilter('assetTag', event.target.value)} />
        </QueryItem>
        <QueryItem label="序列号">
          <Input value={draftFilters.serialNumber} allowClear placeholder="请输入序列号" onChange={(event) => updateFilter('serialNumber', event.target.value)} />
        </QueryItem>
        <QueryItem label="使用人编号">
          <Input value={draftFilters.userId} allowClear placeholder="请输入使用人编号" onChange={(event) => updateFilter('userId', event.target.value)} />
        </QueryItem>
        <QueryItem label="使用人姓名">
          <Input value={draftFilters.userName} allowClear placeholder="请输入使用人姓名" onChange={(event) => updateFilter('userName', event.target.value)} />
        </QueryItem>
        <QueryItem label="是否在员工名下">
          <Select
            value={draftFilters.underEmployee || undefined}
            allowClear
            placeholder="全部"
            options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]}
            onChange={(value) => updateFilter('underEmployee', value)}
          />
        </QueryItem>
        <QueryItem label="资产类别">
          <LookupInput value={draftFilters.assetCategory} placeholder="请选择资产类别" onOpen={() => setLookupKey('assetCategory')} />
        </QueryItem>
        <QueryItem label="标签类型">
          <Select value={draftFilters.labelType || undefined} allowClear placeholder="全部" options={[]} onChange={(value) => updateFilter('labelType', value)} />
        </QueryItem>
        <QueryItem label="城市">
          <Select value={draftFilters.city || undefined} allowClear placeholder="全部" options={cityOptions} onChange={(value) => updateFilter('city', value)} />
        </QueryItem>
      </QueryBar>

      <Card
        size="small"
        title="标签打印列表"
        extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space>
            <Button icon={<Printer size={14} />} onClick={() => handlePrint(selectedRowKeys, '打印所选')}>打印所选</Button>
            <Button icon={<Printer size={14} />} onClick={() => handlePrint(filteredRows.map((row) => row.id), '打印全部')}>打印全部</Button>
            <Button type="primary" icon={<Eye size={14} />} onClick={() => setPreviewMode(true)}>预打印</Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{
            type: 'checkbox',
            columnTitle: '选择',
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            fixed: true,
          }}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <SelectModal
        open={Boolean(activeLookup)}
        title={`选择${lookupLabel}`}
        rowKey="id"
        dataSource={lookupData}
        searchFields={activeLookup ? [{ name: 'value', label: lookupLabel, dataIndex: 'value' }] : []}
        columns={activeLookup ? [{ title: lookupLabel, dataIndex: 'value' }] : []}
        onCancel={() => setLookupKey('')}
        onConfirm={(record) => {
          updateFilter(activeLookup, record.value);
          setLookupKey('');
        }}
      />
    </Space>
  );
}
