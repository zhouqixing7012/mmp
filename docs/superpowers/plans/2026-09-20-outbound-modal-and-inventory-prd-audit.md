# 出库物资弹窗与库存管理 PRD 走查 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成出库物资信息弹窗字段布局调整，并形成库存管理全模块 PRD 偏好与原型一致性走查报告。

**Architecture:** UI 调整只修改 `OutboundPage.js` 两处普通资产物资信息栅格，不改变组件状态和业务逻辑；测试通过源码结构断言固定两套弹窗的一致布局。PRD 走查以 7 份主 PRD、工作台补充 PRD和已有三方比对为输入，输出独立全模块走查文档，不直接替用户决定存在业务分叉的口径。

**Tech Stack:** React 19、Ant Design 6、Jest、Markdown、GitHub Actions Pages

---

### Task 1: 为两套出库物资信息弹窗增加失败回归测试

**Files:**
- Modify: `src/pages/inventoryManagement/inventoryManagementRequirements.test.js`
- Test: `src/pages/inventoryManagement/inventoryManagementRequirements.test.js`

- [ ] **Step 1: 写入旧结构下必然失败的布局断言**

```javascript
test('出库物资新增编辑和只读详情使用相同字段布局', () => {
  expect(outboundSource.match(/<EditorField label="备注" span=\{2\}>/g)).toHaveLength(2);
  expect(outboundSource).toContain('<EditorField label="费用账户"><Readonly>{asset?.expenseAccount}</Readonly></EditorField>\n              <EditorField label="总价">');
  expect(outboundSource).toContain('<EditorField label="税金"><Readonly>{money(asset?.tax)}</Readonly></EditorField>\n              <EditorField label="主资产标签号">');
  expect(outboundSource).toContain('<EditorField label="费用账户"><Readonly>{row.expenseAccount}</Readonly></EditorField>\n            <EditorField label="总价">');
  expect(outboundSource).toContain('<EditorField label="税金"><Readonly>{money(row.tax)}</Readonly></EditorField>\n            <EditorField label="主资产标签号">');
});
```

- [ ] **Step 2: 运行定向测试并确认失败原因正确**

Run: `CI=true npm test -- --runInBand src/pages/inventoryManagement/inventoryManagementRequirements.test.js`

Expected: 新增测试失败，失败点为旧代码仍使用 `span={3}`，且“总价/主资产标签号”顺序未交换；已有测试继续通过。

### Task 2: 同步调整新增/编辑与只读详情弹窗

**Files:**
- Modify: `src/pages/inventoryManagement/OutboundPage.js:381-409`
- Modify: `src/pages/inventoryManagement/OutboundPage.js:506-536`
- Test: `src/pages/inventoryManagement/inventoryManagementRequirements.test.js`

- [ ] **Step 1: 修改新增/编辑弹窗字段顺序与备注跨度**

将普通资产“物资信息”金额区改为以下 JSX 顺序：

```jsx
<EditorField label="费用账户"><Readonly>{asset?.expenseAccount}</Readonly></EditorField>
<EditorField label="总价"><Readonly>{asset ? money(Number(asset.originalValue || 0) + Number(asset.tax || 0)) : '-'}</Readonly></EditorField>
<EditorField label="原值"><Readonly>{money(asset?.originalValue)}</Readonly></EditorField>
<EditorField label="税金"><Readonly>{money(asset?.tax)}</Readonly></EditorField>
<EditorField label="主资产标签号"><Readonly>{asset?.mainAssetTag}</Readonly></EditorField>
```

并将备注改为：

```jsx
<EditorField label="备注" span={2}><Readonly>{asset?.remark}</Readonly></EditorField>
```

- [ ] **Step 2: 修改只读详情弹窗字段顺序与备注跨度**

将普通资产“物资信息”金额区改为以下 JSX 顺序：

```jsx
<EditorField label="费用账户"><Readonly>{row.expenseAccount}</Readonly></EditorField>
<EditorField label="总价"><Readonly>{money(Number(row.originalValue || 0) + Number(row.tax || 0))}</Readonly></EditorField>
<EditorField label="原值"><Readonly>{money(row.originalValue)}</Readonly></EditorField>
<EditorField label="税金"><Readonly>{money(row.tax)}</Readonly></EditorField>
<EditorField label="主资产标签号"><Readonly>{row.mainAssetTag}</Readonly></EditorField>
```

并将备注改为：

```jsx
<EditorField label="备注" span={2}><Readonly>{row.remark}</Readonly></EditorField>
```

- [ ] **Step 3: 运行定向测试并确认通过**

Run: `CI=true npm test -- --runInBand src/pages/inventoryManagement/inventoryManagementRequirements.test.js`

Expected: 4 tests passed, 0 failed。

- [ ] **Step 4: 提交 UI 与测试**

```bash
git add src/pages/inventoryManagement/OutboundPage.js src/pages/inventoryManagement/inventoryManagementRequirements.test.js
git commit -m "调整出库物资信息弹窗布局"
```

### Task 3: 同步出库 PRD 和项目记录

**Files:**
- Modify: `docs/PRD-库存管理-出库.md:274-305`
- Modify: `CONTEXT.md`
- Modify: `lessons.md`

- [ ] **Step 1: 调整 PRD 字段顺序与备注占列规则**

将物资信息字段表相关部分改为：

```markdown
| 费用账户 | 资产台账，只读 |
| 总价 | 原值 + 税金，只读 |
| 原值 | 会计金额格式，只读 |
| 税金 | 会计金额格式，只读 |
| 主资产标签号 | 资产台账，只读 |
| 部件数量 | 资产台账，只读 |
| 部件说明 | 资产台账，只读 |
| 资产标记 | 资产台账，只读 |
| 备注 | 资产台账，只读，占两列 |
```

- [ ] **Step 2: 记录当前进度和可复用规则**

在 `CONTEXT.md` 记录本次原型与 PRD同步完成状态；在 `lessons.md` 记录“同一业务弹窗存在维护态和只读态时，字段顺序与 span 必须同步调整”的规则。

### Task 4: 完成库存管理全模块 PRD 走查

**Files:**
- Create: `docs/三方比对-库存管理-全模块PRD走查.md`
- Read: `docs/PRD-库存管理-库管员工作台.md`
- Read: `docs/PRD-库存管理-库管员工作台及员工领用退库打印补充.md`
- Read: `docs/PRD-库存管理-资产接收.md`
- Read: `docs/PRD-库存管理-耗材接收.md`
- Read: `docs/PRD-库存管理-入库.md`
- Read: `docs/PRD-库存管理-出库.md`
- Read: `docs/PRD-库存管理-移库.md`
- Read: `docs/PRD-库存管理-转移.md`
- Read: `docs/三方比对-库存管理-库管员工作台.md`
- Read: `docs/三方比对-库存管理-转移.md`
- Read: `src/pages/inventoryManagement/`

- [ ] **Step 1: 按统一检查维度逐份核对**

每份 PRD 必须检查：页面目标、适用角色、前置条件、状态、字段、按钮、交互、校验、异常、权限、空状态、成功结果、下游影响、待确认项，以及是否混入技术实现、历史叙事、原型说明或研发任务。

- [ ] **Step 2: 与当前原型逐项比对**

每个差异统一记录为：

```markdown
| 模块 | 位置 | 需求/PRD表述 | 当前原型 | 判断 | 建议动作 | 需要用户确认的问题 |
|---|---|---|---|---|---|---|
```

“判断”仅使用：`已确认一致`、`PRD需改`、`原型需改`、`需要用户确认`、`无法从原型确认`。

- [ ] **Step 3: 按用户偏好检查表达方式**

重点标记以下问题：技术名词进入正文、用“当前原型/本次改造/后续研发”代替业务规则、负向排除项过多、同一规则重复出现、字段只列名称不写来源和交互、异常与权限缺失、把推断写成已确认事实。

- [ ] **Step 4: 输出需要用户判断的收口清单**

报告末尾固定分成三组：

```markdown
## 可直接改 PRD
## 可直接改原型
## 需要用户决定改原型还是改 PRD
```

每个待决策项必须给出推荐方案、另一个方案的影响，以及用户只需回答的一句话问题。

### Task 5: 完整验证、提交与远端核对

**Files:**
- Verify: `src/pages/inventoryManagement/OutboundPage.js`
- Verify: `docs/PRD-库存管理-出库.md`
- Verify: `docs/三方比对-库存管理-全模块PRD走查.md`

- [ ] **Step 1: 运行源码结构检查**

Run: `git diff --check`

Expected: exit 0，无空白错误。

- [ ] **Step 2: 运行库存管理定向测试**

Run: `CI=true npm test -- --runInBand src/pages/inventoryManagement/inventoryManagementRequirements.test.js src/pages/inventoryManagement/OutboundApprovalHistoryPage.test.jsx`

Expected: 2 suites passed，5 tests passed，0 failed。

- [ ] **Step 3: 运行正式构建**

Run: `npm run build`

Expected: exit 0；允许仓库现有 ESLint warning，不允许新增 error。

- [ ] **Step 4: 提交文档并推送功能分支**

```bash
git add docs/PRD-库存管理-出库.md docs/三方比对-库存管理-全模块PRD走查.md CONTEXT.md lessons.md
git commit -m "docs: 完成库存管理 PRD 全模块走查"
git push origin feature/asset-inventory
```

- [ ] **Step 5: 核对远端发布**

Run: `gh run list --repo zhouqixing7012/mmp --branch feature/asset-inventory --limit 3`

Expected: 最新提交对应的 `Publish main and feature previews` 最终为 `completed success`，功能分支预览返回 HTTP 200。
