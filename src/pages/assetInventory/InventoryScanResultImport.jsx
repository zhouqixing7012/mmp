import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Modal, Space, Table, Typography } from 'antd';
import * as XLSX from 'xlsx';
import { importInventoryScanResults, inventoryScanErrorsWorkbook, inventoryScanImporter, inventoryScanResultImportBlockReason, readInventoryScanWorkbook } from './inventoryScanResultImport';

const contextKey = context => { const person = inventoryScanImporter(context.operator); return `${context.project?.projectNo}:${context.plan?.key || context.plan?.planNo || context.entryType || ''}:${person.employeeNo || person.value || person.name}`; };

export default function InventoryScanResultImport({ project, plan, plans, operator, assets, entryType, onImported }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const inputRef = useRef(null);
  const session = useRef(0);
  const mounted = useRef(true);
  const processing = useRef(false);
  const current = useRef(null);
  current.current = { project, plan, plans, operator, assets, entryType, onImported };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; session.current += 1; }; }, []);
  const close = () => { session.current += 1; processing.current = false; setBusy(false); setOpen(false); };
  const importFile = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || processing.current) return;
    const id = session.current;
    const original = contextKey(current.current);
    processing.current = true; setBusy(true); setOutcome(null);
    try {
      if (!/\.(xlsx|xls)$/i.test(file.name)) throw new Error('请选择xlsx或xls扫描结果Excel文件');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', raw: true, cellNF: true });
      if (!mounted.current || id !== session.current) return;
      if (contextKey(current.current) !== original) throw new Error('当前项目、计划或导入人已变化，请重新选择文件');
      const entries = readInventoryScanWorkbook(workbook);
      const result = importInventoryScanResults(entries, current.current);
      setOutcome(result);
      if (result.success) {
        try { current.current.onImported?.(result.updates); }
        catch (error) { setOutcome({ ...result, refreshError: '结果已保存，页面刷新失败，请重新进入本清单查看' }); }
      }
    } catch (error) {
      if (mounted.current && id === session.current) setOutcome({ success: false, errors: [{ sheet: '', row: '', assetTag: '', reason: error.message || 'Excel读取失败，请核对文件后重试' }], updates: [] });
    } finally {
      if (mounted.current && id === session.current) { processing.current = false; setBusy(false); }
    }
  };
  const blocked = inventoryScanResultImportBlockReason(current.current);
  return <>
    {!blocked && <Button onClick={() => { session.current += 1; setOutcome(null); setOpen(true); }}>导入盘点结果</Button>}
    <Modal open={open} title="扫描结果导入" onCancel={close} width={850} footer={<Space>
      {outcome?.errors?.length > 0 && <Button onClick={() => XLSX.writeFile(inventoryScanErrorsWorkbook(outcome.errors), `${project.projectNo}-扫描结果导入错误.xlsx`)}>下载错误结果</Button>}
      <Button type="primary" disabled={busy || Boolean(blocked)} loading={busy} onClick={() => inputRef.current?.click()}>选择Excel文件</Button>
      <Button onClick={close}>返回</Button>
    </Space>}>
      <Space direction="vertical" className="w-full" size={16}>
        <Typography.Text>遍历Excel全部工作表并跳过每张表第一行；A列为资产标签号，B列为盘点备注。任一行校验失败，本批次均不保存。</Typography.Text>
        <input hidden ref={inputRef} type="file" accept=".xlsx,.xls" aria-label="扫描结果Excel文件" onChange={importFile} />
        {blocked && <Alert type="warning" showIcon title={blocked} />}
        {outcome?.refreshError && <Alert type="warning" showIcon title={outcome.refreshError} />}
        {outcome?.success && <Alert type="success" showIcon title={`已导入 ${outcome.updates.length} 条扫描结果`} />}
        {outcome && !outcome.success && <>
          <Alert type="error" showIcon title="扫描结果导入失败，本批次未保存" />
          <Table size="small" rowKey={(_, index) => index} dataSource={outcome.errors} pagination={{ pageSize: 10 }} columns={[
            { title: '工作表', dataIndex: 'sheet' }, { title: '行号', dataIndex: 'row', width: 80 },
            { title: '资产标签号', dataIndex: 'assetTag' }, { title: '错误原因', dataIndex: 'reason' },
          ]} />
        </>}
      </Space>
    </Modal>
  </>;
}
