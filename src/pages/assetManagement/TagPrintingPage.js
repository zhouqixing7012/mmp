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
import { ArrowLeft, Download, Eye, Printer, Search, Tags } from 'lucide-react';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';

const { RangePicker } = DatePicker;

const CURRENT_USER = '系统管理员';
const CURRENT_IP = '10.2.156.220';

const DEFAULT_FILTERS = {
  companyCn: '',
  companyEn: '',
  department: '',
  plateCn: '',
  assetStatus: '',
  assetTag: '',
  serialNumber: '',
  userId: '',
  userDisplay: '',
  assetCategory: '',
  city: '',
};

const DEFAULT_ROWS = [
  {
    id: 'tag-print-1', assetTag: '132121800162', assetName: '戴尔.Latitude E7280', department: '华东渠道_广告销售',
    location: '上海市.上海办公室.12层', companyCn: '新媒体上海', companyEn: 'New Media SH', plateCn: '搜狐网-web',
    serialNumber: '5HF21N2', assetCategory: '11217', assetStatus: '在用-使用中', userId: '10086', userName: '张晓', city: '上海市', printCount: 2,
  },
  {
    id: 'tag-print-2', assetTag: '132111800605-V', assetName: '戴尔.E2417H显示器', department: '市场_市场部',
    location: '上海市.上海办公室.12层', companyCn: '新媒体上海', companyEn: 'New Media SH', plateCn: '搜狐网-web',
    serialNumber: 'CN-03K25V-QDC00-81M-124I-A03', assetCategory: '11124', assetStatus: '在用-使用中', userId: '10112', userName: '李明', city: '上海市', printCount: 1,
  },
  {
    id: 'tag-print-3', assetTag: '115121700002', assetName: '联想.THINKPAD X260', department: '员工服务中心_媒体',
    location: '上海市.上海办公室.12层', companyCn: '新媒体上海', companyEn: 'New Media SH', plateCn: '搜狐网-web',
    serialNumber: 'PC0J3PJC', assetCategory: '11217', assetStatus: '在用-使用中', userId: '10208', userName: '王芳', city: '上海市', printCount: 0,
  },
  {
    id: 'tag-print-4', assetTag: '1231400378', assetName: '浪潮.Inspur SA5212H2', department: '视频_技术成本',
    location: '北京.长宽机房.1层', companyCn: '飞狐信息', companyEn: 'Fox Info', plateCn: '视频', serialNumber: '213023819',
    assetCategory: '11411', assetStatus: '已报废-已处置', userId: '10331', userName: '赵强', city: '北京市', printCount: 3,
  },
  {
    id: 'tag-print-5', assetTag: '1231400378-H1', assetName: '其他.10K 300G SAS', department: '视频_技术成本',
    location: '北京.长宽机房.1层', companyCn: '飞狐信息', companyEn: 'Fox Info', plateCn: '视频', serialNumber: '213023819-H1',
    assetCategory: '11412', assetStatus: '已报废-已处置', userId: '10331', userName: '赵强', city: '北京市', printCount: 0,
  },
  {
    id: 'tag-print-6', assetTag: '1231400378-H2', assetName: '其他.7.2K 2T NL_SAS', department: '视频_技术成本',
    location: '北京.长宽机房.1层', companyCn: '飞狐信息', companyEn: 'Fox Info', plateCn: '视频', serialNumber: '213023819-H2',
    assetCategory: '11412', assetStatus: '已报废-已处置', userId: '10331', userName: '赵强', city: '北京市', printCount: 0,
  },
  {
    id: 'tag-print-7', assetTag: '1231400381', assetName: '浪潮.Inspur SA5212H2', department: '视频_技术成本',
    location: '北京.长宽机房.1层', companyCn: '飞狐信息', companyEn: 'Fox Info', plateCn: '视频', serialNumber: '213023807',
    assetCategory: '11411', assetStatus: '在用-使用中', userId: '10405', userName: '刘建', city: '北京市', printCount: 1,
  },
  {
    id: 'tag-print-8', assetTag: '1231400381-H1', assetName: '其他.10K 300G SAS', department: '视频_技术成本',
    location: '北京.长宽机房.1层', companyCn: '飞狐信息', companyEn: 'Fox Info', plateCn: '视频', serialNumber: '213023807-H1',
    assetCategory: '11412', assetStatus: '在用-使用中', userId: '10405', userName: '刘建', city: '北京市', printCount: 0,
  },
  {
    id: 'tag-print-9', assetTag: '1231400381-H2', assetName: '其他.7.2K 2T NL_SAS', department: '视频_技术成本',
    location: '北京.长宽机房.1层', companyCn: '飞狐信息', companyEn: 'Fox Info', plateCn: '视频', serialNumber: '213023807-H2',
    assetCategory: '11412', assetStatus: '在用-使用中', userId: '10405', userName: '刘建', city: '北京市', printCount: 0,
  },
  {
    id: 'tag-print-10', assetTag: '1231400389', assetName: '浪潮.Inspur SA5212H2', department: '视频_技术成本',
    location: '北京.长宽机房.1层', companyCn: '飞狐信息', companyEn: 'Fox Info', plateCn: '视频', serialNumber: '213023826',
    assetCategory: '11411', assetStatus: '在库（旧）', userId: '10518', userName: '周林', city: '北京市', printCount: 0,
  },
];

const INITIAL_PREPRINT_ROWS = [
  ['batch-1', 'TPB-202604100001', '-', 3, '是', '刘建', '2026-04-10', '预打印批次'],
  ['batch-2', 'TPB-202603310001', '-', 4, '是', '刘建', '2026-03-31', '预打印批次'],
  ['batch-3', 'TPB-202603200001', '-', 1, '是', '刘建', '2026-03-20', '预打印批次'],
  ['batch-4', 'TPB-202603060021', '-', 1, '否', '刘建', '2026-03-06', '待打印'],
  ['batch-5', 'TPB-202603060001', '-', 1, '否', '刘建', '2026-03-06', '待打印'],
  ['batch-6', 'TPB-202602090001', 'REC-202602090001', 3, '是', '刘建', '2026-02-09', '接收入库打印'],
  ['batch-7', 'TPB-202602060001', 'REC-202602060021', 1, '是', '刘建', '2026-02-06', '接收入库打印'],
  ['batch-8', 'TPB-202601290001', 'REC-202601290001', 2, '是', '刘建', '2026-01-29', '接收入库打印'],
  ['batch-9', 'TPB-202601270001', '-', 1, '是', '刘建', '2026-01-27', '预打印批次'],
  ['batch-10', 'TPB-202601260001', 'REC-202601260001', 2, '是', '刘建', '2026-01-26', '接收入库打印'],
].map(([id, batch, orderNo, labelCount, printed, creator, createdAt, remark]) => ({
  id, batch, orderNo, labelCount, printed, creator, createdAt, remark,
}));

const INITIAL_HISTORY_ROWS = [
  ['history-1', 'TPB-202604100001', '114132601682', '2026-04-10 10:35:20', '10.2.156.220', '刘建'],
  ['history-2', 'TPB-202604100001', '114132601681', '2026-04-10 10:35:20', '10.2.156.220', '刘建'],
  ['history-3', 'TPB-202604100001', '114132601680', '2026-04-10 10:35:20', '10.2.156.220', '刘建'],
  ['history-4', 'TPB-202603310001', '114132601679', '2026-03-31 15:22:08', '10.2.156.45', '刘建'],
  ['history-5', 'TPB-202603310001', '114132601678', '2026-03-31 15:22:08', '10.2.156.45', '刘建'],
  ['history-6', 'TPB-202603310001', '114132601677', '2026-03-31 15:22:08', '10.2.156.45', '刘建'],
  ['history-7', 'TPB-202603310001', '114132601676', '2026-03-31 15:22:08', '10.2.156.45', '刘建'],
  ['history-8', 'TPB-202603200001', '123132600871', '2026-03-20 09:10:11', '10.2.156.45', '刘建'],
].map(([id, batch, tag, printedAt, printIp, printer]) => ({ id, batch, tag, printedAt, printIp, printer }));

const INITIAL_LABEL_DETAIL_ROWS = [
  { id: 'label-202501130001-1', batch: 'TPB-202501130001', tag: '114122502032', printCount: 1, printed: '是' },
  ...INITIAL_HISTORY_ROWS.map((row) => ({
    id: `label-${row.id}`,
    batch: row.batch,
    tag: row.tag,
    printCount: 1,
    printed: '是',
  })),
];

const DEFAULT_PREPRINT_FILTERS = {
  batch: '', printed: '', creator: '', orderNo: '', assetTag: '', createdFrom: '', createdTo: '',
};

const DEFAULT_HISTORY_FILTERS = {
  batch: '', tag: '', printer: '', printedFrom: '', printedTo: '',
};

const DEFAULT_LABEL_FILTERS = { tag: '', printed: '' };

const LEDGER_OPTIONS = [
  { label: '101 - 新时代', value: '101' },
  { label: '123 - 飞狐信息', value: '123' },
];
const ASSET_TYPE_OPTIONS = [
  { label: '11 - PC.显示器', value: '11' },
  { label: '16 - 笔记本电脑', value: '16' },
  { label: '14 - 服务器', value: '14' },
];
const HIGH_CATEGORY_OPTIONS = [
  { label: '电脑配件', value: '电脑配件' },
  { label: '电脑外设', value: '电脑外设' },
  { label: '办公设备', value: '办公设备' },
  { label: '合约机', value: '合约机' },
];
const HIGH_SUBCATEGORY_OPTIONS = {
  电脑配件: ['内存', '内置硬盘', '板卡'],
  电脑外设: ['移动硬盘', '移动光驱'],
  办公设备: ['会议白板', '碎纸机', '饮水机'],
  合约机: ['合约手机', '合约电话卡'],
};
const FURNITURE_OPTIONS = [
  { label: '工位-A', value: 'A' },
  { label: '柜子-D', value: 'D' },
  { label: '桌子-E', value: 'E' },
  { label: '椅子-Y', value: 'Y' },
  { label: '其他-Q', value: 'Q' },
];
const SPARE_PART_OPTIONS = [
  { label: '备件-CPU', value: 'CPU' },
  { label: '板卡配件-Card', value: 'Card' },
  { label: '硬盘备件-HD', value: 'HD' },
  { label: '内存备件-ME', value: 'ME' },
  { label: '板块备件-SP', value: 'SP' },
];

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
  const date = String(value).slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function textCompare(a, b) {
  return String(a ?? '').localeCompare(String(b ?? ''), 'zh-CN', { numeric: true });
}

function defaultAssetSort(a, b) {
  return textCompare(a.city, b.city) || textCompare(a.userId, b.userId) || textCompare(a.assetTag, b.assetTag);
}

function makeBatchNo() {
  return `TPB-${dayjs().format('YYYYMMDDHHmmss')}`;
}

function makeHistoryId() {
  return `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function LookupInput({ value, placeholder, onOpen }) {
  return (
    <Input
      value={value || ''}
      readOnly
      allowClear
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

function PrintCopiesModal({ open, copies, onChange, onConfirm, onCancel }) {
  return (
    <Modal title="打印几份" open={open} onOk={onConfirm} onCancel={onCancel} okText="确认打印" cancelText="取消" width={420}>
      <div className="flex items-center gap-4 py-4">
        <Typography.Text>打印份数</Typography.Text>
        <InputNumber min={1} max={99} value={copies} onChange={(value) => onChange(value || 1)} />
      </div>
      <Typography.Text type="secondary">打印次数将按本次打印份数累计，并生成详细打印日志。</Typography.Text>
    </Modal>
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
          <div className={`${RULE_GRID_CLASS} ${active ? '' : 'opacity-55'}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function GenerateLabelsPage({ onBack, onGenerated, onOpenLabels, messageApi }) {
  const [ledger, setLedger] = useState('101');
  const [rule, setRule] = useState('normal');
  const [assetType, setAssetType] = useState(undefined);
  const [normalYear, setNormalYear] = useState(dayjs());
  const [highCategory, setHighCategory] = useState(undefined);
  const [highSubCategory, setHighSubCategory] = useState(undefined);
  const [highYear, setHighYear] = useState(dayjs());
  const [furnitureType, setFurnitureType] = useState(undefined);
  const [sparePartType, setSparePartType] = useState(undefined);
  const [mainCount, setMainCount] = useState(1);
  const [partCount, setPartCount] = useState(1);
  const [remark, setRemark] = useState('');
  const [maxValues, setMaxValues] = useState({ normal: 746, high: 4434, furniture: 617957, mobile: 3792, sparePart: 7 });
  const [furnitureMaxInput, setFurnitureMaxInput] = useState(617957);
  const [generatedBatch, setGeneratedBatch] = useState(null);

  const currentMax = rule === 'furniture' ? furnitureMaxInput : maxValues[rule];

  const validateRule = () => {
    if (!ledger) return '请选择账套';
    if (rule === 'normal' && !assetType) return '请选择资产类型';
    if (rule === 'high' && (!highCategory || !highSubCategory)) return '请选择高耗大类和高耗小类';
    if (rule === 'furniture' && !furnitureType) return '请选择家具类型';
    if (rule === 'sparePart' && !sparePartType) return '请选择备件类型';
    if (!Number.isInteger(Number(mainCount)) || Number(mainCount) <= 0) return '打印标签数量必须为正整数';
    if (!Number.isInteger(Number(partCount)) || Number(partCount) < 1 || Number(partCount) > 99) return '部件数量必须为1～99的整数';
    if (rule === 'furniture' && Number(furnitureMaxInput) < 617957) return '当前输入的流水号，存在已经被使用的情况！';
    return '';
  };

  const buildMainTag = (sequence) => {
    const year = (rule === 'normal' ? normalYear : highYear)?.format('YY') || dayjs().format('YY');
    if (rule === 'normal') {
      const base = `${ledger}${assetType}${year}${String(sequence).padStart(5, '0')}`;
      const tag = assetType === '11' ? `${base}-V` : base;
      return tag.length > 15 && assetType !== '11'
        ? `${ledger}${assetType}${String(sequence).padStart(5, '0')}`
        : tag;
    }
    if (rule === 'high') {
      if (highCategory === '合约机' && highSubCategory === '合约手机') return `P-${year}${String(sequence).padStart(4, '0')}`;
      if (highCategory === '合约机' && highSubCategory === '合约电话卡') return `N-${year}${String(sequence).padStart(4, '0')}`;
      return `QT-${year}${String(sequence).padStart(4, '0')}`;
    }
    if (rule === 'furniture') return `${String(sequence).padStart(6, '0')}${furnitureType}`;
    if (rule === 'mobile') return `NE${String(sequence).padStart(4, '0')}`;
    return `${sparePartType}${String(sequence).padStart(5, '0')}`;
  };

  const handleGenerate = () => {
    const error = validateRule();
    if (error) {
      messageApi.error(error);
      return;
    }

    const start = Number(currentMax) + 1;
    const batchNo = makeBatchNo();
    const labels = [];
    for (let index = 0; index < Number(mainCount); index += 1) {
      const mainTag = buildMainTag(start + index);
      labels.push({ id: `${batchNo}-${mainTag}`, batch: batchNo, tag: mainTag, printCount: 0, printed: '否' });
      for (let partIndex = 1; partIndex < Number(partCount); partIndex += 1) {
        const partTag = `${mainTag}-${String(partIndex).padStart(2, '0')}`;
        labels.push({ id: `${batchNo}-${partTag}`, batch: batchNo, tag: partTag, printCount: 0, printed: '否' });
      }
    }

    const batch = {
      id: `batch-${Date.now()}`,
      batch: batchNo,
      orderNo: '-',
      labelCount: labels.length,
      printed: '否',
      creator: CURRENT_USER,
      createdAt: dayjs().format('YYYY-MM-DD'),
      remark: remark || '-',
    };

    const nextMax = start + Number(mainCount) - 1;
    setMaxValues((current) => ({ ...current, [rule]: nextMax }));
    if (rule === 'furniture') setFurnitureMaxInput(nextMax);
    setGeneratedBatch(batch);
    onGenerated(batch, labels);
    messageApi.success(`标签生成成功，共生成 ${labels.length} 条标签明细`);
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
          <Select className="w-[260px]" value={ledger} options={LEDGER_OPTIONS} onChange={setLedger} />
        </div>

        <div className="mb-3 text-[13px] font-medium text-gray-500">选择标签规则</div>
        <Space direction="vertical" size={10} className="w-full">
          <RuleRow active={rule === 'normal'} title="常规标签规则" onSelect={() => setRule('normal')}>
            <RuleField label="选择资产类型">
              <Select className={RULE_CONTROL_CLASS} placeholder="请选择" value={assetType} options={ASSET_TYPE_OPTIONS} onChange={setAssetType} disabled={rule !== 'normal'} />
            </RuleField>
            <RuleField label="选择年份">
              <DatePicker className={RULE_CONTROL_CLASS} picker="year" value={normalYear} onChange={setNormalYear} disabled={rule !== 'normal'} />
            </RuleField>
            <RuleField label="当前最大序号">
              <Input className={RULE_CONTROL_CLASS} value={String(maxValues.normal).padStart(5, '0')} readOnly disabled />
            </RuleField>
          </RuleRow>

          <RuleRow active={rule === 'high'} title="高耗标签规则" onSelect={() => setRule('high')}>
            <RuleField label="选择高耗大类">
              <Select
                className={RULE_CONTROL_CLASS}
                placeholder="请选择"
                value={highCategory}
                options={HIGH_CATEGORY_OPTIONS}
                onChange={(value) => {
                  setHighCategory(value);
                  setHighSubCategory(undefined);
                }}
                disabled={rule !== 'high'}
              />
            </RuleField>
            <RuleField label="选择高耗小类">
              <Select
                className={RULE_CONTROL_CLASS}
                placeholder="请选择"
                value={highSubCategory}
                options={(HIGH_SUBCATEGORY_OPTIONS[highCategory] || []).map((value) => ({ label: value, value }))}
                onChange={setHighSubCategory}
                disabled={rule !== 'high'}
              />
            </RuleField>
            <RuleField label="选择年份">
              <DatePicker className={RULE_CONTROL_CLASS} picker="year" value={highYear} onChange={setHighYear} disabled={rule !== 'high'} />
            </RuleField>
            <RuleField label="当前最大序号">
              <Input className={RULE_CONTROL_CLASS} value={String(maxValues.high).padStart(4, '0')} readOnly disabled />
            </RuleField>
          </RuleRow>

          <RuleRow active={rule === 'furniture'} title="特殊规则-家具" onSelect={() => setRule('furniture')}>
            <RuleField label="选择家具类型">
              <Select className={RULE_CONTROL_CLASS} placeholder="请选择" value={furnitureType} options={FURNITURE_OPTIONS} onChange={setFurnitureType} disabled={rule !== 'furniture'} />
            </RuleField>
            <RuleField label="当前最大序号">
              <InputNumber
                className={RULE_CONTROL_CLASS}
                min={1}
                value={furnitureMaxInput}
                onChange={(value) => setFurnitureMaxInput(value || 1)}
                disabled={rule !== 'furniture'}
                style={{ width: 220 }}
              />
            </RuleField>
          </RuleRow>

          <RuleRow active={rule === 'mobile'} title="特殊规则-手机" onSelect={() => setRule('mobile')}>
            <RuleField label="标签前缀"><Input className={RULE_CONTROL_CLASS} value="NE" readOnly /></RuleField>
            <RuleField label="当前最大序号"><Input className={RULE_CONTROL_CLASS} value={String(maxValues.mobile).padStart(4, '0')} readOnly /></RuleField>
          </RuleRow>

          <RuleRow active={rule === 'sparePart'} title="特殊规则-备件" onSelect={() => setRule('sparePart')}>
            <RuleField label="选择备件类型">
              <Select className={RULE_CONTROL_CLASS} placeholder="请选择" value={sparePartType} options={SPARE_PART_OPTIONS} onChange={setSparePartType} disabled={rule !== 'sparePart'} />
            </RuleField>
            <RuleField label="当前最大序号"><Input className={RULE_CONTROL_CLASS} value={String(maxValues.sparePart).padStart(5, '0')} readOnly disabled /></RuleField>
          </RuleRow>
        </Space>
      </Card>

      <Card size="small" title="标签生成" className="shadow-sm">
        <Descriptions bordered size="small" column={3} labelStyle={{ width: 128 }}>
          <Descriptions.Item label="打印标签数量">
            <InputNumber min={1} value={mainCount} onChange={(value) => setMainCount(value || 1)} style={{ width: 180 }} />
          </Descriptions.Item>
          <Descriptions.Item label="部件数量">
            <InputNumber min={1} max={99} value={partCount} onChange={(value) => setPartCount(value || 1)} style={{ width: 180 }} />
          </Descriptions.Item>
          <Descriptions.Item label="标签批次">
            {generatedBatch?.batch || <Typography.Text type="danger">生成标签后自动生成</Typography.Text>}
          </Descriptions.Item>
          <Descriptions.Item label="操作员">{CURRENT_USER}</Descriptions.Item>
          <Descriptions.Item label="当前日期">{dayjs().format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="" />
          <Descriptions.Item label="备注说明" span={3}>
            <Input.TextArea value={remark} onChange={(event) => setRemark(event.target.value)} autoSize={{ minRows: 3, maxRows: 6 }} placeholder="请输入备注说明" style={{ maxWidth: 760 }} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div className="sticky bottom-0 z-30 flex justify-center gap-3 border-t border-[#e5e7eb] bg-white/95 px-5 py-3 shadow-[0_-6px_20px_rgba(15,23,42,0.06)] backdrop-blur">
        <Button className="min-w-[96px]" icon={<ArrowLeft size={14} />} onClick={onBack}>返回</Button>
        <Button type="primary" className="min-w-[116px]" icon={<Tags size={14} />} onClick={handleGenerate}>生成标签</Button>
        {generatedBatch && (
          <Button className="min-w-[116px]" icon={<Printer size={14} />} onClick={() => onOpenLabels(generatedBatch.batch)}>打印标签</Button>
        )}
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
  const [preprintRows, setPreprintRows] = useState(INITIAL_PREPRINT_ROWS);
  const [preprintDraftFilters, setPreprintDraftFilters] = useState(DEFAULT_PREPRINT_FILTERS);
  const [preprintAppliedFilters, setPreprintAppliedFilters] = useState(DEFAULT_PREPRINT_FILTERS);
  const [historyRows, setHistoryRows] = useState(INITIAL_HISTORY_ROWS);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyDraftFilters, setHistoryDraftFilters] = useState(DEFAULT_HISTORY_FILTERS);
  const [historyAppliedFilters, setHistoryAppliedFilters] = useState(DEFAULT_HISTORY_FILTERS);
  const [labelRows, setLabelRows] = useState(INITIAL_LABEL_DETAIL_ROWS);
  const [labelListOpen, setLabelListOpen] = useState(false);
  const [labelBatch, setLabelBatch] = useState('');
  const [labelDraftFilters, setLabelDraftFilters] = useState(DEFAULT_LABEL_FILTERS);
  const [labelAppliedFilters, setLabelAppliedFilters] = useState(DEFAULT_LABEL_FILTERS);
  const [labelSelectedKeys, setLabelSelectedKeys] = useState([]);
  const [printTask, setPrintTask] = useState(null);
  const [printCopies, setPrintCopies] = useState(1);

  const filteredRows = useMemo(() => rows.filter((row) => (
    includesText(row.companyCn, appliedFilters.companyCn)
    && includesText(row.companyEn, appliedFilters.companyEn)
    && includesText(row.department, appliedFilters.department)
    && includesText(row.plateCn, appliedFilters.plateCn)
    && includesText(row.assetStatus, appliedFilters.assetStatus)
    && includesText(row.assetTag, appliedFilters.assetTag)
    && includesText(row.serialNumber, appliedFilters.serialNumber)
    && includesText(row.userId, appliedFilters.userId)
    && includesText(row.assetCategory, appliedFilters.assetCategory)
    && includesText(row.city, appliedFilters.city)
  )).sort(defaultAssetSort), [rows, appliedFilters]);

  const filteredPreprintRows = useMemo(() => {
    const matchedBatches = preprintAppliedFilters.assetTag
      ? new Set(labelRows.filter((row) => includesText(row.tag, preprintAppliedFilters.assetTag)).map((row) => row.batch))
      : null;
    return preprintRows.filter((row) => (
      includesText(row.batch, preprintAppliedFilters.batch)
      && includesText(row.printed, preprintAppliedFilters.printed)
      && includesText(row.creator, preprintAppliedFilters.creator)
      && includesText(row.orderNo, preprintAppliedFilters.orderNo)
      && (!matchedBatches || matchedBatches.has(row.batch))
      && inDateRange(row.createdAt, preprintAppliedFilters.createdFrom, preprintAppliedFilters.createdTo)
    )).sort((a, b) => textCompare(b.batch, a.batch));
  }, [labelRows, preprintAppliedFilters, preprintRows]);

  const filteredHistoryRows = useMemo(() => historyRows.filter((row) => (
    includesText(row.batch, historyAppliedFilters.batch)
    && includesText(row.tag, historyAppliedFilters.tag)
    && includesText(row.printer, historyAppliedFilters.printer)
    && inDateRange(row.printedAt, historyAppliedFilters.printedFrom, historyAppliedFilters.printedTo)
  )).sort((a, b) => textCompare(b.printedAt, a.printedAt)), [historyAppliedFilters, historyRows]);

  const filteredLabelRows = useMemo(() => labelRows.filter((row) => (
    row.batch === labelBatch
    && includesText(row.tag, labelAppliedFilters.tag)
    && includesText(row.printed, labelAppliedFilters.printed)
  )).sort((a, b) => textCompare(a.tag, b.tag)), [labelAppliedFilters, labelBatch, labelRows]);

  const statusOptions = useMemo(() => uniqueValues(rows, 'assetStatus').map((value) => ({ label: value, value })), [rows]);
  const cityOptions = useMemo(() => uniqueValues(rows, 'city').map((value) => ({ label: value, value })), [rows]);
  const userLookupData = useMemo(() => {
    const seen = new Set();
    return rows.filter((row) => row.userId && row.userId !== '-' && !seen.has(row.userId) && seen.add(row.userId))
      .map((row) => ({ id: row.userId, userId: row.userId, userName: row.userName, department: row.department }));
  }, [rows]);

  const activeLookup = ['department', 'assetCategory', 'user'].includes(lookupKey) ? lookupKey : '';
  const lookupLabel = activeLookup === 'department' ? '部门' : activeLookup === 'assetCategory' ? '资产类别' : '使用人';
  const lookupData = useMemo(() => {
    if (activeLookup === 'user') return userLookupData;
    if (!activeLookup) return [];
    return uniqueValues(rows, activeLookup).map((value, index) => ({ id: `${activeLookup}-${index}`, value }));
  }, [activeLookup, rows, userLookupData]);

  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const updatePreprintFilter = (field, value) => setPreprintDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const updateHistoryFilter = (field, value) => setHistoryDraftFilters((current) => ({ ...current, [field]: value || '' }));
  const updateLabelFilter = (field, value) => setLabelDraftFilters((current) => ({ ...current, [field]: value || '' }));

  const validateAssetPrintRows = (targetRows) => {
    for (const row of targetRows) {
      if (!row.companyEn || row.companyEn === '-') return `资产标签号为“${row.assetTag}”项没有公司英文名！`;
      if ((!row.plateCn || row.plateCn === '-') && (!row.companyCn || row.companyCn === '-')) return `资产标签号为“${row.assetTag}”项没有公司中文名！`;
    }
    return '';
  };

  const requestAssetPrint = (targetIds, actionName) => {
    if (!targetIds.length) {
      messageApi.warning(actionName === '打印所选' ? '请选择要打印的资产标签！' : '当前没有可打印的数据');
      return;
    }
    const idSet = new Set(targetIds);
    const targetRows = rows.filter((row) => idSet.has(row.id));
    const error = validateAssetPrintRows(targetRows);
    if (error) {
      messageApi.error(error);
      return;
    }
    setPrintCopies(1);
    setPrintTask({ type: 'asset', ids: targetIds, actionName });
  };

  const requestLabelPrint = (targetIds, actionName, batch) => {
    if (!targetIds.length) {
      messageApi.warning(actionName === '打印所选' ? '请选择要打印的资产标签！' : '当前没有可打印的标签');
      return;
    }
    setPrintCopies(1);
    setPrintTask({ type: 'label', ids: targetIds, actionName, batch });
  };

  const confirmPrint = () => {
    if (!printTask) return;
    const operationTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const copies = Number(printCopies || 1);

    if (printTask.type === 'asset') {
      const idSet = new Set(printTask.ids);
      const targets = rows.filter((row) => idSet.has(row.id));
      const batch = makeBatchNo();
      setRows((current) => current.map((row) => (
        idSet.has(row.id) ? { ...row, printCount: Number(row.printCount || 0) + copies } : row
      )));
      setPreprintRows((current) => [{
        id: `batch-${Date.now()}`,
        batch,
        orderNo: '-',
        labelCount: targets.length,
        printed: '是',
        creator: CURRENT_USER,
        createdAt: dayjs().format('YYYY-MM-DD'),
        remark: '标签打印',
      }, ...current]);
      setLabelRows((current) => [
        ...targets.map((row) => ({ id: `${batch}-${row.assetTag}`, batch, tag: row.assetTag, printCount: copies, printed: '是' })),
        ...current,
      ]);
      setHistoryRows((current) => [
        ...targets.map((row) => ({ id: makeHistoryId(), batch, tag: row.assetTag, printedAt: operationTime, printIp: CURRENT_IP, printer: CURRENT_USER })),
        ...current,
      ]);
      setSelectedRowKeys([]);
    } else {
      const idSet = new Set(printTask.ids);
      const targets = labelRows.filter((row) => idSet.has(row.id));
      setLabelRows((current) => current.map((row) => (
        idSet.has(row.id) ? { ...row, printCount: Number(row.printCount || 0) + copies, printed: '是' } : row
      )));
      setPreprintRows((current) => current.map((row) => (
        row.batch === printTask.batch ? { ...row, printed: '是' } : row
      )));
      setHistoryRows((current) => [
        ...targets.map((row) => ({ id: makeHistoryId(), batch: row.batch, tag: row.tag, printedAt: operationTime, printIp: CURRENT_IP, printer: CURRENT_USER })),
        ...current,
      ]);
      setLabelSelectedKeys([]);
    }

    messageApi.success(`${printTask.actionName}已提交，打印 ${copies} 份；原型已模拟写入详细打印日志`);
    setPrintTask(null);
  };

  const handleExport = () => {
    const selectedSet = new Set(selectedRowKeys);
    const exportRows = selectedRowKeys.length ? rows.filter((row) => selectedSet.has(row.id)) : filteredRows;
    if (!exportRows.length) {
      messageApi.warning('当前没有可导出的数据');
      return;
    }
    const headers = ['资产标签号', '资产名称', '部门', '地点', '公司中文名称', '公司英文名称', '板块中文名称', '序列号', '资产类别', '资产状态', '使用人', '打印次数'];
    const body = exportRows.map((row) => [
      row.assetTag, row.assetName, row.department, row.location, row.companyCn, row.companyEn, row.plateCn,
      row.serialNumber, row.assetCategory, row.assetStatus, `${row.userId}-${row.userName}`, row.printCount,
    ]);
    const csv = [headers, ...body].map((line) => line.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `标签打印-${dayjs().format('YYYYMMDDHHmmss')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    messageApi.success(`已导出 ${exportRows.length} 条数据`);
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

  const handleGenerated = (batch, labels) => {
    setPreprintRows((current) => [batch, ...current]);
    setLabelRows((current) => [...labels, ...current]);
  };

  const columns = [
    { title: '资产标签号', dataIndex: 'assetTag', width: 150, fixed: 'left', sorter: (a, b) => textCompare(a.assetTag, b.assetTag), render: displayText },
    { title: '资产名称', dataIndex: 'assetName', width: 220, sorter: (a, b) => textCompare(a.assetName, b.assetName), render: displayText },
    { title: '部门', dataIndex: 'department', width: 190, sorter: (a, b) => textCompare(a.department, b.department), render: displayText },
    { title: '地点', dataIndex: 'location', width: 210, sorter: (a, b) => textCompare(a.location, b.location), render: displayText },
    { title: '公司中文名', dataIndex: 'companyCn', width: 140, sorter: (a, b) => textCompare(a.companyCn, b.companyCn), render: displayText },
    { title: '公司英文名', dataIndex: 'companyEn', width: 150, sorter: (a, b) => textCompare(a.companyEn, b.companyEn), render: displayText },
    { title: '板块中文名', dataIndex: 'plateCn', width: 140, sorter: (a, b) => textCompare(a.plateCn, b.plateCn), render: displayText },
    { title: '序列号', dataIndex: 'serialNumber', width: 220, sorter: (a, b) => textCompare(a.serialNumber, b.serialNumber), render: displayText },
    { title: '资产类别', dataIndex: 'assetCategory', width: 110, sorter: (a, b) => textCompare(a.assetCategory, b.assetCategory), render: displayText },
    { title: '资产状态', dataIndex: 'assetStatus', width: 140, sorter: (a, b) => textCompare(a.assetStatus, b.assetStatus), render: (value) => value && value !== '-' ? <StatusTag value={value} type="business" /> : '-' },
    { title: '使用人', key: 'user', width: 150, sorter: (a, b) => textCompare(a.userId, b.userId), render: (_, row) => row.userId && row.userName ? `${row.userId}-${row.userName}` : '-' },
    { title: '打印次数', dataIndex: 'printCount', width: 100, align: 'right', sorter: (a, b) => Number(a.printCount || 0) - Number(b.printCount || 0) },
  ];

  const preprintColumns = [
    { title: '标签批次', dataIndex: 'batch', width: 190, render: displayText },
    { title: '订单编号', dataIndex: 'orderNo', width: 190, render: displayText },
    { title: '生成标签数量', dataIndex: 'labelCount', width: 130, align: 'right' },
    { title: '是否已打印', dataIndex: 'printed', width: 120, align: 'center', render: (value) => <StatusTag value={value} type="yesNo" /> },
    { title: '创建人', dataIndex: 'creator', width: 120, render: displayText },
    { title: '创建时间', dataIndex: 'createdAt', width: 130, render: displayText },
    { title: '备注说明', dataIndex: 'remark', width: 160, render: displayText },
    { title: '详细', key: 'detail', width: 110, render: (_, record) => <Button type="link" size="small" onClick={() => openLabelList(record.batch)}>标签清单</Button> },
    { title: '打印历史', key: 'history', width: 110, render: (_, record) => <Button type="link" size="small" onClick={() => openHistory(record.batch)}>打印历史</Button> },
  ];

  const labelColumns = [
    { title: '标签批次', dataIndex: 'batch', width: 210, render: displayText },
    { title: '标签号', dataIndex: 'tag', width: 200, sorter: (a, b) => textCompare(a.tag, b.tag), render: displayText },
    { title: '打印次数', dataIndex: 'printCount', width: 120, align: 'right' },
    { title: '是否已打印', dataIndex: 'printed', width: 130, align: 'center', render: (value) => <StatusTag value={value} type="yesNo" /> },
    { title: '操作', key: 'action', width: 120, render: (_, record) => <Button type="link" size="small" onClick={() => openHistory(record.batch, record.tag)}>打印历史</Button> },
  ];

  const historyColumns = [
    { title: '标签批次', dataIndex: 'batch', width: 190, render: displayText },
    { title: '标签号', dataIndex: 'tag', width: 180, render: displayText },
    { title: '打印时间', dataIndex: 'printedAt', width: 180, render: displayText },
    { title: '打印IP', dataIndex: 'printIp', width: 150, render: displayText },
    { title: '打印人', dataIndex: 'printer', width: 120, render: displayText },
  ];

  if (previewMode && generateMode) {
    return (
      <>
        {contextHolder}
        <GenerateLabelsPage
          onBack={() => setGenerateMode(false)}
          onGenerated={handleGenerated}
          onOpenLabels={(batch) => {
            setGenerateMode(false);
            openLabelList(batch);
          }}
          messageApi={messageApi}
        />
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
          <QueryItem label="标签批次"><Input value={preprintDraftFilters.batch} allowClear placeholder="请输入标签批次" onChange={(event) => updatePreprintFilter('batch', event.target.value)} /></QueryItem>
          <QueryItem label="是否已打印">
            <Select value={preprintDraftFilters.printed || undefined} allowClear placeholder="全部" options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} onChange={(value) => updatePreprintFilter('printed', value)} />
          </QueryItem>
          <QueryItem label="创建人">
            <Select value={preprintDraftFilters.creator || undefined} allowClear placeholder="请选择" options={uniqueValues(preprintRows, 'creator').map((value) => ({ label: value, value }))} onChange={(value) => updatePreprintFilter('creator', value)} />
          </QueryItem>
          <QueryItem label="订单编号"><Input value={preprintDraftFilters.orderNo} allowClear placeholder="请输入订单编号" onChange={(event) => updatePreprintFilter('orderNo', event.target.value)} /></QueryItem>
          <QueryItem label="资产标签号"><Input value={preprintDraftFilters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => updatePreprintFilter('assetTag', event.target.value)} /></QueryItem>
          <QueryItem label="创建时间">
            <RangePicker
              className="w-full"
              value={preprintDraftFilters.createdFrom && preprintDraftFilters.createdTo ? [dayjs(preprintDraftFilters.createdFrom), dayjs(preprintDraftFilters.createdTo)] : null}
              format="YYYY-MM-DD"
              onChange={(dates) => setPreprintDraftFilters((current) => ({
                ...current,
                createdFrom: dates?.[0] ? dates[0].format('YYYY-MM-DD') : '',
                createdTo: dates?.[1] ? dates[1].format('YYYY-MM-DD') : '',
              }))}
            />
          </QueryItem>
        </QueryBar>

        <Card size="small" title="预打印列表" extra={<Typography.Text type="secondary">共 {filteredPreprintRows.length} 条</Typography.Text>}>
          <div className="mb-3 flex justify-end">
            <Button type="primary" icon={<Tags size={14} />} onClick={() => setGenerateMode(true)}>生成标签</Button>
          </div>
          <Table rowKey="id" size="small" bordered columns={preprintColumns} dataSource={filteredPreprintRows} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true }} />
        </Card>

        <Modal
          title="查看标签"
          open={labelListOpen}
          width={1050}
          onCancel={() => setLabelListOpen(false)}
          footer={<div className="flex justify-center"><Button className="min-w-[96px]" icon={<ArrowLeft size={14} />} onClick={() => setLabelListOpen(false)}>返回</Button></div>}
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
              <QueryItem label="标签号"><Input value={labelDraftFilters.tag} allowClear placeholder="请输入标签号" onChange={(event) => updateLabelFilter('tag', event.target.value)} /></QueryItem>
              <QueryItem label="是否打印">
                <Select value={labelDraftFilters.printed || undefined} allowClear placeholder="全部" options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} onChange={(value) => updateLabelFilter('printed', value)} />
              </QueryItem>
            </QueryBar>

            <div className="flex items-center justify-between gap-3">
              <Typography.Text type="secondary">标签批次：{labelBatch || '-'}</Typography.Text>
              <Space wrap>
                <Button icon={<Printer size={14} />} onClick={() => requestLabelPrint(labelSelectedKeys, '打印所选', labelBatch)}>打印所选</Button>
                <Button
                  icon={<Printer size={14} />}
                  onClick={() => requestLabelPrint(labelRows.filter((row) => row.batch === labelBatch).map((row) => row.id), '打印全部', labelBatch)}
                >
                  打印全部
                </Button>
              </Space>
            </div>

            <Table
              rowKey="id"
              size="small"
              bordered
              columns={labelColumns}
              dataSource={filteredLabelRows}
              rowSelection={{ selectedRowKeys: labelSelectedKeys, onChange: setLabelSelectedKeys, fixed: true, columnTitle: '选择' }}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              locale={{ emptyText: '暂无标签数据' }}
            />
          </Space>
        </Modal>

        <Modal title="打印历史" open={historyOpen} width={1100} footer={null} onCancel={() => setHistoryOpen(false)}>
          <QueryBar
            onQuery={() => setHistoryAppliedFilters({ ...historyDraftFilters })}
            onReset={() => {
              setHistoryDraftFilters(DEFAULT_HISTORY_FILTERS);
              setHistoryAppliedFilters(DEFAULT_HISTORY_FILTERS);
            }}
          >
            <QueryItem label="标签批次"><Input value={historyDraftFilters.batch} allowClear placeholder="请输入标签批次" onChange={(event) => updateHistoryFilter('batch', event.target.value)} /></QueryItem>
            <QueryItem label="标签号"><Input value={historyDraftFilters.tag} allowClear placeholder="请输入标签号" onChange={(event) => updateHistoryFilter('tag', event.target.value)} /></QueryItem>
            <QueryItem label="打印人"><Input value={historyDraftFilters.printer} allowClear placeholder="请输入打印人" onChange={(event) => updateHistoryFilter('printer', event.target.value)} /></QueryItem>
            <QueryItem label="打印时间从"><DateFilter value={historyDraftFilters.printedFrom} onChange={(value) => updateHistoryFilter('printedFrom', value)} /></QueryItem>
            <QueryItem label="打印时间至"><DateFilter value={historyDraftFilters.printedTo} onChange={(value) => updateHistoryFilter('printedTo', value)} /></QueryItem>
          </QueryBar>
          <div className="mt-4 flex justify-end text-sm text-gray-500">共 {filteredHistoryRows.length} 条</div>
          <Table className="mt-2" rowKey="id" size="small" bordered columns={historyColumns} dataSource={filteredHistoryRows} pagination={{ pageSize: 10, showSizeChanger: true }} />
        </Modal>

        <PrintCopiesModal open={Boolean(printTask)} copies={printCopies} onChange={setPrintCopies} onConfirm={confirmPrint} onCancel={() => setPrintTask(null)} />
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
        <QueryItem label="公司中文名称"><Input value={draftFilters.companyCn} allowClear placeholder="请输入公司中文名称" onChange={(event) => updateFilter('companyCn', event.target.value)} /></QueryItem>
        <QueryItem label="公司英文名称"><Input value={draftFilters.companyEn} allowClear placeholder="请输入公司英文名称" onChange={(event) => updateFilter('companyEn', event.target.value)} /></QueryItem>
        <QueryItem label="部门"><LookupInput value={draftFilters.department} placeholder="请选择部门" onOpen={() => setLookupKey('department')} /></QueryItem>
        <QueryItem label="板块中文名称"><Input value={draftFilters.plateCn} allowClear placeholder="请输入板块中文名称" onChange={(event) => updateFilter('plateCn', event.target.value)} /></QueryItem>
        <QueryItem label="资产状态"><Select value={draftFilters.assetStatus || undefined} allowClear placeholder="全部" options={statusOptions} onChange={(value) => updateFilter('assetStatus', value)} /></QueryItem>
        <QueryItem label="资产标签号"><Input value={draftFilters.assetTag} allowClear placeholder="请输入资产标签号" onChange={(event) => updateFilter('assetTag', event.target.value)} /></QueryItem>
        <QueryItem label="序列号"><Input value={draftFilters.serialNumber} allowClear placeholder="请输入序列号" onChange={(event) => updateFilter('serialNumber', event.target.value)} /></QueryItem>
        <QueryItem label="使用人"><LookupInput value={draftFilters.userDisplay} placeholder="请选择使用人" onOpen={() => setLookupKey('user')} /></QueryItem>
        <QueryItem label="资产类别"><LookupInput value={draftFilters.assetCategory} placeholder="请选择资产类别" onOpen={() => setLookupKey('assetCategory')} /></QueryItem>
        <QueryItem label="城市"><Select value={draftFilters.city || undefined} allowClear placeholder="全部" options={cityOptions} onChange={(value) => updateFilter('city', value)} /></QueryItem>
      </QueryBar>

      <Card size="small" title="标签打印列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space>
            <Button icon={<Printer size={14} />} onClick={() => requestAssetPrint(selectedRowKeys, '打印所选')}>打印所选</Button>
            <Button icon={<Printer size={14} />} onClick={() => requestAssetPrint(filteredRows.map((row) => row.id), '打印全部')}>打印全部</Button>
            <Button icon={<Download size={14} />} onClick={handleExport}>导出</Button>
            <Button type="primary" icon={<Eye size={14} />} onClick={() => setPreviewMode(true)}>预打印</Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredRows}
          rowSelection={{ type: 'checkbox', columnTitle: '选择', selectedRowKeys, onChange: setSelectedRowKeys, fixed: true }}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <SelectModal
        open={Boolean(activeLookup)}
        title={`选择${lookupLabel}`}
        rowKey="id"
        dataSource={lookupData}
        searchFields={activeLookup === 'user'
          ? [{ name: 'userId', label: '工号', dataIndex: 'userId' }, { name: 'userName', label: '姓名', dataIndex: 'userName' }]
          : activeLookup ? [{ name: 'value', label: lookupLabel, dataIndex: 'value' }] : []}
        columns={activeLookup === 'user'
          ? [{ title: '工号', dataIndex: 'userId' }, { title: '姓名', dataIndex: 'userName' }, { title: '部门', dataIndex: 'department' }]
          : activeLookup ? [{ title: lookupLabel, dataIndex: 'value' }] : []}
        onCancel={() => setLookupKey('')}
        onConfirm={(record) => {
          if (activeLookup === 'user') {
            setDraftFilters((current) => ({ ...current, userId: record.userId, userDisplay: `${record.userId}-${record.userName}` }));
          } else {
            updateFilter(activeLookup, record.value);
          }
          setLookupKey('');
        }}
      />

      <PrintCopiesModal open={Boolean(printTask)} copies={printCopies} onChange={setPrintCopies} onConfirm={confirmPrint} onCancel={() => setPrintTask(null)} />
    </Space>
  );
}
