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

说明：`package.json` 是当前依赖版本的准绳，文档中的技术栈必须和它保持一致。

## 项目结构

```text
src/
├── components/                 # 通用组件，如 Navbar、StatusTag、SelectModal、QueryBar
├── config/                     # 路由和导航配置
│   └── routes.js               # 所有页面路由，含导航分组
├── mock/                       # 演示数据，后续页面数据应统一从这里出发
│   └── assetApplicationMock.js # 资产申请链路演示数据
├── services/                   # 演示数据读写服务，统一封装 localStorage
│   └── demoStorage.js          # 通用演示数据存储服务
├── pages/                      # 页面组件
│   ├── yewurules.js            # 后台基础配置主页面，当前仍偏大
│   ├── xitongrules.js          # 组织与用户管理
│   ├── zichanshenqing.js       # 新增资产申请
│   ├── zichanshenqingshenpi.js # 资产申请审批
│   └── ...                     # 其他业务页面
├── prototype-annotations/      # 原型标注层
├── App.js                      # 应用入口，直接消费 routes.js
└── index.js                    # React 启动入口

docs/                           # 产品需求文档
AI_RULES.md                     # AI Agent 行为约束
CLAUDE.md                       # 项目编码约定
CONTEXT.md                      # 当前进度和关键决定
ARCHITECTURE.md                 # 代码结构说明
```

## 主要功能模块

### 个人工作台

- 工作台首页：资产、耗材、合约号码分类查看。
- 新增资产申请：资产商城选品并生成申请明细。
- 资产申请审批：审批员工提交的资产申请。
- 资产申请配给：处理资产配给相关流程。
- 号码管理：电话卡申请表单。
- 号码控制：申请人员白名单管理。

### 报废管理

- 报废申请单编辑。
- 账面报废申请单。
- 报废申请单审批。
- 报废申请单内审。
- 报废申请单采购流程。

### 机房资产

- 机房资产大盘。
- 机房资产管理。
- 机房资产维护查询列表。
- 主备维护。
- 责任人变更。
- 位置变更。
- 序列号变更。
- 采购订单编辑。

### 后台配置

- 业务基础数据维护。
- 业务映射规则管理。
- 业务权限规则管理。
- 仓库基础数据维护。
- 会计映射规则管理。
- 资产配给规则管理。
- 费用账户规则管理。
- 组织与用户管理。

## 本地运行

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm start
```

默认访问：

```text
http://localhost:3000
```

### 构建生产包

```bash
npm run build
```

### 测试命令

```bash
npm test
```

## 当前整改记录

### 已完成

- `App.js` 已改为直接消费 `routes.js` 中的 `Page` 字段，减少手工维护映射。
- `routes.js` 已增加模块分组字段 `group`，并导出 `navGroups`。
- `Navbar.js` 已从所有页面平铺展示改为按模块下拉展示，点击具体页面后会自动收起菜单。
- 新增 `ARCHITECTURE.md`，记录目录和模块职责。
- `README.md` 已修正技术栈，和 `package.json` 保持一致。
- 新增 `src/mock/assetApplicationMock.js`，将新增资产申请页的大块 mock 数据迁出页面。
- 新增 `src/services/demoStorage.js`，统一封装演示数据的 localStorage 读写。
- `zichanshenqing.js` 提交申请时已写入统一演示数据服务，并补充耗材关联主资产校验。

### 仍需逐步处理

- `zichanshenqingshenpi.js` 还需要接入 `getAssetApplications()`，让审批页读取同一份申请数据。
- `applylist.js` 还需要接入同源申请数据，形成提交申请、申请列表、审批的完整链路。
- `yewurules.js` 仍然过大，应按业务配置子模块拆分。
- 部分页面仍有页面内 mock 数据，应逐步迁移到 `src/mock/`。
- 部分业务操作仍停留在演示状态，应统一走 mock service 和 localStorage。

## 开发约定

- 每次任务前先读 `AI_RULES.md`、`CLAUDE.md`、`CONTEXT.md`。
- 新增页面前先搜索相似页面和通用组件。
- 页面优先使用 Ant Design 组件。
- 状态展示统一使用 `StatusTag`。
- 选择弹窗优先使用 `SelectModal`。
- 查询区域优先使用 `QueryBar` 和 `QueryItem`。
- 页面组件建议不超过 300 行。
- 不直接在页面组件中操作 localStorage。

## 搜索记录

- 本次整改没有新增外部技术方案；依据项目现有 `AI_RULES.md`、`CLAUDE.md`、`package.json`、`routes.js` 和页面结构完成。
- 未访问 skills.sh。
- 未做 GitHub 外部方案搜索。
