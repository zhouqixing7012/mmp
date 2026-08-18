import { getBuiltInPrototypeAnnotations } from './annotation-base-registry';
import { preparePrototypeTargets, resolvePrototypeTarget } from './annotation-targeting';

const PAGE_SCOPE = 'route:/yewurules::个人工作台::借用审批';
const REQUIRED_NOTE_IDS = [
  'borrowing-approval-route',
  'borrowing-approval-opinion',
  'borrowing-approval-agree',
  'borrowing-approval-reject',
];

describe('asset borrowing approval annotation targeting', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ant-card" id="approval-card">
        <div class="ant-card-head">
          <div class="ant-card-head-title">审批信息</div>
        </div>
        <div class="ant-card-body">
          <div class="ant-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>审批环节</th>
                  <th>申请人/审批人</th>
                  <th>审批状态</th>
                  <th>审批时间</th>
                  <th>审批意见</th>
                </tr>
              </thead>
            </table>
          </div>
          <div class="mt-4">
            <strong>审批意见</strong>
            <textarea id="approval-opinion" placeholder="同意时非必填，驳回时必填"></textarea>
            <div class="mt-3">
              <button id="agree-button">同意</button>
              <button id="reject-button">驳回</button>
              <button>返回</button>
              <button>加签</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  test('借用审批四个关键标注全部能匹配当前页面语义对象', () => {
    preparePrototypeTargets(PAGE_SCOPE);
    const annotations = getBuiltInPrototypeAnnotations(PAGE_SCOPE);
    const notes = new Map(annotations.map((note) => [note.id, note]));

    REQUIRED_NOTE_IDS.forEach((id) => {
      expect(notes.has(id)).toBe(true);
      expect(resolvePrototypeTarget(notes.get(id).target, PAGE_SCOPE)).not.toBeNull();
    });

    expect(resolvePrototypeTarget(notes.get('borrowing-approval-route').target, PAGE_SCOPE)?.id).toBe('approval-card');
    expect(resolvePrototypeTarget(notes.get('borrowing-approval-opinion').target, PAGE_SCOPE)?.id).toBe('approval-opinion');
    expect(resolvePrototypeTarget(notes.get('borrowing-approval-agree').target, PAGE_SCOPE)?.id).toBe('agree-button');
    expect(resolvePrototypeTarget(notes.get('borrowing-approval-reject').target, PAGE_SCOPE)?.id).toBe('reject-button');
  });
});
