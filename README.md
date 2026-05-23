# 每日手账 (Daily Journal)

> 一个简约的微信小程序，用于记录和管理每日工作事项。
> 当前仅支持个人使用，没有多用户功能。

## 功能特性

- 📅 **多视图模式** - 日视图和周视图切换
- ✅ **状态管理** - 标记事项为待完成/已完成
- 🔄 **延期功能** - 未完成事项可延期到其他日期
- 📋 **待办汇总** - 跨日期汇总显示所有待办事项
- ✨ **拖拽排序** - 支持事项拖拽重排
- 🗑️ **自动清理** - 只保留最近30天的记录
- 📖 **日期导航** - 支持过去30天到未来30天的日期范围

## 技术栈

- **框架**：微信小程序原生开发
- **后端**：微信云开发（云数据库 + 云函数）
- **样式**：WXSS
- **语言**：JavaScript (ES6)

## 开发

1. 在微信开发者工具中打开项目
2. 点击"云开发"按钮初始化云环境
3. 复制 `config.example.js` 为 `config.js`，填入实际的云环境 ID
4. 复制 `project.private.config.json.example` 为 `project.private.config.json`，填入小程序 appid
5. 云环境创建数据库集合 `items`
6. 本地调试，完善功能
7. 上传并部署云函数 `cleanup`

## 配置说明

| 文件 | 说明 | 是否提交到 git |
|------|------|----------------|
| `project.config.json` | 公共配置（构建、项目结构） | ✅ 是 |
| `project.private.config.json` | 私有配置（appid、libVersion） | ❌ 否 |
| `project.private.config.json.example` | 私有配置模板 | ✅ 是 |
| `config.js` | 云环境 ID（本地开发） | ❌ 否 |
| `config.example.js` | 云环境 ID 模板 | ✅ 是 |

## 数据库结构

### items 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 记录ID（自动生成） |
| content | String | 事项内容 |
| status | String | "pending"（待完成）或 "completed"（已完成） |
| date | String | 日期（YYYY-MM-DD） |
| userId | String | 用户标识 |
| order | Number | 排序值 |
| createdAt | Number | 创建时间戳 |

## License

MIT