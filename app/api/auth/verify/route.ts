// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // دکد کردن توکن
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // بررسی انقضا
    if (decoded.exp && decoded.exp < Date.now()) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        username: decoded.username,
        role: decoded.role || 'admin'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}