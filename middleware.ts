// middleware.ts - نسخه غیرفعال (موقت)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // فعلاً همه درخواست‌ها را اجازه بده
  return NextResponse.next();
}

export const config = {
  matcher: [],
};