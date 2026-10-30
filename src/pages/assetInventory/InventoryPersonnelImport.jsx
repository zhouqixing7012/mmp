import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Alert } from 'antd';
import Table from '../../components/tableAlignment/AlignedTable';
import * as XLSX from 'xlsx';
import { PERSONNEL_IMPORT_HEADERS, parseInventoryPersonnelImport } from './inventoryPersonnelImport';
import { inventoryManagementBlockReason } from './inventoryManagementPermissions';

export default function InventoryPersonnelImport(props) {
  const current = useRef(props); current.current = props;
  const input = useRef(null); const processing = useRef(false); const mounted = useRef(true);
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [result, setResult] = useState(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (props.openRequest) { setResult(null); setOpen(true); } }, [props.openRequest]);
  const block = inventoryManagementBlockReason(props.project, props.operator);
  const download = () => {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([PERSONNEL_IMPORT_HEADERS]), '盘点人员');
    XLSX.writeFile(book, '盘点人员导入模板.xlsx');
  };
  const importFile = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || processing.current) return;
    processing.current = true; setBusy(true); setResult(null);
    const projectNo = current.current.project.projectNo;
    try {
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('请选择xlsx、xls或csv文件');
      const book = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      if (!mounted.current) return;
      const latest = current.current;
      if (latest.project.projectNo !== projectNo) throw new Error('项目已变化，请重新导入');
      const reason = inventoryManagementBlockReason(latest.project, latest.operator);
      if (reason || ['关闭', '盘点关闭'].includes(latest.project.status)) throw new Error(reason || '项目已关闭');
      if (!book.SheetNames.length) throw new Error('文件没有工作表');
      const outcome = parseInventoryPersonnelImport(book.SheetNames.map(name => ({ name, rows: XLSX.utils.sheet_to_json(book.Sheets[name], { header: 1, defval: '', raw: false }) })), latest);
      if (!latest.onChangePlanAssets) throw new Error('计划资产保存入口尚未接入');
      latest.plans.forEach(plan => {
        const changes = outcome.updates.filter(update => update.planKey === plan.key);
        if (changes.length) latest.onChangePlanAssets(plan, assets => assets.map(asset => {
          const change = changes.find(update => update.assetKey === asset.key);
          return change ? { ...asset, ...change.patch } : asset;
        }));
      });
      setResult(outcome);
    } catch (error) { if (mounted.current) setResult({ updates: [], errors: [{ message: error.message }] }); }
    finally { processing.current = false; if (mounted.current) setBusy(false); }
  };
  return <>
    {!props.hideTrigger && <Button disabled={Boolean(block)} onClick={() => { setResult(null); setOpen(true); }}>导入</Button>}
    <Modal open={open} title="导入盘点人员" footer={null} closable={!busy} maskClosable={!busy} onCancel={() => setOpen(false)} width={760}>
      <Alert type="info" message="按资产标签号匹配，仅修改草稿计划资产。人员填写员工工号-姓名，以工号匹配；人员为空保留原值，错误行跳过。" />
      <Space className="my-3"><Button onClick={download}>下载模板</Button><Button loading={busy} disabled={busy} onClick={() => input.current?.click()}>选择文件导入</Button></Space>
      <input ref={input} hidden type="file" accept=".xlsx,.xls,.csv" aria-label="导入盘点人员文件" onChange={importFile}/>
      {result && <><Alert type={result.errors.length ? 'warning' : 'success'} message={`已更新${result.updates.length}条资产，错误${result.errors.length}行`}/><Table rowKey={(_, index) => index} size="small" dataSource={result.errors} columns={[{ title: '工作表', dataIndex: 'sheet' }, { title: '行号', dataIndex: 'row' }, { title: '资产标签号', dataIndex: 'assetTag' }, { title: '错误原因', dataIndex: 'message' }]}/></>}
    </Modal>
  </>;
}
