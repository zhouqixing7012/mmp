import {
  YEWURULES_MATERIAL_COMPREHENSIVE_SCOPE,
  buildRoutePageScope,
  readPrototypePageLabel,
  readPrototypePageScope,
} from './annotation-page-scope';

describe('annotation-page-scope', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('普通独立路由直接按 pathname 建立标注作用域', () => {
    expect(buildRoutePageScope('/employee-self-service/asset-apply'))
      .toBe('route:/employee-self-service/asset-apply');
  });

  test('yewurules 内部菜单和页签会进入独立作用域', () => {
    document.body.innerHTML = `
      <main
        data-prototype-page-scope="后台基础配置::物料数据维护::物料维度组合"
        data-prototype-page-label="物料维度组合"
      ></main>
    `;

    expect(readPrototypePageScope('/yewurules')).toBe(YEWURULES_MATERIAL_COMPREHENSIVE_SCOPE);
    expect(readPrototypePageLabel('/yewurules')).toBe('物料维度组合');
  });

  test('切换内部页面后 scope 随 DOM 当前状态变化', () => {
    document.body.innerHTML = `
      <main data-prototype-page-scope="库存管理::资产接收" data-prototype-page-label="资产接收"></main>
    `;
    const first = readPrototypePageScope('/yewurules');

    const main = document.querySelector('main');
    main.setAttribute('data-prototype-page-scope', '库存管理::入库');
    main.setAttribute('data-prototype-page-label', '入库');
    const second = readPrototypePageScope('/yewurules');

    expect(first).toBe('route:/yewurules::库存管理::资产接收');
    expect(second).toBe('route:/yewurules::库存管理::入库');
    expect(first).not.toBe(second);
  });
});
