import { getPrototypeDisplayAnchor } from './annotation-targeting';

beforeEach(() => {
  document.body.innerHTML = '';
});

test('stable button anchor stays attached to the button instead of the parent Card title', () => {
  document.body.innerHTML = `
    <div class="ant-card">
      <div class="ant-card-head">
        <div class="ant-card-head-title" id="card-title">审批信息</div>
      </div>
      <div class="ant-card-body">
        <button id="agree" data-prototype-anchor="card-approval::button::agree">同意</button>
      </div>
    </div>
  `;

  const agree = document.getElementById('agree');
  expect(getPrototypeDisplayAnchor(agree)).toBe(agree);
});

test('module-level Card anchor still uses the Card title as its display anchor', () => {
  document.body.innerHTML = `
    <div class="ant-card" id="approval-card" data-prototype-anchor="card-approval">
      <div class="ant-card-head">
        <div class="ant-card-head-title" id="card-title">审批信息</div>
      </div>
      <div class="ant-card-body">内容</div>
    </div>
  `;

  const card = document.getElementById('approval-card');
  expect(getPrototypeDisplayAnchor(card)?.id).toBe('card-title');
});
