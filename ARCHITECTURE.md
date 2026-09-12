# ARCHITECTURE.md

## 项目定位

企业资产管理产品演示前端。仓库负责页面原型、演示流程、PRD 标注和研发评审，不承担生产后端实现。

## 顶层文件职责

| 文件 | 职责 |
|---|---|
| `AGENTS.md` | 项目代码和操作约束。 |
| `AI_RULES.md` | AI 开发规则。 |
| `CONTEXT.md` | 当前进度、停留位置和关键决定。 |
| `README.md` | 功能、运行、部署、测试和搜索记录。 |
| `ARCHITECTURE.md` | 模块职责、调用关系和交付方式。 |
| `lessons.md` | 用户已确认的产品/实现经验。 |
| `docs/UI_MOTION_GUIDELINES.md` | B 端统一动效规则和新增页面检查清单。 |

## src 目录职责

| 路径 | 职责 |
|---|---|
| `src/App.js` | 应用路由入口；统一为所有 React Router 路由切换触发页面进入动效，并挂载原型标注层。 |
| `src/index.css` | 全局样式以及统一 B 端动效 Token、弹窗/页面/菜单/路由/表格反馈样式。 |
| `src/components/` | QueryBar、DetailGrid、SelectModal、StatusTag、PageViewMotion 等公共组件。 |
| `src/components/PageViewMotion.jsx` | 同一 URL 内列表 / 详情 / 编辑 / 创建等整块业务视图切换的统一动效容器。 |
| `src/hooks/` | 可复用交互 Hook；当前包含表格新增/修改后的短暂行高亮。 |
| `src/mock/` | 演示数据。 |
| `src/services/` | 演示流程、状态和 `demoStorage` 读写。 |
| `src/pages/employeeSelfService/` | 资产申请、审批、配给等员工自助页面。 |
| `src/pages/assetBorrowing/` | 资产借用。 |
| `src/pages/assetReplacement/` | 资产更换。 |
| `src/pages/assetReturn/` | 资产退库、合约号码退库。 |
| `src/pages/assetManagement/` | 后台资产管理。 |
| `src/pages/inventoryManagement/` | 库存管理。 |
| `src/pages/inventoryManagement/ConsumableReceiptPage.js` | 耗材接收 PO、REC、低值耐用品逐件维护和低耗自动入库演示。 |
| `src/pages/inventoryManagement/consumableReceiptMock.js` | 耗材接收演示 PO、接收单、物料和公司耗材仓匹配数据。 |
| `src/pages/inventoryManagement/InboundPage.js` | 入库单列表、新增入库/采购接收/退库入库/借用归还四类编辑页，以及对应添加/选择物资弹窗。 |
| `src/pages/inventoryManagement/OutboundPage.js` | 出库单列表、领用出库/借用出库两类编辑页，以及对应添加物资弹窗。 |
| `src/pages/inventoryManagement/MovePage.js` | 移库发起页、创建页、添加物资弹窗，以及接收单据页签入口。 |
| `src/pages/inventoryManagement/MoveReceiveContent.js` | 移库接收单列表、接收详情、接收资产明细弹窗和接收/驳回操作。 |
| `src/pages/inventoryManagement/TransferPage.js` | 库存转移单列表、创建页和添加转移物资弹窗。 |
| `src/pages/assetInventory/` | 资产盘点。 |
| `src/pages/yewurules/` | 后台框架、菜单和页面 scope。 |
| `src/prototype-annotations/` | 标注基线、Coverage、target、定位、编辑、评审和诊断。 |

## 原型标注架构

```text
仓库 PRD
  +
React 页面代码
  ↓
Requirement Atom
  ↓
annotation data / PRD audit
  ↓
Coverage Ledger
  ├─ bound  已绑定准确对象
  ├─ review PRD/原型/实现存在差异或没有可靠承载点
  └─ skip   明确无需单独标注
  ↓
annotation-quality.js
  ├─ Granularity Check
  └─ Coverage Check
  ↓
annotation-base-registry.js
annotation-coverage-registry.js
  ↓
annotation-targeting.js
  ↓
PrototypeAnnotationLayer
  ↓
PrototypeAnnotationPanel / 评审工具
```

### 核心文件

| 文件 | 职责 |
|---|---|
| `PrototypeAnnotationLayer.jsx` | 全局标注层，负责 scope、目标解析、热点、重绑、拖动和业务浮层。 |
| `PrototypeAnnotationPanel.jsx` | 查看/编辑面板，支持保存、导入导出、动态目标状态。 |
| `annotation-page-scope.js` | 独立路由和 `/yewurules` 内部页面的 scope 解析。 |
| `annotation-targeting.js` | 生成和解析 Button、字段、Tab、表头、Descriptions、FormItem、QueryItem、SelectModal 等稳定 target。 |
| `annotation-positioning.js` | 根据 display anchor 计算热点位置、翻转和视口约束。 |
| `annotation-storage.js` | “代码基线 + 用户覆盖层”保存。 |
| `annotation-quality.js` | 标注粒度和 Coverage 完整性检查。 |
| `annotation-coverage-registry.js` | 汇总员工自助各模块的基线标注和 Coverage。 |
| `annotation-coverage-ui.js` | PRD 覆盖中心。 |
| `annotation-match-quality.js` | 区分精确、语义兼容、歧义和未匹配。 |
| `annotation-review-mode-ui.js` | 按重点规则逐条评审。 |
| `annotation-action-anchor-bridge.js` | 对页面唯一动作按钮做保守语义恢复，并提供运行诊断。 |
| `annotation-hotspot-collision.js` | 热点碰撞避让。 |
| `annotation-tool-hub-ui.js` | 统一入口：PRD覆盖、匹配质量、评审模式、运行诊断。 |
| `contract-number-annotation-target-fixes.js` | 合约号码重复行内动作的显式 target 修正。 |

## 标注目标规则

优先级固定为：

```text
Button / Descriptions字段 / 表头 / Tab / Radio / Checkbox / Select / DatePicker / Upload / Input
  ↓
DetailItem / FormItem / QueryItem / SelectModal 语义块
  ↓
Card / Table / Form / module
```

具体对象规则不能为了“能匹配”退回模块：

- `action-rule` → Button。
- `field-rule` → 字段或控件。
- `tab-rule` → Tab。
- `table-column-rule` → 表头。

`target` 负责业务归属和稳定重建，`display anchor` 只负责序号视觉位置。

表格内重复行操作是一个特殊但明确的场景：如果 PRD 规则本身属于“发送通知”这种重复行内动作，标注仍必须落在 Button。当前使用无序号后缀的同语义 target，始终指向当前可见表格中的首个同语义按钮；不能因为按钮重复而退回 Card。

## 员工自助 Coverage

当前已完成 10 个主要业务模块深审，合计 854 条规则：

| 模块 | 规则数 |
|---|---:|
| 个人工作台 | 36 |
| 资产申请 | 102 |
| 新员工与实习生资产领用 | 55 |
| 合约号码申请 | 78 |
| 耗材申请 | 104 |
| 资产借用 | 106 |
| 资产更换 | 106 |
| 资产转移 | 82 |
| 资产退库 | 110 |
| 合约号码退库 | 75 |

下一阶段以 Coverage 中的 `review` 为实际任务池，不再以“继续增加 resolver 兼容逻辑”为主线。

## 业务页面调用关系

```text
个人工作台
  ↓
员工自助业务页
  ↓
业务 Service
  ↓
demoStorage
  ↓
localStorage

库存管理
  ↓
资产接收 / 耗材接收 / 入库 / 出库 / 移库 / 转移等页面
  ↓
页面内演示状态 + Mock
```

后台页面继续复用 `QueryBar / QueryItem`、`DetailGrid / DetailItem`、`StatusTag`、`SelectModal` 和 Ant Design Table。耗材接收复用资产接收的页面骨架，但按物资类型分为“低值耐用品逐件维护”和“低耗接收后自动入库”两条状态流。入库单由独立 `InboundPage` 承载：公共单据头保持一致，新增入库、采购接收、退库入库、借用归还只在物资列表和添加/选择物资区域按业务类型分叉。出库单由独立 `OutboundPage` 承载：领用出库、借用出库共用单据头，只在物资列表和出库业务维护字段分叉。移库由 `MovePage + MoveReceiveContent` 承载发起和接收两侧；库存转移由独立 `TransferPage` 承载现有查询列表、创建页和添加转移物资弹窗。

### 统一动效

- 动效参数集中在 `src/index.css`，统一使用 100 / 140 / 180 / 220ms 四档时长，业务页面不得自定义另一套时长和缓动。
- `src/components/Modal.js` 与 `src/components/SelectModal.jsx` 通过延迟卸载完成进入/退出动画，关闭时先播放约 140ms 退出再移除 DOM。
- `AdminContent` 以 `activeMenu / activeSubMenu / activeTab` 组成的页面 scope 作为 key，在统一内容出口触发 180ms 的轻量淡入 + 6px 上移动效，不在各业务页面重复实现。
- `src/App.js` 以 `location.key` 作为路由出口 key，所有 React Router 路由跳转统一复用 `mmp-page-motion`；按钮中的 `navigate()` 与普通 `Link` 不需要各自维护动画参数。
- `src/components/PageViewMotion.jsx` 处理同一 URL 内的 `list / detail / editor / create` 等整块视图替换，业务页只传真实 `viewKey`，继续复用现有页面动效。
- `AdminSidebar` 使用 `mmp-sidebar-collapse` 让二级菜单平滑展开/收起；`Navbar` 使用 `mmp-nav-dropdown` 处理顶部路由下拉。
- 只有明确可点击的卡片/操作块才使用 `mmp-interactive-card`；普通信息 Card 不增加上浮反馈。
- `src/hooks/useTransientRowHighlight.js` 为新增/修改成功后的表格行提供约 900ms 的短暂高亮，业务页只在数据真正成功落地后触发。
- 全局遵循 `prefers-reduced-motion`，用户开启“减少动态效果”时关闭页面、路由和表格反馈动画，并将组件过渡压缩到近乎即时。
- 当前实现不新增第三方动画依赖；如果后续出现复杂共享布局或多阶段编排，再评估 Motion for React。
- 新页面必须遵循 `docs/UI_MOTION_GUIDELINES.md`，避免把统一动效重新拆散到页面内部。

## 研发评审交付架构

```text
main
持续产品迭代
  ↓ 用户手动选择性同步
review/rd-review
阶段性已确认结论
  ↓
Vercel Preview
  ↓
研发评审
```

原则：

- `main` 和评审分支不自动同步。
- 评审分支只接收用户明确决定同步的 PRD/原型变化。
- 每次评审分支升级都维护一个评审版本号和更新说明。
- 更新说明分为“PRD 变化”和“原型变化”，打开评审页面时弹出，避免研发不知道本次版本变化。

## 当前边界

- 真实后端接口、真实审批引擎、消息中心、权限中心等不在本仓库实现；Coverage 中会明确标为 `review`，不能用前端演示逻辑冒充完成。
- 资产盘点未提供字段的维护页不补造。
- Mock 仅用于当前产品演示，不代表生产实现。
