'use client';

const features = [
  { icon: 'fa-fire-burner', title: 'گوشت تازه', desc: 'تهیه شده از گوشت تازه و روزانه', delay: 0, translateY: false },
  { icon: 'fa-leaf', title: 'مواد ارگانیک', desc: 'استفاده از سبزیجات تازه و ارگانیک', delay: 0.1, translateY: true },
  { icon: 'fa-motorcycle', title: 'ارسال سریع', desc: 'تحویل داغ درب منزل شما', delay: 0.2, translateY: false },
  { icon: 'fa-medal', title: 'دستور پخت ویژه', desc: 'سس‌های دست‌ساز و فرمول محرمانه', delay: 0.3, translateY: true },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-fire-red/10 rounded-full blur-[100px] z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className={`bg-dark-surface p-6 rounded-2xl border border-gray-800 hover:border-fire-red/30 transition-colors text-center group reveal ${feature.translateY ? 'translate-y-8' : ''}`} style={{ transitionDelay: `${feature.delay}s` }}>
                <div className="w-16 h-16 bg-fire-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-fire-red transition-colors">
                  <i className={`fa-solid ${feature.icon} text-2xl text-fire-red group-hover:text-white transition-colors`}></i>
                </div>
                <h4 className="font-bold mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ transitionDelay: '0.2s' }}>
            <h2 className="text-4xl md:text-5xl font-black mb-6">داستان <span className="text-fire-red">بی برگر</span>  از کجا شروع شد؟</h2>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              ما فقط یه همبرگر فروشی ساده نیستیم. ما عاشقای طعم‌های هیجان‌انگیزیم. از سال ۱۳۹۸، با هدف ارائه واقعی‌ترین و لذیذترین برگرها کارمون رو شروع کردیم.
            </p>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              راز موفقیت ما ساده‌ست: گوشت تازه، نان‌هایی که هر روز پخته میشن، و عشقی که تو درست کردن هر کدوم از این برگرها می‌ذاریم.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4 space-x-reverse">
                <img className="w-12 h-12 rounded-full border-2 border-dark-bg" src="https://i.pravatar.cc/100?img=1" alt="User" />
                <img className="w-12 h-12 rounded-full border-2 border-dark-bg" src="https://i.pravatar.cc/100?img=2" alt="User" />
                <img className="w-12 h-12 rounded-full border-2 border-dark-bg" src="https://i.pravatar.cc/100?img=3" alt="User" />
                <div className="w-12 h-12 rounded-full border-2 border-dark-bg bg-fire-red flex items-center justify-center text-xs font-bold">+10K</div>
              </div>
              <p className="text-sm font-bold text-gray-300">بیش از ۱۰ هزار مشتری راضی</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}