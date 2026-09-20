export const WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY = 'mmp.warehouseWorkbench.employeePage.v1';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function readWarehouseEmployeePageContext() {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    storage.removeItem(WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY);
    return null;
  }
}

export function writeWarehouseEmployeePageContext(context) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(
    WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY,
    JSON.stringify({
      ...context,
      updatedAt: Date.now(),
    }),
  );
}

export function patchWarehouseEmployeePageContext(patch) {
  const current = readWarehouseEmployeePageContext() || {};
  const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch };
  writeWarehouseEmployeePageContext(next);
}

export function clearWarehouseEmployeePageContext() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(WAREHOUSE_EMPLOYEE_PAGE_STORAGE_KEY);
}
