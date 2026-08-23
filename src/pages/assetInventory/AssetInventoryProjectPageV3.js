import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AssetInventoryProjectPageV2 from './AssetInventoryProjectPageV2';
import AssetInventoryScopeSelectorV3 from './AssetInventoryScopeSelectorV3';
import { AssetInventoryVariantProvider } from './AssetInventoryVariantContext';

const V3_RANGES = ['库房', '公共', '员工'];

function getCardTitle(card) {
  return card.querySelector('.ant-card-head-title')?.textContent?.trim() || '';
}

export default function AssetInventoryProjectPageV3() {
  const rootRef = useRef(null);
  const [scopeSlot, setScopeSlot] = useState(null);
  const [projectType, setProjectType] = useState('初盘');

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let frameId = 0;

    const removeSlot = () => {
      const existing = root.querySelector('[data-asset-inventory-v3-scope-slot="true"]');
      if (existing) existing.remove();
      setScopeSlot(null);
    };

    const restoreScope = () => {
      root.querySelectorAll('[data-asset-inventory-v3-scope-hidden="true"]').forEach((element) => {
        element.style.display = '';
        delete element.dataset.assetInventoryV3ScopeHidden;
      });
    };

    const apply = () => {
      restoreScope();
      const pageTitle = root.querySelector('h4.ant-typography')?.textContent?.trim() || '';
      if (!['创建盘点项目', '编辑盘点项目'].includes(pageTitle)) {
        removeSlot();
        return;
      }

      const cards = Array.from(root.querySelectorAll('.ant-card')).filter((card) => !card.closest('[data-asset-inventory-v3-scope-slot="true"]'));
      const scopeCard = cards.find((card) => getCardTitle(card) === '盘点范围筛选');
      if (!scopeCard) return;

      const basicCard = cards.find((card) => getCardTitle(card) === '基本信息');
      const currentProjectType = basicCard?.querySelector('.ant-select-selection-item')?.textContent?.trim();
      if (['初盘', '抽盘', '复盘'].includes(currentProjectType)) {
        setProjectType((current) => current === currentProjectType ? current : currentProjectType);
      }

      const scopeItem = scopeCard.closest('.ant-space-item') || scopeCard;
      let slot = root.querySelector('[data-asset-inventory-v3-scope-slot="true"]');
      if (!slot) {
        slot = document.createElement('div');
        slot.className = scopeItem.className || 'ant-space-item';
        slot.dataset.assetInventoryV3ScopeSlot = 'true';
        scopeItem.parentNode?.insertBefore(slot, scopeItem);
      }
      scopeItem.dataset.assetInventoryV3ScopeHidden = 'true';
      scopeItem.style.display = 'none';
      setScopeSlot((current) => current === slot ? current : slot);
    };

    const scheduleApply = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = 0;
        apply();
      });
    };

    apply();
    const observer = new MutationObserver(scheduleApply);
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      restoreScope();
      const slot = root.querySelector('[data-asset-inventory-v3-scope-slot="true"]');
      if (slot) slot.remove();
    };
  }, []);

  return (
    <AssetInventoryVariantProvider allowedRanges={V3_RANGES}>
      <div ref={rootRef} className="w-full">
        <AssetInventoryProjectPageV2 variantLabel="方案三" />
        {scopeSlot ? createPortal(<AssetInventoryScopeSelectorV3 projectType={projectType} />, scopeSlot) : null}
      </div>
    </AssetInventoryVariantProvider>
  );
}
