import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { message } from 'antd';
import ScrapPrototypeList from './ScrapPrototypeList';
import ScrapPrototypeEditor from './ScrapPrototypeEditor';
import {
  getAccountingApprovalNodes,
  getCrossCompanyApprovalNodes,
  getDisposalApprovalNodes,
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
    creator: type === 'accounting' ? '吕静' : '213852-孙志强',
    applicationDate: dayjs().format('YYYY-MM-DD'),
    company: ['crossCompany', 'disposal'].includes(type) ? '' : '114.新媒体',
    assetScope: type === 'accounting' ? '混合' : '',
    plate: '17_Corporate',
    officeArea: '-',
    contactPhone: '-',
    email: '-',
    department: '-',
    remark: '',
    description: '',
    scrapMethod: type === 'accounting' ? '非调账' : '全部报废',
    assetCategory: '',
    assetLocation: '',
    region: '北京',
    needsCleaning: '否',
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

  return getDisposalApprovalNodes(form)[0];
}

function submitStatus(type, form) {
  if (type !== 'disposal') return '审批中';
  return form.assetScope === '办公设备' && form.disposalMode !== '无实物处置' ? '审批中' : '处理中';
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
  const methodSource = type === 'accounting'
    ? source.filter((item) => item.scrapMethod === record.scrapMethod)
    : type === 'crossCompany'
      ? source.filter((item) => item.company === record.company)
      : source;

  return methodSource
    .slice(0, Math.min(3, Math.max(1, record.assetCount || 1)))
    .map((item, index) => ({
      ...item,
      scrapMethod: type === 'crossCompany'
        ? '调账'
        : type === 'accounting' ? item.scrapMethod : record.scrapMethod || item.scrapMethod || '全部报废',
      scrapType: item.scrapType || '已到报废期',
      reason: item.reason || record.remark || '业务演示原因',
      dataCleaning: item.scope === '机房资产' && index === 0 ? '是' : undefined,
      newCompany: type === 'crossCompany' ? '115.新媒体-上海' : item.newCompany || '',
      newPlate: type === 'crossCompany' ? '17_Corporate' : item.newPlate || '',
      newCostCenter: type === 'crossCompany' ? '112064_新媒体成本中心' : item.newCostCenter || '',
      newResponsiblePerson: type === 'crossCompany' ? '215410-卢铭华' : item.newResponsiblePerson || '',
      targetWarehouse: type === 'crossCompany' ? 'I3001.资产上海分公司库（新媒体上海）' : item.targetWarehouse || '',
      targetCity: type === 'crossCompany' ? '37.上海市' : item.targetCity || '',
      targetBuilding: type === 'crossCompany' ? '127.瑞安广场' : item.targetBuilding || '',
      targetFloor: type === 'crossCompany' ? '12层' : item.targetFloor || '',
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
    if (type === 'accounting' && typeof selectedAssets === 'string') form.scrapMethod = selectedAssets;
    if (type === 'disposal' && pickedAssets.length > 0) {
      message.error('请先在单头选择公司，再添加待处置办公资产');
      return;
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
    const approvalHistory = submit && ['crossCompany', 'scrap', 'accounting', 'disposal'].includes(type)
        ? [
          ...(form.approvalHistory || []),
          { node: '发起人提交', person: normalizedForm.creator || '', result: '提交', opinion: '', time: nowText },
        ]
      : form.approvalHistory || [];
    const nextForm = {
      ...normalizedForm,
      disposalMode: type === 'disposal' ? '实物处置' : normalizedForm.disposalMode,
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
      scrapMethod: type === 'accounting' ? form.scrapMethod : scrapMethods.length > 1 ? '混合' : scrapMethods[0] || form.scrapMethod,
      region: form.region,
      disposalMode: type === 'disposal' ? nextForm.disposalMode : undefined,
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
    if (submit && ['crossCompany', 'scrap', 'accounting', 'disposal'].includes(type)) {
      setEditorState({ form: nextForm, assets: assets.map((item) => ({ ...item })), readOnly: true, approvalPage: true });
      setView('editor');
    } else {
      setView('list');
      setEditorState(null);
    }
  };

  const processApproval = (record, result, opinion) => {
    if (!['crossCompany', 'scrap', 'accounting', 'disposal'].includes(type) || !['审批中', '处理中'].includes(record.documentStatus)) return;
    const recordAssets = record.assetsSnapshot || seedAssets(type, record);
    const nodes = type === 'crossCompany'
      ? getCrossCompanyApprovalNodes(record.assetScope)
      : type === 'scrap'
        ? getScrapApprovalNodes(record.assetScope, recordAssets)
        : type === 'accounting'
          ? getAccountingApprovalNodes(recordAssets)
          : getDisposalApprovalNodes(record);
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
      ? (completed ? (type === 'scrap' ? '已审批' : '已完成') : lastNode ? '待提单人确认' : type === 'disposal' && record.disposalMode !== '实物处置' ? '处理中' : '审批中')
      : '已驳回';
    const entry = {
      node: record.currentNode,
      person: record.currentApprover || '',
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
            status: type === 'disposal' ? '已报废-已处置' : String(asset.status || '').startsWith('在库') ? '在库-待报废' : asset.status,
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
    message.success(completed ? (type === 'disposal' ? '处置流程已完成' : '审批完成，资产已进入待报废池') : lastNode ? '审批完成，待提单人确认' : approved ? '审批通过' : '已驳回发起人');
    return updatedRecord;
  };

  const executeAccounting = (record) => {
    if (type !== 'accounting' || record.documentStatus !== '待提单人确认') return;
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const next = records.map((item) => item.id === record.id ? {
      ...item,
      documentStatus: '已完成', currentNode: '流程结束', lastModifiedAt: now,
      approvalHistory: [...(item.approvalHistory || []), { node: '提单人确认', result: '确认并执行', opinion: '', time: now }],
      formSnapshot: item.formSnapshot ? { ...item.formSnapshot, documentStatus: '已完成', currentNode: '流程结束' } : item.formSnapshot,
    } : item);
    saveScrapPrototypeRecords(type, next);
    setRecords(next);

    // 机房资产和无实物资产在账面报废完成后自动生成处置单；办公设备留待手动创建。
    const currentDisposal = getScrapPrototypeRecords('disposal');
    const existingAssetTags = new Set(currentDisposal.flatMap((item) => (item.assetsSnapshot || []).map((asset) => asset.tagNo)));
    const sourceAssets = record.assetsSnapshot || seedAssets('accounting', record);
    const automaticAssets = sourceAssets.filter((asset) => (
      asset.scrapMethod !== '调账'
      && (asset.scope === '机房资产' || asset.scope === '软件' || asset.scrapType === '丢失')
      && !existingAssetTags.has(asset.tagNo)
    ));
    const today = dayjs().format('YYYYMMDD');
    const todayNumbers = currentDisposal
      .map((item) => item.applicationNo)
      .filter((number) => number?.startsWith(`CZ${today}`))
      .map((number) => Number(number.slice(10)))
      .filter(Number.isFinite);
    const nextSerial = Math.max(0, ...todayNumbers) + 1;
    const autoRecords = automaticAssets.map((asset, index) => {
      const applicationNo = `CZ${today}${String(nextSerial + index).padStart(6, '0')}`;
      const disposalMode = asset.scope === '软件' || asset.scrapType === '丢失' ? '无实物处置' : '实物处置';
      const region = String(asset.city || '').includes('北京') ? '北京' : '非北京';
      const basic = {
        ...defaultForm('disposal'), applicationNo, company: asset.company,
        assetScope: asset.scope, disposalMode, region,
        needsCleaning: asset.dataCleaning === '是' ? '是' : '否',
        creator: '系统自动', applicationDate: now.slice(0, 10),
        documentStatus: '处理中',
      };
      const currentNode = getDisposalApprovalNodes(basic)[0];
      const approvalHistory = [{ node: '系统发起', person: '系统自动', result: '提交', opinion: '', time: now }];
      return {
        id: `disposal-${record.id}-${asset.id}`, applicationNo,
        documentStatus: '处理中', company: asset.company, assetScope: asset.scope,
        disposalMode, region, needsCleaning: basic.needsCleaning,
        creator: '系统自动', createdAt: now.slice(0, 10), currentNode,
        assetCount: 1, assetsSnapshot: [{ ...asset, sourceAccountingNo: record.applicationNo }],
        approvalHistory, formSnapshot: { ...basic, currentNode, approvalHistory },
      };
    });
    if (autoRecords.length) saveScrapPrototypeRecords('disposal', [...autoRecords, ...currentDisposal]);
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
        onApprove={processApproval}
      />
    );
  }

  return (
    <ScrapPrototypeEditor
      key={`${editorState.form.id || editorState.form.applicationNo || 'new'}-${editorState.approvalPage ? 'approval' : editorState.readOnly ? 'detail' : 'edit'}`}
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
