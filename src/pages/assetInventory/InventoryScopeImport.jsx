import React, { useRef, useState } from 'react';
import { Button, Space, message as antdMessage } from 'antd';
import * as XLSX from 'xlsx';
import { parseInventoryScopeWorkbook } from './inventoryScopeImport';

export default function InventoryScopeImport({ project, ledgerAssets, allowedAssets, onClear, onImport }) {
  const input = useRef(null);
  const latest = useRef({ project, ledgerAssets, allowedAssets, onClear, onImport });
  latest.current = { project, ledgerAssets, allowedAssets, onClear, onImport };
  const [busy, setBusy] = useState(false);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const importFile = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || busy) return;
    const projectNo = project.projectNo;
    let cleared = false;
    setBusy(true);
    try {
      if (!/\.(xlsx|xls)$/i.test(file.name)) throw new Error('请上传Excel文件（xlsx或xls）');
      const bytes = new Uint8Array(await file.arrayBuffer());
      const excelSignature = (bytes[0] === 0x50 && bytes[1] === 0x4b) || (bytes[0] === 0xd0 && bytes[1] === 0xcf);
      if (!excelSignature) throw new Error('文件不是可读取的Excel工作簿');
      const workbook = XLSX.read(bytes, { type: 'array' });
      if (!workbook.SheetNames.length) throw new Error('Excel文件没有工作表');
      const current = latest.current;
      if (current.project.projectNo !== projectNo) throw new Error('项目已变化，请重新导入');
      current.onClear();
      cleared = true;
      const assets = parseInventoryScopeWorkbook(workbook, current.ledgerAssets, current.allowedAssets);
      current.onImport(assets);
      messageApi.success(`已重建当前项目全部范围，共${assets.length}张资产卡片`);
    } catch (error) {
      messageApi.warning(`${error.message}${cleared ? '；原范围已清空，请修正文件重新导入' : ''}`);
    } finally { setBusy(false); }
  };
  const download = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['资产标签号']]), '范围导入');
    XLSX.writeFile(workbook, `${project.projectNo}-范围导入模板.xlsx`);
  };
  return <>{contextHolder}<Space><Button disabled={busy} onClick={download}>导入模板</Button><Button loading={busy} disabled={busy} onClick={() => input.current?.click()}>导入</Button></Space><input ref={input} type="file" hidden accept=".xlsx,.xls" aria-label="导入范围Excel文件" onChange={importFile} /></>;
}
