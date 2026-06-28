# Lessons Learned

## 2026-06-25 yewurules.js 物料维度组合弹窗改造

### 字段布局
- 核心字段：维度组合编码+描述(自动) / 物料总类+大类小类 / 品牌规格+配置 / 单位+参考价格
- 业务规则字段改为数组驱动渲染：定义 fields 数组（label/visible/content），filter 可见字段后每2个一行渲染
- 排序：正式员工可申请 → 条件字段(资产/耗材) → 是否需要盘点 → 是否允许退库
- 条件字段用条件拼接而非 visible，保证顺序正确

### 字段显隐规则
- 退库MIS鉴定、允许更换/转移 → 仅资产
- MIS审核、关联主资产、主资产小类 → 仅耗材/低值
- 正式员工可申请选"临时可申请" → 隐藏实习生可申请，显示生效时间(RangePicker)/可申请部门/可申请员工

### 技术要点
- 生效时间用 DatePicker.RangePicker + dayjs
- 可申请部门/员工绑定 onClick 弹出 SelectModal
- 表格列用 fixed:'left'/'right' 冻结，scroll x 设固定值
- 每次变更必须 git push 并告知版本号

## 2026-06-28 业务映射规则+费用账户+成本中心页面改造

### 费用账户规则页面
- 查询条件新增"是否启用"下拉框，操作栏去掉删除按钮
- 弹窗"是否启用"由下拉框改为单选按钮
- 全部输入字段改为弹窗选择样式(readOnly + Search图标 + onClick)
- 缺失Search图标的字段(成本中心/科目/子目/业务线/项目)需自动补齐
- 新增11个SelectModal弹窗组件

### 成本中心与科目映射页面
- 精简弹窗字段，保留成本中心/大类/公司/科目/是否启用5个
- 表格列使用"编码.描述"格式显示(onConfirm存record.code + "." + record.desc)
- 弹窗字段用SelectModal弹窗选择

### SelectModal多选
- SelectModal新增multiple属性，多选模式下用复选框替代单选按钮
- onConfirm返回选中记录数组

### 技术坑
- Python脚本写UTF-8文件: 用[System.IO.File]::WriteAllText而非Out-File
- apply_patch: 所有行都用空格前缀时为纯上下文匹配(不会修改文件)，需用-/+
- 多行replace匹配first occurrence，容易改错组件，推荐行号或unique marker定位
- 行号偏移问题: insert操作后field_lines字典需重新计算
- PowerShell @''@ heredoc中文管道会乱码，须避免pipe直接写文件
