import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, serial, integer, text, index } from "drizzle-orm/pg-core";

// 系统健康检查表（必须保留）
export const healthCheck = pgTable("health_check", {
  id: serial().primaryKey(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 员工类型枚举
export type WorkerType = 'HUMAN' | 'AI';
// 职位类型
export type Position = '全栈工程师' | '后端工程师' | '前端工程师' | 'UI设计师' | '产品经理' | 'AI需求分析员' | 'AI后端开发' | 'AI前端开发' | 'AI自动化测试' | 'AI代码审查';

// 员工表
export const workers = pgTable(
  "workers",
  {
    id: serial().primaryKey(),
    employee_id: varchar("employee_id", { length: 20 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    position: varchar("position", { length: 50 }).notNull(),
    type: varchar("type", { length: 10 }).notNull().default('HUMAN'),
    avatar_url: varchar("avatar_url", { length: 500 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("workers_employee_id_idx").on(table.employee_id),
    index("workers_type_idx").on(table.type),
  ]
);

// 需求状态枚举
export type WorkItemStatus = 'RUNNING' | 'WAITING_APPROVAL' | 'DONE' | 'FAILED';

// 需求/工作项表
export const workItems = pgTable(
  "work_items",
  {
    id: serial().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default('RUNNING'),
    owner_id: integer("owner_id").notNull().references(() => workers.id),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("work_items_owner_id_idx").on(table.owner_id),
    index("work_items_status_idx").on(table.status),
    index("work_items_created_at_idx").on(table.created_at),
  ]
);

// 流水线状态枚举
export type PipelineRunStatus = 'RUNNING' | 'WAITING_APPROVAL' | 'DONE' | 'FAILED';

// 流水线执行表
export const pipelineRuns = pgTable(
  "pipeline_runs",
  {
    id: serial().primaryKey(),
    work_item_id: integer("work_item_id").notNull().references(() => workItems.id),
    status: varchar("status", { length: 20 }).notNull().default('RUNNING'),
    total_steps: integer("total_steps").notNull().default(0),
    completed_steps: integer("completed_steps").notNull().default(0),
    started_at: timestamp("started_at", { withTimezone: true }),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("pipeline_runs_work_item_id_idx").on(table.work_item_id),
    index("pipeline_runs_status_idx").on(table.status),
  ]
);

// 步骤状态枚举
export type StepRunStatus = 'PENDING' | 'RUNNING' | 'WAITING_APPROVAL' | 'DONE' | 'FAILED' | 'SKIPPED';

// 步骤执行表
export const stepRuns = pgTable(
  "step_runs",
  {
    id: serial().primaryKey(),
    pipeline_run_id: integer("pipeline_run_id").notNull().references(() => pipelineRuns.id),
    worker_id: integer("worker_id").notNull().references(() => workers.id),
    step_name: varchar("step_name", { length: 100 }).notNull(),
    step_order: integer("step_order").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default('PENDING'),
    input_url: text("input_url"),
    output_url: text("output_url"),
    error_message: text("error_message"),
    started_at: timestamp("started_at", { withTimezone: true }),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("step_runs_pipeline_run_id_idx").on(table.pipeline_run_id),
    index("step_runs_worker_id_idx").on(table.worker_id),
    index("step_runs_status_idx").on(table.status),
    index("step_runs_step_order_idx").on(table.step_order),
  ]
);

// 类型导出
export type Worker = typeof workers.$inferSelect;
export type WorkItem = typeof workItems.$inferSelect;
export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type StepRun = typeof stepRuns.$inferSelect;
