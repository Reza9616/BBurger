// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../..//..//../lib/db';
import sql from 'mssql';

// کلید مخفی برای ریست (در محیط واقعی از env استفاده کنید)
const RESET_SECRET = 'burger-fire-reset-key-2024';

export async function POST(request: NextRequest) {
    try {
        const { secretKey, username, newPassword } = await request.json();

        // بررسی کلید ریست
        if (secretKey !== RESET_SECRET) {
            return NextResponse.json(
                { error: 'کلید ریست نامعتبر است' },
                { status: 401 }
            );
        }

        if (!username || !newPassword) {
            return NextResponse.json(
                { error: 'نام کاربری و رمز عبور جدید الزامی است' },
                { status: 400 }
            );
        }

        if (newPassword.length < 4) {
            return NextResponse.json(
                { error: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد' },
                { status: 400 }
            );
        }

        const pool = await getDb();
        
        // بررسی وجود کاربر
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM admins WHERE username = @username');

        if (result.recordset.length === 0) {
            return NextResponse.json(
                { error: 'کاربر یافت نشد' },
                { status: 404 }
            );
        }

        // آپدیت رمز جدید
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('newPassword', sql.NVarChar, newPassword)
            .query('UPDATE admins SET password_hash = @newPassword WHERE username = @username');

        return NextResponse.json({ 
            success: true, 
            message: `رمز عبور کاربر ${username} با موفقیت تغییر یافت` 
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'خطا در ریست رمز عبور' },
            { status: 500 }
        );
    }
}