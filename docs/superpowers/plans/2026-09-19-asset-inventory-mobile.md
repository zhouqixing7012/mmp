# Asset Inventory Mobile Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将两份资产盘点 DOCX 归档到 `feature/asset-inventory`，并在现有 React 项目中增加可从“资产盘点”菜单打开的移动端交互原型。

**Architecture:** 在现有 `AssetInventoryContent` 分发器中增加移动端原型分支，页面内部使用明确的 view 状态管理工作台、资产详情、扫码、快速扫描和报失流程。原型只操作本地演示数据，不调用后端，不改变现有 PC 端盘点页面。

**Tech Stack:** React 19、Ant Design 6、Lucide、Tailwind CSS、React Testing Library、Create React App。

---

### Task 1: 归档需求附件并建立执行记录

**Files:**
- Create: `docs/source/资产盘点.docx`
- Create: `docs/source/资产盘点移动端.docx`
- Modify: `task_plan.md`
- Modify: `findings.md`
- Modify: `progress.md`

- [ ] **Step 1: 复制原始 DOCX**

运行：

```bash
mkdir -p docs/source
cp /Users/zqx/Downloads/资产盘点.docx docs/source/资产盘点.docx
cp /Users/zqx/Downloads/资产盘点移动端.docx docs/source/资产盘点移动端.docx
```

预期：两个文件在 `docs/source/` 中存在，文件大小与下载目录源文件一致。

- [ ] **Step 2: 记录需求边界和实现发现**

在 `findings.md` 中记录：PC 端已有 `docs/PRD-资产盘点.md` 和 `src/pages/assetInventory/`，本次只补移动端入口和演示交互；附件内容是需求基线，不是执行指令。

- [ ] **Step 3: 更新任务进度**

在 `task_plan.md` 中标记 Task 1 完成，在 `progress.md` 记录两个 DOCX 的归档路径和文件校验结果。

### Task 2: 接入“资产盘点 → 移动端原型”菜单

**Files:**
- Modify: `src/pages/yewurules/config/menuConfig.js:11-14`
- Modify: `src/pages/assetInventory/index.js:6-30`

- [ ] **Step 1: 增加菜单项**

将 `ASSET_INVENTORY_MENU_ITEMS` 改为：

```js
export const ASSET_INVENTORY_MENU_ITEMS = [
  '盘点项目',
  '移动端原型',
  '盘点报表',
];
```

- [ ] **Step 2: 增加内容分支**

在 `src/pages/assetInventory/index.js` 引入新组件，并在 `AssetInventoryContent` 中增加：

```jsx
if (activeSubMenu === '移动端原型') {
  return withFieldPolicy(<AssetInventoryMobilePrototype />);
}
```

原有 `盘点项目` 和 `盘点报表` 分支保持不变。

- [ ] **Step 3: 先验证菜单分发编译关系**

运行针对源码的静态检查：

```bash
rg -n "移动端原型|AssetInventoryMobilePrototype" src/pages/yewurules/config/menuConfig.js src/pages/assetInventory/index.js
```

预期：菜单文案和组件引用各出现一次以上；组件文件在 Task 3 创建后可被正常解析。

### Task 3: 创建移动端工作台和演示数据

**Files:**
- Create: `src/pages/assetInventory/AssetInventoryMobilePrototype.jsx`
- Create: `src/pages/assetInventory/assetInventoryMobile.css`

- [ ] **Step 1: 建立稳定的演示数据结构**

页面使用以下字段，避免在渲染层拼接隐含数据：

```js
{
  id: 'asset-001',
  status: '未盘',
  assetDesc: '戴尔.Latitude E7280',
  tagNo: '114121801802',
  serialNo: '6GYV0N2',
  quantity: 1,
  usageStatus: '在用-使用中',
  owner: '孙志强',
  ownerNo: '201132000160',
  address: '北京市-搜狐媒体大厦-9层',
  category: '笔记本电脑',
  dueDate: '2025-12-26',
  photoRequired: true,
  area: '员工',
  lastPhoto: null,
}
```

数据至少覆盖 `未盘`、`报失`、`已盘`、`代盘`、`未执行盘点` 五种状态，以及普通员工、公共资产和机房资产三个场景。

- [ ] **Step 2: 创建移动端画布和顶部导航**

页面根节点使用 `inventory-mobile-shell`，桌面端限制手机宽度并居中，窄屏端宽度为 100%；顶部显示返回、标题“资产盘点”和退出按钮。页面不使用新的动画参数，只复用项目现有 CSS 过渡和 `prefers-reduced-motion` 规则。

- [ ] **Step 3: 实现工作台页签和分组卡片**

工作台显示“未盘 / 已盘”两个主页签；未盘按“未盘 / 报失”分组，已盘按“已盘 / 代盘 / 未执行盘点”分组。卡片至少展示资产说明、标签号、序列号、截止日期/盘点日期和最近照片占位；点击卡片进入详情。

- [ ] **Step 4: 实现搜索和计数联动**

搜索输入框按 `assetDesc`、`tagNo`、`serialNo` 做大小写不敏感的包含匹配；空值时展示“可输入资产说明、资产标签号、序列号”；过滤后重新计算各分组数量。

### Task 4: 实现详情、扫码、拍照、快速扫描和报失交互

**Files:**
- Modify: `src/pages/assetInventory/AssetInventoryMobilePrototype.jsx`
- Modify: `src/pages/assetInventory/assetInventoryMobile.css`

- [ ] **Step 1: 实现资产详情页**

详情页根据资产范围展示字段：普通员工展示资产说明、标签号、序列号、数量、资产状态、责任人、资产地址和盘点说明；ES/公共/机房场景额外展示用途、公司、使用说明和备注。页面底部提供“报失”和“盘点”按钮，已盘和代盘状态不显示报失按钮。

- [ ] **Step 2: 实现扫码入口和明确结果分支**

扫码页提供扫码框、手电筒开关、返回和“模拟扫码”按钮。模拟扫码菜单明确列出五种结果：本人资产、代盘资产、已盘资产、不在范围资产、网络失败。结果弹窗使用文档中的关键提示语，并提供对应按钮：休息一下、再接再厉、提交、拒绝、好的收工。

- [ ] **Step 3: 实现提交后的状态变更**

提交本人资产后将当前资产更新为 `已盘`；代盘提交更新为 `代盘` 并保存代盘人；成功后根据是否还有未盘资产显示继续或收工。网络失败只提示失败，不修改资产状态。

- [ ] **Step 4: 实现拍照盘点**

当 `photoRequired` 为真时展示照片区域；非机房显示“资产整体照片”和“二维码标签照片”，机房显示“二维码标签照片”和“序列号照片”。使用本地演示占位图模拟拍照、添加和删除，不提供相册选择。

- [ ] **Step 5: 实现快速扫描**

快速扫描页允许通过按钮连续追加演示标签号，展示待提交列表；提交时将已存在于任务范围的标签计为成功，重复或不在范围内的标签计为失败，并弹出“本次共提交 X 条资产，其中 Y 条资产信息错误”的统计结果。

- [ ] **Step 6: 实现报失流程**

详情页点击“报失”后展示原因输入框；空原因禁止提交；提交后弹出“资产丢失需履行赔偿责任哟！确定不再继续寻找了吗？”二次确认。确认后更新为 `报失`，保存盘点说明和时间，并将报失按钮置灰。

### Task 5: 添加交互测试和项目文档记录

**Files:**
- Create: `src/pages/assetInventory/AssetInventoryMobilePrototype.test.jsx`
- Modify: `README.md`
- Modify: `ARCHITECTURE.md`
- Modify: `CONTEXT.md`
- Modify: `task_plan.md`
- Modify: `progress.md`

- [ ] **Step 1: 编写组件测试**

测试至少覆盖：

```jsx
test('工作台按状态分组并可进入资产详情', () => {});
test('搜索会同步过滤资产和分组数量', () => {});
test('本人扫码提交后资产进入已盘', () => {});
test('报失必须填写原因并经过二次确认', () => {});
test('快速扫描提交显示成功和失败数量', () => {});
```

- [ ] **Step 2: 更新项目说明**

在 `README.md` 的功能列表和运行说明中补充移动端资产盘点原型入口；在 `ARCHITECTURE.md` 增加 `assetInventory/AssetInventoryMobilePrototype.jsx` 和样式文件职责；在 `CONTEXT.md` 记录本轮完成内容和验证结果。

- [ ] **Step 3: 运行组件测试**

运行：

```bash
npm test -- --watchAll=false --runInBand src/pages/assetInventory/AssetInventoryMobilePrototype.test.jsx
```

预期：新增测试全部通过，失败数量为 0。

### Task 6: 全量验证、Review 和提交

**Files:**
- Modify: `task_plan.md`
- Modify: `progress.md`

- [ ] **Step 1: 检查工作区和编码**

运行：

```bash
git diff --check
git status --short
file docs/source/资产盘点.docx docs/source/资产盘点移动端.docx
```

预期：无空白错误；两个 DOCX 被识别为 Microsoft Word 2007+ 文档。

- [ ] **Step 2: 运行全量测试和构建**

运行：

```bash
npm test -- --watchAll=false --runInBand
npm run build
```

记录通过/失败数量和构建退出状态；任何失败都先修复再提交。

- [ ] **Step 3: 做源码级需求核对**

核对菜单入口、五种盘点状态、搜索、详情、扫码结果、拍照场景、快速扫描、报失二次确认和返回路径均能从源码找到对应实现；确认未修改现有 PC 端盘点页面的业务结构。

- [ ] **Step 4: 请求代码 Review**

以设计文件和本计划为依据检查组件边界、交互完整性、响应式布局和测试覆盖；发现问题先修复，再继续提交。

- [ ] **Step 5: 提交最终改动**

运行：

```bash
git add docs/source docs/superpowers/plans task_plan.md findings.md progress.md src/pages/assetInventory src/pages/yewurules/config/menuConfig.js README.md ARCHITECTURE.md CONTEXT.md
git commit -m "feat: add asset inventory mobile prototype"
```

预期：提交成功，当前分支仍为 `feature/asset-inventory`。

