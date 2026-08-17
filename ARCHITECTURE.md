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
| `src/components/QueryBar.jsx` | 统一查询区域。 |
| `src/components/StatusTag.jsx` | 统一状态展示。 |
| `src/components/SelectModal.jsx` | 通用选择弹窗。 |
| `src/prototype-annotations/PrototypeAnnotationLayer.jsx` | 全局原型标注层，解析锚点、定位热点、处理拖动/重绑和保存。 |
| `src/prototype-annotations/PrototypeAnnotationPanel.jsx` | 标注查看与可视化编辑面板。 |
| `src/prototype-annotations/annotation-data.js` | Agent 根据仓库 PRD 生成的标注基线。 |
| `src/prototype-annotations/annotation-positioning.js` | 标注点定位、自动翻转和视口约束。 |
| `src/prototype-annotations/annotation-storage.js` | 浏览器标注覆盖层、删除记录和自定义标注持久化。 |
| `src/prototype-annotations/annotation-anchor-scanner.js` | 扫描页面语义锚点并导出上下文。 |
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
  ↓ Agent 识别页面结构和业务规则
业务页面 data-prototype-anchor + annotation-data.js 基线
  ↓
PrototypeAnnotationLayer
  ├─ annotation-positioning.js      side / align / gap / offset + 边缘翻转
  ├─ annotation-storage.js          用户覆盖层 / 新增 / 删除
  ├─ annotation-anchor-scanner.js   当前 DOM 锚点上下文
  └─ PrototypeAnnotationPanel       查看、编辑、重绑、保存、导入导出
```

- PRD 不在页面端上传，也不在前端调用 AI；Agent 直接读取仓库中的 PRD 文件和页面代码生成初始标注。
- 业务页面只声明语义化锚点，不保存标注坐标。
- `annotation-data.js` 是代码基线；用户在页面上的修改只作为浏览器覆盖层保存。
- 保存时只记录与基线不同的同 id 标注、用户新增标注和删除 id。Agent 后续新增新的基线标注时会自动出现，不会被旧本地快照挡住。
- 标注点使用 `getBoundingClientRect` 获取锚点实时位置，滚动和窗口变化通过 `requestAnimationFrame` 合并刷新。
- `ResizeObserver` 负责锚点尺寸变化；`MutationObserver` 只监听 DOM 增删，用于发现动态挂载/卸载的锚点，不监听所有属性。
- 标注位置支持 `top / right / bottom / left`、`start / center / end`、间距和像素偏移。
- 标注靠近视口边缘时优先翻转到对侧，最终再约束在可视区域内。
- 编辑模式下可直接拖动标注点修改偏移，也可在面板内修改内容、重新绑定锚点、新增或删除标注。

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
