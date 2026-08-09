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

## 后台主导航

`src/pages/yewurules/config/menuConfig.js` 统一维护后台一级菜单及子菜单。

```text
资产管理
├─ 资产维护
├─ 耗材维护
├─ 合约号码维护
├─ 标签打印
├─ 公司间转移
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
  ├─ DocumentListPage（资产报废 / 账面报废 / 资产处置）
  └─ EmployeeAssetInfoQueryPage
```

维护类页面共用 `LedgerMaintenancePage`；报废/处置入口共用 `DocumentListPage`，避免重复实现同结构查询列表。

### `DocumentListPage` 职责

- 查询：申请单号、单据状态、公司、制单时间从/至。
- 列表：申请单、单据状态、公司、制单人、制单时间、资产数量、备注、操作。
- 操作：对应创建申请单、删除。
- 资产报废新建复用 `/BaofeiShenqing`。
- 账面报废新建复用 `/`。
- 资产处置新建页字段未确认，不自行定义表单。

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

当前库存管理只建立导航和页面入口。每个子页面在截图和字段确认前只展示空状态，不补造业务结构。

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
