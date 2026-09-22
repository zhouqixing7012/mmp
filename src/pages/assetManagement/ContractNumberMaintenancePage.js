import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Result,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  Upload,
  message as antdMessage,
} from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
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
  CONTRACT_NUMBER_MAINTENANCE_USERS,
  CURRENT_CONTRACT_NUMBER_OPERATOR,
} from '../../mock/contractNumberMaintenanceMock';
import {
  CONTRACT_NUMBER_BATCH_FIELDS,
  CONTRACT_NUMBER_EDIT_FIELDS,
  batchUpdateContractNumberMaintenanceRows,
  getContractNumberMaintenanceRows,
  hasContractNumberMaintenanceAccess,
  updateContractNumberMaintenanceRow,
  validateContractNumberBatchRows,
} from '../../services/contractNumberMaintenanceService';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Dragger } = Upload;

const STATUS_OPTIONS = ['在用-使用中', '在库（新）', '在库（旧）', '已报废'];
const APPLICATION_TYPE_OPTIONS = ['业务申请', '个人申请', '管理者配送'];
const WAREHOUSE_OPTIONS = ['I10086.集团合约机库'];
const PHONE_PATTERN = /^(13|14|15|17|18)\d{9}$/;

const BATCH_TEMPLATE_FIELDS = CONTRACT_NUMBER_BATCH_FIELDS.map((field) => field.header);

const EXPORT_FIELDS = [
  '行号', '标签号', '合约号码', '使用公司', '资产小类', '合约号码说明', '套餐内容',
  '合约开始日期', '合约结束日期', '数量', '金额', '号码状态', '仓库', '使用说明',
  '报废原因', '报废日期', '责任人工号', '责任人姓名', '身份证号码', '部门', '员工职级',
  '领用日期', '领用原因', '申请类型', '申请单号',
];

const EMPTY_FILTERS = {
  tag: '',
  contractNumber: '',
  useCompanies: [],
  contractDesc: '',
  packageContent: '',
  contractTerm: [],
  amountMin: null,
  amountMax: null,
  statuses: [],
  warehouses: [],
  owners: [],
  departments: [],
  jobLevels: [],
  claimDate: [],
  claimReasons: [],
  applicationTypes: [],
  applicationNo: '',
  scrapStatus: '',
  scrapReason: '',
  scrapDate: [],
};

const HISTORY_COLUMNS = [
  ['操作类型', 'operationType', 150],
  ['操作日期', 'operationDate', 170],
  ['操作人', 'operator', 140],
  ['事务来源', 'source', 160],
  ['单据编号', 'documentNo', 150],
  ['申请单号', 'applicationNo', 150],
  ['标签号', 'tag', 120],
  ['合约号码', 'contractNumber', 140],
  ['使用公司', 'company', 220],
  ['资产小类', 'minorCategory', 120],
  ['合约号码说明', 'contractDesc', 200],
  ['套餐内容', 'packageContent', 260],
  ['合约期限', 'contractTerm', 220],
  ['数量', 'quantity', 80],
  ['金额', 'amount', 120],
  ['号码状态', 'status', 140],
  ['仓库', 'warehouse', 180],
  ['使用说明', 'usageDescription', 220],
  ['报废原因', 'scrapReason', 220],
  ['报废日期', 'scrapDate', 120],
  ['责任人', 'owner', 170],
  ['身份证号码', 'idCard', 190],
  ['部门', 'department', 200],
  ['员工职级', 'jobLevel', 110],
  ['领用日期', 'claimDate', 120],
  ['领用原因', 'claimReason', 130],
  ['申请类型', 'applicationType', 130],
];
const HISTORY_CHANGE_FIELDS = new Set([
  'tag', 'contractNumber', 'company', 'minorCategory', 'contractDesc', 'packageContent',
  'contractTerm', 'quantity', 'amount', 'status', 'warehouse', 'usageDescription',
  'scrapReason', 'scrapDate', 'owner', 'idCard', 'department', 'jobLevel',
  'claimDate', 'claimReason', 'applicationType',
]);
const BATCH_ERROR_COLUMNS = [
  { title: '行号', dataIndex: 'rowNo', width: 80, align: 'center' },
  { title: '标签号', dataIndex: 'tag', width: 130 },
  { title: '字段', dataIndex: 'field', width: 140 },
  { title: '校验结果 / 失败原因', dataIndex: 'reason' },
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

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-4 w-1 rounded-sm bg-[#1677ff]" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function excelSafeText(value) {
  const text = String(value ?? '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

async function readBatchFile(file) {
  const fileName = String(file?.name || '');
  if (!/\.(xls|xlsx)$/i.test(fileName)) {
    throw new Error('仅支持 .xls 或 .xlsx 文件');
  }
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error('Excel 文件没有可读取的工作表');

  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  if (!matrix.length) throw new Error('Excel 文件为空');

  const headers = matrix[0].map((value) => String(value || '').trim());
  if (
    headers.length !== BATCH_TEMPLATE_FIELDS.length
    || headers.some((value, index) => value !== BATCH_TEMPLATE_FIELDS[index])
  ) {
    throw new Error('导入的EXCEL和系统要求的模板不一致，请核查');
  }

  const rows = matrix.slice(1)
    .map((values, index) => {
      const line = { rowNo: index + 2 };
      BATCH_TEMPLATE_FIELDS.forEach((header, fieldIndex) => {
        line[header] = values[fieldIndex] ?? '';
      });
      return line;
    })
    .filter((line) => BATCH_TEMPLATE_FIELDS.some((header) => String(line[header] ?? '').trim()));

  if (!rows.length) throw new Error('Excel 文件没有可处理的数据');
  return rows;
}

function buildExportMatrix(rows) {
  const dataRows = rows.map((row, index) => ([
    index + 1,
    excelSafeText(row.tag),
    excelSafeText(row.contractNumber),
    excelSafeText(row.useCompany),
    '合约号码',
    excelSafeText(row.contractDesc),
    excelSafeText(row.packageContent),
    row.contractStartDate || '',
    row.contractEndDate || '',
    row.quantity ?? '',
    row.amount === '' || row.amount === null || row.amount === undefined ? '' : Number(row.amount),
    row.status || '',
    excelSafeText(row.warehouse),
    excelSafeText(row.usageDescription),
    excelSafeText(row.scrapReason),
    row.scrapDate || '',
    excelSafeText(row.ownerId),
    excelSafeText(row.ownerName),
    excelSafeText(row.idCard),
    excelSafeText(row.department),
    excelSafeText(row.jobLevel),
    row.claimDate || '',
    row.claimReason || '',
    row.applicationType || '',
    excelSafeText(row.applicationNo),
  ]));
  return [EXPORT_FIELDS, ...dataRows];
}

export default function ContractNumberMaintenancePage() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const hasAccess = hasContractNumberMaintenanceAccess(CURRENT_CONTRACT_NUMBER_OPERATOR);
  const [rows, setRows] = useState(() => (
    hasAccess ? getContractNumberMaintenanceRows(CURRENT_CONTRACT_NUMBER_OPERATOR) : []
  ));
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
    jobLevel: row.jobLevel,
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
      if (f.departments.length && !f.departments.some((department) => String(row.department || '').startsWith(department))) return false;
      if (f.jobLevels.length && !f.jobLevels.includes(row.jobLevel)) return false;
      if (f.claimDate.length === 2 && (!row.claimDate || row.claimDate < f.claimDate[0] || row.claimDate > f.claimDate[1])) return false;
      if (f.claimReasons.length && !f.claimReasons.includes(row.claimReason)) return false;
      if (f.applicationTypes.length && !f.applicationTypes.includes(row.applicationType)) return false;
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
    closeCard();
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
      const nextRows = updateContractNumberMaintenanceRow(activeRow.id, patch, CURRENT_CONTRACT_NUMBER_OPERATOR);
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
    const selectedSet = new Set(selectedRowKeys.map(String));
    const exportRows = selectedRowKeys.length
      ? filteredRows.filter((row) => selectedSet.has(String(row.id)))
      : filteredRows;
    if (!exportRows.length) {
      messageApi.warning('当前没有可导出的数据');
      return;
    }
    Modal.confirm({
      title: '导出确认',
      content: selectedRowKeys.length ? '确定要导出选中的数据吗?' : '确定要导出列表中的数据吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const worksheet = XLSX.utils.aoa_to_sheet(buildExportMatrix(exportRows));
        worksheet['!cols'] = EXPORT_FIELDS.map((field) => ({ wch: Math.max(12, Math.min(28, field.length * 2 + 6)) }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '合约号码明细');
        const fileName = `导出合约号码信息-${dayjs().format('YYYYMMDD')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        messageApi.success(`导出成功，共 ${exportRows.length} 条`);
      },
    });
  };

  const handleTemplateDownload = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([BATCH_TEMPLATE_FIELDS]);
    worksheet['!cols'] = BATCH_TEMPLATE_FIELDS.map((field) => ({ wch: Math.max(14, field.length * 2 + 6) }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '批量修改');
    XLSX.writeFile(workbook, '合约号码批量修改模板.xlsx');
    messageApi.success(`模板下载成功（${BATCH_TEMPLATE_FIELDS.length}列）`);
  };

  const resetBatchState = () => {
    setBatchFiles([]);
    setBatchValidation(null);
  };

  const handleBatchAction = async () => {
    if (!batchFiles.length) {
      messageApi.warning('请先选择需要上传的 Excel 文件');
      return;
    }

    if (batchValidation?.status === 'passed') {
      const result = batchUpdateContractNumberMaintenanceRows(
        batchValidation.batchRows,
        CURRENT_CONTRACT_NUMBER_OPERATOR,
        batchValidation.versions,
      );
      if (result.status === 'failed') {
        setBatchValidation({
          ...batchValidation,
          status: 'failed',
          errors: result.errors,
        });
        messageApi.error('保存失败，本次文件未修改任何号码');
        return;
      }
      setRows(result.rows);
      setSelectedRowKeys([]);
      setPage(1);
      setBatchOpen(false);
      resetBatchState();
      messageApi.success(`修改成功！实际修改 ${result.modifiedCount} 条，无变化 ${result.unchangedCount} 条`);
      return;
    }

    try {
      const batchRows = await readBatchFile(batchFiles[0]?.originFileObj || batchFiles[0]);
      const result = validateContractNumberBatchRows(batchRows, CURRENT_CONTRACT_NUMBER_OPERATOR);
      const nextValidation = { ...result, batchRows };
      setBatchValidation(nextValidation);
      if (result.status === 'failed') {
        messageApi.error('文件校验失败，本次文件未保存');
      } else {
        messageApi.success('文件校验通过，请确认保存');
      }
    } catch (error) {
      setBatchValidation({
        status: 'failed',
        errors: [{
          id: 'contract-batch-file-error',
          rowNo: '-',
          tag: '',
          field: '',
          reason: error.message || '文件读取失败',
        }],
      });
      messageApi.error(error.message || '文件读取失败');
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
      onClear={() => updateFilter(field, [])}
    />
  );

  const multiSelect = (field, options, placeholder = '请选择') => (
    <Select
      mode="multiple"
      allowClear
      value={draftFilters[field]}
      style={{ width: '100%' }}
      placeholder={placeholder}
      options={options.map((value) => ({ label: value || '空', value }))}
      onChange={(value) => updateFilter(field, value)}
    />
  );

  const renderBasicQuery = () => (
    <>
      <QueryItem label="标签号">
        <Input value={draftFilters.tag} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('tag', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="合约号码">
        <Input value={draftFilters.contractNumber} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('contractNumber', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="使用公司">{multiSelect('useCompanies', uniqueValues(rows, 'useCompany'))}</QueryItem>
      <QueryItem label="合约号码说明">
        <Input value={draftFilters.contractDesc} allowClear placeholder="支持模糊" onChange={(event) => updateFilter('contractDesc', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="套餐内容">
        <Input value={draftFilters.packageContent} allowClear placeholder="支持模糊" onChange={(event) => updateFilter('packageContent', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="号码状态">{multiSelect('statuses', STATUS_OPTIONS)}</QueryItem>
      <QueryItem label="仓库">{multiSelect('warehouses', WAREHOUSE_OPTIONS)}</QueryItem>
      <QueryItem label="责任人">{renderLookup('owners', '请选择责任人')}</QueryItem>
    </>
  );

  const renderMoreQuery = () => (
    <>
      <QueryItem label="合约期限">
        <RangePicker
          style={{ width: '100%' }}
          value={draftFilters.contractTerm.length === 2 ? draftFilters.contractTerm.map((value) => dayjs(value)) : null}
          onChange={(dates) => updateFilter('contractTerm', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])}
        />
      </QueryItem>
      <QueryItem label="金额">
        <Space.Compact block>
          <InputNumber min={0} precision={2} value={draftFilters.amountMin} placeholder="最小值" onChange={(value) => updateFilter('amountMin', value)} style={{ width: '50%' }} />
          <InputNumber min={0} precision={2} value={draftFilters.amountMax} placeholder="最大值" onChange={(value) => updateFilter('amountMax', value)} style={{ width: '50%' }} />
        </Space.Compact>
      </QueryItem>
      <QueryItem label="部门">{multiSelect('departments', departmentOptions)}</QueryItem>
      <QueryItem label="员工职级">{multiSelect('jobLevels', uniqueValues(rows, 'jobLevel'))}</QueryItem>
      <QueryItem label="领用日期">
        <RangePicker style={{ width: '100%' }} value={draftFilters.claimDate.length === 2 ? draftFilters.claimDate.map((value) => dayjs(value)) : null} onChange={(dates) => updateFilter('claimDate', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])} />
      </QueryItem>
      <QueryItem label="领用原因">{multiSelect('claimReasons', APPLICATION_TYPE_OPTIONS)}</QueryItem>
      <QueryItem label="申请类型">{multiSelect('applicationTypes', APPLICATION_TYPE_OPTIONS)}</QueryItem>
      <QueryItem label="申请单号">
        <Input value={draftFilters.applicationNo} allowClear placeholder="支持文本、多值" onChange={(event) => updateFilter('applicationNo', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="报废状态">
        <Select allowClear value={draftFilters.scrapStatus || undefined} options={['已报废', '未报废'].map((value) => ({ label: value, value }))} onChange={(value) => updateFilter('scrapStatus', value || '')} />
      </QueryItem>
      <QueryItem label="报废原因">
        <Input value={draftFilters.scrapReason} allowClear placeholder="支持模糊、多值" onChange={(event) => updateFilter('scrapReason', event.target.value)} onPressEnter={handleQuery} />
      </QueryItem>
      <QueryItem label="报废日期">
        <RangePicker style={{ width: '100%' }} value={draftFilters.scrapDate.length === 2 ? draftFilters.scrapDate.map((value) => dayjs(value)) : null} onChange={(dates) => updateFilter('scrapDate', dates ? dates.map((date) => date.format('YYYY-MM-DD')) : [])} />
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
    sortableColumn('资产小类', 'minorCategory', 120),
    sortableColumn('合约号码说明', 'contractDesc', 200),
    sortableColumn('套餐内容', 'packageContent', 280),
    { title: '合约期限', width: 220, sorter: (a, b) => compareValue(a.contractStartDate, b.contractStartDate), render: (_, row) => contractTermText(row) },
    sortableColumn('数量', 'quantity', 80, { number: true, align: 'right' }),
    sortableColumn('金额', 'amount', 120, { number: true, align: 'right', render: amountText }),
    sortableColumn('号码状态', 'status', 140, { render: (value) => <StatusTag value={value} type="business" /> }),
    sortableColumn('仓库', 'warehouse', 180),
    sortableColumn('使用说明', 'usageDescription', 220),
    { title: '责任人', dataIndex: 'ownerName', width: 170, sorter: (a, b) => `${a.ownerId}-${a.ownerName}`.localeCompare(`${b.ownerId}-${b.ownerName}`, 'zh-CN'), render: (_, row) => `${row.ownerId}-${row.ownerName}` },
    sortableColumn('部门', 'department', 200),
    sortableColumn('员工职级', 'jobLevel', 110),
    sortableColumn('领用日期', 'claimDate', 120),
    sortableColumn('领用原因', 'claimReason', 130),
    sortableColumn('申请类型', 'applicationType', 130),
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      align: 'center',
      render: (_, row) => <Button type="link" onClick={() => openCard(row, 'edit')}>编辑</Button>,
    },
  ];

  const source = cardMode === 'edit' && editDraft ? editDraft : activeRow;
  const editable = (field, control) => (cardMode === 'edit' ? control : displayText(source?.[field]));
  const isInUse = String(editDraft?.status || '').includes('在用');
  const isScrapped = String(editDraft?.status || '').includes('报废');

  const detailTab = source ? (
    <DetailGrid columns={3} labelWidth={112}>
      <DetailItem label="标签号">{displayText(source.tag)}</DetailItem>
      <DetailItem label="合约号码">{editable('contractNumber', <Input value={editDraft?.contractNumber || ''} maxLength={25} allowClear onChange={(event) => updateEdit('contractNumber', event.target.value)} />)}</DetailItem>
      <DetailItem label="使用公司">{cardMode === 'edit' ? <LookupInput value={editDraft?.useCompany || ''} placeholder="请选择使用公司" onOpen={() => setLookupKey('editCompany')} /> : displayText(source.useCompany)}</DetailItem>
      <DetailItem label="资产小类">{displayText(source.minorCategory)}</DetailItem>
      <DetailItem label="合约号码说明">{displayText(source.contractDesc)}</DetailItem>
      <DetailItem label="套餐内容">{displayText(source.packageContent)}</DetailItem>
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
      <DetailItem label="数量">{displayText(source.quantity)}</DetailItem>
      <DetailItem label="金额">{editable('amount', <InputNumber min={0} max={99999999.99} precision={2} style={{ width: '100%' }} value={editDraft?.amount} onChange={(value) => updateEdit('amount', value)} />)}</DetailItem>
      <DetailItem label="号码状态">{editable('status', <Select value={editDraft?.status || undefined} style={{ width: '100%' }} options={STATUS_OPTIONS.map((value) => ({ label: value, value }))} onChange={(value) => updateEdit('status', value)} />)}</DetailItem>
      <DetailItem label="仓库">
        {cardMode === 'edit' && isInUse ? displayText('') : editable('warehouse', (
          <Select
            allowClear
            value={editDraft?.warehouse || undefined}
            placeholder="请选择仓库"
            style={{ width: '100%' }}
            options={WAREHOUSE_OPTIONS.map((value) => ({ label: value, value }))}
            onChange={(value) => updateEdit('warehouse', value || '')}
          />
        ))}
      </DetailItem>
      <DetailItem label="使用说明" span={3}>{editable('usageDescription', <TextArea value={editDraft?.usageDescription || ''} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('usageDescription', event.target.value)} />)}</DetailItem>
      <DetailItem label="报废原因" span={2}>
        {cardMode === 'edit' && !isScrapped
          ? displayText('')
          : editable('scrapReason', <TextArea value={editDraft?.scrapReason || ''} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(event) => updateEdit('scrapReason', event.target.value)} />)}
      </DetailItem>
      <DetailItem label="报废日期">
        {cardMode === 'edit'
          ? (isScrapped
            ? <DatePicker style={{ width: '100%' }} value={editDraft?.scrapDate ? dayjs(editDraft.scrapDate) : null} onChange={(date) => updateEdit('scrapDate', date ? date.format('YYYY-MM-DD') : '')} />
            : displayText(''))
          : displayText(source.scrapDate)}
      </DetailItem>
      <DetailItem label="责任人">{cardMode === 'edit' ? <LookupInput value={editDraft?.ownerId ? `${editDraft.ownerId}-${editDraft.ownerName}` : ''} placeholder="请选择责任人" onOpen={() => setLookupKey('editOwner')} /> : `${source.ownerId}-${source.ownerName}`}</DetailItem>
      <DetailItem label="身份证号码">{editable('idCard', <Input value={editDraft?.idCard || ''} allowClear onChange={(event) => updateEdit('idCard', event.target.value)} />)}</DetailItem>
      <DetailItem label="部门">{displayText(source.department)}</DetailItem>
      <DetailItem label="员工职级">{displayText(source.jobLevel)}</DetailItem>
      <DetailItem label="领用日期">
        {cardMode === 'edit' ? (
          <DatePicker style={{ width: '100%' }} value={editDraft?.claimDate ? dayjs(editDraft.claimDate) : null} onChange={(date) => updateEdit('claimDate', date ? date.format('YYYY-MM-DD') : '')} />
        ) : displayText(source.claimDate)}
      </DetailItem>
      <DetailItem label="领用原因">{editable('claimReason', (
        <Select
          allowClear
          value={editDraft?.claimReason || undefined}
          style={{ width: '100%' }}
          options={APPLICATION_TYPE_OPTIONS.map((value) => ({ label: value, value }))}
          onChange={(value) => updateEdit('claimReason', value || '')}
        />
      ))}</DetailItem>
      <DetailItem label="申请类型">{displayText(source.applicationType)}</DetailItem>
      <DetailItem label="申请单号">{displayText(source.applicationNo)}</DetailItem>
    </DetailGrid>
  ) : null;

  const historyRows = useMemo(() => {
    if (!source) return [];
    return [...(source.transactionHistory || [])]
      .map((item) => ({
        ...item,
        company: item.useCompany || item.company || '',
        owner: item.ownerId || item.ownerName
          ? [item.ownerId, item.ownerName].filter(Boolean).join('-')
          : (item.owner || ''),
        contractTerm: item.contractStartDate || item.contractEndDate
          ? `${displayText(item.contractStartDate)} 至 ${displayText(item.contractEndDate)}`
          : '',
      }))
      .sort((a, b) => (
        String(b.operationDate || '').localeCompare(String(a.operationDate || ''))
        || Number(b.sortSequence || 0) - Number(a.sortSequence || 0)
        || String(b.id || '').localeCompare(String(a.id || ''), 'zh-CN', { numeric: true })
      ));
  }, [source]);

  const historyColumns = HISTORY_COLUMNS.map(([title, dataIndex, width]) => ({
    title,
    dataIndex,
    width,
    render: (value) => dataIndex === 'amount' ? amountText(value) : displayText(value),
    onCell: (record) => {
      if (!HISTORY_CHANGE_FIELDS.has(dataIndex)) return {};
      const index = historyRows.findIndex((item) => item.id === record.id);
      if (index < 0 || index >= historyRows.length - 1) return {};
      const previousVersion = historyRows[index + 1];
      return String(previousVersion?.[dataIndex] ?? '') !== String(record?.[dataIndex] ?? '')
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

  if (!hasAccess) {
    return (
      <Result
        status="403"
        title="403"
        subTitle={`合约号码维护仅开放给${CONTRACT_NUMBER_MAINTENANCE_USERS.join('、')}`}
      />
    );
  }

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
            <Button type="link" icon={moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} onClick={() => setMoreOpen((current) => !current)}>{moreOpen ? '收起' : '更多条件'}</Button>
          </>
        )}
      >
        {renderBasicQuery()}
        {moreOpen ? renderMoreQuery() : null}
      </QueryBar>

      <Card size="small" title="合约号码列表" extra={<Typography.Text type="secondary">共 {filteredRows.length} 条</Typography.Text>}>
        <div className="mb-3 flex justify-end">
          <Space wrap>
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
              department: selected?.department || '',
              jobLevel: selected?.jobLevel || '',
            } : current);
          }
          setLookupKey('');
        }}
      />

      <Modal
        title={`合约号码信息${source?.tag ? `：${source.tag}` : ''}`}
        open={cardOpen}
        width={960}
        style={{ maxWidth: 'calc(100vw - 48px)' }}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        footer={cardMode === 'edit' ? [
          <Button key="cancel" onClick={cancelEdit}>取消</Button>,
          <Button key="save" type="primary" onClick={saveContractNumber}>保存</Button>,
        ] : null}
        onCancel={closeCard}
        destroyOnHidden
      >
        {cardMode === 'edit' ? detailTab : <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />}
      </Modal>

      <Modal
        title="合约号码批量修改"
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
            message="批量修改空白表示保留原值"
            description="全部行校验通过后才能保存，任一行失败时整份文件不保存。"
          />
          <div className="text-sm text-gray-600">
            <Typography.Text strong>批量修改规则：</Typography.Text>
            <ul className="mb-0 mt-2 list-disc space-y-1 pl-5">
              <li>标签号必填并用于定位既有合约号码。</li>
              <li>除标签号外，其余模板字段空白表示保留原值，不进行覆盖。</li>
              <li>全部行校验通过后才能保存，任一行失败时整份文件不保存。</li>
            </ul>
          </div>
          <div>
            <Typography.Text strong>模板列：</Typography.Text>
            <Typography.Text>{BATCH_TEMPLATE_FIELDS.join('、')}</Typography.Text>
          </div>
          <Button icon={<Download size={14} />} onClick={handleTemplateDownload}>下载模板</Button>
          <Dragger
            accept=".xls,.xlsx"
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
            <p className="ant-upload-hint">支持固定合约号码批量修改模板 .xls / .xlsx 文件；先校验全部行，通过后才能保存</p>
          </Dragger>
          <Typography.Text type="secondary">系统按 15 列模板逐行校验；空白单元格保留原值，全部通过后才可保存。</Typography.Text>
          {batchValidation?.status === 'passed' ? <Alert type="success" showIcon message="文件校验通过" description="全部行校验通过，可点击“保存”完成批量修改。" /> : null}
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
