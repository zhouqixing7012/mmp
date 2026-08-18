import { applySemanticActionAnchors } from './annotation-action-anchor-bridge';
import { resolvePrototypeTarget } from './annotation-targeting';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::任意审批页';
const STALE_RETURN_TARGET = 'card-old-approval::button::e8bf94e59b9e';

beforeEach(() => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::任意审批页">
      <button id="agree">同意</button>
      <button id="back">返回</button>
    </div>
  `;
});

test('action-rule 标题语义优先于可解码但已经过期的 target 按钮文案', () => {
  const note = {
    id: 'stale-target-agree-note',
    pageKey: PAGE_SCOPE,
    target: STALE_RETURN_TARGET,
    kind: 'action-rule',
    title: '同意后进入下一审批节点',
    summary: '提交当前审批结果。',
    sections: [],
  };

  const applied = applySemanticActionAnchors(PAGE_SCOPE, [note], document);

  expect(applied).toHaveLength(1);
  expect(applied[0].label).toBe('同意');
  expect(applied[0].element.id).toBe('agree');
  expect(document.getElementById('agree').getAttribute('data-prototype-anchor')).toBe(STALE_RETURN_TARGET);
  expect(document.getElementById('back').hasAttribute('data-prototype-anchor')).toBe(false);

  // PrototypeAnnotationLayer 仍按 note.target 扫描，也应该最终命中真实“同意”按钮。
  expect(resolvePrototypeTarget(STALE_RETURN_TARGET, PAGE_SCOPE, document)?.id).toBe('agree');
});
