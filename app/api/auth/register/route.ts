// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import sql from 'mssql';

export async function POST(request: NextRequest) {
    try {
        const { username, password, email, fullName } = await request.json();

        // اعتبارسنجی
        if (!username || !password) {
            return NextResponse.json(
                { error: 'نام کاربری و رمز عبور الزامی است' },
                { status: 400 }
            );
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: 'نام کاربری باید حداقل ۳ کاراکتر باشد' },
                { status: 400 }
            );
        }

        if (password.length < 4) {
            return NextResponse.json(
                { error: 'رمز عبور باید حداقل ۴ کاراکتر باشد' },
                { status: 400 }
            );
        }

        const pool = await getDb();
        
        // بررسی وجود کاربر تکراری
        const existingUser = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM admins WHERE username = @username');

        if (existingUser.recordset.length > 0) {
            return NextResponse.json(
                { error: 'این نام کاربری قبلاً ثبت شده است' },
                { status: 409 }
            );
        }

        // ثبت کاربر جدید
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password_hash', sql.NVarChar, password)
            .input('email', sql.NVarChar, email || null)
            .input('full_name', sql.NVarChar, fullName || null)
            .query(`
                INSERT INTO admins (username, password_hash, email, full_name, created_at)
                VALUES (@username, @password_hash, @email, @full_name, GETDATE())
            `);

        return NextResponse.json({ 
            success: true, 
            message: 'ثبت نام با موفقیت انجام شد. اکنون می‌توانید وارد شوید.' 
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'خطا در ثبت نام' },
            { status: 500 }
        );
    }
}