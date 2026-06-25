## 2026-06-24/25 物料维度组合弹窗重构教训

1. 应用替换必须从尾部到头部（end to start），否则前面替换后后面位置偏移
2. indexOf 搜索注释要用 "{/* xxx */}" 完整模式，不能用 "/* xxx */"（漏掉 { 导致重复）
3. 字符串中避免 \' 转义，改用 placeholder={'请选择'} JSX 表达式语法
4. 窗口类数组太大会超时，拆成小步验证
5. 两个选项的 Select 应改为 Radio.Group 单选按钮更简洁
6. 业务规则字段建议用数据驱动方式（fields 数组 + renderFieldRows），避免固定行布局导致空白占位
7. 每次改动后先跑 Babel 再跑 ESLint，避免累积错误
8. 回滚前一定要 git diff HEAD 确认范围，不要在另一个对话中执行 git checkout
