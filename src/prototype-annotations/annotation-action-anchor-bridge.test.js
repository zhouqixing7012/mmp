import assetBorrowingAnnotationsByScope, { ASSET_BORROWING_SCOPES } from './asset-borrowing-annotation-data';
import { applySemanticActionAnchors } from './annotation-action-anchor-bridge';

const allocationScope = ASSET_BORROWING_SCOPES.allocation;

beforeEach(() => {
  document.body.innerHTML = '';
});

test('借用配给的同意和驳回可脱离父 Card 上下文建立稳定锚点', () => {
  document.body.innerHTML = `
    <div class="ant-card">
      <div class="ant-card-head-title">办理操作（标题允许变化）</div>
      <div class="ant-card-body">
        <button id="agree">同意</button>
        <button id="reject">驳回</button>
      </div>
    </div>
  `;

  const annotations = assetBorrowingAnnotationsByScope[allocationScope];
  const agreeNote = annotations.find((note) => note.id === 'borrowing-allocation-agree');
  const rejectNote = annotations.find((note) => note.id === 'borrowing-allocation-reject');

  applySemanticActionAnchors(allocationScope, annotations, document);

  expect(document.getElementById('agree').getAttribute('data-prototype-anchor')).toBe(agreeNote.target);
  expect(document.getElementById('reject').getAttribute('data-prototype-anchor')).toBe(rejectNote.target);
});

test('同一页面存在两个同名审批按钮时不自动猜测', () => {
  document.body.innerHTML = `
    <button id="agree-1">同意</button>
    <button id="agree-2">同意</button>
    <button id="reject">驳回</button>
  `;

  const annotations = assetBorrowingAnnotationsByScope[allocationScope];
  applySemanticActionAnchors(allocationScope, annotations, document);

  expect(document.getElementById('agree-1').hasAttribute('data-prototype-anchor')).toBe(false);
  expect(document.getElementById('agree-2').hasAttribute('data-prototype-anchor')).toBe(false);
  expect(document.getElementById('reject').hasAttribute('data-prototype-anchor')).toBe(true);
});
