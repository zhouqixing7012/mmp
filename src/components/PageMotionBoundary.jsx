import React, { useEffect, useRef } from 'react';

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function getViewSignature(container) {
  if (!container) return '';

  const explicitView = container.querySelector('[data-page-view-key]');
  const explicitKey = explicitView?.getAttribute('data-page-view-key');
  if (explicitKey) return `explicit:${explicitKey}`;

  const semanticTitles = Array.from(
    container.querySelectorAll('h1, h2, h3, h4, .ant-card-head-title')
  )
    .filter((element) => !element.closest(
      '.ant-modal, .ant-drawer, .ant-popover, .ant-dropdown, .mmp-motion-overlay, [role="dialog"]'
    ))
    .map((element) => normalizeText(element.textContent))
    .filter(Boolean)
    .slice(0, 5);

  return semanticTitles.join(' | ');
}

/**
 * 页面动效统一出口。
 * - 初次挂载播放 mmp-page-motion。
 * - 同一路由内如果页面标题/主要 Card 标题发生变化，视为 list/detail/editor/create
 *   等整页业务视图发生切换，并重新播放一次轻量页面进入动效。
 * - 普通表格数据刷新、输入值变化不会因为内容值变化而触发整页动画。
 * - 弹窗/抽屉/Popover/Dropdown 内部标题不会参与整页视图识别。
 * - 特殊页面可在当前视图根节点声明 data-page-view-key，提供稳定的显式视图标识。
 */
export default function PageMotionBoundary({ children, className = '', disabled = false }) {
  const containerRef = useRef(null);
  const signatureRef = useRef('');
  const frameRef = useRef(null);

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

    const observer = new MutationObserver(() => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const nextSignature = getViewSignature(container);
        const previousSignature = signatureRef.current;

        if (nextSignature && previousSignature && nextSignature !== previousSignature) {
          replayMotion();
        }
        if (nextSignature) signatureRef.current = nextSignature;
      });
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
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
