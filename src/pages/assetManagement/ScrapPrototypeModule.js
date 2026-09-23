import React, { useMemo, useState } from 'react';
import ScrapPrototypeList from './ScrapPrototypeList';
import ScrapPrototypeEditor from './ScrapPrototypeEditor';
import {
  getPrototypeRecords,
  SCRAP_ASSET_POOL,
  ACCOUNTING_ASSET_POOL,
  DISPOSAL_ASSET_POOL,
} from './scrapPrototypeData';

const CONFIG = {
  crossCompany: {
    title: '跨公司转移',
    createLabel: '新建跨公司转移',
    statuses: ['草稿', '审批中', '已完成', '已驳回'],
  },
  scrap: {
    title: '资产报废',
    createLabel: '新建报废申请',
    statuses: ['草稿', '审批中', '已审批', '已进入待报废池', '已驳回'],
  },
  accounting: {
    title: '账面报废',
    createLabel: '新建账面报废',
    statuses: ['草稿', '审批中', '待提单人确认', '已完成', '已驳回'],
  },
  disposal: {
    title: '资产处置',
    createLabel: '发起处置',
    statuses: ['待处置', '处理中', '已处置'],
  },
};

const INITIAL_FORMS = {
  crossCompany: { assetScope: '', remark: '' },
  scrap: { assetScope: '', description: '', quoteReceiver: '', quoteAmount: 0 },
  accounting: { sourceType: '待报废池', manualScenario: '', assetScope: '', scrapMethod: '' },
  disposal: { assetScope: '', supplier: '', quoteAmount: 0, needsCleaning: '' },
};

function getPool(type) {
  if (type === 'disposal') return DISPOSAL_ASSET_POOL;
  if (type === 'accounting') return ACCOUNTING_ASSET_POOL;
  return SCRAP_ASSET_POOL;
}

export default function ScrapPrototypeModule({ type }) {
  const config = CONFIG[type];
  const [view, setView] = useState(null);
  const [records, setRecords] = useState(() => getPrototypeRecords(type));

  const pool = useMemo(() => getPool(type), [type]);

  const openCreate = (assets) => {
    setView({
      edit: true,
      assets: assets || pool.slice(0, 1),
      form: INITIAL_FORMS[type],
    });
  };

  if (view) {
    return (
      <ScrapPrototypeEditor
        type={type}
        config={config}
        initialForm={view.form}
        initialAssets={view.assets}
        readOnly={!view.edit}
        onBack={() => setView(null)}
        onSave={(form, assets) => {
          setRecords((current) => current);
          setView(null);
          return { form, assets };
        }}
      />
    );
  }

  return (
    <ScrapPrototypeList
      type={type}
      config={config}
      records={records}
      onCreate={openCreate}
      onOpen={(record, edit) => setView({ edit, assets: pool.slice(0, 1), form: { ...INITIAL_FORMS[type], record } })}
      onCopy={(record) => openCreate(pool.filter((item) => item.id === record.id))}
      onExecute={() => setRecords((current) => current)}
      onDirectComplete={() => setRecords((current) => current)}
      onDeleteDrafts={() => setRecords((current) => current)}
    />
  );
}
