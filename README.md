# 企业资产管理系统（Asset Management System）

## 项目简介

这是一个用于产品演示的企业资产管理前端项目，不是生产系统。项目重点是让资产申请、审批、报废、机房资产维护、后台配置等流程在演示时可以连续操作，并保持页面风格和数据口径一致。

## 当前技术栈

- React 19
- Create React App / react-scripts 5
- React Router 7
- Ant Design 6
- Tailwind CSS
- Lucide React
- Recharts
- Playwright

`package.json` 是当前依赖版本的准绳。

## 项目结构

```text
src/
├── components/                 # 通用组件，如 Navbar、StatusTag、SelectModal、QueryBar
├── config/                     # 路由和导航配置
├── mock/                       # 统一演示数据
├── services/                   # 演示数据读写服务
├── pages/
│   ├── yewurules.js            # 后台基础配置组合入口，约 200 行
│   ├── yewurules/
│   │   ├── components/         # 后台侧边栏、顶部栏、内容区和个人工作台组件
│   │   ├── config/             # 菜单、页签和个人工作台配置
│   │   └── modules/
│   │       ├── material/       # 物料基础数据
│   │       ├── mapping/        # 业务映射
│   │       ├── warehouse/      # 仓库数据
│   │       ├── location/       # 地点数据
│   │       ├── permission/     # 领取权限、单据规则和配给规则
│   │       ├── accounting/     # 会计映射、折旧、账套和科目映射
│   │       └── expense/        # 超标配置和费用账户规则
│   ├── xitongrules.js          # 组织与用户管理
│   ├── zichanshenqing.js       # 新增资产申请
│   ├── zichanshenqingshenpi.js # 资产申请审批
│   └── ...                     # 其他业务页面
├── App.js
└── index.js

docs/BACKGROUND_CONFIG_AUDIT.md # 后台配置页面审计清单与优化路线
AI_RULES.md                     # AI Agent 行为约束
CLAUDE.md                       # 项目编码约定
CONTEXT.md                      # 当前进度和关键决定
ARCHITECTURE.md                 # 代码结构说明
```

## 主要功能模块

### 个人工作台

- 工作台首页
- 新增资产申请
- 资产申请审批
- 资产申请配给
- 统一申请汇总-资产
- 号码管理
- 号码控制

### 后台配置

- 物料基础数据维护
- 业务映射规则管理
- 业务权限规则管理
- 仓库与地点数据维护
- 会计映射规则管理
- 资产配给与折旧规则管理
- 费用账户规则管理
- 组织、用户、角色和字典管理

### 其他资产流程

- 报废申请、审批、内审和采购流程
- 机房资产大盘、管理和维护查询
- 主备维护、责任人变更、位置变更和序列号变更

## 本地运行

```bash
npm install
npm start
```

默认访问：

```text
http://localhost:3000
```

生产构建：

```bash
npm run build
```

测试：

```bash
npm test
```

## 当前整改记录

### 已完成

- `App.js` 直接消费 `routes.js` 中的 `Page` 字段。
- `routes.js` 增加模块分组字段并导出导航分组。
- `Navbar.js` 按模块展示导航。
- 新增统一 mock 与演示数据存储服务。
- 新增“统一申请汇总-资产”，并接入个人工作台内部菜单。
- 完成 `yewurules.js` 后台框架、菜单、页签和个人工作台映射拆分。
- 完成物料、业务映射、仓库、地点、权限、会计和费用账户模块拆分。
- `yewurules.js` 从约 4655 行降至约 200 行，只保留状态、页面映射和框架组合。
- 已按拆分前完整文件审计后台配置全部 34 个业务视图，恢复拆分过程中遗漏的查询条件、操作栏和弹窗。
- 已修正费用账户规则中误加的启用/停用按钮置灰条件。
- 已将三个权限页面和资产折旧规则从简化版恢复为完整独立页面。

### 按钮状态说明

- 启用/停用按钮不得在拆分时额外增加置灰条件；费用账户规则已按原页面恢复为可点击状态。
- 删除按钮在原页面要求先勾选数据时，未勾选状态继续置灰。
- 物料大类、物料小类、品牌、型号和配置页面的“停用”按钮未选中时置灰，属于拆分前原有行为。
- 详细逐页结果见 `docs/BACKGROUND_CONFIG_AUDIT.md`。

## 下一步优化计划

### 1. 交互闭环

- 查询、重置和分页真正作用于列表数据。
- 启用、停用和删除增加选中校验、二次确认、loading 和成功提示。
- 新增/编辑弹窗增加必填校验、提交 loading、关闭重置和防重复提交。
- 同步、批量修改、导入和下载模板补充明确演示反馈。

### 2. 数据层统一

- 为后台配置建立统一 mock service。
- 页面不再直接把 mock 数组作为最终数据源。
- 新增、编辑、启停和删除写入统一演示存储。
- 提供统一“重置演示数据”能力。

### 3. 组件与代码质量

- 将超过 300 行的页面继续拆分。
- 将超过 80 行的 Modal 拆为独立组件。
- 抽取后台列表页公共工具栏、批量状态操作和通用选择字段。
- 将查询字段、表格列和 Select options 迁入配置文件。

### 4. 业务链路

- 申请、申请列表和审批读取同一份申请数据。
- 费用账户映射与资产台账演示数据建立可见联动。
- 增加关键后台页签的 Playwright 冒烟用例。

## 开发约定

- 每次任务前先读 `AI_RULES.md`、`CLAUDE.md`、`CONTEXT.md`。
- 新增页面前先搜索相似页面和通用组件。
- 页面优先使用 Ant Design 组件。
- 状态展示统一使用 `StatusTag`。
- 选择弹窗优先使用 `SelectModal`。
- 查询区域优先使用 `QueryBar` 和 `QueryItem`。
- 页面组件建议不超过 300 行。
- 不直接在页面组件中操作 localStorage。
