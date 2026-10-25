# 盘点分布图立体对比检查（2026-10-25）

final result: blocked

范围：原资产类型分布图保持，下一块使用相同数据绘制椭圆投影、分离扇区、侧壁厚度及渐变，数字格式不变。

参考：本轮附件image(1).png。实现：InventoryDistribution3D.jsx；组件直接渲染图见docs/asset-inventory/screenshots/inventory-distribution-3d-20261025.png。已实际查看参考图与组件渲染结果，核对厚度、分离扇区、外部分类/金额/数量、内部比例及图例，修正了长标签裁切和引导线穿越主图的主要问题。该PNG是源组件的SVG渲染，不是浏览器截图。

阻塞：sites-preview已按规定启动，云浏览器访问http://terminal.local:4173/返回ERR_CONNECTION_REFUSED。无法在同一浏览器视口核对整页、表格对齐及交互，不将构建/组件渲染当作浏览器通过。原型代码与数据测试可交付，视觉验收仍待浏览器可用。
