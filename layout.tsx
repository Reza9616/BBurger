import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'بی برگر | طعم واقعی برگر',
  description: 'بهترین برگر شهر اینجاست! گوشت ۱۰۰٪ خالص گاو، سس‌های دست‌ساز و نان‌های تازه',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="antialiased font-sans bg-dark-bg text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}