// app/api/admin/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser, unauthorizedResponse } from '../../../../lib/auth';
import sql from 'mssql';

export async function POST(request: NextRequest) {
  try {
    // بررسی احراز هویت
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // اعتبارسنجی
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'تمام فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'رمز عبور جدید و تکرار آن مطابقت ندارند' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور جدید باید حداقل 6 کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'رمز عبور جدید نباید با رمز قبلی یکسان باشد' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    // دریافت اطلاعات کاربر فعلی
    const userResult = await pool.request()
      .input('username', sql.NVarChar, user.username)
      .query('SELECT * FROM admins WHERE username = @username');

    if (userResult.recordset.length === 0) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    const admin = userResult.recordset[0];

    // بررسی رمز فعلی
    if (currentPassword !== admin.password_hash) {
      return NextResponse.json(
        { error: 'رمز عبور فعلی اشتباه است' },
        { status: 401 }
      );
    }

    // به روز رسانی رمز عبور
    await pool.request()
      .input('newPassword', sql.NVarChar, newPassword)
      .input('username', sql.NVarChar, user.username)
      .query('UPDATE admins SET password_hash = @newPassword WHERE username = @username');

    return NextResponse.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر کرد'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر رمز عبور' },
      { status: 500 }
    );
  }
}