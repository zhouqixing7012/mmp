import * as XLSX from 'xlsx-js-style';
import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';

// 当前写入库未提供网格线开关，直接写入OpenXML标准工作表视图属性。
// 只改sheetView，数据、字体、边框、合并和链接等文件内容保持原样。
export function serializeInventoryReportFile(workbook) {
  const files = unzipSync(new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })));
  const namespace = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  workbook.SheetNames.forEach((_, index) => {
    const path = `xl/worksheets/sheet${index + 1}.xml`;
    if (!files[path]) throw new Error('导出文件缺少工作表');
    const document = new DOMParser().parseFromString(strFromU8(files[path]), 'application/xml');
    if (document.getElementsByTagName('parsererror').length) throw new Error('导出工作表格式无效');
    const views = document.getElementsByTagNameNS(namespace, 'sheetView');
    if (!views.length) throw new Error('导出工作表缺少视图设置');
    Array.from(views).forEach(view => view.setAttribute('showGridLines', '0'));
    files[path] = strToU8(new XMLSerializer().serializeToString(document));
  });
  return zipSync(files);
}

export function downloadInventoryReportFile(workbook, filename) {
  const bytes = serializeInventoryReportFile(workbook);
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  try { link.click(); }
  finally {
    link.remove();
    // 释放下载资源，留出浏览器消费Blob地址的时间。
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
