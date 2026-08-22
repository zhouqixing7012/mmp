import React, { useEffect, useRef } from 'react';

const REMOVED_FIELD = '内审监督人';

function cleanText(value) {
  return String(value || '')
    .replaceAll('财务监督人、内审监督人', '财务监督人')
    .replaceAll('内审监督人、财务监督人', '财务监督人')
    .replaceAll('、内审监督人', '')
    .replaceAll('内审监督人、', '')
    .replaceAll(REMOVED_FIELD, '');
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

function applyFieldPolicy(root) {
  if (!root) return;

  root.querySelectorAll('th').forEach((header) => {
    if (header.textContent?.trim() === REMOVED_FIELD) hideTableColumn(header);
  });

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue?.includes(REMOVED_FIELD)) textNodes.push(node);
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
