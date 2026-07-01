# NO设备资产接收到入库产品文档

## 1. 文档目的

本文从产品视角描述 NO 设备从“NO系统推送接收数据”到“MMP执行资产入库”的完整业务逻辑，并补充关键数据的业务计算规则。

本文重点回答：

- NO设备接收数据从哪里来
- 什么时候可以生成入库单
- 入库单如何按 PO、地点、数量生成
- NO推送数据如何转换成 MMP 入库明细
- 执行入库后如何生成资产台账
- PO状态和采购系统如何回写

## 2. 业务背景

NO设备主要包括服务器、网络设备及其配件。与普通资产接收不同，NO设备的接收信息由 NO 系统推送到 MMP。

普通资产流程通常是：

```text
人工选择PO
  -> 创建接收单
  -> 维护标签号/SN
  -> 创建入库单
  -> 执行入库
```

NO设备流程是：

```text
NO系统推送接收数据
  -> MMP保存NO接收中间表
  -> 系统判断是否满足生成入库单条件
  -> 自动或手动生成入库单草稿
  -> 执行入库
  -> 生成资产台账
```

因此，NO设备没有普通人工 `REC` 接收单作为主流程，NO推送数据本身承担了“接收明细”的作用。

## 3. 适用范围

适用 NO 设备订单类型：

| 订单类型 | 含义 |
|---|---|
| `103` | 网络设备 |
| `104` | 服务器 |
| `105` | 服务器配件 |
| `106` | 网络设备配件 |

## 4. 相关角色

| 角色 | 职责 |
|---|---|
| NO系统 | 推送NO设备接收数据 |
| MMP系统 | 接收NO数据、生成入库单、执行资产入库 |
| 资产管理员 | 查看PO、触发NO设备执行入库、处理异常 |
| 仓库管理员 | 执行入库单入库 |
| 采购系统 | 接收MMP回推的入库结果 |
| 系统管理员 | 维护物料、库房、地点映射、服务、成本中心等基础配置 |

## 5. 核心数据表

| 表名 | 作用 |
|---|---|
| `MMP_NO_SOA_INPUT` | NO入库推送中间表 |
| `MMP_SP_PO` | MMP采购PO数据 |
| `MMP_SP_PO_PUTIN_HEAD` | MMP入库单头 |
| `MMP_SP_PO_LINE_MOST_DIS` | MMP入库明细 |
| `MMP_STORAGE` | 仓库/机房库 |
| `MMP_NO_LOCATION_MAPPING` | NO位置到MMP地点映射 |
| `MMP_ASSET_SERVICE` | 服务、子服务配置 |
| `MMP_ASSETS` | 资产台账 |
| `MMP_ASSETS_TRANSACTIONS` | 资产事务 |
| `EAS_SOA_LOG` | 接口日志 |

## 6. 产品主流程

```text
1. NO系统推送入库数据
2. MMP校验并保存到NO入库中间表
3. 系统判断PO是否已同步
4. 系统判断NO接收数量是否等于PO采购数量
5. 满足条件后生成入库单草稿
6. 根据NO数据生成入库明细
7. 用户或系统执行入库
8. 系统生成资产台账和资产事务
9. 系统回写PO为已入库
10. 系统推送采购入库结果
```

## 7. NO入库数据接收

### 7.1 接口入口

```text
POST /import/no/stockInServices
```

请求体为 JSON 数组。

### 7.2 接收后的系统动作

系统按 `tag_number` 判断数据是否已存在：

| 情况 | 处理 |
|---|---|
| `tag_number` 不存在 | 新增 `MMP_NO_SOA_INPUT` |
| `tag_number` 已存在 | 更新原有 `MMP_NO_SOA_INPUT` |

保存后默认设置：

| 字段 | 值 | 产品含义 |
|---|---|---|
| `ATTRI_TEXT01` | `N` | 是否已生成入库工单，`N` 表示未生成 |
| `ATTRI_TEXT02` | `N` | 后台导入/处理标识 |
| `ATTRI_TEXT03` | `parent_tag_number` | 主资产标签号 |

## 8. NO推送字段与产品含义

| NO字段 | MMP中间表字段 | 产品含义 |
|---|---|---|
| `receive_number` | `RECEIVE_NUMBER` | NO接收单号 |
| `po_number` | `PO_NUMBER` | PO单号 |
| `po_line_number` | `PO_LINE_NUMBER` | PO行号 |
| `sa_number` | `SA_NUMBER` | 申请单号 |
| `pr_number` | `PR_NUMBER` | PR单号 |
| `receive_person_code` | `RECEIVE_PERSON_CODE` | 接收人 |
| `receive_date` | `RECEIVE_DATE` | 接收日期 |
| `receive_quantity` | `RECEIVE_QUANTITY` | 接收数量 |
| `tag_number` | `TAG_NUMBER` | 当前资产标签号 |
| `parent_tag_number` | `ATTRI_TEXT03` | 主资产标签号 |
| `serial_number` | `SERIAL_NUMER` | SN号 |
| `no_location` | `NO_LOCATION` | NO位置 |
| `service` | `SERVICE` | 一级服务名称 |
| `s_service` | `SUB_SERVICE` | 二级服务名称 |
| `cost_center` | `COST_CENTER` | 成本中心 |
| `no_asset_number` | `NO_ASSET_NUMBER` | NO资产唯一号 |
| `box_cpu` | `BOX_CPU` | CPU |
| `box_memory` | `BOX_MEMORY` | 内存 |
| `box_hd` | `BOX_HD` | 硬盘 |
| `employee_code` | `EMPLOYEE_CODE` | 责任人员工号 |
| `no_memo` | `NO_MEMO` | NO备注 |

## 9. 生成入库单的触发方式

### 9.1 后台自动生成

后台任务扫描 `MMP_NO_SOA_INPUT` 中未生成工单的数据。

### 9.2 页面手动触发

在 PO 接收详情页，当订单类型为 `103/104/105/106` 时，页面展示“执行入库”按钮。

用户点击后，系统调用 NO入库生成逻辑。

## 10. 入库单生成条件

NO设备不是收到一条数据就立刻生成入库单。系统必须同时满足以下条件：

| 条件 | 说明 |
|---|---|
| NO数据未生成过工单 | `MMP_NO_SOA_INPUT.ATTRI_TEXT01 = N` |
| NO数据处于默认处理状态 | `MMP_NO_SOA_INPUT.ATTRI_TEXT02 = N` |
| PO已同步到MMP | `MMP_SP_PO` 中存在对应 `PO_NUMBER` |
| NO接收数量满足PO数量 | 同一个 PO 的 NO接收数量合计等于 PO采购数量合计 |

## 11. 关键数据计算逻辑

### 11.1 是否可以生成入库单

计算口径：

```text
PO采购数量合计 = MMP_SP_PO.PURCHASE_QUANTITY 按 PO_NUMBER 汇总
NO接收数量合计 = MMP_NO_SOA_INPUT.RECEIVE_QUANTITY 按 PO_NUMBER 汇总
```

生成条件：

```text
NO接收数量合计 = PO采购数量合计
```

如果数量不一致：

```text
不生成入库单草稿
继续等待NO系统推送完整数据
```

产品含义：

```text
只有NO系统已把该PO下所有应接收设备推送到MMP后，MMP才允许生成NO入库草稿。
```

### 11.2 入库单按什么维度生成

后台扫描时，入库单按以下维度分组：

```text
PO_NUMBER + NO位置前缀
```

NO位置前缀计算：

```text
NO_LOCATION 中第一个分号 ; 前面的内容
```

示例：

```text
NO_LOCATION = "BJ-IDC-A;机房A01"
NO位置前缀 = "BJ-IDC-A"
```

产品含义：

```text
同一个PO下，不同NO位置前缀会生成不同入库单或不同批次处理。
```

### 11.3 入库明细如何匹配PO行

系统使用以下字段匹配 PO 行：

```text
PO_NUMBER
PO_LINE_NUMBER
SA_NUMBER
```

匹配目标：

```text
MMP_SP_PO
```

如果匹配不到 PO 行：

```text
该NO数据不会生成入库明细
```

异常表现：

```text
提示 PO单还未同步 或 PO行数据缺失
```

### 11.4 入库明细的PO行标识如何生成

系统生成入库明细字段 `RELATED_PURCHASE_ID`：

```text
如果 SA_NUMBER 不为空：
  RELATED_PURCHASE_ID = SA_NUMBER + "-" + PO_LINE_NUMBER

如果 SA_NUMBER 为空：
  RELATED_PURCHASE_ID = PO_LINE_NUMBER
```

产品含义：

```text
该字段用于关联采购申请/PO行，后续回写采购系统和PO状态时会使用。
```

### 11.5 入库仓库如何确定

系统根据 PO 对应公司查找机房库：

```text
MMP_STORAGE.STORAGE_TYPE = 'D'
AND MMP_STORAGE.ERP_COMPANY = PO.ERP_COMPANY
```

找到后写入：

```text
MMP_SP_PO_PUTIN_HEAD.STORAGE_ID
```

如果找不到：

```text
入库单可能无法正确执行，需要管理员维护公司对应机房库。
```

### 11.6 NO位置如何映射MMP地点

NO推送字段：

```text
NO_LOCATION
```

系统拆分：

```text
NO_LOCATION = NO位置前缀 + ";" + NO位置描述
```

计算：

| 内容 | 来源 |
|---|---|
| NO位置前缀 | 分号前 |
| NO位置描述 | 分号后 |

系统用 NO位置前缀查询：

```text
MMP_NO_LOCATION_MAPPING.NO_LOCATION_PHRASES
```

映射到：

```text
CITY
BUILDING
FLOOR
```

同时将分号后的 NO位置描述写入入库明细的 `NO_LOCATION`。

### 11.7 服务如何转换

NO推送的是服务名称：

```text
service
s_service
```

系统会转换成 MMP 服务编码：

| NO字段 | 查询条件 | 入库明细字段 |
|---|---|---|
| `service` | `MMP_ASSET_SERVICE.SERVICECATEGORY = 1` | `SERVICE` |
| `s_service` | `MMP_ASSET_SERVICE.SERVICECATEGORY = 2` | `SUB_SERVICE` |

如果服务名称查不到编码：

```text
对应服务字段可能为空，后续资产信息不完整。
```

### 11.8 责任人如何确定

NO推送中包含：

```text
employee_code
```

但 NO设备入库明细最终责任人会根据物料类型做特殊处理。

| 物料类型 | 责任人规则 |
|---|---|
| 服务器类 | 使用公司+板块对应的虚拟管理员 |
| 网络设备类 | 使用公司+板块对应的虚拟管理员 |

服务器类还会根据成本中心前两位推导板块：

```text
ERP_PLATE = COST_CENTER 前两位
```

网络设备类会根据虚拟管理员反查成本中心。

产品含义：

```text
NO设备通常入机房库，责任人不是普通员工，而是对应公司/板块的虚拟管理员。
```

### 11.9 启用日期如何计算

系统生成入库明细时会计算启用日期：

```text
当前日期 day < 26：
  启用日期 = 当前日期

当前日期 day >= 26：
  启用日期 = 下个月1号
```

产品含义：

```text
每月26日及之后入库的NO设备，启用日期顺延到下月1日。
```

### 11.10 单价和税额如何计算

初始生成入库明细时，单价和税额来自 PO：

```text
PURCHASE_PRICE = PO.PURCHASE_PRICE
PURCHASE_TAX = PO.PURCHASE_TAX
```

生成完入库明细后，系统会按 PO 行做一次价格刷新。

如果不是该 PO 行最后一批同步数据：

```text
明细不含税金额 = 入库数量 * PO不含税单价
明细税额 = 入库数量 * PO税额单价
```

如果是该 PO 行最后一批同步数据：

```text
最后一条明细承担四舍五入差额
```

产品含义：

```text
系统通过最后一条明细补差，保证NO入库明细金额合计与PO金额合计一致。
```

### 11.11 是否已生成工单如何判断

字段：

```text
MMP_NO_SOA_INPUT.ATTRI_TEXT01
```

| 值 | 含义 |
|---|---|
| `N` | 未生成入库工单 |
| `Y` | 已生成入库工单 |

当 NO数据成功生成入库明细后，系统更新：

```text
ATTRI_TEXT01 = Y
```

### 11.12 PO状态如何回写

执行入库后，系统根据入库单明细回写 PO 状态。

回写目标：

```text
MMP_SP_PO.FLAG = 2
```

业务含义：

```text
PO已入库
```

但回写不是无条件执行。系统会判断：

```text
累计入库数量 = PO采购数量
```

满足后才更新为已入库。

## 12. 入库单与明细生成结果

### 12.1 入库单头

生成表：

```text
MMP_SP_PO_PUTIN_HEAD
```

关键字段：

| 字段 | 值/说明 |
|---|---|
| `SP_PO_PUTIN_NUM` | 入库单号 |
| `BILL_TYPE` | `PUTIN` |
| `STEP` | `0` 草稿 |
| `PUTIN_TYPE` | `ADD` |
| `IS_HANDLE_FLAG` | `NO`，标识NO入库 |
| `STORAGE_ID` | 公司对应机房库 |
| `CREATED_BY` | 页面触发用户或 `admin` |

### 12.2 入库明细

生成表：

```text
MMP_SP_PO_LINE_MOST_DIS
```

关键字段：

| 字段 | 来源/计算 |
|---|---|
| `PUTIN_HEAD_ID` | 入库单头ID |
| `TAG_NUMBER` | NO推送 `tag_number` |
| `SERIAL_NUMBER` | NO推送 `serial_number` |
| `PARENT_TAG_NUMBER` | NO推送 `parent_tag_number` |
| `ASSET_STATUS` | 字典 `NO_IN_STATUS`，默认 `4` |
| `PURCHASE_ID` | NO推送 `po_number` |
| `RELATED_PURCHASE_ID` | `sa_number + "-" + po_line_number` |
| `APPL_NUMBER` | NO推送 `sa_number` |
| `RELATED_PR_ID` | NO推送 `pr_number` |
| `PUTIN_QUANTITY` | NO推送 `receive_quantity` |
| `NO_LOCATION` | NO位置分号后的描述 |
| `CITY/BUILDING/FLOOR` | NO位置映射 |
| `SERVICE/SUB_SERVICE` | 服务名称转换后的服务编码 |
| `ERP_COST_CENTER` | NO推送成本中心或虚拟管理员成本中心 |
| `CPU/HDD/RAM` | NO推送配置 |
| `ENABLE_DATE` | 当前日期或下月1号 |
| `ADD_TYPE` | 字典 `NO_ADD_TYPE`，默认 `add_cg` |

## 13. 执行入库

NO入库草稿生成后，用户在入库单页面执行入库。

入口：

```text
/mmpSpPoPutinHead.do?method=executePutin
```

执行后：

1. 入库单状态改为完成。
2. 系统读取入库明细。
3. 如果物资类型是资产/高耗，装配资产对象。
4. 调用资产入库服务。
5. 创建资产台账。
6. 创建资产事务。
7. 推送采购系统。
8. 回写 PO 已入库。

## 14. 生成资产台账

执行入库后，系统将入库明细转换为资产台账。

生成表：

```text
MMP_ASSETS
```

关键字段映射：

| 入库明细 | 资产台账 | 产品含义 |
|---|---|---|
| `TAG_NUMBER` | `TAG_NUMBER` | 资产标签号 |
| `SERIAL_NUMBER` | `SERIAL_NUMBER` | SN号 |
| `PARENT_TAG_NUMBER` | `PARENT_ASSET_NUMBER` | 主资产标签号 |
| `NO_LOCATION` | `NO_LOCATION` | NO位置 |
| `SERVICE` | `SERVICE` | 一级服务 |
| `SUB_SERVICE` | `SERVICE_SERVICE` | 二级服务 |
| `ERP_COMPANY` | `REGION_ID_COMPANY` | 公司 |
| `ERP_PLATE` | `PLATE` | 板块 |
| `ERP_COST_CENTER` | `ORGANIZATION` | 成本中心 |
| `CITY/BUILDING/FLOOR` | 对应地点字段 | 资产地点 |
| `ITEM_CODE` | `ITEM_NUMBER` | 物料编码 |
| `ITEM_NAME` | `ASSET_NAME` | 资产名称 |
| `PURCHASE_ID` | `PO_NUMBER` | PO号 |
| `RELATED_PR_ID` | `PR_NUMBER` | PR号 |
| `PURCHASE_PRICE` | `ASSET_COST` | 资产成本 |
| `PURCHASE_TAX` | `TAXES` | 税额 |
| `CPU/HDD/RAM` | 配置字段 | 设备配置 |

同时生成：

```text
MMP_ASSETS_TRANSACTIONS
```

用于记录资产入库事务。

## 15. 采购系统回推

执行入库后，系统会向采购系统推送入库结果。

主要推送字段：

| 字段 | 含义 |
|---|---|
| `PO_FORM_ID` | PO单号 |
| `PO_NUMBER` | PO行号 |
| `SA_FORM_ID` | 入库单号 |
| `SA_FORM_DATE` | 入库日期 |
| `LOCATION` | 入库地点 |
| `MATERIAL_TYPE_CODE` | 物资大类 |
| `STROAGE_NUMBER` | 仓库编码 |
| `STROAGE_DESC` | 仓库描述 |
| `SA_FROM_LINE_ID` | 入库单行号 |
| `ITEM_CODE` | 物料编码 |
| `ITEM_DESC` | 物料描述 |
| `TAG_NUMBER` | 资产标签号 |
| `QUANTITY` | 入库数量 |
| `AMOUNT` | 金额 |
| `REC_EMPLOYEE_NUMBER` | 接收人 |
| `REC_DATE` | 接收日期 |
| `BUNUM` | 板块 |

推送结果记录：

```text
EAS_SOA_LOG
```

入库单同步标识：

```text
MMP_SP_PO_PUTIN_HEAD.IS_SYNC_FLAG
```

## 16. 状态流转

### 16.1 NO中间表状态

```text
未生成工单 ATTRI_TEXT01 = N
  -> 已生成工单 ATTRI_TEXT01 = Y
```

### 16.2 入库单状态

```text
草稿 STEP = 0
  -> 完成 STEP = 1
```

### 16.3 PO状态

```text
待入库/已接收 FLAG = 1
  -> 已入库 FLAG = 2
```

## 17. 异常场景

| 场景 | 系统表现 | 产品处理建议 |
|---|---|---|
| PO未同步到MMP | 不生成入库单 | 提示等待PO同步 |
| NO接收数量小于PO采购数量 | 不生成入库单 | 等待NO继续推送 |
| NO接收数量大于PO采购数量 | 返回“PO单数据超标” | 提示核查NO数据 |
| PO行匹配不到 | 跳过该行 | 提示PO行缺失 |
| 公司无机房库 | 入库单仓库为空或执行异常 | 提示管理员维护机房库 |
| NO地点无映射 | 城市/楼宇/楼层为空 | 提示维护NO地点映射 |
| 服务名称无法转编码 | 服务字段为空 | 提示维护服务配置 |
| 成本中心异常 | 费用账户/责任归属异常 | 提示核查成本中心 |
| 采购推送失败 | 本地入库成功但同步失败 | 支持重推或运维处理 |

## 18. 产品验收标准

### 18.1 NO数据接收

- NO推送合法数据后，MMP生成或更新 `MMP_NO_SOA_INPUT`。
- `tag_number` 相同的数据不会重复新增。
- `parent_tag_number` 正确保存为主资产标签号。
- 初始状态为未生成工单。

### 18.2 入库单生成

- PO未同步时，不生成入库单。
- NO接收数量未达到PO采购数量时，不生成入库单。
- NO接收数量等于PO采购数量时，可生成入库单草稿。
- 入库单头标识为 NO 入库。
- 入库明细数量与NO接收数据一致。

### 18.3 关键计算

- NO位置前缀正确用于分组和地点映射。
- 启用日期在每月26日及之后顺延到下月1号。
- 服务器/网络设备责任人正确使用虚拟管理员。
- 最后一条明细正确承担PO金额四舍五入差额。
- 累计入库数量达到PO采购数量后，PO状态变为已入库。

### 18.4 执行入库

- 执行入库后，入库单状态变为完成。
- 生成 `MMP_ASSETS` 资产台账。
- 生成 `MMP_ASSETS_TRANSACTIONS` 资产事务。
- 采购系统收到入库回推。
- 推送失败时保留失败状态和日志。

## 19. 产品关注点

1. NO设备流程不走普通人工接收单，页面文案应避免写成“创建接收单”。
2. NO数量未齐时不生成入库单，产品上应能说明“等待NO数据完整”。
3. `parent_tag_number` 是主资产标签号，影响后续资产父子关系。
4. NO位置、服务、机房库都是强依赖基础配置，建议增加异常提示。
5. 本地入库成功和采购推送成功是两个阶段，需要分开展示状态。
6. 金额补差由系统自动处理，测试需重点覆盖最后一条明细金额。
7. NO入库单 `IS_HANDLE_FLAG=NO`，可作为页面筛选和统计维度。

## 20. 建议优化

| 优化点 | 说明 |
|---|---|
| 增加NO数据完整性看板 | 展示PO采购数量、NO已推数量、差额 |
| 增加NO异常数据列表 | 展示PO未同步、数量超标、地点未映射、服务未匹配等 |
| 入库单标识NO来源 | 页面展示“NO自动生成”标签 |
| 增加一键重试生成入库单 | 对满足条件但生成失败的数据支持重试 |
| 增加采购推送重推入口 | 对 `IS_SYNC_FLAG=N` 的入库单支持重推 |
| 增加主资产关系预览 | 展示当前资产标签号与主资产标签号关系 |
| 增加金额核对明细 | 展示PO金额、NO入库金额、补差行 |

