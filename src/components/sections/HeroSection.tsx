import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, Award, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-amber-100 via-orange-100 to-red-100 py-24">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-8 h-8 bg-amber-400 rounded-lg border-2 border-amber-600 rotate-45 opacity-80 animate-bounce"></div>
        <div className="absolute top-16 right-16 w-6 h-6 bg-orange-500 rounded-full border-2 border-orange-700 opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-10 h-10 bg-red-400 rounded-lg border-3 border-red-600 rotate-12 opacity-60 animate-bounce"></div>
        <div className="absolute bottom-32 right-24 w-5 h-5 bg-amber-500 rounded-full border-2 border-amber-700 opacity-80 animate-ping"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-900 to-red-900 text-orange-100 rounded-full font-bold mb-10 shadow-2xl border-4 border-orange-800 transform hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 bg-amber-400 rounded-full border-2 border-amber-600 flex items-center justify-center mr-3 shadow-inner">
              <Award className="w-5 h-5 text-amber-800" />
            </div>
            <span className="text-xl tracking-wide drop-shadow-lg">
              PREMIUM BLEND
            </span>
            <div className="ml-4 flex space-x-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-black text-orange-900 mb-10 leading-tight">
            <span className="relative inline-block">
              Where Merit Meets
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-200 to-amber-200 -skew-y-1 opacity-40 rounded-lg -z-10"></div>
            </span>
            <br />
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 drop-shadow-2xl relative mt-4">
              Opportunity
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-6xl">
                ☕
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full opacity-60 transform skew-x-12"></div>
            </span>
          </h1>

          {/* Description */}
          <div className="text-2xl md:text-3xl text-orange-700 mb-16 leading-relaxed max-w-4xl mx-auto font-medium">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-4 rounded-2xl border-3 border-orange-300 shadow-xl transform hover:scale-105 transition-all duration-300 mb-6">
              Step into our cozy digital cafe where AI brews the perfect
              scholarship blend,
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-red-100 px-6 py-4 rounded-2xl border-3 border-amber-300 shadow-xl transform hover:scale-105 transition-all duration-300">
              matching deserving students with generous donors over
              lightning-fast Sei transactions.
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              to="/student"
              className="group relative px-12 py-6 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 text-white rounded-3xl font-black text-xl shadow-2xl hover:shadow-orange-500/50 transform hover:-translate-y-3 hover:scale-110 transition-all duration-300 border-4 border-orange-700 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-red-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 to-orange-300 opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-800"></div>

              <div className="relative z-10 flex items-center">
                <div className="w-10 h-10 bg-amber-300 rounded-full border-3 border-amber-500 flex items-center justify-center mr-4 shadow-inner">
                  <BookOpen className="w-5 h-5 text-amber-800" />
                </div>
                <span className="drop-shadow-lg">I'm a Student</span>
                <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform drop-shadow-lg" />
              </div>

              <div className="absolute -top-3 right-4 opacity-60">
                <div className="w-1.5 h-6 bg-orange-200 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-4 bg-amber-200 rounded-full animate-bounce ml-1 -mt-5"></div>
                <div className="w-1.5 h-7 bg-orange-300 rounded-full animate-pulse -ml-2 -mt-6"></div>
              </div>
            </Link>

            <Link
              to="/donor"
              className="group relative px-12 py-6 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white rounded-3xl font-black text-xl shadow-2xl hover:shadow-amber-500/50 transform hover:-translate-y-3 hover:scale-110 transition-all duration-300 border-4 border-amber-700 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-orange-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-200 to-amber-200 opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-600 to-amber-800"></div>

              <div className="relative z-10 flex items-center">
                <div className="w-10 h-10 bg-red-300 rounded-full border-3 border-red-500 flex items-center justify-center mr-4 shadow-inner">
                  <Heart className="w-5 h-5 text-red-800" />
                </div>
                <span className="drop-shadow-lg">I Want to Help</span>
                <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform drop-shadow-lg" />
              </div>

              <div className="absolute -top-2 right-4 opacity-70">
                <Sparkles className="w-5 h-5 text-red-200 animate-ping" />
                <div className="absolute top-1 left-1 w-3 h-3 bg-pink-300 rounded-full animate-pulse"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
