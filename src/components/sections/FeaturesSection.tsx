import { Sparkles, Coffee, Heart, BookOpen } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-24 bg-gradient-to-br from-orange-50 via-orange-50 to-amber-100 overflow-hidden"
    >
      {/* Floating Menu Items */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-16 text-6xl transform rotate-12">
          🥐
        </div>
        <div className="absolute top-40 right-20 text-5xl transform -rotate-12">
          🧁
        </div>
        <div className="absolute bottom-32 left-1/4 text-7xl transform rotate-45">
          ☕
        </div>
        <div className="absolute bottom-20 right-1/3 text-4xl transform -rotate-24">
          🍪
        </div>
        <div className="absolute top-1/3 left-1/2 text-5xl transform rotate-24">
          🥯
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          {/* Coffee Shop Menu Board Style */}
          <div className="inline-block bg-gradient-to-br from-orange-800 to-red-900 px-16 py-12 rounded-3xl border-8 border-orange-700 shadow-2xl transform hover:scale-105 transition-all duration-300 mb-10 relative">
            {/* Menu Board Chain */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-orange-600 rounded-t-full border-2 border-orange-500"></div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-orange-500 rounded-full"></div>

            <h2 className="text-5xl md:text-7xl font-black text-orange-100 mb-6 drop-shadow-2xl">
              ★ Our Special Blend ★
            </h2>
            <p className="text-2xl text-orange-200 font-bold tracking-wide max-w-3xl">
              Every great cafe has its signature offerings
            </p>
            <div className="absolute bottom-4 right-4 text-orange-300 text-lg font-bold opacity-70">
              Est. 2024
            </div>

            <div className="absolute inset-4 border-2 border-orange-500 rounded-2xl opacity-40"></div>
          </div>

          <p className="text-2xl text-orange-700 max-w-4xl mx-auto font-medium leading-relaxed">
            <span className="bg-gradient-to-r from-orange-200 to-amber-200 px-6 py-3 rounded-2xl border-3 border-orange-400 inline-block shadow-lg transform hover:scale-105 transition-all duration-300">
              Here's what makes FineScholar the finest scholarship cafe in town!
              ☕
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {/* AI Merit Feature */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-3xl shadow-2xl border-6 border-orange-300 hover:shadow-orange-300/50 transform hover:scale-105 hover:-rotate-1 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-4 right-4 w-12 h-12 border-3 border-orange-200 rounded-full opacity-30"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 border-2 border-amber-200 rounded-full opacity-40"></div>

              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl border-4 border-orange-700 group-hover:rotate-12 transition-transform duration-500">
                <Sparkles className="w-8 h-8 text-white drop-shadow-lg animate-pulse" />
              </div>

              <h3 className="text-2xl font-black text-orange-900 mb-4 drop-shadow-sm">
                AI-Powered Merit
              </h3>
              <p className="text-orange-700 font-medium leading-relaxed">
                Fair and transparent scoring using advanced AI algorithms - no
                human bias, just pure merit!
              </p>

              <div className="absolute bottom-3 right-3 flex space-x-1">
                <div className="w-2 h-3 bg-amber-800 rounded-full opacity-40 transform rotate-12"></div>
                <div className="w-2 h-3 bg-orange-900 rounded-full opacity-50 transform -rotate-12"></div>
                <div className="w-2 h-3 bg-red-800 rounded-full opacity-30 transform rotate-24"></div>
              </div>
            </div>
          </div>

          {/* Lightning Speed Feature */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-8 rounded-3xl shadow-2xl border-6 border-amber-300 hover:shadow-amber-300/50 transform hover:scale-105 hover:rotate-1 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-4 left-4 opacity-20">
                <div className="w-6 h-1 bg-amber-400 rounded-full mb-1"></div>
                <div className="w-8 h-1 bg-yellow-400 rounded-full mb-1"></div>
                <div className="w-4 h-1 bg-amber-500 rounded-full"></div>
              </div>

              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl border-4 border-amber-700 group-hover:-rotate-12 transition-transform duration-500">
                <Coffee className="w-8 h-8 text-white drop-shadow-lg" />
              </div>

              <h3 className="text-2xl font-black text-amber-900 mb-4 drop-shadow-sm">
                Lightning Fast
              </h3>
              <p className="text-amber-700 font-medium leading-relaxed">
                Sei blockchain ensures sub-400ms transaction speeds - faster
                than pulling an espresso shot!
              </p>

              <div className="absolute bottom-4 right-4 bg-green-400 px-3 py-1 rounded-full border-2 border-green-600 text-green-800 font-black text-sm">
                ⚡ &lt;400ms
              </div>
            </div>
          </div>

          {/* Transparency Feature */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-3xl shadow-2xl border-6 border-red-300 hover:shadow-red-300/50 transform hover:scale-105 hover:-rotate-1 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-6 left-6 w-8 h-16 bg-gradient-to-r from-white/40 to-transparent rounded-full opacity-60"></div>

              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl border-4 border-red-700 group-hover:rotate-12 transition-transform duration-500">
                <Heart className="w-8 h-8 text-white drop-shadow-lg animate-pulse" />
              </div>

              <h3 className="text-2xl font-black text-red-900 mb-4 drop-shadow-sm">
                Full Transparency
              </h3>
              <p className="text-red-700 font-medium leading-relaxed">
                Every donation and distribution is publicly verifiable - clear
                as your favorite glass cup!
              </p>

              <div className="absolute bottom-4 right-4 bg-blue-100 px-3 py-1 rounded-full border-2 border-blue-300 text-blue-800 font-bold text-sm">
                🔍 100% Open
              </div>
            </div>
          </div>

          {/* Global Access Feature */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-3xl shadow-2xl border-6 border-orange-300 hover:shadow-orange-300/50 transform hover:scale-105 hover:rotate-1 transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-8 left-8 w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="absolute top-12 right-12 w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="absolute bottom-16 left-12 w-2 h-2 bg-amber-500 rounded-full"></div>
                <div className="absolute bottom-8 right-8 w-2 h-2 bg-orange-600 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-600 rounded-full"></div>
              </div>

              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl border-4 border-orange-700 group-hover:-rotate-12 transition-transform duration-500">
                <BookOpen className="w-8 h-8 text-white drop-shadow-lg" />
              </div>

              <h3 className="text-2xl font-black text-orange-900 mb-4 drop-shadow-sm">
                Global Access
              </h3>
              <p className="text-orange-700 font-medium leading-relaxed">
                Connecting students worldwide with generous supporters - our
                cafe never closes!
              </p>

              <div className="absolute bottom-4 right-4 bg-green-100 px-3 py-1 rounded-full border-2 border-green-300 text-green-800 font-bold text-sm">
                🌍 24/7 Open
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
