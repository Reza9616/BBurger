// app/api/admin/crm/send-sms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { getCurrentUser, unauthorizedResponse } from '../../../../../lib/auth';
import sql from 'mssql';

type Customer = {
  id: number;
  full_name: string;
  phone: string;
};

type MessageResult = {
  id: number;
};

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { customerIds, message, subject, scheduleDate, isBulk } = body;

    // اعتبارسنجی
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'متن پیام الزامی است' },
        { status: 400 }
      );
    }

    if (!isBulk && (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0)) {
      return NextResponse.json(
        { error: 'حداقل یک گیرنده باید انتخاب شود' },
        { status: 400 }
      );
    }

    const pool = await getDb();
    let customers: Customer[] = [];

    // دریافت لیست مشتریان
    if (isBulk && !customerIds) {
      // ارسال به همه مشتریان فعال
      const result = await pool.request().query(`
        SELECT id, full_name, phone 
        FROM customers 
        WHERE customer_status = 'active' 
        AND phone IS NOT NULL 
        AND phone != ''
      `);
      customers = result.recordset as Customer[];
    } else if (customerIds && Array.isArray(customerIds) && customerIds.length > 0) {
      // ارسال به مشتریان انتخاب شده
      const placeholders = customerIds.map(() => '?').join(',');
      const result = await pool.request().query(`
        SELECT id, full_name, phone 
        FROM customers 
        WHERE id IN (${customerIds.join(',')})
        AND phone IS NOT NULL 
        AND phone != ''
      `);
      customers = result.recordset as Customer[];
    }

    if (customers.length === 0) {
      return NextResponse.json(
        { error: 'هیچ مشتری معتبری با شماره تماس یافت نشد' },
        { status: 400 }
      );
    }

    // ثبت پیام اصلی در دیتابیس
    const messageResult = await pool.request()
      .input('message_type', sql.NVarChar, 'sms')
      .input('subject', sql.NVarChar, subject || 'پیام از طرف بی‌برگر')
      .input('content', sql.NVarChar, message)
      .input('status', sql.NVarChar, scheduleDate ? 'pending' : 'sent')
      .input('sent_at', sql.DateTime, scheduleDate ? null : new Date())
      .input('created_by', sql.NVarChar, user.username)
      .query(`
        INSERT INTO messages (message_type, subject, content, status, sent_at, created_by, created_at)
        OUTPUT INSERTED.id
        VALUES (@message_type, @subject, @content, @status, @sent_at, @created_by, GETDATE())
      `);

    const messageId = (messageResult.recordset[0] as MessageResult)?.id;
    
    if (!messageId) {
      throw new Error('Failed to create message record');
    }

    // ارسال پیام به هر مشتری
    let sentCount = 0;
    let failedCount = 0;

    for (const customer of customers) {
      try {
        // شبیه‌سازی ارسال پیامک
        console.log(`📱 Sending SMS to ${customer.phone} (${customer.full_name}): ${message}`);
        
        // به‌روزرسانی وضعیت پیام برای هر مشتری
        await pool.request()
          .input('message_id', sql.Int, messageId)
          .input('customer_id', sql.Int, customer.id)
          .input('customer_phone', sql.NVarChar, customer.phone)
          .input('status', sql.NVarChar, 'sent')
          .query(`
            UPDATE messages 
            SET customer_id = @customer_id,
                customer_code = @customer_phone,
                status = @status,
                sent_at = GETDATE()
            WHERE id = @message_id
          `);
        
        sentCount++;
        
        // TODO: در اینجا می‌توانید سرویس واقعی ارسال پیامک را اضافه کنید
        // مثال: استفاده از API کاوه‌نگار
        /*
        const smsResponse = await fetch('https://api.kavenegar.com/v1/.../sms/send.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receptor: customer.phone,
            message: message,
            sender: '10004346'
          })
        });
        */
        
      } catch (err) {
        console.error(`Failed to send SMS to ${customer.phone}:`, err);
        failedCount++;
        
        // ثبت خطا
        await pool.request()
          .input('message_id', sql.Int, messageId)
          .input('customer_id', sql.Int, customer.id)
          .input('error_msg', sql.NVarChar, String(err))
          .query(`
            UPDATE messages 
            SET customer_id = @customer_id,
                status = 'failed',
                notes = @error_msg
            WHERE id = @message_id
          `);
      }
    }

    return NextResponse.json({
      success: true,
      message: `پیام با موفقیت به ${sentCount} نفر ارسال شد${failedCount > 0 ? ` (${failedCount} نفر ناموفق)` : ''}`,
      sentCount,
      failedCount,
      totalCount: customers.length
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال پیام: ' + (error instanceof Error ? error.message : 'خطای ناشناخته') },
      { status: 500 }
    );
  }
}