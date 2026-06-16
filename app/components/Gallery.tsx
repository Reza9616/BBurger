// app/components/Gallery.tsx
'use client';

import { useState, useEffect } from 'react';

type GalleryImage = {
  id: number;
  image_url: string;
  title: string;
  location: string;
  author: string;
  likes: number;
  display_order: number;
  is_active: boolean;
};

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedImage(images[newIndex]);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedImage(images[newIndex]);
    }
  };

  // کیبورد navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex]);

  const displayedImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-gray-400 mt-4 text-sm font-mono">LOADING GALLERY...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section id="gallery" className="relative py-24 bg-zinc-950 overflow-hidden font-sans">
        {/* Noise Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16" dir="rtl">
            <div className="inline-flex items-center gap-2 mb-4">
              <i className="fa-solid fa-camera text-red-500 text-sm"></i>
              <span className="text-xs font-mono tracking-[0.3em] text-gray-400 font-bold uppercase">
                Snapmatic Feed
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
              گالری <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">تصاویر</span>
            </h2>
            <p className="text-gray-400 font-mono text-sm max-w-2xl mx-auto">
              بهترین لحظات ثبت شده توسط گنگسترهای شهر در بی‌برگر. عکس‌های خود را با هشتگ #BburgerLS به اشتراک بگذارید.
            </p>
          </div>

          {/* Images Grid */}
          {displayedImages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">هیچ تصویری یافت نشد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedImages.map((item, idx) => (
                <div 
                  key={item.id} 
                  onClick={() => openLightbox(item, idx)}
                  className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-colors duration-300 shadow-xl cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-between p-4 pointer-events-none">
                      <div className="flex justify-between w-full">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-red-500"></div>
                        <div className="w-4 h-4 border-t-2 border-r-2 border-red-500"></div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <i className="fa-solid fa-expand text-white text-2xl"></i>
                      </div>
                      <div className="flex justify-between w-full">
                        <div className="w-4 h-4 border-b-2 border-l-2 border-red-500"></div>
                        <div className="w-4 h-4 border-b-2 border-r-2 border-red-500"></div>
                      </div>
                    </div>
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 filter grayscale-[20%] group-hover:grayscale-0"
                    />
                  </div>

                  <div className="p-4 bg-zinc-950/80 backdrop-blur-md relative z-20 flex flex-col gap-3">
                    <div dir="ltr">
                      <h3 className="text-white font-bold text-sm uppercase truncate mb-1">
                        {item.title || 'Untitled'}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5 truncate">
                        <i className="fa-solid fa-location-dot text-red-500/70"></i>
                        {item.location || 'Unknown'}
                      </p>
                    </div>
                    <div className="w-full h-px bg-white/5"></div>
                    <div className="flex justify-between items-center" dir="ltr">
                      <span className="text-xs text-gray-400 font-mono">
                        {item.author || '@user'}
                      </span>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-red-500 transition-colors group/btn"
                      >
                        <i className="fa-regular fa-heart text-gray-600 group-hover/btn:text-red-500 transition-colors"></i>
                        {item.likes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-16 flex justify-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="relative px-8 py-3 bg-transparent text-white font-mono text-sm tracking-widest uppercase border border-white/20 rounded-full overflow-hidden group hover:border-red-500 transition-colors"
              >
                <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                  Load More
                </span>
                <div className="absolute inset-0 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-0"></div>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal - Fullscreen Image Viewer */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 transition-all flex items-center justify-center"
          >
            <i className="fa-solid fa-times text-white text-xl"></i>
          </button>

          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-red-500 transition-all flex items-center justify-center group"
            >
              <i className="fa-solid fa-chevron-left text-white text-xl group-hover:scale-125 transition-transform"></i>
            </button>
          )}
          
          {currentIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-red-500 transition-all flex items-center justify-center group"
            >
              <i className="fa-solid fa-chevron-right text-white text-xl group-hover:scale-125 transition-transform"></i>
            </button>
          )}

          {/* Image Container */}
          <div 
            className="relative max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            
            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 rounded-b-2xl">
              <div className="flex justify-between items-end flex-wrap gap-4">
                <div dir="rtl">
                  <h3 className="text-white font-bold text-xl mb-1">
                    {selectedImage.title || 'Untitled'}
                  </h3>
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-red-500"></i>
                    {selectedImage.location || 'Unknown'}
                  </p>
                  <p className="text-gray-400 text-xs mt-2 flex items-center gap-2">
                    <i className="fa-regular fa-user"></i>
                    {selectedImage.author || '@user'}
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-all border border-red-500/30">
                  <i className="fa-regular fa-heart text-red-500"></i>
                  <span className="text-white font-mono text-sm">{selectedImage.likes || 0}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs text-gray-400 font-mono">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}