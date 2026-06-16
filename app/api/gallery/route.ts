// app/api/gallery/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await getDb();
    const result = await pool.request()
      .query('SELECT * FROM gallery WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC');
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json([], { status: 500 });
  }
}