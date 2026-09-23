import React from 'react';
import { Button, Modal, Typography } from 'antd';
import { Printer } from 'lucide-react';
import { getWarehouseByCode } from '../../mock/reference/warehouseCatalog';

function warehouseName(value) {
  const code = String(value || '').split('.')[0];
  const current = getWarehouseByCode(code);
  return current?.warehouseDescription || '';
}

function resolveMoveLine(line) {
  const category = line.assetClass || line.materialCategory || '';
  const catalog = line.materialCode ? null : null;
  const categoryName = String(catalog?.majorCategory || category).replace(/^\d+\./, '');
  const productName = line.materialDesc || '';
  const subCategory = line.assetSubClass || line.minorCategory || '';
  const brand = line.brand || '';
  const model = line.model || line.specification || '';
  const productParts = [subCategory, brand, model].filter(Boolean);
  const currentAsset = line.assetTag
    ? null
    : null;
  return {
    categoryName,
    productName,
    productMeta: productParts.join(' / '),
    tag: line.assetTag || '',
    sn: line.sn || '',
    quantity: line.quantity ?? '',
    // Detailed configuration is deliberately read from current card data by tag at print time.
    config: currentAsset?.requirementDescription || currentAsset?.demandDescription || currentAsset?.detail || '',
    reason: line.moveDesc || '',
  };
}

function PrintCopy({ document, copyName }) {
  const lines = (document?.lines || []).map(resolveMoveLine);
  const minimumRows = Math.max(8, lines.length);
  const emptyRows = Array.from({ length: Math.max(0, minimumRows - lines.length) });
  const updatedAt = document?.lastUpdatedAt || document?.updatedAt || '';
  return (
    <section className="move-print-sheet">
      <div className="move-print-title">物资移库单</div>
      <div className="move-print-rule" />
      <div className="move-print-meta">
        <div><strong>移库单号：</strong><b>{document?.documentNo || ''}</b></div>
        <div><strong>入库确认时间：</strong><b>{updatedAt}</b></div>
        <div><strong>移出仓库名称：</strong><b>{warehouseName(document?.fromWarehouse)}</b></div>
        <div><strong>移入仓库名称：</strong><b>{warehouseName(document?.toWarehouse)}</b></div>
      </div>
      <table className="move-print-table">
        <colgroup>
          <col style={{ width: '4.5%' }} /><col style={{ width: '10%' }} />
          <col style={{ width: '23%' }} /><col style={{ width: '11%' }} />
          <col style={{ width: '11%' }} /><col style={{ width: '6%' }} />
          <col style={{ width: '16%' }} /><col style={{ width: '18.5%' }} />
        </colgroup>
        <thead><tr>
          <th>序号</th><th>资产大类</th><th>品名（物资说明）<small>含：物资类别子目录、品牌、规格型号</small></th>
          <th>资产标签号</th><th>SN号</th><th>数量</th><th>详细配置</th><th>移库说明<small>含：移库原因</small></th>
        </tr></thead>
        <tbody>
          {lines.map((line, index) => <tr key={document.lines[index]?.id || index}>
            <td>{index + 1}</td><td>{line.categoryName}</td>
            <td className="move-print-product">{line.productName}{line.productMeta && <small>{line.productMeta}</small>}</td>
            <td>{line.tag}</td><td>{line.sn}</td><td>{line.quantity}</td><td>{line.config}</td><td>{line.reason}</td>
          </tr>)}
          {emptyRows.map((_, index) => <tr className="move-print-empty" key={`empty-${index}`}>
            <td>&nbsp;</td><td /><td /><td /><td /><td /><td /><td />
          </tr>)}
        </tbody>
      </table>
      <div className="move-print-signatures">
        <div>出库人（签字）/时间：<span /></div>
        <div>入库人（签字）/时间：<span /></div>
      </div>
      <div className="move-print-copy">{copyName}</div>
    </section>
  );
}

export default function MovePrintPreview({ open, documentNo, documents = [], onCancel }) {
  // Resolve the latest in-memory document by its number each time preview is rendered.
  const document = open ? documents.find((item) => item.documentNo === documentNo) : null;
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={1280}
      footer={null}
      title="移库单打印预览"
      className="move-print-modal"
      destroyOnHidden
    >
      <div className="move-print-toolbar">
        <Typography.Text type="secondary">固定两联：转出方联、转入方联</Typography.Text>
        <div>
          <Button className="move-print-close" onClick={onCancel}>关闭</Button>
          <Button type="primary" icon={<Printer size={14} />} onClick={() => window.print()}>打印</Button>
        </div>
      </div>
      {!document ? <div className="py-12 text-center">未找到移库单 {documentNo}</div> : (
        <div className="move-print-preview">
          <style>{`
            .move-print-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
            .move-print-toolbar>div{display:flex;gap:8px}
            .move-print-preview{background:#f2f3f5;padding:16px;max-height:68vh;overflow:auto;color:#111}
            .move-print-sheet{position:relative;box-sizing:border-box;width:100%;min-height:720px;background:#fff;margin:0 auto 16px;padding:30px 42px 34px;font-family:Arial,"Microsoft YaHei",sans-serif}
            .move-print-title{text-align:center;font-size:30px;font-weight:700;letter-spacing:6px;padding:8px 0 2px}
            .move-print-rule{border-top:1px solid #222;margin-bottom:24px}
            .move-print-meta{display:grid;grid-template-columns:1.2fr .8fr;gap:14px 28px;margin:0 24px 28px;font-size:15px}
            .move-print-meta strong{display:inline-block;min-width:120px}
            .move-print-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:13px}
            .move-print-table th,.move-print-table td{border:1px solid #333;text-align:center;padding:6px 3px;overflow-wrap:anywhere}
            .move-print-table thead th{height:56px;font-size:15px}
            .move-print-table small{display:block;font-size:11px;font-weight:400;line-height:1.4}
            .move-print-table tbody td{height:36px}
            .move-print-table .move-print-product{text-align:left}
            .move-print-table .move-print-product small{text-align:left}
            .move-print-signatures{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:18px 48px 0;font-size:14px}
            .move-print-signatures span{display:inline-block;width:54%;border-bottom:1px solid #fff}
            .move-print-copy{position:absolute;right:5px;top:40%;writing-mode:vertical-rl;letter-spacing:8px;font-size:14px}
            @media print{
              @page{size:A4 landscape;margin:8mm}
              body *{visibility:hidden!important}
              .move-print-preview,.move-print-preview *{visibility:visible!important}
              .move-print-modal .ant-modal-wrap,.move-print-modal .ant-modal{position:static!important;width:auto!important;max-width:none!important;margin:0!important;padding:0!important;transform:none!important}
              .move-print-modal .ant-modal-content{padding:0!important;box-shadow:none!important}
              .move-print-modal .ant-modal-header,.move-print-toolbar{display:none!important}
              .move-print-preview{position:static!important;max-height:none!important;overflow:visible!important;background:#fff!important;padding:0!important}
              .move-print-sheet{width:100%!important;height:190mm;min-height:0!important;margin:0!important;padding:8mm 7mm!important;page-break-after:always;break-after:page}
              .move-print-sheet:last-child{page-break-after:auto;break-after:auto}
              .move-print-table tbody td{height:12mm}
            }
          `}</style>
          <PrintCopy document={document} copyName="转出方联" />
          <PrintCopy document={document} copyName="转入方联" />
        </div>
      )}
    </Modal>
  );
}
