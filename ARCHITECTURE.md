# ARCHITECTURE.md

## 项目定位

这是一个产品演示用的企业资产管理前端项目。当前重点不是后端联调，而是把页面、流程、演示数据和导航结构整理成可持续维护的形态。

## 顶层文件职责

| 文件/目录 | 职责 |
|---|---|
| `AI_RULES.md` | 约束 AI Agent 的生成行为，避免无关重构、重复造组件和直接操作 localStorage。 |
| `CLAUDE.md` | 约束代码写法，说明 Ant Design、StatusTag、SelectModal、QueryBar 的使用规则。 |
| `CONTEXT.md` | 记录当前进度、上次停的位置和近期关键决定。 |
| `README.md` | 给人看的项目说明，包含技术栈、运行方式、模块说明和整改记录。 |
| `package.json` | 项目依赖和运行命令，技术栈版本以它为准。 |

## src 目录职责

| 路径 | 职责 |
|---|---|
| `src/App.js` | 应用入口，读取 `src/config/routes.js` 并生成 React Router 路由。 |
| `src/index.js` | React 应用挂载入口。 |
| `src/config/routes.js` | 全部页面路由配置，包含路径、名称、页面组件和导航分组。 |
| `src/components/Navbar.js` | 顶部导航，消费 `navGroups` 按模块展示页面入口。 |
| `src/components/StatusTag.js` | 统一状态标签显示。 |
| `src/components/SelectModal.js` | 统一弹窗选择组件。 |
| `src/components/QueryBar.js` | 统一查询栏布局。 |
| `src/mock/` | 演示数据目录。 |
| `src/mock/assetApplicationMock.js` | 旧版资产申请演示数据。 |
| `src/mock/employeeSelfServiceMock.js` | 员工自助新版申请人、可选资产和默认申请单数据。 |
| `src/services/` | 演示数据读写服务目录，页面不直接操作 localStorage。 |
| `src/services/demoStorage.js` | 统一封装 localStorage 读写。 |
| `src/services/employeeSelfServiceService.js` | 员工自助新版申请单读取、新增和审批更新。 |
| `src/pages/employeeSelfService/` | 员工自助新版资产申请、业务审批和复用展示组件。 |
| `src/pages/` | 其他资产申请、审批、报废、机房资产和后台配置页面。 |
| `src/prototype-annotations/` | 原型标注层。 |

## 当前页面模块

| 模块 | 主要页面 |
|---|---|
| 员工自助新版 | `employeeSelfService/AssetApplyPage.js`、`employeeSelfService/AssetApprovalPage.js` |
| 个人工作台旧版 | `applylist.js`、`zichanshenqing.js`、`zichanshenqingshenpi.js`、`zichanpeiji.js` |
| 报废管理 | `ScrapApplicationEdit.js`、`AccountingScrapEdit.js`、`ApprovalPage.js`、`ScrapInternalReview.js`、`ScrapProcurement*.js` |
| 机房资产 | `AssetDashboard.js`、`AssetManagement.js`、`AssetMaintenanceList.js`、`InfoChangeEdit.js`、`SerialNumberEdit.js`、`MainSpare*.js` |
| 责任人变更 | `ResponsiblePersonEdit.js`、`ResponsiblePersonReceiverApproval.js`、`ResponsiblePersonPhysicalApproval.js` |
| 域名证书 | `DomainCertList.js`、`PCSDashboard.js`、`PCSDashboard2.js` |
| 后台配置 | `yewurules.js`、`xitongrules.js` |

## 调用关系

```text
index.js
  ↓
App.js
  ↓
src/config/routes.js
  ├─ 提供 routes 给 App.js 创建页面路由
  └─ 提供 navGroups 给 Navbar.js 创建导航

员工自助新版资产申请
  ├─ 读取 employeeSelfServiceMock.js
  ├─ 使用 SelectModal 选择资产
  └─ 调用 employeeSelfServiceService.js 新增申请单

员工自助新版业务审批
  ├─ 调用 employeeSelfServiceService.js 读取同一份申请数据
  ├─ 同意后推进直属领导、5级、7级和 VP/CFO 节点
  └─ 业务审批完成后将任务状态改为待配给

employeeSelfServiceService.js
  ↓
demoStorage.js
  ↓
localStorage
```

## 当前已收敛的设计

| 设计点 | 当前状态 |
|---|---|
| 新旧页面并行 | 员工自助新版使用独立路由和菜单，旧页面及旧路由不修改。 |
| 申请审批同源 | 新版申请和审批读取同一份演示数据。 |
| 外包员工限制 | 外包员工在申请页面直接拦截。 |
| 超标审批 | 超标申请必经直属领导、5级及以上、7级及以上；必要时逐级到 VP/CFO。 |
| 统一存储 | 页面通过 service 操作演示数据，不直接操作 localStorage。 |

## 后续拆分原则

| 问题 | 拆分方式 |
|---|---|
| ES 配给 | 新增独立配给模块，按申请行和数量生成配给单。 |
| 汇总采购 | 统一采购进入待汇总池，按月集中提交。 |
| 资产领用 | 复用现有前台领用和员工确认页面结构，接入新版数据。 |
| 页面文件过大 | 按列表、表单、详情和操作区拆分。 |
| 相似审批页复制 | 抽出审批信息、审批时间线和审批操作通用结构。 |
