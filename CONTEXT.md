# 当前状态
新增报废申请单编辑页（ScrapApplicationEdit），从外部项目整合。
新页面路径：/BaofeiShenqing，导航显示为"报废申请单编辑"。
旧报废申请单（/，AccountingScrapEdit）仍保留。

## 已完成的修改

### ResponsiblePersonReceiverApproval.js
- 转出资产信息段注释掉
- 标题"接收资产信息"改为"转移物资信息"

### ResponsiblePersonPhysicalApproval.js
- 转出资产信息段注释掉
- 标题"接收资产信息"改为"转移物资信息"
- 添加了 `renderLocationField` diff 展示组件（参考位置变更审批页样式）
- 资产数据添加 `locationChange` 字段（old/new），城市/建筑物/楼层列改为 diff 显示：有变更时旧值删除线 + 新值黄色标签
### 整合报废申请单编辑页
- 创建 ScrapApplicationEdit.js + ScrapApplicationEdit.css（从 react-scrap-application 外部项目合并）
- 新增路由 /BaofeiShenqing，导航名"报废申请单编辑"
- App.js 和 config/routes.js 同步更新
### 报废申请单编辑页 - 新增必填字段
- 基本信息新增三个必填字段：公司（财务公司弹窗选择）、资产大类（服务器/网络设备）、资产所在地（北京/非北京）
- 使用 SelectModal + Antd Select 组件实现
- 保存/提交时校验必填字段

# 上次停的位置
ResponsiblePersonPhysicalApproval diff 展示完成，构建通过。

# 关键决定
- diff 展示直接复用位置变更审批页的 renderLocationField 方案
- 数据层添加 locationChange 字段，不影响原有 city/bldg/floor
### 整合报废申请单编辑页
- ScrapApplicationEdit 使用独立 CSS 文件，不做 Tailwind 转换
- 作为独立的报废申请入口，区别于 AccountingScrapEdit（账面报废）
