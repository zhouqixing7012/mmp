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
