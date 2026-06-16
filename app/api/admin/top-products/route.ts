// app/api/admin/top-products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser, unauthorizedResponse } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const pool = await getDb();
    
    // دریافت تمام سفارشات با آیتم‌ها
    const ordersResult = await pool.request().query(`
      SELECT id, items, total
      FROM orders
      WHERE items IS NOT NULL
      ORDER BY created_at DESC
    `);
    
    // پردازش JSON آیتم‌ها
    const productSales: Record<string, { quantity: number; revenue: number }> = {};
    
    for (const order of ordersResult.recordset) {
      try {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        if (Array.isArray(items)) {
          for (const item of items) {
            const productName = item.name;
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            
            if (!productSales[productName]) {
              productSales[productName] = { quantity: 0, revenue: 0 };
            }
            productSales[productName].quantity += quantity;
            productSales[productName].revenue += price * quantity;
          }
        }
      } catch (e) {
        console.error('Error parsing items for order:', order.id, e);
      }
    }
    
    // تبدیل به آرایه و مرتب‌سازی
    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ 
        name, 
        quantity: data.quantity, 
        revenue: data.revenue 
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    if (topProducts.length === 0) {
      // داده‌های نمونه اگر هیچ سفارشی نبود
      return NextResponse.json([
        { name: 'برگر مخصوص', quantity: 0, revenue: 0 },
        { name: 'برگر چیز', quantity: 0, revenue: 0 },
        { name: 'سیب‌زمینی سرخ کرده', quantity: 0, revenue: 0 }
      ]);
    }
    
    return NextResponse.json(topProducts);
  } catch (error) {
    console.error('Top products API error:', error);
    return NextResponse.json([]);
  }
}