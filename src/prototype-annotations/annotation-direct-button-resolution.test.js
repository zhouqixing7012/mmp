import { resolvePrototypeTarget } from './annotation-targeting';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::任意审批页';
const AGREE_TARGET = 'card-old-approval-context::button::e5908ce6848f';
const REJECT_TARGET = 'card-old-approval-context::button::e9a9b3e59b9e';

beforeEach(() => {
  document.body.innerHTML = '';
});

test('按钮运行时解析不依赖父 Card 标题，只按当前 page scope 的真实语义命中', () => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::任意审批页">
      <div class="ant-card">
        <div class="ant-card-head-title">完全不同的新审批区域标题</div>
        <button id="current-agree">同意</button>
        <button id="current-reject">驳回</button>
      </div>
    </div>
    <div data-prototype-page-scope="个人工作台::另一个审批页">
      <button id="other-agree">同意</button>
      <button id="other-reject">驳回</button>
    </div>
  `;

  expect(resolvePrototypeTarget(AGREE_TARGET, PAGE_SCOPE, document)?.id).toBe('current-agree');
  expect(resolvePrototypeTarget(REJECT_TARGET, PAGE_SCOPE, document)?.id).toBe('current-reject');
});

test('按钮残留其他页面的旧 anchor 时，当前 target 仍按实时按钮语义解析', () => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::任意审批页">
      <button id="agree" data-prototype-anchor="stale-page-target">同意</button>
    </div>
  `;

  expect(resolvePrototypeTarget(AGREE_TARGET, PAGE_SCOPE, document)?.id).toBe('agree');
});

test('当前业务页没有目标按钮时，不会误匹配其他 page scope 的同名按钮', () => {
  document.body.innerHTML = `
    <div data-prototype-page-scope="个人工作台::任意审批页">
      <button>返回</button>
    </div>
    <div data-prototype-page-scope="个人工作台::另一个审批页">
      <button id="other-agree">同意</button>
    </div>
  `;

  expect(resolvePrototypeTarget(AGREE_TARGET, PAGE_SCOPE, document)).toBeNull();
});
