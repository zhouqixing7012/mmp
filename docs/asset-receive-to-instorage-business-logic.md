# 资产接收到入库业务逻辑梳理

## 1. 业务范围

本文梳理 MMP 系统中“资产采购接收”到“执行入库”的主流程，覆盖以下业务链路：

```text
PO采购订单
  -> 创建资产接收单
  -> 维护资产接收明细
  -> 创建/绑定入库单
  -> 执行入库
  -> 生成资产台账与资产事务
  -> 回写PO状态并推送采购系统
```

本文以资产/高耗采购接收为主线。低耗、文具、NO自动入库、自采接收等分支只在注意点中说明。

## 2. 核心业务表

| 表名 | 作用 |
|---|---|
| `MMP_SP_PO` | PO采购订单行，保存采购订单、物料、数量、状态等信息 |
| `MMP_SP_PO_REC_HEAD` | 采购接收单头，接收单号通常以 `REC` 开头 |
| `MMP_SP_PO_REC_LINE` | 采购接收单行，记录本次接收的PO行和接收数量 |
| `MMP_SP_PO_LINE_MOST_DIS` | 接收/入库明细，一台资产一条明细，维护标签号、SN、责任人、地点等 |
| `MMP_SP_PO_PUTIN_HEAD` | 入库单头，入库单号通常以 `PUTIN` 或 `CA` 开头 |
| `MMP_ASSETS` | 资产台账，执行入库后生成正式资产 |
| `MMP_ASSETS_TRANSACTIONS` | 资产事务，记录资产入库事务 |
| `MMP_WFL_APPR_ALL` | 工作流/审批记录，接收单创建时会写入草稿记录 |
| `EAS_SOA_LOG` | 接口/推送日志，入库结果推送采购系统时记录 |

## 3. 关键状态

### 3.1 PO状态

PO状态主要通过 `MMP_SP_PO.FLAG` 控制。

| `MMP_SP_PO.FLAG` | 页面含义 | 说明 |
|---|---|---|
| 空 / `0` | 待接收 | 尚未完成接收 |
| `1` | 已接收，待入库 | 接收数量满足条件，接收完成 |
| `2` | 已入库 | 入库数量满足采购数量，入库完成 |

状态回写方法：

```text
MmpSpPoService.updatePoFlag(...)
```

### 3.2 接收单状态

接收单状态来自 `MMP_SP_PO_REC_HEAD.STEP`。

| `STEP` | 含义 |
|---|---|
| `0` | 草稿 |
| `1` | 待维护 |
| `2` | 完成 |
| `3` | 审核 |

常量位置：

```text
PublicConstants.SpPoRec
```

### 3.3 入库单状态

入库单状态来自 `MMP_SP_PO_PUTIN_HEAD.STEP`。

常见状态：

| `STEP` | 含义 |
|---|---|
| `0` | 草稿 |
| `1` | 完成 |
| `3` | 处理中 |

入库单类型：

| 字段 | 常见值 | 含义 |
|---|---|---|
| `BILL_TYPE` | `PUTIN` | 入库单 |
| `PUTIN_TYPE` | `RECEIVE` | 采购接收入库 |
| `PUTIN_TYPE` | `ADD` | 新增入库 |
| `PUTIN_TYPE` | `SELFREC` | 自采接收 |

## 4. 主流程

### 4.1 PO进入资产接收列表

入口：

```text
/mmpSpPo.do?method=list
```

核心代码：

```text
com.pccw.business.instorage.po.action.MmpSpPoAction.list
```

处理逻辑：

1. 根据页面查询条件构造 `MmpSpPoVOImpl`。
2. 如果是资产入口，调用：

```text
MmpSpPoService.findByQueryBeanForAssets(...)
```

3. 查询结果来自 PO 视图/SQL，页面展示 PO 单号、供应商、接收状态、采购日期等。
4. 用户点击 PO 单号进入接收详情页。

### 4.2 打开PO接收详情

入口：

```text
/mmpSpPo.do?method=view
```

核心代码：

```text
MmpSpPoAction.view
```

处理逻辑：

1. 根据 `purchaseId`、`orderType`、`office`、`IsMaterial` 查询 PO 行。
2. 计算每行本次可接收数量：

```text
本次可接收数量 = 采购数量 - 已接收数量 - 草稿数量
```

3. 补全物料名称、供应商名称、采购员、部门、物资总类、资产大类等展示字段。
4. 如果是 NO 设备订单类型 `103/104/105/106`，本次接收数量会从 `MMP_NO_SOA_INPUT` 取 NO 接收数量。

### 4.3 创建接收单

入口：

```text
/mmpSpPoRecHead.do?method=createRec
```

核心代码：

```text
MmpSpPoRecHeadAction.createRec
MmpSpPoRecHeadService.createRec
```

处理逻辑：

1. 页面提交选中的 PO 行和接收数量。
2. 系统生成接收单号：

```text
MmpPublicUtil.generateApplyNum("REC", erpCompany)
```

3. 创建接收单头：

```text
MMP_SP_PO_REC_HEAD
```

4. 按选中的 PO 行创建接收单行：

```text
MMP_SP_PO_REC_LINE
```

5. 接收单行会保存：

```text
PO号
PO行号
物料编码
物料名称
采购数量
本次接收数量
供应商
申请人
PR号
价格
税额
配置描述
```

6. 创建工作流/草稿记录：

```text
MMP_WFL_APPR_ALL
```

### 4.4 生成并维护资产接收明细

入口：

```text
/mmpSpPoRecHead.do?method=editDetailRec
```

核心代码：

```text
MmpSpPoRecHeadAction.editDetailRec
MmpSpPoRecHeadAction.copyProperties
```

处理逻辑：

1. 根据接收单号查询接收单头。
2. 查询该接收单对应的接收行。
3. 按 `receiveCount` 拆分资产明细。
4. 每接收一台资产，生成一条：

```text
MMP_SP_PO_LINE_MOST_DIS
```

5. 明细中维护后续入库必需字段：

```text
TAG_NUMBER
SERIAL_NUMBER
DUTY_USER_ID
ERP_COMPANY
ERP_PLATE
ERP_COST_CENTER
CITY
BUILDING
FLOOR
ROOM
SERVICE
SUB_SERVICE
NO_LOCATION
PURCHASE_PRICE
PURCHASE_TAX
PUTIN_QUANTITY
```

6. SN维护时会校验重复：

```text
同一个SN号不能在其他标签号下重复存在
```

### 4.5 提交接收并回写PO为已接收

入口：

```text
/mmpSpPoRecHead.do?method=update
```

核心代码：

```text
MmpSpPoRecHeadAction.update
MmpSpPoRecHeadService.update
MmpSpPoService.updatePoFlag
```

处理逻辑：

1. 查询接收单明细。
2. 如果是资产/高耗，必须维护完整：

```text
TAG_NUMBER
SERIAL_NUMBER
```

3. 如果明细未维护完整：

```text
接收单状态 = 待维护 STEP=1
```

4. 如果明细维护完整：

```text
接收单状态 = 完成 STEP=2
```

5. 接收完成后回写 PO：

```text
MMP_SP_PO.FLAG = 1
```

但不是无条件更新。`updatePoFlag(..., "1")` 会判断该 PO 行累计接收数量是否等于采购数量，满足才更新为已接收。

### 4.6 创建/绑定入库单

入库单列表入口：

```text
/mmpSpPoPutinHead.do?method=list
```

入库单明细入口：

```text
/mmpSpPoPutinHead.do?method=itemList
```

保存/创建入口：

```text
/mmpSpPoPutinHead.do?method=createPutin
```

核心表：

```text
MMP_SP_PO_PUTIN_HEAD
MMP_SP_PO_LINE_MOST_DIS
```

处理逻辑：

1. 入库单头保存到 `MMP_SP_PO_PUTIN_HEAD`。
2. 接收阶段生成的资产明细通过 `PUTIN_HEAD_ID` 绑定到入库单头。
3. 入库类型通常为：

```text
BILL_TYPE = PUTIN
PUTIN_TYPE = RECEIVE
```

4. 页面可维护入库仓库、是否计费、备注等信息。

### 4.7 执行入库

入口：

```text
/mmpSpPoPutinHead.do?method=executePutin
```

核心代码：

```text
MmpSpPoPutinHeadAction.executePutin
MmpSpPoPutinHeadService.processStorage
```

处理逻辑：

1. 更新入库单头和行的是否计费等信息。
2. 调用：

```text
MmpSpPoPutinHeadService.processStorage(...)
```

3. 入库单头状态更新为完成：

```text
MMP_SP_PO_PUTIN_HEAD.STEP = 1
```

4. 查询入库单明细：

```text
MMP_SP_PO_LINE_MOST_DIS
```

5. 根据物资总类分流：

| 物资类型 | 处理方式 |
---|---|
| 资产 | 装配资产对象，执行资产入库 |
| 高耗 | 装配资产对象，执行资产入库 |
| 低耗 | 装配物料事务，执行物料入库 |
| 文具 | 装配物料事务，执行物料入库 |

### 4.8 生成资产台账与资产事务

核心代码：

```text
MmpSpPoPutinHeadService.assembleAssetsList
AssetsStorageService.processStorage
```

资产/高耗入库时，会把 `MMP_SP_PO_LINE_MOST_DIS` 转换成 `MmpAssetsVOImpl`，然后写入正式资产台账。

主要字段映射：

| 入库明细字段 | 资产字段 | 说明 |
|---|---|---|
| `TAG_NUMBER` | `tagNumber` | 资产标签号 |
| `SERIAL_NUMBER` | `serialNumber` | SN号 |
| `DUTY_USER_ID` | `usedPersonCode` | 责任人/使用人 |
| `ERP_COMPANY` | `regionIdCompany` | 公司 |
| `ERP_PLATE` | `plate` | 板块 |
| `ERP_COST_CENTER` | `organization` | 成本中心 |
| `CITY/BUILDING/FLOOR/ROOM` | 对应地点字段 | 资产位置 |
| `ITEM_CODE` | `itemNumber` | 物料编码 |
| `ITEM_NAME` | `assetName` | 资产名称 |
| `PURCHASE_ID` | `poNumber` | PO号 |
| `RELATED_PR_ID` | `prNumber` | PR号 |
| `PURCHASE_PRICE` | `assetCost` | 资产成本 |
| `PURCHASE_TAX` | `taxes` | 税额 |
| `SERVICE` | `service` | 一级服务 |
| `SUB_SERVICE` | `serviceService` | 二级服务 |
| `NO_LOCATION` | `noLocation` | NO位置 |
| `SP_PO_PUTIN_NUM` | `custText01/custText02` | 入库单号 |

最终动作：

```text
创建 MMP_ASSETS
创建 MMP_ASSETS_TRANSACTIONS
加入资产事务自动同步队列
更新子资产责任人
```

### 4.9 推送采购系统并回写PO为已入库

核心代码：

```text
ApplyAndPoInStorageUtil.inStorage
MmpSpPoService.updatePoFlag(..., "2")
```

执行入库完成后，如果入库类型是：

```text
ADD
RECEIVE
```

系统会推送采购系统，推送字段包括：

```text
PO_FORM_ID
PO_NUMBER
SA_FORM_ID
SA_FORM_DATE
LOCATION
MATERIAL_TYPE_CODE
STROAGE_NUMBER
STROAGE_DESC
SA_FROM_LINE_ID
ITEM_CODE
ITEM_DESC
TAG_NUMBER
QUANTITY
AMOUNT
REC_EMPLOYEE_NUMBER
REC_DATE
BUNUM
```

推送成功或失败会记录 `EAS_SOA_LOG`，并更新入库单同步标记：

```text
MMP_SP_PO_PUTIN_HEAD.IS_SYNC_FLAG
```

随后回写 PO 行：

```text
MMP_SP_PO.FLAG = 2
```

同样不是无条件回写。`updatePoFlag(..., "2")` 会判断该 PO 行累计入库数量是否等于采购数量，满足后才更新为已入库。

## 5. 低耗/文具分支

低耗和文具与资产主线不同。

在接收完成时，如果物资总类是低耗，系统会：

1. 查找公司对应耗材仓库。
2. 直接创建入库单。
3. 调用：

```text
MmpSpPoRecHeadService.createPutInOrder
MmpSpPoPutinHeadService.processStorage
ApplyAndPoInStorageUtil.inStorage
```

低耗/文具不会像资产一样强制维护标签号和 SN。

## 6. NO设备分支

NO设备订单类型：

```text
103 网络设备
104 服务器
105 服务器配件
106 网络设备配件
```

NO设备的接收数量来源可能不是普通页面输入，而是：

```text
MMP_NO_SOA_INPUT.RECEIVE_QUANTITY
```

NO自动接收/入库相关逻辑还涉及：

```text
NoPutInOrderGeneralJob
MmpNoSoaInputService
```

## 7. 关键代码位置

| 模块 | 文件/方法 |
|---|---|
| PO接收列表 | `MmpSpPoAction.list` |
| PO接收详情 | `MmpSpPoAction.view` |
| 创建接收单 | `MmpSpPoRecHeadAction.createRec` |
| 保存接收单头/行 | `MmpSpPoRecHeadService.createRec` |
| 维护接收明细 | `MmpSpPoRecHeadAction.editDetailRec` |
| SN维护校验 | `MmpSpPoRecHeadAction` 中 SN 更新逻辑 |
| 接收单提交 | `MmpSpPoRecHeadAction.update` |
| PO状态回写 | `MmpSpPoService.updatePoFlag` |
| 入库单列表 | `MmpSpPoPutinHeadAction.list` |
| 入库单保存 | `MmpSpPoPutinHeadAction.createPutin` |
| 执行入库 | `MmpSpPoPutinHeadAction.executePutin` |
| 入库处理 | `MmpSpPoPutinHeadService.processStorage` |
| 资产装配 | `MmpSpPoPutinHeadService.assembleAssetsList` |
| 资产台账写入 | `AssetsStorageService.processStorage` |
| 推送采购系统 | `ApplyAndPoInStorageUtil.inStorage` |

## 8. 关键注意点

1. 接收单完成不等于入库完成。

```text
接收完成 -> MMP_SP_PO.FLAG = 1
入库完成 -> MMP_SP_PO.FLAG = 2
```

2. 资产/高耗必须维护标签号和 SN，否则接收单不能完成。

3. `MMP_SP_PO_LINE_MOST_DIS` 是承上启下的核心明细表：

```text
接收阶段生成它
入库阶段绑定它
资产台账从它取字段
```

4. 执行入库后才会真正生成 `MMP_ASSETS`。

5. 入库推送采购系统失败，不一定代表本地资产入库失败；本地入库和外部推送是两个动作。

6. PO状态回写有数量校验，只有累计接收/入库数量达到采购数量时，才会更新为已接收/已入库。

7. 低耗/文具流程会更短，可能在接收完成时直接创建并执行入库。

8. NO设备流程有自动入库分支，普通页面流程和 NO SOA 数据会交织，需要单独看 `MMP_NO_SOA_INPUT` 和 `NoPutInOrderGeneralJob`。

