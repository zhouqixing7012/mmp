import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Tooltip } from 'antd';
import { Search, RefreshCcw } from 'lucide-react';

const QUERY_ACTION_LABELS = new Set(['查询', '重置']);
const QUERY_RESULT_SELECTOR = '[data-mmp-query-result], .ant-table-wrapper, .ant-list';
const QUERY_SCOPE_SELECTOR = '.ant-modal-container, .ant-modal-content, .ant-drawer-content, [role="dialog"], [data-mmp-page-motion-boundary]';
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

/** 页面最多三列；窄容器进一步降列，字段与标签始终整组排列。 */
export function getQueryColumns(viewportWidth, contentWidth) {
  const pageColumns = viewportWidth <= 760 ? 1 : viewportWidth <= 1180 ? 2 : 3;
  return Math.min(pageColumns, Math.max(1, Math.floor((contentWidth + 24) / 280)));
}

export function QueryItem({ label, children, labelWidth = 84 }) {
  const prototypeLabel = typeof label === 'string' ? label.replace(/[:：]\s*$/, '') : undefined;

  return (
    <div
      className="mmp-query-item flex items-center gap-2 min-w-0"
      data-prototype-bindable="query-condition"
      data-prototype-label={prototypeLabel}
      role="group"
      aria-label={prototypeLabel}
    >
      <Tooltip title={label}>
        <span
          className="mmp-query-label shrink-0 text-right text-sm text-gray-600"
          style={{ width: labelWidth }}
          title={prototypeLabel}
          tabIndex={prototypeLabel?.length > 6 ? 0 : undefined}
        >
          {label}
        </span>
      </Tooltip>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

export default function QueryBar({
  children,
  buttons,
  labelWidth = 84,
  onQuery,
  onReset,
}) {
  const fields = flattenQueryChildren(children);
  const layoutRef = useRef(null);
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const layout = layoutRef.current;
    const update = () => setColumns(getQueryColumns(window.innerWidth, layout?.clientWidth || window.innerWidth));
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (layout) observer?.observe(layout);
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  const layoutColumns = fields.length === 1 ? 1 : columns;
  const defaultButtons = (
    <>
      <Button icon={<RefreshCcw size={14} />} onClick={onReset}>重置</Button>
      <Button type="primary" icon={<Search size={14} />} onClick={onQuery}>查询</Button>
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
      onClickCapture={handleActionClickCapture}
    >
      <div data-mmp-query-tabs />
      <div ref={layoutRef} className="mmp-query-layout" style={{ gridTemplateColumns: `repeat(${layoutColumns}, minmax(0, 1fr))` }}>
          {fields.map((field, index) => (
            <div key={field.key || index} className="mmp-query-field" style={{ '--mmp-query-label-width': `${labelWidth}px` }}>
              {field}
            </div>
          ))}
        {finalButtons && (
          <div data-mmp-query-actions className="mmp-query-actions" style={{ gridColumn: `${fields.length % layoutColumns + 1} / -1` }}>
            {finalButtons}
          </div>
        )}
      </div>
    </Card>
  );
}
