import { MOVE_WAREHOUSES, readMoveDocuments } from '../mock/inventoryMoveMock';

// 只投影库存管理已经保存的移库单，不另行生成单号、状态或明细。
export function applicationMoveRows() {
  const documents = readMoveDocuments();
  return documents.map(document => {
    const from = MOVE_WAREHOUSES.find(row => row.name === document.fromWarehouse);
    const to = MOVE_WAREHOUSES.find(row => row.name === document.toWarehouse);
    if (!from || !to) throw new Error(`移库单仓库资料缺失：${document.documentNo}`);
    const origin = document.reverseMove ? documents.find(row => row.documentNo === document.sourceDocumentNo) : document;
    const applicant = (origin?.creator || document.creator).split('-')[0];
    const lines = document.lines.map(line => ({
      ...line, tag: line.assetTag, material: {
        materialType: line.materialGroup?.split('.')[1] || '', materialDescription: line.materialDesc,
        majorCategory: line.assetClass, minorCategory: line.assetSubClass, brand: line.brand || '', config: line.config,
      }, warehouse: { ...from, company: from.financeCompany }, enabledDate: line.enabledDate, status: line.assetStatus, mark: line.assetMark,
      handlingStatus: line.moveStatus, outboundNote: line.moveDesc, receivingNote: line.receiveDesc,
      receivingAt: line.verificationTime, outgoingAt: line.snapshot?.verificationTime || '',
      accessories: [], repairs: [], attachments: [],
      info: Object.entries({ '资产标签号': line.assetTag, 'SN号': line.sn, '物资说明': line.materialDesc,
        '物资总类': line.materialGroup, '物资大类': line.assetClass, '物资小类': line.assetSubClass,
        '数量': line.quantity, '公司': line.company, '板块': line.plate, '资产状态': line.assetStatus,
        '可用数量': line.availableQty, '仓库': line.warehouse, '库区': '', '货位': line.bin || '',
        '申请批次': line.applicationBatch, '品牌': line.brand || '', '规格/型号': line.model || '',
        '印刷号': line.printedNumber || '', '用途': line.usage,
        '配置': line.config, '原值': line.originalValue, '净值': line.netValue,
        '启用日期': line.enabledDate, '部门': line.department, '成本中心': line.costCenter,
        '业务线': line.businessLine, '项目': line.project, '费用账户': line.expenseAccount,
        '责任人': line.responsiblePerson, 'City': line.city, 'Building': line.building, 'Floor': line.floor,
        'Room': line.room, '计量单位': line.unit, '资产标记': line.assetMark, '备注': line.remark }),
    }));
    const finished = ['已完成', '已驳回'].includes(document.status);
    const receiver = finished ? document.lastUpdatedBy || document.creator : to.keeper;
    const values = { applicationNo: document.documentNo, status: document.status, fromWarehouse: document.fromWarehouse,
      toWarehouse: document.toWarehouse, createdAt: document.createdDate, applicant: document.creator,
      exportApplicant: document.creator, receiver, exportReceiver: receiver,
      quantity: lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0) };
    return { id: `storage-${document.id}`, kind: 'storage', sourceDocument: document, values,
      createdAt: document.createdDate, statusCode: document.status, from, to, lines, history: [],
      access: { applicant, department: '', company: from.financeCompany, ledger: '资产台账' },
      filters: { ...values, applicant: document.creator.split('-')[0], assetTag: lines.map(line => line.tag) },
      lookupLabels: { applicant: document.creator },
      head: Object.entries({ '移库单号': document.documentNo, '单据类型': '移库单', '单据状态': document.status,
        '出库仓库': document.fromWarehouse, '入库仓库': document.toWarehouse, '制单人': document.creator,
        '制单时间': document.createdDate, '资产数量': values.quantity, '接收人': receiver, '备注': document.remark }),
    };
  });
}
