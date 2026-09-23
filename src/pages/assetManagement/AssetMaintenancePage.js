import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  TreeSelect,
  Typography,
  Upload,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  Search,
  UploadCloud,
} from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import {
  getAssetMaintenanceRows,
  updateAssetMaintenanceRow,
} from '../../services/assetManagementService';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Dragger } = Upload;

const STATUS_OPTIONS = [
  '在用-使用中',
  '在库-修理',
  '在库-新增',
  '在用-借用中',
  '在库-待处理',
  '再利用-使用中',
  '已报废-已处置',
  '已报废-待处置',
  '再利用-待报废',
];
const FORMAL_SCRAP_STATUSES = new Set(['已报废-已处置', '已报废-待处置']);
const EDITABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter((item) => !FORMAL_SCRAP_STATUSES.has(item));
const PURPOSE_OPTIONS = ['部门公用', '员工用机', '其他用途', '专业用途'];
const ASSET_MARK_OPTIONS = ['硬件老化', '组件缺失', '设备故障', '物理损伤'];
const ASSET_TYPE_OPTIONS = ['公司资产', '自备资产'];
const ADD_TYPE_OPTIONS = ['报废新增', '采购新增', '历史新增', '收购新增', '赠与新增', '再利用新增', '转移新增'];
const SCRAP_TYPE_OPTIONS = ['已到报废期', '未到报废期', '丢失'];
const PLATE_OPTIONS = [
  '11.搜狐网-web', '12.搜狐网-mobile', '13.汽车', '14.无线', '15.焦点', '16.视频', '17.Corporate',
  '51.焦点 Corporate', '52.房产', '53.家居', '54.二手房', '56.SAAS',
];
const CITY_OPTIONS = ['北京', '上海', '广州', '天津'];
const BUILDING_BY_CITY = {
  北京: ['搜狐媒体大厦', '北京亦庄数据中心'],
  上海: ['上海新媒体办公区'],
  广州: ['广州新媒体办公区'],
  天津: ['天津飞狐办公区'],
};
const FLOOR_OPTIONS = ['B1', '1F', '2F', '3F', '5F', '6F', '7F', '8F', '9F', '10F', '12F', '15F', '18F'];

const EMPTY_FILTERS = {
  tag: '',
  companies: [],
  departments: [],
  owners: [],
  serialNumber: '',
  assetDesc: '',
  categories: [],
  statuses: [],
  plates: [],
  costCenters: [],
  purposes: [],
  warehouses: [],
  assetTypes: [],
  scrapTypes: [],
  mainTag: '',
  city: '',
  building: '',
  floors: [],
  addTypes: [],
  poNo: '',
  purchaseDate: [],
  originalValueMin: null,
  originalValueMax: null,
  brands: [],
  enabledDate: [],
  prNo: '',
};

const TRANSACTION_COLUMNS = [
  ['操作类型', 'operationType', 120],
  ['操作日期', 'operationDate', 160],
  ['操作人', 'operator', 130],
  ['单据编号', 'documentNo', 150],
  ['申请单号', 'applicationNo', 150],
  ['资产标签号', 'tag', 150],
  ['序列号', 'serialNumber', 160],
  ['主资产标签号', 'mainTag', 150],
  ['类别', 'category', 210],
  ['资产说明', 'assetDesc', 200],
  ['责任人', 'owner', 160],
  ['成本中心', 'costCenter', 180],
  ['费用科目', 'feeAccount', 180],
  ['公司', 'company', 140],
  ['地点', 'location', 220],
  ['用途', 'purpose', 120],
  ['资产状态', 'status', 140],
  ['使用说明', 'usageDescription', 220],
  ['备注', 'remarks', 180],
  ['服务', 'service', 150],
  ['配置', 'config', 220],
  ['NO位置', 'noLocation', 180],
  ['升级金额', 'upgradeAmount', 120],
];
const CHANGE_COMPARE_FIELDS = new Set([
  'serialNumber', 'mainTag', 'owner', 'costCenter', 'company', 'location', 'purpose', 'status',
  'usageDescription', 'remarks', 'service', 'config', 'noLocation', 'upgradeAmount',
]);

const RFID_COLUMNS = [
  ['变更类型', 'changeType', 120],
  ['变更时间', 'changeTime', 160],
  ['印刷号', 'printNo', 130],
  ['标签号', 'tag', 150],
  ['序列号', 'serialNumber', 160],
  ['类别', 'category', 200],
  ['说明', 'desc', 180],
  ['员工编号', 'employeeNo', 120],
  ['责任人', 'owner', 120],
  ['部门', 'department', 180],
  ['公司', 'company', 140],
  ['地点', 'location', 220],
  ['用途', 'purpose', 120],
  ['ES状态', 'esStatus', 140],
  ['IDC状态', 'idcStatus', 120],
  ['服务', 'service', 150],
  ['小服务', 'subService', 150],
  ['配置', 'config', 220],
  ['CPU配置', 'cpu', 160],
  ['硬盘配置', 'disk', 160],
  ['内存配置', 'memory', 160],
  ['IP地址1', 'ip1', 140],
  ['IP地址2', 'ip2', 140],
  ['IP地址3', 'ip3', 140],
];

function isEmptyValue(value) {
  return value === undefined || value === null || value === '';
}

function displayText(value) {
  return isEmptyValue(value) ? '-' : value;
}

function amount(value) {
  if (isEmptyValue(value)) return '-';
  const number = Number(value);
  if (Number.isNaN(number)) return displayText(value);
  return number.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function count(value) {
  return isEmptyValue(value) ? '-' : value;
}

function textTokens(value) {
  return String(value || '')
    .split(/[，,\n]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function fuzzyMultiMatch(value, query) {
  const tokens = textTokens(query);
  if (!tokens.length) return true;
  const target = String(value || '').toLowerCase();
  return tokens.some((token) => target.includes(token));
}

function uniqueValues(rows, field) {
  return [...new Set(rows.map((row) => row[field]).filter(Boolean))];
}

function uniqueLookupRecords(rows, codeField, nameField, idPrefix) {
  const map = new Map();
  rows.forEach((row) => {
    const code = String(row?.[codeField] || '').trim();
    const name = String(row?.[nameField] || '').trim();
    if (!code || !name || map.has(code)) return;
    map.set(code, { id: `${idPrefix}-${code}`, code, name });
  });
  return [...map.values()];
}

function costCenterCode(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const separatorIndex = text.indexOf('.');
  return separatorIndex > 0 ? text.slice(0, separatorIndex) : text;
}

function costCenterLookupRecords(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const name = String(row.costCenter || '').trim();
    const code = costCenterCode(name);
    if (!code || !name || map.has(code)) return;
    map.set(code, { id: `cc-${code}`, code, name });
  });
  return [...map.values()];
}

function formatOwner(row) {
  const values = [row?.ownerId, row?.ownerName].filter((value) => !isEmptyValue(value));
  return values.length ? values.join('-') : '-';
}

function copyFilters(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSerial(value) {
  return String(value || '').trim();
}

function isPlaceholderSerial(value) {
  return normalizeSerial(value) === '缺省';
}

function LookupInput({ value, placeholder, onOpen, onClear }) {
  const handleOpen = (event) => {
    if (event?.target?.closest?.('.ant-input-clear-icon')) return;
    onOpen?.();
  };

  return (
    <Input
      value={value || ''}
      readOnly
      allowClear={Boolean(onClear)}
      placeholder={placeholder}
      suffix={<Search size={14} className="text-[#1677ff]" />}
      style={{ cursor: 'pointer' }}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.();
        }
      }}
      onChange={(event) => {
        if (!event.target.value) onClear?.();
      }}
    />
  );
}

function EmptyGroup({ children }) {
  return (
    <div className="py-5 text-center">
      <Typography.Text type="secondary">{children}</Typography.Text>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-4 w-1 rounded-sm bg-[#1677ff]" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function DetailSpacer() {
  return <DetailItem label={null}>{null}</DetailItem>;
}

function AssetSection({ title, collapsible = false, collapsed = false, onToggle, children }) {
  return (
    <Card
      size="small"
      title={<SectionTitle>{title}</SectionTitle>}
      extra={collapsible ? (
        <Button
          type="text"
          size="small"
          icon={collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          onClick={onToggle}
        >
          {collapsed ? '展开' : '收起'}
        </Button>
      ) : null}
      styles={{ body: collapsed ? { display: 'none' } : undefined }}
    >
      {!collapsed && children}
    </Card>
  );
}

function compareValue(a, b, type) {
  if (type === 'number') {
    const aEmpty = isEmptyValue(a);
    const bEmpty = isEmptyValue(b);
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;
    const aNumber = Number(a);
    const bNumber = Number(b);
    if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) return aNumber - bNumber;
  }
  return String(a ?? '').localeCompare(String(b ?? ''), 'zh-CN', { numeric: true });
}

export default function AssetMaintenancePage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(() => getAssetMaintenanceRows());
  const [draftFilters, setDraftFilters] = useState(copyFilters(EMPTY_FILTERS));
  const [appliedFilters, setAppliedFilters] = useState(copyFilters(EMPTY_FILTERS));
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lookupKey, setLookupKey] = useState('');
  const [assetOpen, setAssetOpen] = useState(false);
  const [assetMode, setAssetMode] = useState('view');
  const [activeAssetId, setActiveAssetId] = useState('');
  const [activeTab, setActiveTab] = useState('detail');
  const [editDraft, setEditDraft] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);

  const activeAsset = useMemo(
    () => rows.find((row) => row.id === activeAssetId) || null,
    [rows, activeAssetId],
  );

  const categoryTree = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      if (!map.has(row.majorCategory)) map.set(row.majorCategory, new Set());
      map.get(row.majorCategory).add(row.minorCategory);
    });
    return [...map.entries()].map(([major, minors]) => ({
      title: major,
      value: `major:${major}`,
      key: `major:${major}`,
      children: [...minors].map((minor) => ({
        title: minor,
        value: `minor:${major}|${minor}`,
        key: `minor:${major}|${minor}`,
      })),
    }));
  }, [rows]);

  const lookupConfig = useMemo(() => {
    const configs = {
      companies: {
        title: '选择公司',
        values: uniqueLookupRecords(rows, 'companyCode', 'company', 'company'),
        searchFields: [
          { name: 'code', label: '公司编码', dataIndex: 'code' },
          { name: 'name', label: '公司名称', dataIndex: 'name' },
        ],
        columns: [{ title: '公司编码', dataIndex: 'code' }, { title: '公司名称', dataIndex: 'name' }],
        valueField: 'code',
      },
      departments: {
        title: '选择部门',
        values: uniqueLookupRecords(rows, 'departmentCode', 'department', 'department'),
        searchFields: [
          { name: 'code', label: '部门编码', dataIndex: 'code' },
          { name: 'name', label: '部门名称', dataIndex: 'name' },
        ],
        columns: [{ title: '部门编码', dataIndex: 'code' }, { title: '部门名称', dataIndex: 'name' }],
        valueField: 'code',
      },
      owners: {
        title: '选择资产责任人',
        values: rows.map((row) => ({ id: row.ownerId, code: row.ownerId, name: row.ownerName, department: row.department })),
        searchFields: [
          { name: 'code', label: '员工编码', dataIndex: 'code' },
          { name: 'name', label: '姓名', dataIndex: 'name' },
          { name: 'department', label: '部门名称', dataIndex: 'department' },
        ],
        columns: [
          { title: '员工编码', dataIndex: 'code' },
          { title: '姓名', dataIndex: 'name' },
          { title: '部门名称', dataIndex: 'department' },
        ],
        valueField: 'code',
      },
      costCenters: {
        title: '选择成本中心',
        values: costCenterLookupRecords(rows),
        searchFields: [
          { name: 'code', label: '成本中心编码', dataIndex: 'code' },
          { name: 'name', label: '成本中心', dataIndex: 'name' },
        ],
        columns: [
          { title: '成本中心编码', dataIndex: 'code' },
          { title: '成本中心', dataIndex: 'name' },
        ],
        valueField: 'code',
      },
      brands: {
        title: '选择品牌',
        values: uniqueValues(rows, 'brand').map((name, index) => ({ id: `brand-${index}`, name })),
        searchFields: [{ name: 'name', label: '品牌', dataIndex: 'name' }],
        columns: [{ title: '品牌', dataIndex: 'name' }],
        valueField: 'name',
      },
    };
    return configs[lookupKey] || null;
  }, [lookupKey, rows]);

  const lookupInitialSelectedKeys = useMemo(() => {
    if (!lookupConfig || !lookupKey) return [];
    const selectedValues = new Set((draftFilters[lookupKey] || []).map((value) => String(value)));
    const valueField = lookupConfig.valueField || 'name';
    return [...new Set(lookupConfig.values
      .filter((record) => selectedValues.has(String(record[valueField])))
      .map((record) => String(record.id)))];
  }, [lookupConfig, lookupKey, draftFilters]);

  const lookupDisplay = (field) => {
    const values = draftFilters[field] || [];
    if (!values.length) return '';
    if (field === 'companies') {
      return values.map((code) => rows.find((item) => String(item.companyCode) === String(code))?.company || code).join(', ');
    }
    if (field === 'departments') {
      return values.map((code) => rows.find((item) => String(item.departmentCode) === String(code))?.department || code).join(', ');
    }
    if (field === 'owners') {
      return values.map((id) => {
        const row = rows.find((item) => item.ownerId === id);
        return row ? formatOwner(row) : id;
      }).join(', ');
    }
    if (field === 'costCenters') {
      const lookup = new Map(costCenterLookupRecords(rows).map((record) => [String(record.code), record.name]));
      return values.map((code) => lookup.get(String(code)) || code).join(', ');
    }
    return values.join(', ');
  };

  const filteredRows = useMemo(() => {
    const result = rows.filter((row) => {
      const f = appliedFilters;
      if (!fuzzyMultiMatch(row.tag, f.tag)) return false;
      if (f.companies.length && !f.companies.includes(row.companyCode)) return false;
      if (f.departments.length) {
        const selectedDepartmentNames = f.departments
          .map((code) => rows.find((item) => String(item.departmentCode) === String(code))?.department)
          .filter(Boolean);
        if (!selectedDepartmentNames.some((name) => row.department === name || String(row.department || '').startsWith(`${name}.`))) return false;
      }
      if (f.owners.length && !f.owners.includes(row.ownerId)) return false;
      if (!fuzzyMultiMatch(row.serialNumber, f.serialNumber)) return false;
      if (!fuzzyMultiMatch(row.assetDesc, f.assetDesc)) return false;
      if (f.categories.length) {
        const match = f.categories.some((value) => {
          if (value.startsWith('major:')) return row.majorCategory === value.slice(6);
          if (value.startsWith('minor:')) {
            const [major, minor] = value.slice(6).split('|');
            return row.majorCategory === major && row.minorCategory === minor;
          }
          return false;
        });
        if (!match) return false;
      }
      if (f.statuses.length && !f.statuses.includes(row.status)) return false;
      if (f.plates.length && !f.plates.includes(row.plate)) return false;
      if (f.costCenters.length && !f.costCenters.includes(costCenterCode(row.costCenter))) return false;
      if (f.purposes.length && !f.purposes.includes(row.purpose || '空')) return false;
      if (f.warehouses.length && !f.warehouses.includes(row.warehouse)) return false;
      if (f.assetTypes.length && !f.assetTypes.includes(row.assetType || '公司资产')) return false;
      if (!fuzzyMultiMatch(row.mainTag, f.mainTag)) return false;
      if (f.city && row.city !== f.city) return false;
      if (f.building && row.building !== f.building) return false;
      if (f.floors.length && !f.floors.includes(row.floor)) return false;
      if (f.addTypes.length && !f.addTypes.includes(row.addType)) return false;
      if (f.scrapTypes.length && !f.scrapTypes.includes(row.scrapInfo?.type || '')) return false;
      if (!fuzzyMultiMatch(row.poNo, f.poNo)) return false;
      if (f.purchaseDate.length === 2 && (isEmptyValue(row.purchaseDate) || row.purchaseDate < f.purchaseDate[0] || row.purchaseDate > f.purchaseDate[1])) return false;
      const hasOriginalValueMin = f.originalValueMin !== null && f.originalValueMin !== '';
      const hasOriginalValueMax = f.originalValueMax !== null && f.originalValueMax !== '';
      if ((hasOriginalValueMin || hasOriginalValueMax) && isEmptyValue(row.originalValue)) return false;
      if (hasOriginalValueMin && Number(row.originalValue) < Number(f.originalValueMin)) return false;
      if (hasOriginalValueMax && Number(row.originalValue) > Number(f.originalValueMax)) return false;
      if (f.brands.length && !f.brands.includes(row.brand)) return false;
      if (f.enabledDate.length === 2 && (isEmptyValue(row.enabledDate) || row.enabledDate < f.enabledDate[0] || row.enabledDate > f.enabledDate[1])) return false;
      if (!fuzzyMultiMatch(row.prNo, f.prNo)) return false;
      return true;
    });

    return [...result].sort((a, b) => (
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
      || String(a.tag || '').localeCompare(String(b.tag || ''), 'zh-CN', { numeric: true })
    ));
  }, [rows, appliedFilters]);

  const updateFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const handleQuery = () => {
    if (draftFilters.originalValueMin !== null && draftFilters.originalValueMax !== null
      && draftFilters.originalValueMin !== '' && draftFilters.originalValueMax !== ''
      && Number(draftFilters.originalValueMin) > Number(draftFilters.originalValueMax)) {
      messageApi.warning('原值最小金额不能大于最大金额');
      return;
    }
    setAppliedFilters(copyFilters(draftFilters));
    setSelectedRowKeys([]);
    setPage(1);
  };

  const handleReset = () => {
    const empty = copyFilters(EMPTY_FILTERS);
    setDraftFilters(empty);
    setAppliedFilters(empty);
    setSelectedRowKeys([]);
    setPage(1);
  };

  const handleCityFilterChange = (value) => {
    setDraftFilters((current) => ({ ...current, city: value || '', building: '' }));
  };

  const handleBuildingFilterChange = (value) => {
    if (!draftFilters.city) {
      messageApi.warning('请先选择城市！');
      return;
    }
    setDraftFilters((current) => ({ ...current, building: value || '' }));
  };

  const openAsset = (row, mode = 'view') => {
    setActiveAssetId(row.id);
    setAssetMode(mode);
    setActiveTab('detail');
    setEditDraft(mode === 'edit' ? { ...row } : null);
    setCollapsedSections({});
    setAssetOpen(true);
  };

  const closeAsset = () => {
    setAssetOpen(false);
    setAssetMode('view');
    setEditDraft(null);
    setCollapsedSections({});
  };

  const cancelEdit = () => {
    closeAsset();
  };

  const toggleSection = (key) => {
    setCollapsedSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const updateEdit = (field, value) => {
    setEditDraft((current) => {
      if (!current) return current;
      if (field === 'city') return { ...current, city: value || '', building: '' };
      return { ...current, [field]: value ?? '' };
    });
  };

  const saveAsset = () => {
    if (!activeAsset || !editDraft) return;
    if (!editDraft.costCenter) {
      messageApi.warning('请选择成本中心');
      return;
    }
    if (!editDraft.city) {
      messageApi.warning('请选择 City');
      return;
    }
    if (!editDraft.building) {
      messageApi.warning('请选择 Building');
      return;
    }
    if (!editDraft.status) {
      messageApi.warning('请选择资产状态');
      return;
    }
    if (!(BUILDING_BY_CITY[editDraft.city] || []).includes(editDraft.building)) {
      messageApi.error('当前 Building 与 City 关系无效');
      return;
    }
    if (editDraft.floor && !FLOOR_OPTIONS.includes(editDraft.floor)) {
      messageApi.error('当前 Floor 无效');
      return;
    }
    if (!uniqueValues(rows, 'costCenter').includes(editDraft.costCenter)) {
      messageApi.error('当前成本中心无效');
      return;
    }
    if (!STATUS_OPTIONS.includes(editDraft.status)) {
      messageApi.error('当前资产状态无效');
      return;
    }
    if (editDraft.assetMark && !ASSET_MARK_OPTIONS.includes(editDraft.assetMark)) {
      messageApi.error('当前资产标记无效');
      return;
    }
    if (editDraft.purpose && !PURPOSE_OPTIONS.includes(editDraft.purpose)) {
      messageApi.error('当前资产用途无效');
      return;
    }

    const serial = normalizeSerial(editDraft.serialNumber);
    if (Array.from(serial).length > 35) {
      messageApi.error('资产序列号最多 35 个字符');
      return;
    }
    if (Array.from(editDraft.remarks || '').length > 150 || Array.from(editDraft.usageDescription || '').length > 150) {
      messageApi.error('备注和使用说明最多 150 个字符');
      return;
    }
    if (serial && !isPlaceholderSerial(serial) && rows.some((row) => (
      row.id !== activeAsset.id
      && !isPlaceholderSerial(row.serialNumber)
      && normalizeSerial(row.serialNumber).toLowerCase() === serial.toLowerCase()
    ))) {
      messageApi.error('当前资产序列号不唯一！');
      return;
    }
    if (FORMAL_SCRAP_STATUSES.has(activeAsset.status) && editDraft.status !== activeAsset.status) {
      messageApi.error('已报废资产状态不允许通过资产维护修改');
      return;
    }
    if (!FORMAL_SCRAP_STATUSES.has(activeAsset.status) && FORMAL_SCRAP_STATUSES.has(editDraft.status)) {
      messageApi.error('报废状态必须通过资产报废功能处理');
      return;
    }

    const editableFields = ['costCenter', 'city', 'building', 'floor', 'status', 'serialNumber', 'remarks', 'assetMark', 'usageDescription', 'purpose'];
    const patch = editableFields.reduce((result, field) => ({ ...result, [field]: editDraft[field] ?? '' }), {});
    patch.serialNumber = serial;
    patch.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const changed = editableFields.some((field) => String(activeAsset[field] ?? '') !== String(patch[field] ?? ''));
    if (!changed) {
      messageApi.info('资产信息未发生变化');
      setAssetMode('view');
      setEditDraft(null);
      return;
    }

    let nextRows;
    try {
      nextRows = updateAssetMaintenanceRow(activeAsset.id, patch);
    } catch (error) {
      messageApi.error(error.message || '保存失败，请检查数据！');
      return;
    }
    setRows(nextRows);
    setSelectedRowKeys([]);
    setPage(1);
    setAssetMode('view');
    setEditDraft(null);
    messageApi.success('保存成功！');
  };

  const handleExport = () => {
    if (!filteredRows.length) {
      messageApi.warning('当前没有可导出的数据');
      return;
    }
    const selectedCount = selectedRowKeys.length;
    Modal.confirm({
      title: '导出确认',
      content: selectedCount ? '确定要导出选中的数据吗?' : '确定要导出列表中的数据吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const size = selectedCount || filteredRows.length;
        messageApi.success(`已生成导出资产卡片信息-${dayjs().format('YYYYMMDD')}.xlsx，共 ${size} 条（原型）`);
      },
    });
  };

  const handleBatchSave = () => {
    if (!batchFiles.length) {
      messageApi.warning('请先选择需要上传的 Excel 文件');
      return;
    }
    setBatchOpen(false);
    setBatchFiles([]);
    messageApi.success('修改成功！');
  };

  const renderLookup = (field, placeholder) => (
    <LookupInput
      value={lookupDisplay(field)}
      placeholder={placeholder}
      onOpen={() => setLookupKey(field)}
      onClear={() => updateFilter(field, [])}
    />
  );

  const renderBasicQuery = () => (
    <>
      <QueryItem label="资产标签号">
        <Input value={draftFilters.tag} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('tag', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="公司">{renderLookup('companies', '请选择公司')}</QueryItem>
      <QueryItem label="部门">{renderLookup('departments', '请选择部门')}</QueryItem>
      <QueryItem label="资产责任人">{renderLookup('owners', '请选择责任人')}</QueryItem>
      <QueryItem label="资产序列号">
        <Input value={draftFilters.serialNumber} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('serialNumber', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="资产说明">
        <Input value={draftFilters.assetDesc} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('assetDesc', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="资产类别">
        <TreeSelect
          treeData={categoryTree}
          treeCheckable
          showCheckedStrategy={TreeSelect.SHOW_CHILD}
          value={draftFilters.categories}
          allowClear
          placeholder="请选择资产类别"
          style={{ width: '100%' }}
          onChange={(value) => updateFilter('categories', value || [])}
        />
      </QueryItem>
      <QueryItem label="资产状态">
        <Select mode="multiple" value={draftFilters.statuses} allowClear placeholder="请选择" options={STATUS_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('statuses', value)} />
      </QueryItem>
      <QueryItem label="板块">
        <Select mode="multiple" value={draftFilters.plates} allowClear placeholder="请选择" options={PLATE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('plates', value)} />
      </QueryItem>
      <QueryItem label="成本中心">{renderLookup('costCenters', '请选择成本中心')}</QueryItem>
      <QueryItem label="资产用途">
        <Select mode="multiple" value={draftFilters.purposes} allowClear placeholder="请选择" options={[...PURPOSE_OPTIONS, '空'].map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('purposes', value)} />
      </QueryItem>
      <QueryItem label="仓库">
        <Select mode="multiple" value={draftFilters.warehouses} allowClear placeholder="请选择" options={uniqueValues(rows, 'warehouse').map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('warehouses', value)} />
      </QueryItem>
      <QueryItem label="资产类型">
        <Select mode="multiple" value={draftFilters.assetTypes} allowClear placeholder="请选择" options={ASSET_TYPE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('assetTypes', value)} />
      </QueryItem>
      <QueryItem label="主资产标签号">
        <Input value={draftFilters.mainTag} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('mainTag', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
    </>
  );

  const renderMoreQuery = () => (
    <>
      <QueryItem label="City">
        <Select value={draftFilters.city || undefined} allowClear placeholder="请选择" options={CITY_OPTIONS.map((value) => ({ label: value, value }))} onChange={handleCityFilterChange} />
      </QueryItem>
      <QueryItem label="Building">
        <Select
          value={draftFilters.building || undefined}
          allowClear
          placeholder={draftFilters.city ? '请选择' : '请先选择城市'}
          options={(BUILDING_BY_CITY[draftFilters.city] || []).map((value) => ({ label: value, value }))}
          onDropdownVisibleChange={(open) => { if (open && !draftFilters.city) messageApi.warning('请先选择城市！'); }}
          onChange={handleBuildingFilterChange}
        />
      </QueryItem>
      <QueryItem label="Floor">
        <Select
          mode="multiple"
          value={draftFilters.floors}
          allowClear
          placeholder="请选择"
          options={FLOOR_OPTIONS.map((value) => ({ label: value, value }))}
          onChange={(value) => updateFilter('floors', value)}
        />
      </QueryItem>
      <QueryItem label="新增类型">
        <Select mode="multiple" value={draftFilters.addTypes} allowClear placeholder="请选择" options={ADD_TYPE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('addTypes', value)} />
      </QueryItem>
      <QueryItem label="报废类型">
        <Select mode="multiple" value={draftFilters.scrapTypes} allowClear placeholder="请选择" options={SCRAP_TYPE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('scrapTypes', value)} />
      </QueryItem>
      <QueryItem label="PO单号">
        <Input value={draftFilters.poNo} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('poNo', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="购买日期">
        <RangePicker style={{ width: '100%' }} value={draftFilters.purchaseDate.length === 2 ? draftFilters.purchaseDate.map((value) => dayjs(value)) : null} onChange={(dates) => updateFilter('purchaseDate', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])} />
      </QueryItem>
      <QueryItem label="原值">
        <Space.Compact block>
          <InputNumber min={0} precision={2} placeholder="最小值" value={draftFilters.originalValueMin} onChange={(value) => updateFilter('originalValueMin', value)} style={{ width: '50%' }} />
          <InputNumber min={0} precision={2} placeholder="最大值" value={draftFilters.originalValueMax} onChange={(value) => updateFilter('originalValueMax', value)} style={{ width: '50%' }} />
        </Space.Compact>
      </QueryItem>
      <QueryItem label="品牌">{renderLookup('brands', '请选择品牌')}</QueryItem>
      <QueryItem label="启用日期">
        <RangePicker style={{ width: '100%' }} value={draftFilters.enabledDate.length === 2 ? draftFilters.enabledDate.map((value) => dayjs(value)) : null} onChange={(dates) => updateFilter('enabledDate', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])} />
      </QueryItem>
      <QueryItem label="PR单号">
        <Input value={draftFilters.prNo} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('prNo', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
    </>
  );

  const sortableColumn = (title, dataIndex, width, options = {}) => ({
    title,
    dataIndex,
    width,
    sorter: (a, b) => compareValue(a[dataIndex], b[dataIndex], options.number ? 'number' : 'text'),
    align: options.align,
    render: options.render || ((value) => displayText(value)),
  });

  const listColumns = [
    {
      ...sortableColumn('标签号', 'tag', 155),
      fixed: 'left',
      render: (value, row) => (
        <Button type="link" style={{ padding: 0, height: 'auto', userSelect: 'text' }} onClick={() => openAsset(row, 'view')}>{value}</Button>
      ),
    },
    sortableColumn('公司', 'company', 130),
    sortableColumn('板块', 'plate', 150),
    sortableColumn('资产大类', 'majorCategory', 160),
    sortableColumn('资产小类', 'minorCategory', 190),
    sortableColumn('资产说明', 'assetDesc', 220),
    sortableColumn('数量', 'quantity', 90, { number: true, align: 'right', render: count }),
    sortableColumn('原值', 'originalValue', 120, { number: true, align: 'right', render: amount }),
    sortableColumn('净值', 'netValue', 120, { number: true, align: 'right', render: amount }),
    {
      title: '资产责任人',
      dataIndex: 'ownerName',
      width: 170,
      sorter: (a, b) => formatOwner(a).localeCompare(formatOwner(b), 'zh-CN'),
      render: (_, row) => formatOwner(row),
    },
    sortableColumn('资产状态', 'status', 140, { render: (value) => <StatusTag value={value} type="business" /> }),
    sortableColumn('成本中心', 'costCenter', 180),
    sortableColumn('仓库', 'warehouse', 170),
    sortableColumn('启用日期', 'enabledDate', 120),
    sortableColumn('资产类型', 'assetType', 120),
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 72,
      align: 'center',
      render: (_, row) => <Button type="link" style={{ padding: 0 }} onClick={() => openAsset(row, 'edit')}>编辑</Button>,
    },
  ];

  const source = assetMode === 'edit' && editDraft ? editDraft : activeAsset;
  const editable = (field, control) => (assetMode === 'edit' ? control : displayText(source?.[field]));

  const detailTab = source ? (
    <Space direction="vertical" size={12} className="w-full">
      <AssetSection title="基础信息">
        <DetailGrid columns={3} labelWidth={104}>
          <DetailItem label="资产标签号">{displayText(source.tag)}</DetailItem>
          <DetailItem label="序列号">
            {editable('serialNumber', <Input value={editDraft?.serialNumber || ''} maxLength={35} allowClear onChange={(event) => updateEdit('serialNumber', event.target.value)} />)}
          </DetailItem>
          <DetailItem label="公司">{displayText(source.company)}</DetailItem>
          <DetailItem label="部门">{displayText(source.department)}</DetailItem>
          <DetailItem label="资产大类">{displayText(source.majorCategory)}</DetailItem>
          <DetailItem label="资产小类">{displayText(source.minorCategory)}</DetailItem>
          <DetailItem label="资产说明">{displayText(source.assetDesc)}</DetailItem>
          <DetailItem label="配置" span={2}>{displayText(source.config)}</DetailItem>
          <DetailItem label="数量">{count(source.quantity)}</DetailItem>
          <DetailItem label="单位">{displayText(source.unit)}</DetailItem>
          <DetailItem label="主资产标签号">{displayText(source.mainTag)}</DetailItem>
          <DetailItem label="仓库">{displayText(source.warehouse)}</DetailItem>
          <DetailItem label="原值">{amount(source.originalValue)}</DetailItem>
          <DetailItem label="新增类型">{displayText(source.addType)}</DetailItem>
          <DetailItem label="购买日期">{displayText(source.purchaseDate)}</DetailItem>
          <DetailItem label="启用日期">{displayText(source.enabledDate)}</DetailItem>
          <DetailItem label="资产状态">
            {assetMode === 'edit' && FORMAL_SCRAP_STATUSES.has(activeAsset?.status) ? displayText(source.status) : editable('status', (
              <Select
                value={editDraft?.status || undefined}
                style={{ width: '100%' }}
                options={EDITABLE_STATUS_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={(value) => updateEdit('status', value)}
              />
            ))}
          </DetailItem>
          <DetailItem label="资产标记">
            {editable('assetMark', <Select allowClear value={editDraft?.assetMark || undefined} style={{ width: '100%' }} options={ASSET_MARK_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateEdit('assetMark', value || '')} />)}
          </DetailItem>
          <DetailItem label="资产责任人">{formatOwner(source)}</DetailItem>
          <DetailItem label="用途">
            {editable('purpose', <Select allowClear value={editDraft?.purpose || undefined} style={{ width: '100%' }} options={PURPOSE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateEdit('purpose', value || '')} />)}
          </DetailItem>
          <DetailItem label="City">
            {editable('city', <Select value={editDraft?.city || undefined} style={{ width: '100%' }} options={CITY_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateEdit('city', value || '')} />)}
          </DetailItem>
          <DetailItem label="Building">
            {editable('building', (
              <Select
                value={editDraft?.building || undefined}
                style={{ width: '100%' }}
                placeholder={editDraft?.city ? '请选择' : '请先选择城市'}
                options={(BUILDING_BY_CITY[editDraft?.city] || []).map((value) => ({ label: value, value }))}
                onDropdownVisibleChange={(open) => { if (open && !editDraft?.city) messageApi.warning('请先选择城市！'); }}
                onChange={(value) => updateEdit('building', value || '')}
              />
            ))}
          </DetailItem>
          <DetailItem label="Floor">
            {editable('floor', (
              <Select
                allowClear
                value={editDraft?.floor || undefined}
                style={{ width: '100%' }}
                placeholder="请选择"
                options={FLOOR_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={(value) => updateEdit('floor', value || '')}
              />
            ))}
          </DetailItem>
          <DetailItem label="盘点标识">{displayText(source.inventoryFlag)}</DetailItem>
          <DetailItem label="ES实物报废期">{displayText(source.esScrapPeriod)}</DetailItem>
          <DetailItem label="升级日期">{displayText(source.upgradeDate)}</DetailItem>
          <DetailItem label="升级金额">{amount(source.upgradeAmount)}</DetailItem>
          <DetailItem label="PR单号">{displayText(source.prNo)}</DetailItem>
          <DetailItem label="申请单号">{displayText(source.applicationNo)}</DetailItem>
          <DetailItem label="入库单号">{displayText(source.inboundNo)}</DetailItem>
          <DetailItem label="PO单号">{displayText(source.poNo)}</DetailItem>
          <DetailSpacer />
          <DetailItem label="使用说明" span={3}>
            {editable('usageDescription', <TextArea value={editDraft?.usageDescription || ''} maxLength={150} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('usageDescription', event.target.value)} />)}
          </DetailItem>
          <DetailItem label="备注" span={3}>
            {editable('remarks', <TextArea value={editDraft?.remarks || ''} maxLength={150} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('remarks', event.target.value)} />)}
          </DetailItem>
        </DetailGrid>
      </AssetSection>

      <AssetSection title="账务信息" collapsible collapsed={Boolean(collapsedSections.accounting)} onToggle={() => toggleSection('accounting')}>
        <DetailGrid columns={3} labelWidth={104}>
          <DetailItem label="资产编号">{displayText(source.assetNo)}</DetailItem>
          <DetailItem label="成本中心">
            {editable('costCenter', (
              <Select
                showSearch
                value={editDraft?.costCenter || undefined}
                style={{ width: '100%' }}
                options={uniqueValues(rows, 'costCenter').map((value) => ({ label: value, value }))}
                onChange={(value) => updateEdit('costCenter', value || '')}
              />
            ))}
          </DetailItem>
          <DetailItem label="板块">{displayText(source.plate)}</DetailItem>
          <DetailItem label="内部费用账户">{displayText(source.internalFeeAccount)}</DetailItem>
          <DetailItem label="费用账户">{displayText(source.feeAccount)}</DetailItem>
        </DetailGrid>
      </AssetSection>

      <AssetSection title="NO 信息" collapsible collapsed={Boolean(collapsedSections.noInfo)} onToggle={() => toggleSection('noInfo')}>
        {source.isMachineRoom && (source.noLocation || source.service) ? (
          <DetailGrid columns={3} labelWidth={104}>
            <DetailItem label="NO位置">{displayText(source.noLocation)}</DetailItem>
            <DetailItem label="服务">{displayText(source.service)}</DetailItem>
          </DetailGrid>
        ) : <EmptyGroup>无 NO 信息</EmptyGroup>}
      </AssetSection>

      <AssetSection title="报废信息" collapsible collapsed={Boolean(collapsedSections.scrap)} onToggle={() => toggleSection('scrap')}>
        {source.scrapInfo ? (
          <DetailGrid columns={3} labelWidth={104}>
            <DetailItem label="报废原因">{displayText(source.scrapInfo.reason)}</DetailItem>
            <DetailItem label="报废日期">{displayText(source.scrapInfo.date)}</DetailItem>
            <DetailItem label="报废类型">{displayText(source.scrapInfo.type)}</DetailItem>
            <DetailItem label="是否处置">{displayText(source.scrapInfo.disposed)}</DetailItem>
            <DetailItem label="报废数量">{count(source.scrapInfo.quantity)}</DetailItem>
            <DetailItem label="ES实物报废期">{displayText(source.scrapInfo.esPeriod)}</DetailItem>
          </DetailGrid>
        ) : <EmptyGroup>无报废信息</EmptyGroup>}
      </AssetSection>

      <AssetSection title="耗材信息" collapsible collapsed={Boolean(collapsedSections.consumables)} onToggle={() => toggleSection('consumables')}>
        {(source.consumables || []).length ? (
          <Table
            rowKey="id"
            size="small"
            bordered
            pagination={false}
            dataSource={source.consumables}
            columns={[
              { title: '耗材标签号', dataIndex: 'tag' },
              { title: '耗材说明', dataIndex: 'desc' },
              { title: '启用日期', dataIndex: 'enabledDate', width: 130 },
            ]}
          />
        ) : <EmptyGroup>无耗材信息</EmptyGroup>}
      </AssetSection>

      <AssetSection title="部件信息" collapsible collapsed={Boolean(collapsedSections.parts)} onToggle={() => toggleSection('parts')}>
        {(source.parts || []).length ? (
          <Table
            rowKey="id"
            size="small"
            bordered
            pagination={false}
            dataSource={source.parts}
            columns={[
              { title: '部件名称/说明', dataIndex: 'name' },
              { title: '部件标签号', dataIndex: 'tag', width: 180 },
              { title: '部件SN号', dataIndex: 'sn', width: 180 },
            ]}
          />
        ) : <EmptyGroup>无部件信息</EmptyGroup>}
      </AssetSection>
    </Space>
  ) : null;

  const valueTab = source ? (
    <DetailGrid columns={3} labelWidth={112}>
      <DetailItem label="原值">{amount(source.originalValue)}</DetailItem>
      <DetailItem label="净值">{amount(source.netValue)}</DetailItem>
      <DetailItem label="EBS净值">{amount(source.ebsNetValue)}</DetailItem>
      <DetailItem label="EBS原值">{amount(source.ebsOriginalValue)}</DetailItem>
      <DetailItem label="折旧年限">{isEmptyValue(source.depreciationYears) ? '-' : `${source.depreciationYears} 年`}</DetailItem>
      <DetailItem label="折旧剩余月份">{source.remainingMonths === -1 || isEmptyValue(source.remainingMonths) ? '-' : `${source.remainingMonths} 个月`}</DetailItem>
      {source.isMachineRoom ? <DetailItem label="配置参考价值">{amount(source.configReferenceValue)}</DetailItem> : null}
    </DetailGrid>
  ) : null;

  const repairTab = source ? (
    <Table
      rowKey="id"
      size="small"
      bordered
      dataSource={source.repairRecords || []}
      pagination={false}
      locale={{ emptyText: '暂无资产维修记录' }}
      scroll={{ x: 1590 }}
      columns={[
        { title: '行号', width: 70, render: (_, __, index) => index + 1 },
        { title: '维修单号', dataIndex: 'workOrderNo', width: 170 },
        { title: '资产标签号', dataIndex: 'tag', width: 150 },
        { title: '申请人姓名', dataIndex: 'applicant', width: 150 },
        { title: '故障描述', dataIndex: 'fault', width: 220 },
        { title: '诊断人', dataIndex: 'diagnostician', width: 150 },
        { title: '诊断说明', dataIndex: 'diagnosis', width: 220 },
        { title: '维修状态', dataIndex: 'status', width: 120 },
        { title: '申请时间', dataIndex: 'applyTime', width: 170 },
        { title: '来源单据号', dataIndex: 'sourceNo', width: 170 },
      ]}
    />
  ) : null;

  const inventoryTab = source ? (
    <Table
      rowKey="id"
      size="small"
      bordered
      pagination={false}
      locale={{ emptyText: '暂无资产盘点历史' }}
      dataSource={[...(source.inventoryRecords || [])]
        .filter((record) => record.projectStatus === '盘点关闭')
        .sort((a, b) => (
          String(b.projectStartTime || '').localeCompare(String(a.projectStartTime || ''))
          || String(b.id || '').localeCompare(String(a.id || ''), 'zh-CN', { numeric: true })
        ))}
      scroll={{ x: 1230 }}
      columns={[
        { title: '盘点类型', dataIndex: 'type', width: 120 },
        { title: '盘点标识', dataIndex: 'flag', width: 110 },
        { title: '盘点项目名称', dataIndex: 'projectName', width: 220 },
        { title: '盘点状态', dataIndex: 'status', width: 120 },
        { title: '盘点时间', dataIndex: 'time', width: 170 },
        { title: '盘点说明', dataIndex: 'note', width: 200 },
        { title: '盘点执行人', dataIndex: 'executor', width: 150 },
        { title: '导入方式', dataIndex: 'importWay', width: 140 },
      ]}
    />
  ) : null;

  const transactionRows = source ? [...(source.transactionHistory || [])].sort((a, b) => (
    String(b.operationDate || '').localeCompare(String(a.operationDate || ''))
    || Number(b.sortSequence || 0) - Number(a.sortSequence || 0)
    || String(b.id || '').localeCompare(String(a.id || ''), 'zh-CN', { numeric: true })
  )) : [];
  const transactionTab = (
    <Table
      rowKey="id"
      size="small"
      bordered
      pagination={false}
      locale={{ emptyText: '暂无资产操作历史' }}
      dataSource={transactionRows}
      scroll={{ x: 3790 }}
      columns={TRANSACTION_COLUMNS.map(([title, dataIndex, width]) => ({
        title,
        dataIndex,
        width,
        render: (value) => (dataIndex === 'upgradeAmount' ? amount(value) : displayText(value)),
        onCell: (record, rowIndex) => {
          if (!CHANGE_COMPARE_FIELDS.has(dataIndex)) return {};
          const older = transactionRows[rowIndex + 1];
          if (!older) return {};
          const changed = String(record[dataIndex] ?? '') !== String(older[dataIndex] ?? '');
          return changed ? { style: { background: '#fffbe6' } } : {};
        },
      }))}
    />
  );

  const rfidTab = source ? (
    <Table
      rowKey="id"
      size="small"
      bordered
      pagination={false}
      locale={{ emptyText: '暂无 RFID 资产操作历史' }}
      dataSource={source.rfidHistory || []}
      scroll={{ x: 3680 }}
      columns={RFID_COLUMNS.map(([title, dataIndex, width]) => ({ title, dataIndex, width, render: displayText }))}
    />
  ) : null;

  const tabItems = [
    { key: 'detail', label: '详细信息', children: detailTab },
    { key: 'value', label: '价值信息', children: valueTab },
    { key: 'repair', label: '资产维修记录', children: repairTab },
    { key: 'inventory', label: '资产盘点历史', children: inventoryTab },
    { key: 'transaction', label: '资产操作历史', children: transactionTab },
    { key: 'rfid', label: 'RFID资产操作历史', children: rfidTab },
  ];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}

      <Typography.Title level={4} className="mb-0">资产维护</Typography.Title>

      <QueryBar
        onQuery={handleQuery}
        onReset={handleReset}
        buttons={(
          <>
            <Button type="primary" icon={<Search size={14} />} onClick={handleQuery}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button
              type="link"
              icon={moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              onClick={() => setMoreOpen((value) => !value)}
            >
              {moreOpen ? '收起' : '更多条件'}
            </Button>
          </>
        )}
      >
        {renderBasicQuery()}
        {moreOpen && renderMoreQuery()}
      </QueryBar>

      <Card
        size="small"
        title="资产列表"
        extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}
      >
        <div className="mb-3 flex justify-end">
          <Space>
            <Button icon={<FileSpreadsheet size={14} />} onClick={() => setBatchOpen(true)}>批量修改</Button>
            <Button icon={<Download size={14} />} onClick={() => messageApi.success('已发起下载：资产批量修改模板.xlsx')}>模板下载</Button>
            <Button icon={<Download size={14} />} onClick={handleExport}>导出</Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          size="small"
          bordered
          columns={listColumns}
          dataSource={filteredRows}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            fixed: true,
            columnTitle: '选择',
          }}
          onChange={(_, __, ___, extra) => {
            if (extra?.action === 'sort') setSelectedRowKeys([]);
          }}
          scroll={{ x: 2360 }}
          pagination={{
            current: page,
            pageSize,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPageSize !== pageSize ? 1 : nextPage);
              setPageSize(nextPageSize);
              setSelectedRowKeys([]);
            },
          }}
        />
      </Card>

      <SelectModal
        open={Boolean(lookupConfig)}
        title={lookupConfig?.title || ''}
        multiple
        rowKey="id"
        initialSelectedKeys={lookupInitialSelectedKeys}
        dataSource={lookupConfig?.values || []}
        searchFields={lookupConfig?.searchFields || []}
        columns={lookupConfig?.columns || []}
        onCancel={() => setLookupKey('')}
        onConfirm={(records) => {
          const field = lookupKey;
          const valueField = lookupConfig?.valueField || 'name';
          updateFilter(field, records.map((record) => record[valueField]));
          setLookupKey('');
        }}
      />

      <Modal
        title={`资产卡片信息${source?.tag ? `：${source.tag}` : ''}`}
        open={assetOpen}
        width={960}
        style={{ maxWidth: 'calc(100vw - 48px)' }}
        styles={{ body: { maxHeight: '68vh', overflowY: 'auto' } }}
        footer={assetMode === 'edit' ? [
          <Button key="cancel" onClick={cancelEdit}>取消</Button>,
          <Button key="save" type="primary" onClick={saveAsset}>保存</Button>,
        ] : null}
        onCancel={closeAsset}
        destroyOnHidden
      >
        {assetMode === 'edit' ? detailTab : <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />}
      </Modal>

      <Modal
        title="资产批量修改"
        open={batchOpen}
        width={720}
        okText="确定"
        cancelText="取消"
        onOk={handleBatchSave}
        onCancel={() => {
          setBatchOpen(false);
          setBatchFiles([]);
        }}
      >
        <Space direction="vertical" size={16} className="w-full">
          <Alert
            type="warning"
            showIcon
            message="批量修改采用覆盖式更新"
            description="任一行校验失败时，本次文件全部不保存。"
          />
          <div className="text-sm text-gray-600">
            <Typography.Text strong>批量修改规则：</Typography.Text>
            <ul className="mb-0 mt-2 list-disc space-y-1 pl-5">
              <li>资产标签号、成本中心、City、Building、资产状态为必填，任一必填单元格为空时整批校验失败。</li>
              <li>成本中心按“编码.名称”填写并按编码识别；City、Building、Floor 按名称填写。</li>
              <li>资产标签号、资产序列号按文本处理，避免科学计数法或前导零丢失。</li>
              <li>Floor、资产序列号、备注、资产标记、使用说明、资产用途为空时会将原字段覆盖为空。</li>
            </ul>
          </div>
          <Button
            icon={<Download size={14} />}
            onClick={() => messageApi.success('已发起下载：资产批量修改模板.xlsx（原型）')}
          >
            下载模板
          </Button>
          <Dragger
            accept=".xlsx"
            maxCount={1}
            beforeUpload={() => false}
            fileList={batchFiles}
            onChange={({ fileList }) => setBatchFiles(fileList.slice(-1))}
          >
            <p className="ant-upload-drag-icon"><UploadCloud size={36} /></p>
            <p className="ant-upload-text">点击或拖拽 Excel 文件到此区域上传</p>
            <p className="ant-upload-hint">仅支持资产批量修改模板 .xlsx 文件</p>
          </Dragger>
        </Space>
      </Modal>
    </Space>
  );
}