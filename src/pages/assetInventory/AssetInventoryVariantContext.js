import React, { createContext, useContext } from 'react';

export const DEFAULT_INVENTORY_RANGES = ['库房', '公共', '机房', '员工'];

const AssetInventoryVariantContext = createContext({
  allowedRanges: DEFAULT_INVENTORY_RANGES,
});

export function AssetInventoryVariantProvider({ allowedRanges = DEFAULT_INVENTORY_RANGES, children }) {
  return (
    <AssetInventoryVariantContext.Provider value={{ allowedRanges }}>
      {children}
    </AssetInventoryVariantContext.Provider>
  );
}

export function useAssetInventoryVariant() {
  return useContext(AssetInventoryVariantContext);
}

export function isInventoryRangeAllowed(row, allowedRanges) {
  const range = row?.inventoryRange || row?.range;
  return !range || allowedRanges.includes(range);
}
