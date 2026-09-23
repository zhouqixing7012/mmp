import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

export const INBOUND_IMPORT_HEADERS = {
  '借用归还': [
    '错误提示', '资产标签号*', 'SN号', '责任人(员工编号)*', '库区', '货位', '资产标记',
    '归还日期(YYYY-MM-DD)', '鉴定结果', '归还说明',
  ],
  '退库入库': [
    '错误提示', '资产标签号*', 'SN号', '退库数量', '责任人(员工编号)*', '库区', '货位', '资产标记',
    '退库日期(YYYY-MM-DD)', '退库原因', '鉴定结果', '退库说明',
  ],
  '新增入库': [
    '错误提示', '资产标签号*', '物资编码*', '物资大类', '物资小类', '品牌', '规格型号', '配置', 'SN号',
    '库区', '货位', '入库批次', '入库数量*', '合同编号', '原值*', '税金*', 'City', 'Building*', 'Floor', 'Room',
    '责任人(员工编号)*', '板块', '购置日期(YYYY-MM-DD)*', '启用日期(YYYY-MM-DD)', '级别', '新增类型*', '业务线', '项目',
    '申请人(员工编号)', 'PR单号', '申请单号', 'PO单号', '主资产标签号', '供应商', '备注', '服务', '小服务',
    'NO位置', 'Cabinet', 'ILO', 'ILOPW', 'IP1', 'IP2', 'IP3', '入库说明',
  ],
};

const TEMPLATE_SHEET_NAMES = {
  '借用归还': '借用归还模板',
  '退库入库': '退库入库模板',
  '新增入库': '新增入库模板',
};

export const INBOUND_IMPORT_TEMPLATE_NAMES = {
  '借用归还': '借用归还数据导入模板.xls',
  '退库入库': '退库入库数据导入模板.xls',
  '新增入库': '新增入库数据导入模板.xls',
};

const APPRAISAL_RESULTS = ['鉴定通过', '鉴定不通过'];
const NEW_INBOUND_HELPER_ROWS = [
  ['新增类型', '用途', '级别', '', ''],
  ['报废新增', '专业用途', '高端', 'B1', '在库-新增'],
  ['采购新增', '其他用途', '标配主机', 'B2', ''],
  ['历史新增', '员工用机', '中低端', 'B3', ''],
  ['收购新增', '部门公用', '技术笔记本', '1层', ''],
  ['再利用新增', '', '高级主机', '2层', ''],
  ['转移新增', '', '设计显示器', '3层', ''],
  ['', '', '苹果机', '4层', ''],
  ['', '', '标配笔记本', '5层', ''],
  ['', '', '标配显示器', '6层', ''],
  ['', '', '缺省', '7层', ''],
  ...Array.from({ length: 36 }, (_, index) => ['', '', '', `${index + 8}层`, '']),
];

function normalizeCell(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeHeader(value) {
  return normalizeCell(value).replace(/\s+/g, '');
}

function normalizeDate(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return dayjs('1899-12-30').add(value, 'day').format('YYYY-MM-DD');
  }
  return normalizeCell(value);
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).format('YYYY-MM-DD') === value;
}

function employeeCode(value) {
  return normalizeCell(value).split(/[.\-_]/)[0].toUpperCase();
}

function comparable(value) {
  const text = normalizeCell(value);
  const parts = text.split(/[._]/);
  return (parts.length > 1 ? parts.slice(1).join('.') : text).replace(/\s+/g, '').toUpperCase();
}

function sameBusinessValue(left, right) {
  if (!normalizeCell(left) || !normalizeCell(right)) return false;
  return normalizeCell(left) === normalizeCell(right) || comparable(left) === comparable(right);
}

function findByCodeOrDesc(list, value) {
  const target = normalizeCell(value);
  if (!target) return null;
  return (list || []).find((item) => (
    sameBusinessValue(item.code, target)
    || sameBusinessValue(item.desc, target)
    || sameBusinessValue(item.name, target)
    || sameBusinessValue(item.employeeNo, target)
    || sameBusinessValue(item.id, target)
  )) || null;
}

function findEmployee(list, value) {
  const code = employeeCode(value);
  if (!code) return null;
  return (list || []).find((item) => employeeCode(item.employeeNo || item.code || item.name) === code) || null;
}

function isAssetOrHighValue(material) {
  const value = `${material?.materialGroup || ''} ${material?.assetClass || ''}`.toUpperCase();
  return value.includes('资产') || value.includes('高耗') || value.includes('HIGH');
}

function isInfraMaterial(material) {
  const value = `${material?.assetClass || ''} ${material?.assetSubClass || ''}`.toUpperCase();
  return value.includes('SERVER') || value.includes('NET EQUIPMENT') || value.includes('服务器') || value.includes('网络设备');
}

function isQuantityDrivenReturn(asset) {
  const value = `${asset?.materialGroup || ''} ${asset?.assetClass || ''}`;
  return value.includes('低耗') || value.includes('耗材') || value.includes('文具');
}

function isValidFloor(value) {
  if (!value) return true;
  if (value === '缺省') return true;
  const matched = String(value).match(/^(\d{1,2})(?:层|F)$/i);
  return Boolean(matched && Number(matched[1]) >= 1 && Number(matched[1]) <= 43);
}

function isValidIp(value) {
  if (!value) return true;
  const parts = String(value).split('.');
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

function uniqueIdentity(assetTag, sn) {
  return normalizeCell(assetTag) || normalizeCell(sn);
}

function lookupAsset(assetPool, assetTag, sn) {
  if (assetTag) return (assetPool || []).find((item) => normalizeCell(item.assetTag) === assetTag) || null;
  if (sn) return (assetPool || []).find((item) => normalizeCell(item.sn) === sn) || null;
  return null;
}

function templateHelperSheet(type) {
  if (type === '新增入库') return { name: 'Sheet4', rows: NEW_INBOUND_HELPER_ROWS };
  return {
    name: 'Sheet3',
    rows: [
      ['在库-待处理'],
      [''],
      [''],
      [''],
      ['鉴定通过'],
      ['鉴定不通过'],
    ],
  };
}

function buildWorkbook(type, matrix) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(matrix);
  sheet['!cols'] = INBOUND_IMPORT_HEADERS[type].map((header) => ({ wch: Math.max(14, Math.min(26, header.length * 2 + 2)) }));
  XLSX.utils.book_append_sheet(workbook, sheet, TEMPLATE_SHEET_NAMES[type]);
  const helper = templateHelperSheet(type);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(helper.rows), helper.name);
  return workbook;
}

function triggerWorkbookDownload(workbook, filename) {
  const output = XLSX.write(workbook, { bookType: 'xls', type: 'array' });
  const url = URL.createObjectURL(new Blob([output], { type: 'application/vnd.ms-excel' }));
  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadInboundImportTemplate(type) {
  const headers = INBOUND_IMPORT_HEADERS[type];
  if (!headers) return;
  triggerWorkbookDownload(buildWorkbook(type, [headers]), INBOUND_IMPORT_TEMPLATE_NAMES[type]);
}

export function downloadInboundImportErrors(type, matrix, errors) {
  const rows = (matrix || []).map((row) => [...row]);
  errors.forEach((item) => {
    const rowIndex = item.rowIndex;
    rows[rowIndex] = rows[rowIndex] || [];
    rows[rowIndex][0] = item.error;
  });
  triggerWorkbookDownload(buildWorkbook(type, rows), `${type}数据导入错误结果.xls`);
}

export async function readInboundImportFile(file, type) {
  const expectedHeaders = INBOUND_IMPORT_HEADERS[type];
  if (!expectedHeaders) throw new Error('当前入库类型不支持批量导入');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '', raw: true });
  const actualHeaders = (matrix[0] || []).slice(0, expectedHeaders.length).map(normalizeHeader);
  if (
    actualHeaders.length !== expectedHeaders.length
    || actualHeaders.some((header, index) => header !== normalizeHeader(expectedHeaders[index]))
  ) {
    throw new Error(`模板表头不匹配，请下载当前“${type}”模板后重新导入`);
  }
  return matrix;
}

function validateExistingDuplicate(existingLines, identity) {
  if (!identity) return false;
  return (existingLines || []).some((line) => uniqueIdentity(line.assetTag, line.sn) === identity);
}

function validateBorrowReturn(matrix, context) {
  const headers = INBOUND_IMPORT_HEADERS['借用归还'];
  const dataRows = matrix.slice(1).filter((row) => row.some((cell, index) => index > 0 && normalizeCell(cell)));
  const used = new Set();
  const errors = [];
  const validLines = [];
  const warehouseCompany = context.warehouseContext?.company || '';

  dataRows.forEach((row, offset) => {
    const rowIndex = offset + 1;
    const values = Array.from({ length: headers.length }, (_, index) => index === 0 ? normalizeCell(row[index]) : normalizeCell(row[index]));
    const [, assetTag, sn, responsibleNo, warehouseArea, warehouseLocation, assetMark, returnDateRaw, appraisalResult, returnDescription] = values;
    const rowErrors = [];
    const asset = lookupAsset(context.assetPool, assetTag, sn);
    if (!assetTag && !sn) rowErrors.push('资产标签号和SN号至少填写一个');
    if (!asset) rowErrors.push('未找到对应资产');
    if (asset && asset.assetStatus !== '在用-借用中') rowErrors.push('资产状态必须为在用-借用中');
    if (asset && warehouseCompany && !sameBusinessValue(asset.company, warehouseCompany)) rowErrors.push('资产所属公司与当前仓库公司不一致');

    const identity = uniqueIdentity(asset?.assetTag || assetTag, asset?.sn || sn);
    if (identity && used.has(identity)) rowErrors.push('同一文件存在重复资产');
    if (identity && validateExistingDuplicate(context.existingLines, identity)) rowErrors.push('当前入库单已存在同一资产');
    if (identity) used.add(identity);

    if (!responsibleNo) rowErrors.push('责任人必须填写');
    const responsible = findEmployee(context.employees, responsibleNo);
    if (responsibleNo && !responsible) rowErrors.push('责任人不存在或已失效');
    if (responsible && asset?.company && responsible.company && !sameBusinessValue(responsible.company, asset.company)) rowErrors.push('责任人与资产所属公司不一致');
    if (responsible && asset?.plate && responsible.plate && !sameBusinessValue(responsible.plate, asset.plate)) rowErrors.push('责任人与资产所属板块不一致');

    const returnDate = normalizeDate(returnDateRaw) || dayjs().format('YYYY-MM-DD');
    if (!isValidDate(returnDate)) rowErrors.push('归还日期必须为YYYY-MM-DD');
    if (appraisalResult && !APPRAISAL_RESULTS.includes(appraisalResult)) rowErrors.push('鉴定结果不是系统有效值');

    if (rowErrors.length) {
      errors.push({ rowIndex, error: rowErrors.join('；') });
      return;
    }

    validLines.push({
      ...asset,
      id: `import-borrow-${rowIndex}-${identity}`,
      quantity: Number(asset.quantity || asset.borrowQty || 1),
      returnQty: Number(asset.quantity || asset.borrowQty || 1),
      responsiblePerson: responsible?.name || responsibleNo,
      warehouseArea,
      warehouseLocation,
      assetMark,
      returnDate,
      appraisalResult,
      usageDesc: returnDescription,
      inboundStatus: '在库-待处理',
      returnType: '',
      uploadSource: 'Excel导入',
    });
  });
  return { validLines, errors };
}

function validateReturnInbound(matrix, context) {
  const headers = INBOUND_IMPORT_HEADERS['退库入库'];
  const dataRows = matrix.slice(1).filter((row) => row.some((cell, index) => index > 0 && normalizeCell(cell)));
  const used = new Set();
  const errors = [];
  const validLines = [];
  const warehouseCompany = context.warehouseContext?.company || '';

  dataRows.forEach((row, offset) => {
    const rowIndex = offset + 1;
    const values = Array.from({ length: headers.length }, (_, index) => normalizeCell(row[index]));
    const [, assetTag, sn, returnQtyRaw, responsibleNo, warehouseArea, warehouseLocation, assetMark, returnDateRaw, returnReason, appraisalResult, returnDescription] = values;
    const rowErrors = [];
    const asset = lookupAsset(context.assetPool, assetTag, sn);
    if (!assetTag && !sn) rowErrors.push('资产标签号和SN号至少填写一个');
    if (!asset) rowErrors.push('未找到对应资产');
    if (asset && asset.assetStatus !== '在用-使用中') rowErrors.push('资产状态必须为在用-使用中');
    if (asset && warehouseCompany && !sameBusinessValue(asset.company, warehouseCompany)) rowErrors.push('资产所属公司与当前仓库公司不一致');

    const identity = uniqueIdentity(asset?.assetTag || assetTag, asset?.sn || sn);
    if (identity && used.has(identity)) rowErrors.push('同一文件存在重复资产');
    if (identity && validateExistingDuplicate(context.existingLines, identity)) rowErrors.push('当前入库单已存在同一资产');
    if (identity) used.add(identity);

    let returnQty = Number(asset?.quantity || 1);
    if (asset && isQuantityDrivenReturn(asset)) {
      returnQty = Number(returnQtyRaw);
      if (!returnQtyRaw || !Number.isFinite(returnQty) || returnQty <= 0) rowErrors.push('低耗物资退库数量必须大于0');
    }

    if (!responsibleNo) rowErrors.push('责任人必须填写');
    const responsible = findEmployee(context.employees, responsibleNo);
    if (responsibleNo && !responsible) rowErrors.push('责任人不存在或已失效');

    const returnDate = normalizeDate(returnDateRaw) || dayjs().format('YYYY-MM-DD');
    if (!isValidDate(returnDate)) rowErrors.push('退库日期必须为YYYY-MM-DD');
    if (appraisalResult && !APPRAISAL_RESULTS.includes(appraisalResult)) rowErrors.push('鉴定结果不是系统有效值');

    if (rowErrors.length) {
      errors.push({ rowIndex, error: rowErrors.join('；') });
      return;
    }

    validLines.push({
      ...asset,
      id: `import-return-${rowIndex}-${identity}`,
      quantity: returnQty,
      returnQty,
      responsiblePerson: responsible?.name || responsibleNo,
      warehouseArea,
      warehouseLocation,
      assetMark,
      returnDate,
      returnReason,
      appraisalNo,
      appraisalResult,
      appraiser: appraiser?.name || appraiserNo,
      appraisalDate,
      usageDesc: returnDescription,
      inboundStatus: '在库-待处理',
      returnType: '一般退库',
      uploadSource: 'Excel导入',
    });
  });
  return { validLines, errors };
}

function getHeaderIndex(headers, name) {
  return headers.findIndex((header) => normalizeHeader(header) === normalizeHeader(name));
}

function validateNewInbound(matrix, context) {
  const headers = INBOUND_IMPORT_HEADERS['新增入库'];
  const dataRows = matrix.slice(1).filter((row) => row.some((cell, index) => index > 0 && normalizeCell(cell)));
  const errors = [];
  const validLines = [];
  const usedTags = new Set((context.existingLines || []).map((line) => normalizeCell(line.assetTag)).filter(Boolean));
  const usedSns = new Set((context.existingLines || []).map((line) => normalizeCell(line.sn)).filter(Boolean));
  (context.assetPool || []).forEach((asset) => {
    if (asset.assetTag) usedTags.add(normalizeCell(asset.assetTag));
    if (asset.sn) usedSns.add(normalizeCell(asset.sn));
  });
  const warehouseContext = context.warehouseContext || {};

  dataRows.forEach((row, offset) => {
    const rowIndex = offset + 1;
    const cell = (name) => normalizeCell(row[getHeaderIndex(headers, name)]);
    const rowErrors = [];
    const assetTag = cell('资产标签号*');
    const materialCode = cell('物资编码*');
    const material = (context.materials || []).find((item) => normalizeCell(item.materialCode || item.code) === materialCode);
    if (!materialCode) rowErrors.push('物资编码必须填写');
    if (materialCode && !material) rowErrors.push('物资编码不存在');

    const major = cell('物资大类');
    const minor = cell('物资小类');
    const brand = cell('品牌');
    const model = cell('规格型号');
    const config = cell('配置');
    if (material && major && !sameBusinessValue(major, material.assetClass)) rowErrors.push('物资大类与物资编码不一致');
    if (material && minor && !sameBusinessValue(minor, material.assetSubClass)) rowErrors.push('物资小类与物资编码不一致');
    if (material && brand && !sameBusinessValue(brand, material.brand)) rowErrors.push('品牌与物资编码不一致');
    if (material && model && !sameBusinessValue(model, material.model)) rowErrors.push('规格型号与物资编码不一致');
    if (material && config && !sameBusinessValue(config, material.config)) rowErrors.push('配置与物资编码不一致');

    if (material && isAssetOrHighValue(material) && !assetTag) rowErrors.push('资产类或高耗物资必须填写资产标签号');
    if (assetTag && assetTag.length > 15) rowErrors.push('资产标签号长度不能超过15个字符');
    if (assetTag && usedTags.has(assetTag)) rowErrors.push('资产标签号已存在或在当前导入中重复');
    if (assetTag) usedTags.add(assetTag);

    const sn = cell('SN号');
    if (sn && sn.length > 35) rowErrors.push('SN号长度不能超过35个字符');
    if (sn && usedSns.has(sn)) rowErrors.push('SN号已存在或在当前导入中重复');
    if (sn) usedSns.add(sn);

    const quantity = Number(cell('入库数量*'));
    if (!Number.isFinite(quantity) || quantity <= 0) rowErrors.push('入库数量必须大于0');
    const originalValue = Number(cell('原值*'));
    if (!Number.isFinite(originalValue) || originalValue <= 0) rowErrors.push('原值必须大于0');
    const taxRaw = cell('税金*');
    const tax = taxRaw === '' ? 0 : Number(taxRaw);
    if (!Number.isFinite(tax) || tax < 0) rowErrors.push('税金不能小于0');

    const cityInput = cell('City');
    const buildingInput = cell('Building*');
    const city = cityInput || warehouseContext.city || '';
    const building = buildingInput || '';
    if (!building) rowErrors.push('Building必须填写');
    if (cityInput && warehouseContext.city && !sameBusinessValue(cityInput, warehouseContext.city)) rowErrors.push('City与当前仓库不一致');
    if (building && warehouseContext.building && !sameBusinessValue(building, warehouseContext.building)) rowErrors.push('Building不属于当前仓库所在City');
    const floor = cell('Floor');
    if (floor && !isValidFloor(floor)) rowErrors.push('Floor不是系统有效楼层');

    const responsibleNo = cell('责任人(员工编号)*');
    if (!responsibleNo) rowErrors.push('责任人必须填写');
    const responsible = findEmployee(context.employees, responsibleNo);
    if (responsibleNo && !responsible) rowErrors.push('责任人不存在或已失效');
    if (material && !isInfraMaterial(material) && !String(material.materialGroup || '').includes('高耗')) {
      const isVirtual = (context.virtualAdmins || []).some((item) => employeeCode(item.code || item.name) === employeeCode(responsibleNo));
      if (responsibleNo && !isVirtual) rowErrors.push('当前物资责任人必须为虚拟库管员');
    }

    const plateInput = cell('板块');
    const plate = plateInput || responsible?.plate || '';
    if (plateInput && !findByCodeOrDesc(context.plates, plateInput)) rowErrors.push('板块不是系统有效值');
    if (material && !isAssetOrHighValue(material) && !plateInput) rowErrors.push('非资产类物资必须填写板块');

    const addType = cell('新增类型*');
    if (!addType) rowErrors.push('新增类型必须填写');
    else if (!(context.addTypes || []).includes(addType)) rowErrors.push('新增类型不是系统有效值');

    const purchaseDate = normalizeDate(cell('购置日期(YYYY-MM-DD)*'));
    if (!isValidDate(purchaseDate)) rowErrors.push('购置日期必须为YYYY-MM-DD');
    const enableInput = normalizeDate(cell('启用日期(YYYY-MM-DD)'));
    let enableDate = enableInput;
    if (isValidDate(purchaseDate) && !enableDate) {
      enableDate = Number(purchaseDate.slice(-2)) <= 25
        ? purchaseDate
        : dayjs(purchaseDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
    }
    if (enableInput && !isValidDate(enableInput)) rowErrors.push('启用日期必须为YYYY-MM-DD');
    if (isValidDate(purchaseDate) && isValidDate(enableDate) && enableDate < purchaseDate) rowErrors.push('启用日期不能早于购置日期');
    if (isValidDate(purchaseDate) && Number(purchaseDate.slice(-2)) >= 26 && isValidDate(enableDate)) {
      const expected = dayjs(purchaseDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
      if (enableDate !== expected) rowErrors.push(`购置日期为26日以后时启用日期应为${expected}`);
    }

    const businessLine = cell('业务线');
    if (businessLine && !findByCodeOrDesc(context.businessLines, businessLine)) rowErrors.push('业务线不存在或未启用');
    const project = cell('项目');
    if (project && !findByCodeOrDesc(context.projects, project)) rowErrors.push('项目不存在或未启用');
    const applicantNo = cell('申请人(员工编号)');
    const applicant = applicantNo ? findEmployee(context.employees, applicantNo) : null;
    if (applicantNo && !applicant) rowErrors.push('申请人不存在或已失效');

    const mainAssetTag = cell('主资产标签号');
    if (mainAssetTag && !(context.assetPool || []).some((asset) => normalizeCell(asset.assetTag) === mainAssetTag)) rowErrors.push('主资产标签号不存在');
    const supplier = cell('供应商');
    if (supplier && !(context.suppliers || []).some((item) => sameBusinessValue(item.name || item, supplier))) rowErrors.push('供应商不存在');

    const service = cell('服务');
    const subService = cell('小服务');
    if (subService && !service) rowErrors.push('填写小服务前必须先填写服务');
    if (service && context.serviceMap && !context.serviceMap[service]) rowErrors.push('服务不是系统有效值');
    if (service && subService && context.serviceMap?.[service] && !context.serviceMap[service].includes(subService)) rowErrors.push('小服务不属于所选服务');

    ['IP1', 'IP2', 'IP3'].forEach((name) => {
      if (!isValidIp(cell(name))) rowErrors.push(`${name}不是有效IP地址`);
    });

    if (rowErrors.length) {
      errors.push({ rowIndex, error: rowErrors.join('；') });
      return;
    }

    validLines.push({
      id: `import-new-${rowIndex}-${assetTag || materialCode}`,
      materialCode,
      materialDesc: material?.materialDesc || material?.name || '',
      materialGroup: material?.materialGroup || '',
      assetClass: material?.assetClass || major,
      assetSubClass: material?.assetSubClass || minor,
      brand: material?.brand || brand,
      model: material?.model || model,
      config: material?.config || config,
      unit: material?.unit || '台',
      assetTag,
      sn,
      warehouseArea: cell('库区'),
      warehouseLocation: cell('货位'),
      applicationBatch: cell('入库批次'),
      quantity,
      contractNo: cell('合同编号'),
      originalValue,
      tax,
      city,
      building,
      floor,
      room: cell('Room'),
      responsiblePerson: responsible?.name || responsibleNo,
      department: responsible?.department || '',
      costCenter: responsible?.costCenter || '',
      company: warehouseContext.company || responsible?.company || '',
      plate,
      purchaseDate,
      enableDate,
      level: cell('级别') || material?.level || '',
      addType,
      businessLine,
      project,
      applicant: applicant?.name || applicantNo,
      prNo: cell('PR单号'),
      applicationNo: cell('申请单号'),
      poNo: cell('PO单号'),
      mainAssetTag,
      supplier,
      remark: cell('备注'),
      service,
      subService,
      noLocation: cell('NO位置'),
      cabinet: cell('Cabinet'),
      ilo: cell('ILO'),
      iloPassword: cell('ILOPW'),
      ip1: cell('IP1'),
      ip2: cell('IP2'),
      ip3: cell('IP3'),
      usageDesc: cell('入库说明'),
      assetStatus: '在库-新增',
      uploadSource: 'Excel导入',
    });
  });

  return { validLines, errors };
}

export function validateInboundImportRows(matrix, context) {
  if (context.inboundType === '借用归还') return validateBorrowReturn(matrix, context);
  if (context.inboundType === '退库入库') return validateReturnInbound(matrix, context);
  if (context.inboundType === '新增入库') return validateNewInbound(matrix, context);
  return { validLines: [], errors: [{ rowIndex: 1, error: '当前入库类型不支持批量导入' }] };
}
