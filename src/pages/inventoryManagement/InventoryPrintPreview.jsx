import React, { useMemo, useRef, useState } from 'react';
import { Button, Modal, Space, message as antdMessage } from 'antd';
import { Printer } from 'lucide-react';

const RESPONSIBILITY_TEXT = '领用人确认已收到上述资产及相关配件，认同公司资产仅作为工作用途使用。如无使用需要，应置于公司办公场所保存。领用人应承担妥善保管资产的责任，除自然损耗外，不得人为损坏或者疏于维护，否则承担相应的赔偿责任。应公司需要，领用人应当配合及时调换或归还领用资产。如领用人延迟甚至拒绝交还公司资产，公司保留采取进一步手段的权利，包括但不限于留置领用人工资、奖金或者其他个人资产。';

const SAMPLE_DATA = {
  receipt: {
    title: '物资接收单',
    sideLabel: '一联 员工服务中心',
    meta: [
      ['供应商', '北京美捷美科技有限公司'], ['采购单位', '天津飞狐'], ['采购订单编号', 'PO2608210004'], ['接收单号', 'REC-202608260001'],
      ['供应商联系人', ''], ['采购员', '薛毛毛'], ['接收日期', '2026-08-26'], ['接收地点', ''],
      ['供应商电话', '13031047651'], ['采购员电话', '010-56603070'], ['PO说明', '电子设备采购订单'], ['', ''],
    ],
    lines: [
      ['PR2608170005', 'CA-2026081100003', '步步高.vivo X300 E12G+256G 全网通', '1', '4,660.00', '4,660.00', '', '郭长博', ''],
      ['PR2608170005', 'CA-2026081100021', '华为.Pura X12G+256G 全网通', '1', '7,030.00', '7,030.00', '', '关亚雷', ''],
    ],
  },
  inboundNew: {
    title: '新增入库单', sideLabel: '一联 员工服务中心',
    meta: [['入库单号', 'PI-202608190004'], ['入库时间', '2026.08.19'], ['地点位置', '天津市.泰达MSD.21层'], ['资产大类', 'NET EQUIPMENT'], ['仓库名称', '资产集团机房库（天津飞狐）.视频'], ['PO单号', '自购']],
    lines: [
      ['理士.DL12100W 100AH UPS电池.含电池连接线', 'SP-03536-SP-03539', '4', '1,040.00', '4,160.00', 'PR2603310015', '视频.产品技术中心'],
      ['理士.DL12100W 100AH UPS电池.含电池连接线', 'SP-03540-SP-03549', '10', '1,040.00', '10,400.00', 'PR2603310015', '视频.产品技术中心'],
      ['理士.DL12100W 100AH UPS电池.含电池连接线', 'SP-03550-SP-03559', '10', '1,040.00', '10,400.00', 'PR2603310015', '视频.产品技术中心'],
      ['理士.DL12100W 100AH UPS电池.含电池连接线', 'SP-03560-SP-03565', '6', '1,040.00', '6,240.00', 'PR2603310015', '视频.产品技术中心'],
    ],
  },
  inboundReceipt: {
    title: '接收入库单', sideLabel: '一联 员工服务中心',
    meta: [['入库单号', 'PI-202609080003'], ['入库时间', '2026.09.08'], ['地点位置', '北京市.搜狐媒体大厦.B2'], ['资产大类', 'OFFICE EQUIPMENT'], ['仓库名称', '资产集团总库（天津飞狐）.视频'], ['PO单号', 'PO2608210003']],
    lines: [
      ['荣耀.600 Pro.12G+256G 全网通', 'NE3995', '1', '3,495.58', '3,495.58', 'PR2608170005', '视频.产品技术中心.质量保障部'],
      ['Google.Pixel 10.12G+128G 全网通', 'NE3996', '1', '4,247.79', '4,247.79', 'PR2608170005', '视频.产品技术中心.质量保障部'],
      ['小米.红米Note17 Pro.12G+256G 全网通', 'NE3997', '1', '1,725.66', '1,725.66', 'PR2608170005', '视频.产品技术中心.质量保障部'],
      ['Google.Pixel 9 Pro.16G+128G 全网通', 'NE3998', '1', '4,159.29', '4,159.29', 'PR2608170005', '视频.产品技术中心.质量保障部'],
    ],
  },
  inboundReturn: {
    title: '领用退库单',
    meta: [['退库单号', 'PI-202609110022'], ['退库时间', '2026.09.11'], ['仓库名称', '资产集团前台库（新媒体）'], ['', ''], ['使用部门', '搜狐媒体.内容中心.四象工作室'], ['员工信息', 'CW013157-胡艺凡']],
    lines: [['NOTEBOOK', '戴尔.Latitude E7280.i5-7200U/16G/512G SSD/12寸/三年质保', '114121801803', 'BJF21N2', '1', '离职', '', '']],
  },
  inboundBorrowReturn: {
    title: '借用退库单',
    meta: [['退库单号', 'PI-202609040002'], ['退库时间', '2026.09.04'], ['仓库名称', '资产集团前台库（新媒体）'], ['', ''], ['使用部门', '搜狐媒体.汽车.新闻中心.产业组'], ['员工信息', '221084-吴灿']],
    lines: [['NOTEBOOK', '戴尔.Latitude E7280.i5-7200U/16G/512G SSD/12寸/三年质保', '114121701639', '1D839H2', '1', '无需使用', '', '']],
  },
  outbound: {
    title: '物资出库单', sideLabel: '一联 库管留存',
    meta: [['出库单号', 'OS-202609100005'], ['出库时间', '2026.09.10'], ['仓库名称', '资产视频天津库（天津飞狐）'], ['PR单号', 'PR2608170005'], ['地点位置', '天津市.泰达MSD.21层'], ['PO单号', 'PO2608210003'], ['资产大类', 'OFFICE EQUIPMENT'], ['使用人', '218980-李艺晓'], ['使用部门', '视频.产品技术中心.质量保障部.iPhone端'], ['', '']],
    lines: [
      ['荣耀.600 Pro.12G+256G 全网通', 'NE3995', '863416080962040', '1', '3,495.58', '3,495.58', '2026-09-08'],
      ['Google.Pixel 9 Pro.16G+128G 全网通', 'NE3998', '350964812771064', '1', '4,159.29', '4,159.29', '2026-09-08'],
    ],
  },
  claim: {
    title: '员工领用单',
    meta: [['领用单号', 'OS-202609110001'], ['领用时间', '2026.09.11'], ['仓库名称', '资产集团前台库（新媒体）'], ['', ''], ['使用部门', '搜狐媒体.智能平台.内容质量中心.新闻部'], ['使用人', '116732-王群']],
    lines: [['NOTEBOOK', '戴尔.Latitude E7280.i5-7200U/16G/512G SSD/12寸/三年质保', '114121801832', '8YTY0N2', '1', '一般领用', '员工用机', '']],
  },
  borrow: {
    title: '员工借用单',
    meta: [['领用单号', 'OS-202609040003'], ['领用时间', '2026.09.04'], ['仓库名称', '资产集团前台库（新媒体）'], ['', ''], ['使用部门', '集团总部.内部审计部.信息系统审计组'], ['员工信息', '219099-滕怀志']],
    lines: [
      ['NOTEBOOK', '戴尔.Latitude E7280.i5-7200U/16G/512G SSD/12寸/三年质保', '114121701025', '4G963H2', '1', '借用领用', '专业用途', '2026.09.04', '2026.10.03', ''],
      ['NOTEBOOK', '戴尔.Latitude E7280.i5-7200U/16G/512G SSD/12寸/三年质保', '114121701639', '1D839H2', '1', '借用领用', '专业用途', '2026.09.04', '2026.10.03', ''],
    ],
  },
};

const pageStyle = {
  width: 1120,
  minHeight: 790,
  margin: '0 auto 24px',
  padding: '26px 34px 28px',
  background: '#fff',
  border: '1px dashed #bfc4ca',
  boxShadow: '0 2px 12px rgba(0,0,0,.08)',
  color: '#111',
  position: 'relative',
  fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
};
const cellStyle = { border: '1px solid #333', padding: '7px 6px', fontSize: 12, verticalAlign: 'middle' };
const thStyle = { ...cellStyle, fontWeight: 700, textAlign: 'center', background: '#fff' };

function LogoTitle({ title }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: 6, marginBottom: 18 }}>
      <div style={{ width: 58, height: 36, background: '#ffd400', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, lineHeight: 1.05 }}>
        <span style={{ fontSize: 15 }}>搜狐</span><span>SOHU.COM</span>
      </div>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 32 }}>{title}</div>
      <div />
    </div>
  );
}

function MetaGrid({ items, columns = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: 34, rowGap: 12, marginBottom: 18, fontSize: 13 }}>
      {items.map(([label, value], index) => (
        <div key={`${label}-${index}`} style={{ display: 'grid', gridTemplateColumns: '106px 1fr', gap: 8, minHeight: 20 }}>
          <strong>{label ? `${label}：` : ''}</strong><span>{value || ''}</span>
        </div>
      ))}
    </div>
  );
}

function BlankRows({ colSpan, count = 6 }) {
  return Array.from({ length: count }, (_, rowIndex) => (
    <tr key={`blank-${rowIndex}`}>
      {Array.from({ length: colSpan }, (_, cellIndex) => <td key={`blank-${rowIndex}-${cellIndex}`} style={{ ...cellStyle, height: 37 }} />)}
    </tr>
  ));
}

function SideLabel({ children }) {
  if (!children) return null;
  return <div style={{ position: 'absolute', right: 4, top: '46%', writingMode: 'vertical-rl', letterSpacing: 4, fontSize: 13 }}>{children}</div>;
}

function SignatureRow({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 40, borderBottom: '1px solid #444', padding: '16px 48px 12px', marginTop: 0, fontSize: 12 }}>
      {items.map((item) => <div key={item}><strong>{item}</strong>（签字）/时间：</div>)}
    </div>
  );
}

function ReceiptSheet({ data }) {
  const qty = data.lines.reduce((sum, row) => sum + Number(row[3] || 0), 0);
  const total = data.lines.reduce((sum, row) => sum + Number(String(row[5]).replace(/,/g, '')), 0);
  return (
    <div style={pageStyle}>
      <LogoTitle title={data.title} /><SideLabel>{data.sideLabel}</SideLabel><MetaGrid items={data.meta} columns={4} />
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead><tr>{['序号','PR单/行号','SA单/行号','物资说明\n（品牌、型号、配置）','接收数量','单价','小计','业务线','申请人','备注'].map((x) => <th key={x} style={thStyle}>{x.split('\n').map((v,i)=><React.Fragment key={v}>{i>0 && <br/>}{v}</React.Fragment>)}</th>)}</tr></thead>
        <tbody>
          {data.lines.map((row, index) => <tr key={index}><td style={{...cellStyle,textAlign:'center'}}>{index + 1}</td>{row.map((value, i)=><td key={i} style={{...cellStyle,textAlign: i>=3 && i<=5 ? 'right':'left'}}>{value}</td>)}</tr>)}
          <BlankRows colSpan={10} count={5} />
          <tr><td colSpan={4} style={{...cellStyle,textAlign:'right',fontWeight:700}}>合计：</td><td style={{...cellStyle,textAlign:'right'}}>{qty}</td><td style={cellStyle}>{total.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td style={cellStyle}>{total.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td colSpan={3} style={cellStyle}/></tr>
        </tbody>
      </table>
      <SignatureRow items={['供应商', '接收方']} />
    </div>
  );
}

function InboundStandardSheet({ data }) {
  const total = data.lines.reduce((sum, row) => sum + Number(String(row[4]).replace(/,/g, '')), 0);
  return (
    <div style={pageStyle}>
      <LogoTitle title={data.title} /><SideLabel>{data.sideLabel}</SideLabel><MetaGrid items={data.meta} columns={2} />
      <table style={{ width:'100%',borderCollapse:'collapse',tableLayout:'fixed' }}>
        <thead><tr>{['序号','品名（物资说明）\n含：物资类别子目录.品牌.规格型号','资产标签号','数量','采购价格-单价','采购价格-金额','PR单号','入库说明\n含：部门或业务线'].map((x)=><th key={x} style={thStyle}>{x.split('\n').map((v,i)=><React.Fragment key={v}>{i>0&&<br/>}{v}</React.Fragment>)}</th>)}</tr></thead>
        <tbody>
          {data.lines.map((row,index)=><tr key={index}><td style={{...cellStyle,textAlign:'center'}}>{index+1}</td>{row.map((value,i)=><td key={i} style={{...cellStyle,textAlign: i===2||i===3||i===4?'right':'left'}}>{value}</td>)}</tr>)}
          <BlankRows colSpan={8} count={4} />
          <tr><td colSpan={4} style={{...cellStyle,textAlign:'right',fontWeight:700}}>本页合计：</td><td style={cellStyle}/><td style={{...cellStyle,textAlign:'right'}}>{total.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td colSpan={2} style={cellStyle}/></tr>
        </tbody>
      </table>
      <SignatureRow items={['接收人','库管员']} />
      <div style={{textAlign:'center',fontWeight:700,marginTop:8}}>第1页 总1页</div>
    </div>
  );
}

function ReturnSheet({ data, borrow = false }) {
  return (
    <div style={pageStyle}>
      <LogoTitle title={data.title} /><MetaGrid items={data.meta} columns={2} />
      <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
        <thead><tr>{['序号','资产大类','品名（物资说明）\n含：物资类别子目录.品牌.规格型号','资产标签号','SN号','数量','退库原因','鉴定结果',borrow?'备注':'退库说明'].map((x)=><th key={x} style={thStyle}>{x.split('\n').map((v,i)=><React.Fragment key={v}>{i>0&&<br/>}{v}</React.Fragment>)}</th>)}</tr></thead>
        <tbody>{data.lines.map((row,index)=><tr key={index}><td style={{...cellStyle,textAlign:'center'}}>{index+1}</td>{row.map((v,i)=><td key={i} style={cellStyle}>{v}</td>)}</tr>)}<BlankRows colSpan={9} count={7}/></tbody>
      </table>
      <SignatureRow items={['退库人','库管员']} />
      <div style={{textAlign:'center',fontWeight:700,marginTop:8}}>第1页 总1页</div>
    </div>
  );
}

function OutboundSheet({ data }) {
  const total = data.lines.reduce((sum,row)=>sum+Number(String(row[5]).replace(/,/g,'')),0);
  return (
    <div style={pageStyle}>
      <LogoTitle title={data.title}/><SideLabel>{data.sideLabel}</SideLabel><MetaGrid items={data.meta} columns={2}/>
      <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
        <thead><tr>{['序号','品名（物资说明）\n含：物资类别子目录.品牌.规格型号','资产标签号','SN号','数量','价值-单价','价值-原值','备注\n含：业务线或新资产地点或启用日期'].map((x)=><th key={x} style={thStyle}>{x.split('\n').map((v,i)=><React.Fragment key={v}>{i>0&&<br/>}{v}</React.Fragment>)}</th>)}</tr></thead>
        <tbody>{data.lines.map((row,index)=><tr key={index}><td style={{...cellStyle,textAlign:'center'}}>{index+1}</td>{row.map((v,i)=><td key={i} style={{...cellStyle,textAlign:i===3||i===4||i===5?'right':'left'}}>{v}</td>)}</tr>)}<BlankRows colSpan={8} count={6}/><tr><td colSpan={4} style={{...cellStyle,textAlign:'right',fontWeight:700}}>合计：</td><td style={{...cellStyle,textAlign:'right'}}>{data.lines.length}</td><td style={cellStyle}/><td style={{...cellStyle,textAlign:'right'}}>{total.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td style={cellStyle}/></tr></tbody>
      </table>
      <SignatureRow items={['使用人','部门经理','库管员']}/>
    </div>
  );
}

function ClaimSheet({ data }) {
  return (
    <div style={pageStyle}>
      <LogoTitle title={data.title}/><MetaGrid items={data.meta} columns={2}/>
      <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
        <thead><tr>{['序号','资产大类','品名（物资说明）\n含：物资类别子目录.品牌.规格型号','资产标签号','SN号','数量','领用类型','用途','领用说明\n含：业务线或新资产地点'].map((x)=><th key={x} style={thStyle}>{x.split('\n').map((v,i)=><React.Fragment key={v}>{i>0&&<br/>}{v}</React.Fragment>)}</th>)}</tr></thead>
        <tbody>{data.lines.map((row,index)=><tr key={index}><td style={{...cellStyle,textAlign:'center'}}>{index+1}</td>{row.map((v,i)=><td key={i} style={cellStyle}>{v}</td>)}</tr>)}</tbody>
      </table>
      <div style={{border:'1px solid #333',borderTop:0,padding:'7px 8px',fontSize:12,lineHeight:1.55}}><strong>保管职责：</strong>{RESPONSIBILITY_TEXT}</div>
      <SignatureRow items={['使用人','部门经理','库管员']}/>
    </div>
  );
}

function BorrowSheet({ data }) {
  return (
    <div style={pageStyle}>
      <LogoTitle title={data.title}/><MetaGrid items={data.meta} columns={2}/>
      <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
        <thead>
          <tr>
            {['序号','资产大类','品名（物资说明）\n含：物资类别子目录.品牌.规格型号','资产标签号','SN号','数量','领用类型','用途'].map((x)=><th key={x} rowSpan={2} style={thStyle}>{x.split('\n').map((v,i)=><React.Fragment key={v}>{i>0&&<br/>}{v}</React.Fragment>)}</th>)}
            <th colSpan={2} style={thStyle}>借用时间</th><th rowSpan={2} style={thStyle}>借用说明<br/>含：业务线或新资产地点</th>
          </tr>
          <tr><th style={thStyle}>预计借用</th><th style={thStyle}>预计归还</th></tr>
        </thead>
        <tbody>{data.lines.map((row,index)=><tr key={index}><td style={{...cellStyle,textAlign:'center'}}>{index+1}</td>{row.map((v,i)=><td key={i} style={cellStyle}>{v}</td>)}</tr>)}<BlankRows colSpan={11} count={6}/></tbody>
      </table>
      <div style={{border:'1px solid #333',borderTop:0,padding:'7px 8px',fontSize:12,lineHeight:1.55}}><strong>保管职责：</strong>{RESPONSIBILITY_TEXT}</div>
      <SignatureRow items={['使用人','部门经理','库管员']}/>
    </div>
  );
}

function replaceDocumentNo(data, docNo) {
  if (!docNo) return data;
  const meta = data.meta.map(([label, value]) => (/单号$|单号/.test(label) && !/PO|PR/.test(label) ? [label, docNo] : [label, value]));
  return { ...data, meta };
}

const INBOUND_TYPE_TO_KEY = {
  新增入库: 'inboundNew',
  采购接收: 'inboundReceipt',
  退库入库: 'inboundReturn',
  借用归还: 'inboundBorrowReturn',
};
const OUTBOUND_TYPES = new Set(['领用出库', '借用出库']);

function readBusinessType(row, activeSubMenu) {
  if (!row) return '';
  const values = [...row.querySelectorAll('td')]
    .map((cell) => String(cell.innerText || '').trim())
    .filter(Boolean);
  if (activeSubMenu === '入库') return values.find((value) => Object.prototype.hasOwnProperty.call(INBOUND_TYPE_TO_KEY, value)) || '';
  if (activeSubMenu === '出库') return values.find((value) => OUTBOUND_TYPES.has(value)) || '';
  return '';
}

function inferDocNo(text, activeSubMenu) {
  const patterns = activeSubMenu === '资产接收' || activeSubMenu === '耗材接收'
    ? [/REC-?\d+/i]
    : activeSubMenu === '入库' ? [/PI-?\d+/i] : [/OS-?\d+/i];
  return patterns.map((pattern)=>String(text||'').match(pattern)?.[0]).find(Boolean) || '';
}

function buildPreviewDocs(activeSubMenu, printAction, contexts) {
  const source = contexts.length ? contexts : [{ text: '', businessType: '' }];
  return source.map((context) => {
    const text = String(context?.text || '');
    const businessType = String(context?.businessType || '');
    const docNo = inferDocNo(text, activeSubMenu);
    if (activeSubMenu === '资产接收' || activeSubMenu === '耗材接收') return { key: 'receipt', data: replaceDocumentNo(SAMPLE_DATA.receipt, docNo) };
    if (activeSubMenu === '入库') {
      const key = INBOUND_TYPE_TO_KEY[businessType] || 'inboundNew';
      return { key, data: replaceDocumentNo(SAMPLE_DATA[key], docNo) };
    }
    if (activeSubMenu === '出库') {
      if (printAction === '领用打印') {
        const key = businessType === '借用出库' ? 'borrow' : 'claim';
        return { key, data: replaceDocumentNo(SAMPLE_DATA[key], docNo) };
      }
      return { key: 'outbound', data: replaceDocumentNo(SAMPLE_DATA.outbound, docNo) };
    }
    return [];
  }).flat();
}

function PrintSheet({ doc }) {
  if (!doc) return null;
  if (doc.key === 'receipt') return <ReceiptSheet data={doc.data}/>;
  if (doc.key === 'inboundNew' || doc.key === 'inboundReceipt') return <InboundStandardSheet data={doc.data}/>;
  if (doc.key === 'inboundReturn') return <ReturnSheet data={doc.data}/>;
  if (doc.key === 'inboundBorrowReturn') return <ReturnSheet data={doc.data} borrow/>;
  if (doc.key === 'outbound') return <OutboundSheet data={doc.data}/>;
  if (doc.key === 'claim') return <ClaimSheet data={doc.data}/>;
  if (doc.key === 'borrow') return <BorrowSheet data={doc.data}/>;
  return null;
}

export default function InventoryPrintPrototypeBoundary({ activeSubMenu, children }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [previewDocs, setPreviewDocs] = useState([]);
  const [messageApi, contextHolder] = antdMessage.useMessage();

  const previewTitle = useMemo(() => previewDocs.length > 1 ? `打印预览（${previewDocs.length} 张）` : '打印预览', [previewDocs.length]);

  const onClickCapture = (event) => {
    const button = event.target?.closest?.('button');
    if (!button || !rootRef.current?.contains(button)) return;
    const label = String(button.innerText || '').trim();
    if (!label.includes('打印') || label.includes('标签')) return;
    if (!['资产接收','耗材接收','入库','出库'].includes(activeSubMenu)) return;

    const row = button.closest('tr');
    const selectedRows = [...rootRef.current.querySelectorAll('tr.ant-table-row-selected')];
    const pageText = rootRef.current.innerText || '';
    const toContext = (element) => ({
      text: element?.innerText || '',
      businessType: readBusinessType(element, activeSubMenu),
    });
    const contexts = row
      ? [toContext(row)]
      : selectedRows.length
        ? selectedRows.map(toContext)
        : [{ text: pageText, businessType: '' }];

    const docs = buildPreviewDocs(activeSubMenu, label, contexts);
    if (!docs.length) return;
    event.preventDefault();
    event.stopPropagation();
    setPreviewDocs(docs);
    setOpen(true);
  };

  return (
    <div ref={rootRef} onClickCapture={onClickCapture}>
      {contextHolder}
      {children}
      <Modal
        open={open}
        title={previewTitle}
        width={1260}
        style={{ top: 18 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto', background: '#f3f4f6', padding: 18 }}
        onCancel={() => setOpen(false)}
        footer={(
          <Space>
            <Button onClick={() => setOpen(false)}>关闭</Button>
            <Button type="primary" icon={<Printer size={14}/>} onClick={() => messageApi.success(`已提交 ${previewDocs.length || 1} 张单据打印（原型）`)}>打印</Button>
          </Space>
        )}
      >
        {previewDocs.map((doc, index) => <PrintSheet key={`${doc.key}-${index}`} doc={doc}/>) }
      </Modal>
    </div>
  );
}