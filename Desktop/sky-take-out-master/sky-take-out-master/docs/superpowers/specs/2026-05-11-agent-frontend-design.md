# 苍穹外卖 Agent 功能 + Vue 前端设计文档

**日期**：2026-05-11  
**项目**：sky-take-out-master  
**范围**：后端 Agent（Function Calling + 多轮对话）+ Vue 3 前端聊天界面

---

## 1. 背景

项目现有 `/user/ai` 接口调用通义千问 qwen-turbo 实现基础问答，但缺少：
- 多轮对话上下文记忆
- AI 主动调用系统工具的能力（Function Calling）
- 独立前端界面

本次扩展目标：实现一个简化版任务规划 Agent，用户可通过自然语言完成查菜品、加购物车、查订单三类操作。

---

## 2. 架构

```
sky-take-out/
├── sky-server/          # 后端（扩展 Agent 功能）
└── sky-frontend/        # 新增 Vue 3 前端项目
```

### 后端扩展模块

| 文件 | 路径 | 说明 |
|------|------|------|
| AgentController | controller/user/AgentController.java | POST /user/agent/chat |
| AgentService | service/AgentService.java | 接口定义 |
| AgentServiceImpl | service/impl/AgentServiceImpl.java | 核心逻辑 |
| AgentToolFunctions | agent/AgentToolFunctions.java | 3个工具方法 |
| AgentChatDTO | dto/AgentChatDTO.java | 请求体 |
| AgentChatVO | vo/AgentChatVO.java | 响应体 |

### 前端项目结构

```
sky-frontend/
├── package.json
├── vite.config.js
└── src/
    ├── App.vue
    ├── main.js
    ├── views/
    │   └── ChatView.vue
    ├── components/
    │   ├── ChatWindow.vue
    │   ├── MessageInput.vue
    │   └── ToolCallCard.vue
    └── api/
        └── agent.js
```

---

## 3. 数据流

```
用户输入
  → MessageInput.vue
  → POST /user/agent/chat { sessionId, message }
    → Redis 加载历史（key: agent:session:{userId}，TTL 30min）
    → 通义千问（携带 tools 参数，Function Calling）
    → 解析响应：
        ├── 普通回复 → 直接返回
        └── tool_calls → 执行工具 → 结果回传 AI → 获取最终回复
    → Redis 保存更新后的历史
  → ChatWindow.vue 渲染消息
  → ToolCallCard.vue 展示工具调用过程（可选）
```

---

## 4. 接口定义

### POST /user/agent/chat

**请求头**：`authentication: {JWT token}`

**请求体**：
```json
{
  "sessionId": "可选，首次对话不传",
  "message": "有什么川菜推荐？"
}
```

**响应体**：
```json
{
  "code": 1,
  "data": {
    "sessionId": "uuid-xxx",
    "reply": "为您推荐以下川菜：宫保鸡丁、麻婆豆腐...",
    "toolCalls": [
      {
        "toolName": "queryDish",
        "args": {"categoryName": "川菜"},
        "result": "找到3道菜品"
      }
    ]
  }
}
```

---

## 5. 工具函数定义

### queryDish
- **触发场景**：用户询问菜品、推荐、查看菜单
- **参数**：`categoryName`（菜品分类名，可为空表示查全部）
- **实现**：调用 DishMapper 按分类查询在售菜品

### addToCart
- **触发场景**：用户说"帮我加X"、"我要点X"
- **参数**：`dishName`（菜品名称）
- **实现**：先查 DishMapper 找到 dishId，再调用 ShoppingCartService.addShoppingCart

### queryOrder
- **触发场景**：用户询问订单状态、历史订单
- **参数**：无（从 JWT 上下文取 userId）
- **实现**：调用 OrderMapper 查最近5条订单

---

## 6. Redis 会话存储

- **Key**：`agent:session:{userId}`
- **Value**：JSON 序列化的 `List<ChatMessage>`（角色 + 内容）
- **TTL**：30 分钟（每次对话后刷新）
- **最大轮数**：保留最近 10 轮（20条消息），防止 token 超限

---

## 7. 前端组件说明

### ChatView.vue
主页面，包含顶部标题栏、ChatWindow、MessageInput，管理 sessionId 状态。

### ChatWindow.vue
消息列表，区分用户消息（右对齐蓝色）和 AI 消息（左对齐灰色），支持 ToolCallCard 嵌入展示。

### MessageInput.vue
底部输入框 + 发送按钮，支持 Enter 发送，发送中禁用输入。

### ToolCallCard.vue
折叠卡片，展示 AI 调用了哪个工具、参数是什么、结果如何，帮助用户理解 Agent 行为。

### agent.js
封装 axios 请求，统一处理 JWT 请求头和错误响应。

---

## 8. 错误处理

| 场景 | 处理方式 |
|------|---------|
| 会话超时（Redis TTL 到期） | 自动重置历史，下次对话重新开始，前端无感知 |
| 工具执行失败 | 将错误信息作为工具结果回传 AI，由 AI 生成友好提示 |
| AI 接口超时（>10s） | 返回"服务繁忙，请稍后重试" |
| 未登录访问 | 走现有 JWT 拦截器，返回 401 |
| 菜品不存在 | 工具返回"未找到该菜品"，AI 据此回复 |

---

## 9. 测试路径

1. **查菜品**：输入"有什么川菜推荐？" → AI 调用 queryDish → 返回菜品列表
2. **加购物车**：输入"帮我加一份宫保鸡丁" → AI 调用 addToCart → 确认加入
3. **查订单**：输入"我最近的订单是什么？" → AI 调用 queryOrder → 返回订单摘要
4. **多轮对话**：先问菜品，再说"就要第一个" → AI 记住上下文，调用 addToCart

---

## 10. 不在本次范围内

- 流式输出（SSE）
- 语音输入
- 支付流程的 Agent 化
- 管理端 Agent
