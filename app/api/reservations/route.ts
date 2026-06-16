// app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../..//lib/db';
import sql from 'mssql';

function gregorianToShamsi(gregorianDate: string): string {
  const date = new Date(gregorianDate);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

async function findOrCreateCustomer(pool: any, name: string, phone: string): Promise<number> {
  const existingCustomer = await pool.request()
    .input('phone', sql.NVarChar, phone)
    .query('SELECT id FROM customers WHERE phone = @phone');
  
  if (existingCustomer.recordset.length > 0) {
    return existingCustomer.recordset[0].id;
  }
  
  const customerCode = `CUS-${Date.now()}`;
  const newCustomer = await pool.request()
    .input('customer_code', sql.NVarChar, customerCode)
    .input('full_name', sql.NVarChar, name)
    .input('phone', sql.NVarChar, phone)
    .query(`
      INSERT INTO customers (customer_code, full_name, phone, registered_date)
      VALUES (@customer_code, @full_name, @phone, GETDATE());
      SELECT SCOPE_IDENTITY() as id;
    `);
  
  return newCustomer.recordset[0].id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, date, guests, notes } = body;

    if (!name || !phone || !date || !guests) {
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    const pool = await getDb();
    const customerId = await findOrCreateCustomer(pool, name, phone);
    
    await pool.request()
      .input('customer_id', sql.Int, customerId)
      .input('full_name', sql.NVarChar, name)
      .input('phone', sql.NVarChar, phone)
      .input('reservation_date', sql.Date, new Date(date))
      .input('shamsi_date', sql.NVarChar, gregorianToShamsi(date))
      .input('guests', sql.NVarChar, guests)
      .input('notes', sql.NVarChar, notes || '')
      .input('reservation_status', sql.NVarChar, 'pending')
      .query(`
        INSERT INTO reservations (customer_id, full_name, phone, reservation_date, shamsi_date, guests, notes, reservation_status, created_at)
        VALUES (@customer_id, @full_name, @phone, @reservation_date, @shamsi_date, @guests, @notes, @reservation_status, GETDATE())
      `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'رزرو شما با موفقیت ثبت شد!'
    });
  } catch (error) {
    console.error('Reservation error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت رزرو' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const pool = await getDb();
    const result = await pool.request().query(`
      SELECT r.*, 
             c.total_orders, 
             c.total_spent,
             c.loyalty_points
      FROM reservations r
      LEFT JOIN customers c ON r.customer_id = c.id
      ORDER BY r.reservation_date DESC
    `);
    
    const reservations = result.recordset.map(r => ({
      id: r.id,
      customerId: r.customer_id,
      name: r.full_name,
      phone: r.phone,
      date: r.shamsi_date,
      guests: r.guests,
      notes: r.notes,
      status: r.reservation_status,
      createdAt: r.created_at,
      customerStats: {
        totalOrders: r.total_orders || 0,
        totalSpent: r.total_spent || 0,
        loyaltyPoints: r.loyalty_points || 0
      }
    }));
    
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'خطا در دریافت رزروها' }, { status: 500 });
  }
}