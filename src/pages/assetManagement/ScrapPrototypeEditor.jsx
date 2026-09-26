import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Collapse,
  Typography,
  Upload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import StatusTag from '../../components/StatusTag';
import SelectModal from '../../components/SelectModal';
import LookupInput from '../../components/LookupInput';
import DetailGrid, { DetailItem } from '../../components/DetailGrid';
import BorrowingApprovalHistory from '../assetBorrowing/BorrowingApprovalHistory';
import ScrapPrototypeAssetTable from './ScrapPrototypeAssetTable';
import { getScrapPrototypeApprovalRecords } from './scrapPrototypeApproval';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';
import { money } from './scrapPrototypeData';

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
  onEdit,
}) {
  const [form, setForm] = useState(initialForm);
  const [assets, setAssets] = useState(initialAssets);
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [approvalOpinion, setApprovalOpinion] = useState('同意');
  const [countersignOpen, setCountersignOpen] = useState(false);
  const [countersignPerson, setCountersignPerson] = useState('');

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateAsset = (id, field, value) => {
    setAssets((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const showValue = (value) => (
    <span>{value === undefined || value === null || value === '' ? '-' : String(value)}</span>
  );

  const decideTransfer = (decision) => {
    if (decision === '驳回' && !approvalOpinion.trim()) {
      message.warning('驳回时审批意见必填');
      return;
    }
    const updated = onApprove?.({
      ...form,
      id: form.id,
      applicationNo: form.applicationNo,
      documentStatus: form.documentStatus,
      currentNode: form.currentNode,
      assetScope: form.assetScope,
      assetsSnapshot: assets,
      approvalHistory: form.approvalHistory || [],
      formSnapshot: form,
    }, decision, approvalOpinion);
    if (updated) {
      setForm((current) => ({
        ...current,
        ...updated.formSnapshot,
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

  const machineScrapQty = useMemo(() => (
    assets
      .filter((item) => item.scope === '机房资产')
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  ), [assets]);

  const effectiveQuoteReceiver = type === 'scrap'
    && form.assetScope === '机房资产'
    && machineScrapQty >= 500
    ? '内审'
    : form.quoteReceiver;

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
      };

      if (firstAsset) {
        if (type === 'scrap' && firstAsset.scope === '机房资产') {
          nextForm.assetCategory = firstAsset.majorCategory;
          nextForm.assetLocation = String(firstAsset.city || '').includes('北京') ? '北京' : '非北京';
        }
        if (type !== 'crossCompany') {
          nextForm.company = firstAsset.company || current.company;
        }
        if (type === 'accounting') {
          nextForm.company = firstAsset.company || current.company;
          nextForm.plate = firstAsset.plate || current.plate;
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
      ));
      if (invalid) {
        message.error(`资产 ${invalid.tagNo} 的调账目标信息未填写完整`);
        return false;
      }

      const sameCompany = assets.find((item) => item.newCompany === item.company);
      if (sameCompany) {
        message.error(`资产 ${sameCompany.tagNo} 的新公司不能与原公司相同`);
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
      const companyPlates = new Set(assets.map((item) => `${item.company}|${item.plate}`));
      const scrapMethods = new Set(assets.map((item) => item.scrapMethod).filter(Boolean));
      if (companyPlates.size > 1) {
        message.error('同一账面报废单必须属于同一公司和板块');
        return false;
      }
      if (scrapMethods.size > 1 || (scrapMethods.size && !scrapMethods.has(form.scrapMethod))) {
        message.error('同一账面报废单的报废方式必须一致');
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

    if (type === 'disposal') {
      if (!form.company || assets.some((asset) => asset.company !== form.company || asset.scope !== '办公设备')) {
        message.error('请选择公司并添加该公司的待处置办公资产');
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

  const handleSave = (submit) => {
    if (submit && !validate()) return;

    const scrapReasons = type === 'accounting' && form.scrapMethod !== '调账'
      ? Object.fromEntries(['已到报废期', '未到报废期', '丢失'].map((kind) => [kind, getAccountingReasonText(kind)]))
      : form.scrapReasons;
    const savedAssets = type === 'accounting' && form.scrapMethod !== '调账'
      ? assets.map((item) => ({ ...item, reason: scrapReasons[item.scrapType] || '' }))
      : assets;

    onSave({
      ...form,
      scrapReasons,
      quoteReceiver: effectiveQuoteReceiver,
      needsCleaning: effectiveNeedsCleaning,
    }, savedAssets, submit);
  };

  const approvalRecords = getScrapPrototypeApprovalRecords({
    ...form,
    assetsSnapshot: assets,
  }, type);

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
      if (value && !group[field].includes(value)) group[field].push(value);
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

  const approvalActions = (
    <>
      <Input.TextArea
        rows={4} maxLength={400} showCount value={approvalOpinion}
        placeholder="请输入审批意见（驳回时必填）"
        onChange={(event) => setApprovalOpinion(event.target.value)}
      />
      <div className="mt-3 flex justify-center gap-3">
        <Button danger onClick={() => decideTransfer('驳回')}>驳回</Button>
        <Button type="primary" onClick={() => decideTransfer('通过')}>同意</Button>
        <Button onClick={onBack}>返回</Button>
      </div>
    </>
  );

  return (
    <div
      className="space-y-4 pb-4"
      data-page-view-key={`${type}-${approvalPage ? 'approval' : readOnly ? 'detail' : 'edit'}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-xl font-semibold">
          {approvalPage ? `${config.title}审批` : readOnly ? `${config.title}详情` : config.createLabel}
        </h3>
        {approvalPage && (
          <span className="text-gray-500">申请单号：{form.applicationNo}</span>
        )}
      </div>

      <Card size="small" title={approvalPage ? '申请人信息' : '基本信息'}>
        {approvalPage ? (
          <DetailGrid>
            <DetailItem label="申请人">{showValue(form.creator)}</DetailItem>
            <DetailItem label="申请日期">{showValue(form.applicationDate)}</DetailItem>
            <DetailItem label="公司">{showValue(form.company)}</DetailItem>
            <DetailItem label="办公区">{showValue(form.officeArea)}</DetailItem>
            <DetailItem label="联系电话">{showValue(form.contactPhone)}</DetailItem>
            <DetailItem label="邮箱">{showValue(form.email)}</DetailItem>
            <DetailItem label="部门" span={3}>{showValue(form.department)}</DetailItem>
            {type === 'scrap' && <DetailItem label="报废说明" span={3}>{showValue(form.description)}</DetailItem>}
            {type === 'accounting' && <DetailItem label="报废方式">{showValue(form.scrapMethod)}</DetailItem>}
            {type !== 'scrap' && <DetailItem label="备注" span={3}>{showValue(form.remark)}</DetailItem>}
            <DetailItem label="附件" span={3}>{showValue(form.attachments?.map((item) => item.name).filter(Boolean).join('、'))}</DetailItem>
          </DetailGrid>
        ) : (
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="申请单号">
            {form.applicationNo || '保存/提交后生成'}
          </Descriptions.Item>
          <Descriptions.Item label="单据状态">
            <StatusTag value={form.documentStatus} type="business" />
          </Descriptions.Item>
          <Descriptions.Item label="申请日期">{form.applicationDate}</Descriptions.Item>

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
                    disabled={type !== 'accounting' && assets.length > 0}
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
                  <Descriptions.Item label="地区">
                    {renderSelect(
                      form.region,
                      options(['北京', '非北京']),
                      (value) => updateForm('region', value),
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="报价接收人">
                    {renderSelect(
                      effectiveQuoteReceiver,
                      options(['采购专员', '内审']),
                      (value) => updateForm('quoteReceiver', value),
                      machineScrapQty >= 500,
                    )}
                  </Descriptions.Item>
                </>
              )}
            </>
          )}

          {type === 'accounting' && (
            <Descriptions.Item label="报废方式">{showValue(form.scrapMethod)}</Descriptions.Item>
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

      {type === 'accounting' && form.scrapMethod !== '调账' && !approvalPage && (
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
        title={type === 'accounting' && form.scrapMethod === '调账' ? '公司间转移明细' : (type === 'accounting' && approvalPage) || type === 'scrap' ? '报废资产明细' : type === 'disposal' && approvalPage ? '处置资产汇总' : type === 'disposal' ? '处置资产明细' : '资产明细'}
        extra={<span className="text-sm text-gray-500">共 {assets.length} 条</span>}
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
              ...['回收商一', '回收商二', '回收商三'].map((title, index) => ({
                title, dataIndex: `recycler${index + 1}`, width: 145, fixed: 'right', align: 'right',
                render: (values) => values.map((value) => money(value)).join('、') || '-',
              })),
            ]} />
        ) : type === 'accounting' && approvalPage && form.scrapMethod !== '调账' ? (
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
                <div className="mb-3 flex justify-end gap-6">
                  <Typography.Text>总数量：{subset.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</Typography.Text>
                  <Typography.Text>原值合计：{money(subset.reduce((sum, item) => sum + Number(item.originalValue || 0), 0))}</Typography.Text>
                  <Typography.Text>净值合计：{money(subset.reduce((sum, item) => sum + Number(item.netValue || 0), 0))}</Typography.Text>
                </div>
                <Collapse items={grouped.map(([category, rows]) => ({
                  key: category,
                  label: `${category}（${rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}）`,
                  children: <>
                    <div className="mb-3 flex flex-wrap gap-6">
                      <Typography.Text>数量：{rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</Typography.Text>
                      <Typography.Text>原值：{money(rows.reduce((sum, item) => sum + Number(item.originalValue || 0), 0))}</Typography.Text>
                      <Typography.Text>折旧：{money(rows.reduce((sum, item) => sum + Number(item.accumulatedDepreciation || 0), 0))}</Typography.Text>
                      <Typography.Text>净值：{money(rows.reduce((sum, item) => sum + Number(item.netValue || 0), 0))}</Typography.Text>
                    </div>
                    {approvalTable(rows)}
                  </>,
                }))} />
                <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-4 py-3">
                  <Typography.Text strong>{kind}报废原因</Typography.Text>
                  <div className="mt-1 whitespace-pre-wrap text-gray-700">{showValue(getAccountingReasonText(kind))}</div>
                </div>
              </> };
            })} />
        ) : <ScrapPrototypeAssetTable
          type={type}
          assetScope={form.assetScope}
          assetCategory={form.assetCategory}
          sourceCompany={['crossCompany', 'disposal'].includes(type) ? form.company : undefined}
          assets={assets}
          readOnly={readOnly}
          showTransferDiff={approvalPage}
          onChange={updateAsset}
          onReplace={handleAssetReplace}
          scrapMethod={form.scrapMethod}
          accountingMethod={form.scrapMethod}
        />}
      </Card>

      {approvalPage && type === 'crossCompany' && (
        <BorrowingApprovalHistory
          records={approvalRecords}
        >
          {form.documentStatus === '审批中' && (
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
              <div className="mt-3 flex justify-center gap-3">
                <Button type="primary" onClick={() => decideTransfer('通过')}>同意</Button>
                <Button danger onClick={() => decideTransfer('驳回')}>驳回</Button>
                <Button onClick={onBack}>返回</Button>
                <Button onClick={() => setCountersignOpen(true)}>加签</Button>
              </div>
            </>
          )}
        </BorrowingApprovalHistory>
      )}

      {((approvalPage && ['scrap', 'disposal'].includes(type)) || (
        readOnly && !approvalPage && !['草稿', '已驳回'].includes(form.documentStatus)
      )) && (
        <BorrowingApprovalHistory records={approvalRecords}>
          {approvalPage && ['审批中', '处理中'].includes(form.documentStatus) && (
            <>
              <div className="mb-2"><strong>审批操作</strong></div>
              {approvalActions}
            </>
          )}
        </BorrowingApprovalHistory>
      )}

      {approvalPage && type === 'accounting' && (
        <>
          <BorrowingApprovalHistory records={approvalRecords} />
          {form.documentStatus === '审批中' && <Card size="small" title="审批意见">{approvalActions}</Card>}
        </>
      )}

      <div className="flex justify-center gap-3">
        {!(approvalPage && ['crossCompany', 'scrap', 'accounting', 'disposal'].includes(type) && ['审批中', '处理中'].includes(form.documentStatus)) && (
          <Button onClick={onBack}>返回</Button>
        )}
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

      <Modal
        title="加签"
        open={countersignOpen}
        okText="确认加签"
        cancelText="取消"
        onCancel={() => {
          setCountersignOpen(false);
          setCountersignPerson('');
        }}
        onOk={() => {
          if (!countersignPerson.trim()) {
            message.warning('请输入加签人员');
            return;
          }
          message.success(`已加签：${countersignPerson.trim()}`);
          setCountersignOpen(false);
          setCountersignPerson('');
        }}
      >
        <Input value={countersignPerson} placeholder="请输入姓名或工号" onChange={(event) => setCountersignPerson(event.target.value)} />
      </Modal>

      {['crossCompany', 'disposal', 'accounting'].includes(type) && !readOnly && (
        <SelectModal
          open={companyPickerOpen}
          title="选择公司"
          dataSource={transferCompanyOptions}
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
