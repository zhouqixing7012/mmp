# ERP Figma × 资产系统 UI 设计规范 V2.1

> 适用范围：资产系统桌面端业务页面、个人工作台、后台管理页面及其公共组件。
>
> 本规范由两层规则组成：
> 1. **ERP Design System 基础视觉规范**：来自 ERP Figma 设计语言与基础组件节点，负责颜色、字体、间距、圆角、阴影和基础组件视觉行为。
> 2. **资产系统业务页面规范**：负责页面结构、Card 分区、详情栅格、审批、办理、员工确认、字段命名和资产领域交互。
>
> V2.1 补充来源：ERP Figma `基础组件｜Library 修正版`（node `826:2`），新增吸收 Input、Radio、Checkbox、Switch、Breadcrumb、Dropdown、Pagination、Tag、Badge、Popover、Grid、Layout、Divider 等规则。设计系统中的其他业务示例只作为组件说明，不反向定义资产系统业务。
>
> 本规范升级设计与实现规则，**不代表现有页面已完成对应视觉改造**。后续页面新增或改造时按本规范执行。

---

## 1. 规范层级与优先级

实现页面时按以下优先级判断：

1. **明确业务规则与用户已确认口径**：审批节点、字段、按钮、是否可编辑、员工确认方式等业务规则优先级最高。
2. **本文件中的资产系统业务页面规则**：决定页面如何组织以及基础组件在具体业务场景中如何使用。
3. **ERP Figma Design System**：决定基础视觉 Token 和基础组件的视觉状态。
4. **Ant Design 默认能力**：当 ERP Figma 当前没有覆盖某个组件时，继续使用项目现有 Ant Design 规范，不自行创造新的“ERP 标准”。

### 1.1 组件能力不等于业务使用方式

ERP Design System 可以提供带图标按钮、Success Button、居中 Dialog、可删除 Tag、悬浮球等能力，但资产系统业务层仍可限制具体场景：

- 流程按钮仍统一纯文字，不因为基础 Button 支持图标就增加图标。
- “同意”等审批主操作仍按资产系统业务规则选择按钮类型，不因存在 Success Button 就自动改成绿色。
- 页面底部流程操作仍居中；Dialog Footer 则按 Dialog 规范处理，两者不可混淆。
- `Tag` 是通用标签组件，不替代资产系统统一业务状态出口 `StatusTag`。
- `Dropdown` 是操作菜单，不等同于表单选择器 `Select`。
- `Grid` 负责页面级布局，不替代资产系统详情字段的 `DetailGrid` 三列规则。
- `Affix`、`FloatButton` 等能力只在真实业务需要时使用，不因为设计系统存在组件就默认加入页面。

### 1.2 Figma 当前组件覆盖边界

当前已拆解的 ERP Figma 节点覆盖：

- Design Token：颜色、字体、间距、圆角、阴影、语义变量方向。
- 已确认基础组件：Button、Link、全局提示、Loading、Skeleton、Dialog、Input、Radio、Checkbox、Switch、Breadcrumb、Dropdown、Pagination、Tag、Badge、Popover、Grid、Layout、Divider、Anchor、Affix、FloatButton。

当前节点**仍未提供可作为 ERP 本地标准的完整 Select、Table、Form、DatePicker、Upload 规范**。因此：

- 不得凭经验补写这些未覆盖组件的 ERP 高度、圆角、边框或状态规范。
- 继续优先使用 Ant Design 6.x 和项目现有公共组件。
- `Dropdown ≠ Select`，不得因为已有下拉菜单规范就推断表单选择器规范已经完整。
- 后续取得对应 ERP Figma 组件节点后，再补充进本文件。

---

# 第一部分：ERP Design System

## 2. Design Token 总则

页面和公共组件应优先读取统一 Theme / Design Token，禁止在业务页面中反复硬编码视觉值。

不推荐：

```jsx
<div className="text-blue-500 border-gray-200 rounded-lg shadow-md" />
```

推荐思路：

```text
业务语义
  ↓
公共组件 / Ant Design Component Token
  ↓
ERP Semantic Token
  ↓
ERP 基础色板
```

业务页面只表达“这是主操作 / 危险状态 / 次要文字 / Card”，不自行决定具体色值、阴影和圆角。

### 2.1 语义 Token 优先于基础色号

Figma 新增亮色 / 暗色语义变量对照，说明设计系统正在从“直接使用 blue/gray 色号”转向“先表达用途，再由 Theme 映射实际色值”。

资产系统应优先建立和使用以下语义层：

| 类别 | 语义角色示例 |
|---|---|
| 背景 | 页面底色、Card/容器底色、输入区底色、覆盖层 |
| 文字 | 主文字、次要文字、第三级文字、占位符、禁用、品牌色、成功/警告/危险 |
| 图标 | 主图标、次要图标、品牌、成功/警告/危险、禁用 |
| 边框 | 分割线、容器描边、激活指示线 |

规则：

- 业务页面优先引用“主文字 / 次要文字 / 分割线 / 危险”等语义，不直接引用 `gray/7`、`red/6` 等基础色号。
- 亮色 / 暗色的具体映射由 Theme 负责，业务组件不维护两套颜色分支。
- Figma 语义变量表中出现的聊天、通讯录、消息气泡等场景仅是设计系统应用示例，**不得复制成资产系统业务规则**。
- `StatusTag`、Button、Input、Divider、Popover 等公共组件应逐步从统一语义 Token 取值。

---

## 3. 色彩 Color

### 3.1 主品牌色

ERP 核心主色：

| Token | 色值 | 典型用途 |
|---|---|---|
| Blue-1 | `#E5F1FF` | 蓝色弱背景、加强提示背景 |
| Blue-2 | `#C2DCFF` | 禁用、弱选中 |
| Blue-3 | `#96C0FF` | 禁用文字、弱交互 |
| Blue-4 | `#6AA1FF` | 辅助蓝 |
| Blue-6 | `#145CFF` | **ERP 主品牌色、Primary、标准 Link** |
| Blue-7 | `#0D42D2` | Active / Press |
| Blue-10 | `#17204D` | 最深蓝扩展 |

### 3.2 Figma 源文件存在差异的色值

当前 Figma 源文件在以下 Token 上存在“色板文字”和“实际组件绑定 Style”不一致：

- Blue-5：色板文字与实际组件 Style 不一致。
- Blue-9：色板文字与实际 Style 不一致。

处理原则：

- **业务页面不得硬编码 Blue-5、Blue-9。**
- 后续接入 Theme 时优先读取正式设计 Token / 组件绑定 Style。
- 在设计侧确认最终标准值前，不在项目文档中人为指定唯一值。

### 3.3 灰阶

| Token | 色值 | 资产系统典型用途 |
|---|---|---|
| Gray-1 | `#FFFFFF` | Card / Dialog / 内容背景 |
| Gray-2 | `#F2F5FA` | 页面弱背景、Skeleton 起始色 |
| Gray-3 | `#E2E6F0` | 次要按钮、Skeleton 结束色 |
| Gray-4 | `#D3D9E5` | Border / Divider |
| Gray-5 | `#C5CCDB` | Disabled Border |
| Gray-6 | `#848B99` | 弱辅助文字 |
| Gray-7 | `#545B66` | 次级文字 |
| Gray-8 | `#2C3038` | 较强文字 |
| Gray-9 | `#1D2126` | 主正文文字 |
| Gray-10 | `#000000` | 极强文字 |

### 3.4 语义色

资产系统状态和基础反馈优先使用 ERP 第 6 阶语义色：

| 语义 | Token | 色值 |
|---|---|---|
| Standard / Primary | Blue-6 | `#145CFF` |
| Success | Green-6 | `#14AE5C` |
| Warning | Orange-6 | `#F27D0C` |
| Error / Danger | Red-6 | `#EC221F` |

规则：

- 页面不得为同一业务状态自行声明不同颜色。
- `StatusTag` 继续作为资产系统统一状态出口，但底层颜色应逐步映射到 ERP Semantic Token。
- Purple、Cyan、Light Green、Magenta 等辅助色只用于非核心分类，不抢占成功、警示、危险等固定业务语义。

---

## 4. 字体 Typography

### 4.1 字体优先级

#### Mac

| 类型 | 首选 | 备选 |
|---|---|---|
| 中文 | PingFang SC | Hiragino Sans GB |
| 英文 / 数字 | San Francisco | Helvetica Neue |

#### Windows

| 类型 | 首选 | 备选 |
|---|---|---|
| 中文 | 微软雅黑 | 黑体 |
| 英文 / 数字 | Segoe UI | Arial |

页面不得单独指定与全局字体栈冲突的字体。

### 4.2 字号层级

| Token | 字号 | 行高 | Figma 定义用途 | 资产系统建议映射 |
|---|---:|---:|---|---|
| T0 | 10px | 14px | 最小辅助、标签、徽标 | Badge、极弱辅助 |
| T1 | 12px | 16px | 正文辅助、表格 | small Table、辅助信息 |
| T2 | 14px | 20px | 正文、最小标题 | 默认正文、详情字段、按钮文字 |
| T3 | 16px | 22px | 小标题、二级列表标题、Tab、突出按钮 | 局部小标题 |
| T4 | 18px | 24px | 模块容器标题 | 大模块标题，个人工作台紧凑 Card 不强制套用 |
| T5 | 20px | 28px | 全局标题栏 | 页面主标题 |
| T6 | 24px | 34px | 运营标题-小 | 非常规运营展示 |
| T7 | 28px | 40px | 运营标题-中 | 非常规运营展示 |
| T8 | 32px | 46px | 运营标题-大 | 非常规运营展示 |

### 4.3 资产系统字体使用规则

- 页面主标题优先对应 T5（20/28）。
- 普通正文、详情字段、按钮文字优先对应 T2（14/20）。
- 高密度 small Table 后续统一视觉时优先对应 T1（12/16）；在尚未统一 Theme 前不要在单页局部硬改字号。
- 个人工作台业务 Card 为高密度二级分区，继续采用项目统一紧凑标题，不因 Figma 的 T4 定义机械放大为 18px。
- 不使用超大字号装饰普通 B 端业务页面。

---

## 5. 间距 Spacing

Figma 全局布局梯度：

**4 / 8 / 16 / 24 / 32 / 40px**

适用于横向 H-spacing 与纵向 V-spacing。

资产系统建议：

| 场景 | 推荐间距 |
|---|---:|
| Icon 与文字 | 4px |
| 紧密操作 / 小组件内部 | 8px |
| 个人工作台 Card 间距 | 16px |
| 区块内较大分组 | 24px |
| 页面级大分区 | 32px |
| 超大留白 | 40px |

说明：

- Figma 基础组件内部仍存在 12px 等组件级间距，因此全局梯度不等于禁止其他组件内部尺寸。
- 页面底部流程按钮当前统一间距 12px，继续保留，不为了凑全局梯度机械改成 8px 或 16px。

---

## 6. 圆角 Radius

Figma 设计语言中已明确展示：

| Token | 数值 |
|---|---:|
| radius 0 | 2px |
| radius 1 | 4px |
| radius 2 | 6px |
| radius 3 | 8px |
| radius 5 | 10px |
| radius 6 | 16px |
| radius 7 | 20px |
| radius 8 | Full |

同时 Dialog 实际组件明确使用 **12px** 圆角。

### 6.1 已知缺口

- 当前圆角梯度节点没有展示 radius 4 的最终值。
- Dialog 的 12px 不在上述展示梯度中，说明实际体系可能同时存在“基础梯度”和“组件特定圆角”。

因此：

- 不得自行猜测 radius 4。
- Button 明确按 4px。
- Message 明确按 8px。
- Dialog 明确按 12px。
- 其他组件优先走 Ant Design / 公共组件 Token，未确认前不在业务页自行创建新圆角标准。

---

## 7. 阴影 Shadow

ERP Figma 将阴影按层级分为 S1～S4：

| 阴影 | 典型场景 |
|---|---|
| S1 | 顶导、侧导 |
| S2 | Card |
| S3 | Hover、点击、悬浮状态 |
| S4 | Dialog、Popover 等高层浮层组件 |

阴影采用多层叠加以模拟物理层级，不建议业务页面自行写单层 `box-shadow`。

### 7.1 S4 明确示例

```css
box-shadow:
  0 1px 8px rgba(0, 0, 0, 0.05),
  0 7px 14px 2px rgba(0, 0, 0, 0.07),
  0 8px 16px 4px rgba(0, 0, 0, 0.08);
```

### 7.2 资产系统使用规则

- 单层个人工作台画布规则继续保留，禁止再套大面积白色外壳和页面级重阴影。
- Figma 的 S2 表示 Card 可以拥有层级阴影，并不代表个人工作台每个紧凑业务 Card 都必须加重阴影。
- 高密度业务 Card 优先保持轻边框 / 弱层级；Dialog、Popover、Dropdown 等浮层必须明显高于 Card。
- 阴影统一在 Theme 或公共组件层实现，业务页面不得各自声明一套阴影。

---

# 第二部分：ERP 基础组件

## 8. Button 按钮

### 8.1 尺寸

| Size | 高度 |
|---|---:|
| Mini | 24px |
| Small | 28px |
| Medium | 32px |
| Large | 36px |

标准业务按钮：

- 默认高度：32px
- 最小宽度：72px
- 圆角：4px
- 字体：T2 14/20

### 8.2 类型

Figma 提供：

- Primary
- Secondary
- Primary Outline
- Secondary Outline
- Text
- Icon Button

### 8.3 状态

按钮至少支持：

- Default
- Hover
- Active / Press
- Disabled
- Loading

核心状态：

- Default：Blue-6 `#145CFF`
- Active / Press：Blue-7 `#0D42D2`
- Disabled：Blue-2 / 弱灰阶
- Hover：读取正式 Blue-5 Token，当前不在业务页硬编码

### 8.4 语义按钮

基础组件提供 Standard / Success / Warning / Danger 四类能力，但资产系统业务层决定是否使用。

资产系统流程按钮继续执行：

- 主操作：`type="primary"`
- 驳回、删除等危险操作：`danger`
- 返回、取消：默认按钮
- 提交、同意、驳回、确认、取消、返回、加签、转签等**业务流程按钮不带图标**
- 搜索、选择、添加、上传、下载、删除、刷新等工具按钮可以使用含义明确的图标

---

## 9. Link 链接

Figma Link 支持：

- 纯文字链接
- Icon + Link
- Link + 下拉 Icon

状态：Default / Hover / Pressed / Disabled / Loading。

语义：Standard / Success / Warning / Danger。

尺寸可对应 12px、14px、16px 文本层级。

资产系统规则：

- “查看维修记录”“查看员工名下资产”“查看明细”等字段级入口使用小尺寸 Link。
- 在 `DetailItem` / `Descriptions.Item` 内优先使用 `Button type="link" size="small" className="px-0"` 或项目统一 Link 封装。
- 不将字段级“查看”操作无理由移动到 Card 右上角。

---

## 10. 全局提示 Message

定义：由用户操作触发的轻量级全局反馈。

标准视觉：

- 字体：T2 14/20
- Icon：16px
- Icon 与文字间距：4px
- 水平 Padding：16px
- 垂直 Padding：12px
- 圆角：8px
- 距页面顶部：40px
- 多条提示间距：20px

视觉等级：

1. **默认样式**：白色背景 + Gray Border。
2. **加强样式**：语义浅色背景 + 对应语义色 Border。

资产系统继续优先使用 Ant Design `message` / 项目统一反馈封装，不在页面中自制 Toast。

所有用户操作必须有明确反馈：

```text
点击操作 → loading → 成功 / 失败提示 → 数据更新
```

---

## 11. Loading

Loading 用于组件、局部区块等待异步数据或渲染。

尺寸：

| Size | px |
|---|---:|
| Small | 12 |
| Default | 16 |
| Large | 20 |
| Custom | 按明确场景自定义 |

样式可分：

- 强化加载
- 普通加载
- 反白加载

布局可分：

- 无文字：仅 Spinner
- 左右布局：Spinner + “加载中...”
- 上下布局：Spinner 在上、文字在下

### 11.1 区块 Loading

局部容器加载优先保留原内容结构，并使用：

```text
原内容
  ↓
半透明白色遮罩 rgba(255,255,255,0.6)
  ↓
轻度 backdrop blur
  ↓
中央 Spinner / Spinner + 文案
```

避免因每次请求都把区块替换为空白而产生明显跳动。

---

## 12. Skeleton 骨架屏

Skeleton 只用于**内容形态可预估的首次加载**。

核心规则：

- 只在第一次加载数据时优先使用 Skeleton。
- 已有内容后的刷新、提交或局部重载优先使用 Loading Overlay，而不是反复切回 Skeleton。
- 图片 → Rectangle
- Avatar → Circle
- 文本 → Long Bar
- 渐变：Gray-2 `#F2F5FA` → Gray-3 `#E2E6F0`

业务页面不得另建一套 `#f0f0f0 → #e0e0e0` 等自定义 Skeleton 灰阶。

---

## 13. Dialog / Modal

Dialog 是在当前页面打开的浮层，用于承载相关操作。

### 13.1 构成

```text
标题区
内容区
按钮区
```

标准：

- 内边距：24px
- Border：Gray-4
- 圆角：12px
- 阴影：S4
- Close Icon：16px，外层可点击区域约 24px
- Dialog 内只保留一个主标题，不重复放蓝色二级标题

### 13.2 宽度

Figma 当前存在以下源文件差异：

- 基础规则：Small 400 / Medium 560 / Large 720px
- 实际大号示例：700px

因此当前项目记录为：

- Small：400px
- Medium：560px
- Large：700～720px，待设计侧确认

在确认前，不为“统一”而批量硬改已有 Modal 宽度。

### 13.3 Footer 布局

Figma 提供：

1. **对角线布局（优选）**：标题左、操作区右；Footer 按钮右对齐。
2. 居中线布局：标题、内容和 Footer 居中。

资产系统 V2 规则调整为：

- 普通 ERP Dialog 默认使用 Figma 优选的**右对齐 Footer**。
- 确认型、强调型、业务明确要求中心聚焦的弹窗可以使用居中 Footer。
- 多选弹窗若需要展示“已选择 X 项”，可左侧显示选择数量、右侧显示操作按钮。
- **页面底部流程操作仍统一居中**，不要因为 Modal Footer 右对齐而修改审批页、办理页等页面级按钮布局。

---

## 13A. Input 输入框

### 13A.1 已确认类型

Figma 已覆盖：

- 单行输入框
- Textarea
- 前后置内容输入框
- 组合输入框
- IP 地址输入框
- 搜索框
- 可清空输入框
- 密码输入框

资产系统仍优先使用 Ant Design `Input` / `Input.TextArea` / 公共封装，不在业务页手写边框、状态和图标。

### 13A.2 状态

输入框至少包含：

- Normal
- Hover
- Click / Focused
- Disabled
- Error
- Success

规则：

- 校验反馈优先通过 Ant Design Form / Input 状态统一输出，不在单页自己实现红绿边框。
- 只读业务字段直接展示文本或状态，不用 readOnly/disabled 输入框模拟只读。
- 项目现有“点击只读输入框打开 SelectModal”的选择型输入场景继续按公共交互规则实现，它属于业务选择入口，不代表普通只读字段也要画成 Input。

### 13A.3 尺寸

| Size | 高度 |
|---|---:|
| Small | 28px |
| Medium | 32px |
| Large | 36px |

规则：

- 默认高度：32px。
- 同一业务场景内 Input / Select 等表单控件高度保持一致。
- 宽度由内容区和表单栅格决定，不为了“看起来完整”统一拉满无关字段。
- 具体圆角、边框色等仍通过 Theme / Ant Design Component Token 落地，不在业务页重复硬编码。

---

## 13B. Radio / Checkbox / Switch

### 13B.1 Radio

Figma 已覆盖基础型与按钮型 Radio。

状态：Normal / Hover / Selected / Disabled，并区分未选中、已选中及禁用态。

按钮型尺寸：

| Size | 高度 |
|---|---:|
| Small | 24px |
| Medium | 32px |
| Large | 36px |

资产系统优先使用 Ant Design `Radio` / `Radio.Group` / `Radio.Button`。

### 13B.2 Checkbox

Figma 已覆盖：

- 未选中
- 已选中
- 部分选中（Indeterminate）
- 各自禁用态
- 基础型 / 按钮型
- Normal / Hover / Selected / Disabled

资产系统优先使用 Ant Design `Checkbox` / `Checkbox.Group`，批量选择、表头“选中当页 / 选中全部”等场景必须保留真实选择语义，不用 Tag 或 Button 模拟复选。

### 13B.3 Switch

Figma 已覆盖 Normal / Disabled 基础状态。

资产系统规则：

- Switch 只用于“立即切换并能明确理解开/关结果”的布尔配置。
- 需要填写表单后统一提交、危险确认或存在复杂审批含义的动作，不用 Switch 代替正式按钮或表单字段。
- 统一使用 Ant Design `Switch`，颜色和尺寸走 Theme，不在页面自制开关。

---

## 13C. Breadcrumb 面包屑

Figma 定义面包屑用于识别当前页面在层级结构中的位置，并支持向上返回。

能力包括：

- 自定义分隔符
- 自定义图标
- 带下拉菜单
- 层级过多时省略
- 长文案截断

尺寸：12px / 14px；**页面级导航优先 14px**。

资产系统规则：

- 多层内部页面优先使用 Ant Design `Breadcrumb`，保持当前项目已有动态面包屑能力。
- 上级层级可点击返回，当前页不做可点击链接。
- Figma 示例以 8 个中文字符作为长文案截断参考；实际实现优先使用稳定的单行省略，不让超长页面名撑坏布局。
- 面包屑是导航，不替代页面底部“返回”操作；流程页仍按业务保留底部返回按钮。

---

## 13D. Dropdown 下拉菜单

Figma 已覆盖：

- 文字型下拉菜单
- 按钮型下拉菜单
- 带图标下拉菜单
- 多级菜单
- Normal / Hover / Click / Disabled / Selected
- 小 / 中 / 大尺寸

资产系统规则：

- Dropdown 用于一组“操作命令”的展开选择，例如更多操作、批量动作等。
- **Dropdown 不等于 Select**：字段取值仍使用 Ant Design `Select` 或项目统一选择弹窗，不能用 Dropdown 替代表单控件。
- 菜单项只保留当前上下文可执行动作；危险动作继续走二次确认。
- 多级菜单只有真实存在层级关系时才使用，不为收纳按钮机械增加层级。

---

## 13E. Pagination 分页器

Figma 已覆盖：

- 基础分页
- 显示数据总量
- 页面展示数量选择
- 快速跳转
- 简易分页器
- Normal / Hover / Selected / Disabled

尺寸：

| Size | 高度 |
|---|---:|
| Medium | 24px |
| Large | 32px |

规则：

- 列表页继续使用 Ant Design Pagination / Table Pagination，不自行重画。
- 业务列表默认保持紧凑密度，优先映射 Figma Medium 24px；若现有 Theme 尚未统一，不在单页用 CSS 强制改尺寸。
- “共 X 条”继续按资产系统规则放在列表右上角；Pagination 是否同时显示 total 由页面信息密度决定，不重复堆两份相同总数。
- pageSize、快速跳转只在用户确实需要跨大量数据浏览时提供，不因为组件支持就全部开启。

---

## 13F. Tag / Badge

### 13F.1 Tag

Figma Tag 覆盖：

- 基础标签
- 可删除标签
- 可选中标签
- 主题标签
- 带边框标签
- 动态编辑标签
- primary / success / danger / info / warning
- Normal / Hover / Click / Disabled

高度：16 / 20 / 24 / 32px。

规则：

- 标签宽度随文案自适应；超长文案设置最大宽度并省略，不允许无限撑开布局。
- `Tag` 用于分类、筛选条件、可删除关键词等普通标签语义。
- **流程状态、资产状态、审批状态仍统一使用 `StatusTag`**；不得因为 ERP 有 Tag 就把业务状态改回页面手写 Tag。

### 13F.2 Badge

Badge 用于数量、未读、提醒等紧凑提示。

资产系统规则：

- 适用于工作台待办数、消息数量等真正的计数提醒。
- Badge 只表达附属提醒，不替代页面主状态和业务结果。
- 颜色走统一语义 Token；页面不单独维护红点 / 灰点色值。

---

## 13G. Popover 气泡卡片

Figma 已覆盖：

- 纯文字气泡
- 操作型气泡
- 带图标气泡
- 顶 / 底 / 左 / 右方向

尺寸：

- 最小宽度：160px。
- 最大宽度不强制固定，设计建议不超过 360px。

资产系统规则：

- 纯文字 Popover 适合字段解释、名称补充等轻量信息。
- 操作型 Popover 适合低干扰的轻确认或小操作。
- 删除、报废、停用等高风险动作仍优先使用 `Popconfirm` / Dialog，不因 Popover 可放按钮就降低确认强度。
- Popover 属于高于 Card 的浮层，阴影和层级统一走 Theme。

---

## 13H. Grid / Layout

### 13H.1 Grid

Figma 支持 12 栅格和 24 栅格，默认 12 栅格；响应断点：

**768 / 992 / 1200 / 1920**。

资产系统规则：

- ERP Grid 负责页面级区块、查询区、响应式列宽等整体布局。
- 资产系统 `DetailGrid` 负责详情字段稳定三列对齐，两者职责不同，**不得用 12 栅格推翻详情三列业务规则**。
- 后台查询区现有三列 Grid 继续保持稳定对齐；若后续做响应式改造，再映射 ERP 断点，不在单页各自定义断点。

### 13H.2 Layout

Figma 常见布局示例包含 Header、Aside、Main、Footer，其中展示过 Header 60px、Aside 200px、Footer 80px 的组合，并支持自定义宽高。

资产系统规则：

- 这些值视为设计系统常见版型示例，**不作为资产系统现有应用壳层的强制改造值**。
- 主框架尺寸统一由项目 Layout / Theme 管理，业务页面不得自行定义另一套 Header / Aside 宽高。
- Main 区域优先自动填充剩余空间。

---

## 13I. Divider 分割线

Figma 对 Divider 的核心定义：**只用于内容分组与层级区隔，不承载操作含义；优先通过留白建立层级，仅在需要明确边界时使用。**

基础规则：

| 项目 | 规则 |
|---|---|
| 颜色 | Gray-4 |
| 粗细 | 1px |
| 方向 | 水平 / 垂直 |
| 推荐间距 | spacing 8～24px |
| 竖向 Divider | 默认高度约 12px，两侧各 spacing/8 |

资产系统规则：

- 页面分组优先顺序：**留白 → 分组结构 → 必要的 Divider → 新增容器**。
- 不为每个字段组都增加边框 / Divider，避免 Card 套 Card、边框套边框。
- 水平 Divider 用于同层级纵向内容区隔；竖向 Divider 只用于同一行并列信息或操作项。
- Divider 不可当作可点击控件、步骤状态或权限边界。

---

## 13J. Anchor / Affix / FloatButton

这些组件已经出现在 ERP Library，但资产系统只按真实业务场景使用：

- **Anchor**：适用于很长的单页内容，需要快速跳转到稳定分区时使用；普通审批 / 办理页不默认增加。
- **Affix**：适用于确实需要滚动时持续可见的操作或导航；不得与页面底部固定流程操作形成两套重复入口。
- **FloatButton**：当前资产系统不作为默认交互模式；只有明确存在跨页面高频快捷动作时再使用。

---

# 第三部分：资产系统业务页面规范

## 14. 页面画布与区块

### 14.1 个人工作台

- 页面嵌入个人工作台后只保留一层画布，不重复增加独立背景、圆角大容器或页面级外层阴影。
- 页面内容区块优先使用 Ant Design `Card`，统一 `size="small"`。
- 相邻 Card 默认间距 16px，使用 `Space direction="vertical" size={16}` 或等价布局。
- 页面顶部统一展示页面标题；有业务单号时放在右上角，使用次要文字样式。
- 不使用自定义 `section` 模拟 Card 标题栏、边框和内边距。

### 14.2 后台管理页面

- 继续优先复用项目现有布局、QueryBar、Table、Drawer / Modal 结构。
- 不为追求“ERP 化”给后台页面增加无意义渐变、大面积阴影、玻璃拟态或运营化视觉。
- B 端信息密度、可扫描性和字段可操作性优先于装饰。

---

## 15. DetailGrid 与详情字段布局

### 15.1 统一三列

个人工作台中需要多个 Card 严格保持三列字段边界一致时：

- 统一使用公共 `DetailGrid` + `DetailItem`。
- 不要分别使用多个 `Descriptions` 依赖浏览器自动计算列宽。
- `DetailGrid` 默认三列，每组由“96px 标签列 + 等分内容列”组成。
- 不同 Card 使用同一默认配置，保证第一、第二、第三列起始位置一致。
- `DetailGrid` 的边框、背景、文字读取 Ant Design / ERP Theme Token，页面不得重复硬编码。

### 15.2 何时仍可使用 Descriptions

单独存在、结构简单、且不要求与其他 Card 像素级对齐的详情区域，可以继续使用：

```jsx
<Descriptions bordered size="small" column={3} />
```

不得再把 `Descriptions` 写成个人工作台多 Card 详情的默认方案。

### 15.3 长文本

申请原因、退库原因、备注、配置、详细说明、长使用说明等字段：

- 默认 `DetailItem span={3}` 单独一行。
- 仅当内容和业务结构明确适合两列时才使用 `span={2}`。
- 不为了视觉填满一行擅自改变长文本宽度。

### 15.4 删除字段后的自然补位

删除详情字段后：

- **禁止为了填满一行机械拉宽相邻字段。**
- 先判断下一行字段语义与长度。
- 普通短字段（状态、日期、仓库、责任人、数量、资产标记等）可以自然上移补位。
- 长文本 / 原因 / 说明 / 备注 / 配置等继续保持独立整行，必要时允许上一行留空。
- 原则：**自然补位优先，不强行拉宽。**

### 15.5 真正的空位

需要保留空列时：

- 使用真实网格空结构。
- 不使用 `\u00a0`、空格字符、空标签文字等可见文本占位。
- 不依赖 Ant Design `Descriptions` 的空 Item 去“骗”自动布局；需要严格留空时使用 `DetailGrid` 显式网格。

### 15.6 空值与滚动

- 空值统一展示 `-`，不混用“无”“暂无”“空”。
- 正常详情 Card 默认不得出现独立横向滚动条。
- `DetailGrid` 只有在明确设置 `minWidth` 且确实无法保持可读性时才开启横向滚动。
- 页面空间不足时优先保持三列结构稳定，不在单字段上临时改列宽。

---

## 16. 申请人信息标准顺序

默认顺序：

1. 申请人
2. 申请日期
3. 公司
4. 办公区
5. 联系电话
6. 邮箱
7. 部门（通常 `span={3}`）
8. 业务原因或说明（存在时 `span={3}`）

页面可根据业务删减字段，但不要改变同名字段含义。

---

## 17. 日期和组织字段

- 仅展示年月日时，统一使用“申请日期”“退库日期”“归还日期”等“日期”命名。
- 展示到时分秒时才使用“申请时间”“审批时间”“确认时间”等“时间”命名。
- 日期展示统一为 `YYYY-MM-DD`，使用 `formatDateText`。
- 部门组织层级统一使用 `.` 连接，使用 `formatDepartment`；不得直接展示原始 `/` 分隔值。

---

## 18. 业务对象命名

- 页面只涉及固定资产时统一使用“资产”：资产信息、资产明细、添加资产、选择资产、待发放资产。
- 页面同时包含资产和耗材时才使用“物资”：物资信息、物资明细。
- “借用”是业务场景，不是资产用途；资产用途使用员工用机、部门公用、其他用途、专业用途等真实枚举。
- 同一业务对象在标题、字段、空状态、提示文案和弹窗中必须使用同一名称。

---

## 19. Card 标题与关联入口

- Card 标题使用业务区块名称，不在 Card 内再放大号重复标题。
- 个人工作台申请、审批、配给和办理页的主要业务 Card 标题前统一增加紧凑的蓝色竖向标识块。
- 蓝色分组标识只用于页面主要业务 Card 标题，不用于弹窗标题、表格列头和页面主标题。
- 不将 Card 标题机械升级为 Figma T4 18px；个人工作台业务 Card 保持统一紧凑层级。
- 数量、总计、上传等 Card 级操作放在 `extra`。
- 维修记录、查看名下资产等与某字段相关的入口放在对应 `DetailItem` / `Descriptions.Item` 中。
- 详情关联入口统一使用小尺寸文字 Link。

---

## 20. 表格 Table

当前 ERP Figma 节点未提供完整本地 Table 组件规范，因此现阶段：

- 继续使用 Ant Design Table。
- 业务表格默认 `size="small"`、`bordered`。
- 只展示当前操作所需核心字段。
- 禁止通过 `scroll={{ x: 2000 }}` 等方式一次性暴力展示全部字段。
- 非核心字段放入详情区、Drawer 或 Modal。
- 列表必须具备 loading、空状态、查询无结果、查询、重置、分页等完整状态。
- Figma Typography 将表格归入 T1 12/16；后续全局 Theme 统一时再整体收敛，禁止单页先行硬改造成视觉不一致。
- Pagination 已有 ERP 基础规范，但仍通过 Ant Design Table / Pagination 公共能力统一落地，不在 Table 页面单独重画。

---

## 21. 查询区

- 查询区域统一复用 `QueryBar` + `QueryItem`。
- 查询字段顺序按主要检索路径组织，不为了填满一行随意改变字段宽度。
- 查询、重置必须真实生效。
- 搜索、刷新等属于工具操作，可以使用含义明确的图标。
- 查询区输入类控件默认按 32px 中尺寸保持统一；已有公共组件未统一 Theme 前，不在单页用 CSS 强制改高。

---

## 22. 页面级按钮与操作区

### 22.1 流程按钮

- 提交、同意、驳回、确认、取消、返回、加签、转签等流程按钮统一纯文字，不带图标。
- 主操作：Primary。
- 驳回、删除等危险操作：Danger。
- 返回、取消：Default。
- 页面底部流程操作统一居中，按钮间距 12px。

### 22.2 工具按钮

搜索、选择、添加、上传、下载、删除、刷新等工具操作可以使用图标，但必须与操作语义一致。

### 22.3 危险操作

删除、报废、停用等危险操作必须二次确认，优先使用 `Popconfirm` 或明确确认 Dialog。

---

## 23. 审批页面

审批页默认结构顺序：

```text
申请人 / 业务信息
→ 资产或物资信息
→ 审批信息 / 流程记录
→ 审批意见
→ 审批操作
```

审批记录标准列：

- 审批环节
- 申请人 / 审批人
- 审批状态
- 审批时间
- 审批意见

规则：

- 只有业务真实支持代理审批且存在代理数据时才展示“代理人”。
- 禁止固定展示一列全为 `-` 的代理人。
- 同意时审批意见可选；驳回、鉴定不通过时审批意见必填。
- 不同审批页面的操作集合以真实业务为准，不因为页面相似就混用按钮，例如“退库审批”与“领导退库审批”的加签能力必须分别按业务定义。

---

## 24. 状态标签 StatusTag

- 所有状态统一使用 `StatusTag`。
- 页面不得自行维护状态颜色映射或直接写 `Tag color`。
- 通用业务状态使用 `type="business"`。
- 是 / 否、启用 / 停用、停产状态继续使用现有 `yesNo`、`enabled`、`stop` 类型。
- 同一状态在所有页面必须保持相同颜色。
- `StatusTag` 底层色值后续应映射到 ERP Semantic Token，不改变页面业务状态定义。
- ERP `Tag` 只补充通用标签能力，不改变本条状态规则。

---

## 25. 员工确认方式

本次资产系统重构全面取消电子签确认。

所有员工确认页面均不得提供：

- 电子签 Tab
- 签名区域
- 签名按钮
- 电子签确认方式
- 电子签数据字段

适用范围包括：

- 员工资产领用
- 资产借用
- 资产更换
- 资产退库
- 耗材领用
- 合约号码领取
- 合约号码退库

统一只保留两类确认入口：

1. 刷卡或由管理员录入员工工号确认。
2. 狐小 e 扫码确认。

校验规则：

- 管理员录入工号按刷卡确认处理，必须校验录入工号与业务申请人工号一致。
- 管理员完成扫码按员工扫码确认处理，必须作用于当前真实待确认节点。
- 不得因为旧 PRD、旧 Mock 或历史页面仍存在电子签字段而恢复电子签能力。

---

## 26. 空状态

- 正常业务页面底部按钮名称统一为“返回”。
- 无待办、无数据等空状态中的返回按钮统一为“返回工作台”。
- 空状态文案必须说明缺少的业务对象，例如“暂无待审批的资产借用申请”。
- 空状态不为了填充页面增加无意义大插画或运营化装饰。

---

## 27. Modal / Drawer 业务规则

在 ERP Dialog 基础规范之上，资产系统补充：

- 弹窗只保留一个主标题，不增加重复蓝色条或二级标题。
- 资产选择弹窗统一命名为“选择资产”。
- 添加目录弹窗统一命名为“添加资产”。
- 搜索区域统一复用 `QueryBar` 和 `QueryItem`。
- 普通 Dialog Footer 默认右对齐；有明确居中交互目的时才居中。
- 多选弹窗可以左侧展示已选择数量，操作按钮在右侧。
- Drawer / Modal 超过约 80 行实现时优先拆分为独立组件，避免页面文件失控。

---

## 28. 加载、提交与交互反馈

所有用户操作必须有反馈：

1. 点击操作 → loading → 成功 / 失败提示 → 数据更新。
2. 表单支持必填校验、编辑回填、提交 loading、关闭后重置、防重复提交。
3. Loading 期间按钮应禁用或进入 loading，防止重复产生业务记录。
4. 首次可预估内容加载优先 Skeleton；已有内容后的刷新优先 Loading Overlay。
5. 不使用 `setTimeout` 伪造业务状态，除非明确仅用于演示 Loading。

---

## 29. B 端视觉原则

ERP 品牌方向强调统一、高效、简洁、专业、易用。资产系统落实为：

- 信息层级清晰优先于装饰。
- 字段对齐、状态一致、操作可预期优先于“填满页面”。
- 页面分组优先使用留白，Divider 只在需要明确边界时出现。
- 不使用无意义动画、过度渐变、玻璃拟态、大面积彩色背景。
- 不为了视觉丰满擅自增加业务字段、说明 Card、统计数字或按钮。
- 设计系统的目标是减少页面自行决定视觉值，而不是让页面变得更花哨。

---

# 第四部分：工程落地约束

## 30. Theme / Token 落地原则

后续进行视觉改造时，优先从全局 Theme / 公共组件层落地：

```js
// 仅表示映射方向，实际代码改造需单独任务实施
{
  colorPrimary: '#145CFF',
  colorSuccess: '#14AE5C',
  colorWarning: '#F27D0C',
  colorError: '#EC221F',
  colorText: '#1D2126',
  colorTextSecondary: '#545B66',
  colorTextTertiary: '#848B99',
  colorBorder: '#D3D9E5',
  colorBgLayout: '#F2F5FA',
  colorBgContainer: '#FFFFFF'
}
```

注意：

- 上述代码仅记录已确认 Token 的映射方向，**本次文档升级不修改现有 Theme 代码**。
- Blue-5、Blue-9、radius 4、Dialog Large 最终值等 Figma 存在差异的项不得在代码中自行拍板。
- 语义变量优先在 Theme / 公共组件建立 light / dark 映射，业务页面不维护主题分支。
- Input、Pagination、Breadcrumb、Tag、Divider 等新增确认组件的视觉收敛优先从 Ant Design Component Token / 公共组件层处理。
- 优先修改 Theme / 公共组件，而不是全仓库逐页硬编码视觉值。

---

## 31. 新页面 / 页面改造检查清单

提交新页面或进行 UI 改造前逐项确认：

### Design System

- [ ] 主色、语义色、灰阶没有在业务页重复硬编码
- [ ] 页面优先表达主文字 / 次文字 / 分割线 / 危险等语义，不直接依赖基础色号
- [ ] 页面字号符合 T0～T5 的业务层级，普通 B 端页面没有滥用运营大字号
- [ ] 页面间距优先使用 ERP 全局梯度，组件内部特殊间距有明确依据
- [ ] Button / Link / Message / Loading / Skeleton / Dialog / Input / Radio / Checkbox / Switch / Breadcrumb / Dropdown / Pagination / Tag / Badge / Popover 优先复用 AntD 或公共组件，不自行重画
- [ ] Input 同一业务场景高度一致，默认按 32px 中尺寸映射；Error / Success 等状态由 Form / Theme 统一输出
- [ ] Dialog 使用 12px 圆角和高层浮层逻辑；普通 Footer 默认右对齐
- [ ] Dropdown 没有被当成 Select；Tag 没有替代业务 `StatusTag`
- [ ] ERP Grid 只负责页面级布局，没有推翻 `DetailGrid` 三列字段规则
- [ ] 页面优先用留白分组，Divider 只在确实需要边界时使用
- [ ] 未为 Figma 暂未覆盖的 Select / Table / Form / DatePicker / Upload 擅自创造“ERP 标准”

### 页面结构

- [ ] 个人工作台使用单层画布
- [ ] 业务区块使用小尺寸 Card
- [ ] 主要业务 Card 标题使用统一紧凑蓝色竖向分组标识
- [ ] 多 Card 详情严格对齐时使用 `DetailGrid` 三列栅格
- [ ] 简单独立详情才使用 `Descriptions`
- [ ] 长文本、原因、备注、配置保持整行
- [ ] 删除字段后没有机械拉宽其他字段，补位 / 留空符合字段语义和长度
- [ ] 需要留空时使用真实网格结构，不使用空格字符占位
- [ ] 正常详情 Card 没有无必要的横向滚动条
- [ ] 多层内部页面的 Breadcrumb 层级与当前页面真实层级一致，上级可返回、当前页不可点击

### 业务一致性

- [ ] 申请日期、审批时间等“日期 / 时间”命名正确
- [ ] 部门使用 `.` 分隔并经 `formatDepartment` 处理
- [ ] 空值统一为 `-`
- [ ] 资产与物资命名符合业务对象范围
- [ ] 流程按钮无图标，工具按钮图标含义明确
- [ ] 页面底部流程按钮居中，未误套 Dialog Footer 规则
- [ ] 审批记录没有无意义代理人列
- [ ] 状态统一使用 `StatusTag`
- [ ] 员工确认页面完全没有电子签入口、签名区域和电子签字段
- [ ] 弹窗没有重复标题
- [ ] 普通 Dialog Footer 默认右对齐；业务明确要求时才居中
- [ ] 空状态返回按钮为“返回工作台”
- [ ] Switch 只用于明确的即时布尔切换，没有替代需提交 / 审批 / 危险确认的业务动作

### 交互完整性

- [ ] 查询、重置真实生效
- [ ] 列表存在 loading、空状态、查询无结果、分页
- [ ] Pagination 的 total / pageSize / 快速跳转按实际浏览需求配置，没有机械全部开启
- [ ] 表单有必填校验、提交 loading、防重复提交
- [ ] 危险操作有二次确认
- [ ] 所有主要按钮都有真实行为和反馈
- [ ] 首次加载与二次刷新正确区分 Skeleton / Loading

---

## 32. 当前已知待设计侧确认项

以下内容在当前 Figma 源文件中存在差异或缺口，后续取得正式设计 Token / 对应节点后再更新：

1. Blue-5 最终标准值。
2. Blue-9 最终标准值。
3. radius 4 的最终值。
4. Dialog Large 应为 700px 还是 720px。
5. Select、Table、Form、DatePicker、Upload 的 ERP 本地完整组件规范。

在确认前：**不猜测、不静默补齐、不以单页实现反向定义全局规范。**