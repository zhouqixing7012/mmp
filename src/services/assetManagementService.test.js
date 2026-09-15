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

  test('真实序列号必须唯一', () => {
    const row = getRow('consumable-1');
    const duplicate = getRow('consumable-2');
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { serialNumber: duplicate.serialNumber })))
      .toThrow('序列号不唯一');
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
    }))).toThrow('当前仓库不属于所选公司');
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

  test('Building 必须属于当前 City', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      city: '北京',
      building: '天津飞狐办公区',
    }))).toThrow('Building不能为空且必须属于当前 City');
  });

  test('Floor 必须属于当前 Building', () => {
    const row = getRow();
    expect(() => updateConsumableMaintenanceRow(row.id, editablePatch(row, { floor: '5F' })))
      .toThrow('当前 Floor 与 Building 关系无效');
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

  test('主资产说明不信任前端伪造值', () => {
    const row = getRow();
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      mainTag: '114111700922',
      mainAssetDesc: '伪造说明',
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.mainAssetDesc).toBe('服务器.Dell PowerEdge R740');
  });

  test('责任人姓名不信任前端伪造值', () => {
    const row = getRow('consumable-1');
    const targetOwner = getRow('consumable-2');
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      ownerId: targetOwner.ownerId,
      ownerName: '伪造姓名',
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

  test('单条编辑启用日期留空时不能直接写成空值', () => {
    const row = getRow();
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row, {
      enabledDate: '',
      remarks: '触发保存',
    }));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.enabledDate).toBe(row.enabledDate);
  });

  test('无实际变化时不生成新的操作历史', () => {
    const row = getRow();
    const beforeCount = row.transactionHistory.length;
    const nextRows = updateConsumableMaintenanceRow(row.id, editablePatch(row));
    const saved = nextRows.find((item) => item.id === row.id);
    expect(saved.transactionHistory).toHaveLength(beforeCount);
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
