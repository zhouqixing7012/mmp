import {
  CONTRACT_NUMBER_BATCH_FIELDS,
  CONTRACT_NUMBER_EDIT_FIELDS,
  batchUpdateContractNumberMaintenanceRows,
  getContractNumberMaintenanceRows,
  hasContractNumberMaintenanceAccess,
  updateContractNumberMaintenanceRow,
  validateContractNumberBatchRows,
} from './contractNumberMaintenanceService';
import { CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY } from '../mock/contractNumberMaintenanceMock';

function getRow(id = 'contract-number-2') {
  return getContractNumberMaintenanceRows().find((row) => row.id === id);
}

function editablePatch(row, overrides = {}) {
  const patch = CONTRACT_NUMBER_EDIT_FIELDS.reduce((result, field) => ({
    ...result,
    [field]: row[field] ?? '',
  }), {});
  return { ...patch, ...overrides };
}

function batchLine(row, overrides = {}) {
  const line = { rowNo: 2 };
  CONTRACT_NUMBER_BATCH_FIELDS.forEach(({ header }) => {
    line[header] = '';
  });
  line['标签号'] = row.tag;
  return { ...line, ...overrides };
}

describe('合约号码维护保存边界', () => {
  beforeEach(() => {
    window.localStorage.removeItem(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY);
  });

  afterEach(() => {
    window.localStorage.removeItem(CONTRACT_NUMBER_MAINTENANCE_STORAGE_KEY);
  });

  test('禁止通过接口修改标签号', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { tag: 'FAKE-TAG' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('禁止客户端伪造最后修改时间和责任人姓名', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { updatedAt: '2099-01-01 00:00:00' }))
      .toThrow('合约号码维护存在不允许修改的字段');
    expect(() => updateContractNumberMaintenanceRow(row.id, { ownerName: '伪造姓名' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('身份证号码不属于单条维护字段，旧副卡和维修记录字段也禁止写入', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { idCard: '110101199901019999' }))
      .toThrow('合约号码维护存在不允许修改的字段');

    expect(() => updateContractNumberMaintenanceRow(row.id, { secondaryCard: '伪造副卡' }))
      .toThrow('合约号码维护存在不允许修改的字段');
    expect(() => updateContractNumberMaintenanceRow(row.id, { maintenanceRecord: '伪造维修记录' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('子公司、申请类型和申请单号不能直接提交修改', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { subsidiary: '伪造子公司' }))
      .toThrow('合约号码维护存在不允许修改的字段');
    expect(() => updateContractNumberMaintenanceRow(row.id, { applicationType: '伪造申请类型' }))
      .toThrow('合约号码维护存在不允许修改的字段');
    expect(() => updateContractNumberMaintenanceRow(row.id, { applicationNo: 'FAKE-APP' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('套餐内容可编辑并写入操作历史，合约号码说明保持只读', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { contractDesc: '伪造说明' }))
      .toThrow('合约号码维护存在不允许修改的字段');
    const nextRows = updateContractNumberMaintenanceRow(row.id, { packageContent: '新套餐内容' });
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.packageContent).toBe('新套餐内容');
    expect(saved.transactionHistory[saved.transactionHistory.length - 1].changes).toContainEqual({ field: 'packageContent', before: row.packageContent, after: '新套餐内容' });
  });

  test('使用说明和领用原因属于维护字段，旧备注和领用说明字段禁止写入', () => {
    const row = getRow();
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      usageDescription: '新的使用说明',
      claimReason: '管理者配发',
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.usageDescription).toBe('新的使用说明');
    expect(saved.claimReason).toBe('管理者配发');

    expect(() => updateContractNumberMaintenanceRow(row.id, { remarks: '旧备注字段' }))
      .toThrow('合约号码维护存在不允许修改的字段');
    expect(() => updateContractNumberMaintenanceRow(row.id, { claimDescription: '旧领用说明字段' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('合约号码不可通过单条保存接口修改', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { contractNumber: '12345678901' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('单条编辑不改变合约号码', () => {
    const row = getRow();
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { packageContent: '套餐已修改' }));
    expect(nextRows.find((item) => item.id === row.id).contractNumber).toBe(row.contractNumber);
  });

  test('金额必须是数字且最多8位整数2位小数', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { amount: 'abc' })))
      .toThrow('金额必须为数字');
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { amount: '100000000.00' })))
      .toThrow('金额最多8位整数和2位小数');
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { amount: '180.123' })))
      .toThrow('金额最多8位整数和2位小数');
  });

  test('合约期限开始日期不得晚于结束日期', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      contractStartDate: '2026-12-31',
      contractEndDate: '2026-01-01',
    }))).toThrow('合约期限开始日期不得晚于结束日期');
  });

  test('非法合约日期不能保存', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { contractEndDate: '2026-02-31' })))
      .toThrow('合约期限日期格式无效');
  });

  test('领用日期属于单条可编辑字段', () => {
    const row = getRow();
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { claimDate: '2026-09-15' }));
    expect(nextRows.find((item) => item.id === row.id).claimDate).toBe('2026-09-15');
  });

  test('非法领用日期不能保存', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { claimDate: '2026-02-31' })))
      .toThrow('领用日期格式无效');
  });

  test('在用状态仓库必须为空', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      status: '在用-使用中',
      warehouse: 'I10086.集团合约机库',
    }))).toThrow('仓库和状态不匹配。');
  });

  test('非在用状态必须选择有效仓库', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      status: '在库（新）',
      warehouse: '',
    }))).toThrow('仓库和状态不匹配。');
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      status: '在库（新）',
      warehouse: 'FAKE-WH',
    }))).toThrow('仓库和状态不匹配。');
  });

  test('报废状态必须填写报废日期和报废原因', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      status: '已报废',
      warehouse: 'I10086.集团合约机库',
      scrapDate: '',
      scrapReason: '',
    }))).toThrow('报废日期不能为空且必须有效');
  });

  test('非法报废日期不能保存', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      status: '已报废',
      warehouse: 'I10086.集团合约机库',
      scrapDate: '2026-02-31',
      scrapReason: '报废测试',
    }))).toThrow('报废日期不能为空且必须有效');
  });

  test('非报废状态不能残留报废字段', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      scrapDate: '2026-09-01',
      scrapReason: '伪造报废信息',
    }))).toThrow('非报废状态不允许填写报废日期或报废原因');
  });

  test('责任人变化刷新姓名部门子公司职级并保留原有身份证号码数据', () => {
    const row = getRow('contract-number-2');
    const targetOwner = getRow('contract-number-3');
    const originalIdCard = row.idCard;
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      ownerId: targetOwner.ownerId,
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.ownerName).toBe(targetOwner.ownerName);
    expect(saved.department).toBe(targetOwner.department);
    expect(saved.subsidiary).toBe(targetOwner.subsidiary);
    expect(saved.jobLevel).toBe(targetOwner.jobLevel);
    expect(saved.idCard).toBe(originalIdCard);
  });

  test('不存在的责任人不能保存', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { ownerId: 'UNKNOWN' })))
      .toThrow('责任人不能为空且必须有效');
  });

  test('使用公司只允许搜狐或畅游并保留现有编码', () => {
    const row = getRow('contract-number-2');
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { useCompany: '畅游' }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.useCompany).toBe('畅游');
    expect(saved.useCompanyCode).toBe(row.useCompanyCode);
  });

  test('不存在的使用公司不能保存', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { useCompany: '不存在公司' })))
      .toThrow('使用公司不能为空且必须有效');
  });

  test('使用说明属于单条卡片可编辑字段', () => {
    const row = getRow();
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { usageDescription: '新的使用说明' }));
    expect(nextRows.find((item) => item.id === row.id).usageDescription).toBe('新的使用说明');
  });

  test('不存在的标签ID不能静默成功', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow('NOT-EXISTS', editablePatch(row)))
      .toThrow('合约号码标签号不存在');
  });

  test('无实际变化不更新时间也不生成历史', () => {
    const row = getRow();
    const historyCount = row.transactionHistory.length;
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.updatedAt).toBe(row.updatedAt);
    expect(saved.transactionHistory).toHaveLength(historyCount);
  });

  test('实际变化更新时间并生成带来源的维护事务', () => {
    const row = getRow();
    const historyCount = row.transactionHistory.length;
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { usageDescription: '测试维护历史' }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.usageDescription).toBe('测试维护历史');
    expect(saved.updatedAt).not.toBe(row.updatedAt);
    expect(saved.transactionHistory).toHaveLength(historyCount + 1);
    expect(saved.transactionHistory[saved.transactionHistory.length - 1].source).toBe('合约号码台账维护');
  });

  test('不能通过接口修改重复号码', () => {
    const row = getRow('contract-number-2');
    const duplicate = getRow('contract-number-3');
    expect(() => updateContractNumberMaintenanceRow(row.id, { contractNumber: duplicate.contractNumber }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('领用原因只允许三个正式枚举，申请类型保持原值', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { claimReason: '业务使用' })))
      .toThrow('领用原因无效');
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { claimReason: '管理者配送' })))
      .toThrow('领用原因无效');
    const saved = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { claimReason: '管理者配发' }))
      .find((item) => item.id === row.id);
    expect(saved.claimReason).toBe('管理者配发');
    expect(saved.applicationType).toBe(row.applicationType);
  });

  test('维护范围只返回合约号码不包含合约机', () => {
    const rows = getContractNumberMaintenanceRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((item) => item.assetMajorCode === '34' && item.minorCategory === '合约号码')).toBe(true);
    expect(rows.some((item) => item.minorCategory === '合约机')).toBe(false);
  });

  test('仅孙志强和何文具有合约号码维护权限', () => {
    expect(hasContractNumberMaintenanceAccess('213852-孙志强')).toBe(true);
    expect(hasContractNumberMaintenanceAccess('206984-何文')).toBe(true);
    expect(hasContractNumberMaintenanceAccess('999999-其他人')).toBe(false);
    expect(() => getContractNumberMaintenanceRows('999999-其他人')).toThrow('无合约号码维护权限');
    expect(() => updateContractNumberMaintenanceRow(
      getRow().id,
      editablePatch(getRow()),
      '999999-其他人',
    )).toThrow('无合约号码维护权限');
  });

  test('批量模板不提供合约号码和身份证号码字段并包含可编辑套餐内容', () => {
    expect(CONTRACT_NUMBER_BATCH_FIELDS).toHaveLength(14);
    expect(CONTRACT_NUMBER_BATCH_FIELDS.map((field) => field.header)).toEqual([
      '标签号', '使用公司', '责任人工号', '套餐内容',
      '合约开始日期', '合约结束日期', '金额', '号码状态', '仓库',
      '使用说明', '报废原因', '报废日期', '领用日期', '领用原因',
    ]);
    expect(CONTRACT_NUMBER_EDIT_FIELDS).not.toContain('contractNumber');
    expect(CONTRACT_NUMBER_EDIT_FIELDS).not.toContain('idCard');
    expect(CONTRACT_NUMBER_BATCH_FIELDS.map((field) => field.header)).not.toContain('身份证号码');
  });

  test('批量空白字段保留原值，套餐内容可编辑且合约号码不变', () => {
    const row = getRow('contract-number-2');
    const batchRows = [batchLine(row, {
      '套餐内容': '批量更新的套餐',
      '合约号码': '13800138001',
    })];
    const validation = validateContractNumberBatchRows(batchRows);
    expect(validation.status).toBe('passed');

    const result = batchUpdateContractNumberMaintenanceRows(batchRows, undefined, validation.versions);
    expect(result.status).toBe('passed');
    const saved = result.rows.find((item) => item.id === row.id);
    expect(saved.packageContent).toBe('批量更新的套餐');
    expect(saved.contractNumber).toBe(row.contractNumber);
    expect(saved.useCompany).toBe(row.useCompany);
  });

  test('批量导入不允许修改合约号码，可更新套餐内容', () => {
    const row = getRow('contract-number-2');
    const batchRows = [batchLine(row, { '合约号码': '13800138001', '套餐内容': '导入后的套餐' })];
    const validation = validateContractNumberBatchRows(batchRows);
    expect(validation.status).toBe('passed');
    const result = batchUpdateContractNumberMaintenanceRows(batchRows, undefined, validation.versions);
    expect(result.status).toBe('passed');
    const saved = result.rows.find((item) => item.id === row.id);
    expect(saved.contractNumber).toBe(row.contractNumber);
    expect(saved.packageContent).toBe('导入后的套餐');
  });

  test('批量任一行失败时整批不保存', () => {
    const first = getRow('contract-number-2');
    const second = getRow('contract-number-3');
    const batchRows = [
      batchLine(first, { rowNo: 2, '使用说明': '本行原本可成功' }),
      batchLine(second, { rowNo: 3, '号码状态': '不存在状态' }),
    ];
    const validation = validateContractNumberBatchRows(batchRows);
    expect(validation.status).toBe('failed');

    const result = batchUpdateContractNumberMaintenanceRows(batchRows);
    expect(result.status).toBe('failed');
    expect(getRow(first.id).usageDescription).toBe(first.usageDescription);
  });

  test('批量校验后号码被修改时保存必须重新校验版本', () => {
    const row = getRow('contract-number-2');
    const batchRows = [batchLine(row, { '使用说明': '批量待保存值' })];
    const validation = validateContractNumberBatchRows(batchRows);
    expect(validation.status).toBe('passed');

    updateContractNumberMaintenanceRow(row.id, editablePatch(row, { usageDescription: '并发修改值' }));
    const result = batchUpdateContractNumberMaintenanceRows(batchRows, undefined, validation.versions);
    expect(result.status).toBe('failed');
    expect(result.errors[0].reason).toBe('号码信息已发生变化，请重新校验');
  });
});