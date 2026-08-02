# ARCHITECTURE.md

## 项目定位

这是一个产品演示用的企业资产管理前端。页面、流程状态和演示数据需要保持一致，真实后端接口不在当前仓库内实现。

## 顶层文件职责

| 文件/目录 | 职责 |
|---|---|
| `AI_RULES.md` | AI 开发行为和交付约束。 |
| `CLAUDE.md` | 代码规范和组件使用规则。 |
| `CONTEXT.md` | 当前进度、关键决定和验收路径。 |
| `README.md` | 项目功能、运行、部署和待办。 |
| `ARCHITECTURE.md` | 模块职责、调用关系和数据流。 |
| `package.json` | 依赖和运行命令。 |

## src 目录职责

| 路径 | 职责 |
|---|---|
| `src/App.js` | 生成应用路由。 |
| `src/config/routes.js` | 独立页面路由配置。 |
| `src/components/QueryBar.jsx` | 统一查询区域。 |
| `src/components/StatusTag.jsx` | 统一是/否、启用/停用状态展示。 |
| `src/components/SelectModal.js` | 通用选择弹窗。 |
| `src/services/demoStorage.js` | localStorage 统一读写。 |
| `src/pages/yewurules/` | 后台框架、侧边栏和个人工作台菜单。 |
| `src/pages/employeeSelfService/` | 资产申请、审批、配给及复用组件。 |
| `src/pages/assetBorrowing/` | 资产借用流程页面。 |
| `src/pages/assetReplacement/` | 资产更换流程页面。 |
| `src/pages/assetReturn/` | 资产退库和合约号码退库流程页面。 |
| `src/mock/` | 各业务模块演示数据。 |
| `src/services/` | 各业务模块状态读写和流程操作。 |

## 个人工作台导航

工作台页面由 `src/pages/yewurules/config/workspaceMenuConfig.js` 统一配置。

```text
工作台首页
号码管理
号码控制
资产申请
业务审批
资产配给
统一申请汇总-资产
ES前台领用
员工领用确认
资产借用
借用配给
借用审批
借用发放
员工借用确认
我的资产
资产更换申请
我的资产更换申请
MIS鉴定
资产更换办理
员工资产确认
资产退库
退库审批
资产退库办理
员工退库确认
合约号码退库
合约号码退库办理
员工号码退库确认
```

`WorkspaceMenu` 根据菜单 key 渲染对应 Page。页面内部跳转通过 `/yewurules` 的 `location.state.workspace` 切换菜单状态。

## 核心模块调用关系

### 资产申请与领用

```text
AssetApplyPage
  ↓ employeeSelfServiceService
AssetApprovalPage
  ↓ employeeSelfServiceWorkflowService
AssetAllocationPage
  ├─ 库存领用 → FrontDeskAssetClaim → EmployeeAssetClaimConfirm
  └─ 统一采购 → UnifiedAssetApplySummary
```

### 资产借用

```text
BorrowingApplyPage
  ↓ assetBorrowingService
BorrowingAllocationPage
  ↓ BorrowingApprovalPage
  ↓ BorrowingIssuePage
  ↔ BorrowingConfirmPage
```

### 资产更换

```text
ReplacementAssetsPage
  ↓ ReplacementApplyPage
  ↓ assetReplacementService
ReplacementMisPage
  ↓ ReplacementHandlingPage / ReplacementHandlingDetail
  ↔ ReplacementConfirmPage
MyReplacementApplicationsPage
  └─ ReplacementDetailModal / ReplacementHistoryCard
```

### 资产退库

```text
ReplacementAssetsPage（我的资产）
  ↓ setAssetReturnDraftIds
AssetReturnApplyPage
  ↓ createAssetReturnApplications
assetReturnService
  ├─ 部门公用 → AssetReturnApprovalPage（领导审批）
  ├─ 退库需MIS → AssetReturnApprovalPage（MIS鉴定）
  └─ AssetReturnHandlingPage
       ↓ requestAssetReturnConfirmation
       ↔ AssetReturnConfirmPage
       ↓ completeAssetReturn
       → 演示入库单 / 流程结束
```

### 合约号码退库

```text
ContractReturnApplyPage
  ↓ createContractReturnApplications
assetReturnService
  ↓ ContractReturnHandlingPage
       ↓ requestContractReturnConfirmation
       ↔ ContractReturnConfirmPage
       ↓ completeContractReturn
       → 演示号码入库单 / 流程结束
```

## 资产退库与合约号码退库文件职责

| 文件 | 职责 |
|---|---|
| `assetReturnMock.js` | 退库存储 key、号码台账、仓库枚举和默认数据。 |
| `assetReturnService.js` | 退库资格、拆单、审批、确认、入库、驳回和放弃处理。 |
| `AssetReturnApplyPage.js` | 资产选择、关联耗材、退库原因、拆单和我的申请。 |
| `AssetReturnApprovalPage.js` | 领导审批和 MIS 鉴定待办及详情。 |
| `AssetReturnHandlingPage.js` | ES 仓库、鉴定、员工确认、入库、驳回和放弃退库。 |
| `AssetReturnConfirmPage.js` | 员工扫码、刷卡或工号完成资产退库确认。 |
| `ContractReturnApplyPage.js` | 合约号码多选、附件、拆单和我的申请。 |
| `ContractReturnHandlingPage.js` | 号码仓库、员工确认、入库、驳回和放弃退还。 |
| `ContractReturnConfirmPage.js` | 员工扫码、刷卡或工号完成号码退库确认。 |

## 状态模型

### 资产退库

| 字段 | 值 |
|---|---|
| 单据状态 | 处理中、已处理、已驳回 |
| 处理结果 | 正常退库、放弃退库 |
| 当前节点 | 领导审批、MIS鉴定、ES退库办理、员工退库确认、流程结束 |

### 合约号码退库

| 字段 | 值 |
|---|---|
| 单据状态 | 处理中、已处理、已驳回 |
| 处理结果 | 正常退还、放弃退还 |
| 当前节点 | 号码退库办理、员工号码退库确认、流程结束 |

## 数据流原则

- 页面只能通过 service 读取和修改业务数据。
- service 通过 `demoStorage` 持久化演示数据。
- 批量资产退库按一项主资产一张单据拆分；关联耗材保存在主单内。
- 批量合约号码退库按一号一单拆分。
- 申请、审批、办理、员工确认和结果列表读取同一份申请数据。
- 工号确认必须与申请人工号一致。
- 正常入库生成演示入库单号；驳回或放弃不生成入库单。

## 页面结构约定

- 查询列表使用 `QueryBar`、`QueryItem` 和 Ant Design Table。
- 申请、审批和办理页面使用 Card、Table 分区。
- 选择资产使用 Modal 和多选 Table。
- 操作完成后显示 message 反馈并刷新同源数据。
- 状态展示使用统一 Tag 语义：处理中蓝色、已处理绿色、已驳回红色。

## 当前演示边界

以下能力仍为前端模拟：

- 服务号通知。
- 真实狐小 e 扫码和刷卡硬件。
- 并发资产/号码锁定。
- 真实入库、台账和号码状态接口。
- 真实 MIS、领导和库管员权限匹配。
- 21 天超期自动驳回任务。
