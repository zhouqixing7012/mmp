import React from 'react';
import { theme } from 'antd';

const DEFAULT_COLUMNS = 3;
const DEFAULT_LABEL_WIDTH = 96;

function normalizeSpan(span) {
  const numericSpan = Number(span) || 1;
  return Math.max(1, numericSpan);
}

export function DetailGrid({
  children,
  columns = DEFAULT_COLUMNS,
  labelWidth = DEFAULT_LABEL_WIDTH,
  minWidth,
  className = '',
}) {
  const { token } = theme.useToken();
  const templateColumns = Array.from(
    { length: columns },
    () => `${labelWidth}px minmax(0, 1fr)`
  ).join(' ');

  return (
    <div className={`w-full overflow-x-auto ${className}`.trim()}>
      <div
        role="table"
        style={{
          display: 'grid',
          gridTemplateColumns: templateColumns,
          minWidth,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          borderLeft: `1px solid ${token.colorBorderSecondary}`,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function DetailItem({ label, children, span = 1 }) {
  const { token } = theme.useToken();
  const normalizedSpan = normalizeSpan(span);
  const valueColumnSpan = normalizedSpan * 2 - 1;
  const cellBaseStyle = {
    padding: `${token.paddingXS}px ${token.paddingSM}px`,
    borderRight: `1px solid ${token.colorBorderSecondary}`,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <>
      <div
        role="rowheader"
        style={{
          ...cellBaseStyle,
          background: token.colorFillAlter,
          color: token.colorText,
          fontWeight: 400,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <div
        role="cell"
        style={{
          ...cellBaseStyle,
          gridColumn: `span ${valueColumnSpan}`,
          background: token.colorBgContainer,
          color: token.colorText,
          wordBreak: 'break-word',
        }}
      >
        <div className="min-w-0 w-full">{children}</div>
      </div>
    </>
  );
}

export default DetailGrid;
