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
