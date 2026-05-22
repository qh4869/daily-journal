# 每日手账

一个简洁的微信小程序，用于记录每日工作事项。

## 功能

- 记录每日工作事项（纯文本）
- 标记事项完成状态
- 未完成事项可延期到指定日期
- 只保留最近30天的记录
- 简约手账风格UI

## 技术栈

- 微信小程序原生开发
- 微信云开发

## 开发

1. 在 `app.js` 中配置云环境ID
2. 在 `project.config.json` 中配置小程序appid
3. 在微信开发者工具中打开项目
4. 点击"云开发"按钮初始化云环境
5. 创建数据库集合 `items`
6. 上传并部署云函数 `cleanup`

## 云数据库结构

### items 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 自动生成 |
| content | String | 事项内容 |
| status | String | "pending" 或 "completed" |
| date | String | 日期 "YYYY-MM-DD" |
| userId | String | 用户openid |
| createdAt | Number | 创建时间戳 |

## 数据保留策略

只保留最近30天的记录，超过30天的记录会被自动清理。