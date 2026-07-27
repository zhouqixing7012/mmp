# ARCHITECTURE.md

## 项目定位

这是一个产品演示用的企业资产管理前端项目。当前重点不是后端联调，而是把页面、流程、演示数据、导航结构和文档整理成可持续维护的形态。

## 顶层文件职责

| 文件/目录 | 职责 |
|---|---|
| `AI_RULES.md` | 约束 AI Agent 的生成行为和交付要求。 |
| `CLAUDE.md` | 约束代码写法和通用组件使用。 |
| `CONTEXT.md` | 记录当前阶段、关键决定、风险和验收路径。 |
| `README.md` | 项目说明、运行方式和当前模块概览。 |
| `ARCHITECTURE.md` | 模块结构、调用关系和数据流。 |
| `docs/` | 页面级和流程级 PRD、审计记录。 |
| `package.json` | 当前依赖和运行命令。 |

## src 目录职责

| 路径 | 职责 |
|---|---|
| `src/App.js` | 根据路由配置生成页面路由。 |
| `src/config/routes.js` | 页面路径、名称、组件和导航分组。 |
| `src/components/Navbar.js` | 顶部导航。 |
| `src/components/StatusTag.js` | 统一状态标签。 |
| `src/components/SelectModal.js` | 通用选择弹窗。 |
| `src/components/QueryBar.js` | 通用查询栏。 |
| `src/mock/employeeSelfServiceMock.js` | 申请人、可选物资和默认申请演示数据。 |
| `src/mock/employeeSelfServiceWorkflowMock.js` | ES 配给人、库存资产、名下资产和部门使用量。 |
| `src/mock/assetClaimMock.js` | 旧版 ES 前台领用、员工确认、可选资产和地点演示数据。 |
| `src/services/demoStorage.js` | localStorage 统一读写。 |
| `src/services/employeeSelfServiceService.js` | 申请单读取、新增和审批更新。 |
| `src/services/employeeSelfServiceWorkflowService.js` | 配给单生成、汇总池同步和申请进度回写。 |
| `src/pages/employeeSelfService/` | 资产申请、业务审批、资产配给及复用组件。 |
| `src/pages/UnifiedAssetApplySummary.js` | 统一申请汇总列表、明细、汇总和只读审批。 |
| `src/pages/FrontDeskAssetClaim.js` | 个人工作台 ES 前台领用。 |
| `src/pages/EmployeeAssetClaimConfirm.js` | 个人工作台员工领用确认。 |
| `src/pages/yewurules/` | 后台框架、侧边栏、工作台菜单、页签和业务模块。 |
| `src/pages/` | 其他旧版业务页面、报废和机房资产页面。 |

## 当前页面模块

| 模块 | 主要页面 |
|---|---|
| 个人工作台 | 工作台首页、号码管理、号码控制、资产申请、业务审批、资产配给、统一申请汇总-资产、ES前台领用、员工领用确认 |
| 资产申请与审批 | `employeeSelfService/AssetApplyPage.js`、`employeeSelfService/AssetApprovalPage.js` |
| 资产配给 | `employeeSelfService/AssetAllocationPage.js` |
| 统一申请汇总 | `UnifiedAssetApplySummary.js` |
| 资产领用 | `FrontDeskAssetClaim.js`、`EmployeeAssetClaimConfirm.js` |
| 后台配置 | `yewurules.js`、`yewurules/`、`xitongrules.js` |
| 报废管理 | `ScrapApplicationEdit.js`、`AccountingScrapEdit.js`、`ApprovalPage.js`、`ScrapInternalReview.js`、`ScrapProcurement*.js` |
| 机房资产 | `AssetDashboard.js`、`AssetManagement.js`、`AssetMaintenanceList.js`、`InfoChangeEdit.js`、`SerialNumberEdit.js`、`MainSpare*.js` |

## 个人工作台导航结构

工作台菜单由 `src/pages/yewurules/config/workspaceMenuConfig.js` 统一配置。

当前仅展示：

```text
工作台首页
号码管理
号码控制
资产申请
业务审批
资产配给
统一申请汇总-资产
ES前台领用
员工领用确认
```

旧页面组件和独立路由继续保留，只从当前工作台菜单中移除。

## 当前核心调用关系

```text
资产申请
  ↓ employeeSelfServiceService
业务审批
  ↓ 审批完成标记待配给
employeeSelfServiceWorkflowService
  ↓ 按申请行和数量拆分
资产配给
  ├─ 库存领用 → ES前台领用 → 员工领用确认
  └─ 统一采购 → 统一申请汇总-资产 → 只读汇总审批
```

## 数据对象关系

| 对象 | 来源 | 去向 |
|---|---|---|
| 资产申请单 | 资产申请页 | 业务审批、资产配给、统一汇总和领用进度 |
| 申请物资明细 | 资产申请单 | 审批详情、配给详情、汇总明细 |
| 配给单 | 审批完成后按申请行和数量拆分 | 库存领用或统一采购 |
| 匹配资产 | 可用库存数据 | ES前台领用和仓库校验 |
| 汇总单 | 统一采购配给结果 | 汇总明细、导出和只读审批 |
| 领用单 | 配给或旧版演示数据 | 员工刷卡/扫码确认 |
| 地点数据 | 地点维护口径的 mock 数据 | 城市、建筑和楼层级联选择 |

## 页面结构约定

### 资产申请

- 申请须知只能通过“已阅读”关闭。
- 物料选择采用五列层级结构。
- 申请预览是页面状态，不使用 Modal。
- 超标数量从申请明细实时计算。

### 业务审批

- 当前展示直接进入详情，不保留前置查询列表。
- 页面只保留申请人、申请物资、审批信息和审批操作。

### 资产配给

- 页面直接进入待配给详情。
- 匹配资产和员工名下资产使用查询弹窗。
- 审批操作栏固定在审批信息之后的页面最下方。

### 统一申请汇总

- 同一组件内部用页面状态区分列表、明细、汇总和审批。
- 超标和非超标申请共用列定义。
- 导出逻辑合并两类明细。
- 审批页复用汇总展示组件，但输入和上传全部只读。

### ES前台领用

- 申请人信息和申请资产信息使用 `Descriptions` 表格式布局。
- 当前仓库和单据备注位于申请人信息区域。
- 资产字段只读和编辑状态在同一表格中展示。
- 资产标签号通过物资列表弹窗选择。
- 地点字段按城市、建筑、楼层级联。
- 仓库不一致时阻止进入员工确认。

### 员工领用确认

- 领用人信息仅展示使用人和部门。
- 明细表格、职责提示、刷卡输入和二维码为主要内容。

## 当前已收敛的设计

| 设计点 | 当前状态 |
|---|---|
| 新旧页面并行 | 当前工作台展示收口后的页面，旧组件和独立路由不删除。 |
| 申请审批同源 | 申请和审批读取同一份演示数据。 |
| 一件一配给单 | 按申请行和数量拆分。 |
| 双支线 | 同一申请允许同时存在库存领用和统一采购。 |
| 汇总池 | 统一采购结果进入统一申请汇总。 |
| 统一查询风格 | 查询区域优先使用 QueryBar 和 QueryItem。 |
| 统一选择交互 | 资产和基础数据选择复用现有选择弹窗结构。 |
| 统一状态样式 | 状态字段优先使用 StatusTag。 |
| 统一演示存储 | 需要持久化的数据通过 service 操作，不在页面直接写 localStorage。 |
| 侧边栏滚动 | 菜单主体使用独立纵向滚动区域。 |

## 当前技术债和后续拆分

| 问题 | 处理方向 |
|---|---|
| ES前台领用和员工确认仍主要使用页面本地状态 | 接入统一 service 和演示存储。 |
| 加签操作主要为 UI 演示 | 增加审批记录和状态持久化。 |
| 统一汇总组件内容偏多 | 后续按列表、明细、汇总表格和只读审批拆分组件。 |
| 资产配给状态切换可能继承页面本地值 | 切换单据时按当前订单重新初始化。 |
| 关键流程缺少自动化回归 | 增加 Playwright 冒烟用例。 |
| 当前分支未完成本地构建验收 | 构建后统一修复编译和交互问题。 |
