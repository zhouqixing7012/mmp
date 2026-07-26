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

### 后续处理

- 本地执行 `npm run build`，完整验收后台配置全部页签。
- 继续将大型模块内部页面拆到 300 行以内。
- 将剩余页面内 mock 数据逐步迁移到统一 mock 入口。
- 让申请、列表和审批页面读取同一份申请数据。
- 将演示操作逐步统一到 mock service 和 localStorage。

## 开发约定

- 每次任务前先读 `AI_RULES.md`、`CLAUDE.md`、`CONTEXT.md`。
- 新增页面前先搜索相似页面和通用组件。
- 页面优先使用 Ant Design 组件。
- 状态展示统一使用 `StatusTag`。
- 选择弹窗优先使用 `SelectModal`。
- 查询区域优先使用 `QueryBar` 和 `QueryItem`。
- 页面组件建议不超过 300 行。
- 不直接在页面组件中操作 localStorage。
