import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, message as antdMessage } from 'antd';
import * as XLSX from 'xlsx';
import { inventoryMandatoryTemplateRows, parseInventoryMandatoryRows } from './inventoryMandatoryImport';

export default function InventoryMandatoryImport({ assets, candidateAssets = assets, project, requiredKeys, onImport }) {
  const fileInput = useRef(null);
  const current = useRef({ assets, candidateAssets, project, requiredKeys, onImport });
  current.current = { assets, candidateAssets, project, requiredKeys, onImport };
  const mounted = useRef(true);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const download = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(inventoryMandatoryTemplateRows(assets, project)), '盘点范围资产清单');
    XLSX.writeFile(workbook, `${project.projectNo}-盘点范围资产清单模板.xlsx`);
  };
  const importFile = async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || importing) return;
    const sourceContext = `${project.projectNo}:${project.initialProjectNo || ''}`;
    setImporting(true);
    setErrors([]);
    try {
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('请上传xlsx、xls或csv盘点清单');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', raw: true });
      if (!mounted.current) return;
      const latest = current.current;
      if (`${latest.project.projectNo}:${latest.project.initialProjectNo || ''}` !== sourceContext || latest.project.status === '快照生成') throw new Error('盘点范围或项目状态已变化，请重新核对后导入');
      if (!workbook.SheetNames.length) throw new Error('导入文件没有工作表');
      const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '', raw: false });
      const changes = parseInventoryMandatoryRows(matrix, latest.candidateAssets, latest.requiredKeys);
      latest.onImport(changes);
      messageApi.success(`已按文件替换盘点范围，共 ${changes.length} 条资产`);
    } catch (error) { if (mounted.current) { setErrors(error.errors || [{ row: '', assetTag: '', message: error.message }]); messageApi.warning(error.message || '清单导入失败，请核对文件后重试'); } }
    finally { if (mounted.current) setImporting(false); }
  };
  return <>
    {contextHolder}
    <Space>
      <Button disabled={importing} onClick={download}>清单模板</Button>
      {errors.length > 0 && <Button onClick={() => {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
          ['行号', '资产标签号', '错误原因'], ...errors.map(error => [error.row, error.assetTag, error.message]),
        ]), '错误明细');
        XLSX.writeFile(workbook, `${project.projectNo}-范围清单导入错误.xlsx`);
      }}>下载错误明细</Button>}
      <Button loading={importing} disabled={importing} onClick={() => fileInput.current?.click()}>导入清单</Button>
    </Space>
    <input ref={fileInput} type="file" hidden accept=".xlsx,.xls,.csv" aria-label="导入盘点清单文件" onChange={importFile} />
  </>;
}
