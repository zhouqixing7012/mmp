import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { message } from 'antd';
import ScrapPrototypeList from './ScrapPrototypeList';
import ScrapPrototypeEditor from './ScrapPrototypeEditor';
import { CURRENT_EMPLOYEE } from '../../mock/employeeSelfServiceMock';
import {
  getAccountingApprovalSteps,
  getCrossCompanyApprovalNodes,
  getCrossCompanyApprovalSteps,
  getDisposalApprovalNodes,
  getScrapApprovalNodes,
} from './scrapPrototypeWorkflow';
import {
  ACCOUNTING_ASSET_POOL,
  SCRAP_ASSET_POOL,
} from './scrapPrototypeData';
import {
  getDisposalCandidates,
  requiresPhysicalDisposal,
  getScrapPrototypeRecords,
  saveScrapPrototypeRecords,
  validateAccountingAssets,
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
    statuses: ['草稿', '审批中', '已驳回', '已完成'],
  },
  disposal: {
    title: '资产处置',
    createLabel: '创建资产处置申请单',
    statuses: ['草稿', '审批中', '已驳回', '已完成'],
  },
};

function defaultForm(type) {
  return {
    applicationNo: '',
    documentStatus: '草稿',
    creator: `${CURRENT_EMPLOYEE.id}-${CURRENT_EMPLOYEE.name}`,
    applicationDate: dayjs().format('YYYY-MM-DD'),
    company: '',
    companies: [],
    assetScope: type === 'accounting' ? '混合' : '',
    plate: type === 'disposal' ? '' : '17.Corporate',
    plates: [],
    officeArea: CURRENT_EMPLOYEE.officeArea,
    contactPhone: CURRENT_EMPLOYEE.phone,
    email: CURRENT_EMPLOYEE.email,
    department: CURRENT_EMPLOYEE.department,
    remark: '',
    description: '',
    attachments: [],
    scrapMethod: type === 'accounting' ? '非调账' : '全部报废',
    scrapReasons: {},
    scrapFormName: '',
    scrapFormNameManual: false,
    scrapPeriod: '',
    disposalDescription: '',
    disposalDescriptionManual: false,
    assetCategory: '',
    assetLocation: '',
    region: '北京',
    needsCleaning: '否',
    quoteReceiver: '',
    procurementQuoteSupplier: '',
    procurementQuoteAmount: '',
    procurementQuoteAttachments: [],
    internalAuditQuotes: [{ id: 'audit-1', supplier: '', amount: '', attachments: [] }],
    finalQuoteSupplier: '',
    finalQuoteAmount: '',
    finalQuoteAttachments: [],
    physicalReceiver: '',
    stampedQuoteAttachments: [],
    handoverSignatureAttachments: [],
    paymentReceiptAttachments: [],
    dataCleaningReportAttachments: [],
    addSignPerson: '',
    addSignReturnNode: '',
    recycler1Name: '',
    recycler2Name: '',
    recycler3Name: '',
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

function getCrossCompanyApproverMappings(form) {
  const currentCreator = `${CURRENT_EMPLOYEE.id}-${CURRENT_EMPLOYEE.name}`;
  if (form.creator !== currentCreator) return {};
  return {
    '责任人5级及以上直属领导': CURRENT_EMPLOYEE.level5Leader || '',
    '责任人7级及以上直属领导': CURRENT_EMPLOYEE.level7Leader || '',
  };
}

function firstNode(type, form, assets) {
  if (type === 'crossCompany') {
    return getCrossCompanyApprovalNodes(form.assetScope, getCrossCompanyApproverMappings(form))[0];
  }

  if (type === 'scrap') {
    if (form.assetScope === '机房资产') return getScrapApprovalNodes(form.assetScope, assets, form)[0];
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
  return '审批中';
}

const MACHINE_SCRAP_ADD_SIGN_NODES = [
  '责任人7级及以上直属领导',
  'NO部7级及以上领导',
  '采购5级及以上领导',
];

function isMachineScrapAddSignNode(node) {
  return String(node || '').startsWith('专家评估（') || MACHINE_SCRAP_ADD_SIGN_NODES.includes(node);
}

function machineScrapQuantity(assets = []) {
  return assets.reduce((sum, asset) => sum + Number(asset.quantity || 0), 0);
}

function knownMachineScrapApprover(node) {
  const match = String(node || '').match(/^专家评估（(.+?)(\d+)）$/);
  if (!match) return '';
  return `${match[2]}-${match[1]}`;
}

function machineScrapNodeError(record, assets = []) {
  const form = record.formSnapshot || record;
  const node = record.currentNode;
  const quantity = machineScrapQuantity(assets);
  const quoteReceiver = quantity >= 500 ? '内审' : form.quoteReceiver;

  if (node === '采购专员选择报价接收人' && !['采购专员', '内审'].includes(quoteReceiver)) {
    return '请选择报价接收人';
  }
  if (node === '采购专员报价') {
    if (!String(form.procurementQuoteSupplier || '').trim()) return '请填写回收供应商';
    if (!Number.isFinite(Number(form.procurementQuoteAmount)) || Number(form.procurementQuoteAmount) <= 0) return '请填写有效报价金额';
    if (!(form.procurementQuoteAttachments || []).length) return '请上传报价附件';
  }
  if (node === '内审报价') {
    const rows = form.internalAuditQuotes || [];
    if (!rows.length) return '内审报价至少保留1行';
    const invalid = rows.find((row) => (
      !String(row.supplier || '').trim()
      || !Number.isFinite(Number(row.amount))
      || Number(row.amount) <= 0
      || !(row.attachments || []).length
    ));
    if (invalid) return '请完整填写每家内审报价的供应商、报价金额和报价附件';
  }
  if (node === '采购专员填写回收商报价') {
    if (!String(form.finalQuoteSupplier || '').trim()) return '请选择或填写最终回收供应商';
    if (!Number.isFinite(Number(form.finalQuoteAmount)) || Number(form.finalQuoteAmount) <= 0) return '请填写有效最终报价金额';
    if (!(form.finalQuoteAttachments || []).length) return '请上传最终报价附件';
    if (quoteReceiver === '内审') {
      const selected = (form.internalAuditQuotes || []).find((row) => row.supplier === form.finalQuoteSupplier);
      if (!selected) return '最终回收供应商必须从内审报价供应商中选择';
      if (Number(selected.amount) !== Number(form.finalQuoteAmount)) return '最终报价金额必须与所选内审报价一致';
    }
  }
  if (node === '采购专员交接资料') {
    if (!(form.stampedQuoteAttachments || []).length) return '请上传盖章报价单';
    if (!String(form.physicalReceiver || '').trim()) return '请选择实物收货人';
  }
  if (node === '采购专员线下交接') {
    if (!(form.handoverSignatureAttachments || []).length) return '请上传交接签字表';
    if (!(form.paymentReceiptAttachments || []).length) return '请上传回款凭证';
  }
  return '';
}

function machineDisposalNodeError(record) {
  if (record.assetScope !== '机房资产') return '';
  const form = record.formSnapshot || record;
  if (record.currentNode === '采购专员协办' && !(form.paymentReceiptAttachments || []).length) {
    return '请上传到款凭证';
  }
  if (record.currentNode === 'ES专员协办' && !(form.handoverSignatureAttachments || []).length) {
    return '请上传交接签字表';
  }
  if (record.currentNode === '数据清洗' && !(form.dataCleaningReportAttachments || []).length) {
    return '请上传数据清洗报告';
  }
  return '';
}

function seedAssets(type, record) {
  const sourcePool = type === 'accounting'
    // 既有演示及历史单据可只读查看，但不会因此授予当前账号候选资产权限。
    ? ACCOUNTING_ASSET_POOL
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
      newPlate: type === 'crossCompany' ? '17.Corporate' : item.newPlate || '',
      newCostCenter: type === 'crossCompany' ? '112064_新媒体成本中心' : item.newCostCenter || '',
      newResponsiblePerson: type === 'crossCompany' ? '215410-卢铭华' : item.newResponsiblePerson || '',
      targetWarehouse: type === 'crossCompany' ? 'I3001.资产上海分公司库（新媒体上海）' : item.targetWarehouse || '',
      targetCity: type === 'crossCompany' ? '37.上海市' : item.targetCity || '',
      targetBuilding: type === 'crossCompany' ? '127.瑞安广场' : item.targetBuilding || '',
      targetFloor: type === 'crossCompany' ? '12层' : item.targetFloor || '',
    }));
}

export default function ScrapPrototypeModule({
  type,
  accountingActor = null,
  accountingAuthorizationScopes = [],
  accountingApproverMappings = {},
}) {
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
    if (type === 'scrap') {
      const scrapCompanies = Array.from(new Set(assets.map((item) => item.company).filter(Boolean)));
      form.company = scrapCompanies.join('、');
      if (form.assetScope === '机房资产') {
        const machineAsset = assets.find((item) => item.scope === '机房资产') || assets[0];
        form.assetCategory = form.assetCategory || machineAsset?.majorCategory || '';
        form.assetLocation = form.assetLocation
          || (String(machineAsset?.city || '').includes('北京') ? '北京' : '非北京');
      }
    }
    if (type === 'disposal') {
      const disposalCompanies = Array.from(new Set(assets.map((item) => item.company).filter(Boolean)));
      const disposalPlates = Array.from(new Set(assets.map((item) => item.plate).filter(Boolean)));
      form.companies = Array.isArray(form.companies) && form.companies.length > 0
        ? form.companies
        : (form.company ? String(form.company).split('、').filter(Boolean) : disposalCompanies);
      if (record.assetScope === '机房资产') {
        form.company = disposalCompanies.join('、') || form.company;
        form.plates = disposalPlates;
        form.plate = disposalPlates.join('、');
        form.needsCleaning = assets.some((item) => item.dataCleaning === '是') ? '是' : '否';
      } else {
        form.plates = Array.isArray(form.plates) ? form.plates : [];
      }
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
    if (type === 'accounting') {
      const validation = validateAccountingAssets(form, assets, {
        actor: accountingActor,
        authorizationScopes: accountingAuthorizationScopes,
        recordId: form.id,
        draft: !submit,
      });
      if (!validation.valid) {
        message.error(validation.errors[0]?.message || '账面报废数据校验失败');
        return;
      }
    }
    const applicationNo = form.applicationNo || createApplicationNo(type);
    const uniqueScopes = new Set(assets.map((item) => item.scope));
    const assetScope = type === 'accounting'
      ? (uniqueScopes.size > 1 ? '混合' : assets[0]?.scope || '混合')
      : type === 'crossCompany'
        ? (uniqueScopes.size === 1 ? [...uniqueScopes][0] : form.assetScope)
        : form.assetScope;

    const sourceCompanies = Array.from(new Set(assets.map((item) => item.company).filter(Boolean)));
    const sourcePlates = Array.from(new Set(assets.map((item) => item.plate).filter(Boolean)));
    const normalizedForm = {
      ...form,
      assetScope,
      company: type === 'scrap' ? sourceCompanies.join('、') : form.company,
    };
    const nowText = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const approvalHistory = submit && ['crossCompany', 'scrap', 'accounting', 'disposal'].includes(type)
        ? [
          ...(form.approvalHistory || []),
          { node: '发起人提交', person: normalizedForm.creator || '', result: '提交', opinion: '', time: nowText },
        ]
      : form.approvalHistory || [];
    const submittedCurrentNode = submit ? firstNode(type, normalizedForm, assets) : '草稿';
    const crossCompanyPlan = type === 'crossCompany'
      ? getCrossCompanyApprovalSteps(assetScope, getCrossCompanyApproverMappings(normalizedForm))
      : [];
    const submittedApprover = type === 'crossCompany'
      ? crossCompanyPlan.find((step) => !step.skipped && step.node === submittedCurrentNode)?.approver || ''
      : type === 'scrap' && assetScope === '机房资产'
        ? knownMachineScrapApprover(submittedCurrentNode) || normalizedForm.currentApprover || ''
        : normalizedForm.currentApprover || '';
    const nextForm = {
      ...normalizedForm,
      disposalMode: type === 'disposal' ? '实物处置' : normalizedForm.disposalMode,
      applicationNo,
      documentStatus: submit ? submitStatus(type, normalizedForm) : '草稿',
      currentNode: submittedCurrentNode,
      currentApprover: submittedApprover,
      approvalHistory,
    };

    const targetCompanies = Array.from(new Set(assets.map((item) => item.newCompany).filter(Boolean)));
    const scrapMethods = Array.from(new Set(assets.map((item) => item.scrapMethod).filter(Boolean)));
    const nextRecord = {
      id: form.id || `${type}-${applicationNo}`,
      applicationNo,
      documentStatus: nextForm.documentStatus,
      assetScope,
      company: normalizedForm.company,
      targetCompany: targetCompanies.length ? targetCompanies.join('、') : form.targetCompany || '',
      plate: type === 'disposal' ? sourcePlates.join('、') : form.plate,
      creator: form.creator,
      createdAt: form.applicationDate,
      lastModifiedAt: nowText,
      assetCount: assets.length,
      assetQuantityTotal: assets.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      assetTags: assets.map((item) => item.tagNo).filter(Boolean),
      serialNumbers: assets.map((item) => item.serialNumber).filter(Boolean),
      originalValueTotal: assets.reduce((sum, item) => sum + Number(item.originalValue || 0), 0),
      netValueTotal: assets.reduce((sum, item) => sum + Number(item.netValue || 0), 0),
      scrapMethod: type === 'accounting' ? form.scrapMethod : scrapMethods.length > 1 ? '混合' : scrapMethods[0] || form.scrapMethod,
      region: form.region,
      disposalMode: type === 'disposal' ? nextForm.disposalMode : undefined,
      currentNode: nextForm.currentNode,
      currentApprover: nextForm.currentApprover,
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
    if (!['crossCompany', 'scrap', 'accounting', 'disposal'].includes(type) || record.documentStatus !== '审批中') return;
    const recordAssets = record.assetsSnapshot || seedAssets(type, record);
    const recordForm = record.formSnapshot || record;
    const machineQuantity = type === 'scrap' && record.assetScope === '机房资产'
      ? machineScrapQuantity(recordAssets)
      : 0;
    if (
      type === 'scrap'
      && record.assetScope === '机房资产'
      && machineQuantity >= 500
      && recordForm.quoteReceiver !== '内审'
    ) {
      record = {
        ...record,
        quoteReceiver: '内审',
        formSnapshot: { ...recordForm, quoteReceiver: '内审' },
      };
    }

    if (type === 'scrap' && record.assetScope === '机房资产' && result === '加签') {
      if (!isMachineScrapAddSignNode(record.currentNode)) {
        message.error('当前节点不支持加签');
        return;
      }
      const addSignPerson = String((record.formSnapshot || record).addSignPerson || '').trim();
      if (!addSignPerson) {
        message.error('请选择加签人');
        return;
      }
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const history = [
        ...(record.approvalHistory || []),
        {
          node: record.currentNode,
          person: record.currentApprover || '',
          result: '加签',
          opinion: opinion.trim(),
          time: now,
        },
      ];
      const addSignNode = `加签：${addSignPerson}`;
      const updatedRecord = {
        ...record,
        documentStatus: '审批中',
        currentNode: addSignNode,
        lastModifiedAt: now,
        approvalHistory: history,
        formSnapshot: {
          ...(record.formSnapshot || {}),
          documentStatus: '审批中',
          currentNode: addSignNode,
          addSignReturnNode: record.currentNode,
          addSignPerson: '',
          approvalHistory: history,
        },
      };
      const next = records.map((item) => item.id === record.id ? updatedRecord : item);
      saveScrapPrototypeRecords(type, next);
      setRecords(next);
      message.success('已加签，等待加签人处理');
      return updatedRecord;
    }

    if (type === 'scrap' && String(record.currentNode || '').startsWith('加签：')) {
      if (result !== '通过') {
        message.error('加签节点仅支持确认完成');
        return;
      }
      const returnNode = String((record.formSnapshot || record).addSignReturnNode || '').trim();
      if (!returnNode) {
        message.error('加签返回节点缺失');
        return;
      }
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const entry = {
        node: record.currentNode,
        person: record.currentNode.replace(/^加签：/, ''),
        result: '通过',
        opinion: opinion.trim(),
        time: now,
      };
      const history = [...(record.approvalHistory || []), entry];
      const updatedRecord = {
        ...record,
        documentStatus: '审批中',
        currentNode: returnNode,
        lastModifiedAt: now,
        approvalHistory: history,
        formSnapshot: {
          ...(record.formSnapshot || {}),
          documentStatus: '审批中',
          currentNode: returnNode,
          addSignReturnNode: '',
          approvalHistory: history,
        },
      };
      const next = records.map((item) => item.id === record.id ? updatedRecord : item);
      saveScrapPrototypeRecords(type, next);
      setRecords(next);
      message.success('加签完成，已返回原审批节点');
      return updatedRecord;
    }

    if (result === '通过' && type === 'scrap' && record.assetScope === '机房资产') {
      const error = machineScrapNodeError(record, recordAssets);
      if (error) {
        message.error(error);
        return;
      }
    }
    if (result === '通过' && type === 'disposal') {
      const error = machineDisposalNodeError(record);
      if (error) {
        message.error(error);
        return;
      }
    }

    if (
      result === '驳回'
      && type === 'scrap'
      && record.assetScope === '机房资产'
      && record.currentNode === 'FS审批部门'
    ) {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const entry = {
        node: 'FS审批部门',
        person: record.currentApprover || '',
        result: '打回',
        opinion: opinion.trim(),
        time: now,
      };
      const history = [...(record.approvalHistory || []), entry];
      const updatedRecord = {
        ...record,
        documentStatus: '审批中',
        currentNode: '采购专员交接资料',
        lastModifiedAt: now,
        approvalHistory: history,
        formSnapshot: {
          ...(record.formSnapshot || {}),
          documentStatus: '审批中',
          currentNode: '采购专员交接资料',
          approvalHistory: history,
        },
      };
      const next = records.map((item) => item.id === record.id ? updatedRecord : item);
      saveScrapPrototypeRecords(type, next);
      setRecords(next);
      message.success('已打回采购专员补充交接资料');
      return updatedRecord;
    }

    const accountingSteps = type === 'accounting'
      ? getAccountingApprovalSteps(recordAssets, accountingApproverMappings)
      : [];
    const crossCompanySteps = type === 'crossCompany'
      ? getCrossCompanyApprovalSteps(record.assetScope, getCrossCompanyApproverMappings(record.formSnapshot || record))
      : [];
    const nodes = type === 'crossCompany'
      ? crossCompanySteps.filter((step) => !step.skipped).map((step) => step.node)
      : type === 'scrap'
        ? getScrapApprovalNodes(record.assetScope, recordAssets, record.formSnapshot || record)
        : type === 'accounting'
          ? accountingSteps.filter((step) => !step.skipped).map((step) => step.node)
          : getDisposalApprovalNodes(record);
    if (!nodes) return;
    if (type === 'accounting') nodes.push('提单人确认');
    const currentIndex = nodes.indexOf(record.currentNode);
    if (currentIndex < 0) throw new Error(`未知审批节点：${record.currentNode}`);
    if (type === 'accounting' && record.currentNode === '提单人确认' && result === '通过') {
      return executeAccounting(record, opinion);
    }
    const currentAccountingStep = type === 'accounting'
      ? accountingSteps.find((step) => step.node === record.currentNode)
      : null;
    if (type === 'accounting' && currentAccountingStep?.blockedByMissingMapping) {
      message.error(`审批人映射未配置：${record.currentNode}`);
      return;
    }

    const approved = result === '通过';
    const lastNode = approved && currentIndex === nodes.length - 1;
    const completed = lastNode && type !== 'accounting';
    const currentNode = approved
      ? (completed ? '流程结束' : nodes[currentIndex + 1])
      : '发起人修改';
    const documentStatus = approved
      ? (completed ? (type === 'scrap' ? '已审批' : '已完成') : '审批中')
      : '已驳回';
    const entry = {
      node: record.currentNode,
      person: currentAccountingStep?.approverName || currentAccountingStep?.approverId
        || (type === 'accounting' && record.currentNode === '提单人确认' ? record.creator : '')
        || (type === 'scrap' && record.assetScope === '机房资产' ? knownMachineScrapApprover(record.currentNode) : '')
        || record.currentApprover || '',
      result,
      opinion: opinion.trim(),
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    const nextNode = approved && !lastNode ? nodes[currentIndex + 1] : null;
    const nextCrossCompanyApprover = type === 'crossCompany' && nextNode
      ? crossCompanySteps.find((step) => step.node === nextNode)?.approver || ''
      : '';
    const nextMachineScrapApprover = type === 'scrap' && record.assetScope === '机房资产' && nextNode
      ? knownMachineScrapApprover(nextNode)
      : '';
    const nextApprover = nextCrossCompanyApprover || nextMachineScrapApprover;
    const skippedEntries = type === 'accounting' && approved
      ? accountingSteps
        .filter((step) => step.skipped)
        .filter((step) => {
          const fullCurrent = accountingSteps.findIndex((item) => item.node === record.currentNode);
          const fullNextIndex = nextNode ? accountingSteps.findIndex((item) => item.node === nextNode) : -1;
          const fullNext = fullNextIndex < 0 ? accountingSteps.length : fullNextIndex;
          const position = accountingSteps.findIndex((item) => item.node === step.node);
          return position > fullCurrent && position < fullNext;
        })
        .map((step) => ({
          node: step.node,
          person: step.approverName || step.approverId,
          result: '跳过',
          opinion: '与前序审批节点为同一审批人，自动跳过',
          time: entry.time,
        }))
      : [];
    const nextHistory = [...(record.approvalHistory || []), entry, ...skippedEntries];
    const shouldNotifyAccountingInitiator = ['crossCompany', 'scrap'].includes(type)
      && completed
      && ['软件', '办公设备'].includes(record.assetScope);
    const shouldNotifyMachineTransferParticipants = type === 'crossCompany'
      && completed
      && record.assetScope === '机房资产';
    const shouldNotifyMachineScrapParticipants = type === 'scrap'
      && completed
      && record.assetScope === '机房资产';
    const shouldNotifyMachineDisposalParticipants = type === 'disposal'
      && completed
      && record.assetScope === '机房资产';
    const updatedRecord = {
      ...record,
      documentStatus,
      currentNode,
      currentApprover: nextApprover,
      lastModifiedAt: entry.time,
      enteredScrapPoolAt: completed ? entry.time : record.enteredScrapPoolAt,
      serviceNotification: shouldNotifyAccountingInitiator
        ? {
            channel: '服务号',
            recipientRole: '对应账面报废发起人',
            trigger: type === 'crossCompany' ? '跨公司转移审批完成' : '资产报废审批完成',
            sentAt: entry.time,
          }
        : shouldNotifyMachineTransferParticipants
          ? {
              channel: '服务号',
              recipientRole: '申请人及审批人',
              trigger: '跨公司转移审批完成',
              sentAt: entry.time,
            }
          : shouldNotifyMachineScrapParticipants
            ? {
                channel: '服务号',
                recipientRole: '所有实际参与人',
                trigger: '资产报废审批完成',
                sentAt: entry.time,
              }
            : shouldNotifyMachineDisposalParticipants
              ? {
                  channel: '服务号',
                  recipientRole: '申请人及实际审批人',
                  trigger: '资产处置完成',
                  sentAt: entry.time,
                }
              : record.serviceNotification,
      assetsSnapshot: completed
        ? recordAssets.map((asset) => ({
            ...asset,
            status: type === 'disposal' ? '已报废-已处置' : String(asset.status || '').startsWith('在库') ? '在库-待报废' : asset.status,
          }))
        : recordAssets,
      approvalHistory: nextHistory,
      formSnapshot: record.formSnapshot
        ? { ...record.formSnapshot, documentStatus, currentNode, currentApprover: nextApprover, approvalHistory: nextHistory }
        : record.formSnapshot,
    };
    const next = records.map((item) => (
      item.id === record.id
        ? updatedRecord
        : item
    ));
    saveScrapPrototypeRecords(type, next);
    setRecords(next);
    message.success(completed
      ? (type === 'disposal'
        ? '处置流程已完成'
        : shouldNotifyAccountingInitiator
          ? '审批完成，资产已进入待报废池，并已通知对应账面报废发起人'
          : shouldNotifyMachineTransferParticipants
            ? '审批完成，资产已进入待报废池，并已通知申请人及审批人'
            : shouldNotifyMachineScrapParticipants
              ? '审批完成，资产已进入待报废池，并已通知实际参与人'
              : '审批完成，资产已进入待报废池')
      : currentNode === '提单人确认'
        ? '审批通过，待提单人确认'
        : approved ? '审批通过' : '已驳回发起人');
    return updatedRecord;
  };

  const executeAccounting = (record, opinion = '') => {
    if (type !== 'accounting' || record?.documentStatus !== '审批中' || record.currentNode !== '提单人确认') return;
    const sourceAssets = record.assetsSnapshot || seedAssets('accounting', record);
    const validation = validateAccountingAssets(record.formSnapshot || record, sourceAssets, {
      actor: accountingActor,
      authorizationScopes: accountingAuthorizationScopes,
      recordId: record.id,
    });
    if (!validation.valid) {
      message.error(validation.errors[0]?.message || '账面报废执行校验失败');
      return;
    }
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const completedRecord = {
      ...record,
      documentStatus: '已完成', currentNode: '流程结束', lastModifiedAt: now,
      approvalHistory: [...(record.approvalHistory || []), { node: '提单人确认', person: record.creator, result: '确认并执行', opinion: opinion.trim(), time: now }],
      formSnapshot: record.formSnapshot ? { ...record.formSnapshot, documentStatus: '已完成', currentNode: '流程结束',
        approvalHistory: [...(record.approvalHistory || []), { node: '提单人确认', person: record.creator, result: '确认并执行', opinion: opinion.trim(), time: now }] } : record.formSnapshot,
      assetsSnapshot: sourceAssets.map((asset) => ({
        ...asset,
        status: asset.scrapMethod === '调账'
          ? asset.status
          : requiresPhysicalDisposal(asset)
            ? (asset.scope === '机房资产' && !String(asset.city || '').includes('北京') && asset.dataCleaning === '否'
              ? '已报废-已处置'
              : '已报废-待处置')
            : '已报废-已处置',
      })),
    };
    const next = records.map((item) => item.id === record.id ? completedRecord : item);
    saveScrapPrototypeRecords(type, next);
    setRecords(next);

    // 所有需要实物处置的机房资产自动生成处置单；数据清洗只决定是否增加清洗协办节点。
    const currentDisposal = getScrapPrototypeRecords('disposal');
    const existingAssetTags = new Set(currentDisposal.flatMap((item) => (item.assetsSnapshot || []).map((asset) => asset.tagNo)));
    const automaticAssets = sourceAssets.filter((asset) => (
      asset.scope === '机房资产'
      && requiresPhysicalDisposal(asset)
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
      const disposalMode = '实物处置';
      const region = String(asset.city || '').includes('北京') ? '北京' : '非北京';
      const basic = {
        ...defaultForm('disposal'), applicationNo, company: asset.company,
        assetScope: asset.scope, disposalMode, region,
        needsCleaning: asset.dataCleaning === '是' ? '是' : '否',
        creator: '系统自动', applicationDate: now.slice(0, 10),
        documentStatus: '审批中',
      };
      const approvalNodes = getDisposalApprovalNodes(basic);
      const currentNode = approvalNodes[0] || '流程结束';
      const autoCompleted = approvalNodes.length === 0;
      const approvalHistory = [
        { node: '系统发起', person: '系统自动', result: '提交', opinion: '', time: now },
        ...(autoCompleted ? [{ node: '系统完成', person: '系统自动', result: '完成', opinion: '无需数据清洗，无后续人工协办节点', time: now }] : []),
      ];
      const documentStatus = autoCompleted ? '已完成' : '审批中';
      return {
        id: `disposal-${record.id}-${asset.id}`, applicationNo,
        documentStatus, company: asset.company, assetScope: asset.scope,
        disposalMode, region, needsCleaning: basic.needsCleaning,
        creator: '系统自动', createdAt: now.slice(0, 10), currentNode,
        assetCount: 1, assetsSnapshot: [{ ...asset, status: autoCompleted ? '已报废-已处置' : '已报废-待处置', sourceAccountingNo: record.applicationNo }],
        approvalHistory,
        serviceNotification: autoCompleted
          ? {
              channel: '服务号',
              recipientRole: '申请人及实际审批人',
              trigger: '资产处置完成',
              sentAt: now,
            }
          : undefined,
        formSnapshot: { ...basic, documentStatus, currentNode, approvalHistory },
      };
    });
    if (autoRecords.length) saveScrapPrototypeRecords('disposal', [...autoRecords, ...currentDisposal]);
    message.success('账面报废执行完成');
    return completedRecord;
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
      accountingActor={accountingActor}
      accountingAuthorizationScopes={accountingAuthorizationScopes}
      onApprove={processApproval}
      onExecute={(recordId, opinion) => executeAccounting(records.find((item) => item.id === recordId), opinion)}
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
