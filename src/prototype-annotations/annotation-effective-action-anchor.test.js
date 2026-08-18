import {
  PROTOTYPE_ANNOTATION_STORAGE_KEY,
  readAnnotationDraft,
} from './annotation-storage';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::自定义审批页';
const AGREE_TARGET = 'card-old-approval::button::e5908ce6848f';

function storeCustomAgreeNote() {
  window.localStorage.setItem(PROTOTYPE_ANNOTATION_STORAGE_KEY, JSON.stringify({
    version: 4,
    pages: {
      [PAGE_SCOPE]: {
        overrides: {
          'custom-approval-agree': {
            id: 'custom-approval-agree',
            pageKey: PAGE_SCOPE,
            target: AGREE_TARGET,
            kind: 'action-rule',
            title: '同意后进入下一审批节点',
            summary: '审批通过后继续流转。',
            summarySource: 'confirmed',
            sections: [],
          },
        },
        deletedIds: [],
      },
    },
  }));
}

beforeEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = '';
});

test('不在内置 registry 的最终有效 action-rule 也会绑定唯一同名按钮', () => {
  document.body.innerHTML = '<button id="agree">同意</button><button>驳回</button>';
  storeCustomAgreeNote();

  const annotations = readAnnotationDraft(PAGE_SCOPE, []);
  const agreeButton = document.getElementById('agree');

  expect(annotations.map((note) => note.id)).toEqual(['custom-approval-agree']);
  expect(agreeButton.getAttribute('data-prototype-anchor')).toBe(AGREE_TARGET);
});

test('同页存在多个同名按钮时不自动猜测', () => {
  document.body.innerHTML = '<button id="agree-1">同意</button><button id="agree-2">同意</button>';
  storeCustomAgreeNote();

  readAnnotationDraft(PAGE_SCOPE, []);

  expect(document.getElementById('agree-1').hasAttribute('data-prototype-anchor')).toBe(false);
  expect(document.getElementById('agree-2').hasAttribute('data-prototype-anchor')).toBe(false);
});
