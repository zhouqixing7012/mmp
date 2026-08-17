# ARCHITECTURE.md

## 项目定位

这是产品演示用企业资产管理前端。真实后端接口不在当前仓库实现，页面、流程状态和演示数据保持一致。

## 顶层文件职责

| 文件/目录 | 职责 |
|---|---|
| `AI_RULES.md` | AI 开发行为和交付约束。 |
| `CLAUDE.md` | 代码和组件规范。 |
| `CONTEXT.md` | 当前进度、关键决定和验收路径。 |
| `README.md` | 项目功能、运行、部署和待办。 |
| `ARCHITECTURE.md` | 模块职责、调用关系和数据流。 |
| `package.json` | 依赖和运行命令。 |

## src 目录职责

| 路径 | 职责 |
|---|---|
| `src/App.js` | 应用路由入口。 |
| `src/config/routes.js` | 独立页面路由配置。 |
| `src/components/QueryBar.jsx` | 统一查询区域；QueryItem 同时暴露细粒度原型标注语义。 |
| `src/components/DetailGrid.jsx` | 统一只读详情网格；DetailItem 暴露详情字段标注语义。 |
| `src/components/FormField.js` | 旧页面表单字段组件；暴露表单字段标注语义。 |
| `src/components/Modal.js` | 项目公共弹窗；通过 `data-prototype-overlay` 显式声明业务浮层，供标注层处理遮挡关系。 |
| `src/components/StatusTag.jsx` | 统一状态展示。 |
| `src/components/SelectModal.jsx` | 通用选择弹窗；声明 `select-modal` 业务浮层，暴露弹窗整体、搜索条件、结果列表标注语义，并用 `data-prototype-display-anchor` 声明标题展示锚点。 |
| `src/prototype-annotations/PrototypeAnnotationLayer.jsx` | 全局原型标注层；所有 React 路由均挂载，负责页面作用域、目标解析、业务浮层遮挡、target/display-anchor 分离、热点、拖动/重绑和保存；绑定状态下支持 Alt/Option 页面交互穿透以先打开浮层。 |
| `src/prototype-annotations/PrototypeAnnotationPanel.jsx` | 标注查看与可视化编辑面板；通过 Portal 独立渲染到 body；查看态条目点击切换展开，详情支持项目符号与 Markdown 展示。 |
| `src/prototype-annotations/AnnotationMarkdown.jsx` | 受控标注 Markdown 渲染器；支持行内格式、标题、列表、表格和常用转义，不解析原始 HTML。 |
| `src/prototype-annotations/annotation-data.js` | Agent 根据仓库 PRD 生成的标注基线。 |
| `src/prototype-annotations/annotation-page-scope.js` | 普通路由与 `/yewurules` 内部页面的标注作用域解析。 |
| `src/prototype-annotations/annotation-targeting.js` | 模块锚点与 Button / Select / Radio / Checkbox / Tabs / DatePicker / QueryItem / 表头 / DetailItem / FormField / FormItem / SelectModal 语义块等目标的实时识别、生成和解析；同时负责业务浮层判断及从业务 target 派生序号 display anchor。 |
| `src/prototype-annotations/annotation-positioning.js` | 根据 display anchor 的实时矩形进行标注点定位、自动翻转和视口约束。 |
| `src/prototype-annotations/annotation-storage.js` | 按页面作用域保存浏览器标注覆盖层、删除记录和自定义标注。 |
| `src/prototype-annotations/annotation-anchor-scanner.js` | 扫描模块锚点和细粒度可标注目标并导出上下文。 |
| `src/prototype-annotations/annotation-quality.js` | 原型标注质量门；校验 action/field/tab/table-column 等规则的 target 粒度，以及 PRD Requirement Coverage Ledger 是否完整。 |
| `src/prototype-annotations/contract-number-annotation-coverage.js` | 合约号码模块的 PRD 重点覆盖账本示例；每条重点明确为 bound / review / skip。 |
| `src/services/demoStorage.js` | localStorage 统一读写。 |
| `src/pages/yewurules/` | 后台框架、侧边栏和菜单。 |
| `src/pages/assetManagement/` | 后台资产管理页面。 |
| `src/pages/inventoryManagement/` | 库存管理菜单与子页面入口。 |
| `src/pages/employeeSelfService/` | 资产申请、审批、配给等。 |
| `src/pages/assetBorrowing/` | 资产借用流程。 |
| `src/pages/assetReplacement/` | 资产更换流程。 |
| `src/pages/assetReturn/` | 资产退库与合约号码退库流程。 |
| `src/mock/` | 各业务模块演示数据。 |
| `src/services/` | 各业务模块状态读写和流程操作。 |

## 原型标注调用关系

```text
仓库 PRD + React 页面代码
  ↓ Agent 先拆 Requirement Atom（来源 / 页面 / objectType / 对象 / 规则）
  ├─ action → Button
  ├─ field → DetailItem / FormItem / 控件
  ├─ tab → Tab
  ├─ table-column → 表头
  └─ 真正跨对象规则 → Card / module
  ↓
annotation-data.js 代码基线
  + Requirement Coverage Ledger（bound / review / skip）
  ↓
annotation-quality.js
  ├─ Granularity Check：具体对象规则不得回退模块
  └─ Coverage Check：PRD 重点必须有明确去向
  ↓
annotation-page-scope.js
  ├─ 独立路由：route:<pathname>
  └─ /yewurules：route:/yewurules::<activeMenu>::<activeSubMenu>::<activeTab>
  ↓
annotation-targeting.js
  ├─ 模块级 data-prototype-anchor
  ├─ 实时精确目标：Button / Table Header / Tabs
  ├─ 交互控件：Select / DatePicker / Radio / Checkbox / Segmented / Switch / Slider / Rate / Upload / Input
  ├─ 业务字段：QueryItem / DetailItem / FormField / FormItem
  ├─ 选择弹窗语义：selection-modal / selection-search-field / selection-table
  ├─ 业务浮层：Modal / Drawer / Image Preview / data-prototype-overlay
  ├─ display anchor：字段/控件自身；Card/模块标题；自定义 data-prototype-display-anchor
  └─ 无显式锚点时回退：Ant Card / Table / Form / section / bg-white 业务块
  ↓
PrototypeAnnotationLayer
  ├─ 业务 target                     高亮 / 选择 / 重绑 / 稳定重建
  ├─ display anchor                  序号实际落点
  ├─ annotation-positioning.js       side / align / gap / offset + 边缘翻转
  ├─ annotation-storage.js           按 page scope 保存用户覆盖层 / 新增 / 删除
  ├─ annotation-anchor-scanner.js    模块 + 细粒度目标上下文
  ├─ 业务浮层可见性                 弹窗外标注隐藏 / 弹窗内标注保留
  ├─ Alt/Option 交互穿透             绑定状态下先打开弹窗/下拉，不结束 bindingMode
  └─ PrototypeAnnotationPanel        body Portal；查看、编辑、重绑、保存、导入导出
                                       ↓
                                 AnnotationMarkdown
                                 项目符号 / Markdown / 表格展示
```

- PRD 不在页面端上传，也不在前端调用 AI；Agent 直接读取仓库中的 PRD 文件和页面代码生成初始标注。
- Agent 生成标注前必须先将 PRD 拆为最小 Requirement Atom；同一段同时描述多个字段、按钮或不同结果时继续拆分，不能按 PRD 段落或 Card 直接生成一个大标注。
- Agent 生成基线时按规则真实归属选择 target：字段必填/只读/脱敏/枚举/默认值/附件规则等绑定字段/控件；按钮动作及其副作用绑定 Button；Card/模块只放跨字段统一规则、准入/公共流程和真正跨对象的系统副作用。
- `annotation-quality.js` 对具体规则执行 Granularity Check：`action-rule` 必须绑定 Button，`field-rule` 必须绑定字段/控件，`tab-rule` 必须绑定 Tab，`table-column-rule` 必须绑定表头。找不到可靠 target 时不得自动回退 Card，而是进入 coverage ledger 的 `review`。
- Requirement Coverage Ledger 负责完整性：`bound` 必须存在对应 annotation；`review` 表示 PRD 与页面/最新口径冲突或暂无可靠 target；`skip` 表示明确无需单独标注。review/skip 必须写原因，避免研发重点静默遗漏。
- `docs/原型标注生成规范.md` 是后续 Agent 生成标注的统一流程规范，资产申请、借用、退库、耗材等模块也应按相同方式生成 coverage ledger 和质量检查。
- `PrototypeAnnotationLayer` 在 `App.js` 全局挂载，不再限制 `/yewurules`。普通独立页面按 pathname 隔离标注数据。
- `/yewurules` 的 URL 在内部菜单切换时不变，因此 `AdminContent` 通过 `data-prototype-page-scope` 暴露 `activeMenu / activeSubMenu / activeTab`，标注层监听该 scope 变化并重新加载当前页面标注。
- 新增/重绑采用鼠标实时目标识别，不要求元素先完成 generated-target 预扫描。精确交互控件优先于外层业务字段：点击 Select/Radio/Tab 等命中控件本身；点击字段标签或普通只读值时才回退到 QueryItem/DetailItem/FormItem 等字段语义。
- 标注的 `target` 与序号展示位置是两个概念：`target` 决定规则属于哪个业务对象，并用于高亮、重绑和持久化重建；序号的 `display anchor` 只负责视觉落点。字段/控件直接使用自身，Card/模块优先使用实际标题文字或标题组件，找不到标题时才回退到业务 target 本身。
- 自定义模块可用 `data-prototype-display-anchor` 显式声明标题锚点；公共 `SelectModal` 已用该属性标记标题。Ant Design Card 会优先从 `.ant-card-head-title` 中取得紧凑的实际标题子元素，避免标题容器横向撑满时序号仍跑到页面右侧。
- 标注位置的 `side / align / gap / offsetX / offsetY` 始终相对于 display anchor 计算；编辑态拖动仅修改相对偏移，不改变规则业务 target。
- 标注选择状态下默认点击会完成绑定；若需先执行页面原交互以打开选择弹窗/下拉，按住 Alt/Option 点击时不拦截业务事件、不结束 bindingMode，浮层打开后继续选择内部目标。
- `SelectModal` 通过 `data-prototype-overlay="select-modal"` 进入业务浮层模型；其面板、搜索条件和结果列表分别使用稳定 `data-prototype-bindable`，因此可按“整个选择弹窗 / 某查询条件 / 结果列表”三个层级绑定。按钮、输入框、表头仍按更细粒度规则优先。
- 选择弹窗关闭时，弹窗内 target 因 DOM 卸载自然变成未匹配；再次打开后 MutationObserver 触发重新扫描，稳定 target 会恢复匹配，不额外保存弹窗开关状态。
- `data-prototype-anchor` 继续承担模块级稳定锚点；细粒度 target 根据 page scope + 业务语义生成，不使用 `nth-child`、绝对 CSS 路径或屏幕坐标。
- 公共 `QueryItem`、`DetailItem`、`FormField` 显式声明可标注语义；Button、Table 表头、Tabs、Select、DatePicker、Radio、Checkbox、Segmented、Switch 等常见 Ant Design 控件由目标层自动识别。
- 复合控件内部用于实现组件行为的隐藏 input 不作为独立目标，避免出现一个 Select 同时被识别成 Select 和内部 input 的伪重复目标。
- `annotation-data.js` 是代码基线；用户在页面上的修改只作为浏览器覆盖层保存。旧 `yewurules` 本地覆盖在物料维度组合 scope 中提供兼容读取，保存后进入新 scope。
- 保存时只记录与基线不同的同 id 标注、用户新增标注和删除 id。Agent 后续新增新的基线标注时会自动出现，不会被旧本地快照挡住；已有同 id 的用户覆盖继续优先于新代码基线。
- 标注详细内容继续持久化为 `section.title + items[]`，不新增 HTML 字段。查看态普通 item 自动渲染项目符号；若 item 含 Markdown 块语法则交给 `AnnotationMarkdown`。支持 `**加粗**`、`*斜体*`、行内代码、标题、无序/有序列表、标准管道表格及常用转义；不解析原始 HTML。
- 查看态详情展开状态由标注条目本身和箭头切换，不再在详情区放第二个“收起”按钮；编辑态“收起编辑”继续单独控制编辑器区域。
- 标注点使用 display anchor 的 `getBoundingClientRect` 获取实时位置；业务 target 仍用于浮层归属判断和高亮。滚动和窗口变化通过 `requestAnimationFrame` 合并刷新。
- `ResizeObserver` 同时观察业务 target、独立 display anchor（两者不同时）及热点自身；内容 DOM 增删触发重新扫描；页面 scope 属性单独监听，避免把所有 DOM 属性变化纳入观察。
- 标注点的视觉 z-index 可以高于普通业务页面，但显示前必须判断当前顶层业务浮层。Ant Design Modal/Drawer/Image Preview 自动识别，项目公共 `Modal` 与 `SelectModal` 通过 `data-prototype-overlay` 显式声明；弹窗外目标隐藏，弹窗内目标仍可显示和绑定，避免底层标注穿透遮罩层。
- 标注位置支持 `top / right / bottom / left`、`start / center / end`、间距和像素偏移。
- 标注靠近视口边缘时优先翻转到对侧，最终再约束在可视区域内。
- `PrototypeAnnotationPanel` 通过 React Portal 直接挂载 `document.body`；面板内部只有一个独立滚动区。Tooltip / Popconfirm / Select dropdown 同样显式挂载到 body，并使用高于面板的 popup z-index。

## 后台主导航

`src/pages/yewurules/config/menuConfig.js` 统一维护后台一级菜单及子菜单。

```text
资产管理
├─ 资产维护
├─ 耗材维护
├─ 合约号码维护
├─ 标签打印
├─ 跨公司转移
├─ 资产报废
├─ 账面报废
├─ 资产处置
└─ 员工资产信息查询

无形资产

库存管理
├─ 资产接收
├─ 耗材接收
├─ 入库
├─ 出库
├─ 移库
├─ 转移
└─ 库管员工作台

资产盘点
```

`AdminSidebar` 负责一级菜单展开、子菜单选中；`yewurules.js` 根据 `activeMenu / activeSubMenu` 分发到对应模块。

## 后台资产管理调用关系

```text
AdminSidebar
  ↓ 资产管理
AssetManagementContent
  ├─ AssetMaintenancePage
  ├─ ConsumableMaintenancePage
  ├─ ContractNumberMaintenancePage
  ├─ TagPrintingPage
  ├─ DocumentListPage
  │   ├─ 跨公司转移 → CrossCompanyTransferEditPage
  │   ├─ 资产报废 → ScrapApplicationEdit
  │   │              └─ 第二新建入口 → CrossCompanyTransferEditPage(variant="scrap")
  │   ├─ 账面报废 → AccountingScrapEdit
  │   └─ 资产处置 → AssetDisposalEditPage
  └─ EmployeeAssetInfoQueryPage
```

维护类页面共用 `LedgerMaintenancePage`；跨公司转移、报废、账面报废和处置入口共用 `DocumentListPage`，避免重复实现同结构查询列表。

### `DocumentListPage` 职责

- 查询：申请单号、单据状态、公司、制单时间从/至。
- 列表：申请单、单据状态、公司、制单人、制单时间、资产数量、备注、操作。
- 操作：主创建申请单、可选第二创建入口、删除。
- 资产报废同时提供“创建资产报废申请单”和“创建跨公司转移申请单”。

### 跨公司转移页面

- `CrossCompanyTransferEditPage` 统一维护跨公司转移明细字段和添加/删除物资交互。
- 默认模式用于“资产管理 → 跨公司转移”。
- `variant="scrap"` 用于“资产报废”列表的第二新建入口，基本信息沿用报废申请单口径但隐藏资产大类、资产所在地。
- 两种模式共用同一套跨公司转移明细，避免字段漂移。

### 报废申请页面

- `ScrapApplicationEdit` 保留原有基本字段、必填校验、导入 Excel、增行、删行、保存、提交、退出。
- 报废资产明细不再包含“关联配件”页签和对应逻辑。

## 库存管理调用关系

```text
AdminSidebar
  ↓ 库存管理
InventoryManagementContent
  ├─ 资产接收
  ├─ 耗材接收
  ├─ 入库
  ├─ 出库
  ├─ 移库
  ├─ 转移
  └─ 库管员工作台
```

库存管理按用户已确认截图逐页补充；未确认的新建/详情字段不补造。

## 个人工作台导航

个人工作台由 `src/pages/yewurules/config/workspaceMenuConfig.js` 配置，`WorkspaceMenu` 负责菜单渲染，页面内部通过 `/yewurules` 的 `location.state.workspace` 切换工作台页面。

## 核心业务调用关系

### 资产申请与领用

```text
AssetApplyPage
  ↓ employeeSelfServiceService
AssetApprovalPage
  ↓ employeeSelfServiceWorkflowService
AssetAllocationPage
  ├─ 库存领用 → FrontDeskAssetClaim → EmployeeAssetClaimConfirm
  └─ 统一采购 → UnifiedAssetApplySummary
```

### 资产借用

```text
BorrowingApplyPage → BorrowingAllocationPage → BorrowingApprovalPage → BorrowingIssuePage ↔ BorrowingConfirmPage
```

### 资产更换

```text
ReplacementApplyPage → ReplacementMisPage → ReplacementHandlingPage ↔ ReplacementConfirmPage
```

### 资产退库

```text
AssetReturnApplyPage → AssetReturnApprovalPage → AssetReturnHandlingPage ↔ AssetReturnConfirmPage → 入库
```

### 合约号码退库

```text
ContractReturnApplyPage → ContractReturnHandlingPage ↔ ContractReturnConfirmPage → 入库
```

## 数据流原则

- 页面通过 service 读取和修改业务数据。
- service 通过 `demoStorage` 持久化演示数据。
- 截图仅用于确认业务字段和流程，页面视觉按当前项目规范重构。
- 未确认字段不因数据对象存在而自动展示。
- 未提供业务字段的新增模块只建立入口，不补造数据与规则。

## 页面结构约定

- 查询列表使用 `QueryBar`、`QueryItem` 和 Ant Design Table。
- 列表“共 X 条”放标题右上角，操作按钮放下一行右侧。
- 申请、审批、办理页面使用 Card / Table 分区。
- 选择资产和基础数据优先使用统一选择弹窗。
- 状态优先使用 `StatusTag`。

## 当前演示边界

以下能力仍为前端模拟：

- 后台资产管理和库存管理真实接口。
- 服务号通知。
- 狐小 e 扫码和刷卡硬件。
- 并发资产/号码锁定。
- 真实入库、出库、移库、转移和台账接口。
- 真实权限匹配与定时任务。
