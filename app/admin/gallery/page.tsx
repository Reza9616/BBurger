// app/admin/gallery/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

type GalleryImage = {
  id: number;
  image_url: string;
  title: string;
  location: string;
  author: string;
  likes: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export default function GalleryAdminPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    location: '',
    author: '',
    display_order: 0
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    // شبیه‌سازی progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const res = await fetch('/api/upload-gallery', {
        method: 'POST',
        body: uploadFormData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await res.json();
      if (data.success) {
        // فقط image_url را به‌روز می‌کنیم
        setFormData(prev => ({ ...prev, image_url: data.url }));
        if (editingImage) {
          setEditingImage({ ...editingImage, image_url: data.url });
        }
        alert('✅ تصویر با موفقیت آپلود شد');
      } else {
        alert(data.error || 'خطا در آپلود');
      }
    } catch (error) {
      alert('❌ خطا در آپلود تصویر');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      alert('لطفاً یک تصویر انتخاب کنید');
      return;
    }

    try {
      const res = await fetch('/api/admin/gallery', {
        method: editingImage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingImage ? { ...formData, id: editingImage.id } : formData)
      });

      if (res.ok) {
        await fetchImages();
        resetForm();
        setShowModal(false);
        alert(editingImage ? 'تصویر با موفقیت ویرایش شد' : 'تصویر با موفقیت اضافه شد');
      } else {
        alert('خطا در ذخیره تصویر');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    }
  };

  const deleteImage = async (id: number) => {
    if (!confirm('آیا از حذف این تصویر مطمئن هستید؟')) return;

    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchImages();
        alert('تصویر با موفقیت حذف شد');
      }
    } catch (error) {
      alert('خطا در حذف تصویر');
    }
  };

  const toggleActive = async (image: GalleryImage) => {
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...image, is_active: !image.is_active })
      });
      if (res.ok) {
        await fetchImages();
      }
    } catch (error) {
      alert('خطا در تغییر وضعیت');
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      location: '',
      author: '',
      display_order: 0
    });
    setEditingImage(null);
  };

  const openEditModal = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      image_url: image.image_url,
      title: image.title || '',
      location: image.location || '',
      author: image.author || '',
      display_order: image.display_order
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="mt-4 text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">🖼️ مدیریت گالری</h1>
          <p className="text-gray-400 text-sm mt-1">مدیریت تصاویر گالری سایت</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-red-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          افزودن تصویر جدید
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">کل تصاویر</p>
          <p className="text-2xl font-bold text-white">{images.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">تصاویر فعال</p>
          <p className="text-2xl font-bold text-green-500">
            {images.filter(i => i.is_active).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">کل لایک‌ها</p>
          <p className="text-2xl font-bold text-yellow-500">
            {images.reduce((sum, i) => sum + (i.likes || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-red-500/50 transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {!image.is_active && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold">غیرفعال</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-xs text-yellow-500">
                  <i className="fa-regular fa-heart ml-1"></i>
                  {image.likes || 0}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 line-clamp-1">{image.title || 'بدون عنوان'}</h3>
              <p className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                <i className="fa-solid fa-location-dot text-red-500 text-xs"></i>
                {image.location || 'نامشخص'}
              </p>
              <p className="text-gray-500 text-xs mb-3">
                <i className="fa-regular fa-user ml-1"></i>
                {image.author || '@user'}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(image)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      image.is_active ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {image.is_active ? '✓ فعال' : '✗ غیرفعال'}
                  </button>
                  <button
                    onClick={() => openEditModal(image)}
                    className="px-3 py-1 bg-blue-600 rounded-full text-xs hover:bg-blue-700 transition"
                  >
                    ✏️ ویرایش
                  </button>
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="px-3 py-1 bg-red-600 rounded-full text-xs hover:bg-red-700 transition"
                  >
                    🗑️ حذف
                  </button>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  #{image.display_order}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setShowModal(false)}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingImage ? '✏️ ویرایش تصویر' : '➕ تصویر جدید'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">
                ×
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {/* آپلود تصویر */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  <i className="fa-solid fa-cloud-upload-alt ml-1"></i>
                  آپلود تصویر
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-red-500 transition-all">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-camera text-gray-400 text-2xl"></i>
                    </div>
                    <span className="text-gray-400 text-sm">برای آپلود کلیک کنید</span>
                    <span className="text-gray-600 text-xs">JPEG, PNG, WebP, GIF (حداکثر 5MB)</span>
                  </label>
                </div>
                
                {/* Progress Bar */}
                {uploading && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>در حال آپلود...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Image */}
              {formData.image_url && !uploading && (
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">پیش‌نمایش</label>
                  <div className="relative">
                    <img 
                      src={formData.image_url} 
                      alt="preview" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setFormData({...formData, image_url: ''})}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* یا وارد کردن آدرس */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-gray-900 px-2 text-gray-500">یا</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">آدرس تصویر (لینک)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">عنوان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="The Double Bypass"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">موقعیت</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="Downtown Vinewood"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">نام نویسنده</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="@BurgerBoss"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">ترتیب نمایش</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="0"
                />
                <p className="text-gray-500 text-xs mt-1">اعداد کوچیک‌تر جلوتر نمایش داده می‌شوند</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!formData.image_url}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition disabled:opacity-50"
                >
                  {editingImage ? '💾 ذخیره تغییرات' : '➕ افزودن تصویر'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition"
                >
                  ❌ انصراف
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}