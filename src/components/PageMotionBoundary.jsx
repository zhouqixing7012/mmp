import React, { useEffect, useRef } from 'react';

const OVERLAY_SELECTOR = '.ant-modal, .ant-drawer, .ant-popover, .ant-dropdown, .mmp-motion-overlay, [role="dialog"]';
const TITLE_SELECTOR = 'h1, h2, h3, h4, .ant-card-head-title';
const PAGE_SECTION_SELECTOR = 'h1, h2, h3, h4, .ant-card, .ant-table-wrapper, .ant-form, .ant-descriptions';

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function getViewSignature(container) {
  if (!container) return '';

  const explicitView = container.querySelector('[data-page-view-key]');
  const explicitKey = explicitView?.getAttribute('data-page-view-key');
  if (explicitKey) return `explicit:${explicitKey}`;

  const semanticTitles = Array.from(container.querySelectorAll(TITLE_SELECTOR))
    .filter((element) => !element.closest(OVERLAY_SELECTOR))
    .map((element) => normalizeText(element.textContent))
    .filter(Boolean)
    .slice(0, 5);

  return semanticTitles.join(' | ');
}

function containsMajorPageSection(node) {
  if (!(node instanceof Element) || node.closest(OVERLAY_SELECTOR)) return false;
  return node.matches(PAGE_SECTION_SELECTOR) || Boolean(node.querySelector(PAGE_SECTION_SELECTOR));
}

function isTopLevelStructuralChange(container, mutation) {
  if (mutation.type !== 'childList' || (!mutation.addedNodes.length && !mutation.removedNodes.length)) {
    return false;
  }

  const target = mutation.target;
  if (!(target instanceof Element) || target.closest(OVERLAY_SELECTOR)) return false;

  const isPageRootMutation = target === container || target.parentElement === container;
  if (!isPageRootMutation) return false;

  const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
  return changedNodes.some(containsMajorPageSection);
}

function isSemanticViewMutation(mutation) {
  if (mutation.type === 'attributes') {
    const target = mutation.target;
    return mutation.attributeName === 'data-page-view-key'
      && target instanceof Element
      && !target.closest(OVERLAY_SELECTOR);
  }

  const targetElement = mutation.target instanceof Element
    ? mutation.target
    : mutation.target.parentElement;
  if (!targetElement || targetElement.closest(OVERLAY_SELECTOR)) return false;

  if (targetElement.matches(TITLE_SELECTOR) || targetElement.closest(TITLE_SELECTOR)) return true;

  if (mutation.type !== 'childList') return false;
  const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
  return changedNodes.some((node) => (
    node instanceof Element
    && !node.closest(OVERLAY_SELECTOR)
    && (node.matches(TITLE_SELECTOR) || Boolean(node.querySelector(TITLE_SELECTOR)))
  ));
}

/**
 * 页面动效统一出口。
 * - 初次挂载播放 mmp-page-motion。
 * - 同一路由内如果页面标题/主要 Card 标题发生变化，视为 list/detail/editor/create
 *   等整页业务视图发生切换，并重新播放一次轻量页面进入动效。
 * - 即使两个视图标题相同，只要页面出口第一层替换了 Card/Table/Form/Descriptions 等主要业务区块，也会识别为整页切换。
 * - 普通表格数据刷新、输入值变化、局部提示/按钮显隐不会触发整页动画，也不会触发无意义的页面签名扫描。
 * - 弹窗/抽屉/Popover/Dropdown 内部标题、结构和显式 view key 不会参与整页视图识别。
 * - 特殊页面可在当前视图根节点声明 data-page-view-key，属性变化会被直接监听。
 */
export default function PageMotionBoundary({ children, className = '', disabled = false }) {
  const containerRef = useRef(null);
  const signatureRef = useRef('');
  const frameRef = useRef(null);
  const structuralChangeRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return undefined;

    signatureRef.current = getViewSignature(container);

    const replayMotion = () => {
      container.classList.remove('mmp-page-motion');
      // 强制浏览器提交移除后的样式，让同一节点可以重新播放 animation。
      void container.offsetWidth;
      container.classList.add('mmp-page-motion');
    };

    const observer = new MutationObserver((mutations) => {
      const structuralViewChanged = mutations.some((mutation) => isTopLevelStructuralChange(container, mutation));
      const semanticViewChanged = mutations.some(isSemanticViewMutation);
      if (!structuralViewChanged && !semanticViewChanged) return;

      if (structuralViewChanged) structuralChangeRef.current = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const nextSignature = getViewSignature(container);
        const previousSignature = signatureRef.current;
        const signatureChanged = Boolean(
          nextSignature && previousSignature && nextSignature !== previousSignature
        );
        const structuralChanged = structuralChangeRef.current;
        structuralChangeRef.current = false;

        if (signatureChanged || structuralChanged) replayMotion();
        if (nextSignature) signatureRef.current = nextSignature;
      });
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-page-view-key'],
    });

    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={`${className} ${disabled ? '' : 'mmp-page-motion'}`.trim()}
    >
      {children}
    </div>
  );
}
