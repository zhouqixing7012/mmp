import { analyzeAnnotationMatch } from './annotation-match-quality';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::匹配测试';

function note(target) {
  return { id: 'test-note', title: '测试标注', kind: 'action-rule', target };
}

beforeEach(() => {
  document.body.innerHTML = '<div data-prototype-page-scope="个人工作台::匹配测试" id="page"></div>';
});

test('唯一显式 anchor 判定为精确高可信', () => {
  const target = 'card-test::button::e5908ce6848f';
  document.getElementById('page').innerHTML = `<button data-prototype-anchor="${target}">同意</button>`;

  const result = analyzeAnnotationMatch(note(target), PAGE_SCOPE, document);
  expect(result.status).toBe('exact');
  expect(result.confidence).toBe('high');
  expect(result.candidateCount).toBe(1);
});

test('同一 pageScope 存在多个完全相同 anchor 时必须标记歧义', () => {
  const target = 'card-test::button::e5908ce6848f';
  document.getElementById('page').innerHTML = `
    <button data-prototype-anchor="${target}">同意</button>
    <button data-prototype-anchor="${target}">同意</button>
  `;

  const result = analyzeAnnotationMatch(note(target), PAGE_SCOPE, document);
  expect(result.status).toBe('ambiguous');
  expect(result.candidateCount).toBe(2);
});

test('父上下文变化但按钮语义唯一时判定为语义兼容', () => {
  const target = 'card-old::button::e7a1aee8aea4';
  document.getElementById('page').innerHTML = `
    <div class="ant-card">
      <div class="ant-card-head-title">新的审批信息</div>
      <button>确认</button>
    </div>
  `;

  const result = analyzeAnnotationMatch(note(target), PAGE_SCOPE, document);
  expect(result.status).toBe('semantic');
  expect(result.confidence).toBe('medium');
  expect(result.element?.text).toBe('确认');
});
