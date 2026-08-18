import {
  getPrototypeTargetMetadata,
  preparePrototypeTargets,
  resolvePrototypeTarget,
} from './annotation-targeting';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::借用审批';

describe('approval button semantic target resolution', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ant-card" id="approval-card">
        <div class="ant-card-head">
          <div class="ant-card-head-title"><span>审批信息</span></div>
        </div>
        <div class="ant-card-body">
          <button id="agree-button">同意</button>
          <button id="reject-button">驳回</button>
          <button id="back-button">返回</button>
          <button id="countersign-button">加签</button>
        </div>
      </div>
    `;
  });

  test('父分组从审批操作改成审批信息后，唯一的同意/驳回按钮仍按按钮文字恢复匹配', () => {
    preparePrototypeTargets(PAGE_SCOPE);

    const agreeButton = document.querySelector('#agree-button');
    const rejectButton = document.querySelector('#reject-button');
    const agreeRuntime = getPrototypeTargetMetadata(agreeButton, PAGE_SCOPE).target;
    const rejectRuntime = getPrototypeTargetMetadata(rejectButton, PAGE_SCOPE).target;
    const [, agreeKind, agreeKey] = agreeRuntime.split('::');
    const [, rejectKind, rejectKey] = rejectRuntime.split('::');

    const oldAgreeTarget = `card-old-approval-actions::${agreeKind}::${agreeKey}`;
    const oldRejectTarget = `card-old-approval-actions::${rejectKind}::${rejectKey}`;

    expect(resolvePrototypeTarget(oldAgreeTarget, PAGE_SCOPE)).toBe(agreeButton);
    expect(resolvePrototypeTarget(oldRejectTarget, PAGE_SCOPE)).toBe(rejectButton);
  });

  test('同一页面存在两个同名按钮时不进行语义猜测，避免误绑', () => {
    preparePrototypeTargets(PAGE_SCOPE);
    const agreeButton = document.querySelector('#agree-button');
    const runtimeTarget = getPrototypeTargetMetadata(agreeButton, PAGE_SCOPE).target;
    const [, kind, key] = runtimeTarget.split('::');
    const oldTarget = `card-old-approval-actions::${kind}::${key}`;

    const secondCard = document.createElement('div');
    secondCard.className = 'ant-card';
    secondCard.innerHTML = `
      <div class="ant-card-head"><div class="ant-card-head-title"><span>二次确认</span></div></div>
      <div class="ant-card-body"><button id="second-agree-button">同意</button></div>
    `;
    document.body.appendChild(secondCard);
    preparePrototypeTargets(PAGE_SCOPE);

    expect(resolvePrototypeTarget(oldTarget, PAGE_SCOPE)).toBeNull();
  });
});
