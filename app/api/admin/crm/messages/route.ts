// app/api/admin/crm/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { getCurrentUser, unauthorizedResponse } from '../../../../../lib/auth';
import sql from 'mssql';
type Message = {
  id: number;
  customer_id: number | null;
  customer_code: string | null;
  message_type: string;
  subject: string | null;
  content: string;
  status: string;
  sent_at: Date | null;
  created_by: string;
  created_at: Date;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
};

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  const type = searchParams.get('type') || 'all';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const pool = await getDb();
    let query = `
      SELECT 
        m.*,
        c.full_name as customer_name,
        c.phone as customer_phone
      FROM messages m
      LEFT JOIN customers c ON m.customer_id = c.id
      WHERE 1=1
    `;

    const requestParams: any[] = [];

    if (customerId && !isNaN(parseInt(customerId))) {
      query += ` AND m.customer_id = @customerId`;
      requestParams.push({ name: 'customerId', value: parseInt(customerId) });
    }
    
    if (type !== 'all') {
      query += ` AND m.message_type = @type`;
      requestParams.push({ name: 'type', value: type });
    }

    query += ` ORDER BY m.created_at DESC OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
    requestParams.push({ name: 'limit', value: limit });

    let req = pool.request();
    for (const param of requestParams) {
      req = req.input(param.name, param.value);
    }
    
    const result = await req.query(query);
    const messages = result.recordset as Message[];
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json([]);
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('id');

  if (!messageId) {
    return NextResponse.json(
      { error: 'شناسه پیام الزامی است' },
      { status: 400 }
    );
  }

  try {
    const pool = await getDb();
    await pool.request()
      .input('id', sql.Int, parseInt(messageId))
      .query('DELETE FROM messages WHERE id = @id');
    
    return NextResponse.json({ success: true, message: 'پیام با موفقیت حذف شد' });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف پیام' },
      { status: 500 }
    );
  }
}