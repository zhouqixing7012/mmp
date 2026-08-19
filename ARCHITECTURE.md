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

## src 目录职责

| 路径 | 职责 |
|---|---|
| `src/App.js` | 应用路由入口，全局挂载原型标注层。 |
| `src/components/` | QueryBar、DetailGrid、SelectModal、StatusTag 等公共组件。 |
| `src/mock/` | 演示数据。 |
| `src/services/` | 演示流程、状态和 `demoStorage` 读写。 |
| `src/pages/employeeSelfService/` | 资产申请、审批、配给等员工自助页面。 |
| `src/pages/assetBorrowing/` | 资产借用。 |
| `src/pages/assetReplacement/` | 资产更换。 |
| `src/pages/assetReturn/` | 资产退库、合约号码退库。 |
| `src/pages/assetManagement/` | 后台资产管理。 |
| `src/pages/inventoryManagement/` | 库存管理。 |
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
```

后台页面继续复用 `QueryBar / QueryItem`、`DetailGrid / DetailItem`、`StatusTag`、`SelectModal` 和 Ant Design Table。

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
