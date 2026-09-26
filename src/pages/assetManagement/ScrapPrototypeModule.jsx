import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { message } from 'antd';
import ScrapPrototypeList from './ScrapPrototypeList';
import ScrapPrototypeEditor from './ScrapPrototypeEditor';
import {
  getAccountingApprovalNodes,
  getCrossCompanyApprovalNodes,
  getScrapApprovalNodes,
} from './scrapPrototypeWorkflow';
import {
  SCRAP_ASSET_POOL,
} from './scrapPrototypeData';
import {
  getAccountingCandidates,
  getDisposalCandidates,
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
    company: type === 'crossCompany' ? '' : '114.新媒体',
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
    return getCrossCompanyApprovalNodes(form.assetScope)[0];
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
    ? getAccountingCandidates()
    : type === 'disposal'
      ? getDisposalCandidates()
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
        : record.scrapMethod || item.scrapMethod || '全部报废',
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

  const openCreate = (selectedAssets = []) => {
    const pickedAssets = Array.isArray(selectedAssets) ? selectedAssets : [];
    const scopes = new Set(pickedAssets.map((item) => item.scope).filter(Boolean));

    if (type === 'disposal' && scopes.size > 1) {
      message.error('机房资产和办公设备必须分别发起处置');
      return;
    }

    const form = defaultForm(type);
    if (type === 'disposal' && pickedAssets.length > 0) {
      const firstAsset = pickedAssets[0];
      form.assetScope = firstAsset.scope;
      form.company = firstAsset.company || form.company;
      form.region = firstAsset.region || (String(firstAsset.city || '').includes('北京') ? '北京' : '非北京');
      form.needsCleaning = pickedAssets.some((item) => item.dataCleaning === '是') ? '是' : '否';
    }

    setEditorState({
      form,
      assets: pickedAssets.map((item) => ({ ...item })),
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
        approvalHistory: [],
      },
      assets: (record.assetsSnapshot || seedAssets(type, record)).map((item) => ({ ...item })),
      readOnly: false,
    });
    setView('editor');
  };

  const openRecord = (record, editable, approvalPage = false) => {
    const form = record.formSnapshot
      ? { ...record.formSnapshot, id: record.id, approvalHistory: record.approvalHistory || [] }
      : {
          ...defaultForm(type),
          ...record,
          id: record.id,
          applicationDate: record.createdAt,
          documentStatus: record.documentStatus,
          currentNode: record.currentNode,
          description: record.remark || '',
          approvalHistory: record.approvalHistory || [],
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
      approvalPage: approvalPage && !['草稿', '已驳回'].includes(record.documentStatus),
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
    const nowText = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const approvalHistory = submit && type === 'crossCompany'
      ? [
          ...(form.approvalHistory || []),
          { node: '发起人提交', result: '提交', opinion: '', time: nowText },
        ]
      : form.approvalHistory || [];
    const nextForm = {
      ...normalizedForm,
      applicationNo,
      documentStatus: submit ? submitStatus(type, normalizedForm) : '草稿',
      currentNode: submit ? firstNode(type, normalizedForm, assets) : '草稿',
      approvalHistory,
    };

    const targetCompanies = Array.from(new Set(assets.map((item) => item.newCompany).filter(Boolean)));
    const scrapMethods = Array.from(new Set(assets.map((item) => item.scrapMethod).filter(Boolean)));
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
      approvalHistory,
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
    if (submit && type === 'crossCompany') {
      setEditorState({ form: nextForm, assets: assets.map((item) => ({ ...item })), readOnly: true, approvalPage: true });
      setView('editor');
    } else {
      setView('list');
      setEditorState(null);
    }
  };

  const processApproval = (record, result, opinion) => {
    if (!['crossCompany', 'scrap', 'accounting'].includes(type) || record.documentStatus !== '审批中') return;
    const recordAssets = record.assetsSnapshot || seedAssets(type, record);
    const nodes = type === 'crossCompany'
      ? getCrossCompanyApprovalNodes(record.assetScope)
      : type === 'scrap'
        ? getScrapApprovalNodes(record.assetScope, recordAssets)
        : getAccountingApprovalNodes(recordAssets);
    if (!nodes) return;
    const currentIndex = nodes.indexOf(record.currentNode);
    if (currentIndex < 0) throw new Error(`未知审批节点：${record.currentNode}`);

    const approved = result === '通过';
    const lastNode = approved && currentIndex === nodes.length - 1;
    const completed = lastNode && type !== 'accounting';
    const currentNode = approved
      ? (completed ? '流程结束' : lastNode ? '提单人确认' : nodes[currentIndex + 1])
      : '发起人修改';
    const documentStatus = approved
      ? (completed ? (type === 'scrap' ? '已审批' : '已完成') : lastNode ? '待提单人确认' : '审批中')
      : '已驳回';
    const entry = {
      node: record.currentNode,
      result,
      opinion: opinion.trim(),
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    const updatedRecord = {
      ...record,
      documentStatus,
      currentNode,
      lastModifiedAt: entry.time,
      enteredScrapPoolAt: completed ? entry.time : record.enteredScrapPoolAt,
      assetsSnapshot: completed
        ? recordAssets.map((asset) => ({
            ...asset,
            status: String(asset.status || '').startsWith('在库') ? '在库-待报废' : asset.status,
          }))
        : recordAssets,
      approvalHistory: [...(record.approvalHistory || []), entry],
      formSnapshot: record.formSnapshot
        ? { ...record.formSnapshot, documentStatus, currentNode, approvalHistory: [...(record.approvalHistory || []), entry] }
        : record.formSnapshot,
    };
    const next = records.map((item) => (
      item.id === record.id
        ? updatedRecord
        : item
    ));
    saveScrapPrototypeRecords(type, next);
    setRecords(next);
    message.success(completed ? '审批完成，资产已进入待报废池' : lastNode ? '审批完成，待提单人确认' : approved ? '审批通过' : '已驳回发起人');
    return updatedRecord;
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
              approvalHistory: [
                ...(item.approvalHistory || []),
                { node: '提单人确认', result: '确认并执行', opinion: '', time: dayjs().format('YYYY-MM-DD HH:mm:ss') },
              ],
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

  const completeDisposalAsset = (asset, action, note) => {
    if (type !== 'disposal') return;
    if (asset.disposalStatus !== '待处置' || !note?.trim()) return;

    const applicationNo = createApplicationNo(type);
    const completedRecord = {
      id: `disposal-direct-${asset.id}-${applicationNo}`,
      applicationNo,
      documentStatus: '已完成',
      assetScope: asset.scope,
      company: asset.company,
      plate: asset.plate,
      creator: 'ES专员',
      createdAt: dayjs().format('YYYY-MM-DD'),
      lastModifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      assetCount: 1,
      originalValueTotal: Number(asset.originalValue || 0),
      netValueTotal: Number(asset.netValue || 0),
      region: asset.region,
      currentNode: '已报废-已处置',
      remark: note.trim(),
      disposalAction: action,
      formSnapshot: {
        ...defaultForm(type),
        applicationNo,
        documentStatus: '已完成',
        assetScope: asset.scope,
        company: asset.company,
        region: asset.region,
        currentNode: '已报废-已处置',
        remark: note.trim(),
        disposalAction: action,
      },
      assetsSnapshot: [{ ...asset, status: '已报废-已处置', disposalStatus: '已处置', disposalNote: note.trim() }],
    };

    setRecords((current) => {
      const next = [completedRecord, ...current];
      saveScrapPrototypeRecords(type, next);
      return next;
    });
    message.success(action === '无实物报废' ? '已完成无实物报废' : '已确认资产处置完成');
  };

  const listRecords = type === 'disposal'
    ? getDisposalCandidates().map((asset) => {
        const disposalRecord = [...records].reverse().find((record) => (
          record.documentStatus !== '已驳回'
          && record.assetsSnapshot?.some((item) => item.id === asset.id)
        ));
        if (!disposalRecord) return asset;
        const snapshot = disposalRecord.assetsSnapshot.find((item) => item.id === asset.id);
        const completed = disposalRecord.documentStatus === '已完成';
        return {
          ...asset,
          ...snapshot,
          status: completed ? '已报废-已处置' : asset.status,
          disposalStatus: completed ? '已处置' : '处理中',
          disposalRecord,
        };
      })
    : records;

  if (view === 'list') {
    return (
      <ScrapPrototypeList
        type={type}
        config={config}
        records={listRecords}
        onCreate={openCreate}
        onOpen={openRecord}
        onCopy={copyRecord}
        onExecute={executeAccounting}
        onDirectComplete={completeDisposalAsset}
        onDeleteDrafts={deleteDrafts}
        onApprove={processApproval}
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
      approvalPage={editorState.approvalPage}
      onApprove={processApproval}
      onEdit={(form) => {
        const record = records.find((item) => item.id === form.id);
        if (record) openRecord(record, true, false);
      }}
      onBack={() => {
        setView('list');
        setEditorState(null);
      }}
      onSave={saveRecord}
    />
  );
}
