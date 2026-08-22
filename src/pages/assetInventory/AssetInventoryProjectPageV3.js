import React from 'react';
import AssetInventoryProjectPageV2 from './AssetInventoryProjectPageV2';
import { AssetInventoryVariantProvider } from './AssetInventoryVariantContext';

const V3_RANGES = ['库房', '公共', '员工'];

export default function AssetInventoryProjectPageV3() {
  return (
    <AssetInventoryVariantProvider allowedRanges={V3_RANGES}>
      <AssetInventoryProjectPageV2 variantLabel="方案三" />
    </AssetInventoryVariantProvider>
  );
}
