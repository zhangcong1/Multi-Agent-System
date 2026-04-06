import { config } from 'dotenv';
import { execSync } from 'node:child_process';

config();

/**
 * 使用 drizzle-kit 将 schema 推送到 Postgres（Supabase）。
 * 需配置 COZE_DATABASE_URL 或 DATABASE_URL（建议使用直连 5432 的 URI）。
 */
export async function ensureDatabaseSchema(): Promise<void> {
  const url = process.env.COZE_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.warn(
      '[spark-db] 未设置 COZE_DATABASE_URL：跳过表结构同步。请在 .env 中填写 Supabase Database 连接 URI。',
    );
    return;
  }

  console.log('[spark-db] 正在同步表结构到 PostgreSQL…');
  try {
    execSync('pnpm exec drizzle-kit push --force', {
      stdio: 'inherit',
      env: { ...process.env, COZE_DATABASE_URL: url, DATABASE_URL: url },
      cwd: process.cwd(),
    });
  } catch {
    throw new Error('drizzle-kit push 失败，请检查 COZE_DATABASE_URL 是否为直连字符串且密码正确');
  }
  console.log('[spark-db] 表结构同步完成');
}
