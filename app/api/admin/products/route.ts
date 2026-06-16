// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../..//lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import sql from 'mssql';

// GET - دریافت محصولات
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = await getDb();
    const result = await pool.request()
      .query('SELECT * FROM products ORDER BY created_at DESC');
    
    const products = result.recordset.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      desc: p.description,
      image: p.image_url,
      badge: p.badge,
      category: p.category,
      inStock: p.in_stock === 1 || p.in_stock === true
    }));
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'خطا در دریافت محصولات' }, { status: 500 });
  }
}

// POST - افزودن محصول جدید
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, price, desc, image, badge, category, inStock } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: 'نام و قیمت محصول الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getDb();
    const id = Date.now().toString();
    
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('price', sql.Int, price)
      .input('description', sql.NVarChar, desc || '')
      .input('image_url', sql.NVarChar, image || '')
      .input('badge', sql.NVarChar, badge || null)
      .input('category', sql.NVarChar, category)
      .input('in_stock', sql.Bit, inStock ? 1 : 0)
      .query(`
        INSERT INTO products (id, name, price, description, image_url, badge, category, in_stock, created_at)
        VALUES (@id, @name, @price, @description, @image_url, @badge, @category, @in_stock, GETDATE())
      `);
    
    return NextResponse.json({ success: true, message: 'محصول با موفقیت اضافه شد' });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'خطا در افزودن محصول' }, { status: 500 });
  }
}

// PUT - ویرایش محصول (شامل تغییر موجودی)
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, price, desc, image, badge, category, inStock } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'آیدی و نام محصول الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getDb();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('price', sql.Int, price)
      .input('description', sql.NVarChar, desc || '')
      .input('image_url', sql.NVarChar, image || '')
      .input('badge', sql.NVarChar, badge || null)
      .input('category', sql.NVarChar, category)
      .input('in_stock', sql.Bit, inStock ? 1 : 0)
      .query(`
        UPDATE products 
        SET name = @name,
            price = @price,
            description = @description,
            image_url = @image_url,
            badge = @badge,
            category = @category,
            in_stock = @in_stock,
            updated_at = GETDATE()
        WHERE id = @id
      `);
    
    return NextResponse.json({ success: true, message: 'محصول با موفقیت ویرایش شد' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'خطا در ویرایش محصول' }, { status: 500 });
  }
}

// DELETE - حذف محصول
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'آیدی محصول الزامی است' }, { status: 400 });
    }
    
    const pool = await getDb();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query('DELETE FROM products WHERE id = @id');
    
    return NextResponse.json({ success: true, message: 'محصول با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'خطا در حذف محصول' }, { status: 500 });
  }
}