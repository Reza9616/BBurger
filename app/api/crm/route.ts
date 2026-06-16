// app/api/crm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';
import sql from 'mssql';

// ==================== مدیریت مشتریان ====================

// GET - دریافت لیست مشتریان
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = await getDb();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // دریافت جزئیات یک مشتری
    if (type === 'customer' && id) {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT * FROM customers WHERE id = @id
        `);
      
      if (result.recordset.length === 0) {
        return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });
      }
      
      // دریافت تاریخچه سفارشات مشتری
      const ordersResult = await pool.request()
        .input('customer_id', sql.Int, id)
        .query(`
          SELECT * FROM orders 
          WHERE customer_id = @customer_id 
          ORDER BY created_at DESC
        `);
      
      return NextResponse.json({
        customer: result.recordset[0],
        orders: ordersResult.recordset
      });
    }

    // دریافت لیست همه مشتریان
    const result = await pool.request()
      .query(`
        SELECT * FROM customers 
        ORDER BY total_spent DESC, total_orders DESC
      `);
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('CRM Error:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات' }, { status: 500 });
  }
}

// POST - افزودن مشتری جدید
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, phone, email, address, notes } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ error: 'نام و شماره تماس الزامی است' }, { status: 400 });
    }

    const pool = await getDb();
    const customerCode = `CUS-${Date.now()}`;

    const result = await pool.request()
      .input('customer_code', sql.NVarChar, customerCode)
      .input('full_name', sql.NVarChar, fullName)
      .input('phone', sql.NVarChar, phone)
      .input('email', sql.NVarChar, email || null)
      .input('address', sql.NVarChar, address || null)
      .input('notes', sql.NVarChar, notes || null)
      .query(`
        INSERT INTO customers (customer_code, full_name, phone, email, address, notes)
        VALUES (@customer_code, @full_name, @phone, @email, @address, @notes);
        SELECT SCOPE_IDENTITY() as id;
      `);

    return NextResponse.json({ 
      success: true, 
      id: result.recordset[0].id,
      customerCode 
    });
  } catch (error) {
    console.error('Error adding customer:', error);
    return NextResponse.json({ error: 'خطا در افزودن مشتری' }, { status: 500 });
  }
}

// PUT - ویرایش مشتری
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, fullName, phone, email, address, notes, status, loyaltyPoints } = body;

    const pool = await getDb();
    await pool.request()
      .input('id', sql.Int, id)
      .input('full_name', sql.NVarChar, fullName)
      .input('phone', sql.NVarChar, phone)
      .input('email', sql.NVarChar, email)
      .input('address', sql.NVarChar, address)
      .input('notes', sql.NVarChar, notes)
      .input('status', sql.NVarChar, status)
      .input('loyalty_points', sql.Int, loyaltyPoints)
      .query(`
        UPDATE customers 
        SET full_name = @full_name,
            phone = @phone,
            email = @email,
            address = @address,
            notes = @notes,
            status = @status,
            loyalty_points = @loyalty_points
        WHERE id = @id
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'خطا در ویرایش مشتری' }, { status: 500 });
  }
}

// DELETE - حذف مشتری
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const pool = await getDb();
    
    // بررسی وجود سفارشات
    const ordersCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) as count FROM orders WHERE customer_id = @id');
    
    if (ordersCheck.recordset[0].count > 0) {
      // به جای حذف، غیرفعال کن
      await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE customers SET status = "inactive" WHERE id = @id');
      return NextResponse.json({ success: true, message: 'مشتری غیرفعال شد' });
    }
    
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM customers WHERE id = @id');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'خطا در حذف مشتری' }, { status: 500 });
  }
}