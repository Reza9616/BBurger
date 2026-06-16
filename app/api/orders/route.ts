// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../..//lib/db';
import sql from 'mssql';

// پیدا کردن یا ایجاد مشتری
async function findOrCreateCustomer(pool: any, name: string, phone: string, address: string): Promise<number> {
  // بررسی وجود مشتری با این شماره
  const existingCustomer = await pool.request()
    .input('phone', sql.NVarChar, phone)
    .query('SELECT id, full_name FROM customers WHERE phone = @phone');
  
  if (existingCustomer.recordset.length > 0) {
    const customerId = existingCustomer.recordset[0].id;
    return customerId;
  }
  
  // ایجاد مشتری جدید
  const customerCode = `CUS-${Date.now()}`;
  const newCustomer = await pool.request()
    .input('customer_code', sql.NVarChar, customerCode)
    .input('full_name', sql.NVarChar, name)
    .input('phone', sql.NVarChar, phone)
    .input('address', sql.NVarChar, address)
    .query(`
      INSERT INTO customers (customer_code, full_name, phone, address, registered_date)
      VALUES (@customer_code, @full_name, @phone, @address, GETDATE());
      SELECT SCOPE_IDENTITY() as id;
    `);
  
  return newCustomer.recordset[0].id;
}

// POST - ثبت سفارش جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, address, items, total, note, paymentMethod } = body;

    if (!customerName || !customerPhone || !address || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'لطفاً تمام اطلاعات را وارد کنید' },
        { status: 400 }
      );
    }

    const pool = await getDb();
    const orderId = `ORD-${Date.now()}`;
    
    // پیدا کردن یا ایجاد مشتری
    const customerId = await findOrCreateCustomer(pool, customerName, customerPhone, address);
    
    // ثبت سفارش
    await pool.request()
      .input('id', sql.NVarChar, orderId)
      .input('customer_id', sql.Int, customerId)
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
    
    return NextResponse.json({ 
      success: true, 
      orderId,
      message: 'سفارش شما با موفقیت ثبت شد!'
    });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت سفارش' },
      { status: 500 }
    );
  }
}