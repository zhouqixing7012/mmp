import React, { useEffect, useRef } from 'react';

const REMOVED_FIELD = '内审监督人';
const RENAMED_FIELD = '盘点组织';
const RENAMED_FIELD_LABEL = '子公司';
const PLAN_DETAIL_REMOVED_COLUMNS = new Set(['计划负责人', '计划监督人', '盘点执行人', 'City']);
const COUNT_LABELS = new Set([
  '数量', '资产数量', '资产总量', '执行盘点数量', '盘点资产总量', '未执行盘点数量',
  '应盘数量', '已盘数量', '未盘数量', '报失数量', '盘亏数量', '复盘数量',
  '初盘执行盘点数量', '总标签数', '成功数', '失败数', '待审核', '已审核',
]);
const ACCOUNTING_LABELS = new Set(['原值', 'EBS原值', '净值', '账面原值', '账面净值', '金额']);

function cleanText(value) {
  return String(value || '')
    .replaceAll('财务监督人、内审监督人', '财务监督人')
    .replaceAll('内审监督人、财务监督人', '财务监督人')
    .replaceAll('、内审监督人', '')
    .replaceAll('内审监督人、', '')
    .replaceAll(REMOVED_FIELD, '')
    .replaceAll(RENAMED_FIELD, RENAMED_FIELD_LABEL);
}

function hideTableColumn(header) {
  const table = header.closest('table');
  const row = header.parentElement;
  if (!table || !row) return;
  const index = Array.from(row.children).indexOf(header);
  if (index < 0) return;
  table.querySelectorAll('tr').forEach((tableRow) => {
    const cell = tableRow.children[index];
    if (cell) cell.style.display = 'none';
  });
}

function removeStandaloneField(element) {
  if (element.closest('th')) {
    hideTableColumn(element.closest('th'));
    return;
  }
  if (element.closest('td')) {
    const row = element.closest('tr');
    if (row) row.style.display = 'none';
    return;
  }
  const descriptionsItem = element.closest('.ant-descriptions-item');
  if (descriptionsItem) {
    descriptionsItem.style.display = 'none';
    return;
  }
  const formItem = element.closest('.ant-form-item');
  if (formItem) {
    formItem.style.display = 'none';
    return;
  }
  element.style.display = 'none';
}

function parseNumericText(value) {
  const normalized = String(value || '').trim().replaceAll(',', '');
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatCount(value) {
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function formatAccounting(value) {
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatterForLabel(label) {
  if (ACCOUNTING_LABELS.has(label)) return formatAccounting;
  if (COUNT_LABELS.has(label)) return formatCount;
  return null;
}

function formatNumericElement(element, formatter) {
  if (!element) return;
  if (element.querySelector('input, textarea, .ant-input-number, .ant-picker, .ant-progress')) return;
  const numeric = parseNumericText(element.textContent);
  if (numeric === null) return;
  const next = formatter(numeric);
  if (element.textContent?.trim() !== next) element.textContent = next;
}

function applyTableNumberFormats(root) {
  root.querySelectorAll('table').forEach((table) => {
    const headerRow = table.querySelector('thead tr:last-child');
    if (!headerRow) return;
    Array.from(headerRow.children).forEach((header, index) => {
      const formatter = formatterForLabel(header.textContent?.trim() || '');
      if (!formatter) return;
      table.querySelectorAll('tbody tr').forEach((row) => formatNumericElement(row.children[index], formatter));
    });
  });
}

function applyDetailNumberFormats(root) {
  root.querySelectorAll('[data-prototype-label]').forEach((labelElement) => {
    const formatter = formatterForLabel(labelElement.getAttribute('data-prototype-label') || '');
    if (!formatter) return;
    formatNumericElement(labelElement.nextElementSibling, formatter);
  });

  root.querySelectorAll('.ant-statistic').forEach((statistic) => {
    const formatter = formatterForLabel(statistic.querySelector('.ant-statistic-title')?.textContent?.trim() || '');
    if (!formatter) return;
    formatNumericElement(statistic.querySelector('.ant-statistic-content-value'), formatter);
  });
}

function applyInlineLabeledNumberFormats(root) {
  root.querySelectorAll('span').forEach((labelElement) => {
    const label = (labelElement.textContent || '').trim().replace(/[：:]$/, '');
    const formatter = formatterForLabel(label);
    if (!formatter) return;

    let sibling = labelElement.nextSibling;
    while (sibling && sibling.nodeType === Node.TEXT_NODE && !sibling.nodeValue?.trim()) sibling = sibling.nextSibling;
    if (!sibling) return;

    if (sibling.nodeType === Node.TEXT_NODE) {
      const numeric = parseNumericText(sibling.nodeValue);
      if (numeric === null) return;
      sibling.nodeValue = formatter(numeric);
      return;
    }
    if (sibling.nodeType === Node.ELEMENT_NODE) formatNumericElement(sibling, formatter);
  });
}

function applyInlineTotalFormats(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();
  while (node) {
    if (/^\s*共\s*\d{4,}\s*条\s*$/.test(node.nodeValue || '')) textNodes.push(node);
    node = walker.nextNode();
  }
  textNodes.forEach((textNode) => {
    const match = (textNode.nodeValue || '').match(/^\s*共\s*(\d+)\s*条\s*$/);
    if (!match) return;
    textNode.nodeValue = `共 ${formatCount(match[1])} 条`;
  });
}

function applyPlanDetailPolicy(root) {
  root.querySelectorAll('.ant-card').forEach((card) => {
    const title = card.querySelector('.ant-card-head-title')?.textContent?.trim() || '';
    if (title !== '盘点计划明细') return;

    card.querySelectorAll('th').forEach((header) => {
      if (PLAN_DETAIL_REMOVED_COLUMNS.has(header.textContent?.trim() || '')) hideTableColumn(header);
    });

    const cityQuery = card.querySelector('[data-prototype-label="City"]');
    const cityCol = cityQuery?.closest('.ant-col');
    if (cityCol) cityCol.style.display = 'none';
  });
}

function moveColumnBefore(root, sourceTitle, targetTitle) {
  root.querySelectorAll('table').forEach((table) => {
    const headerRow = table.querySelector('thead tr:last-child');
    if (!headerRow) return;
    const headers = Array.from(headerRow.children);
    const sourceIndex = headers.findIndex((header) => header.textContent?.trim() === sourceTitle);
    const targetIndex = headers.findIndex((header) => header.textContent?.trim() === targetTitle);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex < targetIndex) return;

    table.querySelectorAll('tr').forEach((row) => {
      const cells = Array.from(row.children);
      const source = cells[sourceIndex];
      const target = cells[targetIndex];
      if (!source || !target) return;
      source.classList.remove('ant-table-cell-fix-right', 'ant-table-cell-fix-right-first', 'ant-table-cell-fix-right-last');
      source.style.position = '';
      source.style.right = '';
      row.insertBefore(source, target);
    });
  });
}

function applyRenamePolicy(root) {
  root.querySelectorAll(`[data-prototype-label="${RENAMED_FIELD}"]`).forEach((element) => {
    element.setAttribute('data-prototype-label', RENAMED_FIELD_LABEL);
  });
  root.querySelectorAll('[placeholder]').forEach((element) => {
    const placeholder = element.getAttribute('placeholder') || '';
    if (placeholder.includes(RENAMED_FIELD)) element.setAttribute('placeholder', placeholder.replaceAll(RENAMED_FIELD, RENAMED_FIELD_LABEL));
  });
}

function applyFieldPolicy(root) {
  if (!root) return;

  root.querySelectorAll('th').forEach((header) => {
    if (header.textContent?.trim() === REMOVED_FIELD) hideTableColumn(header);
  });

  applyPlanDetailPolicy(root);
  moveColumnBefore(root, '清单', '成本中心');
  applyRenamePolicy(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue?.includes(REMOVED_FIELD) || node.nodeValue?.includes(RENAMED_FIELD)) textNodes.push(node);
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    const original = textNode.nodeValue || '';
    if (!parent) return;
    if (original.trim() === REMOVED_FIELD || original.trim() === `${REMOVED_FIELD}：`) {
      removeStandaloneField(parent);
      return;
    }
    const cleaned = cleanText(original);
    if (cleaned !== original) textNode.nodeValue = cleaned;
  });

  applyTableNumberFormats(root);
  applyDetailNumberFormats(root);
  applyInlineLabeledNumberFormats(root);
  applyInlineTotalFormats(root);
}

export default function AssetInventoryFieldPolicy({ children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    let scheduled = false;
    const apply = () => {
      scheduled = false;
      applyFieldPolicy(rootRef.current);
      document.querySelectorAll('.ant-modal-root, .ant-drawer-root').forEach(applyFieldPolicy);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(apply);
    };

    apply();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef} className="w-full">{children}</div>;
}
