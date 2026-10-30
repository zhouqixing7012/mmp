// Transactional mock numbers follow existing project samples PR2608170005 / PO2608210004.
// This is a prototype allocator, not the procurement system's production numbering service.
const allocated = new Map(), counters = new Map();
export function mockProcurementNumber(type, id, date) {
  if (!['PR', 'PO'].includes(type)) throw new Error('采购编号类型必须是PR或PO');
  const day = String(date).slice(0, 10).replaceAll('-', '');
  if (!/^\d{8}$/.test(day)) throw new Error('采购演示编号日期无效');
  const pool = type + day, key = pool + ':' + id;
  if (allocated.has(key)) return allocated.get(key);
  const serial = (counters.get(pool) || 0) + 1;
  if (serial > 9999) throw new Error('采购演示编号流水已满');
  const value = type + day.slice(2) + String(serial).padStart(4, '0');
  counters.set(pool, serial); allocated.set(key, value);
  return value;
}
