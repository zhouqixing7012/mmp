import { INVENTORY_PROJECT_NUMBER_KEY, reserveInventoryProjectNumber } from './inventoryProjectNumberAllocator';

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

test('连续创建及重新进入均不复用编号，类型和日期分别流水', () => {
  expect(reserveInventoryProjectNumber('复盘', [], '20261025')).toBe('RCP-202610250001');
  expect(reserveInventoryProjectNumber('复盘', [], '20261025')).toBe('RCP-202610250002');
  expect(reserveInventoryProjectNumber('初盘', [], '20261025')).toBe('CP-202610250001');
  expect(reserveInventoryProjectNumber('抽盘', [], '20261025')).toBe('DCP-202610250001');
  expect(reserveInventoryProjectNumber('复盘', [], '20261026')).toBe('RCP-202610260001');
});

test('避开种子、历史审批/快照/计划会话及关闭项目占用，不改历史数据', () => {
  localStorage.setItem('inventory-plan-session:RCP-20261025-0004:员工', 'original');
  localStorage.setItem('inventory-replay-review-RCP-20261025-0007', 'approval');
  localStorage.setItem('asset-inventory-photo-snapshot:RCP-20261025-0006:config', 'photos');
  sessionStorage.setItem('assetInventoryClosedProjectNos', JSON.stringify(['RCP-20261025-0008']));
  expect(reserveInventoryProjectNumber('复盘', [{ projectNo: 'RCP-20261025-0003' }], '20261025')).toBe('RCP-202610250009');
  expect(localStorage.getItem('inventory-replay-review-RCP-20261025-0007')).toBe('approval');
});

test('损坏预留、流水号用尽与写入失败均拒绝，不伪造兜底号', () => {
  localStorage.setItem(INVENTORY_PROJECT_NUMBER_KEY, '{');
  expect(() => reserveInventoryProjectNumber('复盘', [], '20261025')).toThrow('预留失败');
  localStorage.clear();
  expect(() => reserveInventoryProjectNumber('复盘', ['RCP-20261025-9999'], '20261025')).toThrow('流水号已用尽');
  const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('无法保存'); });
  expect(() => reserveInventoryProjectNumber('复盘', [], '20261025')).toThrow('无法保存');
  write.mockRestore();
});


test('兼容旧预留与新格式历史编号，日期与流水之间不加横杠', () => {
  localStorage.setItem(INVENTORY_PROJECT_NUMBER_KEY, JSON.stringify({ 'RCP-20261025-': 10 }));
  localStorage.setItem('asset-inventory-photo-snapshot:RCP-202610250012:config', 'photos');
  expect(reserveInventoryProjectNumber('复盘', ['RCP-20261025-0009', 'RCP-202610250011'], '20261025')).toBe('RCP-202610250013');
  expect(reserveInventoryProjectNumber('复盘', [], '20261025')).toBe('RCP-202610250014');
});
