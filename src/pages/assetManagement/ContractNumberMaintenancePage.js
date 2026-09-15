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
  CONTRACT_NUMBER_EDIT_FIELDS,
  getContractNumberMaintenanceRows,
  updateContractNumberMaintenanceRow,
} from '../../services/contractNumberMaintenanceService';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Dragger } = Upload;

const STATUS_OPTIONS = ['在用-使用中', '在库（新）', '在库（旧）', '已报废'];
const MINOR_CATEGORY_OPTIONS = ['合约机', '合约号码'];
const CLAIM_REASON_OPTIONS = ['4级升5级', '5级（含）以上入职', '业务使用', '空'];
const WAREHOUSE_OPTIONS = ['I10086.集团合约机库'];
const PHONE_PATTERN = /^(13|14|15|17|18)\d{9}$/;

const BATCH_TEMPLATE_FIELDS = [
  '标签号', '责任人工号', '身份证号码', '资产状态', 'IMEI/电话号码', '金额',
  '仓库', '领用原因', '副卡', '备注', '维修记录',
];

const EMPTY_FILTERS = {
  tag: '',
  contractNumber: '',
  useCompanies: [],
  brands: [],
  minorCategories: [],
  contractDesc: '',
  packageContent: '',
  contractTerm: [],
  amountMin: null,
  amountMax: null,
  statuses: [],
  warehouses: [],
  owners: [],
  subsidiaries: [],
  departments: [],
  jobLevels: [],
  claimDate: [],
  claimReasons: [],
  claimDescription: '',
  applicationNo: '',
  scrapStatus: '',
  scrapReason: '',
  scrapDate: [],
};

const HISTORY_COLUMNS = [
  ['操作类型', 'operationType', 150],
  ['操作日期', 'operationDate', 170],
  ['操作人', 'operator', 140],
  ['单据编号', 'documentNo', 150],
  ['申请单号', 'applicationNo', 150],
  ['标签号', 'tag', 120],
  ['合约号码', 'contractNumber', 140],
  ['类别', 'category', 160],
  ['说明', 'assetDesc', 220],
  ['责任人', 'owner', 170],
  ['公司', 'company', 220],
  ['状态', 'status', 130],
  ['仓库', 'warehouse', 180],
  ['备注', 'remarks', 220],
];
const HISTORY_CHANGE_FIELDS = new Set(['contractNumber', 'owner', 'company', 'status', 'warehouse', 'remarks']);
const BATCH_ERROR_COLUMNS = [
  { title: '行号', dataIndex: 'rowNo', width: 80, align: 'center' },
  { title: '标签号', dataIndex: 'tag', width: 130 },
  { title: '失败原因', dataIndex: 'reason' },
];

function displayText(value) {
  return value === undefined || value === null || value === '' ? '-' : value;
}

function amountText(value) {
  if (value === undefined || value === null || value === '') return '-';
  const number = Number(value);
  if (Number.isNaN(number)) return displayText(value);
  return number.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function fuzzyMatch(value, query) {
  const token = String(query || '').trim().toLowerCase();
  if (!token) return true;
  return String(value || '').toLowerCase().includes(token);
}

function copyFilters(value) {
  return JSON.parse(JSON.stringify(value));
}

function uniqueValues(rows, field) {
  return [...new Set(rows.map((row) => row[field]).filter((value) => value && value !== '-'))];
}

function contractTermText(row) {
  if (!row.contractStartDate && !row.contractEndDate) return '-';
  return `${displayText(row.contractStartDate)} 至 ${displayText(row.contractEndDate)}`;
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
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = null;
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
        { id: 'contract-batch-error-1', rowNo: 3, tag: 'N-0739', reason: '第 3 行,资产状态不存在' },
        { id: 'contract-batch-error-2', rowNo: 6, tag: 'N-0890', reason: '第 6 行,金额为数字' },
      ],
    };
  }
  return { status: 'passed', errors: [] };
}

export default function ContractNumberMaintenancePage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [rows, setRows] = useState(() => getContractNumberMaintenanceRows());
  const [draftFilters, setDraftFilters] = useState(copyFilters(EMPTY_FILTERS));
  const [appliedFilters, setAppliedFilters] = useState(copyFilters(EMPTY_FILTERS));
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lookupKey, setLookupKey] = useState('');
  const [cardOpen, setCardOpen] = useState(false);
  const [cardMode, setCardMode] = useState('view');
  const [activeRowId, setActiveRowId] = useState('');
  const [activeTab, setActiveTab] = useState('detail');
  const [editDraft, setEditDraft] = useState(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchValidation, setBatchValidation] = useState(null);

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeRowId) || null,
    [rows, activeRowId],
  );

  const companies = useMemo(() => uniqueValues(rows, 'useCompany').map((name, index) => ({
    id: `contract-company-${index}`,
    name,
    code: rows.find((row) => row.useCompany === name)?.useCompanyCode || '',
  })), [rows]);
  const owners = useMemo(() => [...new Map(rows.map((row) => [row.ownerId, {
    id: row.ownerId,
    code: row.ownerId,
    name: row.ownerName,
    department: row.department,
    subsidiary: row.subsidiary,
    jobLevel: row.jobLevel,
    idCard: row.idCard,
  }])).values()], [rows]);
  const departmentOptions = useMemo(() => {
    const values = new Set();
    rows.forEach((row) => {
      const department = String(row.department || '').trim();
      if (!department) return;
      const parts = department.split('.').filter(Boolean);
      parts.forEach((_, index) => values.add(parts.slice(0, index + 1).join('.')));
    });
    return [...values];
  }, [rows]);

  const lookupConfig = useMemo(() => {
    const configs = {
      owners: {
        title: '选择责任人', multiple: true, values: owners, valueField: 'code',
        searchFields: [{ name: 'code', label: '员工编号', dataIndex: 'code' }, { name: 'name', label: '员工姓名', dataIndex: 'name' }, { name: 'department', label: '部门', dataIndex: 'department' }],
        columns: [{ title: '员工编号', dataIndex: 'code' }, { title: '员工姓名', dataIndex: 'name' }, { title: '部门', dataIndex: 'department' }],
      },
      editOwner: {
        title: '选择责任人', multiple: false, values: owners, valueField: 'code',
        searchFields: [{ name: 'code', label: '员工编号', dataIndex: 'code' }, { name: 'name', label: '员工姓名', dataIndex: 'name' }, { name: 'department', label: '部门', dataIndex: 'department' }],
        columns: [{ title: '员工编号', dataIndex: 'code' }, { title: '员工姓名', dataIndex: 'name' }, { title: '部门', dataIndex: 'department' }],
      },
      editCompany: {
        title: '选择使用公司', multiple: false, values: companies, valueField: 'name',
        searchFields: [{ name: 'code', label: '公司编码', dataIndex: 'code' }, { name: 'name', label: '公司名称', dataIndex: 'name' }],
        columns: [{ title: '公司编码', dataIndex: 'code' }, { title: '公司名称', dataIndex: 'name' }],
      },
    };
    return configs[lookupKey] || null;
  }, [lookupKey, owners, companies]);

  const lookupInitialSelectedKeys = useMemo(() => {
    if (!lookupConfig) return [];
    const valueField = lookupConfig.valueField || 'name';
    let values = [];
    if (lookupKey === 'owners') values = draftFilters.owners || [];
    if (lookupKey === 'editOwner' && editDraft?.ownerId) values = [editDraft.ownerId];
    if (lookupKey === 'editCompany' && editDraft?.useCompany) values = [editDraft.useCompany];
    const selectedSet = new Set(values.map(String));
    return lookupConfig.values
      .filter((record) => selectedSet.has(String(record[valueField])))
      .map((record) => String(record.id));
  }, [lookupConfig, lookupKey, draftFilters.owners, editDraft]);

  const filteredRows = useMemo(() => {
    const f = appliedFilters;
    const result = rows.filter((row) => {
      if (!fuzzyMultiMatch(row.tag, f.tag)) return false;
      if (!fuzzyMultiMatch(row.contractNumber, f.contractNumber)) return false;
      if (f.useCompanies.length && !f.useCompanies.includes(row.useCompany)) return false;
      if (f.brands.length && !f.brands.includes(row.brand)) return false;
      if (f.minorCategories.length && !f.minorCategories.includes(row.minorCategory)) return false;
      if (!fuzzyMatch(row.contractDesc, f.contractDesc)) return false;
      if (!fuzzyMatch(row.packageContent, f.packageContent)) return false;
      if (f.contractTerm.length === 2) {
        if (!row.contractStartDate || !row.contractEndDate) return false;
        if (row.contractStartDate < f.contractTerm[0] || row.contractEndDate > f.contractTerm[1]) return false;
      }
      if (f.amountMin !== null && f.amountMin !== '' && Number(row.amount) < Number(f.amountMin)) return false;
      if (f.amountMax !== null && f.amountMax !== '' && Number(row.amount) > Number(f.amountMax)) return false;
      if (f.statuses.length && !f.statuses.includes(row.status)) return false;
      if (f.warehouses.length && !f.warehouses.includes(row.warehouse)) return false;
      if (f.owners.length && !f.owners.includes(row.ownerId)) return false;
      if (f.subsidiaries.length && !f.subsidiaries.includes(row.subsidiary)) return false;
      if (f.departments.length && !f.departments.some((department) => String(row.department || '').startsWith(department))) return false;
      if (f.jobLevels.length && !f.jobLevels.includes(row.jobLevel)) return false;
      if (f.claimDate.length === 2 && (!row.claimDate || row.claimDate < f.claimDate[0] || row.claimDate > f.claimDate[1])) return false;
      if (f.claimReasons.length) {
        const value = row.claimReason || '';
        if (!f.claimReasons.some((item) => (item === '空' ? !value : item === value))) return false;
      }
      if (!fuzzyMultiMatch(row.claimDescription, f.claimDescription)) return false;
      if (!fuzzyMultiMatch(row.applicationNo, f.applicationNo)) return false;
      if (f.scrapStatus === '已报废' && !String(row.status).includes('报废')) return false;
      if (f.scrapStatus === '未报废' && String(row.status).includes('报废')) return false;
      if (!fuzzyMultiMatch(row.scrapReason, f.scrapReason)) return false;
      if (f.scrapDate.length === 2 && (!row.scrapDate || row.scrapDate < f.scrapDate[0] || row.scrapDate > f.scrapDate[1])) return false;
      return true;
    });
    return [...result].sort((a, b) => (
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
      || String(a.tag || '').localeCompare(String(b.tag || ''), 'zh-CN', { numeric: true })
    ));
  }, [rows, appliedFilters]);

  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value }));

  const handleQuery = () => {
    if (
      draftFilters.amountMin !== null && draftFilters.amountMin !== ''
      && draftFilters.amountMax !== null && draftFilters.amountMax !== ''
      && Number(draftFilters.amountMin) > Number(draftFilters.amountMax)
    ) {
      messageApi.warning('金额最小值不能大于最大值');
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

  const openCard = (row, mode = 'view') => {
    setActiveRowId(row.id);
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
      if (field === 'status') {
        const next = { ...current, status: value || '' };
        if (String(value || '').includes('在用')) next.warehouse = '';
        if (!String(value || '').includes('报废')) {
          next.scrapDate = '';
          next.scrapReason = '';
        }
        return next;
      }
      return { ...current, [field]: value ?? '' };
    });
  };

  const saveContractNumber = () => {
    if (!activeRow || !editDraft) return;
    const number = String(editDraft.contractNumber || '').trim();
    if (!PHONE_PATTERN.test(number)) {
      messageApi.error('合约号码必须为有效的11位手机号');
      return;
    }
    if (!editDraft.useCompany) {
      messageApi.warning('使用公司不能为空');
      return;
    }
    if (!editDraft.ownerId) {
      messageApi.warning('责任人不能为空');
      return;
    }
    if (editDraft.contractStartDate && editDraft.contractEndDate && editDraft.contractStartDate > editDraft.contractEndDate) {
      messageApi.error('合约期限开始日期不得晚于结束日期');
      return;
    }
    if (String(editDraft.remarks || '').length > 120) {
      messageApi.error('备注最多120字');
      return;
    }
    if (String(editDraft.status || '').includes('在用') && editDraft.warehouse) {
      messageApi.error('仓库和状态不匹配。');
      return;
    }
    if (!String(editDraft.status || '').includes('在用') && !editDraft.warehouse) {
      messageApi.error('仓库和状态不匹配。');
      return;
    }
    if (String(editDraft.status || '').includes('报废') && (!editDraft.scrapDate || !String(editDraft.scrapReason || '').trim())) {
      messageApi.error('报废状态必须填写报废日期和报废原因');
      return;
    }

    const patch = CONTRACT_NUMBER_EDIT_FIELDS.reduce((result, field) => ({
      ...result,
      [field]: editDraft[field] ?? '',
    }), {});
    patch.contractNumber = number;
    const changed = CONTRACT_NUMBER_EDIT_FIELDS.some((field) => (
      String(activeRow[field] ?? '') !== String(patch[field] ?? '')
    ));
    if (!changed) {
      messageApi.info('合约号码信息未发生变化');
      return;
    }

    try {
      const nextRows = updateContractNumberMaintenanceRow(activeRow.id, patch);
      const saved = nextRows.find((row) => row.id === activeRow.id);
      setRows(nextRows);
      setSelectedRowKeys([]);
      setPage(1);
      setCardMode('edit');
      setEditDraft(saved ? { ...saved } : { ...editDraft });
      messageApi.success('保存成功！');
    } catch (error) {
      messageApi.error(error.message || '保存失败,请检查数据！');
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
        messageApi.success(`已生成导出合约号码信息-${dayjs().format('YYYYMMDD')}.xlsx，共 ${size} 条（原型）`);
      },
    });
  };

  const handleTemplateDownload = () => {
    messageApi.success(`已发起下载：合约号码批量修改模板.xlsx（${BATCH_TEMPLATE_FIELDS.length}列，原型）`);
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
      setBatchOpen(false);
      resetBatchState();
      messageApi.success('修改成功！（原型未解析实际 Excel 数据）');
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
      value={(draftFilters[field] || []).map((value) => {
        if (field === 'owners') {
          const owner = owners.find((item) => item.code === value);
          return owner ? `${owner.code}-${owner.name}` : value;
        }
        return value;
      }).join(', ')}
      placeholder={placeholder}
      onOpen={() => setLookupKey(field)}
      onDoubleClick={() => updateFilter(field, [])}
    />
  );

  const multiSelect = (field, options, placeholder = '请选择') => (
    <QueryClearArea onClear={() => updateFilter(field, [])}>
      <Select
        mode="multiple"
        allowClear
        value={draftFilters[field]}
        style={{ width: '100%' }}
        placeholder={placeholder}
        options={options.map((value) => ({ label: value || '空', value }))}
        onChange={(value) => updateFilter(field, value)}
      />
    </QueryClearArea>
  );

  const renderBasicQuery = () => (
    <>
      <QueryItem label="标签号">
        <Input value={draftFilters.tag} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('tag', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('tag', '')} />
      </QueryItem>
      <QueryItem label="合约号码">
        <Input value={draftFilters.contractNumber} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('contractNumber', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('contractNumber', '')} />
      </QueryItem>
      <QueryItem label="使用公司">{multiSelect('useCompanies', uniqueValues(rows, 'useCompany'))}</QueryItem>
      <QueryItem label="品牌">{multiSelect('brands', uniqueValues(rows, 'brand'))}</QueryItem>
      <QueryItem label="资产小类">{multiSelect('minorCategories', MINOR_CATEGORY_OPTIONS)}</QueryItem>
      <QueryItem label="合约号码说明">
        <Input value={draftFilters.contractDesc} allowClear placeholder="支持模糊" onChange={(event) => updateFilter('contractDesc', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('contractDesc', '')} />
      </QueryItem>
      <QueryItem label="套餐内容">
        <Input value={draftFilters.packageContent} allowClear placeholder="支持模糊" onChange={(event) => updateFilter('packageContent', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('packageContent', '')} />
      </QueryItem>
      <QueryItem label="号码状态">{multiSelect('statuses', STATUS_OPTIONS)}</QueryItem>
      <QueryItem label="仓库">{multiSelect('warehouses', WAREHOUSE_OPTIONS)}</QueryItem>
      <QueryItem label="责任人">{renderLookup('owners', '请选择责任人')}</QueryItem>
    </>
  );

  const renderMoreQuery = () => (
    <>
      <QueryItem label="合约期限">
        <QueryClearArea onClear={() => updateFilter('contractTerm', [])}>
          <RangePicker
            style={{ width: '100%' }}
            value={draftFilters.contractTerm.length === 2 ? draftFilters.contractTerm.map((value) => dayjs(value)) : null}
            onChange={(dates) => updateFilter('contractTerm', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])}
          />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="金额">
        <QueryClearArea onClear={() => setDraftFilters((current) => ({ ...current, amountMin: null, amountMax: null }))}>
          <Space.Compact block>
            <InputNumber min={0} precision={2} value={draftFilters.amountMin} placeholder="最小值" onChange={(value) => updateFilter('amountMin', value)} style={{ width: '50%' }} />
            <InputNumber min={0} precision={2} value={draftFilters.amountMax} placeholder="最大值" onChange={(value) => updateFilter('amountMax', value)} style={{ width: '50%' }} />
          </Space.Compact>
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="子公司">{multiSelect('subsidiaries', uniqueValues(rows, 'subsidiary'))}</QueryItem>
      <QueryItem label="部门">{multiSelect('departments', departmentOptions)}</QueryItem>
      <QueryItem label="员工职级">{multiSelect('jobLevels', uniqueValues(rows, 'jobLevel'))}</QueryItem>
      <QueryItem label="领用日期">
        <QueryClearArea onClear={() => updateFilter('claimDate', [])}>
          <RangePicker style={{ width: '100%' }} value={draftFilters.claimDate.length === 2 ? draftFilters.claimDate.map((value) => dayjs(value)) : null} onChange={(dates) => updateFilter('claimDate', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="领用原因">{multiSelect('claimReasons', CLAIM_REASON_OPTIONS)}</QueryItem>
      <QueryItem label="领用说明">
        <Input value={draftFilters.claimDescription} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('claimDescription', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('claimDescription', '')} />
      </QueryItem>
      <QueryItem label="申请单号">
        <Input value={draftFilters.applicationNo} allowClear placeholder="支持文本、多值" onChange={(event) => updateFilter('applicationNo', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('applicationNo', '')} />
      </QueryItem>
      <QueryItem label="报废状态">
        <QueryClearArea onClear={() => updateFilter('scrapStatus', '')}>
          <Select allowClear value={draftFilters.scrapStatus || undefined} options={['已报废', '未报废'].map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('scrapStatus', value || '')} />
        </QueryClearArea>
      </QueryItem>
      <QueryItem label="报废原因">
        <Input value={draftFilters.scrapReason} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('scrapReason', event.target.value)} onPressEnter={handleQuery} onDoubleClick={() => updateFilter('scrapReason', '')} />
      </QueryItem>
      <QueryItem label="报废日期">
        <QueryClearArea onClear={() => updateFilter('scrapDate', [])}>
          <RangePicker style={{ width: '100%' }} value={draftFilters.scrapDate.length === 2 ? draftFilters.scrapDate.map((value) => dayjs(value)) : null} onChange={(dates) => updateFilter('scrapDate', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])} />
        </QueryClearArea>
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
      ...sortableColumn('标签号', 'tag', 120),
      fixed: 'left',
      render: (value, row) => <Button type="link" style={{ padding: 0, height: 'auto', userSelect: 'text' }} onClick={() => openCard(row, 'view')}>{value}</Button>,
    },
    sortableColumn('合约号码', 'contractNumber', 140),
    sortableColumn('使用公司', 'useCompany', 220),
    sortableColumn('品牌', 'brand', 100),
    sortableColumn('资产小类', 'minorCategory', 120),
    sortableColumn('合约号码说明', 'contractDesc', 200),
    sortableColumn('套餐内容', 'packageContent', 280),
    { title: '合约期限', width: 220, sorter: (a, b) => compareValue(a.contractStartDate, b.contractStartDate), render: (_, row) => contractTermText(row) },
    sortableColumn('数量', 'quantity', 80, { number: true, align: 'right' }),
    sortableColumn('金额', 'amount', 120, { number: true, align: 'right', render: amountText }),
    sortableColumn('号码状态', 'status', 140, { render: (value) => <StatusTag value={value} type="business" /> }),
    sortableColumn('仓库', 'warehouse', 180),
    sortableColumn('备注', 'remarks', 220),
    sortableColumn('报废原因', 'scrapReason', 220),
    sortableColumn('报废日期', 'scrapDate', 120),
    { title: '责任人', dataIndex: 'ownerName', width: 170, sorter: (a, b) => `${a.ownerId}-${a.ownerName}`.localeCompare(`${b.ownerId}-${b.ownerName}`, 'zh-CN'), render: (_, row) => `${row.ownerId}-${row.ownerName}` },
    sortableColumn('子公司', 'subsidiary', 140),
    sortableColumn('部门', 'department', 200),
    sortableColumn('员工职级', 'jobLevel', 110),
    sortableColumn('领用日期', 'claimDate', 120),
    sortableColumn('领用原因', 'claimReason', 160),
    sortableColumn('领用说明', 'claimDescription', 220),
    sortableColumn('申请单号', 'applicationNo', 150),
  ];

  const source = cardMode === 'edit' && editDraft ? editDraft : activeRow;
  const editable = (field, control) => (cardMode === 'edit' ? control : displayText(source?.[field]));
  const contractDescOptions = uniqueValues(rows, 'contractDesc').map((value) => ({ label: value, value }));
  const packageOptions = uniqueValues(rows, 'packageContent').map((value) => ({ label: value, value }));

  const detailTab = source ? (
    <Space direction="vertical" size={12} className="w-full">
      <Card size="small" title={<SectionTitle>资产身份</SectionTitle>}>
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="标签号">{displayText(source.tag)}</DetailItem>
          <DetailItem label="资产小类">{displayText(source.minorCategory)}</DetailItem>
          <DetailItem label="品牌">{displayText(source.brand)}</DetailItem>
          <DetailItem label="资产说明">{displayText(source.assetDesc)}</DetailItem>
          <DetailItem label="配置">{displayText(source.config)}</DetailItem>
          <DetailItem label="数量">{displayText(source.quantity)}</DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title={<SectionTitle>套餐与合约</SectionTitle>}>
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="合约号码">{editable('contractNumber', <Input value={editDraft?.contractNumber || ''} maxLength={25} allowClear onChange={(event) => updateEdit('contractNumber', event.target.value)} />)}</DetailItem>
          <DetailItem label="使用公司">{cardMode === 'edit' ? <LookupInput value={editDraft?.useCompany || ''} placeholder="请选择使用公司" onOpen={() => setLookupKey('editCompany')} /> : displayText(source.useCompany)}</DetailItem>
          <DetailItem label="合约号码说明">{editable('contractDesc', <Select value={editDraft?.contractDesc || undefined} allowClear showSearch style={{ width: '100%' }} options={contractDescOptions} onChange={(value) => updateEdit('contractDesc', value || '')} />)}</DetailItem>
          <DetailItem label="套餐内容" span={2}>{editable('packageContent', <Select value={editDraft?.packageContent || undefined} allowClear showSearch style={{ width: '100%' }} options={packageOptions} onChange={(value) => updateEdit('packageContent', value || '')} />)}</DetailItem>
          <DetailItem label="合约期限">
            {cardMode === 'edit' ? (
              <RangePicker
                style={{ width: '100%' }}
                value={editDraft?.contractStartDate && editDraft?.contractEndDate ? [dayjs(editDraft.contractStartDate), dayjs(editDraft.contractEndDate)] : null}
                onChange={(dates) => setEditDraft((current) => current ? {
                  ...current,
                  contractStartDate: dates ? dates[0].format('YYYY-MM-DD') : '',
                  contractEndDate: dates ? dates[1].format('YYYY-MM-DD') : '',
                } : current)}
              />
            ) : contractTermText(source)}
          </DetailItem>
          <DetailItem label="金额">{editable('amount', <InputNumber min={0} max={99999999.99} precision={2} style={{ width: '100%' }} value={editDraft?.amount} onChange={(value) => updateEdit('amount', value)} />)}</DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title={<SectionTitle>状态与仓库</SectionTitle>}>
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="号码状态">{editable('status', <Select value={editDraft?.status || undefined} style={{ width: '100%' }} options={STATUS_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateEdit('status', value)} />)}</DetailItem>
          <DetailItem label="仓库">
            {editable('warehouse', (
              <Select
                allowClear
                disabled={String(editDraft?.status || '').includes('在用')}
                value={editDraft?.warehouse || undefined}
                placeholder={String(editDraft?.status || '').includes('在用') ? '在用状态仓库必须为空' : '请选择仓库'}
                style={{ width: '100%' }}
                options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))}
                onChange={(value) => updateEdit('warehouse', value || '')}
              />
            ))}
          </DetailItem>
          <DetailItem label="备注">{editable('remarks', <TextArea value={editDraft?.remarks || ''} maxLength={120} showCount autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('remarks', event.target.value)} />)}</DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title={<SectionTitle>报废</SectionTitle>}>
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="报废日期">
            {cardMode === 'edit' ? (
              <DatePicker disabled={!String(editDraft?.status || '').includes('报废')} style={{ width: '100%' }} value={editDraft?.scrapDate ? dayjs(editDraft.scrapDate) : null} onChange={(date) => updateEdit('scrapDate', date ? date.format('YYYY-MM-DD') : '')} />
            ) : displayText(source.scrapDate)}
          </DetailItem>
          <DetailItem label="报废原因" span={2}>{editable('scrapReason', <TextArea disabled={!String(editDraft?.status || '').includes('报废')} value={editDraft?.scrapReason || ''} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('scrapReason', event.target.value)} />)}</DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title={<SectionTitle>人员</SectionTitle>}>
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="责任人">{cardMode === 'edit' ? <LookupInput value={editDraft?.ownerId ? `${editDraft.ownerId}-${editDraft.ownerName}` : ''} placeholder="请选择责任人" onOpen={() => setLookupKey('editOwner')} /> : `${source.ownerId}-${source.ownerName}`}</DetailItem>
          <DetailItem label="子公司">{displayText(source.subsidiary)}</DetailItem>
          <DetailItem label="部门">{displayText(source.department)}</DetailItem>
          <DetailItem label="员工职级">{displayText(source.jobLevel)}</DetailItem>
          <DetailItem label="身份证号码">{displayText(source.idCard)}</DetailItem>
        </DetailGrid>
      </Card>

      <Card size="small" title={<SectionTitle>领用与扩展</SectionTitle>}>
        <DetailGrid columns={3} labelWidth={112}>
          <DetailItem label="领用日期">{displayText(source.claimDate)}</DetailItem>
          <DetailItem label="领用原因">{editable('claimReason', <Select allowClear value={editDraft?.claimReason || undefined} style={{ width: '100%' }} options={CLAIM_REASON_OPTIONS.filter((value) => value !== '空').map((value) => ({ label: value, value }))} onChange={(value) => updateEdit('claimReason', value || '')} />)}</DetailItem>
          <DetailItem label="申请单号">{displayText(source.applicationNo)}</DetailItem>
          <DetailItem label="领用说明" span={3}>{editable('claimDescription', <TextArea value={editDraft?.claimDescription || ''} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('claimDescription', event.target.value)} />)}</DetailItem>
          <DetailItem label="副卡">{displayText(source.secondaryCard)}</DetailItem>
          <DetailItem label="维修记录" span={2}>{displayText(source.maintenanceRecord)}</DetailItem>
        </DetailGrid>
      </Card>
    </Space>
  ) : null;

  const historyRows = useMemo(() => {
    if (!source) return [];
    return [...(source.transactionHistory || [])].sort((a, b) => String(a.operationDate || '').localeCompare(String(b.operationDate || '')));
  }, [source]);

  const historyColumns = HISTORY_COLUMNS.map(([title, dataIndex, width]) => ({
    title,
    dataIndex,
    width,
    render: (value) => displayText(value),
    onCell: (record) => {
      if (!HISTORY_CHANGE_FIELDS.has(dataIndex)) return {};
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
      label: '合约号码操作历史',
      children: <Table rowKey="id" size="small" bordered columns={historyColumns} dataSource={historyRows} pagination={false} scroll={{ x: 'max-content' }} />,
    },
  ] : [];

  return (
    <Space direction="vertical" size={16} className="w-full">
      {contextHolder}
      <Typography.Title level={4} className="mb-0">合约号码维护</Typography.Title>

      <QueryBar
        onQuery={handleQuery}
        onReset={handleReset}
        buttons={(
          <>
            <Button type="primary" icon={<Search size={14} />} onClick={handleQuery}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button type="link" icon={moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} onClick={() => setMoreOpen((current) => !current)}>{moreOpen ? '收起' : '更多'}</Button>
          </>
        )}
      >
        {renderBasicQuery()}
        {moreOpen ? renderMoreQuery() : null}
      </QueryBar>

      <Card size="small" title="合约号码列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space wrap>
            <Button icon={<Edit3 size={14} />} onClick={handleEditSelected}>编辑</Button>
            <Button icon={<FileSpreadsheet size={14} />} onClick={() => setBatchOpen(true)}>批量编辑</Button>
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
          rowSelection={{ type: 'checkbox', columnTitle: '选择', selectedRowKeys, onChange: setSelectedRowKeys, fixed: true }}
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
          if (lookupKey === 'owners') {
            const records = Array.isArray(selected) ? selected : [selected];
            updateFilter('owners', records.filter(Boolean).map((record) => record.code));
          } else if (lookupKey === 'editCompany') {
            updateEdit('useCompany', selected?.name || '');
          } else if (lookupKey === 'editOwner') {
            if (!selected?.department && selected?.code && !String(selected.code).startsWith('SOHU')) {
              messageApi.warning('该员工对应的部门为空，请联系管理员添加');
            }
            setEditDraft((current) => current ? {
              ...current,
              ownerId: selected?.code || '',
              ownerName: selected?.name || '',
              subsidiary: selected?.subsidiary || '',
              department: selected?.department || '',
              jobLevel: selected?.jobLevel || '',
              idCard: selected?.idCard || '',
            } : current);
          }
          setLookupKey('');
        }}
      />

      <Modal
        title={`${cardMode === 'edit' ? '合约机详细信息编辑页' : '合约号码信息'}${source?.tag ? `：${source.tag}` : ''}`}
        open={cardOpen}
        width={1120}
        style={{ maxWidth: 'calc(100vw - 48px)' }}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        footer={cardMode === 'edit' ? [
          <Button key="cancel" onClick={cancelEdit}>取消</Button>,
          <Button key="save" type="primary" onClick={saveContractNumber}>保存</Button>,
        ] : null}
        onCancel={closeCard}
        destroyOnHidden
      >
        <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />
      </Modal>

      <Modal
        title="合约号码批量编辑"
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
            message="批量编辑空白表示保留原值"
            description="标签号必填并用于定位既有合约号码；其余模板字段空白表示不修改。全部行校验通过后才能保存，任一行失败时整份文件不保存。"
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
            <p className="ant-upload-hint">仅支持固定合约号码批量编辑模板 .xlsx 文件；先校验全部行，通过后才能保存</p>
          </Dragger>
          <Typography.Text type="secondary">原型不解析真实 Excel；文件名包含“校验失败”时可演示逐行错误，其余文件演示校验通过。正式实现按 PRD 的 11 列模板逐行校验。</Typography.Text>
          {batchValidation?.status === 'passed' ? <Alert type="success" showIcon message="文件校验通过" description="全部行校验通过，可点击“保存”完成原型流程。" /> : null}
          {batchValidation?.status === 'failed' ? (
            <Card size="small" title={<SectionTitle>校验结果</SectionTitle>}>
              <Alert className="mb-3" type="error" showIcon message={`校验失败，共 ${batchValidation.errors.length} 条错误，本次文件未保存`} />
              <Table rowKey="id" size="small" bordered pagination={false} columns={BATCH_ERROR_COLUMNS} dataSource={batchValidation.errors} />
            </Card>
          ) : null}
        </Space>
      </Modal>
    </Space>
  );
}
