import { Link } from 'react-router-dom';
import { BookOpen, Heart } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 overflow-hidden">
      {/* Coffee Steam Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-20 w-2 h-16 bg-orange-200 rounded-full animate-pulse"></div>
        <div className="absolute top-16 left-24 w-1.5 h-12 bg-amber-200 rounded-full animate-bounce"></div>
        <div className="absolute top-12 right-32 w-2 h-20 bg-red-200 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-28 w-1.5 h-14 bg-orange-200 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-2 h-18 bg-amber-200 rounded-full animate-pulse"></div>
        <div className="absolute bottom-24 left-1/2 w-1.5 h-16 bg-orange-300 rounded-full animate-bounce"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 drop-shadow-2xl">
            Ready to Join Our Community?
          </h2>
          <p className="text-2xl text-orange-100 mb-16 leading-relaxed font-medium">
            Whether you're a student seeking support or someone who wants to
            make a difference,
            <br />
            there's a warm seat waiting for you at our table.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              to="/student"
              className="group relative px-12 py-6 bg-white text-orange-600 rounded-3xl font-black text-xl shadow-2xl hover:shadow-white/30 transform hover:-translate-y-2 hover:scale-110 transition-all duration-300 border-4 border-orange-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-300 to-amber-300 opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-400"></div>

              <div className="relative z-10 flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-full border-3 border-orange-600 flex items-center justify-center mr-4 shadow-inner">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="drop-shadow-sm">Start Your Journey</span>
              </div>
            </Link>

            <Link
              to="/donor"
              className="group relative px-12 py-6 bg-amber-400 text-white rounded-3xl font-black text-xl shadow-2xl hover:shadow-amber-400/30 transform hover:-translate-y-2 hover:scale-110 transition-all duration-300 border-4 border-amber-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300/30 to-orange-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 to-amber-300 opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-amber-600"></div>

              <div className="relative z-10 flex items-center">
                <div className="w-10 h-10 bg-red-500 rounded-full border-3 border-red-600 flex items-center justify-center mr-4 shadow-inner">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="drop-shadow-sm">Spread the Love</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
