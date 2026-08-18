import {
  applySemanticActionAnchors,
  normalizeActionButtonText,
} from './annotation-action-anchor-bridge';
import { resolvePrototypeTarget } from './annotation-targeting';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::任意审批页';
const AGREE_TARGET = 'card-e5aea1e689b9e4bfa1e681af::button::e5908ce6848f';
const REJECT_TARGET = 'card-e5aea1e689b9e4bfa1e681af::button::e9a9b3e59b9e';

function actionNote(id, title, target) {
  return {
    id,
    pageKey: PAGE_SCOPE,
    kind: 'action-rule',
    title,
    target,
    summary: '',
    sections: [],
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

test('仅移除中文字符之间的展示空格，保留英文词间空格', () => {
  expect(normalizeActionButtonText('同 意')).toBe('同意');
  expect(normalizeActionButtonText('驳 回')).toBe('驳回');
  expect(normalizeActionButtonText('确 认 提 交')).toBe('确认提交');
  expect(normalizeActionButtonText('Save As')).toBe('Save As');
});

test('AntD 中文双字按钮带展示空格时 action bridge 仍能绑定标准历史 target', () => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::任意审批页">
      <div class="ant-card">
        <div class="ant-card-head-title">审批信息</div>
        <button id="agree">同 意</button>
        <button id="reject">驳 回</button>
      </div>
    </div>
  `;

  const notes = [
    actionNote('agree-note', '同意后进入下一审批节点', AGREE_TARGET),
    actionNote('reject-note', '驳回结束流程', REJECT_TARGET),
  ];

  const applied = applySemanticActionAnchors(PAGE_SCOPE, notes, document);

  expect(applied).toHaveLength(2);
  expect(document.getElementById('agree')?.getAttribute('data-prototype-anchor')).toBe(AGREE_TARGET);
  expect(document.getElementById('reject')?.getAttribute('data-prototype-anchor')).toBe(REJECT_TARGET);
  expect(resolvePrototypeTarget(AGREE_TARGET, PAGE_SCOPE, document)?.id).toBe('agree');
  expect(resolvePrototypeTarget(REJECT_TARGET, PAGE_SCOPE, document)?.id).toBe('reject');
});
