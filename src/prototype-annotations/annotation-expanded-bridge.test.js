import {
  applySharedActionTargetAnchors,
  buildCanonicalActionBridgeRegistry,
} from './annotation-action-target-bridge';
import { applyFieldLabelAnchors } from './annotation-field-label-bridge';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::测试页';
const SUBMIT_TARGET = 'scope-test::button::e68f90e4baa4';
const AGREE_TARGET = 'card-test::button::e5908ce6848f';
const OPINION_TARGET = 'card-test::control::e5aea1e689b9e6848fe8a781';

beforeEach(() => {
  document.body.innerHTML = '';
});

test('同一按钮可承载多个PRD规则，只要它们共享同一个target', () => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::测试页">
      <button id="submit">提 交</button>
    </div>
  `;
  const notes = [
    { id: 'asset-submit', pageKey: PAGE_SCOPE, kind: 'action-rule', target: SUBMIT_TARGET, title: '资产提交规则' },
    { id: 'consumable-submit', pageKey: PAGE_SCOPE, kind: 'action-rule', target: SUBMIT_TARGET, title: '耗材提交规则' },
  ];

  const applied = applySharedActionTargetAnchors(PAGE_SCOPE, notes, document);
  expect(applied.map((item) => item.noteId)).toEqual(['asset-submit', 'consumable-submit']);
  expect(document.getElementById('submit')?.getAttribute('data-prototype-anchor')).toBe(SUBMIT_TARGET);
});

test('桥接副本以target动作作为隐藏语义，不修改原始标注标题', () => {
  const original = {
    test: [{ id: 'allocation-agree', kind: 'action-rule', target: AGREE_TARGET, title: '配给提交后进入领用' }],
  };
  const bridge = buildCanonicalActionBridgeRegistry(original);

  expect(original.test[0].title).toBe('配给提交后进入领用');
  expect(bridge.test[0].title.startsWith('同意｜')).toBe(true);
});

test('普通文字标题加TextArea可以按业务字段名绑定，而不是依赖placeholder', () => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::测试页">
      <div class="ant-card">
        <span class="ant-typography"><strong>审批意见</strong></span>
        <textarea id="opinion" placeholder="驳回时必填"></textarea>
      </div>
    </div>
  `;
  const notes = [{
    id: 'approval-opinion',
    pageKey: PAGE_SCOPE,
    kind: 'field-rule',
    target: OPINION_TARGET,
    title: '审批意见规则',
  }];

  const applied = applyFieldLabelAnchors(PAGE_SCOPE, notes, document);
  expect(applied).toHaveLength(1);
  expect(document.getElementById('opinion')?.getAttribute('data-prototype-anchor')).toBe(OPINION_TARGET);
});
