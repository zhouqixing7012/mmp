import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Modal, Space } from 'antd';
import Table from '../../components/tableAlignment/AlignedTable';
import * as XLSX from 'xlsx';
import { UNCOUNTED_HEADERS, uncountedImportBlockReason, parseUncountedImport, applyUncountedImport } from './inventoryUncountedImport';
export default function InventoryUncountedImport(props) {
  const current = useRef(props); current.current = props;
  const mounted = useRef(true); const input = useRef(null); const processing = useRef(false);
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [result, setResult] = useState(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (props.openRequest) { setResult(null); setOpen(true); } }, [props.openRequest]);
  const blocked = uncountedImportBlockReason({ ...props, operator: props.operator });
  const download = () => {
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([UNCOUNTED_HEADERS]), '未盘说明');
    XLSX.writeFile(book, '未盘说明导入模板.xlsx');
  };
  const importFile = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || processing.current) return;
    processing.current = true; setBusy(true); setResult(null);
    const source = `${current.current.project.projectNo}:${current.current.plan?.planNo || ''}`;
    try {
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('请选择xlsx、xls或csv文件');
      const book = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      if (!mounted.current) return;
      const latest = current.current;
      if (`${latest.project.projectNo}:${latest.plan?.planNo || ''}` !== source) throw new Error('项目或计划已变化，请重新导入');
      const reason = uncountedImportBlockReason(latest); if (reason) throw new Error(reason);
      if (!book.SheetNames.length) throw new Error('文件没有工作表');
      const outcome = parseUncountedImport(book.SheetNames.map(name => ({ name, rows: XLSX.utils.sheet_to_json(book.Sheets[name], { header: 1, defval: '', raw: false }) })), latest.assets);
      if (!outcome.errors.length && outcome.updates.length) {
        if (!latest.onAssetsChange) throw new Error('计划资产保存入口尚未接入');
        latest.onAssetsChange(assets => applyUncountedImport(assets, outcome.updates));
      }
      setResult(outcome);
    } catch (error) { if (mounted.current) setResult({ errors: [{ message: error.message }], updates: [] }); }
    finally { processing.current = false; if (mounted.current) setBusy(false); }
  };
  if (blocked) return null;
  return <>{!props.hideTrigger && <Button onClick={() => { setResult(null); setOpen(true); }}>导入未盘说明</Button>}
    <Modal title="导入未盘说明" open={open} footer={null} width={760} closable={!busy} maskClosable={!busy} onCancel={() => setOpen(false)}>
      <Alert type="info" message="按资产标签号匹配当前计划，仅更新未盘说明；空说明保留原值，不改变盘点状态、人员或日期。文件存在错误时整批不保存。"/>
      <Space className="my-3"><Button onClick={download}>下载模板</Button><Button loading={busy} disabled={busy} onClick={() => input.current?.click()}>选择文件导入</Button></Space>
      <input ref={input} type="file" hidden aria-label="导入未盘说明文件" accept=".xlsx,.xls,.csv" onChange={importFile}/>
      {result && <><Alert type={result.errors.length ? 'error' : 'success'} message={result.errors.length ? `导入失败，${result.errors.length}处错误，本批次未保存` : `已更新${result.updates.length}条未盘说明`}/><Table rowKey={(_, index) => index} size="small" dataSource={result.errors} columns={[{ title: '工作表', dataIndex: 'sheet' }, { title: '行号', dataIndex: 'row' }, { title: '资产标签号', dataIndex: 'assetTag' }, { title: '错误原因', dataIndex: 'message' }]}/></>}
    </Modal></>;
}
