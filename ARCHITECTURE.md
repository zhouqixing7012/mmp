# ARCHITECTURE.md

## 项目定位

这是一个产品演示用的企业资产管理前端项目。当前重点不是后端联调，而是把页面、流程、演示数据和导航结构整理成可持续维护的形态。

## 顶层文件职责

| 文件/目录 | 职责 |
|---|---|
| `AI_RULES.md` | 约束 AI Agent 的生成行为。 |
| `CLAUDE.md` | 约束代码写法和通用组件使用。 |
| `CONTEXT.md` | 记录当前进度和关键决定。 |
| `README.md` | 项目说明、运行方式和模块说明。 |
| `package.json` | 当前依赖和运行命令。 |

## src 目录职责

| 路径 | 职责 |
|---|---|
| `src/App.js` | 根据路由配置生成页面路由。 |
| `src/config/routes.js` | 页面路径、名称、组件和导航分组。 |
| `src/components/Navbar.js` | 顶部导航。 |
| `src/components/StatusTag.js` | 统一状态标签。 |
| `src/components/SelectModal.js` | 统一选择弹窗。 |
| `src/components/QueryBar.js` | 统一查询栏。 |
| `src/mock/employeeSelfServiceMock.js` | 新版申请人、可选资产和默认申请单。 |
| `src/mock/employeeSelfServiceWorkflowMock.js` | ES 配给人、可用库存、名下资产和部门使用量。 |
| `src/services/demoStorage.js` | localStorage 统一读写。 |
| `src/services/employeeSelfServiceService.js` | 新版申请单读取、新增和审批更新。 |
| `src/services/employeeSelfServiceWorkflowService.js` | 配给单生成、汇总池同步和原申请进度回写。 |
| `src/pages/employeeSelfService/` | 新版申请、审批、配给、汇总采购及复用组件。 |
| `src/pages/` | 其他旧版业务页面。 |

## 当前页面模块

| 模块 | 主要页面 |
|---|---|
| 员工自助新版 | `AssetApplyPage.js`、`AssetApprovalPage.js`、`AssetAllocationPage.js`、`PurchaseSummaryPage.js` |
| 个人工作台旧版 | `applylist.js`、`zichanshenqing.js`、`zichanshenqingshenpi.js`、`zichanpeiji.js` |
| 报废管理 | `ScrapApplicationEdit.js`、`AccountingScrapEdit.js`、`ApprovalPage.js`、`ScrapInternalReview.js`、`ScrapProcurement*.js` |
| 机房资产 | `AssetDashboard.js`、`AssetManagement.js`、`AssetMaintenanceList.js`、`InfoChangeEdit.js`、`SerialNumberEdit.js`、`MainSpare*.js` |
| 后台配置 | `yewurules.js`、`xitongrules.js` |

## 员工自助新版调用关系

```text
资产申请
  ↓
employeeSelfServiceService
  ↓
业务审批
  ↓ 审批完成标记待配给
employeeSelfServiceWorkflowService
  ↓ 按申请行和数量拆单
资产配给
  ├─ 库存领用 → 待领用
  └─ 统一采购 → 待汇总池
                    ↓
                汇总采购
                    ↓
              采购与 PR 流程
```

## 数据对象关系

| 对象 | 来源 | 去向 |
|---|---|---|
| 资产申请单 | 申请页 | 审批、配给、汇总、领用进度 |
| 配给单 | 审批完成后自动拆分 | 库存领用或统一采购 |
| 汇总单 | 统一采购配给单实时汇入 | 采购系统和 PR 流程 |
| 匹配资产 | 可用库存数据 | 后续资产领用单 |

## 当前已收敛的设计

| 设计点 | 当前状态 |
|---|---|
| 新旧页面并行 | 新版使用独立路由，旧页面不修改。 |
| 申请审批同源 | 申请和审批读取同一份数据。 |
| 一件一配给单 | 按申请行和数量拆分。 |
| 双支线 | 同一申请允许同时存在库存领用和统一采购。 |
| 汇总池 | 统一采购实时进入待汇总池。 |
| 统一存储 | 页面只通过 service 操作演示数据。 |

## 后续拆分原则

| 问题 | 拆分方式 |
|---|---|
| 资产领用 | 复用现有前台领用和员工确认结构，接入新版配给数据。 |
| 签字确认 | 独立员工确认组件，不写入领用展示组件。 |
| 出库和台账 | 通过 service 同时更新领用单、申请单和资产卡片。 |
| 页面文件过大 | 按列表、详情、选择弹窗和操作区拆分。 |
