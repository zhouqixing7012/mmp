// 仅测试替代浏览器IndexedDB，不替代照片保存/读取业务函数。
export function installInventoryPhotoIndexedDb() {
  const records = new Map();
  let failWrite = false;
  let sequence = 0;
  const db = {
    createObjectStore: jest.fn(), close: jest.fn(),
    transaction: (_store, mode) => {
      const transaction = { objectStore: () => ({
        add: record => { const request = {}; queueMicrotask(() => { if (failWrite) transaction.onerror?.(); else { request.result = ++sequence; records.set(request.result, record); transaction.oncomplete?.(); } }); return request; },
        get: id => { const request = {}; queueMicrotask(() => { request.result = records.get(id); request.onsuccess?.(); }); return request; },
      }) };
      return transaction;
    },
  };
  Object.defineProperty(window, 'indexedDB', { configurable: true, value: { open: () => { const request = {}; queueMicrotask(() => { request.result = db; request.onsuccess?.(); }); return request; } } });
  URL.createObjectURL = jest.fn(blob => 'blob:' + blob.name);
  URL.revokeObjectURL = jest.fn();
  return { records, failWrites: () => { failWrite = true; } };
}
