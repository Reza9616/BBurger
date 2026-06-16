// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'فایلی انتخاب نشده است' }, { status: 400 });
    }

    // بررسی نوع فایل
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'فقط تصاویر مجاز هستند (JPEG, PNG, WebP)' }, { status: 400 });
    }

    // بررسی حجم فایل (حداکثر 2 مگابایت)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم تصویر نباید بیشتر از 2 مگابایت باشد' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ایجاد نام یکتا برای فایل
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // ایجاد پوشه اگر وجود ندارد
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // بازگرداندن آدرس تصویر
    const imageUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'خطا در آپلود تصویر' }, { status: 500 });
  }
}