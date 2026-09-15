import {
  CONTRACT_NUMBER_EDIT_FIELDS,
  getContractNumberMaintenanceRows,
  updateContractNumberMaintenanceRow,
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

  test('身份证号码不允许直接提交修改', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { idCard: '110101199901019999' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('副卡和维修记录不在单条维护白名单中', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { secondaryCard: '伪造副卡' }))
      .toThrow('合约号码维护存在不允许修改的字段');
    expect(() => updateContractNumberMaintenanceRow(row.id, { maintenanceRecord: '伪造维修记录' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('子公司和领用日期不能直接提交修改', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, { subsidiary: '伪造子公司' }))
      .toThrow('合约号码维护存在不允许修改的字段');
    expect(() => updateContractNumberMaintenanceRow(row.id, { claimDate: '2099-01-01' }))
      .toThrow('合约号码维护存在不允许修改的字段');
  });

  test('合约号码必须满足PRD的11位手机号规则', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { contractNumber: '12345678901' })))
      .toThrow('合约号码必须为有效的11位手机号');
  });

  test('合约号码自动去除首尾空格但保留号码内容', () => {
    const row = getRow();
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { contractNumber: ' 13800138001 ' }));
    expect(nextRows.find((item) => item.id === row.id).contractNumber).toBe('13800138001');
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

  test('责任人姓名部门子公司职级身份证以系统主数据为准', () => {
    const row = getRow('contract-number-2');
    const targetOwner = getRow('contract-number-3');
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, {
      ownerId: targetOwner.ownerId,
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.ownerName).toBe(targetOwner.ownerName);
    expect(saved.department).toBe(targetOwner.department);
    expect(saved.subsidiary).toBe(targetOwner.subsidiary);
    expect(saved.jobLevel).toBe(targetOwner.jobLevel);
    expect(saved.idCard).toBe(targetOwner.idCard);
  });

  test('不存在的责任人不能保存', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { ownerId: 'UNKNOWN' })))
      .toThrow('责任人不能为空且必须有效');
  });

  test('使用公司编码由系统重新推导', () => {
    const row = getRow('contract-number-2');
    const target = getRow('contract-number-5');
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { useCompany: target.useCompany }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.useCompanyCode).toBe(target.useCompanyCode);
  });

  test('不存在的使用公司不能保存', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { useCompany: '不存在公司' })))
      .toThrow('使用公司不能为空且必须有效');
  });

  test('领用原因只能使用管理员配置业务值', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { claimReason: '随便填写' })))
      .toThrow('领用原因无效');
  });

  test('备注最多120字', () => {
    const row = getRow();
    expect(() => updateContractNumberMaintenanceRow(row.id, editablePatch(row, { remarks: 'A'.repeat(121) })))
      .toThrow('备注最多120字');
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
    const nextRows = updateContractNumberMaintenanceRow(row.id, editablePatch(row, { remarks: '测试维护历史' }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.remarks).toBe('测试维护历史');
    expect(saved.updatedAt).not.toBe(row.updatedAt);
    expect(saved.transactionHistory).toHaveLength(historyCount + 1);
    expect(saved.transactionHistory[saved.transactionHistory.length - 1].source).toBe('合约号码台账维护');
  });
});
