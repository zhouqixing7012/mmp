const DATABASE = 'asset-inventory-mobile-photos';
const STORE = 'photos';

function openPhotoDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('当前浏览器不支持照片存储，无法保存本次照片')); return; }
    const request = window.indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true }); };
    request.onerror = () => reject(new Error('照片存储打开失败，请保留当前页面并重试'));
    request.onblocked = () => reject(new Error('照片存储被其他页面占用，请关闭相关页面后重试'));
    request.onsuccess = () => resolve(request.result);
  });
}

// 原始照片只存一份Blob；业务结果仅保存照片标识和说明。
export async function saveCapturedInventoryPhoto(file, label) {
  const db = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const request = transaction.objectStore(STORE).add({ blob: file });
    transaction.oncomplete = () => { db.close(); resolve({ photoId: request.result, fileName: file.name, label }); };
    transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error('照片保存失败，请保留拍照内容后重试')); };
  });
}

export async function getCapturedInventoryPhoto(photoId) {
  const db = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(photoId);
    request.onsuccess = () => {
      db.close();
      if (!request.result?.blob) { reject(new Error('未找到本次照片，请重新拍摄')); return; }
      resolve(request.result.blob);
    };
    request.onerror = () => { db.close(); reject(new Error('照片读取失败，请重试')); };
  });
}
