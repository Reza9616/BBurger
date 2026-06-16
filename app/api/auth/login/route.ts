// app/api/auth/login/route.ts - نسخه اصلاح شده
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import sql from 'mssql';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    const pool = await getDb();
    
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM admins WHERE username = @username');

    const users = result.recordset;
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    const admin = users[0];
    
    // مقایسه رمز
    if (password !== admin.password_hash) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // ساخت توکن
    const tokenData = { 
      id: admin.id,
      username: admin.username, 
      role: admin.role,
      exp: Date.now() + 24 * 60 * 60 * 1000 
    };
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    // ایجاد پاسخ
    const response = NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        role: admin.role,
      },
    });

    // ست کردن کوکی با تنظیمات صحیح
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // در development false باشه
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 ساعت
      path: '/',
    });

    console.log('✅ Login successful, token set for user:', admin.username);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'خطا در سرور' },
      { status: 500 }
    );
  }
}