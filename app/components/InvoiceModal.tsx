// app/components/InvoiceModal.tsx
'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  note?: string;
};

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

// کامپوننت فاکتور برای پرینت
const InvoiceContent = ({ order }: { order: Order }) => {
  const getDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fa-IR');
  };

  const getTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fa-IR');
  };

  return (
    <div style={{
      width: '80mm',
      margin: '0 auto',
      padding: '4mm',
      background: 'white',
      fontFamily: 'Tahoma, Vazir, sans-serif',
      direction: 'rtl',
      fontSize: '10px',
      color: '#000000'
    }}>
      {/* هدر - با گرادینت قرمز اما فونت مشکی */}
      <div style={{
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        padding: '10px',
        textAlign: 'center',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>🍔 بی‌برگر</div>
        <div style={{ fontSize: '10px', color: '#ffe0e0' }}>BURGER FIRE</div>
        <div style={{ fontSize: '8px', color: '#ffc0c0', marginTop: '4px' }}>
          نیشابور، خیابان امام خمینی | تلفن: ۰۵۱-۳۲۳۲۳۲۳۲
        </div>
      </div>

      {/* عنوان فاکتور */}
      <div style={{
        textAlign: 'center',
        borderBottom: '1px dashed #ccc',
        paddingBottom: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>🧾 فاکتور فروش</div>
        <div style={{ fontSize: '8px', color: '#666666' }}>شماره: {order.id}</div>
      </div>

      {/* اطلاعات فاکتور */}
      <div style={{
        background: '#f5f5f5',
        padding: '8px',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#555555' }}>تاریخ:</span>
          <span style={{ fontWeight: 'bold', color: '#000000' }}>{getDate(order.createdAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#555555' }}>ساعت:</span>
          <span style={{ fontWeight: 'bold', color: '#000000' }}>{getTime(order.createdAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555555' }}>وضعیت پرداخت:</span>
          <span style={{
            fontWeight: 'bold',
            color: order.paymentStatus === 'paid' ? '#22c55e' : '#eab308'
          }}>
            {order.paymentStatus === 'paid' ? '✓ پرداخت شده' : '⏳ پرداخت نشده'}
          </span>
        </div>
      </div>

      {/* اطلاعات مشتری */}
      <div style={{
        background: '#fef2f2',
        padding: '8px',
        borderRadius: '8px',
        marginBottom: '10px',
        borderRight: '3px solid #ef4444'
      }}>
        <div style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '6px', fontSize: '11px' }}>
          👤 اطلاعات مشتری
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#555555' }}>نام:</span> 
          <span style={{ color: '#000000' }}> {order.customerName}</span>
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#555555' }}>تلفن:</span> 
          <span style={{ color: '#000000' }}> {order.customerPhone}</span>
        </div>
        <div>
          <span style={{ color: '#555555' }}>آدرس:</span> 
          <span style={{ color: '#000000' }}> {order.address}</span>
        </div>
      </div>

      {/* جدول محصولات */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '10px'
      }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'right', padding: '6px', fontSize: '10px', color: '#555555' }}>محصول</th>
            <th style={{ textAlign: 'center', padding: '6px', fontSize: '10px', color: '#555555' }}>تعداد</th>
            <th style={{ textAlign: 'left', padding: '6px', fontSize: '10px', color: '#555555' }}>قیمت</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px', fontSize: '10px', fontWeight: 'bold', color: '#000000' }}>{item.name}</td>
              <td style={{ textAlign: 'center', padding: '6px', fontSize: '10px', color: '#000000' }}>{item.quantity}</td>
              <td style={{ textAlign: 'left', padding: '6px', fontSize: '10px', color: '#000000' }}>
                {(item.price * item.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* جمع کل */}
      <div style={{
        background: 'linear-gradient(135deg, #fef2f2, #ffffff)',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '10px',
        border: '1px solid #fee2e2'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: '#333333' }}>جمع کل:</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>
            {order.total.toLocaleString()} تومان
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ color: '#555555' }}>روش پرداخت:</span>
          <span style={{ fontWeight: 'bold', color: '#000000' }}>
            {order.paymentMethod === 'cash' ? 'نقدی' : 'کارت به کارت'}
          </span>
        </div>
      </div>

      {/* یادداشت */}
      {order.note && (
        <div style={{
          background: '#fef3c7',
          padding: '8px',
          borderRadius: '8px',
          marginBottom: '10px',
          textAlign: 'center',
          fontSize: '9px',
          color: '#92400e'
        }}>
          📝 {order.note}
        </div>
      )}

      {/* بارکد */}
      <div style={{
        textAlign: 'center',
        fontFamily: 'monospace',
        fontSize: '14px',
        letterSpacing: '2px',
        marginBottom: '10px',
        color: '#000000'
      }}>
        {order.id.split('-')[1]}
      </div>

      {/* فوتر */}
      <div style={{
        textAlign: 'center',
        paddingTop: '8px',
        borderTop: '1px dashed #ccc'
      }}>
        <div style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
          از خرید شما سپاسگزاریم 🙏
        </div>
        <div style={{ color: '#fbbf24', fontSize: '10px' }}>★ ★ ★ ★ ★</div>
        <div style={{ fontSize: '7px', color: '#999999', marginTop: '4px' }}>
          www.burgerfire.ir
        </div>
      </div>
    </div>
  );
};

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `فاکتور-${order?.id}`,
    onPrintError: (error) => console.error('Print error:', error),
    onAfterPrint: () => {
      console.log('Print completed');
    }
  });

  if (!order) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 overflow-hidden animate-slideUp">
        
        {/* Preview Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Preview Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">🧾 پیش‌نمایش فاکتور</h2>
                <p className="text-xs opacity-80">مرور قبل از چاپ</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                <i className="fa-solid fa-times text-white"></i>
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-4 bg-gray-100 overflow-auto max-h-[70vh]">
            <div ref={printRef}>
              <InvoiceContent order={order} />
            </div>
          </div>

          {/* Buttons */}
          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => handlePrint()}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-print"></i>
              🖨️ چاپ فاکتور
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
            >
              ✕ بستن
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}