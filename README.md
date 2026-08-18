# 企业资产管理系统（Asset Management System）

## 项目简介

这是一个用于产品演示的企业资产管理前端项目，不是生产系统。当前覆盖员工资产申请、审批、配给、领用、借用、更换、退库、合约号码退库、后台资产管理、库存管理、资产盘点、报废和机房资产等场景。

## 技术架构

- React 19 + Create React App
- React Router 7
- Ant Design 6
- Tailwind CSS
- Lucide React
- Recharts
- Playwright

主要分层：

```text
页面组件
  ↓
业务 Service
  ↓
demoStorage
  ↓
localStorage 演示数据
```

查询区域优先复用 `QueryBar / QueryItem`，状态优先复用 `StatusTag`，选择类字段优先复用 `SelectModal`。

## 项目结构

```text
src/
├── components/                     # 通用查询、状态、选择弹窗等组件
├── mock/                           # 演示数据
├── services/                       # 演示数据与流程读写
├── prototype-annotations/          # 原型标注数据、目标解析、定位、编辑和本地覆盖层
├── pages/
│   ├── assetManagement/            # 后台资产管理
│   ├── inventoryManagement/        # 库存管理菜单与页面入口
│   ├── assetInventory/             # 资产盘点菜单、项目、快照和盘点计划
│   ├── employeeSelfService/        # 资产申请、审批、配给等
│   ├── assetBorrowing/             # 资产借用
│   ├── assetReplacement/           # 资产更换
│   ├── assetReturn/                # 资产退库、合约号码退库
│   └── yewurules/                  # 后台框架、菜单与配置
├── App.js
└── index.js
```

## 原型标注

业务页面可以声明模块级稳定锚点，例如：

```jsx
<div data-prototype-anchor="material-query-bar">...</div>
```

Agent 直接读取仓库中的 PRD 与 React 页面代码，在需要的位置补充语义化锚点，并把初始标注写入 `src/prototype-annotations/annotation-data.js`。页面端不做 PRD 上传和 AI 解析。

除模块锚点外，标注编辑器还支持细粒度目标：

- `QueryItem` 查询条件：公共组件通过 `data-prototype-bindable="query-condition"` 暴露稳定语义。
- Button：按所在模块、按钮文字/语义和出现顺序生成稳定运行时 target。
- Ant Design Table 表头：可直接标注某一列字段。
- FormItem：可标注单个表单字段。

细粒度目标由 `src/prototype-annotations/annotation-targeting.js` 统一生成和解析，不保存 `nth-child`、绝对 CSS 路径或屏幕坐标。

每条标注可通过 `position` 指定位置：

```js
position: {
  side: 'right',       // top / right / bottom / left
  align: 'center',     // start / center / end
  gap: 8,
  offsetX: 0,
  offsetY: 0,
  viewportPadding: 8,
}
```

定位层负责滚动跟随、尺寸变化、动态 DOM、屏幕边缘自动翻转和视口内约束。业务页面不保存屏幕绝对坐标，也不自行处理标注位置。

页面右下角打开“标注”后可切换到编辑模式，支持：

- 拖动标注点调整位置。
- 修改标题、摘要、来源、类型和详细说明。
- 重新选择模块、具体按钮、单个查询条件、表格字段或 FormItem。
- 新增、删除标注。
- 保存到当前浏览器、导入/导出标注 JSON、导出当前页面模块与细粒度目标。

标注面板通过 React Portal 直接渲染到 `document.body`，内部使用独立滚动区；Tooltip、Popconfirm、Select dropdown 也显式渲染到 body 并使用更高层级，避免业务页面 stacking context 或面板 overflow 造成遮挡。

保存采用“代码初稿 + 用户覆盖层”模型：仓库中的标注始终是 PRD 基线，浏览器只保存用户改过的同 id 标注、用户新增标注和删除记录。因此 Agent 后续根据 PRD 新增标注时，新标注会自动出现；已经人工调整过的标注仍保留用户版本。

## 后台资产管理菜单

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
```

资产管理九个子菜单均已建立并按已确认字段完成主要原型。跨公司转移、资产报废、账面报废、资产处置均先进入统一单据查询列表，点击新建后在后台内容区嵌入对应编辑页。

资产报废列表额外提供“创建跨公司转移申请单”入口；报废申请单仅保留报废资产明细，不再展示关联配件页签。该跨公司转移入口复用报废申请单基本信息结构，隐藏资产大类、资产所在地，并使用与跨公司转移菜单页一致的跨公司转移明细。

## 库存管理菜单

一级菜单“库存管理”位于“无形资产”下方：

```text
库存管理
├─ 资产接收
├─ 耗材接收
├─ 入库
├─ 出库
├─ 移库
├─ 转移
└─ 库管员工作台
```

当前库存管理已完成资产接收、入库、出库、移库、转移和库管员工作台的已确认列表/查询原型；耗材接收及部分新建/详情页继续等待字段确认。

## 资产盘点菜单

一级菜单“资产盘点”按旧系统信息架构保留 4 个子菜单：

```text
资产盘点
├─ 公司-账套对应关系
├─ 盘点规则
├─ 盘点项目
└─ 盘点差异报表
```

2026-08-18 用户提供的操作轨迹完整覆盖“盘点项目”。当前已按项目统一 UI 规范重构以下链路：

```text
盘点项目列表
  → 创建盘点项目 / 筛选盘点范围
  → 生成快照
  → 快照清单统计 / 需盘 / 无需盘 / 未包含资产
  → 生成盘点计划
  → 配置计划负责人 / 盘点监督人 / 盘点执行人
  → 启动盘点计划
```

页面继续复用 `QueryBar / QueryItem`、`DetailGrid / DetailItem`、`StatusTag`、`SelectModal` 和 Ant Design Table。轨迹未提供“公司-账套对应关系”“盘点规则”“盘点差异报表”的页面字段，因此当前只建立入口，不补造数据和交互。

## 核心流程

```text
资产申请 → 业务审批 → 资产配给
                         ├─ 库存领用 → ES前台领用 → 员工领用确认
                         └─ 统一采购 → 统一申请汇总-资产
```

```text
资产借用 → 借用配给 → 借用审批 → 借用发放 → 员工借用确认
```

```text
资产更换申请 → MIS鉴定 → 旧资产退回确认 → 新资产发放 → 新资产领取确认
```

```text
资产退库 → 领导/MIS审批 → 资产退库办理 → 员工退库确认 → 入库
```

```text
合约号码退库 → 合约号码退库办理 → 员工号码退库确认 → 入库
```

## 本地运行

```bash
npm install
npm start
```

默认访问：`http://localhost:3000`

## 构建与部署

```bash
npm run build
npm run deploy
```

## 测试

```bash
npm test
```

关键人工验收路径见 `CONTEXT.md`。

## 已完成功能

- 后台资产管理九个子菜单入口。
- 资产维护、耗材维护、合约号码维护查询/编辑/导出。
- 标签打印、预打印、打印历史。
- 跨公司转移查询列表和嵌入式申请页。
- 资产报废、账面报废、资产处置单据查询列表及嵌入式编辑页。
- 资产报废列表第二个“创建跨公司转移申请单”入口。
- 员工资产信息查询。
- 库存管理一级菜单及 7 个子菜单入口。
- 资产盘点一级菜单及 4 个子菜单入口。
- 盘点项目列表、盘点范围、快照、快照清单、盘点计划、人员选择和启动计划原型。
- 资产申请、审批、配给、领用、借用、更换、退库和合约号码退库演示流程。
- 后台基础配置主要页面。
- 报废和机房资产演示页面。
- 原型标注支持模块/细粒度 DOM 目标、可配置位置、滚动跟随、可视化编辑、本地覆盖保存和 JSON 导入导出。

## 待办事项

- 补充资产盘点“公司-账套对应关系”“盘点规则”“盘点差异报表”的页面轨迹或明确字段后再实现。
- 根据截图继续补充库存管理耗材接收及各单据新建/详情页。
- 按页面继续验收资产管理现有流程字段和交互。
- 按仓库 PRD 逐页补充原型语义锚点和初始标注数据。
- 补充关键流程 Playwright 冒烟测试。

## 主要文档

- `AI_RULES.md`：AI 开发行为约束
- `CLAUDE.md`：代码和组件规范
- `CONTEXT.md`：当前进度、关键决定和验收路径
- `ARCHITECTURE.md`：模块职责、调用关系和数据流

## 搜索记录

- 后台资产维护及报废查询列表复用仓库现有 `QueryBar`、Ant Design Table、`StatusTag` 等能力，没有新增第三方依赖。
- 跨公司转移继续复用 `DocumentListPage`、`SelectModal` 和现有基础数据 mock，不新增第三方依赖。
- 库存管理直接复用现有后台菜单渲染结构，没有引入外部方案或新增依赖。
- 资产借用、更换、退库等流程继续复用项目现有 service + `demoStorage` 结构。
- 2026-08-17 原型标注升级参考 GitHub 的 Floating UI、Driver.js、React Joyride，以及 skills.sh 的 Agentation。保留现有产品标注数据模型，只吸收 DOM 锚定、可配置 placement、边缘避让和低频 DOM 监听思路；当前 22px 标注点定位需求较轻，不引入新的第三方运行时依赖。
- 2026-08-17 标注面板遮挡问题按 Ant Design 官方 popup container / zIndexPopup 机制重构：面板 Portal 到 body，Tooltip / Popconfirm / Select popup 也统一挂载 body，并增加细粒度 DOM target scanner，不新增第三方依赖。
- 2026-08-18 资产盘点直接复用现有后台菜单、查询、详情网格、状态和选择弹窗能力；业务字段来自用户操作轨迹，不引入第三方依赖，也不为未采集页面补造字段。
