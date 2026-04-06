import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface OwnerData {
  id: number;
  employee_id: string;
  name: string;
  position: string;
}

export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const limitRaw = searchParams.get('limit');
    const limit =
      limitRaw !== null && limitRaw !== '' ? parseInt(limitRaw, 10) : NaN;

    let query = client
      .from('work_items')
      .select('id, title, description, status, created_at, owner_id')
      .order('created_at', { ascending: false });

    if (!Number.isNaN(limit) && limit > 0) {
      query = query.limit(Math.min(limit, 100));
    }

    const { data: workItems, error: workItemsError } = await query;

    if (workItemsError) {
      throw new Error(`查询需求失败: ${workItemsError.message}`);
    }

    if (!workItems || workItems.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 获取所有负责人信息
    const ownerIds = [...new Set(workItems.map((item) => item.owner_id))];
    const { data: owners, error: ownersError } = await client
      .from('workers')
      .select('id, employee_id, name, position')
      .in('id', ownerIds);

    if (ownersError) {
      throw new Error(`查询负责人失败: ${ownersError.message}`);
    }

    const ownersMap = new Map<number, OwnerData>();
    (owners || []).forEach((o) => ownersMap.set(o.id, o as OwnerData));

    // 组装数据
    const data = workItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      created_at: item.created_at,
      owner: ownersMap.get(item.owner_id) || null,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('获取需求列表失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
