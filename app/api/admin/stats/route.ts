// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser, unauthorizedResponse } from '../../../../lib/auth';
import sql from 'mssql';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const pool = await getDb();
    
    // کل سفارشات و درآمد
    const ordersResult = await pool.request().query(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(total) as totalRevenue,
        SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pendingOrders
      FROM orders
    `);
    
    // تعداد محصولات
    const productsResult = await pool.request().query(`
      SELECT COUNT(*) as totalProducts FROM products
    `);
    
    // تعداد مشتریان
    const customersResult = await pool.request().query(`
      SELECT COUNT(*) as totalCustomers FROM customers
    `);
    
    // فروش ماه جاری
    const monthlyResult = await pool.request().query(`
      SELECT ISNULL(SUM(total), 0) as monthlyRevenue
      FROM orders
      WHERE MONTH(created_at) = MONTH(GETDATE())
      AND YEAR(created_at) = YEAR(GETDATE())
    `);
    
    // میانگین ارزش سفارش
    const avgResult = await pool.request().query(`
      SELECT ISNULL(AVG(total), 0) as averageOrderValue FROM orders
    `);
    
    // نرخ رشد (مقایسه با ماه قبل)
    const growthResult = await pool.request().query(`
      WITH MonthlySales AS (
        SELECT 
          YEAR(created_at) as yr,
          MONTH(created_at) as mn,
          SUM(total) as sales
        FROM orders
        WHERE created_at >= DATEADD(MONTH, -2, GETDATE())
        GROUP BY YEAR(created_at), MONTH(created_at)
      )
      SELECT 
        ISNULL(CASE 
          WHEN LAG(sales) OVER (ORDER BY yr DESC, mn DESC) = 0 THEN 100
          ELSE ((sales - LAG(sales) OVER (ORDER BY yr DESC, mn DESC)) * 100.0 / LAG(sales) OVER (ORDER BY yr DESC, mn DESC))
        END, 0) as growthRate
      FROM MonthlySales
      ORDER BY yr DESC, mn DESC
      OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
    `);
    
    const stats = {
      totalOrders: ordersResult.recordset[0]?.totalOrders || 0,
      totalRevenue: ordersResult.recordset[0]?.totalRevenue || 0,
      totalProducts: productsResult.recordset[0]?.totalProducts || 0,
      totalCustomers: customersResult.recordset[0]?.totalCustomers || 0,
      pendingOrders: ordersResult.recordset[0]?.pendingOrders || 0,
      monthlyRevenue: monthlyResult.recordset[0]?.monthlyRevenue || 0,
      averageOrderValue: Math.floor(avgResult.recordset[0]?.averageOrderValue || 0),
      growthRate: Math.round(growthResult.recordset[0]?.growthRate || 0)
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalCustomers: 0,
      pendingOrders: 0,
      monthlyRevenue: 0,
      averageOrderValue: 0,
      growthRate: 0
    });
  }
}