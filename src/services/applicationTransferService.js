import dayjs from 'dayjs';
import { applicationTransferStore } from '../mock/businessRulesMock';

const copy = value => JSON.parse(JSON.stringify(value));
const required = (value, label) => { if (value === undefined || value === null || value === '') throw new Error('请填写' + label); };
export function createApplicationTransferService(store = applicationTransferStore) {
  const refs = store.references;
  const person = id => refs.people.find(row => row.id === id);
  const assertDraft = order => { if (!order || order.status !== '草稿') throw new Error('仅草稿转移单可编辑'); };
  const readOrder = (state, id) => { const order = state.orders.find(row => row.id === id); if (!order) throw new Error('转移单不存在'); return order; };
  const eligible = (asset, company, orderId) => asset.company === company && ['3', '6', '7', '8'].includes(asset.statusCode) && (!asset.lock || asset.lock === orderId);
  const references = () => copy(refs);
  const list = (filters = {}) => store.read().orders.filter(order => {
    if (order.type !== 'ASSETS_TRANSFER_ORDER' || (order.migrationValid && order.migrationValid !== 'Y')) return false;
    if (['number', 'remarks', 'company', 'creator', 'status'].some(key => filters[key] && !String(order[key]).includes(filters[key]))) return false;
    const [start, end] = filters.dateRange || [];
    if (start && order.createdAt < start + ' 00:00:00') return false;
    if (end && order.createdAt > end + ' 23:59:59') return false;
    const detailKeys = { sourceDepartment: 'department', targetDepartment: 'department', sourceBuilding: 'building', targetBuilding: 'building', plate: 'plate' };
    return !Object.entries(detailKeys).some(([filter]) => filters[filter]) || order.details.some(detail => Object.entries(detailKeys).every(([filter, key]) => !filters[filter] || detail[key] === filters[filter]));
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(order => ({ ...copy(order), totalQuantity: order.details.reduce((sum, detail) => sum + Number(detail.quantity || 0), 0) }));
  const get = id => copy(readOrder(store.read(), id));
  const create = () => ({ id: '', number: '', applicationNo: '', type: 'ASSETS_TRANSFER_ORDER', migrationValid: 'Y', company: refs.currentUser.company, creator: refs.currentUser.id, createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'), status: '草稿', remarks: '', details: [], revision: 0 });
  const assets = (company, orderId = '') => copy(store.read().assets.filter(asset => eligible(asset, company, orderId)));
  const newDetail = assetId => {
    const asset = store.read().assets.find(row => row.id === assetId);
    if (!asset) throw new Error('资产不存在');
    return { id: 'detail-' + asset.id, assetId, tag: asset.tag, serial: asset.serial, material: copy(asset.material), company: asset.company, original: copy(asset), quantity: asset.quantity, recipient: '', department: '', plate: '', costCenter: '', city: '', building: '', floor: '', room: '', purpose: '', businessLine: '', project: '', reason: '', transferDate: dayjs().format('YYYY-MM-DD'), usageDescription: '', newSerial: '', newNoLocation: '', newService: '', newSubService: '' };
  };
  const selectRecipient = (detail, id) => {
    const target = person(id);
    if (!target) throw new Error('转入人不存在');
    return { ...detail, recipient: id, department: target.department, plate: target.plate, costCenter: target.costCenter, businessLine: target.businessLine || '0.*', project: target.project || '0.*', city: target.city, building: target.building, floor: target.floor };
  };
  const validateDetail = detail => {
    ['recipient', 'costCenter', 'city', 'building', 'floor', 'purpose', 'transferDate'].forEach((key, index) => required(detail[key], ['转入人', '转入成本中心', 'City', 'Building', 'Floor', '用途', '转移日期'][index]));
    if (!person(detail.recipient)) throw new Error('转入人不存在');
    if (!refs.purposes.includes(detail.purpose)) throw new Error('用途不在有效字典中');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(detail.transferDate) || dayjs(detail.transferDate).format('YYYY-MM-DD') !== detail.transferDate) throw new Error('转移日期无效');
    if (!refs.warehouses.some(row => row.status === '启用' && row.city === detail.city && row.building === detail.building && row.floor === detail.floor)) throw new Error('City、Building、Floor不属于有效地点');
    return copy(detail);
  };
  const save = input => {
    const state = store.read();
    required(input.company, '公司');
    if (!refs.warehouses.some(row => row.status === '启用' && row.company === input.company)) throw new Error('公司不在有效基础资料中');
    const previous = input.id ? readOrder(state, input.id) : null;
    if (previous) { assertDraft(previous); if (input.revision !== previous.revision) throw new Error('单据已更新，请重新打开'); }
    assertDraft(input);
    const details = input.details.filter(detail => detail.company === input.company);
    const seen = new Set();
    details.forEach(detail => {
      if (seen.has(detail.tag)) throw new Error('同一资产标签号不可重复'); seen.add(detail.tag);
      const asset = state.assets.find(row => row.id === detail.assetId);
      if (!asset || !eligible(asset, input.company, input.id)) throw new Error('资产状态、公司或锁定状态不允许转移');
      if (detail.tag !== asset.tag || Number(detail.quantity) !== Number(asset.quantity)) throw new Error('资产标签号或转移数量已改变');
      validateDetail(detail);
    });
    const sequence = state.nextNumber;
    const saved = { ...copy(input), id: input.id || 'transfer-order-' + sequence, number: input.number || 'ZY' + dayjs().format('YYYYMMDD') + String(sequence).padStart(4, '0'), details: details.map(detail => ({ ...copy(detail), original: copy(state.assets.find(asset => asset.id === detail.assetId)) })), revision: (previous?.revision || 0) + 1 };
    state.assets.forEach(asset => { if (asset.lock === saved.id) asset.lock = ''; });
    saved.details.forEach(detail => { state.assets.find(asset => asset.id === detail.assetId).lock = saved.id; });
    if (!previous) { state.orders.push(saved); state.nextNumber += 1; } else state.orders[state.orders.findIndex(row => row.id === input.id)] = saved;
    store.write(state); return copy(saved);
  };
  const removeDetail = (orderId, detailId) => {
    const state = store.read(); const order = readOrder(state, orderId); assertDraft(order);
    const detail = order.details.find(row => row.id === detailId); if (!detail) throw new Error('明细不存在');
    const asset = state.assets.find(row => row.id === detail.assetId); if (asset?.lock === order.id) asset.lock = '';
    order.details = order.details.filter(row => row.id !== detailId); order.revision += 1; store.write(state); return copy(order);
  };
  const remove = ids => {
    if (!ids.length) throw new Error('请选择转移单'); const state = store.read();
    ids.forEach(id => { if (readOrder(state, id).status === '已完成') throw new Error('已完成转移单不能删除'); });
    state.assets.forEach(asset => { if (ids.includes(asset.lock)) asset.lock = ''; });
    state.orders = state.orders.filter(order => !ids.includes(order.id)); store.write(state);
  };
  const execute = id => {
    const state = store.read(); const order = readOrder(state, id); assertDraft(order);
    if (!order.details.length) throw new Error('请添加转移明细');
    const seen = new Set();
    const changes = order.details.map(detail => {
      validateDetail(detail); if (seen.has(detail.tag)) throw new Error('同一资产标签号不可重复'); seen.add(detail.tag);
      const asset = state.assets.find(row => row.id === detail.assetId);
      if (!asset || asset.lock !== order.id || asset.company !== order.company) throw new Error('资产锁定状态已改变');
      const book = refs.plateBooks[detail.plate]; if (!book) throw new Error('转入板块未配置账簿');
      if (book !== asset.book) throw new Error('跨账簿不能执行转移');
      const financeExample = refs.explicitFinanceExamples.find(example => example.company === order.company
        && ['recipient', 'plate', 'costCenter', 'businessLine', 'project'].every(key => example[key] === detail[key]));
      if (!financeExample?.feeAccount) throw new Error('生成费用账户失败：当前组合未配置明确的演示结果');
      const feeAccount = financeExample.feeAccount;
      return { detail, asset, book, feeAccount };
    });
    const occurredAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    changes.forEach(({ detail, asset, book, feeAccount }) => {
      const before = copy(asset);
      Object.assign(asset, { owner: detail.recipient, department: detail.department, plate: detail.plate, costCenter: detail.costCenter, city: detail.city, building: detail.building, floor: detail.floor, room: detail.room, purpose: detail.purpose, businessLine: detail.businessLine, project: detail.project, usageDescription: detail.usageDescription, book, feeAccount, lock: '' });
      state.transactions.push({ id: order.id + '-' + asset.id, orderNo: order.number, tag: asset.tag, occurredAt, type: '资产转移', before, after: copy(asset) });
    });
    order.status = '已完成'; order.completedAt = occurredAt; order.revision += 1; store.write(state); return copy(order);
  };
  return { references, list, get, create, assets, newDetail, selectRecipient, validateDetail, save, removeDetail, remove, execute, transactions: () => copy(store.read().transactions) };
}
export const applicationTransferService = createApplicationTransferService();
