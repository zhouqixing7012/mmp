# 企业资产管理系统（Asset Management System）

## 项目简介

这是一个用于产品设计、研发评审和流程演示的企业资产管理前端项目，不是生产系统。当前覆盖员工自助、资产申请/借用/更换/退库、耗材、合约号码、库存管理、后台资产管理、资产盘点、报废和机房资产等场景。

## 技术架构

- React 19 + Create React App
- React Router 7
- Ant Design 6
- Tailwind CSS
- Lucide React
- Recharts
- Playwright

主要数据链路：

```text
页面组件
  ↓
业务 Service
  ↓
demoStorage
  ↓
localStorage 演示数据
```

原型标注链路：

```text
仓库 PRD + React 页面代码
  ↓
Requirement Atom
  ↓
细粒度 annotation target
  ↓
Coverage Ledger（bound / review / skip）
  ↓
Granularity / Coverage Check
  ↓
页面标注、匹配质量、评审模式
```

## 项目结构

```text
src/
├── components/                     # QueryBar、DetailGrid、SelectModal、StatusTag 等公共组件
├── mock/                           # 演示数据
├── services/                       # 业务流程和本地数据读写
├── prototype-annotations/          # 标注、target、Coverage、评审和诊断能力
├── pages/
│   ├── employeeSelfService/        # 资产申请、审批、配给等
│   ├── assetBorrowing/             # 资产借用
│   ├── assetReplacement/           # 资产更换
│   ├── assetReturn/                # 资产退库、合约号码退库
│   ├── assetManagement/            # 后台资产管理
│   ├── inventoryManagement/        # 库存管理
│   ├── assetInventory/             # 资产盘点
│   └── yewurules/                  # 后台框架、菜单和配置
├── App.js
└── index.js
```

## 原型标注与研发评审

PRD 已存放在仓库中，前端不上传 PRD、不调用 AI。Agent 直接读取 PRD 和 React 页面代码生成基线标注，浏览器只负责查看和人工校准。

当前支持：

- 页面 scope 隔离；`/yewurules` 按菜单/页签形成独立 scope。
- Button、字段、Tab、表头、Descriptions、FormItem、QueryItem、SelectModal 等细粒度 target。
- Modal/Drawer 等动态目标识别。
- 标注拖动、编辑、重绑、新增/删除、导入导出。
- `target` 与视觉 `display anchor` 分离。
- “代码基线 + 浏览器覆盖层”保存模型。
- PRD 覆盖中心、匹配质量、评审模式、热点避让和运行诊断。
- Coverage Ledger 将研发重点明确标记为 `bound / review / skip`。

员工自助 10 个主要业务模块已经全部进入 Coverage 体系，当前合计 854 条研发规则。`review` 不代表“标注没做完”，而表示 PRD、原型或当前实现之间存在需要产品/研发确认的真实差异。

### 标注粒度规则

- 按钮动作及副作用 → Button。
- 字段必填、只读、枚举、长度、附件等 → 具体字段或控件。
- Tab 规则 → Tab。
- 表格列规则 → 表头。
- 只有跨字段、统一准入、状态流转等规则才放 Card / module。

表格中存在多个同名行内按钮时，如果规则本身就是该重复行操作，仍应绑定按钮 target，不允许因为重复而退回整个 Card。当前“号码控制 → 发送通知”已按此规则修正。

## 分支与研发评审交付

- `main`：持续产品迭代和个人开发使用。
- `review/rd-review`：研发评审专用稳定分支，只同步阶段性已经确认的 PRD 和原型结论。
- `review/rd-review` 不自动跟随 `main`；后续 PRD 或原型发生变化时，由用户手动选择性同步。
- 评审分支通过 Vercel Preview 提供给研发。
- 每次向评审分支同步新版本时，页面更新通知按“PRD 变化 / 原型变化”记录本次差异，方便研发确认本次新增内容。

## 当前主要业务模块

```text
个人工作台
├─ 物资申请 / 业务审批 / 资产配给 / ES前台领用 / 员工确认
├─ 新员工与实习生领用
├─ 合约号码申请 / 配给 / 主管审批 / 库管员办理 / 员工确认
├─ 耗材申请与领用
├─ 资产借用
├─ 资产更换
├─ 资产转移
├─ 资产退库
└─ 合约号码退库
```

后台还包括资产管理、库存管理和资产盘点。资产盘点“盘点项目”主链路已建立；“公司-账套对应关系”仍等待明确字段，不补造需求。

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

GitHub 与 Vercel 已关联；分支提交后由 Vercel 生成对应部署。

## 测试

```bash
npm test
```

原型标注重点测试覆盖 target 稳定性、按钮语义、动态浮层、Coverage 完整性和模块深审结果。

## 已完成

- 个人工作台主要业务流程原型。
- 后台资产管理主要页面。
- 库存管理主要页面。
- 资产盘点“盘点项目”主链路。
- 员工自助 10 个主要业务模块 PRD 深审和 Coverage Ledger。
- 原型标注编辑、定位、动态浮层、质量检查、评审和诊断能力。

## 待办事项

- 逐项处理 Coverage 中的 `review`，确认是修改 PRD、修改原型/演示实现，还是明确为后端/流程能力。
- 将 Coverage 体系逐步扩展到员工自助之外的资产管理、库存管理和资产盘点。
- 补充资产盘点尚未明确字段的维护页面。
- 根据后续截图继续校准库存管理和资产管理细节。
- 补充关键流程 Playwright 冒烟测试。

## 主要文档

- `AGENTS.md`：项目规则和代码约定。
- `AI_RULES.md`：AI 开发行为约束。
- `CONTEXT.md`：当前进度和关键决定。
- `ARCHITECTURE.md`：模块职责和调用关系。
- `docs/原型标注生成规范.md`：PRD 标注和 Coverage 统一规范。
- `lessons.md`：已确认的产品和实现经验。

## 搜索记录

- 后台页面继续复用项目现有 QueryBar、Ant Design Table、StatusTag、SelectModal 等能力，没有为常规页面引入新依赖。
- 2026-08-17 原型标注升级参考 GitHub 的 Floating UI、Driver.js、React Joyride，以及 skills.sh 的 Agentation；最终保留现有数据模型，只吸收 DOM 锚定、placement、边缘避让和低频 DOM 监听思路。
- 2026-08-17 标注面板遮挡问题按 Ant Design popup container / zIndexPopup 机制处理，面板 Portal 到 body，业务弹窗进入独立 overlay 模型。
- 2026-08-18 资产盘点继续复用后台菜单、QueryBar、DetailGrid、StatusTag 和 SelectModal，不为未采集页面补造字段。
- 2026-08-19 研发评审分支继续使用现有 GitHub + Vercel 工作流，不新增第三方运行时依赖。
- 2026-08-22 盘点项目（方案三）继续复用方案二完整页面链路，通过盘点范围变体统一排除“机房”，未引入新运行时依赖。