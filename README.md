# 企业资产管理系统（Asset Management System）

## 项目简介

这是一个用于产品演示的企业资产管理前端项目，不是生产系统。项目重点是让资产申请、审批、配给、汇总采购、领用、报废、机房资产维护和后台配置等流程在演示时可以连续操作，并保持页面风格和数据口径一致。

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
│   ├── employeeSelfService/    # 员工自助新版申请、审批、配给和汇总采购
│   ├── yewurules.js            # 后台基础配置组合入口
│   ├── yewurules/              # 后台框架、菜单、页签和业务模块
│   ├── xitongrules.js          # 组织与用户管理
│   ├── zichanshenqing.js       # 旧版新增资产申请
│   ├── zichanshenqingshenpi.js # 旧版资产申请审批
│   └── ...                     # 其他业务页面
├── App.js
└── index.js

docs/BACKGROUND_CONFIG_AUDIT.md          # 后台配置页面审计清单与优化路线
docs/PRD-EMPLOYEE-ASSET-SELF-SERVICE.md  # 员工自助新版资产申请 PRD
AI_RULES.md                               # AI Agent 行为约束
CLAUDE.md                                 # 项目编码约定
CONTEXT.md                                # 当前进度和关键决定
ARCHITECTURE.md                           # 代码结构说明
```

## 主要功能模块

### 个人工作台

- 工作台首页
- 新增资产申请、审批、配给和汇总（旧版保留）
- ES 前台领用和员工领用确认（旧版保留）
- 员工自助新版-资产申请
- 员工自助新版-业务审批
- 员工自助新版-资产配给
- 员工自助新版-汇总采购
- 号码管理和号码控制

### 员工自助新版

已实现：

- 正式员工资产申请与外包员工发起拦截
- 申请须知、多选资产、申请明细编辑和超标提示
- 直属领导、5级、7级及 VP/CFO 业务审批
- 按申请行和数量拆分 ES 配给单
- 根据公司匹配 ES 配给人
- 库存领用、统一采购和取消申请
- 查看申请人名下资产和选择可用库存资产
- 统一采购实时进入待汇总池
- 汇总说明、项目用途、部门申请明细和部门资产使用量
- 申请、审批、配给和汇总共用演示数据，刷新后保留

后续阶段：

- 资产领用
- 狐小 e 电子签或刷卡确认
- 出库、台账更新和全流程进度查询

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

## 员工自助新版入口

```text
/employee-self-service/asset-apply
/employee-self-service/asset-approval
/employee-self-service/asset-allocation
/employee-self-service/purchase-summary
```

## 当前整改记录

### 已完成

- 路由和导航按模块统一配置。
- 后台基础配置已完成框架和业务模块拆分。
- 后台配置 34 个业务视图已完成页面级回归审计。
- 新增员工自助新版资产申请、业务审批、资产配给和汇总采购。
- 新旧员工自助页面并行，旧页面及旧路由保持不变。
- 员工自助新版通过统一 service 读写演示数据。

### 下一步

- 接入新版资产领用单。
- 支持电子签、刷卡和库管员复核。
- 执行出库并更新资产台账和原申请进度。
- 补充员工自助新版 Playwright 冒烟用例。

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

- 员工自助新版优先复用仓库内已有申请、审批、配给、汇总、选择弹窗、查询栏和演示存储实现。
- 未引入外部方案和第三方依赖。
