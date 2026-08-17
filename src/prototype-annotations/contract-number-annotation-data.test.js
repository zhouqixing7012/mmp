import contractNumberAnnotationsByScope from './contract-number-annotation-data';

const APPLICATION_SCOPE = 'route:/yewurules::个人工作台::合约号码申请';

describe('contract number annotation granularity', () => {
  test('合约号码申请将统一规则与字段规则分开', () => {
    const annotations = contractNumberAnnotationsByScope[APPLICATION_SCOPE];

    expect(annotations).toHaveLength(4);
    expect(annotations.filter((note) => note.kind === 'business-rule')).toHaveLength(1);
    expect(annotations.filter((note) => note.kind === 'field-rule')).toHaveLength(3);
    expect(annotations.map((note) => note.id)).toEqual(expect.arrayContaining([
      'contract-apply-core-rules',
      'contract-apply-id-number-rule',
      'contract-apply-reason-rule',
      'contract-apply-attachment-rule',
    ]));
  });

  test('字段规则绑定到具体 DetailItem target', () => {
    const annotations = contractNumberAnnotationsByScope[APPLICATION_SCOPE];
    const fieldRules = annotations.filter((note) => note.kind === 'field-rule');

    fieldRules.forEach((note) => {
      expect(note.target).toContain('::detail-field::');
      expect(note.position).toMatchObject({ side: 'right', align: 'center' });
    });
  });

  test('模块规则只保留申请级统一流程规则', () => {
    const annotations = contractNumberAnnotationsByScope[APPLICATION_SCOPE];
    const moduleRule = annotations.find((note) => note.id === 'contract-apply-core-rules');
    const moduleText = JSON.stringify(moduleRule.sections);

    expect(moduleRule.title).toBe('申请级统一规则');
    expect(moduleText).toContain('已有合约号码');
    expect(moduleText).toContain('处理中');
    expect(moduleText).not.toContain('中间位数使用 * 隐藏');
    expect(moduleText).not.toContain('单文件最大 10MB');
  });
});
