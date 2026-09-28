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
import { validateAccountingAssets } from '../../services/scrapPrototypeService';

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
  const [approvalOpinion, setApprovalOpinion] = useState('同意');
  const [accountingPreview, setAccountingPreview] = useState(false);
  const [accountingNameTouched, setAccountingNameTouched] = useState(Boolean(initialForm.scrapFormName));

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateAsset = (id, field, value) => {
    setAssets((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

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
        } else if (type !== 'accounting' && type !== 'scrap') {
          nextForm.company = firstAsset.company || current.company;
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

      const unchangedTarget = assets.find((item) => (
        item.newCompany === item.company && item.newPlate === item.plate
      ));
      if (unchangedTarget) {
        message.error(`资产 ${unchangedTarget.tagNo} 的新公司+新板块不能与原公司+原板块完全相同`);
        return false;
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
      if (!form.company || assets.some((asset) => asset.company !== form.company || asset.scope !== '办公设备')) {
        message.error('请选择公司并添加该公司的待处置办公资产');
        return false;
      }
      const missingRecyclerName = [1, 2, 3].find((index) => (
        !String(form[`recycler${index}Name`] || '').trim()
      ));
      if (missingRecyclerName) {
        message.error(`请填写回收商${['一', '二', '三'][missingRecyclerName - 1]}的供应商名称`);
        return false;
      }
      const invalidQuote = assets.find((asset) => [1, 2, 3].some((index) => (
        !Number.isFinite(Number(asset[`recycler${index}`]))
        || Number(asset[`recycler${index}`]) <= 0
      )));
      if (invalidQuote) {
        message.error(`资产 ${invalidQuote.tagNo} 的三个回收商报价均须大于0`);
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
        scrapPeriod: type === 'accounting' ? accountingScrapPeriod : form.scrapPeriod,
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

  const approvalRecords = getScrapPrototypeApprovalRecords({
    ...form,
    assetsSnapshot: assets,
  }, type);
  const previewView = type === 'accounting' && accountingPreview;
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
    || (type === 'disposal' && approvalPage);

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

  const accountingSummaryGroupColumns = (title, field, kind) => [
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
      render: (_, __, index) => index === 0 ? showValue(getAccountingReasonText(kind)) : null,
      onCell: (_, index) => ({ rowSpan: index === 0 ? accountingSummaryRows.length : 0 }),
    },
  ];

  const accountingSummaryColumns = [
    { title: '项目', dataIndex: 'project', width: 150, fixed: 'left' },
    { title: '已到报废期资产', children: accountingSummaryGroupColumns('已到报废期资产', 'expired', '已到报废期') },
    { title: '未到报废期资产', children: accountingSummaryGroupColumns('未到报废期资产', 'unexpired', '未到报废期') },
    { title: '丢失资产', children: accountingSummaryGroupColumns('丢失资产', 'lost', '丢失') },
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
          <div className="min-w-[240px] flex-1">
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

  const approvalActionButtons = (onDecision) => (
    <div data-testid="approval-action-buttons" className="mt-3 flex flex-wrap justify-center gap-3">
      <Button onClick={onBack}>返回</Button>
      <Button danger onClick={() => onDecision('驳回')}>驳回</Button>
      <Button type="primary" onClick={() => onDecision('通过')}>同意</Button>
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
        : type === 'disposal' && approvalPage
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
        {type === 'accounting' && (
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
              </>
            )}
            {type !== 'scrap' && <DetailItem label="备注" span={3}>{showValue(form.remark)}</DetailItem>}
            <DetailItem label="附件" span={3}>{showValue(form.attachments?.map((item) => item.name).filter(Boolean).join('、'))}</DetailItem>
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
                    placeholder="请选择公司"
                    onOpen={() => setCompanyPickerOpen(true)}
                    disabled={assets.length > 0}
                  />
                ))
              : showValue(form.company)}
          </Descriptions.Item>


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
                label={<span><span className="mr-1 text-red-500">*</span>{`回收商${['一', '二', '三'][index - 1]}`}</span>}
              >
                {readOnly
                  ? showValue(form[`recycler${index}Name`])
                  : (
                    <Input
                      required
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

      {type === 'accounting' && !approvalView && (
        <Card size="small" title="报废原因">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {['已到报废期', '未到报废期', '丢失'].map((kind) => (
              <div key={kind} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <Typography.Text strong>{kind}</Typography.Text>
                {readOnly
                  ? <div className="mt-2 min-h-16 whitespace-pre-wrap text-gray-700">{showValue(getAccountingReasonText(kind))}</div>
                  : (
                    <Input.TextArea
                      className="mt-2"
                      disabled={form.scrapMethod === '调账' && kind === '丢失'}
                      autoSize={{ minRows: 4, maxRows: 6 }}
                      placeholder={`请填写${kind}资产的报废原因`}
                      value={form.scrapMethod === '调账' && kind === '丢失' ? '' : getAccountingReasonText(kind)}
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
        {type === 'disposal' && approvalPage ? (
          <Table rowKey="key" size="small" bordered pagination={false} dataSource={disposalSummary}
            scroll={{ x: 'max-content' }}
            columns={[
              { title: 'City', dataIndex: 'city', width: 150 },
              { title: '资产大类', dataIndex: 'majorCategory', width: 170 },
              { title: '数量', dataIndex: 'quantity', width: 95, align: 'right' },
              { title: '原值', dataIndex: 'originalValue', width: 140, align: 'right', render: money },
              { title: '净值', dataIndex: 'netValue', width: 140, align: 'right', render: money },
              ...(form.assetScope === '办公设备' ? ['回收商一报价', '回收商二报价', '回收商三报价'].map((title, index) => ({
                title, dataIndex: `recycler${index + 1}`, width: 145, fixed: 'right', align: 'right',
                render: (values) => values.map((value) => money(value)).join('、') || '-',
              })) : []),
            ]} />
        ) : type === 'accounting' && approvalView ? (
          <Tabs items={['已到报废期', '未到报废期', '丢失']
            .filter((kind) => assets.some((asset) => asset.scrapType === kind))
            .map((kind) => {
              const subset = assets.filter((asset) => asset.scrapType === kind);
              const grouped = Array.from(subset.reduce((groups, asset) => {
                const category = asset.majorCategory || '其他';
                if (!groups.has(category)) groups.set(category, []);
                groups.get(category).push(asset);
                return groups;
              }, new Map()).entries());
              return { key: kind, label: `${kind}（${subset.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}）`, children: <>
                <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md bg-gray-50 px-3 py-2">
                  <div className="min-w-[240px] flex-1">
                    <Typography.Text strong>{kind}报废原因：</Typography.Text>{' '}
                    <span className="whitespace-pre-wrap break-words">{showValue(getAccountingReasonText(kind))}</span>
                  </div>
                  <Space size={18} wrap>
                    <Typography.Text>总数量：{subset.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</Typography.Text>
                    <Typography.Text>原值合计：{money(subset.reduce((sum, item) => sum + Number(item.originalValue || 0), 0))}</Typography.Text>
                    <Typography.Text>净值合计：{money(subset.reduce((sum, item) => sum + Number(item.netValue || 0), 0))}</Typography.Text>
                  </Space>
                </div>
                <Collapse items={grouped.map(([category, rows]) => ({
                  key: category,
                  label: `${category}（${rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}）`,
                  extra: (
                    <Space size={18} wrap>
                      <Typography.Text>数量：{rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</Typography.Text>
                      <Typography.Text>原值合计：{money(rows.reduce((sum, item) => sum + Number(item.originalValue || 0), 0))}</Typography.Text>
                      <Typography.Text>折旧合计：{money(rows.reduce((sum, item) => sum + Number(item.accumulatedDepreciation || 0), 0))}</Typography.Text>
                      <Typography.Text>净值合计：{money(rows.reduce((sum, item) => sum + Number(item.netValue || 0), 0))}</Typography.Text>
                    </Space>
                  ),
                  children: approvalTable(rows),
                }))} />
              </> };
            })} />
        ) : <ScrapPrototypeAssetTable
          type={type}
          assetScope={form.assetScope}
          assetCategory={form.assetCategory}
          sourceCompany={['crossCompany', 'disposal', 'accounting'].includes(type) ? form.company : undefined}
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
        {!showApprovalActions && <Button onClick={onBack}>返回</Button>}
        {!approvalPage && readOnly && ['草稿', '已驳回'].includes(form.documentStatus) && (
          <Button onClick={() => onEdit?.(form)}>编辑</Button>
        )}
        {!readOnly && (
          <>
            <Button onClick={() => handleSave(false)}>保存草稿</Button>
            <Button type="primary" onClick={() => handleSave(true)}>提交</Button>
          </>
        )}
      </div>

      {['crossCompany', 'disposal', 'accounting'].includes(type) && !readOnly && (
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
          onCancel={() => setCompanyPickerOpen(false)}
          onConfirm={(company) => {
            if (type === 'accounting' && assets.length > 0) {
              message.error('请先删除全部资产明细，再更换公司');
              return;
            }
            setForm((current) => ({
              ...current,
              company: `${company.code}.${company.name}`,
              assetScope: type === 'accounting' ? current.assetScope : '',
            }));
            setCompanyPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
