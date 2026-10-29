// 页面定位由面包屑展示；内部视图识别只读元数据，不依赖可见标题。
export function getPageIdentity(root) {
  if (!root) return '';
  const node = root.matches?.('[data-mmp-page-title]') ? root : root.querySelector('[data-mmp-page-title], h4.ant-typography');
  return (node?.getAttribute('data-mmp-page-title') || node?.textContent || '').trim();
}
