// 汇总直接取当前快照两类清单；未包含资产不属于已生成快照。
export function calculateInventorySnapshotStats(executionRows, notExecutionRows) {
  // 盘点计数按资产卡片条数，不累加卡片数量字段。
  const sum = (rows) => rows.length;
  const execution = sum(executionRows);
  const notExecution = sum(notExecutionRows);
  const counted = sum(executionRows.filter((row) => ['已盘', '代盘'].includes(row.inventoryStatus)));
  return {
    total: execution + notExecution,
    execution,
    notExecution,
    counted,
    uncounted: execution - counted,
    rate: execution ? Number((counted / execution * 100).toFixed(1)) : 0,
  };
}
