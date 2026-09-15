import React, { useMemo, useRef, useState } from 'react';
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
  Edit3,
  FileSpreadsheet,
  Search,
  UploadCloud,
} from 'lucide-react';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import QueryBar, { QueryItem } from '../../components/QueryBar';
import SelectModal from '../../components/SelectModal';
import StatusTag from '../../components/StatusTag';
import {
  getConsumableMaintenanceRows,
  updateConsumableMaintenanceRow,
} from '../../services/assetManagementService';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Dragger } = Upload;

const STATUS_OPTIONS = ['在用', '在库', '维修', '借用中', '待处理', '再利用', '已报废'];
const FORMAL_SCRAP_STATUSES = new Set(['已报废']);
const EDITABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter((item) => !FORMAL_SCRAP_STATUSES.has(item));
const ADD_TYPE_OPTIONS = ['采购新增', '历史新增', '收购新增', '赠与新增', '再利用新增', '转移新增'];
const PLATE_OPTIONS = [
  '11.搜狐网-web', '12.搜狐网-mobile', '13.汽车', '14.无线', '15.焦点', '16.视频', '17.Corporate',
  '51.焦点 Corporate', '52.房产', '53.家居', '54.二手房',
];
const CITY_OPTIONS = ['北京', '上海', '广州', '天津'];
const BUILDING_BY_CITY = {
  北京: ['搜狐媒体大厦', '北京亦庄数据中心'],
  上海: ['上海新媒体办公区'],
  广州: ['广州新媒体办公区'],
  天津: ['天津飞狐办公区'],
};
const FLOOR_BY_BUILDING = {
  搜狐媒体大厦: ['B1', '8F', '10F', '12F', '15F', '18F'],
  北京亦庄数据中心: ['1F', '2F', '3F'],
  上海新媒体办公区: ['8F', '9F'],
  广州新媒体办公区: ['6F', '7F'],
  天津飞狐办公区: ['5F'],
};
const WAREHOUSES_BY_COMPANY = {
  新媒体: ['WH001.北京耗材仓', 'WH002.上海耗材仓', 'WH003.广州耗材仓'],
  天津飞狐: ['WH004.天津耗材仓'],
};
const MAIN_ASSET_OPTIONS = [
  { id: 'main-1', tag: '114111700922', desc: '服务器.Dell PowerEdge R740', ownerId: '203938', status: '在用' },
  { id: 'main-2', tag: '114121700944', desc: '服务器.HPE ProLiant DL380 Gen10', ownerId: 'SOHU01', status: '在用' },
  { id: 'main-3', tag: '114111700955', desc: '台式机.Dell OptiPlex 7090', ownerId: '220687', status: '在用' },
  { id: 'main-4', tag: '114111700966', desc: '台式机.历史报废主资产', ownerId: '220687', status: '已报废' },
];

const EMPTY_FILTERS = {
  tag: '',
  companies: [],
  department: '',
  owners: [],
  mainTag: '',
  assetDesc: '',
  category: '',
  statuses: [],
  plate: '',
  poNo: '',
  warehouses: [],
  city: '',
  building: '',
  floor: '',
  addType: '',
  costCenter: '',
  purchaseDate: [],
  originalValueMin: null,
  originalValueMax: null,
  enabledDate: [],
  prNo: '',
};

const BATCH_TEMPLATE_FIELDS = [
  '耗材标签号', '公司', '板块', 'City', 'Building', 'Floor', '耗材说明',
  '主资产标签号', '数量', '耗材责任人工号', '耗材状态', '仓库', '启用日期',
];

const EDITABLE_FIELDS = [
  'company', 'serialNumber', 'status', 'ownerId', 'ownerName', 'city', 'building', 'floor',
  'enabledDate', 'mainTag', 'mainAssetDesc', 'warehouse', 'usageDescription', 'remarks',
];

const TRANSACTION_COLUMNS = [
  ['操作类型', 'operationType', 130],
  ['操作时间', 'operationDate', 160],
  ['操作人', 'operator', 140],
  ['单据编号', 'documentNo', 150],
  ['申请单号', 'applicationNo', 150],
  ['耗材标签号', 'tag', 150],
  ['序列号', 'serialNumber', 160],
  ['类别', 'category', 200],
  ['耗材说明', 'assetDesc', 220],
  ['责任人', 'owner', 170],
  ['公司', 'company', 160],
  ['地点', 'location', 220],
  ['耗材状态', 'status', 130],
  ['使用说明', 'usageDescription', 220],
  ['备注', 'remarks', 220],
  ['主资产标签号', 'mainTag', 160],
];
const CHANGE_COMPARE_FIELDS = new Set([
  'serialNumber', 'owner', 'company', 'location', 'status', 'usageDescription', 'remarks', 'mainTag',
]);

const BATCH_ERROR_COLUMNS = [
  { title: '行号', dataIndex: 'rowNo', width: 80, align: 'center' },
  { title: '耗材标签号', dataIndex: 'tag', width: 150 },
  { title: '失败原因', dataIndex: 'reason' },
];

function displayText(value) {
  return value === undefined || value === null || value === '' ? '-' : value;
}

function amount(value) {
  if (value === undefined || value === null || value === '' || value === '-') return '-';
  const number = Number(value);
  if (Number.isNaN(number)) return displayText(value);
  return number.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function count(value) {
  const number = Number(value || 0);
  return Number.isNaN(number) ? displayText(value) : number.toLocaleString('zh-CN');
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
  return [...new Set(rows.map((row) => row[field]).filter((value) => value && value !== '-'))];
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

function compareValue(a, b, type) {
  if (type === 'number') return Number(a || 0) - Number(b || 0);
  return String(a ?? '').localeCompare(String(b ?? ''), 'zh-CN', { numeric: true });
}

function LookupInput({ value, placeholder, onOpen, onDoubleClick }) {
  const clickTimerRef = useRef(null);
  const handleClick = () => {
    if (!onDoubleClick) {
      onOpen?.();
      return;
    }
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      onOpen?.();
    }, 220);
  };
  const handleDoubleClick = (event) => {
    if (!onDoubleClick) return;
    event.preventDefault();
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    onDoubleClick();
  };

  return (
    <Input
      value={value}
      readOnly
      placeholder={placeholder}
      suffix={<Search size={14} className="text-[#1677ff]" />}
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    />
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

function QueryClearArea({ onClear, children }) {
  return <div onDoubleClick={onClear}>{children}</div>;
}

function buildPrototypeBatchValidation(file) {
  const name = String(file?.name || '');
  if (/校验失败|invalid/i.test(name)) {
    return {
      status: 'failed',
      errors: [
        { id: 'batch-error-1', rowNo: 3, tag: 'QT-254523', reason: '板块与系统当前卡片值不一致' },
        { id: 'batch-error-2', rowNo: 5, tag: 'QT-244520', reason: 'Building 不属于当前 City' },
      ],
    };
  }
  return { status: 'passed', errors: [] };
}

export default function ConsumableMaintenancePage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(() => getConsumableMaintenanceRows());
  const [draftFilters, setDraftFilters] = useState(copyFilters(EMPTY_FILTERS));
  const [appliedFilters, setAppliedFilters] = useState(copyFilters(EMPTY_FILTERS));
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lookupKey, setLookupKey] = useState('');
  const [cardOpen, setCardOpen] = useState(false);
  const [cardMode, setCardMode] = useState('view');
  const [activeConsumableId, setActiveConsumableId] = useState('');
  const [activeTab, setActiveTab] = useState('detail');
  const [editDraft, setEditDraft] = useState(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchValidation, setBatchValidation] = useState(null);

  const activeConsumable = useMemo(
    () => rows.find((row) => row.id === activeConsumableId) || null,
    [rows, activeConsumableId],
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
    const companies = uniqueValues(rows, 'company').map((name, index) => ({
      id: `company-${index}`,
      code: rows.find((row) => row.company === name)?.companyCode || '',
      name,
    }));
    const owners = [...new Map(rows.map((row) => [row.ownerId, {
      id: row.ownerId,
      code: row.ownerId,
      name: row.ownerName,
      department: row.department,
    }])).values()];
    const mainAssets = MAIN_ASSET_OPTIONS.filter((item) => (
      item.status !== '已报废' && item.ownerId === editDraft?.ownerId
    ));
    const configs = {
      companies: {
        title: '选择公司', multiple: true, values: companies, valueField: 'name',
        searchFields: [{ name: 'code', label: '公司编码', dataIndex: 'code' }, { name: 'name', label: '公司名称', dataIndex: 'name' }],
        columns: [{ title: '公司编码', dataIndex: 'code' }, { title: '公司名称', dataIndex: 'name' }],
      },
      department: {
        title: '选择部门', multiple: false, valueField: 'name',
        values: uniqueValues(rows, 'department').map((name, index) => ({
          id: `department-${index}`,
          code: rows.find((row) => row.department === name)?.departmentCode || '',
          name,
          parent: rows.find((row) => row.department === name)?.parentDepartment || '-',
        })),
        searchFields: [{ name: 'code', label: '部门编码', dataIndex: 'code' }, { name: 'name', label: '部门名称', dataIndex: 'name' }],
        columns: [{ title: '部门编码', dataIndex: 'code' }, { title: '部门名称', dataIndex: 'name' }, { title: '上级部门', dataIndex: 'parent' }],
      },
      owners: {
        title: '选择耗材责任人', multiple: true, values: owners, valueField: 'code',
        searchFields: [{ name: 'code', label: '员工编号', dataIndex: 'code' }, { name: 'name', label: '员工姓名', dataIndex: 'name' }, { name: 'department', label: '部门', dataIndex: 'department' }],
        columns: [{ title: '员工编号', dataIndex: 'code' }, { title: '员工姓名', dataIndex: 'name' }, { title: '部门', dataIndex: 'department' }],
      },
      warehouses: {
        title: '选择仓库', multiple: true, valueField: 'name',
        values: uniqueValues(rows, 'warehouse').map((name, index) => ({
          id: `warehouse-${index}`,
          name,
          company: rows.find((row) => row.warehouse === name)?.company || '',
        })),
        searchFields: [{ name: 'name', label: '仓库', dataIndex: 'name' }, { name: 'company', label: '公司', dataIndex: 'company' }],
        columns: [{ title: '仓库', dataIndex: 'name' }, { title: '公司', dataIndex: 'company' }],
      },
      costCenter: {
        title: '选择成本中心', multiple: false, valueField: 'name',
        values: uniqueValues(rows, 'costCenter').map((name, index) => ({ id: `cc-${index}`, name })),
        searchFields: [{ name: 'name', label: '成本中心', dataIndex: 'name' }],
        columns: [{ title: '成本中心', dataIndex: 'name' }],
      },
      editCompany: {
        title: '选择公司', multiple: false, values: companies, valueField: 'name',
        searchFields: [{ name: 'code', label: '公司编码', dataIndex: 'code' }, { name: 'name', label: '公司名称', dataIndex: 'name' }],
        columns: [{ title: '公司编码', dataIndex: 'code' }, { title: '公司名称', dataIndex: 'name' }],
      },
      editOwner: {
        title: '选择耗材责任人', multiple: false, values: owners, valueField: 'code',
        searchFields: [{ name: 'code', label: '员工编号', dataIndex: 'code' }, { name: 'name', label: '员工姓名', dataIndex: 'name' }, { name: 'department', label: '部门', dataIndex: 'department' }],
        columns: [{ title: '员工编号', dataIndex: 'code' }, { title: '员工姓名', dataIndex: 'name' }, { title: '部门', dataIndex: 'department' }],
      },
      editMainAsset: {
        title: '选择主资产', multiple: false, values: mainAssets, valueField: 'tag',
        searchFields: [{ name: 'tag', label: '资产标签号', dataIndex: 'tag' }, { name: 'desc', label: '资产说明', dataIndex: 'desc' }],
        columns: [{ title: '资产标签号', dataIndex: 'tag' }, { title: '资产说明', dataIndex: 'desc' }],
      },
    };
    return configs[lookupKey] || null;
  }, [lookupKey, rows, editDraft]);

  const lookupInitialSelectedKeys = useMemo(() => {
    if (!lookupConfig || !lookupKey) return [];
    const valueField = lookupConfig.valueField || 'name';
    let selectedValues = [];
    if (['companies', 'owners', 'warehouses'].includes(lookupKey)) {
      selectedValues = draftFilters[lookupKey] || [];
    } else if (['department', 'costCenter'].includes(lookupKey)) {
      selectedValues = draftFilters[lookupKey] ? [draftFilters[lookupKey]] : [];
    } else if (lookupKey === 'editCompany') {
      selectedValues = editDraft?.company ? [editDraft.company] : [];
    } else if (lookupKey === 'editOwner') {
      selectedValues = editDraft?.ownerId ? [editDraft.ownerId] : [];
    } else if (lookupKey === 'editMainAsset') {
      selectedValues = editDraft?.mainTag ? [editDraft.mainTag] : [];
    }
    const selectedSet = new Set(selectedValues.map(String));
    return lookupConfig.values
      .filter((record) => selectedSet.has(String(record[valueField])))
      .map((record) => String(record.id));
  }, [lookupConfig, lookupKey, draftFilters, editDraft]);

  const lookupDisplay = (field) => {
    const value = draftFilters[field];
    if (!Array.isArray(value)) return value || '';
    if (!value.length) return '';
    if (field === 'owners') {
      return value.map((id) => {
        const row = rows.find((item) => item.ownerId === id);
        return row ? `${row.ownerId}-${row.ownerName}` : id;
      }).join(', ');
    }
    return value.join(', ');
  };

  const filteredRows = useMemo(() => {
    const result = rows.filter((row) => {
      const f = appliedFilters;
      if (!fuzzyMultiMatch(row.tag, f.tag)) return false;
      if (f.companies.length && !f.companies.includes(row.company)) return false;
      if (f.department && row.department !== f.department) return false;
      if (f.owners.length && !f.owners.includes(row.ownerId)) return false;
      if (!fuzzyMultiMatch(row.mainTag, f.mainTag)) return false;
      if (!fuzzyMultiMatch(row.assetDesc, f.assetDesc)) return false;
      if (f.category?.startsWith('major:') && row.majorCategory !== f.category.slice(6)) return false;
      if (f.category?.startsWith('minor:')) {
        const [major, minor] = f.category.slice(6).split('|');
        if (row.majorCategory !== major || row.minorCategory !== minor) return false;
      }
      if (f.statuses.length && !f.statuses.includes(row.status)) return false;
      if (f.plate && row.plate !== f.plate) return false;
      if (!fuzzyMultiMatch(row.poNo, f.poNo)) return false;
      if (f.warehouses.length && !f.warehouses.includes(row.warehouse)) return false;
      if (f.city && row.city !== f.city) return false;
      if (f.building && row.building !== f.building) return false;
      if (f.floor && row.floor !== f.floor) return false;
      if (f.addType && row.addType !== f.addType) return false;
      if (f.costCenter && row.costCenter !== f.costCenter) return false;
      if (f.purchaseDate.length === 2 && (row.purchaseDate < f.purchaseDate[0] || row.purchaseDate > f.purchaseDate[1])) return false;
      if (f.originalValueMin !== null && f.originalValueMin !== '' && Number(row.originalValue || 0) < Number(f.originalValueMin)) return false;
      if (f.originalValueMax !== null && f.originalValueMax !== '' && Number(row.originalValue || 0) > Number(f.originalValueMax)) return false;
      if (f.enabledDate.length === 2 && (row.enabledDate < f.enabledDate[0] || row.enabledDate > f.enabledDate[1])) return false;
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
    if (
      draftFilters.originalValueMin !== null
      && draftFilters.originalValueMax !== null
      && draftFilters.originalValueMin !== ''
      && draftFilters.originalValueMax !== ''
      && Number(draftFilters.originalValueMin) > Number(draftFilters.originalValueMax)
    ) {
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
    setDraftFilters((current) => ({ ...current, city: value || '', building: '', floor: '' }));
  };

  const handleBuildingFilterChange = (value) => {
    if (!draftFilters.city) {
      messageApi.warning('请先选择城市！');
      return;
    }
    setDraftFilters((current) => ({ ...current, building: value || '', floor: '' }));
  };

  const openCard = (row, mode = 'view') => {
    setActiveConsumableId(row.id);
    setCardMode(mode);
    setActiveTab('detail');
    setEditDraft(mode === 'edit' ? { ...row } : null);
    setCardOpen(true);
  };

  const closeCard = () => {
    setCardOpen(false);
    setCardMode('view');
    setEditDraft(null);
    setLookupKey('');
  };

  const cancelEdit = () => {
    setCardMode('view');
    setEditDraft(null);
    setLookupKey('');
  };

  const handleEditSelected = () => {
    if (!selectedRowKeys.length) {
      messageApi.warning('请选中要编辑的数据！');
      return;
    }
    if (selectedRowKeys.length > 1) {
      messageApi.warning('只能选中一条要编辑的数据！');
      return;
    }
    const row = rows.find((item) => item.id === selectedRowKeys[0]);
    if (row) openCard(row, 'edit');
  };

  const updateEdit = (field, value) => {
    setEditDraft((current) => {
      if (!current) return current;
      if (field === 'company') {
        const warehouses = WAREHOUSES_BY_COMPANY[value] || [];
        return {
          ...current,
          company: value || '',
          warehouse: warehouses.includes(current.warehouse) ? current.warehouse : '',
        };
      }
      if (field === 'city') return { ...current, city: value || '', building: '', floor: '' };
      if (field === 'building') return { ...current, building: value || '', floor: '' };
      return { ...current, [field]: value ?? '' };
    });
  };

  const openMainAssetLookup = () => {
    if (!editDraft?.ownerId) {
      messageApi.warning('请选择责任人！');
      return;
    }
    setLookupKey('editMainAsset');
  };

  const clearMainAsset = () => {
    setEditDraft((current) => current ? { ...current, mainTag: '', mainAssetDesc: '' } : current);
  };

  const saveConsumable = () => {
    if (!activeConsumable || !editDraft) return;
    if (!editDraft.company) {
      messageApi.warning('公司不能为空');
      return;
    }
    if (!editDraft.ownerId) {
      messageApi.warning('责任人不能为空');
      return;
    }
    if (!editDraft.city) {
      messageApi.warning('City不能为空');
      return;
    }
    if (!editDraft.building) {
      messageApi.warning('Building不能为空');
      return;
    }
    if (!(BUILDING_BY_CITY[editDraft.city] || []).includes(editDraft.building)) {
      messageApi.error('当前 Building 与 City 关系无效');
      return;
    }
    if (editDraft.floor && !(FLOOR_BY_BUILDING[editDraft.building] || []).includes(editDraft.floor)) {
      messageApi.error('当前 Floor 与 Building 关系无效');
      return;
    }
    if (!STATUS_OPTIONS.includes(editDraft.status)) {
      messageApi.error('当前耗材状态无效');
      return;
    }
    if (FORMAL_SCRAP_STATUSES.has(activeConsumable.status) && editDraft.status !== activeConsumable.status) {
      messageApi.error('已报废耗材状态不允许通过耗材维护修改');
      return;
    }
    if (!FORMAL_SCRAP_STATUSES.has(activeConsumable.status) && FORMAL_SCRAP_STATUSES.has(editDraft.status)) {
      messageApi.error('资产状态为报废请走报废功能处理');
      return;
    }
    if (editDraft.mainTag && editDraft.mainTag === editDraft.tag) {
      messageApi.error('主资产标签号不得关联自身');
      return;
    }
    if (editDraft.warehouse && !(WAREHOUSES_BY_COMPANY[editDraft.company] || []).includes(editDraft.warehouse)
      && !(editDraft.company === activeConsumable.company && editDraft.warehouse === activeConsumable.warehouse)) {
      messageApi.error('当前仓库不属于所选公司');
      return;
    }

    const serial = normalizeSerial(editDraft.serialNumber);
    if (serial.length > 120) {
      messageApi.error('序列号最多120字');
      return;
    }
    if (serial && !isPlaceholderSerial(serial) && rows.some((row) => (
      row.id !== activeConsumable.id
      && !isPlaceholderSerial(row.serialNumber)
      && normalizeSerial(row.serialNumber).toLowerCase() === serial.toLowerCase()
    ))) {
      messageApi.error('序列号不唯一');
      return;
    }

    const patch = EDITABLE_FIELDS.reduce((result, field) => ({ ...result, [field]: editDraft[field] ?? '' }), {});
    patch.serialNumber = serial;
    patch.enabledDate = patch.enabledDate || activeConsumable.enabledDate || '';
    const changed = EDITABLE_FIELDS.some((field) => String(activeConsumable[field] ?? '') !== String(patch[field] ?? ''));
    if (!changed) {
      messageApi.info('耗材信息未发生变化');
      return;
    }

    try {
      const nextRows = updateConsumableMaintenanceRow(activeConsumable.id, patch);
      const saved = nextRows.find((row) => row.id === activeConsumable.id);
      setRows(nextRows);
      setSelectedRowKeys([]);
      setPage(1);
      setCardMode('edit');
      setEditDraft(saved ? { ...saved } : { ...editDraft });
      messageApi.success('保存成功！');
    } catch (error) {
      messageApi.error(error.message || '保存失败');
    }
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
        messageApi.success(`已生成导出耗材卡片信息-${dayjs().format('YYYYMMDD')}.xlsx，共 ${size} 条（原型）`);
      },
    });
  };

  const handleTemplateDownload = () => {
    messageApi.success(`已发起下载：耗材批量修改模板.xlsx（${BATCH_TEMPLATE_FIELDS.length}列，原型）`);
  };

  const resetBatchState = () => {
    setBatchFiles([]);
    setBatchValidation(null);
  };

  const handleBatchAction = () => {
    if (!batchFiles.length) {
      messageApi.warning('请先选择需要上传的 Excel 文件');
      return;
    }

    if (batchValidation?.status === 'passed') {
      setRows(getConsumableMaintenanceRows());
      setBatchOpen(false);
      resetBatchState();
      messageApi.success('校验及保存流程演示完成（原型未解析实际 Excel 数据）');
      return;
    }

    const result = buildPrototypeBatchValidation(batchFiles[0]);
    setBatchValidation(result);
    if (result.status === 'failed') {
      messageApi.error('文件校验失败，本次文件未保存');
    } else {
      messageApi.success('文件校验通过，请确认保存');
    }
  };

  const renderLookup = (field, placeholder) => (
    <LookupInput
      value={lookupDisplay(field)}
      placeholder={placeholder}
      onOpen={() => setLookupKey(field)}
      onDoubleClick={() => updateFilter(field, Array.isArray(draftFilters[field]) ? [] : '')}
    />
  );

  const renderBasicQuery = () => (
    <>
      <QueryItem label="耗材标签号">
        <Input value={draftFilters.tag} allowClear placeholder="支持模糊匹配" onChange={(event) => updateFilter('tag', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('tag', '')} />
      </QueryItem>
      <QueryItem label="公司">{renderLookup('companies', '请选择公司')}</QueryItem>
      <QueryItem label="部门">{renderLookup('department', '请选择部门')}</QueryItem>
      <QueryItem label="耗材责任人">{renderLookup('owners', '请选择责任人')}</QueryItem>
      <QueryItem label="主资产标签号">
        <Input value={draftFilters.mainTag} allowClear placeholder="支持模糊匹配" onChange={(event) => updateFilter('mainTag', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('mainTag', '')} />
      </QueryItem>
      <QueryItem label="耗材说明">
        <Input value={draftFilters.assetDesc} allowClear placeholder="支持模糊匹配" onChange={(event) => updateFilter('assetDesc', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('assetDesc', '')} />
      </QueryItem>
      <QueryItem label="耗材类别">
        <QueryClearArea onClear={() => updateFilter('category', '')}>
          <TreeSelect treeData={categoryTree} value={draftFilters.category || undefined} allowClear placeholder="请选择耗材类别" style={{ width: '100%' }} onChange={(value) => updateFilter('category', value || '')} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="耗材状态">
        <QueryClearArea onClear={() => updateFilter('statuses', [])}>
          <Select mode="multiple" value={draftFilters.statuses} allowClear placeholder="请选择" options={STATUS_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('statuses', value)} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="板块">
        <QueryClearArea onClear={() => updateFilter('plate', '')}>
          <Select value={draftFilters.plate || undefined} allowClear placeholder="请选择" options={PLATE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('plate', value || '')} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="PO单号">
        <Input value={draftFilters.poNo} allowClear placeholder="支持模糊检索" onChange={(event) => updateFilter('poNo', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('poNo', '')} />
      </QueryItem>
      <QueryItem label="仓库">{renderLookup('warehouses', '请选择仓库')}</QueryItem>
    </>
  );

  const renderMoreQuery = () => (
    <>
      <QueryItem label="City">
        <QueryClearArea onClear={() => handleCityFilterChange('')}>
          <Select value={draftFilters.city || undefined} allowClear placeholder="请选择" options={CITY_OPTIONS.map((value) => ({ label: value, value }))} onChange={handleCityFilterChange} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="Building">
        <QueryClearArea onClear={() => handleBuildingFilterChange('')}>
          <Select
            value={draftFilters.building || undefined}
            allowClear
            placeholder={draftFilters.city ? '请选择' : '请先选择城市'}
            options={(BUILDING_BY_CITY[draftFilters.city] || []).map((value) => ({ label: value, value }))}
            onOpenChange={(open) => { if (open && !draftFilters.city) messageApi.warning('请先选择城市！'); }}
            onChange={handleBuildingFilterChange}
          />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="Floor">
        <QueryClearArea onClear={() => updateFilter('floor', '')}>
          <Select value={draftFilters.floor || undefined} allowClear disabled={!draftFilters.building} placeholder="请选择" options={(FLOOR_BY_BUILDING[draftFilters.building] || []).map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('floor', value || '')} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="新增类型">
        <QueryClearArea onClear={() => updateFilter('addType', '')}>
          <Select value={draftFilters.addType || undefined} allowClear placeholder="请选择" options={ADD_TYPE_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('addType', value || '')} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="成本中心">{renderLookup('costCenter', '请选择成本中心')}</QueryItem>
      <QueryItem label="购置日期">
        <QueryClearArea onClear={() => updateFilter('purchaseDate', [])}>
          <RangePicker style={{ width: '100%' }} value={draftFilters.purchaseDate.length === 2 ? draftFilters.purchaseDate.map((value) => dayjs(value)) : null} onChange={(dates) => updateFilter('purchaseDate', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="原值">
        <QueryClearArea onClear={() => setDraftFilters((current) => ({ ...current, originalValueMin: null, originalValueMax: null }))}>
          <Space.Compact block>
            <InputNumber min={0} precision={2} placeholder="最小值" value={draftFilters.originalValueMin} onChange={(value) => updateFilter('originalValueMin', value)} style={{ width: '50%' }} />
            <InputNumber min={0} precision={2} placeholder="最大值" value={draftFilters.originalValueMax} onChange={(value) => updateFilter('originalValueMax', value)} style={{ width: '50%' }} />
          </Space.Compact>
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="启用日期">
        <QueryClearArea onClear={() => updateFilter('enabledDate', [])}>
          <RangePicker style={{ width: '100%' }} value={draftFilters.enabledDate.length === 2 ? draftFilters.enabledDate.map((value) => dayjs(value)) : null} onChange={(dates) => updateFilter('enabledDate', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="PR单号">
        <Input value={draftFilters.prNo} allowClear placeholder="支持模糊检索" onChange={(event) => updateFilter('prNo', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('prNo', '')} />
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
      ...sortableColumn('耗材标签号', 'tag', 155),
      fixed: 'left',
      render: (value, row) => (
        <Button type="link" style={{ padding: 0, height: 'auto', userSelect: 'text' }} onClick={() => openCard(row, 'view')}>{value}</Button>
      ),
    },
    sortableColumn('公司', 'company', 130),
    sortableColumn('板块', 'plate', 150),
    sortableColumn('耗材大类', 'majorCategory', 160),
    sortableColumn('耗材小类', 'minorCategory', 180),
    sortableColumn('耗材说明', 'assetDesc', 260),
    sortableColumn('主资产标签号', 'mainTag', 160),
    sortableColumn('数量', 'quantity', 90, { number: true, align: 'right', render: count }),
    sortableColumn('原值', 'originalValue', 120, { number: true, align: 'right', render: amount }),
    sortableColumn('净值', 'netValue', 120, { number: true, align: 'right', render: amount }),
    {
      title: '耗材责任人',
      dataIndex: 'ownerName',
      width: 180,
      sorter: (a, b) => `${a.ownerId}.${a.ownerName}`.localeCompare(`${b.ownerId}.${b.ownerName}`, 'zh-CN'),
      render: (_, row) => `${row.ownerId}.${row.ownerName}`,
    },
    sortableColumn('耗材状态', 'status', 130, { render: (value) => <StatusTag value={value} type="business" /> }),
    sortableColumn('成本中心', 'costCenter', 180),
    sortableColumn('仓库', 'warehouse', 180),
    sortableColumn('启用日期', 'enabledDate', 120),
  ];

  const source = cardMode === 'edit' && editDraft ? editDraft : activeConsumable;
  const warehouseOptions = useMemo(() => {
    if (!source?.company) return [];
    const normal = WAREHOUSES_BY_COMPANY[source.company] || [];
    if (source.warehouse && activeConsumable?.company === source.company && !normal.includes(source.warehouse)) {
      return [...normal, source.warehouse];
    }
    return normal;
  }, [source, activeConsumable]);

  const editable = (field, control) => (cardMode === 'edit' ? control : displayText(source?.[field]));

  const detailTab = source ? (
    <Card size="small" title={<SectionTitle>耗材信息</SectionTitle>}>
      <DetailGrid columns={3} labelWidth={112}>
        <DetailItem label="耗材说明">{displayText(source.assetDesc)}</DetailItem>
        <DetailItem label="耗材大类">{displayText(source.majorCategory)}</DetailItem>
        <DetailItem label="耗材小类">{displayText(source.minorCategory)}</DetailItem>
        <DetailItem label="公司">
          {editable('company', <LookupInput value={editDraft?.company || ''} placeholder="请选择公司" onOpen={() => setLookupKey('editCompany')} />)}
        </DetailItem>
        <DetailItem label="耗材标签号">{displayText(source.tag)}</DetailItem>
        <DetailItem label="序列号">
          {editable('serialNumber', <Input value={editDraft?.serialNumber || ''} maxLength={120} allowClear onChange={(event) => updateEdit('serialNumber', event.target.value)} />)}
        </DetailItem>
        <DetailItem label="数量">{count(source.quantity)}</DetailItem>
        <DetailItem label="耗材状态">
          {editable('status', (
            <Select
              value={editDraft?.status || undefined}
              style={{ width: '100%' }}
              disabled={FORMAL_SCRAP_STATUSES.has(activeConsumable?.status)}
              options={(FORMAL_SCRAP_STATUSES.has(activeConsumable?.status) ? [activeConsumable.status, ...EDITABLE_STATUS_OPTIONS] : EDITABLE_STATUS_OPTIONS)
                .map((value) => ({ label: value, value, disabled: FORMAL_SCRAP_STATUSES.has(value) }))}
              onChange={(value) => updateEdit('status', value)}
            />
          ))}
        </DetailItem>
        <DetailItem label="原值">{amount(source.originalValue)}</DetailItem>
        <DetailItem label="购置日期">{displayText(source.purchaseDate)}</DetailItem>
        <DetailItem label="耗材责任人">
          {cardMode === 'edit' ? (
            <LookupInput value={editDraft?.ownerId ? `${editDraft.ownerId}.${editDraft.ownerName}` : ''} placeholder="请选择责任人" onOpen={() => setLookupKey('editOwner')} />
          ) : `${source.ownerId}.${source.ownerName}`}
        </DetailItem>
        <DetailItem label="新增类型">{displayText(source.addType)}</DetailItem>
        <DetailItem label="City">
          {editable('city', <Select allowClear value={editDraft?.city || undefined} style={{ width: '100%' }} options={CITY_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateEdit('city', value || '')} />)}
        </DetailItem>
        <DetailItem label="Building">
          {editable('building', (
            <Select
              allowClear
              value={editDraft?.building || undefined}
              style={{ width: '100%' }}
              placeholder={editDraft?.city ? '请选择' : '请先选择城市'}
              options={(BUILDING_BY_CITY[editDraft?.city] || []).map((value) => ({ label: value, value }))}
              onOpenChange={(open) => { if (open && !editDraft?.city) messageApi.warning('请先选择城市！'); }}
              onChange={(value) => updateEdit('building', value || '')}
            />
          ))}
        </DetailItem>
        <DetailItem label="Floor">
          {editable('floor', <Select allowClear value={editDraft?.floor || undefined} style={{ width: '100%' }} disabled={!editDraft?.building} options={(FLOOR_BY_BUILDING[editDraft?.building] || []).map((value) => ({ label: value, value }))} onChange={(value) => updateEdit('floor', value || '')} />)}
        </DetailItem>
        <DetailItem label="启用日期">
          {cardMode === 'edit' ? (
            <DatePicker
              style={{ width: '100%' }}
              value={editDraft?.enabledDate ? dayjs(editDraft.enabledDate) : null}
              placeholder="留空按既有购置日期规则计算"
              onChange={(date) => updateEdit('enabledDate', date ? date.format('YYYY-MM-DD') : '')}
            />
          ) : displayText(source.enabledDate)}
        </DetailItem>
        <DetailItem label="单位">{displayText(source.unit)}</DetailItem>
        <DetailItem label="板块">{displayText(source.plate)}</DetailItem>
        <DetailItem label="PR单号">{displayText(source.prNo)}</DetailItem>
        <DetailItem label="申请单号">{displayText(source.applicationNo)}</DetailItem>
        <DetailItem label="入库单号">{displayText(source.inboundNo)}</DetailItem>
        <DetailItem label="PO单号">{displayText(source.poNo)}</DetailItem>
        <DetailItem label="主资产标签号">
          {cardMode === 'edit' ? (
            <Space.Compact block>
              <LookupInput value={editDraft?.mainTag || ''} placeholder="请选择主资产" onOpen={openMainAssetLookup} onDoubleClick={clearMainAsset} />
              <Button disabled={!editDraft?.mainTag} onClick={clearMainAsset}>清空</Button>
            </Space.Compact>
          ) : displayText(source.mainTag)}
        </DetailItem>
        <DetailItem label="主资产说明">{displayText(source.mainAssetDesc)}</DetailItem>
        <DetailItem label="部门">{displayText(source.department)}</DetailItem>
        <DetailItem label="使用说明" span={3}>
          {editable('usageDescription', <TextArea value={editDraft?.usageDescription || ''} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('usageDescription', event.target.value)} />)}
        </DetailItem>
        <DetailItem label="备注" span={3}>
          {editable('remarks', <TextArea value={editDraft?.remarks || ''} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('remarks', event.target.value)} />)}
        </DetailItem>
        <DetailItem label="仓库">
          {editable('warehouse', (
            <Select
              allowClear
              value={editDraft?.warehouse || undefined}
              style={{ width: '100%' }}
              disabled={!editDraft?.company}
              placeholder={editDraft?.company ? '请选择仓库' : '请先选择公司'}
              options={warehouseOptions.map((value) => ({ label: value, value }))}
              onChange={(value) => updateEdit('warehouse', value || '')}
            />
          ))}
        </DetailItem>
        <DetailItem label="成本中心">{displayText(source.costCenter)}</DetailItem>
      </DetailGrid>
    </Card>
  ) : null;

  const historyRows = useMemo(() => {
    if (!source) return [];
    return [...(source.transactionHistory || [])].sort((a, b) => String(a.operationDate || '').localeCompare(String(b.operationDate || '')));
  }, [source]);

  const historyColumns = TRANSACTION_COLUMNS.map(([title, dataIndex, width]) => ({
    title,
    dataIndex,
    width,
    render: (value) => displayText(value),
    onCell: (record) => {
      if (!CHANGE_COMPARE_FIELDS.has(dataIndex)) return {};
      const index = historyRows.findIndex((item) => item.id === record.id);
      if (index <= 0) return {};
      const previous = historyRows[index - 1];
      return String(previous?.[dataIndex] ?? '') !== String(record?.[dataIndex] ?? '')
        ? { style: { background: '#fffbe6' } }
        : {};
    },
  }));

  const tabItems = source ? [
    { key: 'detail', label: '详细信息', children: detailTab },
    {
      key: 'history',
      label: '资产操作历史',
      children: (
        <Table
          rowKey="id"
          size="small"
          bordered
          columns={historyColumns}
          dataSource={historyRows}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      ),
    },
  ] : [];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <Typography.Title level={4} className="mb-0">耗材维护</Typography.Title>

      <QueryBar
        onQuery={handleQuery}
        onReset={handleReset}
        buttons={(
          <>
            <Button type="primary" icon={<Search size={14} />} onClick={handleQuery}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button type="link" icon={moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} onClick={() => setMoreOpen((current) => !current)}>
              {moreOpen ? '收起' : '更多'}
            </Button>
          </>
        )}
      >
        {renderBasicQuery()}
        {moreOpen ? renderMoreQuery() : null}
      </QueryBar>

      <Card size="small" title="耗材列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space wrap>
            <Button icon={<Edit3 size={14} />} onClick={handleEditSelected}>编辑</Button>
            <Button icon={<FileSpreadsheet size={14} />} onClick={() => setBatchOpen(true)}>批量修改</Button>
            <Button icon={<Download size={14} />} onClick={handleTemplateDownload}>模板下载</Button>
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
            type: 'checkbox',
            columnTitle: '选择',
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            fixed: true,
          }}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              if (nextPageSize !== pageSize) setPageSize(nextPageSize);
              setSelectedRowKeys([]);
            },
          }}
        />
      </Card>

      <SelectModal
        open={Boolean(lookupConfig)}
        title={lookupConfig?.title || ''}
        rowKey="id"
        multiple={Boolean(lookupConfig?.multiple)}
        dataSource={lookupConfig?.values || []}
        searchFields={lookupConfig?.searchFields || []}
        columns={lookupConfig?.columns || []}
        initialSelectedKeys={lookupInitialSelectedKeys}
        onCancel={() => setLookupKey('')}
        onConfirm={(selected) => {
          if (!lookupConfig) return;
          const valueField = lookupConfig.valueField || 'name';
          const records = lookupConfig.multiple ? selected : [selected];
          const values = records.filter(Boolean).map((record) => record[valueField]);
          if (['companies', 'owners', 'warehouses'].includes(lookupKey)) {
            updateFilter(lookupKey, values);
          } else if (['department', 'costCenter'].includes(lookupKey)) {
            updateFilter(lookupKey, values[0] || '');
          } else if (lookupKey === 'editCompany') {
            updateEdit('company', selected?.name || '');
          } else if (lookupKey === 'editOwner') {
            if (!selected?.department && selected?.code && !String(selected.code).startsWith('SOHU')) {
              messageApi.warning('该员工对应的部门为空，请联系管理员添加');
            }
            setEditDraft((current) => current ? {
              ...current,
              ownerId: selected?.code || '',
              ownerName: selected?.name || '',
              department: selected?.department || '',
            } : current);
          } else if (lookupKey === 'editMainAsset') {
            setEditDraft((current) => current ? {
              ...current,
              mainTag: selected?.tag || '',
              mainAssetDesc: selected?.desc || '',
            } : current);
          }
          setLookupKey('');
        }}
      />

      <Modal
        title={`${cardMode === 'edit' ? '耗材详细信息' : '耗材卡片信息'}${source?.tag ? `：${source.tag}` : ''}`}
        open={cardOpen}
        width={1080}
        style={{ maxWidth: 'calc(100vw - 48px)' }}
        styles={{ body: { maxHeight: '68vh', overflowY: 'auto' } }}
        footer={cardMode === 'edit' ? [
          <Button key="cancel" onClick={cancelEdit}>取消</Button>,
          <Button key="save" type="primary" onClick={saveConsumable}>保存</Button>,
        ] : null}
        onCancel={closeCard}
        destroyOnHidden
      >
        <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />
      </Modal>

      <Modal
        title="耗材批量修改"
        open={batchOpen}
        width={760}
        okText={batchValidation?.status === 'passed' ? '保存' : '校验'}
        cancelText="取消"
        onOk={handleBatchAction}
        onCancel={() => {
          setBatchOpen(false);
          resetBatchState();
        }}
      >
        <Space direction="vertical" size={16} className="w-full">
          <Alert
            type="warning"
            showIcon
            message="批量修改采用覆盖策略"
            description="耗材标签号用于定位既有卡片；板块、耗材说明、数量为只读核对列，必须与系统当前值一致且不会写回。公司、City、Building、主资产标签号、责任人、耗材状态、仓库、启用日期按模板值覆盖，空白会覆盖为空；其中公司、责任人、City、Building为空时直接校验失败。任一行校验失败时，本次文件全部不保存。"
          />
          <div>
            <Typography.Text strong>模板列：</Typography.Text>
            <Typography.Text>{BATCH_TEMPLATE_FIELDS.join('、')}</Typography.Text>
          </div>
          <Button icon={<Download size={14} />} onClick={handleTemplateDownload}>下载模板</Button>
          <Dragger
            accept=".xlsx"
            maxCount={1}
            beforeUpload={() => false}
            fileList={batchFiles}
            onChange={({ fileList }) => {
              setBatchFiles(fileList.slice(-1));
              setBatchValidation(null);
            }}
          >
            <p className="ant-upload-drag-icon"><UploadCloud size={36} /></p>
            <p className="ant-upload-text">点击或拖拽 Excel 文件到此区域上传</p>
            <p className="ant-upload-hint">仅支持耗材批量修改模板 .xlsx 文件；先校验全部行，通过后才能保存</p>
          </Dragger>

          <Typography.Text type="secondary">
            原型演示说明：当前不解析真实 Excel；文件名包含“校验失败”时可演示逐行错误结果，其余文件演示校验通过流程。正式实现按 PRD 读取模板并执行真实逐行校验。
          </Typography.Text>

          {batchValidation?.status === 'passed' ? (
            <Alert
              type="success"
              showIcon
              message="文件校验通过"
              description="当前文件全部行校验通过，可点击“保存”完成原型流程；正式落数需接入 Excel 解析。"
            />
          ) : null}

          {batchValidation?.status === 'failed' ? (
            <Card size="small" title={<SectionTitle>校验结果</SectionTitle>}>
              <Alert
                className="mb-3"
                type="error"
                showIcon
                message={`校验失败，共 ${batchValidation.errors.length} 条错误，本次文件未保存`}
              />
              <Table
                rowKey="id"
                size="small"
                bordered
                pagination={false}
                columns={BATCH_ERROR_COLUMNS}
                dataSource={batchValidation.errors}
              />
            </Card>
          ) : null}
        </Space>
      </Modal>
    </Space>
  );
}
