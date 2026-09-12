# 资产系统 B 端动效规范

> 适用范围：资产系统桌面端业务页面、个人工作台、后台管理页面及公共组件。
>
> 目标：让页面状态变化更自然、更容易理解，不做装饰性动画，不牺牲操作效率。

## 1. 核心原则

1. 动效只解释状态变化：打开、关闭、切换、展开、收起、新增、修改、悬浮、按压。
2. 高频 B 端操作必须短、轻、克制，不做明显弹跳、长距离飞入、连续摇晃。
3. 优先在公共入口实现，业务页面不得各自发明时长、缓动和动画方向。
4. 普通信息 Card、查询 Card、详情 Card、表格 Card 默认不做上浮；只有明确可点击的卡片/操作块才有 hover/press。
5. 所有动效必须兼容 `prefers-reduced-motion`，用户关闭系统动画时不得强制播放明显位移动效。
6. 当前项目优先使用 React + CSS + Ant Design / React Router 自带能力，不为简单过渡新增动画依赖。

## 2. 统一时长

全局定义在 `src/index.css`：

| Token | 时长 | 使用场景 |
|---|---:|---|
| `--mmp-motion-instant` | 100ms | 按压、极高频 hover |
| `--mmp-motion-fast` | 140ms | 遮罩、菜单、下拉、退出 |
| `--mmp-motion-normal` | 180ms | 页面进入、弹窗主体、常规切换 |
| `--mmp-motion-slow` | 220ms | 低频、内容稍复杂的进入变化 |

业务页面禁止自行出现 `duration: 0.37`、`transition: 500ms` 等随意值。

## 3. 页面切换

### 3.1 `/yewurules` 内部页面

后台主框架已经在 `AdminContent` 按 `activeMenu / activeSubMenu / activeTab` 统一处理页面进入动效：

- `opacity: 0 → 1`
- `translateY(6px) → 0`
- 约 180ms

新增 `/yewurules` 页面时只需接入现有 `AdminContent`，禁止在具体页面重复添加整页进入动画。

### 3.2 React Router 一级路由

顶部 `Navbar` 的 `Link` 使用 React Router `viewTransition`。

新增顶部一级路由入口时：

```jsx
<Link to="/example" viewTransition>
  示例页面
</Link>
```

不要再额外叠加第二套整页淡入动画。

## 4. 弹窗

### 4.1 优先级

1. 优先使用 Ant Design `Modal`，沿用其原生动效。
2. 通用选择场景必须使用 `SelectModal`。
3. 只有项目现有自定义场景才使用 `src/components/Modal.js`。

`SelectModal` 和自定义 `Modal` 已统一：

- 遮罩淡入/淡出
- 主体 `translateY(8px) + scale(0.98) → 正常位置`
- 进入约 180ms
- 退出约 140ms
- 关闭动画结束后再卸载 DOM

新增弹窗禁止重新写一套 `if (!open) return null` + 瞬间插入 DOM 的自定义实现。

## 5. 侧边栏与下拉

侧边栏二级菜单统一使用 `mmp-sidebar-collapse`，顶部路由下拉统一使用 `mmp-nav-dropdown`。

规则：

- 展开/收起只使用短距离和透明度变化。
- Chevron 旋转使用统一 `mmp-menu-chevron`。
- 不允许菜单从屏幕外飞入。
- 关闭状态必须禁止点击，不能只把透明度设为 0。

业务页面如果需要自定义轻量下拉，应优先使用 Ant Design `Dropdown / Popover`；确实需要手写时复用上述动效语义，不新造时长。

## 6. 可点击 Card / 操作块

只有明确可点击对象使用：

```jsx
<div className="mmp-interactive-card ...">
  ...
</div>
```

当前效果：

- hover：上浮 2px + 阴影略增强
- active：回落并 `scale(0.99)`
- 100～140ms

禁止给以下对象添加上浮：

- 查询条件 Card
- 详情信息 Card
- 表格容器 Card
- 审批记录 Card
- 仅用于分区的 Card

判断标准：如果用户点击 Card 本身不会触发业务动作，就不要加 `mmp-interactive-card`。

## 7. 表格新增 / 修改反馈

新增或修改一条记录后，如果用户会回到列表查找结果，应短暂高亮目标行。

公共 Hook：

```jsx
import useTransientRowHighlight from '../hooks/useTransientRowHighlight';

const { highlightRow, getRowClassName } = useTransientRowHighlight();
```

Table：

```jsx
<Table
  rowKey="id"
  rowClassName={(record) => getRowClassName(record, 'id')}
  ...
/>
```

成功新增/修改后：

```jsx
setRows((current) => [created, ...current]);
highlightRow(created.id);
```

修改：

```jsx
setRows((current) => current.map((row) => row.id === updated.id ? updated : row));
highlightRow(updated.id);
```

规则：

- 只在成功落数据后触发，不在点击按钮时提前触发。
- 默认约 900ms，由浅品牌色自然恢复，不闪烁、不循环。
- 删除不做“残影动画”，删除成功后直接移除并用 Message 反馈。
- 查询、分页、排序导致的普通列表刷新不触发行高亮。

## 8. Hover / Press

高频控件优先使用 Ant Design 原生状态；手写交互只允许针对明确属性：

推荐：

```css
transition: color 140ms, background-color 140ms, transform 100ms;
```

不推荐：

```css
transition: all 300ms;
```

原因：`transition-all` 会把尺寸、位置等无关变化也纳入动画，容易让后台页面拖沓或出现意外过渡。

## 9. Loading 与内容替换

- 有真实异步等待时优先使用 Ant Design `Skeleton / Spin`。
- Skeleton → 内容可以做轻量淡入，但不要为了演示 Mock 数据人为制造 Loading。
- 不允许为了“看起来高级”加入固定延时。

## 10. 禁止项

新增页面禁止：

- 大于 300ms 的常规业务动画。
- `bounce / spring` 弹跳作为普通后台交互默认效果。
- 页面从左右 100px 以上距离飞入。
- 普通信息 Card 全局上浮。
- 为单个页面单独引入 GSAP、Motion 等动画依赖。
- 在业务页面复制一套新的动效 Token。
- 使用动画掩盖慢接口；真实性能问题应直接解决性能。

## 11. 新页面动效检查清单

每次生成新页面必须检查：

1. 页面是否接入现有 `AdminContent` / React Router 公共切换能力，而不是自己再做整页动画。
2. 弹窗是否使用 Ant Design Modal / `SelectModal` / 现有公共 Modal。
3. 明确可点击 Card 是否使用 `mmp-interactive-card`；不可点击 Card 是否保持静止。
4. 有“新增/修改后回列表”场景时，是否使用 `useTransientRowHighlight` 给目标行反馈。
5. 自定义菜单/下拉是否有 140～180ms 的进入/退出，而不是瞬间出现。
6. 是否避免 `transition-all`、长动画和大位移。
7. 是否尊重 `prefers-reduced-motion`。
8. 是否没有为了动效新增不必要的依赖。

只要以上 8 项满足，新页面就视为符合本项目统一动效规范。
