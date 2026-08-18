const HUB_ID = 'paf-review-tool-hub';
const MENU_ID = 'paf-review-tool-menu';
const TOOL_IDS = [
  { id: 'paf-prd-coverage-launcher', label: 'PRD覆盖', description: '检查PRD重点是否都有去向' },
  { id: 'paf-match-quality-launcher', label: '匹配质量', description: '查看精确、兼容、歧义和未匹配' },
  { id: 'paf-review-mode-launcher', label: '评审模式', description: '按P0/P1逐条引导研发评审' },
  { id: 'paf-runtime-diagnostic-launcher', label: '运行诊断', description: '出现异常时抓取运行时现场' },
];
let observer = null;

function hideLegacyLaunchers(root) {
  TOOL_IDS.forEach(({ id }) => {
    const element = root.getElementById?.(id);
    if (element) element.style.display = 'none';
  });
}

function menuItem(tool, root) {
  const item = document.createElement('button');
  item.type = 'button';
  item.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(item.style, {
    width: '100%',
    display: 'block',
    textAlign: 'left',
    border: 'none',
    borderBottom: '1px solid #f5f5f5',
    background: '#fff',
    padding: '9px 10px',
    cursor: 'pointer',
  });

  const title = document.createElement('div');
  title.textContent = tool.label;
  Object.assign(title.style, { fontSize: '12px', fontWeight: '600', color: '#434343' });
  const description = document.createElement('div');
  description.textContent = tool.description;
  Object.assign(description.style, { marginTop: '2px', fontSize: '10px', color: '#8c8c8c' });
  item.append(title, description);

  item.onmouseenter = () => { item.style.background = '#f5f5f5'; };
  item.onmouseleave = () => { item.style.background = '#fff'; };
  item.onclick = () => {
    const target = root.getElementById?.(tool.id);
    root.getElementById?.(MENU_ID)?.remove();
    target?.click();
  };
  return item;
}

function toggleMenu(root) {
  const existing = root.getElementById?.(MENU_ID);
  if (existing) {
    existing.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(menu.style, {
    position: 'fixed',
    left: '16px',
    bottom: '54px',
    width: '220px',
    zIndex: '22120',
    background: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,.16)',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  });

  TOOL_IDS.forEach((tool) => menu.appendChild(menuItem(tool, root)));
  document.body.appendChild(menu);
}

function ensureHub(root = document) {
  const annotationPanelVisible = Boolean(root.querySelector?.('.paf-annotation-panel'));
  const existing = root.getElementById?.(HUB_ID);

  if (!annotationPanelVisible) {
    existing?.remove();
    root.getElementById?.(MENU_ID)?.remove();
    return;
  }

  hideLegacyLaunchers(root);
  if (existing) return;

  const hub = document.createElement('button');
  hub.id = HUB_ID;
  hub.type = 'button';
  hub.textContent = '评审工具';
  hub.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(hub.style, {
    position: 'fixed',
    left: '16px',
    bottom: '16px',
    zIndex: '22110',
    border: '1px solid #1677ff',
    borderRadius: '18px',
    background: '#1677ff',
    color: '#fff',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 3px 10px rgba(22,119,255,.28)',
  });
  hub.onclick = () => toggleMenu(root);
  document.body.appendChild(hub);
}

export function installAnnotationToolHubUi(root = document) {
  if (typeof MutationObserver === 'undefined' || !root?.body) return;
  ensureHub(root);
  if (observer) return;
  observer = new MutationObserver(() => ensureHub(root));
  observer.observe(root.body, { childList: true, subtree: true });
}
