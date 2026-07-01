# `/mmpSpPoRecHead.do?method=createNoRec` NO执行入库数据处理逻辑

## 1. 入口与调用链

入口页面：`WebRoot/business/mmpSpPo/mmpSpPo_rec.jsp`

入口接口：

```text
POST /mmpSpPoRecHead.do?method=createNoRec
```

后端入口：

```text
MmpSpPoRecHeadAction.createNoRec(...)
  -> MmpSpPoRecHeadService.createNoRec(headVO, poLineList, jsonMap)
     -> createNoOrderLineVO(...)       创建接收单行
     -> createRecNoDetail(...)         创建接收/入库共用明细
     -> createPutinOrderForNO(...)     按NO地点拆分生成草稿入库单
```

代码位置：

- `MmpSpPoRecHeadAction.java:2320`
- `MmpSpPoRecHeadService.java:728`
- `MmpSpPoRecHeadService.java:753`
- `MmpSpPoRecHeadService.java:878`
- `MmpSpPoRecHeadService.java:1237`

## 2. 触发场景

页面中“执行入库”按钮只在以下 PO 类型显示：

```text
orderType in ('103', '104', '105', '106')
```

前端注释为“服务器入库”，普通接收走 `createRec`，服务器/网络设备类 NO 入库走 `createNoRec`。

## 3. 请求参数来源

### 3.1 表单头字段

| 参数 | 来源页面字段 | 后端接收字段 | 用途 |
|---|---|---|---|
| `purchaseId` | `${poVO.purchaseId}` | `headVO.purchaseId` | PO单号，后续查询 `MMP_SP_PO` 和 `MMP_NO_SOA_INPUT` |
| `orderType` | `${poVO.orderType}` | `headVO.orderType`，并写入 `attriText05` | PO订单类型 |
| `IsMaterial` | `${poVO.isMaterial}` | 表单字段 | 页面回跳使用，服务端本方法未参与核心计算 |
| `purchaseDate` | `${poVO.purchaseDate}` | `headVO.purchaseDate` | 接收单头字段，后续明细会被 NO 逻辑覆盖为当前日期 |
| `materialKind` | `${poVO.materialKind}` | `headVO.materialKind` | 接收单头字段 |
| `materialTypeCode` | `${poVO.materialTypeCode}` | `headVO.materialTypeCode` | 接收单头字段 |
| `vendorCode` | `${poVO.supplier}` | `headVO.vendorCode`，后端也会用 PO 第一行 supplier 覆盖 | 供应商 |
| `vendorTel` | `${poVO.supplierTel}` | `headVO.vendorTel` | 供应商电话 |
| `purchaseDes` | `${poVO.purchaseName}` | `headVO.purchaseDes` | PO说明 |
| `erpCompany` | `${poVO.erpCompany}` | `headVO.erpCompany` | 公司，用于生成接收单号；入库单头按明细公司写入 |
| `erpPlate` | 页面板块选择 | `headVO.erpPlate` | 板块 |
| `inBatches` | 页面申请批次 | `headVO.inBatches` | 写入接收明细和入库明细 |

### 3.2 行参数 `relatedPurchaseLineIds`

前端把选中行的值改成 JSON 字符串提交：

```json
{
  "SA号-PO行号": [
    {
      "lineNm": "页面行号",
      "nowReceiveCount": "本次接收数量",
      "suitsCount": "部件数量",
      "suitsDesc": "部件说明",
      "isSuitsFlag": "是否套件",
      "configDetails": "配置",
      "itemCode": "物料编码",
      "itemName": "物料说明"
    }
  ]
}
```

后端解析规则：

- 如果参数字符串包含 `lineNm`，按 JSON 解析。
- JSON 的 key 作为 `relatedPurchaseLineId`，即 `SA_NUMBER || '-' || PO_LINE_NUMBER`。
- JSON value 放入 `jsonMap`，供接收单行覆盖字段使用。
- 如果不是 JSON，则直接当作 `relatedPurchaseLineId`。

## 4. 前置校验

执行创建前调用 `valIdcAddress(purchaseId, relatedPurchaseLineIds)` 校验 NO 位置信息。

查询逻辑：

```sql
select distinct
       substr(mnsi.no_location,0,instr(mnsi.no_location, ';', 1) - 1),
       (
         select 1
           from mmp_no_location_mapping l
          where l.no_location_phrases = substr(mnsi.no_location,0,instr(mnsi.no_location, ';', 1) - 1)
            and l.city is not null
            and l.building is not null
            and l.floor is not null
       )
  from mmp_no_soa_input mnsi
 where mnsi.po_number = :po_number
   and mnsi.sa_number || '-' || mnsi.po_line_number in (:po_line_number)
```

校验结果：

- 没有 NO 位置信息：返回 `NO入库数据缺失NO位置信息`
- 映射不存在或城市/建筑/楼层缺失：返回 `{NO地点}映射不存在或城市建筑楼层存在数据缺失!`
- 校验异常：返回 `NO地址映射校验失败，请稍后重试入库`
- 校验通过才继续创建单据

## 5. 接收单头 `MMP_SP_PO_REC_HEAD`

创建位置：`MmpSpPoRecHeadService.createNoRec`

| 字段 | 来源/计算逻辑 |
|---|---|
| `ID` | Hibernate uuid |
| `SP_PO_REC_NUM` | `MmpPublicUtil.generateApplyNum("REC", headVO.erpCompany)` |
| `STEP` | 固定 `PublicConstants.SpPoRec.SP_PO_REC_STEP_FINISH`，值为 `2`，表示接收完成 |
| `PURCHASE_ID` | 请求表单 `purchaseId` |
| `PURCHASE_DES` | 请求表单 `purchaseDes`，页面来自 `poVO.purchaseName` |
| `ERP_COMPANY` | 请求表单 `erpCompany` |
| `ERP_PLATE` | 请求表单 `erpPlate` |
| `ERP_BUSINESS_LINE` | 表单字段，如页面提交则由 Struts 绑定；该 NO 方法内未重新计算 |
| `DEPTID` | 后端取 `MMP_SP_PO` 第一行 `deptid` 覆盖 |
| `PURCHASE_DATE` | 表单字段 `purchaseDate` |
| `VENDOR_CODE` | 后端取 `MMP_SP_PO` 第一行 `supplier` 覆盖 |
| `VENDOR_TEL` | 请求表单 `vendorTel` |
| `BUYER_CODE` | 后端取 `MMP_SP_PO` 第一行 `buyerCode` |
| `BUYER_TEL` | 后端取 `MMP_SP_PO` 第一行 `buyerTel` |
| `MATERIAL_KIND` | 请求表单 `materialKind` |
| `MATERIAL_TYPE_CODE` | 请求表单 `materialTypeCode` |
| `CONTRACT_SUBJECT` | 表单字段，如页面提交则由 Struts 绑定；本方法内未重新赋值 |
| `CREATED_BY` | 当前登录用户 `user.getAccount()` |
| `CREATED_DATE` | `new Timestamp(System.currentTimeMillis())` |
| `ATTRI_TEXT01` | 当前登录用户中文名/用户名 `user.getUsername()` |
| `ATTRI_TEXT05` | `orderType` |
| `IN_BATCHES` | 页面申请批次 `inBatches` |
| 其他字段 | 本方法未显式赋值，保持表单绑定值、默认值或空值 |

去重规则：

- 先按 `spPoRecNum` 查 `mmp_sp_po_rec_head`。
- 如果不存在才创建接收单头。

## 6. 接收单行 `MMP_SP_PO_REC_LINE`

创建位置：`createNoOrderLineVO(headVO, list, jsonMap)`

数据基准：

```text
MMP_SP_PO where purchase_id = purchaseId
          and related_purchase_line_id in (selected relatedPurchaseLineIds)
```

先执行：

```java
PropertyUtils.copyProperties(nVO, poLineVO)
```

因此接收单行默认继承 PO 行同名字段，例如 `purchaseId/purchaseQuantity/purchasePrice/purchaseTax/erpCompany/erpPlate/deptid/itemCode/itemName/...`。

显式覆盖字段：

| 字段 | 来源/计算逻辑 |
|---|---|
| `ID` | Hibernate uuid |
| `HEAD_ID` | 接收单号 `headVO.spPoRecNum`，不是接收单头 `id` |
| `CREATED_BY` | `headVO.createdBy` |
| `CREATED_DATE` | `COMMON.toTimestamp()` |
| `LAST_UPDATED_BY` | `headVO.createdBy` |
| `LAST_UPDATED_DATE` | `COMMON.toTimestamp()` |
| `VENDOR_CODE` | PO 行 `supplier` |
| `APPLICANT_NAME` | `MmpPublicUtil.findAllUserMap().get(poLine.applicantCode)` |
| `PURCHASE_DES` | PO 行 `purchaseName` |
| `ATTRI_TEXT01` | PO 行 `applLineNumber`，代码注释为“行id” |
| `RECEIVE_COUNT` | 前端 JSON `nowReceiveCount` |
| `SUITS_COUNT` | 前端 JSON `suitsCount` |
| `SUITS_DESC` | 前端 JSON `suitsDesc` |
| `IS_SUITS_FLAG` | 前端 JSON `isSuitsFlag` |
| `ITEM_CODE` | 前端 JSON `itemCode` 非空时覆盖 PO 行物料编码 |
| `ITEM_NAME` | 前端 JSON `itemName` 非空时覆盖 PO 行物料名称 |
| `CONFIG_DETAILS` | 前端 JSON `configDetails` |
| `ATTRI_NUMBER03` | PO 行 `noTaxTotal`，临时保存 PO 原始不含税金额小计 |
| `NO_TAX_TOTAL` | `PO.purchasePrice * receiveCount` |
| `TOTAL` | `PO.price * receiveCount`，`price` 是 PO 含税单价 |
| `ATTRI_NUMBER05` | `PO.total - PO.noTaxTotal`，临时保存 PO 原始总税额 |
| `PURCHASE_TAX` | PO 行 `purchaseTax`。代码注释写“税金=总税额/采购数量”，但实际没有除法，只在 `purchaseQuantity != 0` 时直接赋 PO 行 `purchaseTax` |
| `ATTRI_NUMBER04` | `purchaseTax * receiveCount`，本次接收税额 |

金额计算注意点：

- `NO_TAX_TOTAL` 使用不含税单价 `purchasePrice` 乘以本次接收数量。
- `TOTAL` 使用含税单价 `price` 乘以本次接收数量。
- `PURCHASE_TAX` 在接收单行上仍保留 PO 行税金值，不是本次税额。
- 本次税额放在 `ATTRI_NUMBER04`。

## 7. 接收/入库共用明细 `MMP_SP_PO_LINE_MOST_DIS`

创建位置：`createRecNoDetail(vo, recLineList)`

每条接收单行会查询 NO 明细：

```text
MMP_NO_SOA_INPUT
 where poNumber = purchaseId
   and saNumber || '-' || poLineNumber = relatedPurchaseLineId
   and nvl(attriText01,'N') = 'N'
   and nvl(attriText02,'N') = 'Y'
 order by tagNumber
```

含义：

- `ATTRI_TEXT01 = N`：尚未被本次接收入库处理。
- `ATTRI_TEXT02 = Y`：NO 明细已进入可执行入库状态。
- 一条 NO 明细生成一条 `MMP_SP_PO_LINE_MOST_DIS`。

### 7.1 从接收单行复制/计算

创建明细时先调用 `copyProperties(detailVO, recLineVO)`，主要字段如下：

| 字段 | 来源/计算逻辑 |
|---|---|
| `ID` | Hibernate uuid |
| `HEAD_ID` | 接收单头 `vo.id` |
| `LINE_ID` | 接收单行 `recLine.id` |
| `ADD_TYPE` | 先设为 `REC`，后续可能被 NO 字典 `NO_ADD_TYPE` 覆盖 |
| `ERP_COMPANY` | 接收单行 `erpCompany` |
| `ERP_BUSINESS_LINE` | 接收单行 `erpBusinessLine`，后续会被固定为默认业务线 |
| `ASSET_DESC` | 根据接收单行 `deptid` 查询部门全名，超过两级时截取前三级，否则取全名 |
| `PARENT_TAG_NUMBER` | 如果接收单行 `attriText01` 非空，则按它查 `MMP_SP_PO_LINE_MOST_DIS` 主键并取其 `parentTagNumber`；后续会被 NO 主资产标签覆盖 |
| `ERP_PLATE` | 接收单行 `erpPlate`，后续服务器类可能按成本中心前两位覆盖 |
| `DEPTID` | 接收单行 `deptid` |
| `ITEM_CODE` | 接收单行 `itemCode`，后续会按物料主数据校准 |
| `ITEM_NAME` | 接收单行 `itemName`，后续会按物料主数据校准 |
| `PURCHASE_DATE` | 接收单行 `purchaseDate`，后续会被当前日期覆盖 |
| `RELATED_PR_ID` | 接收单行 `relatedPrId`，后续会被 NO `prNumber` 覆盖 |
| `PURCHASE_ID` | 接收单行 `purchaseId`，后续会被 NO `poNumber` 覆盖，通常一致 |
| `PURCHASE_QUANTITY` | 接收单行 `purchaseQuantity` 转 Double |
| `ATTRI_TEXT01` | 接收单行 `attriText01` |
| `OFFICE` | 接收单行 `office` |
| `CREATED_BY` | 接收单行 `createdBy`，后续会被当前用户覆盖 |
| `CREATED_DATE` | `COMMON.toTimestamp()`，后续会再写一次当前时间 |
| `LAST_UPDATED_BY` | 接收单行 `createdBy`，后续会被当前用户覆盖 |
| `LAST_UPDATED_DATE` | `COMMON.toTimestamp()`，后续会再写一次当前时间 |
| `PURCHASE_PRICE` | 接收单行 `purchasePrice` 四舍五入保留2位 |
| `ATTRI_NUMBER05` | 接收单行 `attriNumber05`，即 PO 原始总税额 |
| `PURCHASE_TAX` | 接收单行 `purchaseTax` 四舍五入保留2位 |
| `APPL_NUMBER` | 接收单行 `applNumber`，后续会被 NO `saNumber` 覆盖 |
| `PUTIN_QUANTITY` | 先固定为 `1D`，后续会被 NO `receiveQuantity` 覆盖 |
| `IS_HANDLE_FLAG` | 固定 `Y` |
| `MATERIAL_KIND` | 接收单行 `materialKind`，后续会按物料主数据校准 |
| `MATERIAL_TYPE_CODE` | 接收单行 `materialTypeCode`，后续会按物料主数据校准 |
| `MACHINE_CONFIG` | 接收单行 `machineConfig` |
| `IS_SUITS_FLAG` | 接收单行 `isSuitsFlag` |
| `SUITS_COUNT` | 接收单行 `suitsCount` 转 Long |
| `SUITS_DESC` | 接收单行 `suitsDesc` |
| `CONFIG_DETAILS` | 接收单行 `configDetails` |
| `APPLY_USER_ID` | 接收单行 `applicantCode` |
| `APPLY_USER_NAME` | `MmpPublicUtil.getUserNameByAccount(applicantCode)` |
| `RELATED_PURCHASE_ID` | 接收单行 `relatedPurchaseLineId`，后续会按 NO `SA-PO行号` 重写 |

### 7.2 从 NO 明细补充/覆盖

位置：`complementedNoRecDetailLine(mmpNoSoaInputVO, detailVO, recLineVO)`

| 字段 | 来源/计算逻辑 |
|---|---|
| `TAG_NUMBER` | NO 明细 `tagNumber` |
| `ASSET_STATUS` | 字典 `NO_SOA_RELATED/NO_IN_STATUS` 的 detail；无字典时用默认 `noInputStatus` |
| `SERIAL_NUMBER` | NO 明细 `serialNumer` |
| `ERP_PLATE` | 先取 PO/接收单行 `erpPlate`；若物料类型为服务器 `14`，改为 NO `costCenter` 前两位 |
| `NO_LOCATION` | NO 明细 `noLocation` |
| `CITY` | `MMP_NO_LOCATION_MAPPING` 按 NO 地点第一段映射 |
| `BUILDING` | `MMP_NO_LOCATION_MAPPING` 按 NO 地点第一段映射 |
| `FLOOR` | `MMP_NO_LOCATION_MAPPING` 按 NO 地点第一段映射 |
| `PURCHASE_ID` | NO 明细 `poNumber` |
| `RELATED_PURCHASE_ID` | 如果 `saNumber` 为空取 `poLineNumber`，否则取 `saNumber + '-' + poLineNumber` |
| `RETIRED_DESC` | PO 行 `erpBusinessLine` |
| `ERP_COMPANY` | PO 行 `erpCompany` |
| `ITEM_CODE` | PO 行 `itemCode`，随后按物料主数据校准 |
| `PURCHASE_PRICE` | PO 行 `purchasePrice` 除以 1 后保留2位，实际等于保留2位 |
| `PURCHASE_TAX` | PO 行 `purchaseTax` 除以 1 后保留2位，实际等于保留2位 |
| `ERP_COST_CENTER` | NO 明细 `costCenter`；网络设备类型 `15` 时会改成虚拟责任人的成本中心 |
| `PURPOSE` | 字典 `NO_SOA_RELATED/NO_PURPOSE` 的 detail；无字典时默认 `PROFESSIONAL`；物料类型为空/服务器/网络设备时会置空白用途 |
| `PURCHASE_DATE` | 当前系统日期 |
| `ENABLE_DATE` | 当前日期；如果当前日 >= 26，则取下月1日 |
| `APPL_NUMBER` | NO 明细 `saNumber` |
| `RELATED_PR_ID` | NO 明细 `prNumber` |
| `CPU` | NO 明细 `boxCpu` |
| `HDD` | NO 明细 `boxHd` |
| `RAM` | NO 明细 `boxMemory` |
| `PARENT_TAG_NUMBER` | NO 明细 `attriText03`，即主资产标签号 |
| `PUTIN_QUANTITY` | NO 明细 `receiveQuantity` |
| `SERVICE` | 按 NO `service` 到 `MMP_ASSET_SERVICE` 查 `SERVICECATEGORY='1'`，写入 `serviceCode` |
| `SUB_SERVICE` | 按 NO `subService` 到 `MMP_ASSET_SERVICE` 查 `SERVICECATEGORY='2'`，写入 `serviceCode` |
| `MATERIAL_KIND` | 按 `ITEM_CODE` 查 `MMP_BASEDATA_MATERIAL_DIM_COM` 的 `materialKind` |
| `MATERIAL_KIND_NAME` | 字典 `MATERIAL_KIND` 的 detail |
| `MATERIAL_TYPE_CODE` | 物料主数据 `materialTypeCode` |
| `MATERIAL_CLASS_CODE` | 物料主数据 `materialClassCode` |
| `ITEM_NAME` | 物料主数据 `materialDimComDesc` |
| `ASSET_LEVEL` | 物料主数据 `priorityLevel` |
| `UOM` | 物料主数据 `unit` |
| `COST_ACCOUNT` | 代码直接置 `null`，费用账户生成逻辑被注释 |
| `DUTY_USER_ID` | 服务器类型 `14`：按公司+板块取虚拟管理员；网络设备类型 `15`：按公司+板块取虚拟管理员；其他类型未在本方法中按 NO employeeCode 赋值 |
| `ASSET_DESC` | 根据 PO 行 `deptid` 查询部门全名，超过两级截取前三段 |
| `ADD_TYPE` | 字典 `NO_SOA_RELATED/NO_ADD_TYPE ` 的 detail；注意代码中的字典项编码带尾部空格。无字典时默认采购新增 `ADD_CG` |
| `ERP_BUSINESS_LINE` | 固定 `StaticConstants.DEFAULT_ERP_BUSINESSLINE` |
| `CREATED_BY` | 当前登录用户账号 |
| `CREATED_DATE` | 当前系统时间 |
| `LAST_UPDATED_BY` | 当前登录用户账号 |
| `LAST_UPDATED_DATE` | 当前系统时间 |

### 7.3 价格/税额尾差补齐

在 `createRecNoDetail` 中，如果某 PO 行已经全部接收完成：

```text
本次接收数量 receiveCount + 历史已处理数量 extendReceiveCount = PO采购数量 purchaseQuantity
```

则对本次生成的最后一条明细进行尾差修正。

历史已处理数量：

```sql
select l.sa_number || '-' || l.po_line_number,
       count(l.receive_quantity)
  from mmp_no_soa_input l
 where l.po_number = :purchaseId
   and nvl(l.attri_text01,'N') = 'Y'
 group by l.po_number,l.sa_number,l.po_line_number
```

最后一条不含税单价修正：

```text
purchasePriceSum = detail.purchasePrice * purchaseQuantity
f0 = round(purchasePriceSum, 2)
lastPurchasePrice = recLine.attriNumber03 - f0
detail.purchasePrice = round(detail.purchasePrice + lastPurchasePrice, 2)
```

其中：

- `recLine.attriNumber03` = PO 原始不含税金额小计 `MMP_SP_PO.NO_TAX_TOTAL`
- 目的：把逐件四舍五入造成的不含税金额尾差补到最后一台资产上

最后一条税金修正：

```text
purchaseTaxSum = detail.purchaseTax * purchaseQuantity
f2 = round(purchaseTaxSum, 2)
lastPurchaseTax = detail.attriNumber05 - f2
detail.purchaseTax = round(detail.purchaseTax + lastPurchaseTax, 2)
```

其中：

- `detail.attriNumber05` = PO 原始总税额 `MMP_SP_PO.TOTAL - MMP_SP_PO.NO_TAX_TOTAL`
- 目的：把逐件税额四舍五入尾差补到最后一台资产上

## 8. 状态回写

### 8.1 回写 NO 明细已处理

处理完本次选中的 PO 行后：

```text
update MmpNoSoaInputVOImpl
   set attriText01 = 'Y'
 where nvl(attriText02,'N') = 'Y'
   and poNumber = 接收单PO号
   and saNumber || '-' || poLineNumber in (本次选中行)
```

含义：

- `MMP_NO_SOA_INPUT.ATTRI_TEXT01 = Y` 表示该 NO 入库资产已被 MMP 接收入库处理。

### 8.2 回写 PO 行已入库

仅当某 PO 行满足：

```text
本次接收数量 + 历史已处理数量 = PO采购数量
```

才更新：

```text
update MmpSpPoVOImpl
   set flag = '2'
 where purchaseId = 接收单PO号
   and relatedPurchaseLineId in (已全部接收完成的行)
```

含义：

- `MMP_SP_PO.FLAG = 2`：页面显示为“已入库”。

## 9. 草稿入库单头 `MMP_SP_PO_PUTIN_HEAD`

创建位置：`createPutinOrderForNO(lineDetailList, createdBy)`

拆单规则：

```text
按 NO_LOCATION 第一段分组，一组生成一张入库单头。
NO_LOCATION 第一段 = lineVO.noLocation.split(";")[0]
```

字段来源：

| 字段 | 来源/计算逻辑 |
|---|---|
| `ID` | Hibernate uuid |
| `ERP_COMPANY` | 同一 NO 地点分组中明细的 `erpCompany` |
| `STORAGE_ID` | 按公司查机房库：`MMP_STORAGE where STORAGE_TYPE='D' and ERP_COMPANY = head.erpCompany`，取第一条 `CODE` |
| `SP_PO_PUTIN_NUM` | `MmpPublicUtil.generateApplyNum("PUTIN", "")` |
| `BILL_TYPE` | 固定 `PUTIN` |
| `STEP` | 固定 `0`，即草稿 |
| `PUTIN_TYPE` | 固定 `ADD`，新增入库 |
| `CREATED_BY` | 接收单创建人账号；为空时用 `admin` |
| `IS_HANDLE_FLAG` | 固定 `NO`，表示 NO 入库单 |
| `IS_ES_FLAG` | 固定 `N` |
| `CREATED_DATE` | 当前系统时间 |
| `LAST_UPDATED_BY` | 接收单创建人账号；为空时用 `admin` |
| `LAST_UPDATED_DATE` | 当前系统时间 |
| 其他字段 | 本方法未显式赋值，保持空值或默认值 |

注意：

- 这里没有把接收单号写入 `SP_PO_REC_NUM`。
- 这里没有从接收单头汇总金额写 `PRICE_AMOUNT/TAX_AMOUNT`。
- 入库单头按 NO 地点拆分，但头表没有写 `CITY/BUILDING/FLOOR`，地点信息在明细上。

## 10. 草稿入库单明细 `MMP_SP_PO_LINE_MOST_DIS`

创建位置：`createPutinOrderForNO`

生成方式：

```java
PropertyUtils.copyProperties(newLineVO, recDetailVO);
newLineVO.setId("");
newLineVO.setPutinHeadId(headVO.getId());
```

字段规则：

| 字段 | 来源/计算逻辑 |
|---|---|
| `ID` | 清空后由 Hibernate 重新生成 uuid |
| `PUTIN_HEAD_ID` | 新创建的入库单头 `MMP_SP_PO_PUTIN_HEAD.ID` |
| 其他字段 | 完整复制接收/入库共用明细 `recDetailVO` 的字段 |

因此入库单明细中的资产标签、主资产标签、序列号、NO地点、城市建筑楼层、物料、服务、子服务、金额、税额、责任人等，都来自第 7 节生成的 `recDetailVO`。

## 11. 核心业务规则总结

1. 页面选择 PO 行并执行入库。
2. 后端校验所选 PO 行的 NO 位置信息必须存在，并且能映射出城市、建筑、楼层。
3. 创建一张已完成状态的接收单头，单号类型为 `REC`。
4. 按选中 PO 行创建接收单行，接收数量来自前端 `nowReceiveCount`。
5. 按 NO 明细逐台资产生成 `MMP_SP_PO_LINE_MOST_DIS` 明细。
6. NO 明细必须满足 `ATTRI_TEXT01=N` 且 `ATTRI_TEXT02=Y` 才会被处理。
7. 明细会补充资产标签、主资产标签、序列号、NO地点、服务、成本中心、物料主数据、启用日期、责任人等资产字段。
8. 如果某 PO 行已全部接收完成，会把不含税单价和税额尾差补到最后一条资产明细。
9. 处理完成后回写 NO 明细 `ATTRI_TEXT01=Y`。
10. 全部接收完成的 PO 行回写 `MMP_SP_PO.FLAG=2`。
11. 最后按 NO 地点第一段拆分生成一张或多张草稿入库单，入库单类型为 `PUTIN/ADD`，状态为草稿 `0`，标识为 NO 入库。

## 12. 现有代码注意点

- `HEAD_ID` 在接收单行中写的是 `spPoRecNum`，在明细中写的是接收单头 `id`，字段含义在不同表中不完全一致。
- `NO_ADD_TYPE ` 字典编码代码里带尾部空格，可能导致查不到字典项。
- 代码读取了 `employeeCode` 对应用户，但没有把普通类型资产的责任人写入 `dutyUserId`；只有服务器/网络设备类型通过虚拟管理员赋值。
- 接收单行税金注释写“总税额/采购数量”，实际代码直接使用 PO 行 `purchaseTax`。
- 入库单头未写接收单号、金额汇总和地点字段，关键业务数据主要在入库明细上。
- SQL/HQL 存在字符串拼接，当前文档只按现有逻辑整理，不评价改造方案。
