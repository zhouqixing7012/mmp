import React from 'react';
import { Button, Card, Row, Col } from 'antd';
import { Search, RefreshCcw } from 'lucide-react';

const QUERY_ACTION_LABELS = new Set(['查询', '重置']);
const QUERY_RESULT_SELECTOR = '[data-mmp-query-result], .ant-table-wrapper, .ant-list';
const QUERY_SCOPE_SELECTOR = '.ant-modal-content, .ant-drawer-content, [role="dialog"], [data-mmp-page-motion-boundary]';

function normalizeActionLabel(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function isVisible(element) {
  if (!(element instanceof Element)) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function findQueryResult(queryBar) {
  if (!(queryBar instanceof Element)) return null;
  const scope = queryBar.closest(QUERY_SCOPE_SELECTOR) || queryBar.parentElement;
  if (!scope) return null;

  return Array.from(scope.querySelectorAll(QUERY_RESULT_SELECTOR)).find((candidate) => (
    candidate !== queryBar
    && !queryBar.contains(candidate)
    && isVisible(candidate)
    && Boolean(queryBar.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING)
  )) || null;
}

function replayQueryResultMotion(queryBar) {
  window.requestAnimationFrame(() => {
    const result = findQueryResult(queryBar);
    if (!result) return;

    result.classList.remove('mmp-query-result-refresh');
    void result.offsetWidth;
    result.classList.add('mmp-query-result-refresh');

    window.setTimeout(() => {
      result.classList.remove('mmp-query-result-refresh');
    }, 220);
  });
}

/**
 * 查询条件容器组件
 * fields: 查询字段（自动按 3 列栅格排列）
 * buttons: 按钮区（查询/重置等，显示在最右侧）
 */

export function QueryItem({ label, children, labelWidth = 96 }) {
  const prototypeLabel = typeof label === 'string' ? label.replace(/[:：]\s*$/, '') : undefined;

  return (
    <div
      className="flex items-center gap-2 min-w-0"
      data-prototype-bindable="query-condition"
      data-prototype-label={prototypeLabel}
    >
      <span
        className="shrink-0 text-right text-sm text-gray-600"
        style={{ width: labelWidth }}
      >
        {label}:
      </span>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

export default function QueryBar({
  children,
  buttons,
  labelWidth = 96,
  onQuery,
  onReset,
  fieldColProps,
}) {
  const fields = React.Children.toArray(children);
  const defaultButtons = (
    <>
      <Button type="primary" icon={<Search size={14} />} onClick={onQuery}>查询</Button>
      <Button icon={<RefreshCcw size={14} />} onClick={onReset}>重置</Button>
    </>
  );
  const finalButtons = buttons !== undefined ? buttons : defaultButtons;
  const resolvedFieldColProps = fieldColProps || { xs: 24, sm: 12, md: 12, lg: 8, xl: 7 };

  const handleActionClickCapture = (event) => {
    const button = event.target.closest('button');
    if (!button || !event.currentTarget.contains(button)) return;
    const actionLabel = normalizeActionLabel(button.textContent);
    if (!QUERY_ACTION_LABELS.has(actionLabel)) return;

    replayQueryResultMotion(event.currentTarget);
  };

  return (
    <Card
      size="small"
      className="mmp-query-bar"
      style={{ marginBottom: 16 }}
      onClickCapture={handleActionClickCapture}
    >
      <style>{`
        .qw > div > span:first-child {
          width: ${labelWidth}px !important;
          min-width: ${labelWidth}px !important;
          text-align: right !important;
          flex-shrink: 0 !important;
        }
        .qw > div > :nth-child(2) {
          width: 100% !important;
          min-width: 0 !important;
        }
        .qw .ant-input,
        .qw .ant-input-affix-wrapper,
        .qw .ant-input-number,
        .qw .ant-picker,
        .qw .ant-select,
        .qw .ant-cascader-picker {
          width: 100% !important;
          min-width: 0 !important;
        }
      `}</style>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row gutter={[16, 16]}>
            {fields.map((field, i) => (
              <Col key={i} {...resolvedFieldColProps}>
                <div className="qw">{field}</div>
              </Col>
            ))}
          </Row>
        </div>
        {finalButtons && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 80, width: 90, justifyContent: 'center' }}>
            {finalButtons}
          </div>
        )}
      </div>
    </Card>
  );
}
