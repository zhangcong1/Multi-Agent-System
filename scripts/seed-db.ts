/**
 * 向 Supabase/PostgreSQL 写入演示数据（工作者、需求、流水线、步骤）。
 *
 * 用法：pnpm db:seed
 * 需要 .env 中配置 COZE_DATABASE_URL（直连 5432，见 drizzle.config）。
 *
 * 会清空业务表 workers / work_items / pipeline_runs / step_runs 后重新插入（开发环境用）。
 */

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env' });

const url = process.env.COZE_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error('缺少 COZE_DATABASE_URL 或 DATABASE_URL');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      DELETE FROM step_runs;
      DELETE FROM pipeline_runs;
      DELETE FROM work_items;
      DELETE FROM workers;
    `);

    await client.query(`
      SELECT setval(pg_get_serial_sequence('workers', 'id'), 1, false);
      SELECT setval(pg_get_serial_sequence('work_items', 'id'), 1, false);
      SELECT setval(pg_get_serial_sequence('pipeline_runs', 'id'), 1, false);
      SELECT setval(pg_get_serial_sequence('step_runs', 'id'), 1, false);
    `);

    const workersRes = await client.query(`
      INSERT INTO workers (employee_id, name, position, type, created_at)
      VALUES
        ('EMP001', '张明', '全栈工程师', 'HUMAN', NOW()),
        ('EMP002', '李华', '后端工程师', 'HUMAN', NOW()),
        ('EMP003', '王芳', '前端工程师', 'HUMAN', NOW()),
        ('EMP004', '刘强', '产品经理', 'HUMAN', NOW()),
        ('EMP005', '陈静', 'UI设计师', 'HUMAN', NOW()),
        ('AIA001', '小智', 'AI需求分析员', 'AI', NOW()),
        ('AIA002', '阿强', 'AI后端开发', 'AI', NOW()),
        ('AIA003', '小文', 'AI前端开发', 'AI', NOW()),
        ('AIA004', '测测', 'AI自动化测试', 'AI', NOW()),
        ('AIA005', '审阅', 'AI代码审查', 'AI', NOW())
      RETURNING id, employee_id, name;
    `);

    const w = Object.fromEntries(
      workersRes.rows.map((r: { id: number; employee_id: string }) => [r.employee_id, r.id])
    ) as Record<string, number>;

    const wi = await client.query(`
      INSERT INTO work_items (title, description, status, owner_id, created_at, updated_at)
      VALUES
        (
          '用户登录功能开发',
          '实现用户登录与鉴权，包含前端页面、后端 API 与会话管理。',
          'RUNNING',
          ${w.EMP001},
          NOW() - INTERVAL '10 days',
          NOW() - INTERVAL '1 hour'
        ),
        (
          '数据看板可视化',
          '管理端数据看板：图表组件、筛选与导出。',
          'WAITING_APPROVAL',
          ${w.EMP002},
          NOW() - INTERVAL '5 days',
          NOW() - INTERVAL '30 minutes'
        ),
        (
          'API 网关性能优化',
          '限流、缓存与链路追踪改造，已完成并上线。',
          'DONE',
          ${w.EMP001},
          NOW() - INTERVAL '30 days',
          NOW() - INTERVAL '7 days'
        ),
        (
          '移动端 H5 适配',
          '响应式布局与触控交互优化。',
          'RUNNING',
          ${w.EMP003},
          NOW() - INTERVAL '3 days',
          NOW() - INTERVAL '2 hours'
        )
      RETURNING id, title;
    `);

    const wiIds = wi.rows as { id: number; title: string }[];

    const pipelines = await client.query(
      `
      INSERT INTO pipeline_runs (work_item_id, status, total_steps, completed_steps, started_at, created_at)
      VALUES
        ($1, 'RUNNING', 8, 2, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
        ($2, 'WAITING_APPROVAL', 8, 3, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
        ($3, 'DONE', 8, 8, NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),
        ($4, 'RUNNING', 8, 0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
      RETURNING id, work_item_id;
    `,
      [wiIds[0].id, wiIds[1].id, wiIds[2].id, wiIds[3].id]
    );

    const p = pipelines.rows as { id: number; work_item_id: number }[];
    const pByWi = new Map(p.map((row) => [row.work_item_id, row.id]));

    const pid = (title: string) => {
      const row = wiIds.find((x) => x.title === title);
      if (!row) throw new Error(`work item ${title}`);
      return pByWi.get(row.id)!;
    };

    const steps: Array<{
      pipelineId: number;
      workerKey: string;
      step_name: string;
      step_order: number;
      status: string;
      output?: string;
    }> = [];

    const P1 = pid('用户登录功能开发');
    steps.push(
      { pipelineId: P1, workerKey: 'AIA001', step_name: '需求分析 - 需求调研与确认', step_order: 1, status: 'DONE', output: 'PRD 与验收标准已确认。' },
      { pipelineId: P1, workerKey: 'EMP001', step_name: '方案设计 - 技术方案与接口草案', step_order: 2, status: 'DONE', output: '已通过内部评审。' },
      { pipelineId: P1, workerKey: 'EMP001', step_name: '方案设计 - 安全方案评审', step_order: 3, status: 'RUNNING' },
      { pipelineId: P1, workerKey: 'AIA002', step_name: '后端开发 - 用户与鉴权接口', step_order: 4, status: 'PENDING' },
      { pipelineId: P1, workerKey: 'AIA003', step_name: '前端开发 - 登录与回调页', step_order: 5, status: 'PENDING' },
      { pipelineId: P1, workerKey: 'EMP002', step_name: '接口联调 - 登录流程', step_order: 6, status: 'PENDING' },
      { pipelineId: P1, workerKey: 'AIA004', step_name: '自动化测试 - 登录与回归', step_order: 7, status: 'PENDING' },
      { pipelineId: P1, workerKey: 'EMP001', step_name: '修复验证 - 缺陷关闭', step_order: 8, status: 'PENDING' }
    );

    const P2 = pid('数据看板可视化');
    steps.push(
      { pipelineId: P2, workerKey: 'AIA001', step_name: '需求分析 - 指标与维度', step_order: 1, status: 'DONE', output: '指标字典 v1。' },
      { pipelineId: P2, workerKey: 'EMP004', step_name: '方案设计 - 原型与评审', step_order: 2, status: 'DONE', output: '原型已定稿。' },
      { pipelineId: P2, workerKey: 'AIA002', step_name: '后端开发 - 聚合查询 API', step_order: 3, status: 'DONE', output: '接口已联调通过。' },
      { pipelineId: P2, workerKey: 'AIA003', step_name: '前端开发 - 图表与筛选', step_order: 4, status: 'WAITING_APPROVAL', output: '待产品确认图表默认时间范围。' },
      { pipelineId: P2, workerKey: 'EMP002', step_name: '接口联调 - 大屏数据', step_order: 5, status: 'PENDING' },
      { pipelineId: P2, workerKey: 'AIA004', step_name: '自动化测试 - 看板用例', step_order: 6, status: 'PENDING' },
      { pipelineId: P2, workerKey: 'EMP001', step_name: '修复验证 - 体验问题', step_order: 7, status: 'PENDING' },
      { pipelineId: P2, workerKey: 'EMP004', step_name: '验收交付 - 培训与文档', step_order: 8, status: 'PENDING' }
    );

    const P3 = pid('API 网关性能优化');
    const p3Names = [
      '需求分析 - 性能基线',
      '方案设计 - 改造方案',
      '后端开发 - 缓存与限流',
      '前端开发 - 管理端配置',
      '接口联调 - 压测',
      '自动化测试 - 网关用例',
      '修复验证 - 压测问题',
      '验收交付 - 上线复盘',
    ];
    const p3Workers = ['AIA001', 'EMP001', 'AIA002', 'AIA003', 'EMP002', 'AIA004', 'EMP001', 'EMP004'];
    for (let i = 0; i < 8; i++) {
      steps.push({
        pipelineId: P3,
        workerKey: p3Workers[i],
        step_name: p3Names[i],
        step_order: i + 1,
        status: 'DONE',
        output: '已完成',
      });
    }

    const P4 = pid('移动端 H5 适配');
    steps.push(
      { pipelineId: P4, workerKey: 'AIA001', step_name: '需求分析 - 页面清单', step_order: 1, status: 'RUNNING' },
      { pipelineId: P4, workerKey: 'EMP005', step_name: '方案设计 - 视觉规范', step_order: 2, status: 'PENDING' },
      { pipelineId: P4, workerKey: 'AIA002', step_name: '后端开发 - 无', step_order: 3, status: 'SKIPPED', output: '本需求以前端为主，跳过后端步骤。' },
      { pipelineId: P4, workerKey: 'AIA003', step_name: '前端开发 - 响应式改造', step_order: 4, status: 'PENDING' },
      { pipelineId: P4, workerKey: 'EMP003', step_name: '接口联调 - 兼容性检查', step_order: 5, status: 'PENDING' },
      { pipelineId: P4, workerKey: 'AIA004', step_name: '自动化测试 - 多端快照', step_order: 6, status: 'PENDING' },
      { pipelineId: P4, workerKey: 'EMP003', step_name: '修复验证 - UI 走查', step_order: 7, status: 'PENDING' },
      { pipelineId: P4, workerKey: 'EMP004', step_name: '验收交付 - 走查签字', step_order: 8, status: 'PENDING' }
    );

    for (const s of steps) {
      const wid = w[s.workerKey];
      const isDone = s.status === 'DONE';
      const isRun = s.status === 'RUNNING';
      const isSkip = s.status === 'SKIPPED';
      const isWait = s.status === 'WAITING_APPROVAL';

      let startedSql = 'NULL';
      let completedSql = 'NULL';
      if (isDone || isSkip) {
        startedSql = `NOW() - INTERVAL '5 days'`;
        completedSql = `NOW() - INTERVAL '4 days'`;
      } else if (isRun) {
        startedSql = `NOW() - INTERVAL '45 minutes'`;
      } else if (isWait) {
        startedSql = `NOW() - INTERVAL '20 minutes'`;
      }

      await client.query(
        `
        INSERT INTO step_runs (
          pipeline_run_id, worker_id, step_name, step_order, status,
          output_url, error_message, started_at, completed_at, created_at
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, ${startedSql}, ${completedSql}, NOW()
        )
      `,
        [s.pipelineId, wid, s.step_name, s.step_order, s.status, s.output ?? null, null]
      );
    }

    await client.query('COMMIT');
    console.log('种子数据写入成功。');
    console.log('工作者:', workersRes.rows.length, '人');
    console.log('需求:', wiIds.length, '条');
    console.log('流水线:', p.length, '条');
    console.log('步骤:', steps.length, '条');
    console.log('\n示例：打开 /work-items/<id> 查看「用户登录功能开发」管道（需求 id 一般为 1）。');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
