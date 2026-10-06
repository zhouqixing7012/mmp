// 汇总直接取当前快照两类清单；未包含资产不属于已生成快照。
export function calculateInventorySnapshotStats(executionRows, notExecutionRows) {
  const sum = (rows) => rows.reduce((total, row) => total + Number(row.quantity), 0);
  const execution = sum(executionRows);
  const notExecution = sum(notExecutionRows);
  const counted = sum(executionRows.filter((row) => ['已盘', '代盘'].includes(row.inventoryStatus)));
  return {
    total: execution + notExecution,
    execution,
    notExecution,
    counted,
    uncounted: sum(executionRows.filter((row) => ['未盘', '报失', '盘亏'].includes(row.inventoryStatus))),
    lost: sum(executionRows.filter((row) => row.inventoryStatus === '盘亏')),
    rate: execution ? Number((counted / execution * 100).toFixed(1)) : 0,
  };
}
