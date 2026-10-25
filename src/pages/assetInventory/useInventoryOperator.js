import { useSyncExternalStore } from 'react';
import { readDemoData, writeDemoData } from '../../services/demoStorage';
import { INVENTORY_CREATORS } from './inventoryCreatorPermissions';

export const INVENTORY_OPERATOR_STORAGE_KEY = 'asset-inventory-demo-operator';
const CHANGED = 'asset-inventory-demo-operator-changed';
const defaultOperator = INVENTORY_CREATORS[0].value;

export function getInventoryOperator() {
  return readDemoData(INVENTORY_OPERATOR_STORAGE_KEY, defaultOperator);
}

export function setInventoryOperator(operator) {
  if (!INVENTORY_CREATORS.some(person => person.value === operator)) throw new Error('请选择现有盘点演示操作人');
  writeDemoData(INVENTORY_OPERATOR_STORAGE_KEY, operator);
  window.dispatchEvent(new Event(CHANGED));
}

function subscribe(listener) {
  window.addEventListener(CHANGED, listener);
  window.addEventListener('storage', listener);
  return () => { window.removeEventListener(CHANGED, listener); window.removeEventListener('storage', listener); };
}

// 复用盘点项目既有演示身份；正式登录态及服务端授权尚未接入。
export function useInventoryOperator() {
  return [useSyncExternalStore(subscribe, getInventoryOperator, () => defaultOperator), setInventoryOperator];
}
