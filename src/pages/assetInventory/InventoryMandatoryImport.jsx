import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message as antdMessage } from 'antd';
import * as XLSX from 'xlsx';
import { inventoryMandatoryTemplateRows, parseInventoryMandatoryRows } from './inventoryMandatoryImport';

export default function InventoryMandatoryImport({ assets, project, requiredKeys, onImport }) {
  const fileInput = useRef(null);
  const current = useRef({ assets, project, requiredKeys, onImport });
  current.current = { assets, project, requiredKeys, onImport };
  const mounted = useRef(true);
  const [importing, setImporting] = useState(false);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const download = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(inventoryMandatoryTemplateRows(assets, project)), '必盘标记');
    XLSX.writeFile(workbook, `${project.projectNo}-必盘标记模板.xlsx`);
  };
  const importFile = async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || importing) return;
    const sourceContext = `${project.projectNo}:${project.initialProjectNo || ''}`;
    setImporting(true);
    try {
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('请上传xlsx、xls或csv必盘标记文件');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      if (!mounted.current) return;
      const latest = current.current;
      if (`${latest.project.projectNo}:${latest.project.initialProjectNo || ''}` !== sourceContext || latest.project.status === '快照生成') throw new Error('盘点范围或项目状态已变化，请重新核对后导入');
      if (!workbook.SheetNames.length) throw new Error('导入文件没有工作表');
      const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '', raw: false });
      const changes = parseInventoryMandatoryRows(matrix, latest.assets, latest.requiredKeys);
      latest.onImport(changes);
      messageApi.success(`已更新 ${changes.length} 条资产的必盘标记`);
    } catch (error) { if (mounted.current) messageApi.warning(error.message || '必盘标记导入失败，请核对文件后重试'); }
    finally { if (mounted.current) setImporting(false); }
  };
  return <>
    {contextHolder}
    <Space>
      <Button disabled={importing} onClick={download}>必盘标记模板</Button>
      <Button loading={importing} disabled={importing} onClick={() => fileInput.current?.click()}>导入必盘标记</Button>
    </Space>
    <input ref={fileInput} type="file" hidden accept=".xlsx,.xls,.csv" aria-label="导入必盘标记文件" onChange={importFile} />
  </>;
}
