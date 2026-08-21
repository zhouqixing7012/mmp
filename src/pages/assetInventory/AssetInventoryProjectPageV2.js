import React, { useEffect, useRef, useState } from 'react';
import { Alert, Card, Checkbox, Input, Modal, Table } from 'antd';
import { createPortal } from 'react-dom';
import AssetInventoryProjectPage from './AssetInventoryProjectPage';
import AssetInventoryCustomPlanBuilder from './AssetInventoryCustomPlanBuilder';
import { AssetInventoryPlanAssetListV2, AssetInventoryPlansV2 } from './AssetInventoryPlanViewsV2';
import { INVENTORY_RANGE_METHOD_ROWS, PROJECT_INFO, PROJECT_ROWS } from './mockData';

const SCAN_METHOD_OPTIONS = ['狐小e扫码', '狐小e快速扫描资产', '扫码枪', '人工上传盘点结果'];

function CardTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded bg-[#1677ff]" />
      <span>{children}</span>
    </div>
  );
}

function InventoryMethodSettingsCard() {
  const [methodRows, setMethodRows] = useState(INVENTORY_RANGE_METHOD_ROWS);

  const methodColumns = [
    { title: '盘点范围', dataIndex: 'range', width: 100 },
    {
      title: '盘点方式',
      dataIndex: 'methods',
      width: 520,
      render: (value, row) => (
        <Checkbox.Group
          options={SCAN_METHOD_OPTIONS}
          value={value}
          onChange={(methods) => setMethodRows((current) => current.map((item) => item.key === row.key ? { ...item, methods } : item))}
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 260,
      render: (value, row) => (
        <Input
          value={value}
          placeholder="选填"
          onChange={(event) => setMethodRows((current) => current.map((item) => item.key === row.key ? { ...item, remark: event.target.value } : item))}
        />
      ),
    },
  ];

  return (
    <Card size="small" title={<CardTitle>盘点方式设置</CardTitle>}>
      <Table rowKey="key" size="small" bordered columns={methodColumns} dataSource={methodRows} pagination={false} />
      <div className="mt-3">
        <Alert
          type="info"
          showIcon
          message="盘点范围与盘点方式可自由组合。保存或生成快照时，如某行未选择任何盘点方式，系统会阻止操作并提示对应盘点范围。"
        />
      </div>
    </Card>
  );
}

function getCardTitle(card) {
  return card.querySelector('.ant-card-head-title')?.textContent?.trim() || '';
}

function resolveProject(root, sourceElement) {
  const sourceText = sourceElement?.closest?.('tr')?.textContent || '';
  const sourceProject = PROJECT_ROWS.find((row) => sourceText.includes(row.projectNo));
  if (sourceProject) return { ...PROJECT_INFO, ...sourceProject };

  const rootText = root?.textContent || '';
  const current = PROJECT_ROWS.find((row) => rootText.includes(row.projectNo));
  return current ? { ...PROJECT_INFO, ...current } : PROJECT_INFO;
}

export default function AssetInventoryProjectPageV2() {
  const rootRef = useRef(null);
  const [methodSlot, setMethodSlot] = useState(null);
  const [customBuilderOpen, setCustomBuilderOpen] = useState(false);
  const [planViewOpen, setPlanViewOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [planProject, setPlanProject] = useState(PROJECT_INFO);

  const openPlanView = (sourceElement, forceGeneratedStatus = false) => {
    const nextProject = resolveProject(rootRef.current, sourceElement);
    setPlanProject(forceGeneratedStatus ? { ...nextProject, status: '生成盘点计划' } : nextProject);
    setCustomBuilderOpen(false);
    setActivePlan(null);
    setPlanViewOpen(true);
  };

  const interceptNavigation = (event) => {
    if (customBuilderOpen || planViewOpen || activePlan) return;
    const button = event.target.closest?.('button');
    if (!button) return;

    const text = button.textContent?.trim() || '';
    const pageTitle = rootRef.current?.querySelector('h4.ant-typography')?.textContent?.trim() || '';

    if (text === '生成盘点计划' && pageTitle === '盘点项目详情') {
      event.preventDefault();
      event.stopPropagation();
      setPlanProject({ ...resolveProject(rootRef.current, button), status: '生成盘点计划' });

      Modal.confirm({
        title: '提示',
        content: '是否按照默认方式生成盘点计划？',
        okText: '是',
        cancelText: '否',
        onOk: () => openPlanView(button, true),
        onCancel: () => setCustomBuilderOpen(true),
      });
      return;
    }

    if (text === '进入计划' || text === '查看计划清单') {
      event.preventDefault();
      event.stopPropagation();
      openPlanView(button);
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let frameId = 0;

    const restoreHiddenBlocks = () => {
      root.querySelectorAll('[data-asset-inventory-v2-hidden="true"]').forEach((element) => {
        element.style.display = '';
        delete element.dataset.assetInventoryV2Hidden;
      });
    };

    const removeMethodSlot = () => {
      const existing = root.querySelector('[data-asset-inventory-v2-method-slot="true"]');
      if (existing) existing.remove();
      setMethodSlot(null);
    };

    const applyVariant = () => {
      restoreHiddenBlocks();

      const pageTitle = root.querySelector('h4.ant-typography')?.textContent?.trim() || '';
      const cards = Array.from(root.querySelectorAll('.ant-card'));
      const isCreateView = pageTitle === '创建盘点项目' || pageTitle === '编辑盘点项目';
      const isSnapshotView = pageTitle === '盘点项目详情';

      if (isCreateView) {
        removeMethodSlot();
        cards.forEach((card) => {
          const title = getCardTitle(card);
          if (title !== '盘点规则' && title !== '图片上传规则配置') return;
          const spaceItem = card.closest('.ant-space-item') || card;
          spaceItem.dataset.assetInventoryV2Hidden = 'true';
          spaceItem.style.display = 'none';
        });
        return;
      }

      if (isSnapshotView) {
        const imageRuleCard = cards.find((card) => getCardTitle(card) === '图片上传规则配置');
        if (!imageRuleCard) {
          removeMethodSlot();
          return;
        }

        const imageRuleItem = imageRuleCard.closest('.ant-space-item') || imageRuleCard;
        let slot = root.querySelector('[data-asset-inventory-v2-method-slot="true"]');
        if (!slot) {
          slot = document.createElement('div');
          slot.className = imageRuleItem.className || 'ant-space-item';
          slot.dataset.assetInventoryV2MethodSlot = 'true';
          imageRuleItem.parentNode?.insertBefore(slot, imageRuleItem);
        }
        setMethodSlot((current) => current === slot ? current : slot);
        return;
      }

      removeMethodSlot();
    };

    const scheduleApply = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = 0;
        applyVariant();
      });
    };

    applyVariant();
    const observer = new MutationObserver(scheduleApply);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      restoreHiddenBlocks();
      const existing = root.querySelector('[data-asset-inventory-v2-method-slot="true"]');
      if (existing) existing.remove();
    };
  }, []);

  const overlayOpen = customBuilderOpen || planViewOpen || Boolean(activePlan);

  return (
    <div ref={rootRef} className="w-full" onClickCapture={interceptNavigation}>
      {customBuilderOpen && (
        <AssetInventoryCustomPlanBuilder
          onBack={() => setCustomBuilderOpen(false)}
          onConfirmPlan={() => openPlanView(null, true)}
        />
      )}

      {planViewOpen && !activePlan && (
        <AssetInventoryPlansV2
          project={planProject}
          onBack={() => setPlanViewOpen(false)}
          onOpenPlanAssets={(plan) => setActivePlan(plan)}
        />
      )}

      {activePlan && (
        <AssetInventoryPlanAssetListV2
          plan={activePlan}
          onBack={() => setActivePlan(null)}
        />
      )}

      <div style={{ display: overlayOpen ? 'none' : 'block' }}>
        <AssetInventoryProjectPage />
      </div>

      {!overlayOpen && methodSlot ? createPortal(<InventoryMethodSettingsCard />, methodSlot) : null}
    </div>
  );
}
