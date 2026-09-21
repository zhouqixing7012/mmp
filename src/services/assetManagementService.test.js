import {
  getConsumableMaintenanceRows,
  updateConsumableMaintenanceRow,
} from './assetManagementService';
import { CONSUMABLE_MAINTENANCE_STORAGE_KEY } from '../mock/consumableMaintenanceMock';

function getRow(id = 'consumable-1') {
  return getConsumableMaintenanceRows().find((row) => row.id === id);
}

function editablePatch(row, overrides = {}) {
  return {
    company: row.company,
    serialNumber: row.serialNumber,
    status: row.status,
    ownerId: row.ownerId,
    ownerName: row.ownerName,
    city: row.city,
    building: row.building,
    floor: row.floor,
    enabledDate: row.enabledDate,
    mainTag: row.mainTag,
    mainAssetDesc: row.mainAssetDesc,
    warehouse: row.warehouse,
    usageDescription: row.usageDescription,
    remarks: row.remarks,
    ...overrides,
  };
}

describe('耗材维护保存边界', () => {
  beforeEach(() => {
    window.localStorage.removeItem(CONSUMABLE_MAINTENANCE_STORAGE_KEY);
  });

  afterEach(() => {
    window.localStorage.removeItem(CONSUMABLE_MAINTENANCE_STORAGE_KEY);
  });

  test('禁止通过接口修改只读字段', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, { quantity: 999 }))
      .toThrow('耗材维护存在不允许修改的字段');
  });

  test('禁止客户端伪造最后修改时间', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      updatedAt: '2099-01-01 00:00:00',
    }))).toThrow('耗材维护存在不允许修改的字段');
  });

  test('真实序列号必须唯一', () => {
    const row = getRow('consumable-1');
    const duplicate = getRow('consumable-2');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { serialNumber: duplicate.serialNumber })))
      .toThrow('序列号不唯一');
  });

  test('序列号唯一性比较忽略大小写和首尾空格但不改写原输入大小写', () => {
    const row = getRow('consumable-1');
    const duplicate = getRow('consumable-2');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      serialNumber: `  ${String(duplicate.serialNumber).toLowerCase()}  `,
    }))).toThrow('序列号不唯一');

    const mixedCase = 'Sn-Mixed-Case-001';
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, { serialNumber: mixedCase }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.serialNumber).toBe(mixedCase);
  });

  test('缺省序列号不参与唯一性冲突', () => {
    const row = getRow('consumable-1');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { serialNumber: '缺省' })))
      .not.toThrow();
  });

  test('公司变更后禁止保留跨公司的旧仓库', () => {
    const row = getRow('consumable-1');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      company: '天津飞狐',
      city: '天津',
      building: '天津飞狐办公区',
      floor: '5F',
      warehouse: 'WH001.北京耗材仓',
    }))).toThrow('当前仓库不符合公司、启用状态或仓库用途规则');
  });

  test('停用耗材仓不能作为新选择保存', () => {
    const row = getRow('consumable-1');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      warehouse: 'WH005.停用耗材仓',
    }))).toThrow('当前仓库不符合公司、启用状态或仓库用途规则');
  });

  test('仓库用途非 IU0001 或 IU0003 时不能作为新选择保存', () => {
    const row = getRow('consumable-1');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      warehouse: 'WH006.普通仓库',
    }))).toThrow('当前仓库不符合公司、启用状态或仓库用途规则');
  });

  test('公司未变化时允许保留历史已保存但退出候选的仓库', () => {
    const row = getRow('consumable-1');
    const storageRows = getConsumableMaintenanceRows().map((item) => (
      item.id === row.id ? { ...item, warehouse: 'WH-LEGACY.历史仓库' } : item
    ));
    window.localStorage.setItem(CONSUMABLE_MAINTENANCE_STORAGE_KEY, JSON.stringify(storageRows));
    const legacyRow = getRow(row.id);

    expect(() => updateConsumableMaintenanceRow(legacyRow.id, editablePatch(legacyRow, {
      remarks: '只修改备注',
    }))).not.toThrow();
  });

  test('历史仓库不能被伪装成新选择值绕过公司校验', () => {
    const row = getRow('consumable-1');
    const storageRows = getConsumableMaintenanceRows().map((item) => (
      item.id === row.id ? { ...item, warehouse: 'WH-LEGACY.历史仓库' } : item
    ));
    window.localStorage.setItem(CONSUMABLE_MAINTENANCE_STORAGE_KEY, JSON.stringify(storageRows));
    const legacyRow = getRow(row.id);

    expect(() => updateConsumableMaintenanceRow(legacyRow.id, editablePatch(legacyRow, {
      company: '天津飞狐',
      city: '天津',
      building: '天津飞狐办公区',
      floor: '5F',
      warehouse: 'WH-LEGACY.历史仓库',
    }))).toThrow('当前仓库不符合公司、启用状态或仓库用途规则');
  });

  test('Building 必须属于当前 City', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      city: '北京',
      building: '天津飞狐办公区',
    }))).toThrow('Building不能为空且必须属于当前 City');
  });

  test('Floor 从全部启用 Floor 中选择，不要求属于当前 Building', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { floor: '5F' })))
      .not.toThrow();
  });

  test('未启用或不存在的 Floor 不能保存', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { floor: '99F' })))
      .toThrow('当前 Floor 无效或未启用');
  });

  test('非法启用日期不能保存', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { enabledDate: '2026-02-31' })))
      .toThrow('启用日期格式无效');
  });

  test('普通耗材不能通过维护直接改成报废', () => {
    const row = getRow('consumable-1');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { status: '已报废' })))
      .toThrow('资产状态为报废请走报废功能处理');
  });

  test('已报废耗材不能通过维护恢复正常状态', () => {
    const row = getRow('consumable-10');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { status: '在用' })))
      .toThrow('已报废耗材状态不允许通过耗材维护修改');
  });

  test('主资产不得关联自身', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { mainTag: row.tag })))
      .toThrow('主资产标签号不得关联自身');
  });

  test('不存在的主资产不能保存', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { mainTag: 'NOT-EXISTS' })))
      .toThrow('主资产标签号无效');
  });

  test('已报废主资产不能建立新关联', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { mainTag: '114111700966' })))
      .toThrow('已报废主资产不允许关联');
  });

  test('主资产责任人必须与当前耗材责任人一致', () => {
    const row = getRow('consumable-1');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      mainTag: '114111700922',
    }))).toThrow('主资产责任人与当前耗材责任人不一致');
  });

  test('主资产说明不信任前端伪造值', () => {
    const row = getRow('consumable-1');
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      mainTag: '114111700955',
      mainAssetDesc: '伪造说明',
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.mainAssetDesc).toBe('台式机.Dell OptiPlex 7090');
  });

  test('解除主资产关联时同时清空主资产说明', () => {
    const row = getRow('consumable-6');
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      mainTag: '',
      mainAssetDesc: '试图残留的伪造说明',
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.mainTag).toBe('');
    expect(saved.mainAssetDesc).toBe('');
  });

  test('责任人姓名不信任前端伪造值', () => {
    const row = getRow('consumable-1');
    const targetOwner = getRow('consumable-2');
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      ownerId: targetOwner.ownerId,
      ownerName: '伪造姓名',
      mainTag: '',
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.ownerName).toBe(targetOwner.ownerName);
    expect(saved.department).toBe(targetOwner.department);
  });

  test('不存在的责任人不能保存', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { ownerId: 'UNKNOWN' })))
      .toThrow('责任人不能为空且必须有效');
  });

  test('单条编辑启用日期留空时按购买日期重新计算', () => {
    const row = getRow();
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      enabledDate: '',
      remarks: '触发启用日期重算',
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(row.purchaseDate).toBe('2026-01-15');
    expect(saved.enabledDate).toBe('2026-01-15');
  });

  test('购买日期在26日及之后时启用日期重算为下月1日', () => {
    const row = getRow();
    const storageRows = getConsumableMaintenanceRows().map((item) => (
      item.id === row.id
        ? { ...item, purchaseDate: '2026-01-26', enabledDate: '2026-01-26' }
        : item
    ));
    window.localStorage.setItem(CONSUMABLE_MAINTENANCE_STORAGE_KEY, JSON.stringify(storageRows));
    const target = getRow(row.id);

    const nextRows = updateConsumableMaintenanceRow(target.id, editablePatch(target, {
      enabledDate: '',
      remarks: '触发跨月启用日期重算',
    }));
    const saved = nextRows.find((item) => item.id === target.id);
    expect(saved.enabledDate).toBe('2026-02-01');
  });

  test('不存在的耗材 id 不得静默成功', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow('NOT-EXISTS', editablePatch(row)))
      .toThrow('耗材标签号不存在');
  });

  test('无实际变化时不生成新的操作历史', () => {
    const row = getRow();
    const beforeCount = row.transactionHistory.length;
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.transactionHistory).toHaveLength(beforeCount);
    expect(saved.updatedAt).toBe(row.updatedAt);
  });

  test('实际变化时生成操作历史并更新最后修改时间', () => {
    const row = getRow();
    const beforeCount = row.transactionHistory.length;
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, { remarks: '对抗性测试修改' }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.transactionHistory).toHaveLength(beforeCount + 1);
    expect(saved.remarks).toBe('对抗性测试修改');
    expect(saved.updatedAt).not.toBe(row.updatedAt);
  });
});
