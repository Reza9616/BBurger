// app/api/admin/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import sql from 'mssql';

// GET - دریافت لیست تصاویر گالری
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = await getDb();
    const result = await pool.request()
      .query('SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC');
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ error: 'خطا در دریافت تصاویر' }, { status: 500 });
  }
}

// POST - افزودن تصویر جدید
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { image_url, title, location, author, display_order } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'آدرس تصویر الزامی است' }, { status: 400 });
    }

    const pool = await getDb();
    await pool.request()
      .input('image_url', sql.NVarChar, image_url)
      .input('title', sql.NVarChar, title || '')
      .input('location', sql.NVarChar, location || '')
      .input('author', sql.NVarChar, author || '@user')
      .input('display_order', sql.Int, display_order || 0)
      .query(`
        INSERT INTO gallery (image_url, title, location, author, display_order, created_at)
        VALUES (@image_url, @title, @location, @author, @display_order, GETDATE())
      `);

    return NextResponse.json({ success: true, message: 'تصویر با موفقیت اضافه شد' });
  } catch (error) {
    console.error('Error adding gallery image:', error);
    return NextResponse.json({ error: 'خطا در افزودن تصویر' }, { status: 500 });
  }
}

// PUT - ویرایش تصویر
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, image_url, title, location, author, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'آیدی الزامی است' }, { status: 400 });
    }

    const pool = await getDb();
    await pool.request()
      .input('id', sql.Int, id)
      .input('image_url', sql.NVarChar, image_url)
      .input('title', sql.NVarChar, title || '')
      .input('location', sql.NVarChar, location || '')
      .input('author', sql.NVarChar, author || '')
      .input('display_order', sql.Int, display_order || 0)
      .input('is_active', sql.Bit, is_active !== undefined ? (is_active ? 1 : 0) : 1)
      .query(`
        UPDATE gallery 
        SET image_url = @image_url,
            title = @title,
            location = @location,
            author = @author,
            display_order = @display_order,
            is_active = @is_active,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    return NextResponse.json({ success: true, message: 'تصویر با موفقیت ویرایش شد' });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    return NextResponse.json({ error: 'خطا در ویرایش تصویر' }, { status: 500 });
  }
}

// DELETE - حذف تصویر
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'آیدی الزامی است' }, { status: 400 });
    }

    const pool = await getDb();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM gallery WHERE id = @id');

    return NextResponse.json({ success: true, message: 'تصویر با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json({ error: 'خطا در حذف تصویر' }, { status: 500 });
  }
}