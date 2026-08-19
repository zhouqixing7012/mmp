import { getBaselineAnnotationsForScope } from './annotation-coverage-registry';
import { CONTRACT_AUTH_SEND_NOTIFICATION_TARGET } from './contract-number-annotation-target-fixes';

const AUTHORIZATION_SCOPE = 'route:/yewurules::个人工作台::号码控制';

test('号码控制的发送通知规则绑定行内发送通知按钮，不退回授权人员列表模块', () => {
  const notes = getBaselineAnnotationsForScope(AUTHORIZATION_SCOPE);
  const note = notes.find((item) => item.id === 'contract-audit-auth-notification');

  expect(note).toBeTruthy();
  expect(note.kind).toBe('action-rule');
  expect(note.target).toBe(CONTRACT_AUTH_SEND_NOTIFICATION_TARGET);
  expect(note.target).toContain('::button::');
});
