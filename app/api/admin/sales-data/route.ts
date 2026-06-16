// app/api/admin/sales-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser, unauthorizedResponse } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    const pool = await getDb();
    let query = '';
    
    if (period === 'week') {
      query = `
        SELECT 
          FORMAT(created_at, 'yyyy-MM-dd') as date,
          DATEPART(dw, created_at) as dayOfWeek,
          SUM(total) as amount,
          COUNT(*) as orders
        FROM orders
        WHERE created_at >= DATEADD(DAY, -6, CAST(GETDATE() AS DATE))
        GROUP BY FORMAT(created_at, 'yyyy-MM-dd'), DATEPART(dw, created_at)
        ORDER BY date ASC
      `;
    } else if (period === 'month') {
      query = `
        SELECT 
          DAY(created_at) as day,
          FORMAT(created_at, 'yyyy-MM-dd') as date,
          SUM(total) as amount,
          COUNT(*) as orders
        FROM orders
        WHERE MONTH(created_at) = MONTH(GETDATE())
        AND YEAR(created_at) = YEAR(GETDATE())
        GROUP BY DAY(created_at), FORMAT(created_at, 'yyyy-MM-dd')
        ORDER BY day ASC
      `;
    } else {
      query = `
        SELECT 
          MONTH(created_at) as month,
          SUM(total) as amount,
          COUNT(*) as orders
        FROM orders
        WHERE YEAR(created_at) = YEAR(GETDATE())
        GROUP BY MONTH(created_at)
        ORDER BY month ASC
      `;
    }
    
    const result = await pool.request().query(query);
    
    // فرمت کردن داده‌ها برای نمودار
    const monthNames: Record<number, string> = {
      1: 'فروردین', 2: 'اردیبهشت', 3: 'خرداد', 4: 'تیر', 5: 'مرداد', 6: 'شهریور',
      7: 'مهر', 8: 'آبان', 9: 'آذر', 10: 'دی', 11: 'بهمن', 12: 'اسفند'
    };
    
    const dayNames: Record<number, string> = {
      1: 'شنبه', 2: 'یکشنبه', 3: 'دوشنبه', 4: 'سه‌شنبه', 5: 'چهارشنبه', 6: 'پنجشنبه', 7: 'جمعه'
    };
    
    let formattedData = [];
    if (period === 'week') {
      formattedData = result.recordset.map(row => ({
        name: dayNames[row.dayOfWeek] || row.dayOfWeek,
        فروش: Math.round(row.amount),
        تعداد: row.orders
      }));
    } else if (period === 'month') {
      formattedData = result.recordset.map(row => ({
        name: `${row.day}`,
        فروش: Math.round(row.amount),
        تعداد: row.orders
      }));
    } else {
      formattedData = result.recordset.map(row => ({
        name: monthNames[row.month] || row.month,
        فروش: Math.round(row.amount),
        تعداد: row.orders
      }));
    }
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Sales data API error:', error);
    return NextResponse.json([]);
  }
}