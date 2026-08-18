import { readPrototypePageScope } from './annotation-page-scope';
import { getBaselineAnnotationsForScope } from './annotation-coverage-registry';
import { analyzeAnnotationMatches } from './annotation-match-quality';

const LAUNCHER_ID = 'paf-match-quality-launcher';
const PANEL_ID = 'paf-match-quality-panel';
let observer = null;

function tag(label, background, color) {
  const node = document.createElement('span');
  node.textContent = label;
  Object.assign(node.style, {
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
  return node;
}

function statusTag(status) {
  if (status === 'exact') return tag('精确', '#f6ffed', '#389e0d');
  if (status === 'semantic') return tag('语义兼容', '#e6f4ff', '#1677ff');
  if (status === 'ambiguous') return tag('歧义', '#fff2e8', '#d4380d');
  return tag('未匹配', '#fffbe6', '#d48806');
}

function stat(label, value, color) {
  const box = document.createElement('div');
  Object.assign(box.style, {
    flex: '1 1 0',
    padding: '8px 10px',
    border: '1px solid #f0f0f0',
    borderRadius: '6px',
    background: '#fafafa',
  });
  const number = document.createElement('div');
  number.textContent = String(value || 0);
  Object.assign(number.style, { fontSize: '18px', fontWeight: '700', color });
  const caption = document.createElement('div');
  caption.textContent = label;
  Object.assign(caption.style, { marginTop: '2px', fontSize: '11px', color: '#8c8c8c' });
  box.append(number, caption);
  return box;
}

function renderRow(item) {
  const row = document.createElement('div');
  Object.assign(row.style, {
    display: 'grid',
    gridTemplateColumns: '74px minmax(0, 1fr)',
    gap: '10px',
    padding: '9px 0',
    borderBottom: '1px solid #f5f5f5',
  });

  row.appendChild(statusTag(item.match.status));

  const content = document.createElement('div');
  const title = document.createElement('div');
  title.textContent = item.note.title || item.note.id;
  Object.assign(title.style, { fontSize: '12px', fontWeight: '600', color: '#434343' });
  const reason = document.createElement('div');
  reason.textContent = item.match.reason;
  Object.assign(reason.style, { marginTop: '3px', fontSize: '11px', color: '#8c8c8c', lineHeight: '1.5' });
  const target = document.createElement('code');
  target.textContent = item.note.target;
  Object.assign(target.style, {
    display: 'block',
    marginTop: '4px',
    fontSize: '9px',
    color: '#bfbfbf',
    wordBreak: 'break-all',
  });
  content.append(title, reason, target);
  row.appendChild(content);
  return row;
}

function renderPanel(root = document) {
  root.getElementById?.(PANEL_ID)?.remove();
  const pageScope = typeof window !== 'undefined'
    ? readPrototypePageScope(window.location.pathname, root)
    : '';
  const annotations = getBaselineAnnotationsForScope(pageScope);
  const analysis = analyzeAnnotationMatches(annotations, pageScope, root);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(panel.style, {
    position: 'fixed',
    left: '16px',
    bottom: '132px',
    width: 'min(620px, calc(100vw - 32px))',
    maxHeight: '72vh',
    zIndex: '22065',
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
    padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
    background: '#fafafa',
  });
  const title = document.createElement('div');
  title.innerHTML = '<strong style="font-size:14px;color:#262626">匹配质量</strong><div style="font-size:11px;color:#8c8c8c;margin-top:2px">不是只看“匹上了”，而是解释为什么可信</div>';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '关闭';
  Object.assign(close.style, { border: '1px solid #d9d9d9', borderRadius: '4px', background: '#fff', padding: '3px 8px', color: '#595959', cursor: 'pointer', fontSize: '11px' });
  close.onclick = () => panel.remove();
  header.append(title, close);

  const body = document.createElement('div');
  Object.assign(body.style, { maxHeight: 'calc(72vh - 58px)', overflowY: 'auto', padding: '12px' });

  const scope = document.createElement('div');
  scope.textContent = pageScope || '未识别当前 pageScope';
  Object.assign(scope.style, { marginBottom: '8px', padding: '6px 8px', background: '#f5f5f5', borderRadius: '4px', fontSize: '10px', color: '#8c8c8c', wordBreak: 'break-all' });
  body.appendChild(scope);

  if (!annotations.length) {
    const empty = document.createElement('div');
    empty.textContent = '当前页面没有代码基线标注，暂时无法计算匹配质量。';
    Object.assign(empty.style, { padding: '10px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '6px', color: '#ad6800', fontSize: '12px' });
    body.appendChild(empty);
  } else {
    const stats = document.createElement('div');
    Object.assign(stats.style, { display: 'flex', gap: '6px', marginBottom: '12px' });
    stats.append(
      stat('精确', analysis.counts.exact, '#389e0d'),
      stat('语义兼容', analysis.counts.semantic, '#1677ff'),
      stat('歧义', analysis.counts.ambiguous, '#d4380d'),
      stat('未匹配', analysis.counts.unmatched, '#d48806')
    );
    body.appendChild(stats);

    const guidance = document.createElement('div');
    guidance.textContent = analysis.counts.ambiguous > 0
      ? '存在歧义项：当前页面有多个同语义候选，应优先人工重绑或补稳定业务锚点，禁止依赖 DOM 顺序。'
      : '当前没有检测到多候选歧义。语义兼容项建议在后续页面稳定后升级为显式业务锚点。';
    Object.assign(guidance.style, {
      marginBottom: '10px',
      padding: '8px 10px',
      borderRadius: '6px',
      background: analysis.counts.ambiguous > 0 ? '#fff2e8' : '#f6ffed',
      color: analysis.counts.ambiguous > 0 ? '#ad2102' : '#237804',
      fontSize: '11px',
      lineHeight: '1.55',
    });
    body.appendChild(guidance);

    analysis.items
      .sort((left, right) => {
        const rank = { ambiguous: 0, unmatched: 1, semantic: 2, exact: 3 };
        return rank[left.match.status] - rank[right.match.status];
      })
      .forEach((item) => body.appendChild(renderRow(item)));
  }

  panel.append(header, body);
  document.body.appendChild(panel);
}

function ensureLauncher(root = document) {
  const annotationPanelVisible = Boolean(root.querySelector?.('.paf-annotation-panel'));
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
  button.textContent = '匹配质量';
  button.setAttribute('data-prototype-annotation-ui', 'true');
  Object.assign(button.style, {
    position: 'fixed',
    left: '16px',
    bottom: '88px',
    zIndex: '22050',
    border: '1px solid #722ed1',
    borderRadius: '16px',
    background: '#f9f0ff',
    color: '#531dab',
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,.12)',
  });
  button.onclick = () => renderPanel(root);
  document.body.appendChild(button);
}

export function installAnnotationMatchQualityUi(root = document) {
  if (typeof MutationObserver === 'undefined' || !root?.body) return;
  ensureLauncher(root);
  if (observer) return;
  observer = new MutationObserver(() => ensureLauncher(root));
  observer.observe(root.body, { childList: true, subtree: true });
}
