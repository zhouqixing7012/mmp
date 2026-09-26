import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  InputNumber,
  Modal,
  Select,
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
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';

const companyOptions = Array.from(
  new Set(warehouseCatalog.map((item) => item.company).filter(Boolean)),
).map((value) => ({ label: value, value }));

const transferCompanyOptions = Array.from(
  getAssetMaintenanceRows().reduce((companies, item) => {
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
      if (form.sourceType === '手动导入' && !form.manualScenario) {
        message.error('请选择手动导入业务类型');
        return false;
      }

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

    if (
      type === 'disposal'
      && form.assetScope === '办公设备'
      && (!String(form.supplier || '').trim() || !form.quoteAmount)
    ) {
      message.error('请填写回收供应商和报价金额');
      return false;
    }

    return true;
  };

  const handleSave = (submit) => {
    if (submit && !validate()) return;

    onSave({
      ...form,
      quoteReceiver: effectiveQuoteReceiver,
      needsCleaning: effectiveNeedsCleaning,
    }, assets, submit);
  };

  const approvalRecords = (form.approvalHistory || []).map((item) => ({
    node: item.node,
    person: item.person || (item.node === '发起人提交' ? form.creator : ''),
    status: item.result === '提交'
      ? '已提交'
      : item.result === '通过'
        ? '已同意'
        : item.result === '驳回'
          ? '已驳回'
          : item.result || '待审批',
    time: item.time,
    comment: item.opinion,
  }));
  if (
    approvalPage
    && ['crossCompany', 'scrap'].includes(type)
    && form.documentStatus === '审批中'
    && form.currentNode
    && !approvalRecords.some((item) => item.node === form.currentNode && item.status === '待审批')
  ) {
    approvalRecords.push({
      node: form.currentNode,
      person: form.currentApprover || '',
      status: '待审批',
      time: '',
      comment: '',
    });
  }

  return (
    <div
      className="space-y-4 pb-4"
      data-page-view-key={`${type}-${readOnly ? 'detail' : 'edit'}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-xl font-semibold">
          {approvalPage ? `${config.title}审批` : readOnly ? `${config.title}详情` : config.createLabel}
        </h3>
        {approvalPage && type === 'crossCompany' && (
          <span className="text-gray-500">申请单号：{form.applicationNo}</span>
        )}
      </div>

      <Card size="small" title={approvalPage && type === 'crossCompany' ? '申请人信息' : '基本信息'}>
        {approvalPage && type === 'crossCompany' ? (
          <DetailGrid>
            <DetailItem label="申请人">{showValue(form.creator)}</DetailItem>
            <DetailItem label="申请日期">{showValue(form.applicationDate)}</DetailItem>
            <DetailItem label="公司">{showValue(form.company)}</DetailItem>
            <DetailItem label="联系电话">{showValue(form.contactPhone)}</DetailItem>
            <DetailItem label="邮箱">{showValue(form.email)}</DetailItem>
            <DetailItem label="部门" span={3}>{showValue(form.department)}</DetailItem>
            <DetailItem label="单据状态"><StatusTag value={form.documentStatus} type="business" /></DetailItem>
            <DetailItem label="备注" span={3}>{showValue(form.remark)}</DetailItem>
            <DetailItem label="附件" span={3}>{showValue(form.attachments?.map((item) => item.name).join('、'))}</DetailItem>
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
            {type === 'crossCompany'
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
              : type === 'accounting'
              ? showValue(form.company)
              : renderSelect(
                  form.company,
                  companyOptions,
                  (value) => updateForm('company', value),
                  assets.length > 0,
                )}
          </Descriptions.Item>

          {type === 'disposal' && (
            <Descriptions.Item label="资产范围">
              {showValue(form.assetScope || '选择资产后自动判定')}
            </Descriptions.Item>
          )}

          {type === 'accounting' && (
            <Descriptions.Item label="板块">{showValue(form.plate)}</Descriptions.Item>
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
              {form.assetScope === '办公设备' && (
                <Descriptions.Item label="是否已处置完成">
                  {renderSelect(
                    form.disposedComplete,
                    options(['是', '否']),
                    (value) => updateForm('disposedComplete', value),
                  )}
                </Descriptions.Item>
              )}

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
            <>
              <Descriptions.Item label="报废方式">{showValue(form.scrapMethod)}</Descriptions.Item>
              <Descriptions.Item label="是否公司间转移">{showValue(form.scrapMethod === '调账' ? '是' : '否')}</Descriptions.Item>
              <Descriptions.Item label="数据来源">
                {renderSelect(
                  form.sourceType,
                  options(['待报废池', '手动导入']),
                  (value) => updateForm('sourceType', value),
                )}
              </Descriptions.Item>

              {form.sourceType === '手动导入' && (
                <Descriptions.Item label="手动导入类型">
                  {renderSelect(
                    form.manualScenario,
                    options(['丢失赔偿', '机房资产盘亏', '装修']),
                    (value) => updateForm('manualScenario', value),
                  )}
                </Descriptions.Item>
              )}
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
              ? showValue('-')
              : (
                <Upload
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

      {type === 'disposal' && form.assetScope === '办公设备' && (
        <Card size="small" title="报价与处置信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="接收报价人">
              {readOnly
                ? showValue(form.quoteReceiver)
                : (
                  <Input
                    value={form.quoteReceiver}
                    placeholder="请选择/输入接收报价人"
                    onChange={(event) => updateForm('quoteReceiver', event.target.value)}
                  />
                )}
            </Descriptions.Item>
            <Descriptions.Item label="回收供应商">
              {readOnly
                ? showValue(form.supplier)
                : <Input value={form.supplier} onChange={(event) => updateForm('supplier', event.target.value)} />}
            </Descriptions.Item>
            <Descriptions.Item label="报价金额">
              {readOnly
                ? showValue(form.quoteAmount ? Number(form.quoteAmount).toFixed(2) : '-')
                : (
                  <InputNumber
                    min={0}
                    precision={2}
                    value={form.quoteAmount}
                    className="w-full"
                    onChange={(value) => updateForm('quoteAmount', value)}
                  />
                )}
            </Descriptions.Item>
            <Descriptions.Item label="处置凭证" span={3}>
              {readOnly
                ? showValue('-')
                : (
                  <Upload
                    beforeUpload={(file) => {
                      if (file.size > 20 * 1024 * 1024) {
                        message.error('单文件不能超过20MB');
                        return Upload.LIST_IGNORE;
                      }
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />}>
                      上传实物照片/到款凭证/交接签字表
                    </Button>
                  </Upload>
                )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card
        size="small"
        title={type === 'accounting' && form.scrapMethod === '调账' ? '公司间转移明细' : type === 'scrap' ? '报废资产明细' : '资产明细'}
        extra={<span className="text-sm text-gray-500">共 {assets.length} 条</span>}
      >
        <ScrapPrototypeAssetTable
          type={type}
          assetScope={form.assetScope}
          assetCategory={form.assetCategory}
          sourceCompany={type === 'crossCompany' ? form.company : undefined}
          assets={assets}
          readOnly={readOnly}
          showTransferDiff={approvalPage}
          onChange={updateAsset}
          onReplace={handleAssetReplace}
          scrapMethod={form.scrapMethod}
          accountingMethod={form.scrapMethod}
        />
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

      {((approvalPage && type === 'scrap') || (
        readOnly && !approvalPage && type !== 'disposal' && !['草稿', '已驳回'].includes(form.documentStatus)
      )) && (
        <BorrowingApprovalHistory records={approvalRecords}>
          {approvalPage && form.documentStatus === '审批中' && (
            <>
              <div className="mb-2"><strong>审批意见</strong></div>
              <Input.TextArea
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
              </div>
            </>
          )}
        </BorrowingApprovalHistory>
      )}

      <div className="flex justify-center gap-3">
        {!(approvalPage && ['crossCompany', 'scrap'].includes(type) && form.documentStatus === '审批中') && (
          <Button onClick={onBack}>返回</Button>
        )}
        {!approvalPage && readOnly && type !== 'disposal' && ['草稿', '已驳回'].includes(form.documentStatus) && (
          <Button onClick={() => onEdit?.(form)}>编辑</Button>
        )}
        {!readOnly && (
          <>
            {type !== 'disposal' && (
              <Button onClick={() => handleSave(false)}>保存草稿</Button>
            )}
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

      {type === 'crossCompany' && !readOnly && (
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
              assetScope: '',
            }));
            setCompanyPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
