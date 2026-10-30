import React, { forwardRef, useMemo } from 'react';
import { Table } from 'antd';
import { alignTableColumns } from './columnAlignment';

const AlignedTable = forwardRef(function AlignedTable({ columns, preserveColumnAlignment = false, ...props }, ref) {
  const aligned = useMemo(() => alignTableColumns(columns, preserveColumnAlignment), [columns, preserveColumnAlignment]);
  return <Table {...props} ref={ref} columns={aligned} />;
});
['Summary', 'Column', 'ColumnGroup', 'SELECTION_ALL', 'SELECTION_INVERT', 'SELECTION_NONE', 'SELECTION_COLUMN', 'EXPAND_COLUMN'].forEach(key => {
  AlignedTable[key] = Table[key];
});
export default AlignedTable;
