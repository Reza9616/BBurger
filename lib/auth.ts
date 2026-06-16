// lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';

export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // بررسی انقضا
    if (decoded.exp && decoded.exp < Date.now()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { 
      error: 'Unauthorized', 
      message: 'لطفاً وارد شوید',
      redirect: '/login'
    },
    { status: 401 }
  );
}

// برای سازگاری با کدهای قبلی
export async function getCurrentUser(request: NextRequest) {
  return await verifyAuth(request);
}