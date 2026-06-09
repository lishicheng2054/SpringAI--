<div align="center">

<img src="https://img.shields.io/badge/Java-21-orange?logo=openjdk" alt="Java 21">
<img src="https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen?logo=springboot" alt="Spring Boot">
<img src="https://img.shields.io/badge/Spring%20AI-1.1.2-blue?logo=spring" alt="Spring AI">
<img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18">
<img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript" alt="TypeScript">
<img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="PostgreSQL">
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker" alt="Docker">
<br>
<img src="https://img.shields.io/badge/license-MIT-green" alt="License">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome">

</div>

<hr>

# 🎯 SpringAI 模拟面试平台

<p align="center">
  <strong>AI 驱动的全栈面试训练平台</strong><br>
  从简历录入到 AI 出题、智能评分、多维分析、语音面试 — 一站式面试备战方案
</p>

<p align="center">
  <a href="#-项目简介">简介</a> ·
  <a href="#-功能概览">功能</a> ·
  <a href="#-快速开始">快速开始</a> ·
  <a href="#-技术栈">技术栈</a> ·
  <a href="#-项目结构">结构</a> ·
  <a href="#-api接口">API</a> ·
  <a href="#-架构设计">架构</a> ·
  <a href="#-部署">部署</a>
</p>

<hr>

## 📖 项目简介

**SpringAI 模拟面试平台**是一个从零到一、纯手写搭建的企业级全栈项目。与常见的 Demo 级 Spring AI 项目不同，本平台覆盖了从**简历录入、AI 智能出题、逐题评分、RAG 知识库问答、语音面试到数据分析看板**的完整业务闭环，是一个可用于学习的 AI 应用开发参考实现。

<blockquote>
<b>为什么创建这个项目？</b><br>
市面上大多数 Spring AI 教程只停留在"调用一次 chat 接口"层面。本项目的目标是展示如何在真实业务场景中深度集成 AI 能力 — 包括 Provider 管理、结构化输出、安全加密、降级容错、全文检索增强等多个工程化实践。
</blockquote>

### 🧠 核心理念

- **AI 不是装饰，是引擎** — 题目生成、答案评估、简历分析、知识库问答全部由 LLM 驱动
- **真实可运行** — 所有功能经过前后端联调验证，Docker 一键部署
- **工程化实践** — API Key 加密存储、统一异常处理、结构化输出解析、Mock 降级
- **渐进式架构** — 从 MVP（单模块 Mock） 到全功能（多模块 + 真实 AI），每个阶段清晰可追溯

<hr>

## 🖥️ 界面预览

<details open>
<summary><b>点击展开截图</b></summary>

<br>

| 首页 | 数据看板 |
|:---:|:---:|
| 深色 Hero + 功能卡片 + 技术栈展示 | SVG 折线图 + 柱状图 + 岗位分布 + 活动时间线 |

| 简历详情 + AI 分析 | 模拟面试 + 计时器 |
|:---:|:---:|
| 双模式录入 + AI 技能/优势/风险分析 | 实时倒计时 + 进度条 + AI 逐题评分 |

| 面试结果 | 对比分析 |
|:---:|:---:|
| 总分卡片 + 三维评分 + PDF 导出 | SVG 雷达图 + 分数对比表 + 评语对比 |

| 知识库 RAG 问答 | 面试题库 |
|:---:|:---:|
| 文档管理 + PG 全文搜索 + AI 问答 | 5 大分类 + 难度标签 + 搜索筛选 |

</details>

<hr>

## ✨ 功能概览

### 🤖 1. AI 面试引擎（核心）

| 功能 | 说明 |
|------|------|
| **真实 LLM 出题** | 集成 DeepSeek（兼容 OpenAI 协议），根据简历内容动态生成个性化面试题，支持 INTRO/TECH/PROJECT/HR 四种题型 |
| **智能评分** | 技术能力、沟通表达、逻辑思维三维度评分 + 逐题反馈 + 综合评语 |
| **Mock 降级** | AI 服务不可用时自动回退本地 Mock 引擎，保证面试流程不中断 |
| **配置化面试** | 可选 8 种岗位类型、3/5/8/10 题量、自定义面试模板 |
| **计时器 + 压力模式** | 每题 120 秒倒计时，颜色渐变（绿→黄→红），到时自动提交 |
| **中断恢复** | 面试中途退出自动保存，下次进入简历详情页可继续作答 |

### 📊 2. 数据分析看板

- **概览卡片** — 简历总数 / 面试次数 / 平均分数 / 知识库文档数
- **SVG 分数趋势图** — 最近 10 次面试分数走势，纯 SVG 无第三方依赖
- **能力维度柱状图** — 技术 / 沟通 / 逻辑三维度平均分对比
- **岗位分布图** — 各岗位面试次数横向柱状图
- **雷达图对比** — 选择 2~5 次面试，多维度雷达图 + 分数对比表 + 评语对比
- **活动时间线** — 最近简历创建 / 面试完成动态

### 📝 3. 简历管理

- **双模式录入** — 文本粘贴输入 或 PDF/Word/TXT 文件上传（Apache Tika 解析）
- **AI 简历分析** — 点击分析按钮 → LLM 生成技能清单、优势亮点、风险提示、改进建议
- **简历列表** — 增删查 + 来源标签 + 日期排序 + 快捷面试入口

### 📚 4. 知识库 (RAG)

- **文档管理** — 创建知识库 → 上传文档（Tika 自动解析）→ 查看/删除
- **智能问答** — 用户提问 → PostgreSQL `ILIKE`/`tsvector` 全文搜索 → 匹配片段 → LLM 生成答案 → 返回引用来源
- **为向量检索预留** — 数据库使用 pgvector 镜像，后续可无缝升级到向量相似度搜索

### 🗣️ 5. 语音面试

- **WebSocket 实时通信** — `POST + WebSocket` 混合架构
- **浏览器语音识别** — Web Speech API（STT），按住说话松开停止
- **语音合成播题** — SpeechSynthesis API（TTS），AI 朗读题目
- **实时字幕** — 边说边显示转写文字，支持清除和编辑

### ⚙️ 6. 平台工程

- **LLM Provider 管理** — 可视化管理多个 AI 服务商（DeepSeek/OpenAI/Kimi...），API Key AES-256-GCM 加密存储，支持连通性测试
- **面试题库** — 5 大分类（算法/系统设计/行为/技术/HR）+ 3 级难度，支持分类视图和列表搜索
- **面试模板** — 将题目组合保存为模板，一键应用到面试
- **面试日程** — 日历式管理，PENDING → READY → DONE / CANCELLED 状态流转
- **PDF 报告导出** — OpenPDF 生成 A4 格式面试评估报告
<hr>

## 🚀 快速开始

### 环境要求

| 工具 | 最低版本 | 用途 |
|------|---------|------|
| JDK | 21+ | 后端编译运行 |
| Docker Desktop | 最新版 | 运行 PostgreSQL |
| pnpm | 8+ | 前端包管理 |
| Git | 2.0+ | 克隆项目 |

### 第一步：克隆项目

```bash
git clone https://github.com/lishicheng2054/SpringAI--.git springai-interview-beginner
cd springai-interview-beginner
```

### 第二步：启动 PostgreSQL

```bash
docker compose up -d postgres

# 验证
docker exec interview-beginner-pg pg_isready -U postgres
# 输出: /var/run/postgresql:5432 - accepting connections
```

### 第三步：启动后端

```bash
cd backend

# macOS / Linux
./gradlew bootRun

# Windows
gradlew.bat bootRun
```

**首次运行需注册 Provider**（否则使用 Mock 模式）：

```bash
curl -X POST http://localhost:8080/api/llm-providers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "deepseek",
    "baseUrl": "https://api.deepseek.com",
    "apiKey": "sk-你的DeepSeek-API-Key",
    "model": "deepseek-chat",
    "temperature": 0.7
  }'

# 验证连通性
curl -X POST http://localhost:8080/api/llm-providers/deepseek/test
# {"success":true,"message":"连接成功"}

# 健康检查
curl http://localhost:8080/api/health
# {"code":0,"message":"success","data":{"status":"ok"}}
```

### 第四步：启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

浏览器访问 **http://localhost:5173**

### 快速验证面试流程

```bash
# 1. 创建简历
curl -s -X POST http://localhost:8080/api/resumes \
  -H "Content-Type: application/json" \
  -d '{"candidateName":"张三","targetPosition":"Java后端","resumeText":"5年Java经验，Spring Boot，MySQL..."}'

# 2. 创建面试会话
curl -s -X POST http://localhost:8080/api/interviews/sessions \
  -H "Content-Type: application/json" \
  -d '{"resumeId":1,"roleType":"Java后端","questionCount":3}'

# 3. 逐题作答...

# 4. 查看结果
curl -s http://localhost:8080/api/interviews/sessions/{sessionId}/result
```

<hr>

## 🛠 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Spring Boot** | 3.5.0 | 应用框架，虚拟线程 |
| **Spring AI** | 1.1.2 | LLM 集成（OpenAI 兼容协议） |
| **Spring Data JPA** | - | ORM + Repository |
| **PostgreSQL** | 16 (pgvector) | 主数据库 |
| **Hibernate** | 6.6 | JPA 实现 + DDL 自动迁移 |
| **Apache Tika** | 2.9.2 | 文档解析（PDF/Word/TXT） |
| **OpenPDF** | 2.0.3 | PDF 报告生成 |
| **WebSocket** | - | 语音面试实时通信 |
| **Lombok** | 1.18 | 减少样板代码 |
| **Jackson** | 2.19 | JSON 序列化 |
| **Gradle** | 8.14 | 构建工具 |

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18 | UI 框架 |
| **TypeScript** | 5.6 | 类型安全 |
| **Vite** | 8 | 构建 + HMR |
| **TailwindCSS** | 4.3 | 原子化 CSS |
| **Lucide React** | 1.17 | SVG 图标库 |
| **React Router** | 7 | 客户端路由 |
| **Axios** | 1.16 | HTTP 客户端 |
| **Web Speech API** | - | 语音识别 + 合成 |

### 基础设施

| 技术 | 用途 |
|------|------|
| **Docker Compose** | 一键部署 PostgreSQL + 后端 + 前端 |
| **Nginx** | 生产环境前端静态资源 + API 反向代理 |
| **GitHub Actions** | CI/CD（计划中） |

<hr>

## 🔌 API 接口

> 所有接口统一返回 `{"code":0,"message":"success","data":{...}}`，HTTP 状态码始终为 200

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 服务健康检查 |

### 简历模块

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/resumes` | 文本创建简历 |
| `POST` | `/api/resumes/upload` | 文件上传简历 (multipart) |
| `GET` | `/api/resumes` | 简历列表 |
| `GET` | `/api/resumes/{id}` | 简历详情 |
| `DELETE` | `/api/resumes/{id}` | 删除简历（级联分析结果） |
| `POST` | `/api/resumes/{id}/analyze` | 触发 AI 简历分析 |
| `GET` | `/api/resumes/{id}/analysis` | 获取 AI 分析结果 |

### 面试模块（核心）

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/interviews/sessions` | 创建面试会话（返回第一题） |
| `POST` | `/api/interviews/sessions/{id}/answers` | 提交答案（返回下一题或结束） |
| `GET` | `/api/interviews/sessions/{id}` | 会话详情 |
| `GET` | `/api/interviews/sessions/{id}/result` | 获取最终评估结果 |
| `GET` | `/api/interviews/sessions/{id}/export` | 导出 PDF 报告 |
| `GET` | `/api/interviews/history` | 面试历史列表 |
| `GET` | `/api/interviews/compare?ids=...` | 多维度对比 |
| `GET` | `/api/interviews/unfinished/{resumeId}` | 查找未完成会话 |

### 知识库

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` `GET` `DELETE` | `/api/knowledgebases[/{id}]` | 知识库 CRUD |
| `POST` | `/api/knowledgebases/{id}/documents` | 上传文档 |
| `GET` | `/api/knowledgebases/{id}/documents` | 文档列表 |
| `DELETE` | `/api/knowledgebases/{id}/documents/{did}` | 删除文档 |
| `POST` | `/api/knowledgebases/{id}/chat` | RAG 智能问答 |

### 题库 & 模板

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/question-bank` | 搜索题目（支持 category/difficulty/roleType/keyword） |
| `GET` | `/api/question-bank/grouped` | 按分类分组 |
| `POST` `DELETE` | `/api/question-bank[/{id}]` | 增删题目 |
| `GET` `POST` `DELETE` | `/api/templates[/{id}]` | 模板 CRUD |
| `POST` | `/api/templates/{id}/apply` | 应用模板（返回题目列表） |

### 其它

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` `POST` `PUT` `DELETE` | `/api/llm-providers[/{id}]` | Provider 管理 |
| `POST` | `/api/llm-providers/{id}/test` | 连通性测试 |
| `GET` `POST` `PUT` `PATCH` `DELETE` | `/api/interview-schedules[/{id}]` | 日程管理 |
| `PATCH` | `/api/interview-schedules/{id}/status` | 状态更新 |
| `GET` | `/api/dashboard/stats` | 看板聚合数据 |
| `WS` | `/ws/voice-interview/{sessionId}` | 语音面试 WebSocket |

<hr>

## 🏗️ 架构设计

### 后端分层架构

```
Controller → Service → Repository
                ↕
         Infrastructure (PdfExport, Encryption)
```

```
业务模块按功能边界划分，每个模块自包含：
modules/{feature}/
├── {Feature}Entity.java        # JPA 实体
├── {Feature}Repository.java    # 数据访问
├── {Feature}Service.java       # 业务逻辑
├── {Feature}Controller.java    # REST 接口
└── dto/                        # 数据传输对象
```

### AI 调用架构

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Service Layer │ → │ LlmProviderRegistry │ → │ DeepSeek API │
│  (业务层)     │     │ (ChatClient 缓存)   │     │ (OpenAI 协议) │
└─────────────┘     └──────────────────┘     └─────────────┘
                           ↕ (失败时)
                    ┌──────────────┐
                    │ MockAiService │
                    │ (本地降级)    │
                    └──────────────┘
```

### 关键设计决策

| 决策 | 原因 |
|------|------|
| OpenAI 兼容协议对接 DeepSeek | DeepSeek API 完全兼容 `/chat/completions` 端点，`spring-ai-starter-model-openai` 可直接复用 |
| API Key AES-256-GCM 加密存储 | 敏感信息不入版本控制，即使数据库泄露也需解密 |
| 面试题目预生成 | 创建会话时一次性生成所有题目，减少 AI 调用次数，响应更快 |
| PostgreSQL ILIKE 搜索（暂不用向量） | 先跑通 RAG 流程，后续升级 pgvector 只需改 Repository 查询 |
| 纯 SVG 图表（不用 ECharts/Recharts） | 零额外依赖，构建产物更小，渲染性能更好 |
| HTTP 200 + 业务 code | 前端 axios 拦截器统一处理，API 约定清晰 |

<hr>

## 📁 项目结构

```
springai-interview-beginner/
│
├── backend/                                    # Spring Boot 后端 (57 个 Java 文件)
│   ├── Dockerfile                              #   多阶段构建 (JDK → JRE)
│   ├── build.gradle                            #   Gradle 依赖管理
│   ├── settings.gradle
│   └── src/main/java/.../interviewbeginner/
│       ├── InterviewBeginnerApplication.java   #   启动类
│       ├── common/                             #   公共基础设施
│       │   ├── ai/                             #     LlmProviderRegistry (ChatClient 构建+缓存)
│       │   │                                   #     ApiKeyEncryptionService (AES-256-GCM)
│       │   ├── config/                         #     CorsConfig, WebSocketConfig
│       │   ├── constant/                       #     CommonConstants
│       │   ├── exception/                      #     ErrorCode (11 个错误域), BusinessException
│       │   │                                   #     GlobalExceptionHandler
│       │   └── result/                         #     Result<T> 统一响应包装
│       ├── infrastructure/
│       │   └── export/                         #     PdfExportService (OpenPDF)
│       └── modules/                            #   业务模块 (按功能边界划分)
│           ├── dashboard/                      #   数据看板统计聚合
│           ├── health/                         #   健康检查
│           ├── interview/                      #   🎯 面试核心 (Session/Question/Answer/Evaluation + AI)
│           ├── interviewschedule/              #   面试日程管理
│           ├── knowledgebase/                  #   知识库 + DocumentParse + RAG 问答
│           ├── llmprovider/                    #   LLM Provider 管理 (CRUD + 连通性测试)
│           ├── questionbank/                   #   面试题库
│           ├── resume/                         #   简历管理 + AI 分析
│           ├── template/                       #   面试模板
│           └── voiceinterview/                 #   语音面试 WebSocket Handler
│
├── frontend/                                   # React 前端 (35 个 TS/TSX 文件)
│   ├── Dockerfile                              #   多阶段构建 (Node.js → Nginx)
│   ├── nginx.conf                              #   SPA fallback + API 反向代理 + WebSocket
│   ├── index.html
│   └── src/
│       ├── main.tsx                            #   入口
│       ├── App.tsx                             #   路由配置 (18 个路由)
│       ├── index.css                           #   设计语言 (CSS 变量 + 动画 + 工具类)
│       ├── api/                                #   API 层 (11 个模块)
│       │   ├── request.ts                      #     Axios 实例 + Result 拦截器
│       │   ├── interview.ts / resume.ts        #
│       │   ├── knowledgebase.ts / llmProvider.ts #
│       │   ├── questionBank.ts / template.ts   #
│       │   ├── interviewSchedule.ts            #
│       │   └── health.ts                       #
│       ├── components/                         #   通用组件
│       │   ├── Layout.tsx                      #     侧边栏导航 (Lucide 图标 + 分组)
│       │   ├── LoadingSpinner.tsx              #     加载动画
│       │   └── ErrorMessage.tsx                #     错误提示 + 重试
│       ├── pages/                              #   16 个功能页面
│       │   ├── HomePage.tsx                    #     🏠 深色 Hero 首页
│       │   ├── DashboardPage.tsx               #     📊 数据看板 (SVG 图表)
│       │   ├── ResumeListPage.tsx              #     📄 简历列表
│       │   ├── ResumeInputPage.tsx             #     📝 简历录入 (文本+文件)
│       │   ├── ResumeDetailPage.tsx            #     📋 简历详情 + AI 分析 + 配置
│       │   ├── InterviewPage.tsx               #     🎯 文字面试 (计时器)
│       │   ├── VoiceInterviewPage.tsx          #     🎙️ 语音面试
│       │   ├── ResultPage.tsx                  #     📊 面试结果
│       │   ├── HistoryPage.tsx                 #     📜 面试历史
│       │   ├── ComparePage.tsx                 #     📈 对比分析 (雷达图)
│       │   ├── KnowledgeBaseListPage.tsx       #     📚 知识库列表
│       │   ├── KnowledgeBaseDetailPage.tsx     #     📄 文档管理
│       │   ├── KnowledgeBaseChatPage.tsx       #     💬 RAG 问答
│       │   ├── QuestionBankPage.tsx            #     📝 题库浏览
│       │   ├── TemplateListPage.tsx            #     📋 模板管理
│       │   ├── InterviewSchedulePage.tsx       #     📅 日程管理
│       │   └── SettingsPage.tsx                #     ⚙️ Provider 设置
│       └── types/                              #   TypeScript 类型定义
│
└── docker-compose.yml                          # 一键部署 (PG + Backend + Frontend)
```

<hr>

## 🚢 部署

### Docker Compose (推荐)

```bash
# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f backend
docker compose logs -f frontend

# 停止
docker compose down

# 停止并清除数据卷
docker compose down -v
```

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 (Nginx) | `http://localhost:80` | API 反向代理到后端 |
| 后端 (Spring Boot) | `http://localhost:8080` | REST API |
| PostgreSQL | `localhost:5432` | 数据持久化到 Docker Volume |

### 开发环境 (手动启动)

```bash
# 终端 1: PostgreSQL
docker compose up -d postgres

# 终端 2: 后端
cd backend && ./gradlew bootRun

# 终端 3: 前端
cd frontend && pnpm dev
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `POSTGRES_HOST` | `localhost` | PostgreSQL 主机 |
| `POSTGRES_PORT` | `5432` | PostgreSQL 端口 |
| `POSTGRES_DB` | `interview_beginner` | 数据库名 |
| `POSTGRES_USER` | `postgres` | 数据库用户 |
| `POSTGRES_PASSWORD` | `password` | 数据库密码 |
| `APP_ENCRYPTION_KEY` | (auto-generate) | API Key 加密密钥 (Base64) |

<hr>

## 📈 项目演进路线

| 阶段 | 日期 | 里程碑 |
|------|------|--------|
| **Phase 1 - MVP** | 2026.06.04 | 项目骨架 + H2 + MockAI 面试闭环 |
| **Phase 2 - AI 真实化** | 2026.06.05 | PostgreSQL 持久化 + DeepSeek 接入 + Provider 管理 |
| **Phase 3 - RAG** | 2026.06.05 | Tika 文档解析 + PG 全文搜索 + 知识库问答 |
| **Phase 4 - 分析** | 2026.06.06 | 数据看板 + 对比分析 + PDF 报告导出 |
| **Phase 5 - 扩展** | 2026.06.07 | 语音面试 + 题库 + 模板 + 面试安排 + 中断恢复 |
| **Phase 6 - 打磨** | 2026.06.08 | Lucide 图标 + 设计语言统一 + 全页面美化 |
| **Phase 7 - 测试** | 🔜 计划中 | JUnit 5 + Mockito 单元测试 + API 集成测试 |
| **Phase 8 - 生产** | 🔜 计划中 | JWT 认证 + 限流 + CI/CD + 监控 |

<hr>

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

开发建议：
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

<hr>

## 📄 License

MIT License — 自由使用、修改和分发。

<hr>

<div align="center">
  <sub>Built with ❤️ by SpringAI Interview Platform Team</sub>
  <br>
  <sub>Powered by DeepSeek · Java 21 · Spring Boot 3.5 · React 18</sub>
</div>
