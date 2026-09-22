import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { message } from 'antd';
import ScrapPrototypeList from './ScrapPrototypeList';
import ScrapPrototypeEditor from './ScrapPrototypeEditor';
import {
  ACCOUNTING_ASSET_POOL,
  DISPOSAL_ASSET_POOL,
  SCRAP_ASSET_POOL,
} from './scrapPrototypeData';
import {
  getScrapPrototypeRecords,
  saveScrapPrototypeRecords,
} from '../../services/scrapPrototypeService';

const MODULES = {
  crossCompany: {
    title: '跨公司转移',
    createLabel: '创建跨公司转移申请单',
    statuses: ['草稿', '审批中', '已驳回', '已完成'],
  },
  scrap: {
    title: '资产报废',
    createLabel: '创建资产报废申请单',
    statuses: ['草稿', '审批中', '已驳回', '已审批'],
  },
  accounting: {
    title: '账面报废',
    createLabel: '创建账面报废申请单',
    statuses: ['草稿', '审批中', '已驳回', '待提单人确认', '已完成'],
  },
  disposal: {
    title: '资产处置',
    createLabel: '创建资产处置申请单',
    statuses: ['草稿', '审批中', '处理中', '已驳回', '已完成'],
  },
};

function defaultForm(type) {
  return {
    applicationNo: '',
    documentStatus: '草稿',
    creator: type === 'accounting' ? '吕静' : type === 'disposal' ? 'ES专员' : '当前登录人',
    applicationDate: dayjs().format('YYYY-MM-DD'),
    company: '114.新媒体',
    assetScope: type === 'accounting' ? '混合' : '',
    plate: '17_Corporate',
    officeArea: '-',
    contactPhone: '-',
    email: '-',
    department: '-',
    remark: '',
    description: '',
    scrapMethod: '全部报废',
    disposedComplete: '否',
    region: '北京',
    needsCleaning: '否',
    sourceType: '待报废池',
    manualScenario: '',
    quoteReceiver: '采购专员',
    supplier: '',
    quoteAmount: null,
    currentNode: '',
  };
}

function createApplicationNo(type) {
  const prefix = type === 'crossCompany'
    ? 'CT'
    : type === 'scrap'
      ? 'BF'
      : type === 'accounting'
        ? 'ZMBF'
        : 'CZ';

  return `${prefix}${dayjs().format('YYYYMMDDHHmmss')}`;
}

function firstNode(type, form, assets) {
  if (type === 'crossCompany') {
    return form.assetScope === '办公设备' ? 'ES主管确认' : '5级及以上直属领导';
  }

  if (type === 'scrap') {
    if (form.assetScope === '机房资产') return '专家评估';
    if (form.assetScope === '软件') return '5级及以上直属领导';
    return ['PC', 'NOTEBOOK'].includes(assets[0]?.majorCategory)
      ? 'MIS鉴定'
      : 'ES主管确认';
  }

  if (type === 'accounting') return '财务初审';

  if (form.assetScope === '办公设备') return 'ES二级审批';
  if (form.region === '北京') return '采购专员协办';
  return form.needsCleaning === '是' ? '采购专员数据清洗' : '已报废-已处置';
}

function submitStatus(type, form) {
  if (type !== 'disposal') return '审批中';
  return form.assetScope === '机房资产' ? '处理中' : '审批中';
}

function seedAssets(type, record) {
  const sourcePool = type === 'accounting'
    ? ACCOUNTING_ASSET_POOL
    : type === 'disposal'
      ? DISPOSAL_ASSET_POOL
      : SCRAP_ASSET_POOL;
  const source = record.assetScope === '混合'
    ? sourcePool
    : sourcePool.filter((item) => item.scope === record.assetScope);

  return source
    .slice(0, Math.min(3, Math.max(1, record.assetCount || 1)))
    .map((item, index) => ({
      ...item,
      scrapMethod: type === 'crossCompany'
        ? '调账'
        : item.scrapMethod || record.scrapMethod || '全部报废',
      scrapType: item.scrapType || '已到报废期',
      reason: item.reason || record.remark || '业务演示原因',
      dataCleaning: item.scope === '机房资产' && index === 0 ? '是' : undefined,
      newCompany: type === 'crossCompany' ? '115.新媒体-上海' : '',
      newPlate: type === 'crossCompany' ? '17_Corporate' : '',
      newCostCenter: type === 'crossCompany' ? '112064_新媒体成本中心' : '',
      newResponsiblePerson: type === 'crossCompany' ? '215410-卢铭华' : '',
      targetWarehouse: type === 'crossCompany' ? 'I3001.资产上海分公司库（新媒体上海）' : '',
      targetCity: type === 'crossCompany' ? '37.上海市' : '',
      targetBuilding: type === 'crossCompany' ? '127.瑞安广场' : '',
      targetFloor: type === 'crossCompany' ? '12层' : '',
    }));
}

export default function ScrapPrototypeModule({ type }) {
  const config = MODULES[type];
  const [records, setRecords] = useState(() => getScrapPrototypeRecords(type));
  const [view, setView] = useState('list');
  const [editorState, setEditorState] = useState(null);

  useEffect(() => {
    setRecords(getScrapPrototypeRecords(type));
    setView('list');
    setEditorState(null);
  }, [type]);

  const openCreate = () => {
    setEditorState({
      form: defaultForm(type),
      assets: [],
      readOnly: false,
    });
    setView('editor');
  };

  const copyRecord = (record) => {
    const sourceForm = record.formSnapshot
      ? { ...record.formSnapshot }
      : { ...defaultForm(type), ...record };

    setEditorState({
      form: {
        ...sourceForm,
        id: undefined,
        applicationNo: '',
        documentStatus: '草稿',
        applicationDate: dayjs().format('YYYY-MM-DD'),
        currentNode: '草稿',
      },
      assets: (record.assetsSnapshot || seedAssets(type, record)).map((item) => ({ ...item })),
      readOnly: false,
    });
    setView('editor');
  };

  const openRecord = (record, editable) => {
    const form = record.formSnapshot
      ? { ...record.formSnapshot, id: record.id }
      : {
          ...defaultForm(type),
          ...record,
          id: record.id,
          applicationDate: record.createdAt,
          documentStatus: record.documentStatus,
          currentNode: record.currentNode,
          description: record.remark || '',
        };

    const assets = record.assetsSnapshot
      ? record.assetsSnapshot.map((item) => ({ ...item }))
      : seedAssets(type, record);
    if (type === 'disposal' && record.assetScope === '机房资产') {
      form.needsCleaning = assets.some((item) => item.dataCleaning === '是') ? '是' : '否';
    }

    setEditorState({
      form,
      assets,
      readOnly: !editable,
    });
    setView('editor');
  };

  const deleteDrafts = (ids) => {
    const selected = records.filter((item) => ids.includes(item.id));
    if (selected.some((item) => item.documentStatus !== '草稿')) {
      message.warning('仅草稿单据允许删除');
      return;
    }

    setRecords((current) => {
      const next = current.filter((item) => !ids.includes(item.id));
      saveScrapPrototypeRecords(type, next);
      return next;
    });
    message.success('删除成功');
  };

  const saveRecord = (form, assets, submit) => {
    const applicationNo = form.applicationNo || createApplicationNo(type);
    const uniqueScopes = new Set(assets.map((item) => item.scope));
    const assetScope = type === 'accounting'
      ? (uniqueScopes.size > 1 ? '混合' : assets[0]?.scope || '混合')
      : form.assetScope;

    const normalizedForm = { ...form, assetScope };
    const nextForm = {
      ...normalizedForm,
      applicationNo,
      documentStatus: submit ? submitStatus(type, normalizedForm) : '草稿',
      currentNode: submit ? firstNode(type, normalizedForm, assets) : '草稿',
    };

    const targetCompanies = Array.from(new Set(assets.map((item) => item.newCompany).filter(Boolean)));
    const scrapMethods = Array.from(new Set(assets.map((item) => item.scrapMethod).filter(Boolean)));
    const nowText = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const nextRecord = {
      id: form.id || `${type}-${applicationNo}`,
      applicationNo,
      documentStatus: nextForm.documentStatus,
      assetScope,
      company: form.company,
      targetCompany: targetCompanies.length > 1 ? '多公司' : targetCompanies[0] || form.targetCompany || '',
      plate: form.plate,
      creator: form.creator,
      createdAt: form.applicationDate,
      lastModifiedAt: nowText,
      assetCount: assets.length,
      originalValueTotal: assets.reduce((sum, item) => sum + Number(item.originalValue || 0), 0),
      netValueTotal: assets.reduce((sum, item) => sum + Number(item.netValue || 0), 0),
      scrapMethod: scrapMethods.length > 1 ? '混合' : scrapMethods[0] || form.scrapMethod,
      region: form.region,
      currentNode: nextForm.currentNode,
      remark: form.remark || form.description,
      formSnapshot: nextForm,
      assetsSnapshot: assets.map((item) => ({ ...item })),
    };

    setRecords((current) => {
      const exists = current.some((item) => item.id === nextRecord.id);
      const next = exists
        ? current.map((item) => (item.id === nextRecord.id ? nextRecord : item))
        : [nextRecord, ...current];
      saveScrapPrototypeRecords(type, next);
      return next;
    });

    message.success(submit ? '提交成功' : '草稿保存成功');
    setView('list');
    setEditorState(null);
  };

  const executeAccounting = (record) => {
    if (type !== 'accounting' || record.documentStatus !== '待提单人确认') return;

    setRecords((current) => {
      const next = current.map((item) => (
        item.id === record.id
          ? {
              ...item,
              documentStatus: '已完成',
              currentNode: '流程结束',
              lastModifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              formSnapshot: item.formSnapshot
                ? { ...item.formSnapshot, documentStatus: '已完成', currentNode: '流程结束' }
                : item.formSnapshot,
            }
          : item
      ));
      saveScrapPrototypeRecords(type, next);
      return next;
    });
    message.success('账面报废执行完成');
  };

  if (view === 'list') {
    return (
      <ScrapPrototypeList
        type={type}
        config={config}
        records={records}
        onCreate={openCreate}
        onOpen={openRecord}
        onCopy={copyRecord}
        onExecute={executeAccounting}
        onDeleteDrafts={deleteDrafts}
      />
    );
  }

  return (
    <ScrapPrototypeEditor
      type={type}
      config={config}
      initialForm={editorState.form}
      initialAssets={editorState.assets}
      readOnly={editorState.readOnly}
      onBack={() => {
        setView('list');
        setEditorState(null);
      }}
      onSave={saveRecord}
    />
  );
}
