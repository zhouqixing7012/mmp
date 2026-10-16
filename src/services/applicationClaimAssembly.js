// 原申请、明细、子单和出库分别关联；审批记录以真实记录标识区分多人及重复办理。
export function assembleClaimRows({ applications, originalLines, subOrders, summaries, outbounds, flowRecords, externalFlows }) {
  const flows = ids => {
    const seen = new Set();
    return ids.flatMap(id => flowRecords.filter(row => row.documentId === id)
      .slice().sort((a, b) => String(a.sequence).length - String(b.sequence).length || String(a.sequence).localeCompare(String(b.sequence)) || String(a.time || '').localeCompare(String(b.time || ''))))
      .filter(row => { if (!row.id) throw new Error('审批记录缺少唯一标识'); if (seen.has(row.id)) return false; seen.add(row.id); return true; });
  };
  return originalLines.flatMap(originalLine => {
    const application = applications.find(row => row.id === originalLine.applicationId);
    if (!application) throw new Error('申请明细缺少原申请');
    const matches = subOrders.filter(row => row.originalLineId === originalLine.id);
    return (matches.length ? matches : [null]).flatMap(sub => {
      const summary = sub && summaries.find(row => row.id === sub.summaryId);
      const selectedSummary = sub?.statusCode === '3' && summary?.statusCode === '5' ? null : summary;
      const purchaseResult = summary?.detail.lines.find(line => line.originalLineId === originalLine.id);
      const sourceId = selectedSummary?.id || sub?.id || application.id;
      const outboundMatches = outbounds.filter(row => row.subOrderId === sub?.id && row.originalLineId === originalLine.id);
      return (outboundMatches.length ? outboundMatches : [null]).map(outbound => {
        const values = { ...application.values, subNo: selectedSummary?.number || sub?.number || '', subType: sub?.type === 'USE' ? '领用' : sub?.type === 'PURCHASE' ? '采购' : '', estimatedAmount: sub?.type === 'PURCHASE' ? originalLine.unitPrice * originalLine.originalQuantity : null,
          outboundNo: outbound?.number || '', outboundAt: outbound?.date || '', receivedQuantity: outbound?.quantity ?? '', summaryApplicant: selectedSummary?.applicant || '',
          purchaseApplicationNo: summary?.purchaseApplicationNo || '', purchaseApplicationStatus: summary?.purchaseApplicationStatus || '', poNo: summary?.poNo || '', poStatus: summary?.poStatus || '', actualPurchaseAmount: purchaseResult?.actualPurchaseAmount ?? '', completedAt: summary?.completedAt || '' };
        const history = flows([application.id, ...(sub ? [sub.id] : []), ...(summary ? [summary.id] : [])]);
        const sourceHistory = flows([sourceId]);
        const lastSequence = sourceHistory.length ? String(sourceHistory[sourceHistory.length - 1].sequence) : null;
        const active = lastSequence === null ? [] : sourceHistory.filter(row => String(row.sequence) === lastSequence);
        const nodes = [...new Set(active.map(row => row.node === '等待' ? '待汇总' : row.node))];
        const approvers = active.filter(row => row.node !== '等待' && row.approver);
        approvers.forEach(row => { if (!row.account) throw new Error('当前审批记录缺少明确的审批人账号'); });
        const optionLabels = Object.fromEntries(approvers.map(row => [row.account, row.approver]));
        values.node = nodes.join('、'); values.approver = [...new Set(approvers.map(row => row.approver))].join('、');
        return { ...application, id: [originalLine.id, sub?.id || 'original', outbound?.id || 'no-outbound'].join(':'), originalLineId: originalLine.id,
          values, filters: { ...application.filters, ...values, statusCode: application.statusCode, node: nodes, approver: [...new Set(approvers.map(row => row.account))], overStandard: application.filters.overStandard, formalEmployee: application.filters.formalEmployee, applicant: application.filters.applicant, department: application.filters.department, summaryApplicant: selectedSummary?.account || '', subType: sub?.type || '' },
          optionLabels: { ...application.optionLabels, approver: optionLabels },
          head: { ...application.head, '当前仓库': sub?.type === 'PURCHASE' ? '' : application.head['当前仓库'], '出库单号': values.outboundNo },
          originalQuantity: originalLine.originalQuantity, unitPrice: originalLine.unitPrice, executedQuantity: originalLine.line.quantity, lines: [originalLine.line],
          history, historyPrepared: true, summary: summary?.detail || null,
          progressSections: (summary ? externalFlows.filter(row => row.summaryId === summary.id) : []).map(section => ({ ...section, records: section.records.map(row => ({ ...row })) })),
          showFlowGraph: application.kind === 'consumable' && sub?.type === 'USE',
          progressTitle: sub && (application.kind === 'asset' || sub.type === 'PURCHASE') ? '资产申请详情（此信息来源于资产系统）' : '' };
      });
    });
  });
}
