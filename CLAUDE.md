# 每日手账 (Daily Journal)

## 第一部分：稳定内容（不易变化）

### 1. 项目概述
- 项目名称：每日手账 (Daily Journal)
- 项目类型：微信小程序
- 项目用途：记录和管理每日工作事项
- 设计风格：纸质手账风格，米色背景

### 2. 技术栈
- **框架**：微信小程序原生开发
- **后端**：微信云开发（云数据库 + 云函数）
- **样式**：WXSS
- **语言**：JavaScript (ES6)
- **无外部依赖**：纯小程序原生 API

### 3. 核心功能
- 日视图/周视图切换
- 添加/删除事项
- 完成状态切换（pending/completed）
- 事项延期到其他日期
- 拖拽排序
- 自动清理30天前数据
- 待办事项跨日期汇总显示
- 日期导航（前后30天范围）

### 4. 样式设计
- 背景色：`#FDFBF7`（米白色纸张风格）
- 状态标签：
  - 待完成：黄色
  - 已完成：绿色
- 设计风格：简约手账风格，圆角卡片，轻微阴影
- 日期显示：智能格式化（今天/明天/具体日期+星期）

---

## 第二部分：可能变化的内容（路径、文件说明、数据库、业务规则）

### 5. 业务规则
- 新增事项时：今天及过去的日期默认"已完成"，未来日期默认"待完成"
- 数据保留：只保留最近30天内的记录
- 日期范围：可查看过去30天到未来30天

### 6. 项目结构（当前结构）
```
daily-journal/
├── pages/              # 页面目录
│   ├── index/          # 主页（日/周视图）
│   └── add/            # 添加事项页
├── utils/              # 工具函数
│   ├── db.js           # 数据库操作
│   └── date.js         # 日期处理
└── cloudfunctions/     # 云函数
    └── cleanup/        # 清理旧数据
```

### 7. 数据库结构
**集合**：`items`
- `_id`：记录ID（自动生成）
- `content`：事项内容（文本）
- `status`：状态（"pending" 待完成 / "completed" 已完成）
- `date`：日期（YYYY-MM-DD 格式）
- `userId`：用户标识
- `order`：排序值（数字）
- `createdAt`：创建时间戳

### 8. 关键文件说明

**数据库工具（`utils/db.js` 或类似路径）**
- `getItemsByDate(date, callback)` - 获取指定日期事项
- `addItem(content, date, order, callback)` - 添加事项
- `markAsCompleted(itemId, callback)` - 标记完成
- `markAsPending(itemId, callback)` - 标记未完成
- `rescheduleItem(itemId, newDate, callback)` - 延期
- `deleteItem(itemId, callback)` - 删除
- `batchUpdateOrders(updates, callback)` - 批量更新排序
- `getAllPendingItems(callback)` - 获取所有待办事项

**日期工具（`utils/date.js` 或类似路径）**
- `formatDate(date)` - 格式化日期为 YYYY-MM-DD
- `getTodayDate()` - 获取今天日期
- `getDateOffset(baseDate, offsetDays)` - 计算偏移日期
- `formatDateDisplay(dateStr)` - 格式化显示日期（今天/明天/具体日期）
- `getThirtyDaysAgoDate()` - 获取30天前的日期

**主页逻辑（`pages/index/index.js`）**
- 视图切换（day/week）
- 日期导航
- 拖拽排序实现
- 状态管理