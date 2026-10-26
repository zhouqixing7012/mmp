import { applyInventoryPersonnelChange, canEditInventoryPersonnel, initializeInventoryPlanPersonnel, inventoryPersonnelCandidates, inventoryPlanFinanceBlockReason } from './inventoryPlanPersonnel';

const draft = { status: '草稿', range: '员工' };
const initial = { projectType: '初盘' };
const replay = { projectType: '复盘' };
const assets = [{ key: 'a', assetTag: 'A', inventoryRange: '员工', owner: '甲', supervisor: '部门助理', executor: '旧人员' }, { key: 'b', assetTag: 'B', inventoryRange: '员工', owner: '乙' }];

test('初盘员工逐资产取责任人，机房执行人及监督人不能手工覆盖', () => {
  expect(initializeInventoryPlanPersonnel(initial, assets, { executor: '丙' }).map(asset => asset.executor)).toEqual(['甲', '乙']);
  const room = { ...assets[0], inventoryRange: '机房' };
  expect(initializeInventoryPlanPersonnel(initial, [room], { executor: '丙', supervisor: '丁' })[0]).toMatchObject({ executor: '甲', supervisor: '-' });
  expect(canEditInventoryPersonnel(initial, { ...draft, range: '机房' }, room, 'executor')).toBe(false);
  expect(() => applyInventoryPersonnelChange(initial, draft, [room], 'executor', '丙')).toThrow('锁定');
});

test('计划级改人覆盖本计划，逐资产改人不影响其他资产及实际盘点人', () => {
  const source = assets.map(asset => ({ ...asset, counter: '实际盘点人' }));
  expect(applyInventoryPersonnelChange(initial, draft, source, 'executor', '新人员').map(asset => asset.executor)).toEqual(['新人员', '新人员']);
  const changed = applyInventoryPersonnelChange(initial, draft, source, 'executor', '新人员', 'a');
  expect(changed[0]).toMatchObject({ executor: '新人员', counter: '实际盘点人', owner: '甲' });
  expect(changed[1]).toEqual(source[1]);
  expect(source[0].executor).toBe('旧人员');
});

test.each(['盘点中', '审核中', '已审核', '关闭'])('%s人员在保存入口锁定', status => {
  expect(() => applyInventoryPersonnelChange(initial, { ...draft, status }, assets, 'supervisor', '新人员')).toThrow('锁定');
});

test('复盘监督及执行仅可配置已有明确财务身份，启动再次校验', () => {
  expect(inventoryPersonnelCandidates(replay, 'supervisor').map(person => person.employeeName)).toEqual(expect.arrayContaining(['冯丽婷', '徐博']));
  expect(inventoryPersonnelCandidates(replay, 'executor').every(person => person.employeeNo === '')).toBe(true);
  expect(() => applyInventoryPersonnelChange(replay, draft, assets, 'supervisor', '部门助理')).toThrow('财务人员');
  expect(inventoryPlanFinanceBlockReason(replay, [{ ...assets[0], executor: '冯丽婷', supervisor: '徐博' }])).toBe('');
  expect(inventoryPlanFinanceBlockReason(replay, [{ ...assets[0], executor: '甲' }])).toContain('财务人员');
  expect(initializeInventoryPlanPersonnel(replay, assets, { executor: '冯丽婷', supervisor: '徐博' })[0]).toMatchObject({ executor: '冯丽婷', supervisor: '徐博', financialSupervisor: '徐博' });
});

test('位置库管员仅从明确仓库记录关联，不凭位置文字猜测', () => {
  const [known, unknown] = initializeInventoryPlanPersonnel(initial, [
    { key: 'known', inventoryRange: '库房', warehouseCode: 'I0001' },
    { key: 'unknown', inventoryRange: '公共', city: '北京市' },
  ]);
  expect(known.executor).toBe('114111-杨芊');
  expect(known.supervisor).toBe(known.executor);
  expect(unknown.executor).toBe('-');
});

test('抽盘和自定义空值不套用未确认库管员默认，员工监督不猜部门助理', () => {
  const warehouse = { key: 'w', inventoryRange: '库房', warehouseCode: 'I0001' };
  expect(initializeInventoryPlanPersonnel({ projectType: '抽盘' }, [warehouse])[0].executor).toBe('-');
  expect(initializeInventoryPlanPersonnel(initial, [warehouse], {}, 'custom')[0].executor).toBe('-');
  expect(initializeInventoryPlanPersonnel(initial, assets)[0].supervisor).toBe('-');
  expect(() => initializeInventoryPlanPersonnel(initial, assets, { executor: '丙' }, 'custom')).toThrow('尚未定义');
  expect(initializeInventoryPlanPersonnel(initial, [{ ...assets[0], departmentAssistant: '助理' }], {}, 'custom')[0].supervisor).toBe('助理');
});

test('自定义库房空值保持空，公共监督人取创建人，有值带入不继承旧人员', () => {
  const rooms = [{ key: 'a', inventoryRange: '库房', warehouseCode: 'I0001', executor: '旧执行', supervisor: '旧监督' }, { key: 'b', inventoryRange: '公共', locationKeeper: '库管' }];
  expect(initializeInventoryPlanPersonnel({ ...initial, creator: '213852-孙志强' }, rooms, {}, 'custom').map(asset => [asset.supervisor, asset.executor])).toEqual([['-', '-'], ['孙志强', '-']]);
  expect(initializeInventoryPlanPersonnel(initial, rooms, { supervisor: '甲', executor: '乙' }, 'custom')[0]).toMatchObject({ supervisor: '甲', executor: '乙' });
});

test.each(['初盘', '抽盘', '复盘'])('公共%s默认执行人空、监督人为创建人，自定义监督优先', projectType => {
  const creator = projectType === '复盘' ? '冯丽婷' : '213852-孙志强';
  const project = { projectType, creator };
  const source = [{ inventoryRange: '公共', locationKeeper: '库管', owner: '责任人', supervisor: '旧监督人', executor: '旧执行人' }];
  for (const mode of ['default', 'custom']) {
    expect(initializeInventoryPlanPersonnel(project, source, {}, mode)[0]).toMatchObject({ supervisor: projectType === '复盘' ? '冯丽婷' : '孙志强', executor: '-' });
    expect(initializeInventoryPlanPersonnel(project, source, { supervisor: '徐博' }, mode)[0]).toMatchObject({ supervisor: '徐博', executor: '-' });
  }
  expect(initializeInventoryPlanPersonnel(project, source, { executor: '冯丽婷', supervisor: '' }, 'custom')[0]).toMatchObject({ executor: '冯丽婷', supervisor: projectType === '复盘' ? '冯丽婷' : '孙志强' });
});
