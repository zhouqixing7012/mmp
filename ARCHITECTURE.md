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
```

`WorkspaceMenu` 根据当前菜单 key 渲染对应 Page 组件。页面内部返回操作通过 `/yewurules` 的 `location.state.workspace` 切换菜单状态。

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
  ↓
BorrowingApprovalPage
  ↓
BorrowingIssuePage
  ↔ BorrowingConfirmPage
```

### 资产更换

```text
ReplacementAssetsPage
  ↓ 保存待申请资产 ID
ReplacementApplyPage
  ↓ createAssetReplacementApplications
assetReplacementService
  ↓ demoStorage
ReplacementMisPage
  ↓ submitMisDecision
ReplacementHandlingPage / ReplacementHandlingDetail
  ├─ requestReplacementConfirmation（旧资产）
  ↔ ReplacementConfirmPage
  ├─ executeReplacementInbound
  ├─ ReplacementAssetSelectModal
  ├─ requestReplacementConfirmation（新资产）
  ↔ ReplacementConfirmPage
  └─ executeReplacementOutbound
MyReplacementApplicationsPage
  └─ ReplacementDetailModal / ReplacementHistoryCard
```

## 资产更换模块文件职责

| 文件 | 职责 |
|---|---|
| `assetReplacementMock.js` | 申请人、本人资产、可发放资产、默认申请单和须知。 |
| `assetReplacementService.js` | 资格判断、申请创建、MIS 鉴定、确认、入库、出库和流程结束。 |
| `ReplacementAssetsPage.js` | 查询本人资产、展示不可更换原因、单条或批量发起更换。 |
| `ReplacementApplyPage.js` | 更换原因、退回资产、须知确认和提交。 |
| `MyReplacementApplicationsPage.js` | 查询个人申请并打开详情。 |
| `ReplacementDetailModal.js` | 只读展示基本信息、旧资产、新资产和流程记录。 |
| `ReplacementMisPage.js` | MIS 待办列表和鉴定审批。 |
| `ReplacementHandlingPage.js` | ES 库管员待办列表。 |
| `ReplacementHandlingDetail.js` | 旧资产退回、新资产发放和办理操作。 |
| `ReplacementAssetSelectModal.js` | 按同小类、仓库、状态和锁定条件选择新资产。 |
| `ReplacementEmployeeAssetsModal.js` | 查询申请人名下资产，辅助 ES 判断。 |
| `ReplacementConfirmPage.js` | 员工完成旧资产退回或新资产领取确认。 |
| `ReplacementHistoryCard.js` | 统一流程记录表格。 |

## 资产更换状态模型

### 申请单状态

| 状态 | 含义 |
|---|---|
| 处理中 | MIS、旧资产退回、新资产发放任一阶段未结束。 |
| 已驳回 | MIS 驳回或旧资产入库前被 ES 驳回。 |
| 已完成 | 正常出库，或旧资产已退库后放弃新资产领用。 |

### 当前节点

```text
MIS鉴定
旧资产退回
旧资产确认
新资产发放
新资产确认
流程结束
```

### 主要数据对象

| 对象 | 关键内容 |
|---|---|
| replacement application | 申请人、原因、旧资产、MIS、退库、新资产、发放和流程记录。 |
| oldAsset | 旧资产标签、物料小类、配置、仓库、部件和耗材。 |
| mis | 鉴定结果、说明、审批决策、意见、处理人和时间。 |
| returnProcess | 退回仓库、员工确认、入库状态和入库单。 |
| newAsset | 待发放实物资产。 |
| issueProcess | 发放仓库、地点、用途、归还日期、员工确认和出库单。 |
| history | 每个流程节点的处理人、状态、时间和说明。 |

## 数据流原则

- 页面只能通过 service 读取和修改业务数据。
- service 通过 `demoStorage` 持久化演示数据。
- 申请、鉴定、办理、确认和详情读取同一份资产更换申请单数据。
- 批量申请拆成多张申请单，每张单据独立流转。
- 新资产选择只回填符合旧资产小类和仓库规则的库存资产。
- 两次员工确认分别更新退库和发放确认状态。

## 页面结构约定

- 查询列表使用 `QueryBar`、`QueryItem` 和 Ant Design Table。
- 申请、审批和办理页面使用 Card、Descriptions、Table 分区。
- 申请人信息复用 `employeeSelfService/ApplicantInfoCard.js`。
- 员工名下资产和待发放资产使用独立 Modal。
- 操作完成后显示 message 反馈并刷新同源数据。
- 危险结束操作使用二次确认。

## 当前演示边界

以下能力仍为前端模拟：

- 服务号通知。
- 真实狐小 e 扫码和刷卡硬件。
- 并发资产锁定。
- 真实入库、出库和台账接口。
- 真实 MIS 和库管员权限匹配。
