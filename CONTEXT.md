# 当前状态

项目是产品演示用的企业资产管理前端，不是生产系统。

任务开始前必须先阅读：
- `AI_RULES.md`
- `CLAUDE.md`
- `CONTEXT.md`

# 本次完成

完成第八轮整改：完成 `yewurules.js` 后台业务视图主体拆分。

1. 新增权限模块 `src/pages/yewurules/modules/permission/`
   - 公司板块领取资产权限
   - 机房资产领取权限
   - 公司归属权限
   - 单据编号规则
   - 资产配给规则

2. 新增会计模块 `src/pages/yewurules/modules/accounting/`
   - HR 公司与财务公司映射
   - 部门与成本中心映射
   - 成本中心与板块映射
   - 城市与业务线映射
   - 部门与业务线映射
   - 资产折旧规则
   - 账套内容维护
   - 成本中心与科目映射
   - 物料大类与子科目映射
   - NO 服务与科目映射
   - 员工与项目映射

3. 新增费用模块 `src/pages/yewurules/modules/expense/`
   - 物资申请超标配置
   - 费用账户规则

4. 更新 `src/pages/yewurules.js`
   - 已直接提交到 `feat/business-rule-updates`。
   - 入口仅保留后台状态、页面映射和框架组合。
   - 文件由约 4655 行降低到约 200 行。

5. 更新 `README.md`
   - 补充 permission、accounting、expense 模块结构。
   - 更新入口文件规模和后续整改方向。

# 已完成的后台拆分

- 后台框架：`components/`
- 菜单与页签配置：`config/`
- 个人工作台映射
- 物料模块：`modules/material/`
- 业务映射模块：`modules/mapping/`
- 仓库模块：`modules/warehouse/`
- 地点模块：`modules/location/`
- 权限模块：`modules/permission/`
- 会计模块：`modules/accounting/`
- 费用模块：`modules/expense/`

# 近期关键决定

- 不修改 `package.json`，不新增依赖。
- 保留现有菜单、页签名称和 mock 数据字段。
- 新模块使用目录 `index.js` 统一出口。
- 大文件触发连接器限制时，改为一个页面一个文件提交。
- `yewurules.js` 入口文件最后更新，避免模块未齐时破坏分支构建。

# 下一步建议

1. 本地执行 `npm run build`。
2. 重点验收权限、会计、费用账户和账套相关页签。
3. 继续优化模块内部页面，将普通页面控制在 300 行以内。
4. 推进申请、列表和审批页面使用同一份申请数据。
