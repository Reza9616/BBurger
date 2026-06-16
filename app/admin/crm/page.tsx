// app/admin/crm/page.tsx
'use client';

import { useState, useEffect } from 'react';

type Customer = {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  total_orders: number;
  total_spent: number;
  customer_status: string;
};

type Message = {
  id: number;
  content: string;
  status: string;
  created_at: string;
  customer_name: string;
};

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchMessages();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/crm');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/crm/messages');
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendSMS = async () => {
    if (!message.trim()) {
      alert('لطفاً متن پیام را وارد کنید');
      return;
    }

    if (selectedCustomers.length === 0) {
      alert('لطفاً حداقل یک مشتری را انتخاب کنید');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIds: selectedCustomers,
          message: message,
          subject: subject,
          isBulk: false
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}`);
        setMessage('');
        setSubject('');
        setSelectedCustomers([]);
        setSelectAll(false);
        fetchMessages();
      } else {
        alert('❌ خطا در ارسال پیام');
      }
    } catch (error) {
      alert('❌ خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkSMS = async () => {
    if (!message.trim()) {
      alert('لطفاً متن پیام را وارد کنید');
      return;
    }

    if (!confirm('آیا می‌خواهید به همه مشتریان فعال پیام ارسال کنید؟')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          subject: subject,
          isBulk: true
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}`);
        setMessage('');
        setSubject('');
        fetchMessages();
      } else {
        alert('❌ خطا در ارسال پیام');
      }
    } catch (error) {
      alert('❌ خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          📱 سیستم CRM
        </h1>
        <p className="text-gray-400 text-sm mt-1">مدیریت ارتباط با مشتریان و ارسال پیام</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-4">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-6 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'send'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-paper-plane ml-2"></i>
          ارسال پیام
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-clock-rotate-left ml-2"></i>
          تاریخچه پیام‌ها
        </button>
      </div>

      {/* Send Message Tab */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Form */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-envelope text-red-400"></i>
              نوشتن پیام
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">موضوع (اختیاری)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: پیشنهاد ویژه"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">متن پیام *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="متن پیام خود را وارد کنید..."
                  rows={6}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length} کاراکتر
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendSMS}
                  disabled={loading || selectedCustomers.length === 0}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  ارسال به {selectedCustomers.length} نفر
                </button>
                <button
                  onClick={handleSendBulkSMS}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-users"></i>
                  ارسال به همه مشتریان
                </button>
              </div>
            </div>
          </div>

          {/* Customers List */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <i className="fa-solid fa-users text-blue-400"></i>
                لیست مشتریان
              </h2>
              <span className="text-sm text-gray-400">
                {selectedCustomers.length} انتخاب شده
              </span>
            </div>

            <div className="relative mb-4">
              <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="جستجوی مشتری..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2 pr-10 pl-4 text-sm"
              />
            </div>

            <div className="mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-red-500 rounded"
                />
                <span className="text-sm text-gray-300">انتخاب همه ({filteredCustomers.length})</span>
              </label>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <label
                  key={customer.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomers([...selectedCustomers, customer.id]);
                      } else {
                        setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                        setSelectAll(false);
                      }
                    }}
                    className="w-4 h-4 text-red-500 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{customer.full_name}</p>
                    <p className="text-xs text-gray-500">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-400">{customer.total_orders} سفارش</p>
                    <p className="text-xs text-red-400">{customer.total_spent.toLocaleString()} تومان</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-green-400"></i>
            تاریخچه پیام‌های ارسالی
          </h2>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-inbox text-gray-600 text-5xl mb-4"></i>
                <p className="text-gray-500">هیچ پیامی ارسال نشده است</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{msg.customer_name || 'همه مشتریان'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleString('fa-IR')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      msg.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {msg.status === 'sent' ? 'ارسال شده' : 'در انتظار'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{msg.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}