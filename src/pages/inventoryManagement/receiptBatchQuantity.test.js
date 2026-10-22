const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const assert = require('assert');

// Execute the actual handlers, with state setters captured, without rendering AntD.
const readHandlers = (file) => {
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['jsx'] });
  const functions = {};
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init?.type === 'ArrowFunctionExpression') {
      functions[node.id.name] = source.slice(node.init.start, node.init.end);
    }
    Object.values(node).forEach((value) => Array.isArray(value) ? value.forEach(walk) : walk(value));
  };
  walk(ast);
  return functions;
};
for (const asset of [true, false]) {
  const handlers = readHandlers(asset ? 'AssetReceiptPage.js' : 'ConsumableReceiptPage.js');
  const qtyKey = asset ? 'currentReceiptQty' : 'currentReceiveQty';
  const setup = (qty, occupied = 5, referenced = true) => {
    const row = { id: 1, purchaseQty: 10, receivedQty: 1, draftQty: occupied, [qtyKey]: 2, config: 'original', isPart: false };
    let rows = [row];
    let draft = { ...row, [qtyKey]: qty, config: 'stale overwrite' };
    const errors = [];
    const forbidden = () => { throw new Error('PO edit must not mutate receipts or maintenance'); };
    const env = {
      activePO: { poNo: 'PO1', purchaseType: '普通资产' },
      editItem: { ...row, draftQty: 0 }, editDraft: draft,
      poItems: { PO1: rows },
      getEffectivePoItems: () => rows,
      getDraftReceiptItemReference: () => referenced ? { item: { currentReceiptQty: 3 } } : null,
      getDraftReceiptLineReference: () => referenced ? { line: { actualReceiveQty: 3 } } : null,
      setEditItem: () => {}, setEditDraft: (next) => { draft = next; },
      setPartDescriptionModalOpen: () => {},
      splitPartDescriptions: () => [],
      DIRECT_INBOUND_TYPES: new Set(),
      messageApi: { error: (msg) => errors.push(msg), success: () => {} },
      setReceiptRows: forbidden, setActiveReceipt: forbidden, setReceipts: forbidden,
      reconcileMaintenanceForReceipt: forbidden, buildDetailsForReceipt: forbidden,
      setPoItemValues: (_po, patch) => { rows = rows.map((item) => ({ ...item, ...patch[item.id] })); },
      setPoItems: (update) => { rows = update({ PO1: rows }).PO1; },
    };
    const bind = (name) => new Function(...Object.keys(env), 'return (' + handlers[name] + ');')(...Object.values(env));
    if (asset) env.availableQty = bind('availableQty');
    if (!asset) env.remainingQty = bind('remainingQty');
    if (asset) env.editAvailableQty = bind('editAvailableQty');
    return { save: () => bind(asset ? 'savePoItem' : 'saveItem')(), open: () => bind('openItemEditor')(row), rows: () => rows, draft: () => draft, errors };
  };
  const label = asset ? 'asset' : 'consumable';
  test(label + ': next batch edit keeps all draft occupancy and locked metadata', () => {
    const state = setup(4); state.save();
    assert.equal(state.rows()[0][qtyKey], 4);
    assert.equal(state.rows()[0].draftQty, 5);
    assert.equal(state.rows()[0].config, 'original');
    assert.equal(state.errors.length, 0);
  });
  for (const qty of [0, -1, 1.5, 5]) {
    test(label + ': rejects invalid or occupied quantity ' + qty, () => {
      const state = setup(qty); state.save();
      assert.equal(state.errors.length, 1);
      assert.equal(state.rows()[0][qtyKey], 2);
      assert.equal(state.rows()[0].draftQty, 5);
    });
  }
  test(label + ': opening editor reads next batch instead of an existing draft', () => {
    const state = setup(4); state.open();
    assert.equal(state.draft()[qtyKey], 2);
  });
  test(label + ': unreferenced material editing remains available', () => {
    const state = setup(3, 0, false); state.save();
    assert.equal(state.rows()[0].config, 'stale overwrite');
    assert.equal(state.rows()[0].draftQty, 0);
  });
}
