import {
  DISPOSAL_ASSET_POOL,
  getInitialBusinessRows,
} from '../pages/assetManagement/scrapPrototypeData';
import { readDemoData, writeDemoData } from './demoStorage';

const STORAGE_VERSION = 'v1';

function storageKey(type) {
  return `asset_scrap_prototype_${type}_${STORAGE_VERSION}`;
}

export function getScrapPrototypeRecords(type) {
  return readDemoData(storageKey(type), getInitialBusinessRows(type));
}

export function saveScrapPrototypeRecords(type, records) {
  return writeDemoData(storageKey(type), records);
}

export function getAccountingCandidates() {
  const result = new Map();
  for (const type of ['crossCompany', 'scrap']) {
    for (const record of getScrapPrototypeRecords(type)) {
      if (!['已完成', '已审批'].includes(record.documentStatus)) continue;
      for (const asset of record.assetsSnapshot || []) {
        result.set(asset.tagNo, {
          ...asset,
          scrapMethod: type === 'crossCompany' ? '调账' : '非调账',
          detailScrapMethod: type === 'crossCompany' ? '调账' : asset.scrapMethod || '全部报废',
          sourceBusinessType: type === 'crossCompany' ? '跨公司转移' : '资产报废',
          sourceBusinessNo: record.applicationNo,
          disposedComplete: type === 'scrap'
            ? record.formSnapshot?.disposedComplete || asset.disposedComplete || '否'
            : '否',
          status: String(asset.status || '').startsWith('在库') ? '在库-待报废' : asset.status,
        });
      }
    }
  }
  return [...result.values()];
}

export function getDisposalCandidates() {
  const result = new Map(DISPOSAL_ASSET_POOL.map((asset) => [asset.tagNo, asset]));
  for (const record of getScrapPrototypeRecords('accounting')) {
    if (record.documentStatus !== '已完成') continue;
    for (const asset of record.assetsSnapshot || []) {
      const withoutPhysical = asset.scope === '软件' || asset.scrapType === '丢失';
      if (asset.scrapMethod === '调账' || (!withoutPhysical && (asset.disposedComplete === '是' || asset.disposalRequired !== '是'))) continue;
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
        disposalMode: withoutPhysical ? '无实物处置' : '实物处置',
      });
    }
  }
  return [...result.values()];
}
