# 当前状态
新增资产申请页（zichanshenqing），由用户创建页面组件，配置路由和个人工作台子菜单。
页面路径：/zichanshenqing，导航显示为"新增资产申请"。
侧边栏"个人工作台"改为可展开，下含"新增资产申请"子菜单（点击跳转）。

新增工作台首页页（gerengerzuotai），由用户上传的个人工作台页面转译嵌入。
作为"个人工作台"下第一个子菜单"工作台首页"，包含资产/耗材/合约号码三分类标签页及操作确认弹窗。

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
新子菜单"工作台首页"已整合，TypeScript 转译完成，构建通过。
报废申请单编辑页已整合，基本信息已添加三个必填字段并完成布局调整，构建通过。已提交 git commit 373bc59。

# 关键决定
- diff 展示直接复用位置变更审批页的 renderLocationField 方案
- 数据层添加 locationChange 字段，不影响原有 city/bldg/floor
### 整合报废申请单编辑页
- ScrapApplicationEdit 使用独立 CSS 文件，不做 Tailwind 转换
- 作为独立的报废申请入口，区别于 AccountingScrapEdit（账面报废）
