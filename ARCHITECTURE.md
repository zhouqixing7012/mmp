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
| `src/components/Navbar.js` | 顶部导航，消费 `navGroups` 按模块展示页面入口，点击页面入口后自动收起菜单。 |
| `src/components/StatusTag.js` | 统一状态标签显示，避免各页面重复写状态颜色。 |
| `src/components/SelectModal.js` | 统一弹窗选择组件。 |
| `src/components/QueryBar.js` | 统一查询栏布局。 |
| `src/mock/` | 演示数据目录，后续新增数据应优先放这里。 |
| `src/mock/assetApplicationMock.js` | 资产申请链路的演示数据源，包含可选物资、分类树、申请原因和默认申请单。 |
| `src/services/` | 演示数据读写服务目录，页面不直接操作 localStorage。 |
| `src/services/demoStorage.js` | 统一封装 localStorage 读写，并提供资产申请数据的读取、保存、新增和重置方法。 |
| `src/pages/` | 页面组件目录，承载资产申请、审批、报废、机房资产、后台配置等页面。 |
| `src/prototype-annotations/` | 原型标注层，用于演示或辅助说明。 |

## 当前页面模块

| 模块 | 主要页面 |
|---|---|
| 个人工作台 | `applylist.js`、`zichanshenqing.js`、`zichanshenqingshenpi.js`、`zichanpeiji.js` |
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

Navbar.js
  ↓
用户点击导航
  ↓
React Router 渲染对应 pages 页面

pages 页面
  ├─ 复用 components 下的通用组件
  ├─ 读取 src/mock 下的演示数据
  └─ 通过 service 层读写 localStorage，不直接在页面里操作

zichanshenqing.js
  ├─ 读取 src/mock/assetApplicationMock.js 的分类、物资和原因选项
  └─ 提交时调用 src/services/demoStorage.js 写入资产申请单
```

## 当前已收敛的设计

| 设计点 | 当前状态 |
|---|---|
| 路由映射 | `App.js` 不再维护单独的 `componentMap`，直接使用 route 的 `Page` 字段。 |
| 导航展示 | `Navbar.js` 使用 `navGroups` 按模块展示，避免所有页面平铺，点击具体页面后自动收起。 |
| 文档入口 | `AI_RULES.md` 管 AI 行为，`CLAUDE.md` 管编码规则，`CONTEXT.md` 管当前状态。 |
| 技术栈版本 | 以 `package.json` 为准，README 已按当前依赖修正。 |
| 演示数据入口 | 资产申请页已开始通过 mock + service 组合读写演示数据。 |

## 后续拆分原则

| 问题 | 拆分方式 |
|---|---|
| 页面文件过大 | 按列表、表单弹窗、详情抽屉、列配置拆分。 |
| mock 数据散落 | 移到 `src/mock/`，页面只消费数据。 |
| localStorage 分散 | 建 service 层统一读写，页面不直接操作。 |
| 状态颜色重复 | 统一使用 `StatusTag`，不要在页面内重复声明颜色。 |
| 相似审批页复制 | 抽出审批信息、审批时间线、审批操作等通用结构。 |
