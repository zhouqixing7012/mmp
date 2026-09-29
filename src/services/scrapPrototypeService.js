import { SCRAP_ASSET_POOL, getInitialBusinessRows } from '../pages/assetManagement/scrapPrototypeData';

const inMemoryRecords = new Map();
const TYPES = ['crossCompany', 'scrap', 'accounting', 'disposal'];

// 报废专项原型只保留当前页面会话内的操作结果。
// 刷新页面后重新加载最新 Mock，避免浏览器旧 LocalStorage 长期覆盖仓库里的演示数据。
export function getScrapPrototypeRecords(type) {
  if (!TYPES.includes(type)) throw new Error(`未知报废原型类型：${type}`);
  if (!inMemoryRecords.has(type)) {
    inMemoryRecords.set(type, getInitialBusinessRows(type));
  }
  return inMemoryRecords.get(type);
}

export function saveScrapPrototypeRecords(type, records) {
  if (!TYPES.includes(type)) throw new Error(`未知报废原型类型：${type}`);
  inMemoryRecords.set(type, records);
  return records;
}

export function resetScrapPrototypeMemory() {
  inMemoryRecords.clear();
}

function actorIdentity(actor) {
  if (!actor) return '';
  if (typeof actor === 'string') return actor.trim();
  return String(actor.id || actor.employeeId || actor.name || '').trim();
}

function normalizedScopes(options = {}) {
  if (!actorIdentity(options.actor) || !Array.isArray(options.authorizationScopes)) return [];
  return options.authorizationScopes.filter((item) => item?.company).map((item) => ({
    company: String(item.company),
    plates: item.plates === '*' ? '*' : Array.isArray(item.plates) ? item.plates.map(String) : [],
  }));
}

function isAuthorized(asset, options) {
  return normalizedScopes(options).some((scope) => scope.company === asset.company
    && (scope.plates === '*' || scope.plates.includes(String(asset.plate || ''))));
}

const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

function relatedAssetTag(asset) {
  return String(
    asset?.parentAssetTag
    || asset?.mainAssetTag
    || asset?.mainTagNo
    || asset?.mainTag
    || '',
  ).trim();
}

function scrapOccupation(tagNo, exceptRecordId) {
  return ['crossCompany', 'scrap'].flatMap((type) => getScrapPrototypeRecords(type))
    .find((record) => (
      !(type === 'scrap' && record.id === exceptRecordId)
      && (record.assetsSnapshot || []).some((asset) => asset?.tagNo === tagNo)
    )) || null;
}

export function prepareScrapAsset(asset) {
  const cardQuantity = positive(asset?.cardQuantity ?? asset?.assetCardQuantity ?? asset?.quantity);
  const requestedQuantity = positive(asset?.requestedScrapQuantity ?? asset?.scrapQuantity ?? asset?.quantity);
  if (!cardQuantity || !requestedQuantity || requestedQuantity > cardQuantity) return null;

  const cardOriginalValue = Number(asset?.cardOriginalValue ?? asset?.originalCardValue ?? asset?.originalValue ?? 0);
  const cardNetValue = Number(asset?.cardNetValue ?? asset?.originalCardNetValue ?? asset?.netValue ?? 0);
  const ratio = requestedQuantity / cardQuantity;
  const originalValue = money(cardOriginalValue * ratio);
  const netValue = money(cardNetValue * ratio);
  const remainingQuantity = cardQuantity - requestedQuantity;
  const remainingOriginalValue = money(cardOriginalValue - originalValue);
  const remainingNetValue = money(cardNetValue - netValue);

  return {
    ...asset,
    cardQuantity,
    requestedScrapQuantity: requestedQuantity,
    cardOriginalValue,
    cardNetValue,
    quantity: requestedQuantity,
    originalValue,
    netValue,
    accumulatedDepreciation: money(originalValue - netValue),
    remainingQuantity,
    remainingOriginalValue,
    remainingNetValue,
    detailScrapMethod: requestedQuantity < cardQuantity ? '部分报废' : '全部报废',
    dataCleaning: asset?.scope === '机房资产' && asset?.majorCategory === 'SERVER'
      ? asset.dataCleaning || '否'
      : undefined,
  };
}

export function getRelatedScrapAccessories(mainAsset, options = {}) {
  const mainTag = String(mainAsset?.tagNo || '').trim();
  if (!mainTag) return [];
  return SCRAP_ASSET_POOL
    .filter((asset) => relatedAssetTag(asset) === mainTag)
    .map(prepareScrapAsset)
    .filter(Boolean)
    .filter((asset) => (
      !String(asset.status || '').startsWith('已报废')
      && !String(asset.status || '').includes('待报废')
      && !scrapOccupation(asset.tagNo, options.recordId)
    ))
    .map((asset) => ({ ...asset, isAccessory: true, parentAssetTag: mainTag }));
}

export function getScrapCandidates(options = {}) {
  return SCRAP_ASSET_POOL
    .filter((asset) => !relatedAssetTag(asset))
    .filter((asset) => !options.assetScope || options.assetScope === '混合' || asset.scope === options.assetScope)
    .filter((asset) => (
      options.assetScope !== '机房资产'
      || !options.assetCategory
      || asset.majorCategory === options.assetCategory
    ))
    .map(prepareScrapAsset)
    .filter(Boolean)
    .filter((asset) => (
      !String(asset.status || '').startsWith('已报废')
      && !String(asset.status || '').includes('待报废')
      && !scrapOccupation(asset.tagNo, options.recordId)
    ));
}

export function validateScrapAssets(form, assets, options = {}) {
  const errors = [];
  if (!assets?.length) {
    if (!options.draft) errors.push({ code: 'ASSETS_REQUIRED', message: '请至少添加一条资产明细' });
    return { valid: errors.length === 0, errors };
  }

  const tags = new Set();
  const allTags = new Set((assets || []).map((asset) => String(asset?.tagNo || '').trim()).filter(Boolean));
  const scopes = new Set();
  const officePaths = new Set();

  assets.forEach((asset, index) => {
    const prefix = `第${index + 1}行`;
    const tagNo = String(asset?.tagNo || '').trim();
    if (!tagNo) {
      errors.push({ code: 'TAG_REQUIRED', index, message: `${prefix}资产标签号不能为空` });
      return;
    }
    if (tags.has(tagNo)) {
      errors.push({ code: 'DUPLICATE_ASSET', index, message: `${prefix}资产标签号重复` });
      return;
    }
    tags.add(tagNo);

    const source = SCRAP_ASSET_POOL.find((item) => item.tagNo === tagNo);
    if (!source) {
      errors.push({ code: 'ASSET_NOT_FOUND', index, message: `${prefix}资产不存在或已失效` });
      return;
    }

    const occupation = scrapOccupation(tagNo, options.recordId);
    if (occupation) {
      errors.push({
        code: 'ASSET_OCCUPIED',
        index,
        message: `${prefix}资产已在${occupation.applicationNo || occupation.id}中办理，不能重复选择`,
      });
    }

    if (String(source.status || '').startsWith('已报废') || String(source.status || '').includes('待报废')) {
      errors.push({ code: 'ASSET_NOT_AVAILABLE', index, message: `${prefix}资产已报废或已进入待报废流程` });
    }

    const normalized = prepareScrapAsset({
      ...source,
      ...asset,
      cardQuantity: asset.cardQuantity ?? source.cardQuantity ?? source.quantity,
      cardOriginalValue: asset.cardOriginalValue ?? source.cardOriginalValue ?? source.originalValue,
      cardNetValue: asset.cardNetValue ?? source.cardNetValue ?? source.netValue,
    });
    if (!normalized) {
      errors.push({ code: 'INVALID_QUANTITY', index, message: `${prefix}报废数量必须大于0且不得超过资产卡片数量` });
      return;
    }
    if (
      Number(asset.quantity) !== normalized.quantity
      || Number(asset.originalValue) !== normalized.originalValue
      || Number(asset.netValue) !== normalized.netValue
      || asset.detailScrapMethod !== normalized.detailScrapMethod
    ) {
      errors.push({ code: 'SCRAP_VALUE_MISMATCH', index, message: `${prefix}报废数量、报废方式或报废金额与资产卡片不一致` });
    }

    const relation = relatedAssetTag(asset);
    if (relation && !allTags.has(relation)) {
      errors.push({
        code: 'ORPHAN_ACCESSORY',
        index,
        message: `${prefix}关联配件缺少对应主资产，不能单独办理报废`,
      });
    }
    if (!options.allowIncompleteDetails && !relation && !String(asset.reason || '').trim()) {
      errors.push({ code: 'REASON_REQUIRED', index, message: `${prefix}报废原因未填写完整` });
    }

    if (!options.allowIncompleteDetails && asset.scope === '机房资产' && asset.majorCategory === 'SERVER'
      && !['是', '否'].includes(asset.dataCleaning)) {
      errors.push({ code: 'DATA_CLEANING_REQUIRED', index, message: `${prefix}服务器资产必须选择数据清洗` });
    }

    if (asset.scope) scopes.add(asset.scope);
    if (asset.scope === '办公设备') officePaths.add(['PC', 'NOTEBOOK'].includes(asset.majorCategory));
  });

  if (scopes.size > 1) {
    errors.push({ code: 'SCOPE_MIXED', message: '同一资产报废申请单不能混合机房资产、软件和办公设备' });
  }
  if (form?.assetScope && scopes.size === 1 && !scopes.has(form.assetScope)) {
    errors.push({ code: 'SCOPE_MISMATCH', message: '资产明细范围与单据资产范围不一致' });
  }
  if (form?.assetScope === '机房资产' && form.assetCategory
    && assets.some((asset) => !relatedAssetTag(asset) && asset.majorCategory !== form.assetCategory)) {
    errors.push({ code: 'MACHINE_CATEGORY_MISMATCH', message: '机房资产明细必须与所选资产大类一致' });
  }
  if (officePaths.size > 1) {
    errors.push({ code: 'OFFICE_PATH_MIXED', message: '电脑类与其他办公设备的鉴定流程不同，请分别建单' });
  }

  return { valid: errors.length === 0, errors };
}

function normalizeAccountingSource(asset, sourceType, record) {
  const transfer = sourceType === 'crossCompany';
  const requested = positive(asset.requestedScrapQuantity ?? asset.scrapQuantity ?? asset.quantity);
  const card = positive(asset.cardQuantity ?? asset.assetCardQuantity ?? asset.originalQuantity);
  // 旧报废记录若只有一个含义不明的数量，直接排除，不猜测全部或部分报废。
  if (!requested || (!transfer && (!card || requested > card))) return null;
  const cardQuantity = card || requested;
  const cardOriginalValue = Number(asset.cardOriginalValue ?? asset.originalCardValue ?? asset.originalValue ?? 0);
  const cardNetValue = Number(asset.cardNetValue ?? asset.originalCardNetValue ?? asset.netValue ?? 0);
  const ratio = requested / cardQuantity;
  const originalValue = money(cardOriginalValue * ratio);
  const netValue = money(cardNetValue * ratio);
  return {
    ...asset,
    quantity: requested,
    requestedScrapQuantity: requested,
    cardQuantity,
    cardOriginalValue,
    cardNetValue,
    originalValue,
    netValue,
    scrapMethod: transfer ? '调账' : '非调账',
    detailScrapMethod: transfer ? '调账' : requested < cardQuantity ? '部分报废' : '全部报废',
    scrapType: netValue === 0 ? '已到报废期' : '未到报废期',
    sourceBusinessType: transfer ? '跨公司转移' : '资产报废',
    sourceBusinessNo: record.applicationNo,
    status: String(asset.status || '').startsWith('在库') ? '在库-待报废' : asset.status,
  };
}

function occupiedAccountingTags(exceptRecordId) {
  return new Set(getScrapPrototypeRecords('accounting')
    .filter((record) => record.id !== exceptRecordId)
    .flatMap((record) => (record.assetsSnapshot || []).map((asset) => asset.tagNo)).filter(Boolean));
}

function sourceRecordFor(asset) {
  const sourceType = asset.sourceBusinessType === '跨公司转移'
    ? 'crossCompany'
    : asset.sourceBusinessType === '资产报废' ? 'scrap' : null;
  if (!sourceType || !asset.sourceBusinessNo) return null;
  const validStatuses = sourceType === 'crossCompany' ? ['已完成'] : ['已审批', '已完成'];
  return getScrapPrototypeRecords(sourceType).find((record) => (
    record.applicationNo === asset.sourceBusinessNo
    && validStatuses.includes(record.documentStatus)
    && (record.assetsSnapshot || []).some((item) => item?.tagNo === asset.tagNo)
  )) || null;
}

function accountingOccupation(tagNo, exceptRecordId) {
  return getScrapPrototypeRecords('accounting').find((record) => (
    record.id !== exceptRecordId
    && (record.assetsSnapshot || []).some((asset) => asset?.tagNo === tagNo)
  )) || null;
}

export function getAccountingCandidates(options = {}) {
  if (!normalizedScopes(options).length) return [];
  const occupied = occupiedAccountingTags(options.recordId);
  const result = new Map();
  for (const type of ['crossCompany', 'scrap']) {
    for (const record of getScrapPrototypeRecords(type)) {
      if (!['已完成', '已审批'].includes(record.documentStatus)) continue;
      for (const asset of record.assetsSnapshot || []) {
        const normalized = normalizeAccountingSource(asset, type, record);
        if (!normalized || (options.company && normalized.company !== options.company)
          || !isAuthorized(normalized, options) || occupied.has(normalized.tagNo)
          || String(normalized.status || '').startsWith('已报废')) continue;
        result.set(normalized.tagNo, normalized);
      }
    }
  }
  return [...result.values()];
}

export function getAccountingLostCandidates(options = {}) {
  if (!normalizedScopes(options).length) return [];
  const occupied = new Set([
    ...occupiedAccountingTags(options.recordId),
    ...getScrapPrototypeRecords('crossCompany').flatMap((record) => (record.assetsSnapshot || []).map((asset) => asset.tagNo)),
    ...getScrapPrototypeRecords('scrap').flatMap((record) => (record.assetsSnapshot || []).map((asset) => asset.tagNo)),
  ]);
  return SCRAP_ASSET_POOL.filter((asset) => (!options.company || asset.company === options.company)
    && isAuthorized(asset, options) && !occupied.has(asset.tagNo)
    && !String(asset.status || '').startsWith('已报废')
    && positive(asset.cardQuantity ?? asset.quantity)).map((asset) => {
    const cardQuantity = positive(asset.cardQuantity ?? asset.quantity);
    return {
      ...asset, quantity: cardQuantity, requestedScrapQuantity: cardQuantity, cardQuantity,
      cardOriginalValue: Number(asset.cardOriginalValue ?? asset.originalValue ?? 0),
      cardNetValue: Number(asset.cardNetValue ?? asset.netValue ?? 0),
      scrapMethod: '非调账', detailScrapMethod: '全部报废', scrapType: '丢失',
      sourceBusinessType: '丢失资产', sourceBusinessNo: '-',
    };
  });
}

export function requiresPhysicalDisposal(asset) {
  const majorCategory = String(asset?.majorCategory || '').toUpperCase();
  const software = asset?.scope === '软件' || majorCategory === '17.SOFTWARE' || majorCategory.startsWith('17.');
  const lost = asset?.scrapType === '丢失';
  const transfer = asset?.scrapMethod === '调账' || asset?.detailScrapMethod === '调账';
  return !software && !lost && !transfer;
}

export function validateAccountingAssets(form, assets, options = {}) {
  const errors = [];
  const scopes = normalizedScopes(options);
  if (!scopes.length) errors.push({ code: 'ACCOUNTING_PERMISSION_REQUIRED', message: '当前账号未配置账面报废公司及板块权限' });
  if (!form?.company && (assets?.length || !options.draft)) errors.push({ code: 'COMPANY_REQUIRED', message: '请选择公司' });
  if (!assets?.length && !options.draft) errors.push({ code: 'ASSETS_REQUIRED', message: '请至少添加一条资产明细' });
  const tags = new Set();
  (assets || []).forEach((asset, index) => {
    const prefix = `第${index + 1}行`;
    if (!asset) {
      errors.push({ code: 'INVALID_ASSET', index, message: `${prefix}资产数据无效` });
      return;
    }
    if (asset.company !== form?.company) errors.push({ code: 'COMPANY_MISMATCH', index, message: `${prefix}资产公司与单头公司不一致` });
    if (scopes.length && !isAuthorized(asset, options)) errors.push({ code: 'ASSET_UNAUTHORIZED', index, message: `${prefix}资产不在当前账号授权范围内` });
    if (asset.tagNo && tags.has(asset.tagNo)) errors.push({ code: 'DUPLICATE_ASSET', index, message: `${prefix}资产标签号重复` });
    if (asset.tagNo) tags.add(asset.tagNo);
    const occupation = accountingOccupation(asset.tagNo, options.recordId);
    if (occupation) {
      const completed = occupation.documentStatus === '已完成';
      errors.push({
        code: completed ? 'ASSET_ALREADY_SCRAPPED' : 'ASSET_OCCUPIED',
        index,
        message: `${prefix}资产${completed ? '已完成账面报废' : `已在账面报废单 ${occupation.applicationNo || occupation.id} 中`}`,
      });
    }
    if (String(asset.status || '').startsWith('已报废')) {
      errors.push({ code: 'ASSET_ALREADY_SCRAPPED', index, message: `${prefix}资产已报废，不可重复办理` });
    }
    if (asset.scrapMethod === '调账' && asset.scrapType === '丢失') {
      errors.push({ code: 'TRANSFER_CANNOT_BE_LOST', index, message: `${prefix}调账资产的报废类型不得为丢失` });
    }
    if (asset.scrapType === '丢失') {
      if (asset.scrapMethod !== '非调账' || asset.sourceBusinessType !== '丢失资产') {
        errors.push({ code: 'INVALID_LOST_SOURCE', index, message: `${prefix}丢失资产来源或报废方式无效` });
      }
      const priorRecord = ['crossCompany', 'scrap'].flatMap((sourceType) => getScrapPrototypeRecords(sourceType))
        .find((record) => record.documentStatus !== '已驳回'
          && (record.assetsSnapshot || []).some((item) => item?.tagNo === asset.tagNo));
      if (priorRecord) errors.push({ code: 'LOST_ASSET_HAS_PRIOR_WORKFLOW', index, message: `${prefix}丢失资产已进入其他前置业务` });
      const cardAsset = SCRAP_ASSET_POOL.find((item) => item.tagNo === asset.tagNo);
      const cardQuantity = positive(asset.cardQuantity);
      const requestedQuantity = positive(asset.requestedScrapQuantity ?? asset.quantity);
      const sourceCardQuantity = positive(cardAsset?.cardQuantity ?? cardAsset?.quantity);
      const expectedMethod = requestedQuantity && cardQuantity && requestedQuantity < cardQuantity ? '部分报废' : '全部报废';
      const cardOriginalValue = Number(asset.cardOriginalValue ?? cardAsset?.cardOriginalValue ?? cardAsset?.originalValue ?? 0);
      const cardNetValue = Number(asset.cardNetValue ?? cardAsset?.cardNetValue ?? cardAsset?.netValue ?? 0);
      const ratio = requestedQuantity && cardQuantity ? requestedQuantity / cardQuantity : 0;
      const expectedOriginalValue = money(cardOriginalValue * ratio);
      const expectedNetValue = money(cardNetValue * ratio);
      if (!cardAsset || cardAsset.company !== asset.company || cardAsset.plate !== asset.plate
        || sourceCardQuantity !== cardQuantity || !requestedQuantity || !cardQuantity
        || requestedQuantity > cardQuantity || asset.detailScrapMethod !== expectedMethod
        || Number(asset.originalValue) !== expectedOriginalValue || Number(asset.netValue) !== expectedNetValue) {
        errors.push({ code: 'INVALID_LOST_ASSET', index, message: `${prefix}丢失资产报废数量或金额与资产卡片不一致` });
      }
    } else {
      const sourceRecord = sourceRecordFor(asset);
      if (!sourceRecord) {
        errors.push({ code: 'INVALID_SOURCE_BUSINESS', index, message: `${prefix}来源业务未完成、已失效或不包含该资产` });
      } else {
        const sourceType = asset.sourceBusinessType === '跨公司转移' ? 'crossCompany' : 'scrap';
        const sourceAsset = sourceRecord.assetsSnapshot.find((item) => item.tagNo === asset.tagNo);
        const canonical = normalizeAccountingSource(sourceAsset, sourceType, sourceRecord);
        const fields = ['company', 'plate', 'scrapMethod', 'detailScrapMethod', 'quantity',
          'requestedScrapQuantity', 'cardQuantity', 'originalValue', 'netValue'];
        if (!canonical || fields.some((field) => canonical[field] !== asset[field])) {
          errors.push({ code: 'SOURCE_DATA_CHANGED', index, message: `${prefix}账面报废资产与已审批来源数据不一致` });
        }
      }
      const requested = positive(asset.requestedScrapQuantity ?? asset.quantity);
      const card = positive(asset.cardQuantity);
      if (!requested || !card || requested > card) errors.push({ code: 'INVALID_SOURCE_QUANTITY', index, message: `${prefix}缺少有效的来源报废数量或资产卡片数量` });
    }
  });
  const methods = new Set((assets || []).filter(Boolean).map((asset) => asset.scrapMethod).filter(Boolean));
  if (methods.size > 1 || (methods.size === 1 && form?.scrapMethod && !methods.has(form.scrapMethod))) {
    errors.push({ code: 'SCRAP_METHOD_MISMATCH', message: '调账与非调账资产不得混在同一张账面报废单' });
  }
  return { valid: errors.length === 0, errors };
}

function disposalOccupation(tagNo, exceptRecordId) {
  return getScrapPrototypeRecords('disposal').find((record) => (
    record.id !== exceptRecordId
    && (record.assetsSnapshot || []).some((asset) => asset?.tagNo === tagNo)
  )) || null;
}

function completedAccountingRecordForDisposal(asset) {
  const sourceNo = String(asset?.sourceAccountingNo || '').trim();
  if (!sourceNo) return null;
  return getScrapPrototypeRecords('accounting').find((record) => (
    record.applicationNo === sourceNo
    && record.documentStatus === '已完成'
    && (record.assetsSnapshot || []).some((item) => item?.tagNo === asset.tagNo)
  )) || null;
}

export function validateDisposalAssets(form, assets, options = {}) {
  const errors = [];
  if (!assets?.length) {
    if (!options.draft) errors.push({ code: 'ASSETS_REQUIRED', message: '请至少添加一条待处置资产' });
    return { valid: errors.length === 0, errors };
  }

  const tags = new Set();
  (assets || []).forEach((asset, index) => {
    const prefix = `第${index + 1}行`;
    const tagNo = String(asset?.tagNo || '').trim();
    if (!tagNo) {
      errors.push({ code: 'TAG_REQUIRED', index, message: `${prefix}资产标签号不能为空` });
      return;
    }
    if (tags.has(tagNo)) {
      errors.push({ code: 'DUPLICATE_ASSET', index, message: `${prefix}资产标签号重复` });
      return;
    }
    tags.add(tagNo);

    if (!requiresPhysicalDisposal(asset)) {
      errors.push({ code: 'DISPOSAL_NOT_REQUIRED', index, message: `${prefix}软件、丢失或调账资产不进入实物处置` });
    }

    const sourceRecord = completedAccountingRecordForDisposal(asset);
    if (!sourceRecord) {
      errors.push({
        code: 'INVALID_ACCOUNTING_SOURCE',
        index,
        message: `${prefix}未找到包含该资产的已完成账面报废单`,
      });
    } else {
      const sourceAsset = (sourceRecord.assetsSnapshot || []).find((item) => item?.tagNo === tagNo);
      const comparableFields = ['company', 'plate', 'quantity', 'originalValue', 'netValue', 'scrapMethod', 'scrapType'];
      if (!sourceAsset || comparableFields.some((field) => (
        sourceAsset[field] !== undefined
        && asset[field] !== undefined
        && String(sourceAsset[field]) !== String(asset[field])
      ))) {
        errors.push({
          code: 'ACCOUNTING_SOURCE_CHANGED',
          index,
          message: `${prefix}待处置资产与已完成账面报废来源数据不一致`,
        });
      }
    }

    const occupation = disposalOccupation(tagNo, options.recordId);
    if (occupation) {
      errors.push({
        code: 'DISPOSAL_ASSET_OCCUPIED',
        index,
        message: `${prefix}资产已在处置单 ${occupation.applicationNo || occupation.id} 中，不能重复办理`,
      });
    }

    if (
      form?.assetScope === '办公设备'
      && asset.scope !== '办公设备'
    ) {
      errors.push({ code: 'DISPOSAL_SCOPE_MISMATCH', index, message: `${prefix}办公设备处置单只能选择办公设备资产` });
    }
  });

  return { valid: errors.length === 0, errors };
}

export function getDisposalCandidates() {
  const disposalRecords = getScrapPrototypeRecords('disposal');
  const occupiedTags = new Set(disposalRecords
    .flatMap((record) => (record.assetsSnapshot || []).map((asset) => asset.tagNo))
    .filter(Boolean));
  const result = new Map();
  for (const record of getScrapPrototypeRecords('accounting')) {
    if (record.documentStatus !== '已完成') continue;
    for (const asset of record.assetsSnapshot || []) {
      if (!requiresPhysicalDisposal(asset) || occupiedTags.has(asset.tagNo)) continue;
      result.set(asset.tagNo, {
        ...asset,
        id: `disposal-${asset.id}`,
        sourceAssetId: asset.id,
        status: '已报废-待处置',
        sourceScrapNo: asset.sourceBusinessType === '资产报废' ? asset.sourceBusinessNo : '-',
        sourceAccountingNo: record.applicationNo,
        scrapDate: record.lastModifiedAt?.slice(0, 10) || record.createdAt,
        disposalStatus: '待处置',
        enteredAt: record.lastModifiedAt || record.createdAt,
        region: String(asset.city || '').includes('北京') ? '北京' : '非北京',
        disposalMode: '实物处置',
      });
    }
  }
  return [...result.values()];
}
