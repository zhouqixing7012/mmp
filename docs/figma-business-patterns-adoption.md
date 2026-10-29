# 团队历史业务设计吸收索引

日期：2026-10-29。对应规范：`UI_DESIGN_GUIDELINES.md` V2.4。

用户要求从团队历史作品吸收 PC 和移动端经验，供未来设计复用，本轮暂不修改原型。正式规则统一维护在 [UI 规范](UI_DESIGN_GUIDELINES.md)，本文件只记录来源、证据与取舍。

## 读取范围与证据边界

- 来源为用户本轮提供的《业务系统 (Copy)》，文件键 `OrX0ND2g88XrjJqgPTtnFb`。八个链接实际均指向画布页面，不是八张单独页面截图。
- 已读取八个入口的结构元数据，并实际查看下表20个代表节点的截图，覆盖主要页面类型与部分关联状态；未逐张审阅画布内所有历史变体、草稿与图标。
- 截图证明可见结构与状态，不能证明运行交互。规范中“返回保留条件”“预览与提交一致”“失败不丢输入”等是由设计模式提炼的实施要求，不声称原稿已经运行验证。
- 未改 Figma、`src/`、业务 PRD、主题Token或原型功能。本轮不运行应用测试、构建或浏览器验收。
- 原文件中存在草稿箱、备选、过程稿和走查问题汇总；未按坐标、节点编号或名称中的日期自动判断最终版本。抽样不用于替设计师裁定未确认Token。

## 八个来源与规则去向

| 入口 | 实际查看的代表节点（截图） | 值得复用的设计经验 | 规则位置与吸收边界 |
|---|---|---|---|
| [AI差旅 · 0:1](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=0-1) | [PC详情 1:11](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1-11)、[移动附件空态 20:998](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=20-998) | 对象标识、基本信息、明细及审批分区；流程进度与记录并存；移动Tab与底部动作分离 | 第1.4、23.1、29A.7节；保留既有详情/审批结构，不复制差旅字段、审批节点和旧灰色空态插图 |
| [差旅系统订票优化 · 1154:968](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1154-968) | [默认卡片 1154:2386](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1154-2386)、[展开卡片 1154:2699](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1154-2699)、[预订须知 2638:2808](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=2638-2808) | 摘要与关联明细分层；父子记录各自状态；重要限制、说明与下一步动作邻近 | 第29A.7、29A.9节；不复制订票限制、预算、黑色预订按钮或支付流程。PC画布只做结构读取，未细验其全部长表 |
| [ERP仪表盘 · 1:2](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1-2) | [ERP系统数据看板 723:1110](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=723-1110) | 期间与范围在前，运营/技术分组指标、主值与变化量并列、口径说明入口 | 第14.4节；不复制健康度公式、红涨绿跌、全表居中及渐变背景 |
| [服务号群聊机器人 · 1:3](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1-3) | [卡片配置 785:9707](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=785-9707)、[投放预览 785:10740](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=785-10740) | 分步配置、编辑与预览并列、最终对象/范围/参数摘要、跨端预览 | 第22.5节；部分稿存在英文混排、缺字与大阴影，仅吸收模式，不新增消息发布功能、不照抄紫色样式或静态检查通过 |
| [视频版权系统导航重构 · 368:608](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=368-608) | [展开导航 382:653](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=382-653)、[收起导航 382:874](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=382-874) | 图标与名称成组、模块层级、收折释放主区空间 | 第14.3节；不迁入版权菜单，也不把235/56px升为全站侧栏尺寸；名称提示与键盘能力作为后续实施要求 |
| [AI音视频会议纪要 · 1051:2](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1051-2) | [PC详情 1303:4214](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1303-4214)、[生成失败 1328:6461](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1328-6461)、[移动详情 1733:1016](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1733-1016)、[移动开启确认 2019:594](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=2019-594) | 基本信息与结果分离、局部失败恢复、PC并列区块转移动单列、媒体文件动作、局部表格横滑 | 第14.3、28.2、29A.7、29A.9节；不新增AI或录制能力，不照搬会议授权规则；加载/无输入等更多状态另有结构证据，未逐张截图核验 |
| [HRBP工作台 · 1051:3](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1051-3) | [部门HC报告 2719:2507](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=2719-2507)、[操作记录 2961:9633](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=2961-9633)、[变动审核 2819:667](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=2819-667) | 层级表格、分组表头、变化前后值、异常行说明与附件邻近 | 复用既有第20.1/20.2、22.4、27.1、28.1节，补第23.1节；旧稿“查询→重置”、绿色确认和只读记录Tab的保存按钮不覆盖现行规则 |
| [管理工作台 · 1051:4](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=1051-4) | [首页 3222:4747](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=3222-4747)、[筛选 2923:7761](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=2923-7761)、[部门选择 2965:12378](https://www.figma.com/design/OrX0ND2g88XrjJqgPTtnFb?node-id=2965-12378) | 概况/阶段/提醒/任务入口分层、筛选集中应用、层级选择与确认 | 复用第29A.1～6节，补第29A.8节；不移入HR阈值、占位图标；字段名称持续可见优先于截图仅靠placeholder的写法 |

## 冲突处理

| 历史稿差异 | 本次处理 |
|---|---|
| AI差旅全白画布、消息稿紫色主按钮、仪表盘渐变 | 吸收布局思路；主题仍按现行ERP语义Token与第14节 |
| 多种外边距、弹窗宽度、侧栏宽度 | 记录为场景样本，不推断全局Token；已有Blue-5/9、radius4、Dialog Large争议继续保留 |
| 历史查询按钮顺序与标签宽度不同 | 现行第21节84px标签和更多/重置/查询顺序优先 |
| 截图的操作记录也带取消/保存 | 只读场景按第27节，不为对齐截图制造保存动作 |
| 移动弹窗16px或24px侧距、40px按钮可见高度 | 不设全局固定值；按视口及公共移动组件验证，图形尺寸不等于触控热区 |
| 移动会议表格局部横滑 | 只用于确需行列比较的局部表格；不推翻普通移动列表单列卡片规则 |
| 生成失败含重试按钮、列表空态不含按钮 | 区分任务失败与查询无匹配；后者仍通过原筛选区重置 |
| 旧灰色附件空图与现行蓝色空态素材 | 只吸收“说明缺少的对象”；不替换已确认空态原素材 |

## 后续使用方式

未来新增页面先查UI规范第1.4节选型，再查对应PC/移动规则。需要视觉参照时回到本索引的具体节点；不必重新遍历八张大画布。此次完成的是规范吸收，不是页面改造或交互验收。
