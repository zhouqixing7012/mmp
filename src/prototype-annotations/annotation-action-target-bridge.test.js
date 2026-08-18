import { applySharedActionTargetAnchors } from './annotation-action-target-bridge';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::资产退库';
const ADD_TARGET = 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae8b584e4baa7e980::button::e6b7bbe58aa0e8b584e4baa7';
const SUBMIT_TARGET = 'scope-route3a2fyewurules3a3ae4b8aae4babae5b7a5e4bd9ce58fb03a3ae8b584e4baa7e980::button::e68f90e4baa4';

describe('action target semantic bridge', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-prototype-page-scope="个人工作台::资产退库">
        <button>添加资产</button>
        <button>提 交</button>
      </div>
    `;
  });

  test('规则正文出现“提交”不会把添加资产误识别成提交按钮', () => {
    const notes = [
      {
        id: 'asset-return-add',
        kind: 'action-rule',
        target: ADD_TARGET,
        title: '退库资产弹窗支持多选并固定过滤不可退资产',
        sections: [{ items: [{ text: '盘点计划中需盘点且未盘的资产不得提交。' }] }],
      },
      {
        id: 'asset-return-submit',
        kind: 'action-rule',
        target: SUBMIT_TARGET,
        title: '提交后按一项主资产一张单据拆分并锁定',
      },
    ];

    const applied = applySharedActionTargetAnchors(PAGE_SCOPE, notes, document);
    const buttons = document.querySelectorAll('button');

    expect(buttons[0].getAttribute('data-prototype-anchor')).toBe(ADD_TARGET);
    expect(buttons[1].getAttribute('data-prototype-anchor')).toBe(SUBMIT_TARGET);
    expect(applied.map((item) => item.noteId)).toEqual([
      'asset-return-add',
      'asset-return-submit',
    ]);
  });

  test('中文按钮展示空格不参与动作匹配', () => {
    const notes = [{ id: 'submit', kind: 'action-rule', target: SUBMIT_TARGET }];
    applySharedActionTargetAnchors(PAGE_SCOPE, notes, document);
    expect(document.querySelectorAll('button')[1].getAttribute('data-prototype-anchor')).toBe(SUBMIT_TARGET);
  });
});
