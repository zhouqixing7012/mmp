# 当前状态
责任人变更接收人确认——审批 和 责任人变更实物确认——审批 两个页面完成修改。

## 已完成的修改

### ResponsiblePersonReceiverApproval.js
- 转出资产信息段注释掉
- 标题"接收资产信息"改为"转移物资信息"

### ResponsiblePersonPhysicalApproval.js
- 转出资产信息段注释掉
- 标题"接收资产信息"改为"转移物资信息"
- 添加了 `renderLocationField` diff 展示组件（参考位置变更审批页样式）
- 资产数据添加 `locationChange` 字段（old/new），城市/建筑物/楼层列改为 diff 显示：有变更时旧值删除线 + 新值黄色标签

# 上次停的位置
ResponsiblePersonPhysicalApproval diff 展示完成，构建通过。

# 关键决定
- diff 展示直接复用位置变更审批页的 renderLocationField 方案
- 数据层添加 locationChange 字段，不影响原有 city/bldg/floor
