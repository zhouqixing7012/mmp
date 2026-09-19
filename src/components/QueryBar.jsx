import React from 'react';
import { Button, Card } from 'antd';
import { Search, RefreshCcw } from 'lucide-react';

const QUERY_ACTION_LABELS = new Set(['查询', '重置']);
const QUERY_RESULT_SELECTOR = '[data-mmp-query-result], .ant-table-wrapper, .ant-list';
const QUERY_SCOPE_SELECTOR = '.ant-modal-content, .ant-drawer-content, [role="dialog"], [data-mmp-page-motion-boundary]';
const queryResultTimers = new WeakMap();

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

    const previousTimer = queryResultTimers.get(result);
    if (previousTimer) window.clearTimeout(previousTimer);

    result.classList.remove('mmp-query-result-refresh');
    void result.offsetWidth;
    result.classList.add('mmp-query-result-refresh');

    const timer = window.setTimeout(() => {
      result.classList.remove('mmp-query-result-refresh');
      queryResultTimers.delete(result);
    }, 220);
    queryResultTimers.set(result, timer);
  });
}

function flattenQueryChildren(children) {
  return React.Children.toArray(children).flatMap((child) => {
    if (React.isValidElement(child) && child.type === React.Fragment) {
      return flattenQueryChildren(child.props.children);
    }
    return [child];
  });
}

/**
 * 查询条件容器组件
 *
 * 布局由 QueryBar 自己根据实际可用宽度决定：
 * < 504px：1 列
 * 504px ～ 767px：2 列
 * >= 768px：3 列
 *
 * 业务页面只提供查询字段，不再自行指定列数。
 */
export function QueryItem({ label, children, labelWidth = 88 }) {
  const prototypeLabel = typeof label === 'string' ? label.replace(/[:：]\s*$/, '') : undefined;

  return (
    <div
      className="mmp-query-item flex items-center gap-2 min-w-0"
      data-prototype-bindable="query-condition"
      data-prototype-label={prototypeLabel}
    >
      <span
        className="shrink-0 whitespace-nowrap text-right text-sm text-gray-600"
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
  labelWidth = 88,
  onQuery,
  onReset,
}) {
  const fields = flattenQueryChildren(children);
  const defaultButtons = (
    <>
      <Button type="primary" icon={<Search size={14} />} onClick={onQuery}>查询</Button>
      <Button icon={<RefreshCcw size={14} />} onClick={onReset}>重置</Button>
    </>
  );
  const finalButtons = buttons !== undefined ? buttons : defaultButtons;

  const handleActionClickCapture = (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button');
    const actionArea = button?.closest('[data-mmp-query-actions]');
    if (!button || !actionArea || !event.currentTarget.contains(actionArea)) return;
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
      <div className="mmp-query-layout">
        <div className="mmp-query-fields">
          {fields.map((field, index) => (
            <div key={field.key || index} className="mmp-query-field" style={{ '--mmp-query-label-width': `${labelWidth}px` }}>
              {field}
            </div>
          ))}
        </div>
        {finalButtons && (
          <div data-mmp-query-actions className="mmp-query-actions">
            {finalButtons}
          </div>
        )}
      </div>
    </Card>
  );
}
