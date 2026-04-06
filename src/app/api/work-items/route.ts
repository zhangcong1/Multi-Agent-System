import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET: 获取需求列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const ownerId = searchParams.get('owner_id');

    let query = client
      .from('work_items')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        updated_at,
        owner_id
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (ownerId) {
      query = query.eq('owner_id', parseInt(ownerId, 10));
    }

    const { data: workItems, error: workItemsError } = await query;

    if (workItemsError) {
      throw new Error(`查询需求失败: ${workItemsError.message}`);
    }

    // 获取所有员工信息
    const ownerIds = [...new Set((workItems || []).map((item) => item.owner_id))];
    let owners: Array<{ id: number; employee_id: string; name: string; position: string }> = [];
    
    if (ownerIds.length > 0) {
      const { data: ownersData, error: ownersError } = await client
        .from('workers')
        .select('id, employee_id, name, position')
        .in('id', ownerIds);

      if (ownersError) {
        throw new Error(`查询员工失败: ${ownersError.message}`);
      }
      owners = ownersData || [];
    }

    // 组装数据
    const ownersMap = new Map(owners.map((o) => [o.id, o]));
    const data = (workItems || []).map((item) => ({
      ...item,
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

// POST: 创建新需求
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { title, description, owner_id } = body;

    if (!title || !owner_id) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段: title, owner_id' },
        { status: 400 }
      );
    }

    // 创建需求
    const { data: workItem, error: workItemError } = await client
      .from('work_items')
      .insert({
        title,
        description,
        owner_id,
        status: 'RUNNING',
      })
      .select()
      .single();

    if (workItemError) {
      throw new Error(`创建需求失败: ${workItemError.message}`);
    }

    // 创建对应的流水线
    const { data: pipelineRun, error: pipelineError } = await client
      .from('pipeline_runs')
      .insert({
        work_item_id: workItem.id,
        status: 'RUNNING',
        total_steps: 0,
        completed_steps: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pipelineError) {
      throw new Error(`创建流水线失败: ${pipelineError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        workItem,
        pipelineRun,
      },
    });
  } catch (error) {
    console.error('创建需求失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
