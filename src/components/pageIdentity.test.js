import { getPageIdentity } from './pageIdentity';

test('视图用元数据定位，不需要渲染占空间的标题', () => {
  const root = document.createElement('div');
  const view = document.createElement('div');
  view.setAttribute('data-mmp-page-title', '创建盘点项目');
  root.appendChild(view);
  expect(getPageIdentity(root)).toBe('创建盘点项目');
  expect(root.querySelector('h1,h2,h3,h4')).toBeNull();
  view.setAttribute('data-mmp-page-title', '盘点项目详情');
  expect(getPageIdentity(root)).toBe('盘点项目详情');
});

test('隐藏标识及根节点属性保持页面身份，业务正文不混入名称', () => {
  const root = document.createElement('div');
  const marker = document.createElement('span');
  marker.hidden = true;
  marker.setAttribute('data-mmp-page-title', '');
  marker.textContent = '移库单详情';
  root.appendChild(marker);
  expect(getPageIdentity(root)).toBe('移库单详情');
  expect(marker).not.toBeVisible();
  root.setAttribute('data-mmp-page-title', '盘点项目');
  expect(getPageIdentity(root)).toBe('盘点项目');
  expect(getPageIdentity(null)).toBe('');
});
