# 当前状态
yewurules.js 完成费用账户规则和成本中心与科目映射页签改造：

- 费用账户规则(ExpenseAccountRuleView)：查询条件新增"是否启用"下拉框，
  操作栏去掉删除按钮，是否启用改为单选按钮，全部输入字段改为弹窗选择，
  新增 mock 参考数据(mockCostCenters/mockPlates等8组)
- 成本中心与科目映射(CostCenterSubjectMappingView)：精简为成本中心/大类/公司/科目/
  是否启用 5个字段，全部字段弹窗选择，是否启用单选按钮

SelectModal 组件新增 multiple 属性支持多选。

# 上次停的位置
成本中心页面bug修复完成（闭合标签+重复Search图标），提交代码变更。

# 关键决定（新增）
- 费用账户规则弹窗字段使用 SelectModal 弹窗选择，referenced by 11个弹窗组件
- 成本中心表格列用 "编码.描述" 格式显示（onConfirm 存 record.code + '.' + record.desc）
- Python 脚本写文件需用 [System.IO.File]::WriteAllText 保证 UTF-8 编码
- apply_patch 只匹配 context（空格前缀）时不会修改文件，需用 -/+ 前缀做实际变更
