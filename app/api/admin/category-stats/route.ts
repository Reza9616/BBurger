// app/api/admin/category-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser, unauthorizedResponse } from '../../../../lib/auth';

type ProductRecord = {
  name: string;
  count: number;
  revenue: number;
};

type CategoryItem = {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
};

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const pool = await getDb();
    
    // دریافت محصولات با دسته‌بندی
    const productsResult = await pool.request().query(`
      SELECT 
        CASE 
          WHEN category IS NULL OR category = '' THEN 'متفرقه'
          ELSE category
        END as name,
        COUNT(*) as count,
        SUM(price * ISNULL(sales_count, 0)) as revenue
      FROM products
      GROUP BY CASE 
        WHEN category IS NULL OR category = '' THEN 'متفرقه'
        ELSE category
      END
    `);
    
    // محاسبه کل درآمد برای درصد - اصلاح شده با TypeScript
    const totalRevenue = productsResult.recordset.reduce((sum: number, item: ProductRecord) => sum + (item.revenue || 0), 0);
    
    // نام‌های فارسی دسته‌بندی
    const categoryNames: Record<string, string> = {
      'burgers': 'برگرها',
      'drinks': 'نوشیدنی‌ها',
      'sides': 'پیش غذاها',
      'desserts': 'دسرها',
      'متفرقه': 'متفرقه'
    };
    
    const categories: CategoryItem[] = productsResult.recordset.map((item: ProductRecord) => ({
      name: categoryNames[item.name] || item.name,
      count: item.count,
      revenue: item.revenue || 0,
      percentage: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0
    }));
    
    if (categories.length === 0) {
      return NextResponse.json([
        { name: 'برگرها', count: 0, revenue: 0, percentage: 0 },
        { name: 'نوشیدنی‌ها', count: 0, revenue: 0, percentage: 0 },
        { name: 'پیش غذاها', count: 0, revenue: 0, percentage: 0 }
      ]);
    }
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Category stats API error:', error);
    return NextResponse.json([]);
  }
}