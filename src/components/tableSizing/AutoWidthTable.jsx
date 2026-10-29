import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Table, theme } from 'antd';
import { createTextMeasurer, sizeTableColumns } from './columnSizing';

export default function AutoWidthTable({ columns, dataSource = [], compact = false, rowKey = 'key', pagination = false, ...props }) {
  const { token } = theme.useToken();
  const host = useRef(null);
  const stableWidths = useRef({});
  const [metrics, setMetrics] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const defaultFont = `${token.fontSize}px ${token.fontFamily}`;
  useLayoutEffect(() => {
    const element = host.current;
    let active = true;
    const update = (forceFont = false) => {
      if (!active) return;
      const cell = element.querySelector('td') || element;
      const header = element.querySelector('th') || element;
      const bodyStyle = window.getComputedStyle(cell);
      const headerStyle = window.getComputedStyle(header);
      const font = style => `${style.fontWeight || 400} ${style.fontSize || `${token.fontSize}px`} ${style.fontFamily || token.fontFamily}`;
      const number = value => parseFloat(value) || 0;
      const occupied = style => number(style.paddingLeft) + number(style.paddingRight) + number(style.borderLeftWidth) + number(style.borderRightWidth);
      // 边框和向上取整的安全余量计入列宽，避免完整表头的最后一字换行。
      const padding = Math.max(occupied(bodyStyle), occupied(headerStyle), 16) + 4;
      const next = { body: font(bodyStyle), header: font(headerStyle), padding: Number.isFinite(padding) && padding > 0 ? padding : 16 };
      setMetrics(old => {
        const value = { ...next, revision: (old?.revision || 0) + (forceFont === true ? 1 : 0) };
        return JSON.stringify(old) === JSON.stringify(value) ? old : value;
      });
      const parent = element.parentElement;
      const parentStyle = parent && window.getComputedStyle(parent);
      const horizontalPadding = parentStyle ? (parseFloat(parentStyle.paddingLeft) || 0) + (parseFloat(parentStyle.paddingRight) || 0) : 0;
      setContainerWidth(parent ? Math.max(0, parent.clientWidth - horizontalPadding) : element.clientWidth);
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    if (element.parentElement) observer?.observe(element.parentElement);
    window.addEventListener('resize', update);
    const fontsChanged = () => update(true);
    document.fonts?.addEventListener('loadingdone', fontsChanged);
    document.fonts?.ready.then(fontsChanged);
    return () => { active = false; observer?.disconnect(); window.removeEventListener('resize', update); document.fonts?.removeEventListener('loadingdone', fontsChanged); };
  }, [token.fontSize, token.fontFamily]);
  const measured = useMemo(() => {
    const context = typeof CanvasRenderingContext2D === 'undefined' ? null : document.createElement('canvas').getContext('2d');
    return {
      measure: createTextMeasurer(metrics?.body || defaultFont, context),
      measureHeader: createTextMeasurer(metrics?.header || `600 ${defaultFont}`, context),
    };
  }, [metrics, defaultFont]);
  const describe = items => items.map(column => ({ key: column.key ?? column.dataIndex ?? column.title, sizing: { ...column.sizing, format: String(column.sizing?.format || ''), text: String(column.sizing?.text || '') }, children: column.children ? describe(column.children) : undefined }));
  const schema = JSON.stringify(describe(columns));
  const cached = stableWidths.current;
  const previous = cached.schema === schema && cached.metrics === metrics ? cached.widths : {};
  const sized = sizeTableColumns(columns, dataSource, { ...measured, padding: metrics?.padding || 16, containerWidth, compact, previous });
  useLayoutEffect(() => {
    // 保存固有宽度，容器分配的额外空间不进入缓存，缩窄窗口时仍能正常回收。
    stableWidths.current = { schema, metrics, widths: sized.intrinsicWidths };
  });
  return <div ref={host} data-auto-width-table style={{ width: '100%', maxWidth: sized.totalWidth + 2, minWidth: 0 }}>
    <Table {...props} rowKey={rowKey} size="small" bordered pagination={pagination} columns={sized.columns} dataSource={dataSource}
      tableLayout="fixed" scroll={{ x: sized.totalWidth }} style={{ width: '100%' }} />
  </div>;
}
