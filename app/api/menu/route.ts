// app/api/menu/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import sql from 'mssql';

export async function GET() {
  try {
    const pool = await getDb();
    
    const result = await pool.request()
      .query('SELECT * FROM products WHERE in_stock = 1');
    
    const products = result.recordset.map(p => {
      // دیباگ: مقدار اصلی in_stock را ببینید
      console.log('Raw in_stock value:', p.in_stock, 'Type:', typeof p.in_stock);
      
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        desc: p.description,
        image: p.image_url,
        badge: p.badge_text,
        badgeIcon: p.badge_icon,
        category: p.category,
        // اصلاح: تبدیل صحیح به boolean
        inStock: p.in_stock === 1 || p.in_stock === true || p.in_stock === '1'
      };
    });
    
    console.log('Products with inStock true:', products.filter(p => p.inStock).length);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json([], { status: 500 });
  }
}