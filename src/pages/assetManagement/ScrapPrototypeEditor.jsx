import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import StatusTag from '../../components/StatusTag';
import ScrapWorkflowCard from './ScrapWorkflowCard';
import ScrapPrototypeAssetTable from './ScrapPrototypeAssetTable';
import { ASSET_SCOPE_OPTIONS } from './scrapPrototypeData';
import { warehouseCatalog } from '../../mock/reference/warehouseCatalog';

const companyOptions = Array.from(
  new Set(warehouseCatalog.map((item) => item.company).filter(Boolean)),
).map((value) => ({ label: value, value }));

function options(values) {
  return values.map((value) => ({ label: value, value }));
}

export default function ScrapPrototypeEditor({
  type,
  config,
  initialForm,
  initialAssets,
  readOnly,
  onBack,
  onSave,
}) {
  const [form, setForm] = useState(initialForm);
  const [assets, setAssets] = useState(initialAssets);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateAsset = (id, field, value) => {
    setAssets((current) => current.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

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
    if (type === 'disposal' && form.assetScope === '机房资产') {
      updateForm(
        'needsCleaning',
        nextAssets.some((item) => item.dataCleaning === '是') ? '是' : '否',
      );
    }
  };

  const validate = () => {
    if (assets.length === 0) {
      message.error('请至少添加一条资产明细');
      return false;
    }

    if (type === 'crossCompany') {
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
    }

    if (type === 'scrap') {
      if (!String(form.description || '').trim()) {
        message.error('请填写报废说明');
        return false;
      }
      const invalid = assets.find((item) => !item.scrapType || !String(item.reason || '').trim());
      if (invalid) {
        message.error(`资产 ${invalid.tagNo} 的报废类型或报废原因未填写完整`);
        return false;
      }
    }

    if (type === 'accounting' && form.sourceType === '手动导入' && !form.manualScenario) {
      message.error('请选择手动导入业务类型');
      return false;
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

  return (
    <div
      className="space-y-4 pb-4"
      data-page-view-key={`${type}-${readOnly ? 'detail' : 'edit'}`}
    >
      <h3 className="m-0 text-xl font-semibold">
        {readOnly ? `${config.title}详情` : config.createLabel}
      </h3>

      <Card size="small" title="基本信息">
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="申请单号">
            {form.applicationNo || '保存/提交后生成'}
          </Descriptions.Item>
          <Descriptions.Item label="单据状态">
            <StatusTag value={form.documentStatus} type="business" />
          </Descriptions.Item>
          <Descriptions.Item label="申请日期">{form.applicationDate}</Descriptions.Item>

          <Descriptions.Item label="发起人">{form.creator}</Descriptions.Item>
          <Descriptions.Item label="公司">
            <Select
              disabled={readOnly}
              value={form.company}
              options={companyOptions}
              className="w-full"
              onChange={(value) => updateForm('company', value)}
            />
          </Descriptions.Item>

          {type !== 'accounting' && (
            <Descriptions.Item label="资产范围">
              <Select
                disabled={readOnly || assets.length > 0}
                value={form.assetScope}
                options={ASSET_SCOPE_OPTIONS}
                className="w-full"
                onChange={(value) => updateForm('assetScope', value)}
              />
            </Descriptions.Item>
          )}

          {type === 'scrap' && (
            <>
              <Descriptions.Item label="报废方式">
                <Select
                  disabled={readOnly}
                  value={form.scrapMethod}
                  options={options(['全部报废', '部分报废'])}
                  className="w-full"
                  onChange={(value) => updateForm('scrapMethod', value)}
                />
              </Descriptions.Item>

              {form.assetScope === '办公设备' && (
                <Descriptions.Item label="是否已处置完成">
                  <Select
                    disabled={readOnly}
                    value={form.disposedComplete}
                    options={options(['是', '否'])}
                    className="w-full"
                    onChange={(value) => updateForm('disposedComplete', value)}
                  />
                </Descriptions.Item>
              )}

              {form.assetScope === '机房资产' && (
                <>
                  <Descriptions.Item label="地区">
                    <Select
                      disabled={readOnly}
                      value={form.region}
                      options={options(['北京', '非北京'])}
                      className="w-full"
                      onChange={(value) => updateForm('region', value)}
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="报价接收人">
                    <Select
                      disabled={readOnly || machineScrapQty >= 500}
                      value={effectiveQuoteReceiver}
                      options={options(['采购专员', '内审'])}
                      className="w-full"
                      onChange={(value) => updateForm('quoteReceiver', value)}
                    />
                  </Descriptions.Item>
                </>
              )}
            </>
          )}

          {type === 'accounting' && (
            <>
              <Descriptions.Item label="数据来源">
                <Select
                  disabled={readOnly}
                  value={form.sourceType}
                  options={options(['待报废池', '手动导入'])}
                  className="w-full"
                  onChange={(value) => updateForm('sourceType', value)}
                />
              </Descriptions.Item>

              {form.sourceType === '手动导入' && (
                <Descriptions.Item label="手动导入类型">
                  <Select
                    disabled={readOnly}
                    value={form.manualScenario || undefined}
                    options={options(['丢失赔偿', '机房资产盘亏', '装修'])}
                    className="w-full"
                    onChange={(value) => updateForm('manualScenario', value)}
                  />
                </Descriptions.Item>
              )}
            </>
          )}

          {type === 'disposal' && form.assetScope === '机房资产' && (
            <>
              <Descriptions.Item label="归属地">
                <Select
                  disabled={readOnly}
                  value={form.region}
                  options={options(['北京', '非北京'])}
                  className="w-full"
                  onChange={(value) => updateForm('region', value)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="是否需要数据清洗">
                <Select
                  disabled
                  value={effectiveNeedsCleaning}
                  options={options(['是', '否'])}
                  className="w-full"
                />
              </Descriptions.Item>
            </>
          )}

          <Descriptions.Item
            label={type === 'scrap' ? '报废说明' : '备注'}
            span={3}
          >
            <Input.TextArea
              disabled={readOnly}
              value={type === 'scrap' ? form.description : form.remark}
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={(event) => updateForm(
                type === 'scrap' ? 'description' : 'remark',
                event.target.value,
              )}
            />
          </Descriptions.Item>

          <Descriptions.Item label="附件" span={3}>
            <Upload
              disabled={readOnly}
              beforeUpload={(file) => {
                if (file.size > 20 * 1024 * 1024) {
                  message.error('单文件不能超过20MB');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
            >
              <Button disabled={readOnly} icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <ScrapWorkflowCard
        type={type}
        assetScope={form.assetScope}
        selectedAssets={assets}
        region={form.region}
        needsCleaning={effectiveNeedsCleaning}
        currentNode={form.currentNode}
      />

      {type === 'disposal' && form.assetScope === '办公设备' && (
        <Card size="small" title="报价与处置信息">
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="接收报价人">
              <Select
                disabled={readOnly}
                value={form.quoteReceiver}
                options={options(['采购专员', '内审'])}
                className="w-full"
                onChange={(value) => updateForm('quoteReceiver', value)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="回收供应商">
              <Input
                disabled={readOnly}
                value={form.supplier}
                onChange={(event) => updateForm('supplier', event.target.value)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="报价金额">
              <InputNumber
                disabled={readOnly}
                min={0}
                precision={2}
                value={form.quoteAmount}
                className="w-full"
                onChange={(value) => updateForm('quoteAmount', value)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="处置凭证" span={3}>
              <Upload
                disabled={readOnly}
                beforeUpload={(file) => {
                  if (file.size > 20 * 1024 * 1024) {
                    message.error('单文件不能超过20MB');
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
              >
                <Button disabled={readOnly} icon={<UploadOutlined />}>
                  上传实物照片/到款凭证/交接签字表
                </Button>
              </Upload>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card
        size="small"
        title="资产明细"
        extra={<span className="text-sm text-gray-500">共 {assets.length} 条</span>}
      >
        <ScrapPrototypeAssetTable
          type={type}
          assetScope={form.assetScope}
          assets={assets}
          readOnly={readOnly}
          onChange={updateAsset}
          onReplace={handleAssetReplace}
          scrapMethod={form.scrapMethod}
        />
      </Card>

      <div className="flex justify-center gap-3">
        <Button onClick={onBack}>返回</Button>
        {!readOnly && (
          <>
            <Button onClick={() => handleSave(false)}>保存草稿</Button>
            <Button type="primary" onClick={() => handleSave(true)}>提交</Button>
          </>
        )}
      </div>
    </div>
  );
}
