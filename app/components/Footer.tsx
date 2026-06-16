export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="#" className="text-3xl font-black text-fire-red tracking-tighter flex items-center gap-2 mb-6">
              <i className="fa-solid fa-fire text-fire-red-light"></i>
              بی<span className="text-white">برگر</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              ما اینجا هستیم تا بهترین تجربه از خوردن یک برگر واقعی را برای شما رقم بزنیم. با ما طعم آتش را احساس کنید.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-dark-bg flex items-center justify-center text-gray-400 hover:text-white hover:bg-fire-red transition-all"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-bg flex items-center justify-center text-gray-400 hover:text-white hover:bg-fire-red transition-all"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-bg flex items-center justify-center text-gray-400 hover:text-white hover:bg-fire-red transition-all"><i className="fa-brands fa-telegram"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-fire-red inline-block pb-1">دسترسی سریع</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-400 hover:text-fire-red transition-colors text-sm">خانه</a></li>
              <li><a href="#menu" className="text-gray-400 hover:text-fire-red transition-colors text-sm">منوی غذاها</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-fire-red transition-colors text-sm">داستان ما</a></li>
              <li><a href="#reservation" className="text-gray-400 hover:text-fire-red transition-colors text-sm">رزرو میز</a></li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-fire-red inline-block pb-1">ساعت کاری</h4>
            <ul className="space-y-3">
              <li className="flex justify-between text-sm text-gray-400">
                <span>شنبه تا چهارشنبه:</span>
                <span className="text-white">۱۱:۰۰ - ۲۳:۳۰</span>
              </li>
              <li className="flex justify-between text-sm text-gray-400">
                <span>پنجشنبه و جمعه:</span>
                <span className="text-fire-red font-bold">۱۱:۰۰ - ۰۰:۳۰</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-fire-red inline-block pb-1">تماس با ما</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <i className="fa-solid fa-location-dot mt-1 text-fire-red"></i>
                <span>نیشابور </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <i className="fa-solid fa-phone text-fire-red"></i>
                <span dir="ltr">021 - 88 123 456</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <i className="fa-solid fa-envelope text-fire-red"></i>
                <span>hello@ateshburger.ir</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© ۱۴۰۳ تمامی حقوق برای بی برگر محفوظ است.</p>
          <p className="text-gray-500 text-sm flex items-center gap-1">طراحی شده توسط شرکت رهان  </p>
        </div>
      </div>
    </footer>
  );
}