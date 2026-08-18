import { readPrototypePageScope } from './annotation-page-scope';
import {
  getEmployeeSelfServiceCoverageModules,
  getPageCoverageState,
} from './annotation-coverage-registry';

const LAUNCHER_ID = 'paf-prd-coverage-launcher';
const PANEL_ID = 'paf-prd-coverage-panel';
const ANNOTATION_PANEL_SELECTOR = '.paf-annotation-panel';
let observer = null;

function text(value) {
  return String(value ?? '');
}

function createTag(label, background, color) {
  const tag = document.createElement('span');
  tag.textContent = label;
  Object.assign(tag.style, {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 7px',
    borderRadius: '10px',
    background,
    color,
    fontSize: '11px',
    lineHeight: '18px',
    whiteSpace: 'nowrap',
  });
  return tag;
}

function moduleStateTag(module) {
  if (module.state === 'audited') return createTag('完整审计', '#f6ffed', '#389e0d');
  if (module.state === 'partial') return createTag('部分覆盖', '#fffbe6', '#d48806');
  return createTag('未接入', '#fafafa', '#8c8c8c');
}

function requirementStatusTag(status) {
  if (status === 'bound') return createTag('已绑定', '#f6ffed', '#389e0d');
  if (status === 'review') return createTag('待确认', '#fff2e8', '#d4380d');
  return createTag('跳过', '#f5f5f5', '#8c8c8c');
}

function countCell(label, value, color) {
  const box = document.createElement('div');
  Object.assign(box.style, {
    flex: '1 1 0',
    minWidth: '70px',
    padding: '8px 10px',
    border: '1px solid #f0f0f0',
    borderRadius: '6px',
    background: '#fafafa',
  });
  const valueNode = document.createElement('div');
  valueNode.textContent = text(value);
  Object.assign(valueNode.style, { fontSize: '18px', fontWeight: '700', color: color || '#262626' });
  const labelNode = document.createElement('div');
  labelNode.textContent = label;
  Object.assign(labelNode.style, { marginTop: '2px', fontSize: '11px', color: '#8c8c8c' });
  box.append(valueNode, labelNode);
  return box;
}

function sectionTitle(label, extra) {
  const row = document.createElement('div');
  Object.assign(row.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '8px',
  });
  const title = document.createElement('strong');
  title.textContent = label;
  Object.assign(title.style, { fontSize: '13px', color: '#262626' });
  row.appendChild(title);
  if (extra) row.appendChild(extra);
  return row;
}

function renderReviewItem(item) {
  const card = document.createElement('div');
  Object.assign(card.style, {
    border: '1px solid #ffd8bf',
    background: '#fff7e6',
    borderRadius: '6px',
    padding: '9px 10px',
    marginBottom: '8px',
  });

  const header = document.createElement('div');
  Object.assign(header.style, { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' });
  const id = document.createElement('code');
  id.textContent = item.id;
  Object.assign(id.style, { fontSize: '11px', color: '#ad4e00' });
  const object = document.createElement('strong');
  object.textContent = item.object || 'PRD差异';
  Object.assign(object.style, { fontSize: '12px', color: '#613400' });
  header.append(id, object, requirementStatusTag('review'));

  const rule = document.createElement('div');
  rule.textContent = item.rule || '';
  Object.assign(rule.style, { fontSize: '12px', color: '#595959', lineHeight: '1.6' });

  const reason = document.createElement('div');
  reason.textContent = `当前差异：${item.reason || '待确认'}`;
  Object.assign(reason.style, { marginTop: '5px', fontSize: '11px', color: '#ad6800', lineHeight: '1.55' });

  card.append(header, rule, reason);
  return card;
}

function renderRequirementItem(item) {
  const row = document.createElement('div');
  Object.assign(row.style, {
    display: 'grid',
    gridTemplateColumns: '70px 64px minmax(0, 1fr)',
    gap: '8px',
    alignItems: 'start',
    padding: '7px 0',
    borderBottom: '1px solid #f5f5f5',
  });
  const id = document.createElement('code');
  id.textContent = item.id;
  Object.assign(id.style, { fontSize: '10px', color: '#8c8c8c' });
  const status = requirementStatusTag(item.status);
  const content = document.createElement('div');
  const object = document.createElement('div');
  object.textContent = item.object || '-';
  Object.assign(object.style, { fontSize: '12px', fontWeight: '600', color: '#434343' });
  const rule = document.createElement('div');
  rule.textContent = item.rule || '';
  Object.assign(rule.style, { marginTop: '2px', fontSize: '11px', color: '#8c8c8c', lineHeight: '1.5' });
  content.append(object, rule);
  row.append(id, status, content);
  return row;
}

function renderModuleRow(module) {
  const row = document.createElement('div');
  Object.assign(row.style, {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 72px 102px',
    gap: '8px',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f5f5f5',
  });

  const nameWrap = document.createElement('div');
  const name = document.createElement('div');
  name.textContent = module.name;
  Object.assign(name.style, { fontSize: '12px', fontWeight: '600', color: '#434343' });
  const prd = document.createElement('div');
  prd.textContent = module.prd;
  Object.assign(prd.style, { marginTop: '2px', fontSize: '10px', color: '#bfbfbf' });
  nameWrap.append(name, prd);

  const state = moduleStateTag(module);
  const counts = document.createElement('div');
  counts.textContent = module.total
    ? `${module.bound}/${module.total} 已绑定 · ${module.review} 待确认`
    : `${module.registeredScopes || 0} 个页面已接入`;
  Object.assign(counts.style, { fontSize: '10px', color: '#8c8c8c', textAlign: 'right', lineHeight: '1.45' });

  row.append(nameWrap, state, counts);
  return row;
}

function renderCoveragePanel(root = document) {
  root.getElementById?.(PANEL_ID)?.remove();

  const pageScope = typeof window !== 'undefined'
    ? readPrototypePageScope(window.location.pathname, root)
    : '';
  const current = getPageCoverageState(pageScope);
  const modules = getEmployeeSelfServiceCoverageModules();
  const reviews = current.requirements.filter((item) => item.status === 'review');

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(panel.style, {
    position: 'fixed',
    left: '16px',
    bottom: '96px',
    width: 'min(620px, calc(100vw - 32px))',
    maxHeight: '76vh',
    zIndex: '22060',
    background: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    boxShadow: '0 12px 36px rgba(0,0,0,.18)',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  });

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
    background: '#fafafa',
  });
  const titleWrap = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = 'PRD 覆盖中心';
  Object.assign(title.style, { display: 'block', fontSize: '14px', color: '#262626' });
  const subtitle = document.createElement('span');
  subtitle.textContent = '检查研发重点是否都有明确去向';
  Object.assign(subtitle.style, { display: 'block', marginTop: '2px', fontSize: '11px', color: '#8c8c8c' });
  titleWrap.append(title, subtitle);

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '关闭';
  Object.assign(close.style, {
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    background: '#fff',
    padding: '3px 8px',
    color: '#595959',
    cursor: 'pointer',
    fontSize: '11px',
  });
  close.onclick = () => panel.remove();
  header.append(titleWrap, close);

  const body = document.createElement('div');
  Object.assign(body.style, { maxHeight: 'calc(76vh - 58px)', overflowY: 'auto', padding: '12px' });

  const stateExtra = current.state === 'audited'
    ? createTag(current.label, '#e6f4ff', '#1677ff')
    : createTag(current.label, '#fffbe6', '#d48806');
  body.appendChild(sectionTitle('当前页面', stateExtra));

  const scope = document.createElement('div');
  scope.textContent = pageScope || '当前页面未识别到 pageScope';
  Object.assign(scope.style, {
    marginBottom: '8px',
    padding: '6px 8px',
    borderRadius: '4px',
    background: '#f5f5f5',
    color: '#8c8c8c',
    fontSize: '10px',
    wordBreak: 'break-all',
  });
  body.appendChild(scope);

  if (current.state === 'audited') {
    const stats = document.createElement('div');
    Object.assign(stats.style, { display: 'flex', gap: '6px', marginBottom: '12px' });
    stats.append(
      countCell('PRD重点', current.counts.total),
      countCell('已绑定', current.counts.bound, '#389e0d'),
      countCell('待确认', current.counts.review, '#d4380d'),
      countCell('跳过', current.counts.skip, '#8c8c8c')
    );
    body.appendChild(stats);

    if (reviews.length) {
      body.appendChild(sectionTitle(`PRD差异 ${reviews.length}`, createTag('研发评审重点', '#fff2e8', '#d4380d')));
      reviews.forEach((item) => body.appendChild(renderReviewItem(item)));
    }

    body.appendChild(sectionTitle('全部重点去向'));
    const list = document.createElement('div');
    current.requirements.forEach((item) => list.appendChild(renderRequirementItem(item)));
    body.appendChild(list);
  } else {
    const empty = document.createElement('div');
    empty.textContent = current.state === 'annotations-only'
      ? `当前页已有 ${current.annotations.length} 条标注，但还不能证明 PRD 重点全部覆盖：尚未建立 bound / review / skip 覆盖账本。`
      : '当前页面尚未进入 PRD 覆盖体系。';
    Object.assign(empty.style, {
      marginBottom: '12px',
      padding: '10px',
      border: '1px solid #ffe58f',
      borderRadius: '6px',
      background: '#fffbe6',
      color: '#ad6800',
      fontSize: '12px',
      lineHeight: '1.6',
    });
    body.appendChild(empty);
  }

  const divider = document.createElement('div');
  Object.assign(divider.style, { height: '1px', background: '#f0f0f0', margin: '14px 0 12px' });
  body.appendChild(divider);
  body.appendChild(sectionTitle('员工自助 PRD 全模块'));
  modules.forEach((module) => body.appendChild(renderModuleRow(module)));

  panel.append(header, body);
  document.body.appendChild(panel);
}

function ensureCoverageLauncher(root = document) {
  const annotationPanelVisible = Boolean(root.querySelector?.(ANNOTATION_PANEL_SELECTOR));
  const existing = root.getElementById?.(LAUNCHER_ID);

  if (!annotationPanelVisible) {
    existing?.remove();
    root.getElementById?.(PANEL_ID)?.remove();
    return;
  }
  if (existing) return;

  const button = document.createElement('button');
  button.id = LAUNCHER_ID;
  button.type = 'button';
  button.textContent = 'PRD覆盖';
  button.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(button.style, {
    position: 'fixed',
    left: '16px',
    bottom: '52px',
    zIndex: '22045',
    border: '1px solid #1677ff',
    borderRadius: '16px',
    background: '#e6f4ff',
    color: '#0958d9',
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,.12)',
  });
  button.onclick = () => renderCoveragePanel(root);
  document.body.appendChild(button);
}

export function installAnnotationCoverageUi(root = document) {
  if (typeof MutationObserver === 'undefined' || !root?.body) return;
  ensureCoverageLauncher(root);
  if (observer) return;
  observer = new MutationObserver(() => ensureCoverageLauncher(root));
  observer.observe(root.body, { childList: true, subtree: true });
}
