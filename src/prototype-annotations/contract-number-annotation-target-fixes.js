// 合约号码标注的目标修正。
// 表格行内会重复出现“发送通知”按钮；这类规则仍然属于按钮动作，不能因为按钮重复就退回整个 Card。

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stableKey(value) {
  const text = compactText(value).toLowerCase() || 'item';
  return encodeURIComponent(text)
    .replace(/%/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 72) || 'item';
}

const AUTHORIZATION_SCOPE = 'route:/yewurules::个人工作台::号码控制';
const SEND_NOTIFICATION_TARGET = `card-${stableKey('授权人员列表')}::button::${stableKey('发送通知')}`;

export function applyContractNumberAnnotationTargetFixes(annotationsByScope = {}) {
  const next = Object.fromEntries(
    Object.entries(annotationsByScope).map(([pageScope, annotations]) => [
      pageScope,
      [...(annotations || [])],
    ])
  );

  next[AUTHORIZATION_SCOPE] = (next[AUTHORIZATION_SCOPE] || []).map((note) => {
    if (note?.id !== 'contract-audit-auth-notification') return note;

    return {
      ...note,
      target: SEND_NOTIFICATION_TARGET,
      kind: 'action-rule',
      context: {
        ...(note.context || {}),
        repeatedRowAction: true,
      },
    };
  });

  return next;
}

export const CONTRACT_AUTH_SEND_NOTIFICATION_TARGET = SEND_NOTIFICATION_TARGET;
