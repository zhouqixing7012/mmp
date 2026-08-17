import {
  findPrototypeBindingElement,
  listPrototypeTargets,
  preparePrototypeTargets,
  resolvePrototypeTarget,
} from './annotation-targeting';

describe('annotation-targeting', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section data-prototype-anchor="material-query-bar">
        <div class="qw">
          <div data-prototype-bindable="query-condition" data-prototype-label="资产标签号">
            <span>资产标签号:</span><input placeholder="请输入资产标签号" />
          </div>
        </div>
        <div class="qw">
          <div data-prototype-bindable="query-condition" data-prototype-label="资产状态">
            <span>资产状态:</span><input placeholder="请选择资产状态" />
          </div>
        </div>
        <button><span>查询</span></button>
        <button><span>重置</span></button>
      </section>
      <section data-prototype-anchor="material-table">
        <table><thead><tr><th>资产标签号</th><th>资产状态</th></tr></thead></table>
      </section>
    `;
  });

  test('为查询条件、按钮和表头生成稳定细粒度目标', () => {
    const firstTargets = preparePrototypeTargets('yewurules').map((item) => item.target);
    const secondTargets = preparePrototypeTargets('yewurules').map((item) => item.target);

    expect(firstTargets).toEqual(secondTargets);
    expect(firstTargets.filter((target) => target.includes('query-condition'))).toHaveLength(2);
    expect(firstTargets.filter((target) => target.includes('button'))).toHaveLength(2);
    expect(firstTargets.filter((target) => target.includes('table-column'))).toHaveLength(2);
  });

  test('不同中文字段生成不同且可重建的 target', () => {
    const targets = preparePrototypeTargets('yewurules')
      .filter((item) => item.kind === 'query-condition')
      .map((item) => item.target);

    expect(new Set(targets).size).toBe(2);
    expect(targets[0]).not.toBe(targets[1]);
    expect(targets.every((target) => /[a-f]/.test(target))).toBe(true);
  });

  test('可以从按钮内部节点精准命中按钮目标', () => {
    preparePrototypeTargets('yewurules');
    const span = document.querySelector('button span');
    const element = findPrototypeBindingElement(span);
    expect(element.tagName).toBe('BUTTON');
    expect(element.getAttribute('data-prototype-generated-target')).toContain('button');
  });

  test('生成目标可以在刷新扫描后重新解析', () => {
    const targets = listPrototypeTargets('yewurules');
    const generated = targets.find((item) => item.generated && item.kind === 'query-condition');
    expect(generated).toBeTruthy();
    expect(resolvePrototypeTarget(generated.target)).toBe(generated.element);
  });
});
