import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  Descriptions,
  Input,
  Select,
  Table,
  Tabs,
  Collapse,
  Typography,
  Space,
  Steps,
  Upload,
  message,
} from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import SelectModal from '../../components/SelectModal';
import LookupInput from '../../components/LookupInput';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import BorrowingApprovalHistory from '../assetBorrowing/BorrowingApprovalHistory';
import ScrapPrototypeAssetTable, { exportScrapPrototypeAssets } from './ScrapPrototypeAssetTable';
import { getScrapPrototypeApprovalRecords } from './scrapPrototypeApproval';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';
import { money } from './scrapPrototypeData';
import { getDisposalCandidates, validateAccountingAssets } from '../../services/scrapPrototypeService';

const transferCompanyOptions = Array.from(
  [...getAssetMaintenanceRows(), ...warehouseCatalog.map((item) => {
    const [companyCode, ...parts] = String(item.company || '').split('.');
    return { companyCode, company: parts.join('.') };
  })].reduce((companies, item) => {
    const code = String(item.companyCode || '').trim();
    const name = String(item.company || '').trim();
    if (code && name && !companies.has(code)) {
      companies.set(code, { id: `company-${code}`, code, name });
    }
    return companies;
  }, new Map()).values(),
);

const employeeLookupRecords = Array.from(
  getAssetMaintenanceRows().reduce((employees, row) => {
    const code = String(row.ownerId || '').trim();
    const name = String(row.ownerName || '').trim();
    if (code && name && !employees.has(code)) {
      employees.set(code, {
        id: `employee-${code}`,
        code,
        name,
        company: row.companyCode && row.company ? `${row.companyCode}.${row.company}` : row.company || '',
        department: row.department || '',
      });
    }
    return employees;
  }, new Map()).values(),
);

function options(values) {
  return values.map((value) => ({ label: value, value }));
}

function sectionTitle(title) {
  return (
    <div className="flex items-center gap-2.5 py-0.5">
      <span className="h-5 w-1 rounded-full bg-[#1677ff]" />
      <span className="text-base font-semibold text-gray-900">{title}</span>
    </div>
  );
}

const ACCOUNTING_SUMMARY_PROJECTS = [
  '主机',
  '显示器',
  '主机（配件）',
  '笔记本',
  '笔记本（配件）',
  '办公设备',
  '办公设备（配件）',
  '服务器',
  '服务器（配件）',
  '网络设备',
  '网络设备（配件）',
  '家具',
  'VEHICLE',
];

function accountingCompanyDisplayName(company) {
  const text = String(company || '').trim();
  const [code, ...parts] = text.split('.');
  const name = parts.length ? parts.join('.') : text;
  if (code === '114' && name === '新媒体') return '搜狐新媒体';
  return name;
}

function accountingSummaryProject(asset) {
  const category = String(asset?.majorCategory || '').trim().toUpperCase();
  const minor = String(asset?.minorCategory || '');
  const description = String(asset?.description || '');
  const accessory = Boolean(
    asset?.parentAssetTag
    || asset?.mainAssetTag
    || asset?.mainTagNo
    || asset?.mainTag
    || asset?.isAccessory
    || /配件/.test(minor)
    || /配件/.test(description)
  );
  let base = category;
  if (category === 'PC') base = '主机';
  else if (category === 'DISPLAY' || /显示器/.test(minor) || /显示器/.test(description)) base = '显示器';
  else if (category === 'NOTEBOOK') base = '笔记本';
  else if (category === 'OFFICE EQUIPMENT') base = '办公设备';
  else if (category === 'SERVER') base = '服务器';
  else if (category === 'NET EQUIPMENT') base = '网络设备';
  else if (category === 'FURNITURE') base = '家具';
  else if (category === 'VEHICLE') base = 'VEHICLE';
  return accessory && ['主机', '笔记本', '办公设备', '服务器', '网络设备'].includes(base)
    ? `${base}（配件）`
    : base;
}

export default function ScrapPrototypeEditor({
  type,
  config,
  initialForm,
  initialAssets,
  readOnly,
  approvalPage = false,
  onBack,
  onSave,
  onApprove,
  onExecute,
  onEdit,
  accountingActor,
  accountingAuthorizationScopes,
}) {
  const [form, setForm] = useState(initialForm);
  const [assets, setAssets] = useState(initialAssets);
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [employeePickerField, setEmployeePickerField] = useState('');
  const [approvalOpinion, setApprovalOpinion] = useState('同意');
  const [accountingPreview, setAccountingPreview] = useState(false);
  const [disposalPreview, setDisposalPreview] = useState(false);
  const [accountingNameTouched, setAccountingNameTouched] = useState(Boolean(initialForm.scrapFormNameManual));
  const [disposalDescriptionTouched, setDisposalDescriptionTouched] = useState(Boolean(initialForm.disposalDescriptionManual));

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateAsset = (id, field, value) => {
    setAssets((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };


  const updateAuditQuote = (id, field, value) => {
    setForm((current) => ({
      ...current,
      internalAuditQuotes: (current.internalAuditQuotes || []).map((row) => (
        row.id === id ? { ...row, [field]: value } : row
      )),
    }));
  };

  const addAuditQuote = () => {
    setForm((current) => {
      const rows = current.internalAuditQuotes || [];
      const nextNo = rows.reduce((max, row) => {
        const value = Number(String(row.id || '').replace(/\D/g, ''));
        return Number.isFinite(value) ? Math.max(max, value) : max;
      }, 0) + 1;
      return {
        ...current,
        internalAuditQuotes: [...rows, { id: `audit-${nextNo}`, supplier: '', amount: '', attachments: [] }],
      };
    });
  };

  const removeAuditQuote = (id) => {
    setForm((current) => {
      const rows = current.internalAuditQuotes || [];
      if (rows.length <= 1) {
        message.warning('内审报价至少保留1行');
        return current;
      }
      return { ...current, internalAuditQuotes: rows.filter((row) => row.id !== id) };
    });
  };

  const managedUpload = (field, label) => (
    <Upload
      fileList={form[field] || []}
      onChange={({ fileList }) => updateForm(field, fileList)}
      beforeUpload={(file) => {
        if (file.size > 20 * 1024 * 1024) {
          message.error('单文件不能超过20MB');
          return Upload.LIST_IGNORE;
        }
        return false;
      }}
    >
      <Button icon={<UploadOutlined />}>{label}</Button>
    </Upload>
  );

  const accountingPlates = Array.from(new Set(assets.map((item) => item.plate).filter(Boolean)));
  const accountingNamingPlate = assets.length > 0
    ? (accountingPlates.length === 1 ? accountingPlates[0] : '')
    : form.plate;
  const accountingIsVideo = /视频|video/i.test(String(accountingNamingPlate || ''));
  const accountingAutoName = type === 'accounting' && form.company
    ? `${accountingCompanyDisplayName(form.company)}${accountingIsVideo ? '视频' : ''}固定资产报废申请表`
    : '';
  const accountingFormName = accountingNameTouched ? form.scrapFormName || '' : accountingAutoName;
  const accountingScrapPeriod = type === 'accounting' && dayjs(form.applicationDate).isValid()
    ? dayjs(form.applicationDate).format('YYYY年M月')
    : '';

  const showValue = (value) => (
    <span>{value === undefined || value === null || value === '' ? '-' : String(value)}</span>
  );


  const allAttachments = useMemo(() => {
    const groups = [
      form.attachments || [],
      form.procurementQuoteAttachments || [],
      ...(form.internalAuditQuotes || []).map((row) => row.attachments || []),
      form.finalQuoteAttachments || [],
      form.stampedQuoteAttachments || [],
      form.handoverSignatureAttachments || [],
      form.paymentReceiptAttachments || [],
      form.dataCleaningReportAttachments || [],
    ];
    const seen = new Set();
    return groups.flat().filter((file) => {
      const key = file?.uid || file?.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [form]);

  const disposalSelectedCompanies = type === 'disposal'
    ? (Array.isArray(form.companies) && form.companies.length > 0
      ? form.companies
      : String(form.company || '').split('、').filter(Boolean))
    : [];
  const disposalSelectedPlates = type === 'disposal'
    ? (Array.isArray(form.plates) ? form.plates.filter(Boolean) : [])
    : [];
  const disposalPlateOptions = type === 'disposal'
    ? Array.from(new Set(getDisposalCandidates()
      .filter((item) => (
        item.scope === '办公设备'
        && (disposalSelectedCompanies.length === 0 || disposalSelectedCompanies.includes(item.company))
      ))
      .map((item) => item.plate)
      .filter(Boolean)))
      .map((value) => ({ label: value, value }))
    : [];
  const disposalPlateDisplay = disposalSelectedPlates.length > 0
    ? disposalSelectedPlates.join('、')
    : '全部板块';

  const decideTransfer = (decision) => {
    if (decision === '驳回' && !approvalOpinion.trim()) {
      message.warning('驳回时审批意见必填');
      return;
    }
    const approvalRecord = {
      ...form,
      id: form.id,
      applicationNo: form.applicationNo,
      documentStatus: form.documentStatus,
      currentNode: form.currentNode,
      assetScope: form.assetScope,
      assetsSnapshot: assets,
      approvalHistory: form.approvalHistory || [],
      formSnapshot: form,
    };
    const updated = type === 'accounting' && form.currentNode === '提单人确认' && decision === '通过'
      ? onExecute?.(form.id, approvalOpinion)
      : onApprove?.(approvalRecord, decision, approvalOpinion);
    if (updated) {
      setForm((current) => ({
        ...current,
        ...updated.formSnapshot,
        documentStatus: updated.documentStatus,
        currentNode: updated.currentNode,
        approvalHistory: updated.approvalHistory || [],
      }));
    }
    setApprovalOpinion('同意');
  };

  const renderSelect = (value, selectOptions, onChange, disabled = false) => (
    readOnly
      ? showValue(value)
      : (
        <Select
          disabled={disabled}
          value={value || undefined}
          options={selectOptions}
          className="w-full"
          onChange={onChange}
        />
      )
  );

  const disposalQuoteTotals = useMemo(() => (
    [1, 2, 3].map((index) => assets.reduce(
      (sum, item) => sum + Number(item[`recycler${index}`] || 0),
      0,
    ))
  ), [assets]);
  const disposalQuantityTotal = assets.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const disposalOriginalValueTotal = assets.reduce((sum, item) => sum + Number(item.originalValue || 0), 0);
  const disposalNetValueTotal = assets.reduce((sum, item) => sum + Number(item.netValue || 0), 0);
  const disposalRecyclerEntries = [1, 2, 3].map((index) => {
    const name = String(form[`recycler${index}Name`] || '').trim();
    const hasQuote = assets.some((asset) => {
      const value = asset[`recycler${index}`];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
    return { index, name, hasQuote, total: disposalQuoteTotals[index - 1] || 0 };
  });
  const disposalActiveRecyclerEntries = disposalRecyclerEntries.filter((item) => item.name || item.hasQuote);
  const disposalRecyclerInfoEmpty = disposalActiveRecyclerEntries.length === 0;
  const disposalHighestRecycler = disposalActiveRecyclerEntries.reduce(
    (highest, item) => (!highest || item.total > highest.total ? item : highest),
    null,
  );
  const disposalHighestQuoteTotal = disposalHighestRecycler?.total || 0;
  const disposalHighestRecyclerName = disposalHighestRecycler
    ? disposalHighestRecycler.name || `回收商${['一', '二', '三'][disposalHighestRecycler.index - 1]}`
    : '';
  const disposalRecoveryWan = (disposalHighestQuoteTotal / 10000).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const disposalRecyclerCountText = ['零', '一', '两', '三'][disposalActiveRecyclerEntries.length] || disposalActiveRecyclerEntries.length;
  const disposalAutoDescription = type === 'disposal'
    && form.assetScope === '办公设备'
    && !disposalRecyclerInfoEmpty
    ? `按照报废计划，ES拟对${disposalQuantityTotal}台库存老旧办公资产进行变卖处置，预计回收总价约${disposalRecoveryWan}万元，处置方案如下，请您审批。\n\n(一)  处置数量：共${disposalQuantityTotal}台，资产原值${money(disposalOriginalValueTotal)}元，净值${money(disposalNetValueTotal)}元，已完成账面报废。（注：电脑类资产配置经MIS确认不再满足员工办公需求）\n\n(二) 处置方式：\n\n- 由${disposalRecyclerCountText}家采购回收商分别进行评估报价，其中回收商“${disposalHighestRecyclerName}”总价最高，约${disposalRecoveryWan}万元，建议与其合作（下附比价表）；\n- 待您及集团财务领导审批后，ES将联系回收商打款并完成实物交接。`
    : '';
  const disposalDescription = disposalDescriptionTouched
    ? form.disposalDescription || ''
    : disposalAutoDescription;

  const effectiveNeedsCleaning = type === 'disposal'
    && form.assetScope === '机房资产'
    ? (assets.some((item) => item.dataCleaning === '是') ? '是' : '否')
    : form.needsCleaning;

  const handleAssetReplace = (nextAssets) => {
    setAssets(nextAssets);

    setForm((current) => {
      const firstAsset = nextAssets[0];
      const nextScope = type === 'accounting' ? current.assetScope : firstAsset?.scope || '';
      const nextForm = {
        ...current,
        assetScope: nextScope,
        ...(type === 'scrap' ? {
          company: Array.from(new Set(
            nextAssets.map((item) => item.company).filter(Boolean),
          )).join('、'),
        } : {}),
      };

      if (firstAsset) {
        if (type === 'scrap' && firstAsset.scope === '机房资产') {
          nextForm.assetCategory = firstAsset.majorCategory;
          nextForm.assetLocation = String(firstAsset.city || '').includes('北京') ? '北京' : '非北京';
        }
        if (type === 'crossCompany') {
          const sourceCompanies = new Set(nextAssets.map((item) => item.company).filter(Boolean));
          if (sourceCompanies.size === 1) {
            nextForm.company = firstAsset.company || current.company;
          }
        } else if (type === 'disposal' && firstAsset.scope === '机房资产') {
          nextForm.company = firstAsset.company || current.company;
          nextForm.companies = firstAsset.company ? [firstAsset.company] : [];
          const machinePlates = Array.from(new Set(nextAssets.map((item) => item.plate).filter(Boolean)));
          nextForm.plates = machinePlates;
          nextForm.plate = machinePlates.join('、');
        }
        if (type === 'disposal') {
          nextForm.region = firstAsset.region || (String(firstAsset.city || '').includes('北京') ? '北京' : '非北京');
        }
      }

      if (type === 'disposal' && nextScope === '机房资产') {
        nextForm.needsCleaning = nextAssets.some((item) => item.dataCleaning === '是') ? '是' : '否';
      }

      return nextForm;
    });
  };

  const validate = () => {
    if (assets.length === 0) {
      message.error('请至少添加一条资产明细');
      return false;
    }

    if (type === 'crossCompany') {
      if (!form.company) {
        message.error('请选择公司');
        return false;
      }

      const invalid = assets.find((item) => (
        !item.newCompany
        || !item.newPlate
        || !item.newCostCenter
        || !item.newResponsiblePerson
        || !item.targetCity
        || !item.targetBuilding
        || !item.targetFloor
        || !item.targetWarehouse
      ));
      if (invalid) {
        message.error(`资产 ${invalid.tagNo} 的调账目标信息未填写完整`);
        return false;
      }

      const sourceCompanies = new Set(assets.map((item) => item.company).filter(Boolean));
      if (sourceCompanies.size !== 1 || !sourceCompanies.has(form.company)) {
        message.error('同一跨公司转移单只能选择同一原公司的资产，且必须与单头公司一致');
        return false;
      }

      const sourceScopes = new Set(assets.map((item) => item.scope).filter(Boolean));
      if (sourceScopes.size !== 1) {
        message.error('同一跨公司转移单不能混合机房资产、软件和办公设备');
        return false;
      }

      const unchangedTarget = assets.find((item) => (
        item.newCompany === item.company && item.newPlate === item.plate
      ));
      if (unchangedTarget) {
        message.error(`资产 ${unchangedTarget.tagNo} 的新公司+新板块不能与原公司+原板块完全相同`);
        return false;
      }

      for (const asset of assets) {
        const warehouse = warehouseCatalog.find((item) => (
          item.status === '启用'
          && (
            asset.targetWarehouse === item.warehouseDescription
            || asset.targetWarehouse === `${item.warehouseCode}.${item.warehouseDescription}`
          )
        ));
        if (
          !warehouse
          || warehouse.company !== asset.newCompany
          || warehouse.city !== asset.targetCity
          || !String(warehouse.warehouseUsage || '').includes('资产')
        ) {
          message.error(`资产 ${asset.tagNo} 的调账后仓库与新公司、City不匹配`);
          return false;
        }

        const knownBuildingRecords = warehouseCatalog.filter((item) => item.building === asset.targetBuilding);
        if (
          knownBuildingRecords.length > 0
          && !knownBuildingRecords.some((item) => item.city === asset.targetCity)
        ) {
          message.error(`资产 ${asset.tagNo} 的Building不属于所选City`);
          return false;
        }

        if (String(asset.status || '').startsWith('在库')) {
          if (!warehouse.keeper || asset.newResponsiblePerson !== warehouse.keeper) {
            message.error(`资产 ${asset.tagNo} 的责任人必须为调账后仓库对应库管员`);
            return false;
          }
        } else if (asset.newResponsiblePerson !== asset.responsiblePerson) {
          message.error(`资产 ${asset.tagNo} 非在库状态，责任人应保持原责任人`);
          return false;
        }
      }
    }

    if (type === 'scrap') {
      if (!String(form.description || '').trim()) {
        message.error('请填写报废说明');
        return false;
      }
      if (form.assetScope === '机房资产' && (!form.assetCategory || !form.assetLocation)) {
        message.error('请选择资产大类和资产所在地');
        return false;
      }
      const invalid = assets.find((item) => !String(item.reason || '').trim());
      if (invalid) {
        message.error(`资产 ${invalid.tagNo} 的报废原因未填写完整`);
        return false;
      }
      const officePaths = new Set(assets
        .filter((item) => item.scope === '办公设备')
        .map((item) => ['PC', 'NOTEBOOK'].includes(item.majorCategory)));
      if (officePaths.size > 1) {
        message.error('电脑类与其他办公设备的鉴定流程不同，请分别建单');
        return false;
      }
    }

    if (type === 'accounting') {
      if (!String(accountingFormName || '').trim()) {
        message.error('请填写报废单名称');
        return false;
      }
      if (!accountingScrapPeriod) {
        message.error('报废期间生成失败，请检查创建时间');
        return false;
      }
      const checked = validateAccountingAssets({
        ...form,
        scrapFormName: accountingFormName,
        scrapPeriod: accountingScrapPeriod,
      }, assets, {
        actor: accountingActor,
        authorizationScopes: accountingAuthorizationScopes,
        recordId: form.id,
      });
      if (!checked.valid) {
        message.error(checked.errors[0].message);
        return false;
      }

      const transferInvalid = assets.find((item) => (
        form.scrapMethod === '调账'
        && (
          !item.newCompany
          || !item.newPlate
          || !item.newCostCenter
          || !item.newResponsiblePerson
          || !item.targetCity
          || !item.targetBuilding
          || !item.targetFloor
        )
      ));
      if (transferInvalid) {
        message.error(`调账资产 ${transferInvalid.tagNo} 的目标信息不完整`);
        return false;
      }
    }

    if (type === 'disposal' && form.assetScope === '办公设备') {
      if (
        disposalSelectedCompanies.length === 0
        || assets.some((asset) => !disposalSelectedCompanies.includes(asset.company) || asset.scope !== '办公设备')
      ) {
        message.error('请选择公司并添加所选公司范围内的待处置办公资产');
        return false;
      }
      if (
        disposalSelectedPlates.length > 0
        && assets.some((asset) => !disposalSelectedPlates.includes(asset.plate))
      ) {
        message.error('资产明细必须属于所选板块范围');
        return false;
      }
      const invalidQuote = assets.find((asset) => [1, 2, 3].some((index) => {
        const value = asset[`recycler${index}`];
        return value !== undefined && value !== null && value !== ''
          && (!Number.isFinite(Number(value)) || Number(value) <= 0);
      }));
      if (invalidQuote) {
        message.error(`资产 ${invalidQuote.tagNo} 已填写的回收商报价必须大于0`);
        return false;
      }
    }

    return true;
  };

  const getAccountingReasonText = (kind) => {
    const reasons = form.scrapReasons || {};
    if (Object.prototype.hasOwnProperty.call(reasons, kind)) return reasons[kind] || '';
    return [...new Set(assets
      .filter((item) => item.scrapType === kind)
      .map((item) => String(item.reason || '').trim())
      .filter(Boolean))].join('、');
  };

  const prepareSavePayload = () => {
    const scrapReasons = type === 'accounting'
      ? Object.fromEntries((form.scrapMethod === '调账'
        ? ['已到报废期', '未到报废期']
        : ['已到报废期', '未到报废期', '丢失']).map((kind) => [kind, getAccountingReasonText(kind)]))
      : form.scrapReasons;
    const savedAssets = type === 'accounting'
      ? assets.map((item) => ({ ...item, reason: scrapReasons[item.scrapType] || '' }))
      : assets;
    return {
      nextForm: {
        ...form,
        scrapReasons,
        scrapFormName: type === 'accounting' ? accountingFormName : form.scrapFormName,
        scrapFormNameManual: type === 'accounting' ? accountingNameTouched : form.scrapFormNameManual,
        scrapPeriod: type === 'accounting' ? accountingScrapPeriod : form.scrapPeriod,
        disposalDescription: type === 'disposal' ? disposalDescription : form.disposalDescription,
        disposalDescriptionManual: type === 'disposal' ? disposalDescriptionTouched : form.disposalDescriptionManual,
        needsCleaning: effectiveNeedsCleaning,
      },
      savedAssets,
    };
  };

  const handleSave = (submit) => {
    if (submit && !validate()) return;
    const { nextForm, savedAssets } = prepareSavePayload();
    onSave(nextForm, savedAssets, submit);
  };

  const handleAccountingPreview = () => {
    if (!validate()) return;
    const { nextForm, savedAssets } = prepareSavePayload();
    setForm(nextForm);
    setAssets(savedAssets);
    setAccountingPreview(true);
  };

  const handleDisposalPreview = () => {
    if (!validate()) return;
    const { nextForm, savedAssets } = prepareSavePayload();
    setForm(nextForm);
    setAssets(savedAssets);
    setDisposalPreview(true);
  };

  const approvalRecords = getScrapPrototypeApprovalRecords({
    ...form,
    assetsSnapshot: assets,
  }, type);
  const previewView = (type === 'accounting' && accountingPreview)
    || (type === 'disposal' && disposalPreview);
  const approvalView = approvalPage || (
    readOnly
    && ['crossCompany', 'scrap', 'accounting', 'disposal'].includes(type)
    && (type === 'accounting' ? form.documentStatus !== '草稿' : !['草稿', '已驳回'].includes(form.documentStatus))
  );
  const showApprovalActions = approvalPage && (
    (type === 'crossCompany' && form.documentStatus === '审批中')
    || (type === 'accounting' && form.documentStatus === '审批中')
    || (['scrap', 'disposal'].includes(type) && form.documentStatus === '审批中')
  );
  const showPageExport = (type === 'scrap' && approvalView)
    || (type === 'accounting' && (approvalView || previewView))
    || (type === 'disposal' && (approvalPage || previewView));

  const disposalSummary = Array.from(assets.reduce((groups, asset) => {
    const key = JSON.stringify([asset.city || '', asset.majorCategory || '']);
    if (!groups.has(key)) groups.set(key, {
      key, city: asset.city || '-', majorCategory: asset.majorCategory || '-',
      quantity: 0, originalValue: 0, netValue: 0,
      recycler1: [], recycler2: [], recycler3: [],
    });
    const group = groups.get(key);
    group.quantity += Number(asset.quantity || 0);
    group.originalValue += Number(asset.originalValue || 0);
    group.netValue += Number(asset.netValue || 0);
    for (const field of ['recycler1', 'recycler2', 'recycler3']) {
      const value = String(asset[field] || '').trim();
      if (value) group[field].push(value);
    }
    return groups;
  }, new Map()).values());

  const disposalSummaryWithCitySpan = [...disposalSummary]
    .sort((left, right) => String(left.city).localeCompare(String(right.city), 'zh-CN')
      || String(left.majorCategory).localeCompare(String(right.majorCategory), 'zh-CN'))
    .map((row, index, rows) => {
      if (index > 0 && rows[index - 1].city === row.city) {
        return { ...row, cityRowSpan: 0 };
      }
      let cityRowSpan = 1;
      while (index + cityRowSpan < rows.length && rows[index + cityRowSpan].city === row.city) {
        cityRowSpan += 1;
      }
      return { ...row, cityRowSpan };
    });

  const updateAccountingReason = (kind, value) => updateForm('scrapReasons', {
    ...(form.scrapReasons || {}),
    [kind]: value,
  });

  const approvalTable = (subset) => <ScrapPrototypeAssetTable
    type="accounting"
    assetScope={form.assetScope}
    assets={subset}
    readOnly
    onChange={updateAsset}
    onReplace={handleAssetReplace}
    scrapMethod={form.scrapMethod}
    accountingMethod={form.scrapMethod}
  />;

  const accountingSummaryRows = useMemo(() => {
    const knownProjects = new Set(ACCOUNTING_SUMMARY_PROJECTS);
    const extraProjects = Array.from(new Set(
      assets.map(accountingSummaryProject).filter((project) => project && !knownProjects.has(project)),
    ));
    return [...ACCOUNTING_SUMMARY_PROJECTS, ...extraProjects].map((project) => {
      const row = { key: project, project };
      [
        ['expired', '已到报废期'],
        ['unexpired', '未到报废期'],
        ['lost', '丢失'],
      ].forEach(([field, kind]) => {
        const rows = assets.filter((asset) => (
          asset.scrapType === kind && accountingSummaryProject(asset) === project
        ));
        row[field] = {
          quantity: rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
          originalValue: rows.reduce((sum, item) => sum + Number(item.originalValue || 0), 0),
          netValue: rows.reduce((sum, item) => sum + Number(item.netValue || 0), 0),
        };
      });
      return row;
    });
  }, [assets]);

  const accountingSummaryGroupColumns = (field, kind) => [
    {
      title: '数量',
      width: 82,
      align: 'right',
      render: (_, row) => row[field].quantity || '-',
    },
    {
      title: '原值',
      width: 120,
      align: 'right',
      render: (_, row) => row[field].quantity ? money(row[field].originalValue) : '-',
    },
    {
      title: '账面净值',
      width: 120,
      align: 'right',
      render: (_, row) => row[field].quantity ? money(row[field].netValue) : '-',
    },
    {
      title: '报废原因',
      width: 180,
      align: 'center',
      render: (_, __, index) => index === 0
        ? <div className="text-center">{showValue(getAccountingReasonText(kind))}</div>
        : null,
      onCell: (_, index) => ({ rowSpan: index === 0 ? accountingSummaryRows.length : 0 }),
    },
  ];

  const accountingSummaryColumns = [
    { title: '项目', dataIndex: 'project', width: 150, fixed: 'left' },
    { title: '已到报废期资产', children: accountingSummaryGroupColumns('expired', '已到报废期') },
    { title: '未到报废期资产', children: accountingSummaryGroupColumns('unexpired', '未到报废期') },
    { title: '丢失资产', children: accountingSummaryGroupColumns('lost', '丢失') },
  ];

  const accountingDetailTab = (kind) => {
    const subset = assets.filter((asset) => asset.scrapType === kind);
    const grouped = Array.from(subset.reduce((groups, asset) => {
      const category = asset.majorCategory || '其他';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(asset);
      return groups;
    }, new Map()).entries());
    if (subset.length === 0) {
      return <div className="py-10 text-center text-gray-400">暂无{kind}明细</div>;
    }
    return (
      <>
        <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md bg-gray-50 px-3 py-2">
          <div className="min-w-[240px] flex-1 text-center">
            <Typography.Text strong>{kind}报废原因：</Typography.Text>{' '}
            <span className="whitespace-pre-wrap break-words">{showValue(getAccountingReasonText(kind))}</span>
          </div>
          <Space size={18} wrap>
            <Typography.Text>明细数量：{subset.length}</Typography.Text>
            <Typography.Text>报废数量：{subset.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</Typography.Text>
            <Typography.Text>原值合计：{money(subset.reduce((sum, item) => sum + Number(item.originalValue || 0), 0))}</Typography.Text>
            <Typography.Text>净值合计：{money(subset.reduce((sum, item) => sum + Number(item.netValue || 0), 0))}</Typography.Text>
          </Space>
        </div>
        <Collapse items={grouped.map(([category, rows]) => ({
          key: category,
          label: `${category}（${rows.length}）`,
          extra: (
            <Space size={18} wrap>
              <Typography.Text>报废数量：{rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</Typography.Text>
              <Typography.Text>原值合计：{money(rows.reduce((sum, item) => sum + Number(item.originalValue || 0), 0))}</Typography.Text>
              <Typography.Text>折旧合计：{money(rows.reduce((sum, item) => sum + Number(item.accumulatedDepreciation || 0), 0))}</Typography.Text>
              <Typography.Text>净值合计：{money(rows.reduce((sum, item) => sum + Number(item.netValue || 0), 0))}</Typography.Text>
            </Space>
          ),
          children: approvalTable(rows),
        }))} />
      </>
    );
  };

  const accountingPreviewTabs = [
    {
      key: 'summary',
      label: `汇总（${assets.length}）`,
      children: (
        <Table
          rowKey="key"
          size="small"
          bordered
          pagination={false}
          dataSource={accountingSummaryRows}
          columns={accountingSummaryColumns}
          scroll={{ x: 'max-content' }}
        />
      ),
    },
    ...['已到报废期', '未到报废期', '丢失'].map((kind) => ({
      key: kind,
      label: `${kind}（${assets.filter((asset) => asset.scrapType === kind).length}）`,
      children: accountingDetailTab(kind),
    })),
  ];

  const machineQuantity = assets.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const effectiveQuoteReceiver = type === 'scrap' && form.assetScope === '机房资产' && machineQuantity >= 500
    ? '内审'
    : form.quoteReceiver;
  const auditQuoteRows = [...(form.internalAuditQuotes || [{ id: 'audit-1', supplier: '', amount: '', attachments: [] }])]
    .sort((left, right) => Number(right.amount || 0) - Number(left.amount || 0));
  const addSignEligible = type === 'scrap'
    && form.assetScope === '机房资产'
    && (
      String(form.currentNode || '').startsWith('专家评估（')
      || ['责任人7级及以上直属领导', 'NO部7级及以上领导', '采购5级及以上领导'].includes(form.currentNode)
    );
  const addSignPending = type === 'scrap' && String(form.currentNode || '').startsWith('加签：');
  const machineDisposalHandling = type === 'disposal'
    && form.assetScope === '机房资产'
    && ['采购专员协办', 'ES专员协办', '数据清洗'].includes(form.currentNode);

  const machineNodePanel = approvalPage && type === 'scrap' && form.assetScope === '机房资产' ? (
    <Card size="small" title={sectionTitle('办理信息')} className="shadow-sm">
      {addSignEligible && (
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="加签人" span={2}>
            <LookupInput
              value={form.addSignPerson || ''}
              placeholder="请选择加签人"
              onOpen={() => setEmployeePickerField('addSignPerson')}
            />
          </Descriptions.Item>
        </Descriptions>
      )}

      {form.currentNode === '采购专员选择报价接收人' && (
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="本单报废数量">{machineQuantity}</Descriptions.Item>
          <Descriptions.Item label="报价接收人">
            <Select
              value={effectiveQuoteReceiver || undefined}
              disabled={machineQuantity >= 500}
              options={options(['采购专员', '内审'])}
              className="w-full"
              onChange={(value) => updateForm('quoteReceiver', value)}
            />
          </Descriptions.Item>
          {machineQuantity >= 500 && (
            <Descriptions.Item label="规则说明" span={2}>
              本单达到500台及以上，报价接收人固定为内审。
            </Descriptions.Item>
          )}
        </Descriptions>
      )}

      {form.currentNode === '采购专员报价' && (
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="回收供应商">
            <Input value={form.procurementQuoteSupplier || ''} onChange={(event) => updateForm('procurementQuoteSupplier', event.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="报价金额">
            <Input type="number" min="0" value={form.procurementQuoteAmount || ''} onChange={(event) => updateForm('procurementQuoteAmount', event.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="报价附件" span={2}>
            {managedUpload('procurementQuoteAttachments', '上传报价附件')}
          </Descriptions.Item>
        </Descriptions>
      )}

      {form.currentNode === '内审报价' && (
        <div className="space-y-3">
          {auditQuoteRows.map((row, index) => (
            <Card key={row.id} size="small" title={`报价${index + 1}`} extra={
              <Button danger disabled={auditQuoteRows.length <= 1} onClick={() => removeAuditQuote(row.id)}>删除</Button>
            }>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Input placeholder="回收供应商" value={row.supplier || ''} onChange={(event) => updateAuditQuote(row.id, 'supplier', event.target.value)} />
                <Input type="number" min="0" placeholder="报价金额" value={row.amount || ''} onChange={(event) => updateAuditQuote(row.id, 'amount', event.target.value)} />
                <Upload
                  fileList={row.attachments || []}
                  onChange={({ fileList }) => updateAuditQuote(row.id, 'attachments', fileList)}
                  beforeUpload={(file) => {
                    if (file.size > 20 * 1024 * 1024) {
                      message.error('单文件不能超过20MB');
                      return Upload.LIST_IGNORE;
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>上传报价附件</Button>
                </Upload>
              </div>
            </Card>
          ))}
          <Button onClick={addAuditQuote}>新增报价</Button>
        </div>
      )}

      {form.currentNode === '采购专员填写回收商报价' && (
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="最终回收供应商">
            {effectiveQuoteReceiver === '内审' ? (
              <Select
                value={form.finalQuoteSupplier || undefined}
                options={auditQuoteRows.filter((row) => row.supplier).map((row) => ({ label: row.supplier, value: row.supplier }))}
                className="w-full"
                onChange={(value) => {
                  const selected = auditQuoteRows.find((row) => row.supplier === value);
                  setForm((current) => ({
                    ...current,
                    finalQuoteSupplier: value,
                    finalQuoteAmount: selected?.amount || '',
                    finalQuoteAttachments: selected?.attachments || [],
                  }));
                }}
              />
            ) : (
              <Input value={form.finalQuoteSupplier || ''} onChange={(event) => updateForm('finalQuoteSupplier', event.target.value)} />
            )}
          </Descriptions.Item>
          <Descriptions.Item label="最终报价金额">
            <Input
              type="number"
              min="0"
              disabled={effectiveQuoteReceiver === '内审'}
              value={form.finalQuoteAmount || ''}
              onChange={(event) => updateForm('finalQuoteAmount', event.target.value)}
            />
          </Descriptions.Item>
          <Descriptions.Item label="报价附件" span={2}>
            {effectiveQuoteReceiver === '内审'
              ? showValue((form.finalQuoteAttachments || []).map((item) => item.name).filter(Boolean).join('、'))
              : managedUpload('finalQuoteAttachments', '上传最终报价附件')}
          </Descriptions.Item>
        </Descriptions>
      )}

      {form.currentNode === '采购专员交接资料' && (
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="盖章报价单">
            {managedUpload('stampedQuoteAttachments', '上传盖章报价单')}
          </Descriptions.Item>
          <Descriptions.Item label="实物收货人">
            <LookupInput
              value={form.physicalReceiver || ''}
              placeholder="请选择实物收货人"
              onOpen={() => setEmployeePickerField('physicalReceiver')}
            />
          </Descriptions.Item>
        </Descriptions>
      )}

      {form.currentNode === '采购专员线下交接' && (
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="交接签字表">
            {managedUpload('handoverSignatureAttachments', '上传交接签字表')}
          </Descriptions.Item>
          <Descriptions.Item label="回款凭证">
            {managedUpload('paymentReceiptAttachments', '上传回款凭证')}
          </Descriptions.Item>
        </Descriptions>
      )}

      {form.currentNode === 'FS审批部门' && (
        <Typography.Text type="secondary">
          FS审核采购专员提交的报价与交接资料；如需补充，使用【打回上一步】退回采购专员交接资料节点。
        </Typography.Text>
      )}

      {addSignPending && (
        <Typography.Text type="secondary">
          当前为加签办理，确认完成后返回原审批节点。
        </Typography.Text>
      )}
    </Card>
  ) : approvalPage && machineDisposalHandling ? (
    <Card size="small" title={sectionTitle('办理信息')} className="shadow-sm">
      {form.currentNode === '采购专员协办' && (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="到款凭证">{managedUpload('paymentReceiptAttachments', '上传到款凭证')}</Descriptions.Item>
        </Descriptions>
      )}
      {form.currentNode === 'ES专员协办' && (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="交接签字表">{managedUpload('handoverSignatureAttachments', '上传交接签字表')}</Descriptions.Item>
        </Descriptions>
      )}
      {form.currentNode === '数据清洗' && (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="数据清洗报告">{managedUpload('dataCleaningReportAttachments', '上传数据清洗报告')}</Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  ) : null;

  const approvalActionButtons = (onDecision) => (
    <div data-testid="approval-action-buttons" className="mt-3 flex flex-wrap justify-center gap-3">
      <Button onClick={onBack}>返回</Button>
      {addSignPending ? (
        <Button type="primary" onClick={() => onDecision('通过')}>确认</Button>
      ) : machineDisposalHandling ? (
        <Button type="primary" onClick={() => onDecision('通过')}>完成办理</Button>
      ) : (
        <>
          <Button danger onClick={() => onDecision('驳回')}>
            {type === 'scrap' && form.assetScope === '机房资产' && form.currentNode === 'FS审批部门' ? '打回上一步' : '驳回'}
          </Button>
          {addSignEligible && <Button onClick={() => onDecision('加签')}>加签</Button>}
          <Button type="primary" onClick={() => onDecision('通过')}>同意</Button>
        </>
      )}
    </div>
  );

  const approvalActions = (
    <>
      <Input.TextArea
        rows={4} maxLength={400} showCount value={approvalOpinion}
        placeholder="请输入审批意见（驳回时必填）"
        onChange={(event) => setApprovalOpinion(event.target.value)}
      />
      {type === 'accounting' && form.currentNode === '提单人确认' ? (
        <div data-testid="approval-action-buttons" className="mt-3 flex flex-wrap justify-center gap-3">
          <Button onClick={onBack}>返回</Button>
          <Button danger onClick={() => decideTransfer('驳回')}>驳回</Button>
          <Button type="primary" onClick={() => decideTransfer('通过')}>确认并执行</Button>
        </div>
      ) : approvalActionButtons(decideTransfer)}
    </>
  );
  const assetDetailsTitle = type === 'accounting' && (approvalView || previewView)
    ? '报废资产明细'
    : type === 'accounting' && form.scrapMethod === '调账'
      ? '公司间转移明细'
      : type === 'scrap'
        ? '报废资产明细'
        : type === 'disposal' && (approvalPage || previewView)
          ? '处置资产汇总'
          : type === 'disposal'
            ? '处置资产明细'
            : '资产明细';
  const useScrapApprovalCardStyle = (approvalView || previewView) && ['scrap', 'accounting'].includes(type);

  return (
    <div
      className="space-y-4 pb-4"
      data-page-view-key={`${type}-${previewView ? 'preview' : approvalView ? 'approval' : readOnly ? 'detail' : 'edit'}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="m-0 text-xl font-semibold">
          {previewView
            ? `${config.title}预览`
            : approvalView ? `${config.title}审批` : readOnly ? `${config.title}详情` : config.createLabel}
        </h3>
        {!previewView
          && (type === 'accounting' || (type === 'disposal' && form.assetScope === '办公设备'))
          && (!readOnly || approvalPage) && (
          <Steps
            className="max-w-[420px]"
            size="small"
            current={previewView ? 1 : approvalView ? 2 : 0}
            items={[{ title: '编辑' }, { title: '预览' }, { title: '发起审批' }]}
          />
        )}
        {(approvalView || previewView || showPageExport) && (
          <div className="flex items-center gap-3">
            {(approvalView || previewView) && form.applicationNo && <span className="text-gray-500">申请单号：{form.applicationNo}</span>}
            {showPageExport && (
              <Button
                icon={<DownloadOutlined />}
                disabled={assets.length === 0}
                onClick={() => exportScrapPrototypeAssets(assets, type, form.scrapMethod, form)}
              >
                导出
              </Button>
            )}
          </div>
        )}
      </div>

      {type === 'crossCompany' && !readOnly && (
        <Typography.Text type="danger" className="block">
          变更内容请提前与财务确认；跨公司转移审批完成后仅进入待报废池，最终变更结果需待后续账面报废流程完成后正式生效。
        </Typography.Text>
      )}

      <Card size="small" title={approvalView || previewView ? '申请人信息' : '基本信息'}>
        {approvalView || previewView ? (
          <DetailGrid>
            <DetailItem label="申请人">{showValue(form.creator)}</DetailItem>
            <DetailItem label={type === 'accounting' ? '创建时间' : '申请日期'}>{showValue(form.applicationDate)}</DetailItem>
            <DetailItem label="公司">{showValue(form.company)}</DetailItem>
            {type === 'disposal' && <DetailItem label="板块">{showValue(disposalPlateDisplay)}</DetailItem>}
            {!(type === 'disposal' && form.assetScope === '机房资产') && (
              <>
                <DetailItem label="办公区">{showValue(form.officeArea)}</DetailItem>
                <DetailItem label="联系电话">{showValue(form.contactPhone)}</DetailItem>
                <DetailItem label="邮箱">{showValue(form.email)}</DetailItem>
              </>
            )}
            {type === 'scrap' && form.assetScope === '机房资产' && (
              <>
                <DetailItem label="资产大类">{showValue(form.assetCategory)}</DetailItem>
                <DetailItem label="资产所在地">{showValue(form.assetLocation)}</DetailItem>
              </>
            )}
            {!(type === 'disposal' && form.assetScope === '机房资产') && (
              <DetailItem label="部门" span={type === 'accounting' ? 2 : 3}>{showValue(form.department)}</DetailItem>
            )}
            {type === 'scrap' && <DetailItem label="报废说明" span={3}>{showValue(form.description)}</DetailItem>}
            {type === 'accounting' && (
              <>
                <DetailItem label="报废方式">{showValue(form.scrapMethod)}</DetailItem>
                <DetailItem label="报废单名称" span={2}>{showValue(form.scrapFormName || accountingFormName)}</DetailItem>
                <DetailItem label="报废期间">{showValue(form.scrapPeriod || accountingScrapPeriod)}</DetailItem>
              </>
            )}
            {type === 'disposal' && form.assetScope === '机房资产' && (
              <>
                <DetailItem label="归属地">{showValue(form.region)}</DetailItem>
                <DetailItem label="是否需要数据清洗">{showValue(effectiveNeedsCleaning)}</DetailItem>
              </>
            )}
            {type === 'disposal' && form.assetScope === '办公设备' && (
              <>
                <DetailItem label="回收商一">{showValue(form.recycler1Name)}</DetailItem>
                <DetailItem label="回收商二">{showValue(form.recycler2Name)}</DetailItem>
                <DetailItem label="回收商三">{showValue(form.recycler3Name)}</DetailItem>
                <DetailItem label="处置说明" span={3}>
                  {previewView ? (
                    <Input.TextArea
                      value={disposalDescription}
                      autoSize={{ minRows: 8, maxRows: 14 }}
                      onChange={(event) => {
                        setDisposalDescriptionTouched(true);
                        updateForm('disposalDescription', event.target.value);
                      }}
                    />
                  ) : showValue(form.disposalDescription || disposalAutoDescription)}
                </DetailItem>
              </>
            )}
            {type !== 'scrap' && <DetailItem label="备注" span={3}>{showValue(form.remark)}</DetailItem>}
            <DetailItem label="附件" span={3}>{showValue(allAttachments.map((item) => item.name).filter(Boolean).join('、'))}</DetailItem>
          </DetailGrid>
        ) : (
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="申请单号">
            {form.applicationNo || '保存/提交后生成'}
          </Descriptions.Item>
          <Descriptions.Item label={type === 'accounting' ? '创建时间' : '申请日期'}>{form.applicationDate}</Descriptions.Item>

          <Descriptions.Item label="制单人">{form.creator}</Descriptions.Item>
          <Descriptions.Item label="公司">
            {['crossCompany', 'disposal', 'accounting'].includes(type)
              ? (readOnly
                ? showValue(form.company)
                : (
                  <LookupInput
                    value={form.company}
                    placeholder={type === 'disposal' ? '请选择公司，可多选' : '请选择公司'}
                    onOpen={() => setCompanyPickerOpen(true)}
                    disabled={assets.length > 0}
                  />
                ))
              : showValue(form.company)}
          </Descriptions.Item>

          {type === 'disposal' && (
            <Descriptions.Item label="板块">
              {readOnly
                ? showValue(disposalPlateDisplay)
                : (
                  <Select
                    mode="multiple"
                    allowClear
                    disabled={assets.length > 0}
                    value={disposalSelectedPlates}
                    options={disposalPlateOptions}
                    className="w-full"
                    placeholder="不选择表示所有板块"
                    onChange={(values) => setForm((current) => ({
                      ...current,
                      plates: values,
                      plate: values.join('、'),
                    }))}
                  />
                )}
            </Descriptions.Item>
          )}

          {type === 'crossCompany' && (
            <>
              <Descriptions.Item label="联系电话">{showValue(form.contactPhone)}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{showValue(form.email)}</Descriptions.Item>
              <Descriptions.Item label="部门" span={3}>{showValue(form.department)}</Descriptions.Item>
            </>
          )}

          {type === 'scrap' && (
            <>
              {form.assetScope === '机房资产' && (
                <>
                  <Descriptions.Item label={<span><span className="mr-1 text-red-500">*</span>资产大类</span>}>
                    {renderSelect(form.assetCategory, options(['SERVER', 'NET EQUIPMENT']), (value) => updateForm('assetCategory', value), assets.length > 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label={<span><span className="mr-1 text-red-500">*</span>资产所在地</span>}>
                    {renderSelect(form.assetLocation, options(['北京', '非北京']), (value) => updateForm('assetLocation', value))}
                  </Descriptions.Item>
                </>
              )}
            </>
          )}

          {type === 'accounting' && (
            <>
              <Descriptions.Item label="报废方式">{showValue(form.scrapMethod)}</Descriptions.Item>
              <Descriptions.Item
                label={<span><span className="mr-1 text-red-500">*</span>报废单名称</span>}
                span={2}
              >
                <Input
                  value={accountingFormName}
                  onChange={(event) => {
                    setAccountingNameTouched(true);
                    updateForm('scrapFormName', event.target.value);
                  }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="报废期间">
                {showValue(accountingScrapPeriod)}
              </Descriptions.Item>
            </>
          )}

          {type === 'disposal' && form.assetScope === '机房资产' && (
            <>
              <Descriptions.Item label="归属地">
                {showValue(form.region)}
              </Descriptions.Item>
              <Descriptions.Item label="是否需要数据清洗">
                {showValue(effectiveNeedsCleaning)}
              </Descriptions.Item>
            </>
          )}

          {type === 'disposal' && form.assetScope === '办公设备' && (
            [1, 2, 3].map((index) => (
              <Descriptions.Item
                key={`recycler${index}Name`}
                label={`回收商${['一', '二', '三'][index - 1]}`}
              >
                {readOnly
                  ? showValue(form[`recycler${index}Name`])
                  : (
                    <Input
                      value={form[`recycler${index}Name`] || ''}
                      placeholder={`请输入回收商${['一', '二', '三'][index - 1]}的供应商名称`}
                      onChange={(event) => updateForm(`recycler${index}Name`, event.target.value)}
                    />
                  )}
              </Descriptions.Item>
            ))
          )}

          <Descriptions.Item
            label={type === 'scrap' ? '报废说明' : '备注'}
            span={3}
          >
            {readOnly
              ? showValue(type === 'scrap' ? form.description : form.remark)
              : (
                <Input.TextArea
                  value={type === 'scrap' ? form.description : form.remark}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  onChange={(event) => updateForm(
                    type === 'scrap' ? 'description' : 'remark',
                    event.target.value,
                  )}
                />
              )}
          </Descriptions.Item>

          <Descriptions.Item label="附件" span={3}>
            {readOnly
              ? showValue((form.attachments || []).map((item) => item.name).filter(Boolean).join('、'))
              : (
                <Upload
                  fileList={form.attachments || []}
                  onChange={({ fileList }) => updateForm('attachments', fileList)}
                  beforeUpload={(file) => {
                    if (file.size > 20 * 1024 * 1024) {
                      message.error('单文件不能超过20MB');
                      return Upload.LIST_IGNORE;
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>上传附件</Button>
                </Upload>
              )}
          </Descriptions.Item>
        </Descriptions>
        )}
      </Card>

      {type === 'accounting' && !approvalView && !previewView && (
        <Card size="small" title="报废原因">
          <div className={`grid grid-cols-1 gap-3 ${form.scrapMethod === '调账' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {(form.scrapMethod === '调账'
              ? ['已到报废期', '未到报废期']
              : ['已到报废期', '未到报废期', '丢失']).map((kind) => (
              <div key={kind} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <Typography.Text strong>{kind}</Typography.Text>
                {readOnly
                  ? <div className="mt-2 min-h-16 whitespace-pre-wrap text-gray-700">{showValue(getAccountingReasonText(kind))}</div>
                  : (
                    <Input.TextArea
                      className="mt-2"
                      autoSize={{ minRows: 4, maxRows: 6 }}
                      placeholder={`请填写${kind}资产的报废原因`}
                      value={getAccountingReasonText(kind)}
                      onChange={(event) => updateAccountingReason(kind, event.target.value)}
                    />
                  )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card
        size="small"
        title={useScrapApprovalCardStyle ? sectionTitle(assetDetailsTitle) : assetDetailsTitle}
        className={useScrapApprovalCardStyle ? 'shadow-sm' : undefined}
        extra={type === 'disposal' && form.assetScope === '办公设备' ? (
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
            {[1, 2, 3].map((index) => (
              <span key={`recycler${index}Total`}>
                <span className="text-gray-500">{`回收商${['一', '二', '三'][index - 1]}报价合计：`}</span>
                <span className="font-semibold text-gray-900">{money(disposalQuoteTotals[index - 1])}</span>
              </span>
            ))}
            <span className="text-gray-500">共 {assets.length} 条</span>
          </div>
        ) : <span className="text-sm text-gray-500">共 {assets.length} 条</span>}
      >
        {type === 'disposal' && (approvalPage || previewView) ? (
          <Table rowKey="key" size="small" bordered pagination={false} dataSource={disposalSummaryWithCitySpan}
            scroll={{ x: 'max-content' }}
            columns={[
              {
                title: 'City',
                dataIndex: 'city',
                width: 150,
                onCell: (row) => ({ rowSpan: row.cityRowSpan }),
              },
              { title: '资产大类', dataIndex: 'majorCategory', width: 170 },
              { title: '数量', dataIndex: 'quantity', width: 95, align: 'right' },
              { title: '原值', dataIndex: 'originalValue', width: 140, align: 'right', render: money },
              { title: '净值', dataIndex: 'netValue', width: 140, align: 'right', render: money },
              ...(form.assetScope === '办公设备' ? [1, 2, 3].map((index) => ({
                title: `${String(form[`recycler${index}Name`] || `回收商${['一', '二', '三'][index - 1]}`).trim() || `回收商${['一', '二', '三'][index - 1]}`}报价`,
                dataIndex: `recycler${index}`, width: 165, fixed: 'right', align: 'right',
                render: (values) => values.map((value) => money(value)).join('、') || '-',
              })) : []),
            ]} />
        ) : type === 'accounting' && (approvalView || previewView) ? (
          <Tabs defaultActiveKey="summary" items={accountingPreviewTabs} />
        ) : <ScrapPrototypeAssetTable
          type={type}
          assetScope={form.assetScope}
          assetCategory={form.assetCategory}
          sourceCompany={['crossCompany', 'accounting'].includes(type) ? form.company : undefined}
          sourceCompanies={type === 'disposal' ? disposalSelectedCompanies : undefined}
          sourcePlates={type === 'disposal' ? disposalSelectedPlates : undefined}
          accountingActor={accountingActor}
          accountingAuthorizationScopes={accountingAuthorizationScopes}
          accountingRecordId={form.id}
          assets={assets}
          readOnly={readOnly}
          showTransferDiff={approvalView && type === 'crossCompany'}
          onChange={updateAsset}
          onReplace={handleAssetReplace}
          scrapMethod={form.scrapMethod}
          accountingMethod={form.scrapMethod}
          disposalSuppliers={form}
        />}
      </Card>

      {machineNodePanel}

      {approvalView && type === 'crossCompany' && (
        <BorrowingApprovalHistory
          records={approvalRecords}
        >
          {showApprovalActions && (
            <>
              <div className="mb-2"><strong>审批意见</strong></div>
              <Input.TextArea
                className="mt-2"
                rows={3}
                maxLength={400}
                showCount
                value={approvalOpinion}
                placeholder="同意时非必填，驳回时必填"
                onChange={(event) => setApprovalOpinion(event.target.value)}
              />
              {approvalActionButtons(decideTransfer)}
            </>
          )}
        </BorrowingApprovalHistory>
      )}

      {approvalView && ['scrap', 'disposal', 'accounting'].includes(type) && (
        <BorrowingApprovalHistory records={approvalRecords}>
          {showApprovalActions && (
            <>
              <div className="mb-2"><strong>审批操作</strong></div>
              {approvalActions}
            </>
          )}
        </BorrowingApprovalHistory>
      )}

      <div className="flex justify-center gap-3">
        {previewView ? (
          <>
            <Button onClick={() => {
              if (type === 'accounting') setAccountingPreview(false);
              if (type === 'disposal') setDisposalPreview(false);
            }}>返回</Button>
            <Button type="primary" onClick={() => handleSave(true)}>提交</Button>
          </>
        ) : (
          <>
            {!showApprovalActions && <Button onClick={onBack}>返回</Button>}
            {!approvalPage && readOnly && ['草稿', '已驳回'].includes(form.documentStatus) && (
              <Button onClick={() => onEdit?.(form)}>编辑</Button>
            )}
            {!readOnly && (
              <>
                <Button onClick={() => handleSave(false)}>保存草稿</Button>
                <Button
                  type="primary"
                  onClick={
                    type === 'accounting'
                      ? handleAccountingPreview
                      : type === 'disposal' && form.assetScope === '办公设备'
                        ? handleDisposalPreview
                        : () => handleSave(true)
                  }
                >
                  {type === 'accounting' || (type === 'disposal' && form.assetScope === '办公设备') ? '预览' : '提交'}
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {approvalPage && employeePickerField && (
        <SelectModal
          open
          title={employeePickerField === 'physicalReceiver' ? '选择实物收货人' : '选择加签人'}
          dataSource={employeeLookupRecords}
          searchFields={[
            { label: '员工工号', name: 'code', dataIndex: 'code' },
            { label: '姓名', name: 'name', dataIndex: 'name' },
            { label: '部门', name: 'department', dataIndex: 'department' },
          ]}
          columns={[
            { title: '员工工号', dataIndex: 'code' },
            { title: '姓名', dataIndex: 'name' },
            { title: '公司', dataIndex: 'company' },
            { title: '部门', dataIndex: 'department' },
          ]}
          onCancel={() => setEmployeePickerField('')}
          onConfirm={(employee) => {
            updateForm(employeePickerField, `${employee.code}-${employee.name}`);
            setEmployeePickerField('');
          }}
        />
      )}

      {['crossCompany', 'disposal', 'accounting'].includes(type) && !readOnly && !previewView && (
        <SelectModal
          open={companyPickerOpen}
          title="选择公司"
          dataSource={type === 'accounting' && accountingActor && accountingAuthorizationScopes?.length
            ? transferCompanyOptions.filter((item) => accountingAuthorizationScopes.some(
                (scope) => scope.company === `${item.code}.${item.name}`,
              ))
            : transferCompanyOptions}
          columns={[
            { title: '公司编码', dataIndex: 'code' },
            { title: '公司名称', dataIndex: 'name' },
          ]}
          searchFields={[
            { label: '公司编码', name: 'code', dataIndex: 'code' },
            { label: '公司名称', name: 'name', dataIndex: 'name' },
          ]}
          multiple={type === 'disposal'}
          initialSelectedKeys={type === 'disposal'
            ? disposalSelectedCompanies.map((company) => `company-${String(company).split('.')[0]}`)
            : []}
          onCancel={() => setCompanyPickerOpen(false)}
          onConfirm={(selection) => {
            if (type === 'accounting' && assets.length > 0) {
              message.error('请先删除全部资产明细，再更换公司');
              return;
            }
            if (type === 'disposal') {
              const companies = (Array.isArray(selection) ? selection : [selection])
                .map((company) => `${company.code}.${company.name}`);
              setForm((current) => ({
                ...current,
                companies,
                company: companies.join('、'),
                plates: [],
                plate: '',
                assetScope: '',
              }));
            } else {
              const company = selection;
              setForm((current) => ({
                ...current,
                company: `${company.code}.${company.name}`,
                assetScope: type === 'accounting' ? current.assetScope : '',
              }));
            }
            setCompanyPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
