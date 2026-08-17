import React, { createContext, useContext } from 'react';
import { theme } from 'antd';

const DEFAULT_COLUMNS = 3;
const DEFAULT_LABEL_WIDTH = 96;
const DetailGridContext = createContext({ columns: DEFAULT_COLUMNS });

function normalizeColumns(columns) {
  return Math.max(1, Math.floor(Number(columns) || DEFAULT_COLUMNS));
}

function normalizeSpan(span, columns) {
  const numericSpan = Math.max(1, Math.floor(Number(span) || 1));
  return Math.min(numericSpan, columns);
}

function toCssWidth(width) {
  return typeof width === 'number' ? `${width}px` : width;
}

function toPrototypeLabel(label) {
  return typeof label === 'string' ? label.replace(/[:：]\s*$/, '') : undefined;
}

export function DetailGrid({
  children,
  columns = DEFAULT_COLUMNS,
  labelWidth = DEFAULT_LABEL_WIDTH,
  minWidth,
  className = '',
}) {
  const { token } = theme.useToken();
  const normalizedColumns = normalizeColumns(columns);
  const normalizedLabelWidth = toCssWidth(labelWidth);
  const templateColumns = Array.from(
    { length: normalizedColumns },
    () => `${normalizedLabelWidth} minmax(0, 1fr)`
  ).join(' ');
  const scrollClassName = minWidth ? 'overflow-x-auto' : '';

  return (
    <div className={`w-full ${scrollClassName} ${className}`.trim()}>
      <DetailGridContext.Provider value={{ columns: normalizedColumns }}>
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: templateColumns,
            minWidth,
            margin: 0,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            borderLeft: `1px solid ${token.colorBorderSecondary}`,
            fontSize: token.fontSize,
            lineHeight: token.lineHeight,
          }}
        >
          {children}
        </dl>
      </DetailGridContext.Provider>
    </div>
  );
}

export function DetailItem({ label, children, span = 1 }) {
  const { token } = theme.useToken();
  const { columns } = useContext(DetailGridContext);
  const normalizedSpan = normalizeSpan(span, columns);
  const valueColumnSpan = normalizedSpan * 2 - 1;
  const prototypeLabel = toPrototypeLabel(label);
  const cellBaseStyle = {
    padding: `${token.paddingXS}px ${token.paddingSM}px`,
    margin: 0,
    borderRight: `1px solid ${token.colorBorderSecondary}`,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <>
      <dt
        data-prototype-bindable="detail-field"
        data-prototype-label={prototypeLabel}
        style={{
          ...cellBaseStyle,
          background: token.colorFillAlter,
          color: token.colorText,
          fontWeight: 400,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </dt>
      <dd
        data-prototype-detail-value={prototypeLabel}
        style={{
          ...cellBaseStyle,
          gridColumn: `span ${valueColumnSpan}`,
          background: token.colorBgContainer,
          color: token.colorText,
          wordBreak: 'break-word',
        }}
      >
        <div className="min-w-0 w-full">{children}</div>
      </dd>
    </>
  );
}

export default DetailGrid;
