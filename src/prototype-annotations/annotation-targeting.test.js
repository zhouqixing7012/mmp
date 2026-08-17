import {
  findPrototypeBindingElement,
  getPrototypeDisplayAnchor,
  getPrototypeTargetMetadata,
  isPrototypeElementInActiveLayer,
  listPrototypeTargets,
  preparePrototypeTargets,
  resolvePrototypeTarget,
} from './annotation-targeting';

const PAGE_SCOPE = 'route:/yewurules::后台基础配置::物料数据维护::物料维度组合';

describe('annotation-targeting', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section data-prototype-anchor="material-query-bar">
        <div class="qw">
          <div data-prototype-bindable="query-condition" data-prototype-label="资产标签号">
            <span class="query-label">资产标签号:</span><input placeholder="请输入资产标签号" />
          </div>
        </div>
        <div class="qw">
          <div data-prototype-bindable="query-condition" data-prototype-label="资产状态">
            <span class="status-label">资产状态:</span>
            <div class="ant-select">
              <div class="ant-select-selector">
                <span class="ant-select-selection-placeholder">请选择资产状态</span>
              </div>
            </div>
          </div>
        </div>
        <div class="ant-radio-group">
          <label class="ant-radio-wrapper"><span class="ant-radio"><input type="radio" /></span><span>是</span></label>
          <label class="ant-radio-wrapper"><span class="ant-radio"><input type="radio" /></span><span>否</span></label>
        </div>
        <button><span>查询</span></button>
        <button><span>重置</span></button>
      </section>
      <div class="ant-tabs">
        <div class="ant-tabs-nav-list">
          <div class="ant-tabs-tab"><div class="ant-tabs-tab-btn">资产</div></div>
          <div class="ant-tabs-tab"><div class="ant-tabs-tab-btn">耗材</div></div>
        </div>
      </div>
      <section data-prototype-anchor="material-table">
        <table><thead><tr><th><span>资产标签号</span></th><th>资产状态</th></tr></thead></table>
      </section>
      <div class="bg-white"><h3>审批信息</h3><div>普通内容</div></div>
      <dl>
        <dt data-prototype-bindable="detail-field" data-prototype-label="公司">公司</dt>
        <dd data-prototype-detail-value="公司"><span>搜狐公司</span></dd>
      </dl>
      <div class="ant-card" id="application-card">
        <div class="ant-card-head"><div class="ant-card-head-title"><span>申请信息</span></div></div>
        <div class="ant-card-body"><div>申请内容</div></div>
      </div>
      <div class="ant-card" id="issue-card">
        <div class="ant-card-head"><div class="ant-card-head-title"><span>借用资产明细</span></div></div>
        <div class="ant-card-body">
          <table class="ant-descriptions-view">
            <tbody>
              <tr class="ant-descriptions-row">
                <th class="ant-descriptions-item-label"><span class="required-star">*</span> 当前仓库</th>
                <td class="ant-descriptions-item-content">
                  <div class="ant-select" id="warehouse-select">
                    <div class="ant-select-selector"><span class="ant-select-selection-item">北京总部仓</span></div>
                  </div>
                </td>
              </tr>
              <tr class="ant-descriptions-row">
                <th class="ant-descriptions-item-label">使用说明</th>
                <td class="ant-descriptions-item-content"><span id="usage-value">临时办公</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div data-prototype-bindable="selection-modal" data-prototype-label="选择资产" id="selection-modal">
        <span data-prototype-display-anchor="title">选择资产</span>
        <div>弹窗内容</div>
      </div>
    `;
  });

  test('点击查询条件标签仍可精准命中 QueryItem', () => {
    const label = document.querySelector('.query-label');
    const element = findPrototypeBindingElement(label);

    expect(element.getAttribute('data-prototype-bindable')).toBe('query-condition');
    expect(element.getAttribute('data-prototype-label')).toBe('资产标签号');
  });

  test('点击查询条件中的普通输入框优先命中具体控件', () => {
    const input = document.querySelector('input[placeholder="请输入资产标签号"]');
    const element = findPrototypeBindingElement(input);
    const metadata = getPrototypeTargetMetadata(element, PAGE_SCOPE);

    expect(element.tagName).toBe('INPUT');
    expect(metadata.kind).toBe('control');
    expect(metadata.label).toBe('资产标签号');
  });

  test('查询条件中的下拉框优先命中 Select 而不是外层 QueryItem', () => {
    const placeholder = document.querySelector('.ant-select-selection-placeholder');
    const element = findPrototypeBindingElement(placeholder);
    const metadata = getPrototypeTargetMetadata(element, PAGE_SCOPE);

    expect(element.classList.contains('ant-select')).toBe(true);
    expect(metadata.kind).toBe('select');
    expect(metadata.label).toBe('资产状态');
    expect(resolvePrototypeTarget(metadata.target, PAGE_SCOPE)).toBe(element);
  });

  test('Descriptions 内的 Select 使用字段标签而不是当前值生成 target', () => {
    const selectedValue = document.querySelector('#warehouse-select .ant-select-selection-item');
    const element = findPrototypeBindingElement(selectedValue);
    const metadata = getPrototypeTargetMetadata(element, PAGE_SCOPE);

    expect(element.id).toBe('warehouse-select');
    expect(metadata.kind).toBe('select');
    expect(metadata.label).toBe('当前仓库');
    expect(metadata.target).toContain('::select::');
    expect(metadata.target).not.toContain('北京总部仓');
  });

  test('Descriptions 普通值区域回退到对应字段标签', () => {
    const value = document.querySelector('#usage-value');
    const element = findPrototypeBindingElement(value);
    const metadata = getPrototypeTargetMetadata(element, PAGE_SCOPE);

    expect(element.classList.contains('ant-descriptions-item-label')).toBe(true);
    expect(metadata.kind).toBe('detail-field');
    expect(metadata.label).toBe('使用说明');
  });

  test('Descriptions 必填星号不会进入字段语义', () => {
    const star = document.querySelector('.required-star');
    const element = findPrototypeBindingElement(star);
    const metadata = getPrototypeTargetMetadata(element, PAGE_SCOPE);

    expect(metadata.kind).toBe('detail-field');
    expect(metadata.label).toBe('当前仓库');
  });

  test('单选按钮可以按具体选项精准命中', () => {
    const optionText = Array.from(document.querySelectorAll('.ant-radio-wrapper span'))
      .find((element) => element.textContent === '是');
    const element = findPrototypeBindingElement(optionText);
    const metadata = getPrototypeTargetMetadata(element, PAGE_SCOPE);

    expect(element.classList.contains('ant-radio-wrapper')).toBe(true);
    expect(metadata.kind).toBe('radio');
    expect(metadata.label).toBe('是');
  });

  test('标签页可以按单个 Tab 精准命中', () => {
    const tabText = Array.from(document.querySelectorAll('.ant-tabs-tab-btn'))
      .find((element) => element.textContent === '耗材');
    const element = findPrototypeBindingElement(tabText);
    const metadata = getPrototypeTargetMetadata(element, PAGE_SCOPE);

    expect(element.classList.contains('ant-tabs-tab')).toBe(true);
    expect(metadata.kind).toBe('tab');
    expect(metadata.label).toBe('耗材');
  });

  test('无需预扫描也能从按钮内部精准命中 Button', () => {
    const span = document.querySelector('button span');
    const element = findPrototypeBindingElement(span);

    expect(element.tagName).toBe('BUTTON');
    expect(element.textContent).toBe('查询');
  });

  test('无需预扫描也能从表头内部精准命中单个 th', () => {
    const span = document.querySelector('section th span');
    const element = findPrototypeBindingElement(span);

    expect(element.tagName).toBe('TH');
    expect(element.textContent).toBe('资产标签号');
  });

  test('点击 DetailItem 的普通值仍会命中对应详情字段', () => {
    const value = document.querySelector('[data-prototype-detail-value] span');
    const element = findPrototypeBindingElement(value);

    expect(element.tagName).toBe('DT');
    expect(element.getAttribute('data-prototype-label')).toBe('公司');
  });

  test('字段标注的展示锚点保持在字段本身', () => {
    const field = document.querySelector('[data-prototype-bindable="detail-field"]');
    expect(getPrototypeDisplayAnchor(field)).toBe(field);
  });

  test('Card 模块标注的序号优先贴在实际标题文字旁边', () => {
    const card = document.querySelector('#application-card');
    expect(getPrototypeDisplayAnchor(card)).toBe(card.querySelector('.ant-card-head-title > span'));
  });

  test('自定义模块可显式声明序号展示锚点', () => {
    const modal = document.querySelector('#selection-modal');
    expect(getPrototypeDisplayAnchor(modal)).toBe(modal.querySelector('[data-prototype-display-anchor]'));
  });

  test('没有预埋 anchor 的普通白色业务块仍可作为模块命中', () => {
    const content = document.querySelector('.bg-white div');
    const element = findPrototypeBindingElement(content);

    expect(element.classList.contains('bg-white')).toBe(true);
  });

  test('为字段、Descriptions、控件、按钮、表头、单选和标签页生成稳定细粒度目标', () => {
    const firstTargets = preparePrototypeTargets(PAGE_SCOPE).map((item) => item.target);
    const secondTargets = preparePrototypeTargets(PAGE_SCOPE).map((item) => item.target);

    expect(firstTargets).toEqual(secondTargets);
    expect(firstTargets.some((target) => target.includes('query-condition'))).toBe(true);
    expect(firstTargets.some((target) => target.includes('detail-field'))).toBe(true);
    expect(firstTargets.some((target) => target.includes('select'))).toBe(true);
    expect(firstTargets.some((target) => target.includes('radio'))).toBe(true);
    expect(firstTargets.some((target) => target.includes('tab'))).toBe(true);
    expect(firstTargets.filter((target) => target.includes('button'))).toHaveLength(2);
    expect(firstTargets.filter((target) => target.includes('table-column'))).toHaveLength(2);
  });

  test('不同中文字段生成不同且可重建的 target', () => {
    const targets = preparePrototypeTargets(PAGE_SCOPE)
      .filter((item) => item.kind === 'query-condition')
      .map((item) => item.target);

    expect(new Set(targets).size).toBe(2);
    expect(targets[0]).not.toBe(targets[1]);
  });

  test('打开业务弹窗后底层页面目标不在活动层，弹窗内部目标仍在活动层', () => {
    const pageButton = document.querySelector('button');
    const overlay = document.createElement('div');
    overlay.setAttribute('data-prototype-overlay', 'modal');
    overlay.style.zIndex = '1000';
    overlay.innerHTML = '<div><button id="modal-button">弹窗确定</button></div>';
    document.body.appendChild(overlay);

    const modalButton = document.querySelector('#modal-button');

    expect(isPrototypeElementInActiveLayer(pageButton)).toBe(false);
    expect(isPrototypeElementInActiveLayer(modalButton)).toBe(true);
  });

  test('导出目标包含模块级和更多细粒度目标', () => {
    const targets = listPrototypeTargets(PAGE_SCOPE);
    expect(targets.some((item) => item.kind === 'query-condition')).toBe(true);
    expect(targets.some((item) => item.kind === 'select')).toBe(true);
    expect(targets.some((item) => item.kind === 'radio')).toBe(true);
    expect(targets.some((item) => item.kind === 'tab')).toBe(true);
    expect(targets.some((item) => item.kind === 'detail-field')).toBe(true);
    expect(targets.some((item) => item.kind === 'module')).toBe(true);
  });
});
