# 星火 - 研发协作平台

## 项目概述

**星火** 是一个企业级研发协作可视化平台，用于展示真实员工和 AI 数字人的协作执行状态。系统名称寓意：每个需求、每个步骤都如星火般闪烁，汇聚成研发的星河。

### 核心功能

1. **首页统计概览**：环形进度图展示需求状态分布，动态数字展示统计数据
2. **工作者卡片网格**：精美卡片展示真实员工和 AI 数字人，支持悬停动画效果
3. **需求卡片网格**：状态指示条、搜索筛选、分页功能
4. **需求详情页**：时间线动画展示执行步骤，区分真实员工/AI

### 设计风格

- **深色科技主题**：深灰背景 + 紫色强调色
- **灵动动画**：卡片悬停发光、数字跳动、进度条流光
- **响应式布局**：支持桌面端和移动端

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)

## 目录结构

```
├── src/
│   ├── app/                    # 页面路由与布局
│   │   ├── api/
│   │   │   ├── spark/          # 星火 API 接口
│   │   │   │   ├── stats/      # 统计数据
│   │   │   │   ├── workers/    # 工作者列表
│   │   │   │   └── work-items/ # 需求列表
│   │   │   ├── work-items/     # 需求详情接口
│   │   │   └── step-runs/      # 步骤上报接口
│   │   ├── work-items/         # 需求页面
│   │   ├── page.tsx            # 首页
│   │   └── globals.css         # 全局样式（星火主题）
│   ├── components/
│   │   ├── ui/                 # Shadcn UI 组件库
│   │   └── spark/              # 星火组件
│   │       ├── Home.tsx        # 首页主组件
│   │       ├── Header.tsx      # 顶部导航
│   │       ├── StatsOverview.tsx # 统计概览
│   │       ├── FilterBar.tsx   # 筛选栏
│   │       ├── WorkerGrid.tsx  # 工作者卡片网格
│   │       └── WorkItemGrid.tsx # 需求卡片网格
│   └── storage/database/       # 数据库相关
│       ├── supabase-client.ts  # Supabase 客户端
│       └── shared/schema.ts    # 数据库 Schema
```

## 数据库模型

### 表结构

1. **workers（员工表）**：id, employee_id, name, position, type（HUMAN/AI）
2. **work_items（需求表）**：id, title, description, status, owner_id
3. **pipeline_runs（流水线表）**：id, work_item_id, status, total_steps, completed_steps
4. **step_runs（步骤表）**：id, pipeline_run_id, worker_id, step_name, step_order, status

### 状态枚举

- WorkItem/Pipeline: RUNNING / WAITING_APPROVAL / DONE / FAILED
- Step: PENDING / RUNNING / WAITING_APPROVAL / DONE / FAILED / SKIPPED

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/spark/stats | GET | 获取统计数据（含 AI 员工数） |
| /api/spark/workers | GET | 获取工作者列表（含进度信息） |
| /api/spark/work-items | GET | 获取需求列表 |
| /api/work-items/[id] | GET | 需求详情（含流水线步骤） |
| /api/step-runs | POST | 上报步骤状态 |

## 包管理规范

**仅允许使用 pnpm** 作为包管理器。

## UI 设计规范

- **主题**：深色科技风（背景 #1A1A1F，强调色紫色）
- **圆角**：中等圆角（0.75rem）
- **组件**：shadcn/ui + lucide-react 图标
