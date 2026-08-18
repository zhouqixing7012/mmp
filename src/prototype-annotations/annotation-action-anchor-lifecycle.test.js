import {
  SEMANTIC_ACTION_ANCHOR_ATTRIBUTE,
  applySemanticActionAnchors,
} from './annotation-action-anchor-bridge';

const PAGE_A = 'route:/yewurules::个人工作台::审批页A';
const PAGE_B = 'route:/yewurules::个人工作台::审批页B';
const TARGET_A = 'card-approval-a::button::e5908ce6848f';
const TARGET_B = 'card-approval-b::button::e5908ce6848f';

function actionNote(id, pageKey, target) {
  return {
    id,
    pageKey,
    target,
    kind: 'action-rule',
    title: '同意后进入下一节点',
    summary: '',
    summarySource: 'prd',
    sections: [],
  };
}

beforeEach(() => {
  document.body.innerHTML = '<button id="agree">同意</button>';
});

test('React 复用同一个按钮 DOM 时，旧页 semantic anchor 会被新页覆盖', () => {
  const button = document.getElementById('agree');

  applySemanticActionAnchors(PAGE_A, [actionNote('agree-a', PAGE_A, TARGET_A)], document);
  expect(button.getAttribute('data-prototype-anchor')).toBe(TARGET_A);
  expect(button.getAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE)).toBe(`${PAGE_A}::agree-a`);

  // 不重新创建 button，模拟 React 在同一路由不同业务页之间复用 DOM 节点。
  applySemanticActionAnchors(PAGE_B, [actionNote('agree-b', PAGE_B, TARGET_B)], document);

  expect(button.getAttribute('data-prototype-anchor')).toBe(TARGET_B);
  expect(button.getAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE)).toBe(`${PAGE_B}::agree-b`);
});

test('显式 JSX anchor 指向其他 target 时不能被语义桥接覆盖', () => {
  const button = document.getElementById('agree');
  button.setAttribute('data-prototype-anchor', 'explicit-jsx-anchor');

  applySemanticActionAnchors(PAGE_B, [actionNote('agree-b', PAGE_B, TARGET_B)], document);

  expect(button.getAttribute('data-prototype-anchor')).toBe('explicit-jsx-anchor');
  expect(button.hasAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE)).toBe(false);
});

test('显式 JSX anchor 已正确命中时只复用结果，不接管 bridge ownership', () => {
  const button = document.getElementById('agree');
  button.setAttribute('data-prototype-anchor', TARGET_B);

  const applied = applySemanticActionAnchors(
    PAGE_B,
    [actionNote('agree-b', PAGE_B, TARGET_B)],
    document
  );

  expect(applied).toHaveLength(1);
  expect(button.getAttribute('data-prototype-anchor')).toBe(TARGET_B);
  expect(button.hasAttribute(SEMANTIC_ACTION_ANCHOR_ATTRIBUTE)).toBe(false);
});

test('只在当前 page scope 内判断同名审批按钮唯一性', () => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::审批页A">
      <button id="agree-a">同意</button>
    </div>
    <div data-prototype-page-scope="个人工作台::审批页B">
      <button id="agree-b">同意</button>
    </div>
  `;

  applySemanticActionAnchors(PAGE_B, [actionNote('agree-b-note', PAGE_B, TARGET_B)], document);

  expect(document.getElementById('agree-a').hasAttribute('data-prototype-anchor')).toBe(false);
  expect(document.getElementById('agree-b').getAttribute('data-prototype-anchor')).toBe(TARGET_B);
});

test('运行时写入 semantic anchor 后会制造 childList 变化供标注层重新扫描', async () => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::审批页B">
      <button id="agree-b">同意</button>
    </div>
  `;

  const mutations = [];
  const observer = new MutationObserver((records) => mutations.push(...records));
  observer.observe(document.body, { childList: true, subtree: true });

  applySemanticActionAnchors(PAGE_B, [actionNote('agree-b-note', PAGE_B, TARGET_B)], document);
  await Promise.resolve();
  observer.disconnect();

  expect(document.getElementById('agree-b').getAttribute('data-prototype-anchor')).toBe(TARGET_B);
  expect(mutations.some((record) => record.type === 'childList')).toBe(true);
});
