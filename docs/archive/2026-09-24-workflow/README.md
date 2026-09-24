# 2026-09-24 协作规则整理归档

来源仓库：zhouqixing7012/mmp；来源分支：main；固定版本：[67c9960755c731670e4f8232cde5d1a092db7c06](https://github.com/zhouqixing7012/mmp/commit/67c9960755c731670e4f8232cde5d1a092db7c06)。

本目录保存整改前的完整原文，内容与来源保持一致。默认启动仅阅读现行入口；只有追溯或核对对应模块时才阅读历史。归档不是整体作废声明，也不是已完成全部业务校准的声明。

## 文件去向

| 原文件 | 原文保留位置 | 当前使用方式 |
|---|---|---|
| AGENTS.md | [完整原文](AGENTS.source.md) | 现行工程要求→ENGINEERING_GUIDELINES；UI→UI_DESIGN_GUIDELINES；动效→UI_MOTION_GUIDELINES；入口和安全→AGENTS |
| AI_RULES.md | [完整原文](AI_RULES.md) | 协作流程→AI_RULES；技术边界→ENGINEERING_GUIDELINES；UI→UI_DESIGN_GUIDELINES；旧模板仅供历史参考 |
| lessons.md | [完整原文](lessons.md) | 通用纠错→lessons；写作→PRD_WRITING_GUIDELINES；工程/UI→专项规范；业务细节查正式PRD，未核实条目保留来源 |
| CONTEXT.md | [完整原文](CONTEXT.md) | 当前交接→CONTEXT；未完成→task_plan；业务目标→对应正式PRD；未逐项核实的业务原文留本快照 |
| task_plan.md | [完整原文](task_plan.md) | 未完成阶段→task_plan；已完成及旧方案→本快照/progress；旧八项业务问题已收口 |
| findings.md | [完整原文](findings.md) | 未解决数据缺口→findings；旧结论及决策证据→本快照；执行状态→task_plan |
| CLAUDE.md | [完整原文](CLAUDE.source.md) | 工具入口→CLAUDE；工程→ENGINEERING_GUIDELINES；旧重复UI按当前UI规范替代 |
| memory.md | [完整原文](memory.md) | 旧记忆原文→本快照；现行入口→memory指向AGENTS/CONTEXT；旧阶段不自动生效 |
| README.ai.md | [完整原文](README.ai.md) | 旧目录快照保留此处，现行文件只作入口 |
| PATH.ai.md | [完整原文](PATH.ai.md) | 旧Windows路径保留此处，现行路径按实际仓库根目录解释 |
| HEARTBEAT.md | [完整原文](HEARTBEAT.md) | 旧提示保留此处；现行仅按请求或明确自动化授权检查状态 |
| ROLLBACK_WARNING.md | [完整原文](ROLLBACK_WARNING.md) | 禁止回滚边界→AGENTS；旧损失清单保留此处，不自动恢复旧代码 |
| README.md | [完整原文](README.source.md) | 功能运行说明保留；待办→task_plan；文档导航更新；移动端狐小E旧描述按已确认口径修正 |
| ARCHITECTURE.md | [完整原文](ARCHITECTURE.md) | 源码架构保留；文档职责改为引用AGENTS并说明阅读关系 |
| docs/asset-inventory/资产盘点-待决策清单.md | [完整原文](docs/asset-inventory/资产盘点-待决策清单.md) | 14项问题与建议完整保留在原路径；仅修正未确认建议不得直接实施的处理方式 |
| progress.md | [完整原文](progress.md) | 新完成记录及旧完成记录→progress；原文无损快照保留此处 |
| docs/UI_DESIGN_GUIDELINES.md | [完整原文](docs/UI_DESIGN_GUIDELINES.md) | 原UI规范→同名现行文件；精确补齐已确认通用规则并消除加载等冲突 |

动效规范原文另见 [UI_MOTION_GUIDELINES.md](docs/UI_MOTION_GUIDELINES.md)，现行第10节仅将“大于300ms”统一为旧AGENTS已规定的“300ms及以上”；其他动效规则保持原文。

## 已核实的冲突与适用范围

| 原条目 | 处理依据 | 当前去向与状态 |
|---|---|---|
| lessons 第281行、CONTEXT 第50～54行：身份证可维护 | 2026-09-23后续确认及现行合约号码PRD相关规则 | 旧要求已替代；合约号码PRD明确不展示/编辑/导出，底层历史值保留 |
| findings 第214～223行：报废八项待确认 | 同文件第225～245行明确收口 | 已收口；四份报废相关正式PRD维护目标，不重提八项选择 |
| lessons 第9行：要求 Actions 成功才可交付预览 | 同文件末条、CONTEXT第42行不再追踪Actions | Actions验收要求已替代；AI_RULES要求验证实际线上状态，部署工作流不变 |
| CLAUDE：查询标签96px、固定三列 | AGENTS当前查询标签88px及SelectModal按实际宽度自适应 | UI第21、13.4节；详情标签96px属于不同场景，保留在第15节 |
| CLAUDE：多Card详情默认Descriptions | 当前UI第15节及AGENTS/lessons | UI第15节统一DetailGrid，简单独立详情仍可Descriptions |
| AI_RULES/UI：所有点击必须Loading | AGENTS与动效规范禁止无真实等待的假Loading | UI第28节明确真实异步等待才显示加载 |
| CONTEXT第208行：验证后自动勾选 | CONTEXT第9～10行、lessons第8行较新确认 | 旧自动勾选描述替代；注意“未验证物资勾选后填写原因”是另一分支，按移库PRD |
| CONTEXT第279行、lessons第275行：移库狐小E/打印泛化描述 | lessons第266行明确移动端精简 | 按端区分；移动端无狐小E或完成单打印，PC不能据此移除 |
| CONTEXT第281行：工作台单条自动进入、处理列 | CONTEXT第62行、lessons第263行后续确认 | 旧行为替代，查询结果留列表；以当前工作台PRD为准 |
| lessons第249行与第48行：PO剩余为零时编辑入口冲突 | 需要查现行资产/耗材接收PRD分别核对 | 未在本轮作业务决定；条目保留，相关任务按PRD核对，不能按文件位置判新旧 |
| lessons第279行与第270行：耗材模板必填/空白策略 | 当前耗材维护PRD需按字段和合并结果核对 | 不把旧摘要提升为现行校验；未在本轮改业务规则 |
| 旧memory：报废PRD未产出、历史分支和行数 | 新版四份PRD已存在，仓库目标main由用户本轮指定 | 旧阶段事实仅归档，不自动生成任务或切分支 |
| 盘点待决策清单末句：未回复按建议处理 | 本轮已确认缺失业务决定不能默认采纳 | 问题及建议保留，只澄清未确认不得实施 |

## 未完成事项防遗漏

| 原始位置 | 保留去向 |
|---|---|
| task_plan 第108～116行报废剩余阶段；findings第249～253行数据及实现缺口 | 根目录task_plan第1～5项、findings数据缺口 |
| task_plan第18、26行移动端浏览器验证 | task_plan第6项合并重复验证，不把当时缺浏览器当永久阻塞 |
| CONTEXT第142行资产盘点待决策 | task_plan第7项引用现有14项清单 |
| CONTEXT第17行标签打印权限和未定义规则 | task_plan第8项、findings及主PRD6.6 |
| CONTEXT第44行、findings第130行、lessons第272行耗材联动历史 | task_plan第9项、findings保留未确认状态 |
| README原待办、CONTEXT其他模块详情后续同步 | task_plan第10～12项 |
| 未逐项确认迁入PRD的历史细节 | task_plan第13项；本目录SOURCE_INDEX按章节定位，不标为已迁移 |

历史章节索引见 [SOURCE_INDEX.md](SOURCE_INDEX.md)，共 310 个章节入口。现行项目入口见 [AGENTS.md](../../../AGENTS.md)。
