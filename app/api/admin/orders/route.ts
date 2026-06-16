// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import sql from 'mssql';

// GET - دریافت لیست سفارشات
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pool = await getDb();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    
    let query = `
      SELECT o.*, 
             c.full_name as customer_full_name,
             c.loyalty_points
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
    `;
    
    // اگر customer_id وجود داشته باشد، فقط سفارشات آن مشتری را برگردان
    if (customerId && customerId !== 'undefined' && customerId !== 'null' && customerId !== '') {
      query += ` WHERE o.customer_id = @customerId`;
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    // ابتدا request را تعریف کنید، سپس از آن استفاده کنید
    let dbRequest = pool.request();
    
    if (customerId && customerId !== 'undefined' && customerId !== 'null' && customerId !== '') {
      dbRequest = dbRequest.input('customerId', sql.Int, parseInt(customerId));
    }
    
    const result = await dbRequest.query(query);
    
    const orders = result.recordset.map(o => ({
      id: o.id,
      customerId: o.customer_id,
      customerName: o.customer_name,
      customerFullName: o.customer_full_name,
      customerPhone: o.customer_phone,
      address: o.address,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []),
      total: o.total,
      order_status: o.order_status,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      deliveryTime: o.delivery_time,
      note: o.note,
      createdAt: o.created_at,
      loyaltyPoints: o.loyalty_points
    }));
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'خطا در دریافت سفارشات' }, { status: 500 });
  }
}

// POST - ثبت سفارش جدید
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { customerName, customerPhone, address, items, total, note, paymentMethod, customerId } = body;
    
    const pool = await getDb();
    const orderId = `ORD-${Date.now()}`;
    
    let finalCustomerId = customerId;

    // اگر مشتری جدید است، ثبت نام کن
    if (!customerId && customerName && customerPhone) {
      const existingCustomer = await pool.request()
        .input('phone', sql.NVarChar, customerPhone)
        .query('SELECT id FROM customers WHERE phone = @phone');
      
      if (existingCustomer.recordset.length > 0) {
        finalCustomerId = existingCustomer.recordset[0].id;
      } else {
        const customerCode = `CUS-${Date.now()}`;
        const insertCustomer = await pool.request()
          .input('customer_code', sql.NVarChar, customerCode)
          .input('full_name', sql.NVarChar, customerName)
          .input('phone', sql.NVarChar, customerPhone)
          .input('address', sql.NVarChar, address)
          .query(`
            INSERT INTO customers (customer_code, full_name, phone, address, registered_date)
            VALUES (@customer_code, @full_name, @phone, @address, GETDATE());
            SELECT SCOPE_IDENTITY() as id;
          `);
        finalCustomerId = insertCustomer.recordset[0].id;
      }
    }
    
    await pool.request()
      .input('id', sql.NVarChar, orderId)
      .input('customer_id', sql.Int, finalCustomerId || null)
      .input('customer_name', sql.NVarChar, customerName)
      .input('customer_phone', sql.NVarChar, customerPhone)
      .input('address', sql.NVarChar, address)
      .input('items', sql.NVarChar, JSON.stringify(items))
      .input('total', sql.Int, total)
      .input('note', sql.NVarChar, note || '')
      .input('payment_method', sql.NVarChar, paymentMethod || 'cash')
      .input('order_status', sql.NVarChar, 'pending')
      .input('payment_status', sql.NVarChar, 'unpaid')
      .query(`
        INSERT INTO orders (id, customer_id, customer_name, customer_phone, address, items, total, note, payment_method, order_status, payment_status, created_at)
        VALUES (@id, @customer_id, @customer_name, @customer_phone, @address, @items, @total, @note, @payment_method, @order_status, @payment_status, GETDATE())
      `);
    
    return NextResponse.json({ success: true, orderId, customerId: finalCustomerId });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'خطا در ثبت سفارش' }, { status: 500 });
  }
}

// PUT - به‌روزرسانی سفارش
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, order_status, payment_status, delivery_time, note } = body;
    
    const pool = await getDb();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('order_status', sql.NVarChar, order_status)
      .input('payment_status', sql.NVarChar, payment_status)
      .input('delivery_time', sql.DateTime, delivery_time || null)
      .input('note', sql.NVarChar, note)
      .query(`
        UPDATE orders 
        SET order_status = @order_status,
            payment_status = @payment_status,
            delivery_time = @delivery_time,
            note = @note
        WHERE id = @id
      `);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی' }, { status: 500 });
  }
}

// DELETE - حذف سفارش
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
      .input('id', sql.NVarChar, id)
      .query('DELETE FROM orders WHERE id = @id');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'خطا در حذف سفارش' }, { status: 500 });
  }
}