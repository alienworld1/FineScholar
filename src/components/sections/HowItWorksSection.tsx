import { Users, Sparkles, Heart } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 bg-gradient-to-br from-orange-900 via-red-900 to-orange-800 overflow-hidden"
    >
      {/* Cafe Interior Background Elements */}
      <div className="absolute inset-0 opacity-10">
        {/* Coffee Shop Tables */}
        <div className="absolute top-20 left-10 w-20 h-16 bg-amber-200 rounded-lg transform rotate-12"></div>
        <div className="absolute top-32 right-16 w-16 h-12 bg-orange-200 rounded-lg transform -rotate-6"></div>
        <div className="absolute bottom-20 left-1/3 w-18 h-14 bg-red-200 rounded-lg transform rotate-6"></div>

        {/* Coffee Shop Chairs */}
        <div className="absolute top-36 left-14 w-8 h-12 bg-orange-300 rounded-t-lg"></div>
        <div className="absolute top-48 right-20 w-6 h-10 bg-amber-300 rounded-t-lg"></div>
        <div className="absolute bottom-32 left-1/2 w-7 h-11 bg-red-300 rounded-t-lg"></div>

        {/* Menu Boards */}
        <div className="absolute top-16 left-1/2 w-24 h-32 bg-orange-200 rounded-lg border-4 border-orange-400"></div>
        <div className="absolute bottom-16 right-12 w-20 h-28 bg-amber-200 rounded-lg border-4 border-amber-400"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          {/* Chalkboard Style Header */}
          <div className="inline-block bg-gradient-to-br from-green-800 to-green-900 px-16 py-12 rounded-3xl border-8 border-green-700 shadow-2xl transform hover:scale-105 transition-all duration-300 mb-10">
            <h2 className="text-5xl md:text-6xl font-black text-green-100 mb-6 drop-shadow-xl">
              ☆ Today's Special ☆
            </h2>
            <p className="text-3xl text-green-200 font-bold tracking-wide">
              How Our Cafe Works
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-green-300 rounded-full opacity-40 blur-sm"></div>
          </div>

          <p className="text-2xl text-orange-100 max-w-3xl mx-auto font-medium leading-relaxed">
            <span className="bg-gradient-to-r from-orange-700 to-red-700 px-6 py-3 rounded-lg border-2 border-orange-500 inline-block shadow-lg">
              Just like your favorite coffee shop, we bring people together -
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-700 to-orange-700 px-6 py-3 rounded-lg border-2 border-red-500 inline-block shadow-lg mt-6">
              but instead of coffee, we serve opportunities! ☕
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="text-center group relative">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-10 rounded-3xl border-6 border-orange-400 shadow-2xl transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300 relative overflow-hidden">
              {/* Coffee Ring Stains */}
              <div className="absolute top-4 right-4 w-10 h-10 border-2 border-orange-300 rounded-full opacity-40"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 border-2 border-amber-300 rounded-full opacity-50"></div>

              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto flex items-center justify-center shadow-2xl border-6 border-orange-700 group-hover:rotate-12 transition-transform duration-500">
                  <Users className="w-14 h-14 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-4 -right-4 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full border-4 border-amber-600 flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-2xl drop-shadow-lg">
                    1
                  </span>
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-60">
                  <div className="w-2 h-8 bg-orange-200 rounded-full animate-pulse"></div>
                  <div className="w-2 h-6 bg-amber-200 rounded-full animate-bounce ml-2 -mt-7"></div>
                  <div className="w-2 h-10 bg-orange-300 rounded-full animate-pulse -ml-3 -mt-8"></div>
                </div>
              </div>

              <h3 className="text-4xl font-black text-orange-900 mb-6 drop-shadow-lg">
                Pull Up a Chair
              </h3>
              <p className="text-orange-700 leading-relaxed text-xl font-medium">
                Students join our cozy community, sharing their academic
                journey, volunteer spirit, and financial needs in a warm,
                welcoming space.
              </p>

              <div className="absolute bottom-2 left-2 w-4 h-5 bg-amber-800 rounded-full opacity-30 transform rotate-12"></div>
              <div className="absolute bottom-4 right-2 w-3 h-4 bg-orange-900 rounded-full opacity-40 transform -rotate-12"></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="text-center group relative">
            <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-10 rounded-3xl border-6 border-amber-400 shadow-2xl transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-2 left-4 opacity-40">
                <div className="w-2 h-10 bg-amber-200 rounded-full animate-pulse"></div>
                <div className="w-2 h-8 bg-yellow-200 rounded-full animate-bounce ml-1 -mt-9"></div>
                <div className="w-2 h-12 bg-amber-300 rounded-full animate-pulse -ml-2 -mt-10"></div>
              </div>
              <div className="absolute top-3 right-6 opacity-30">
                <div className="w-2 h-8 bg-yellow-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-6 bg-amber-300 rounded-full animate-pulse ml-1 -mt-7"></div>
              </div>

              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full mx-auto flex items-center justify-center shadow-2xl border-6 border-amber-700 group-hover:-rotate-12 transition-transform duration-500">
                  <Sparkles className="w-14 h-14 text-white drop-shadow-lg animate-pulse" />
                </div>
                <div className="absolute -top-4 -right-4 w-14 h-14 bg-gradient-to-br from-red-400 to-orange-400 rounded-full border-4 border-red-600 flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-2xl drop-shadow-lg">
                    2
                  </span>
                </div>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-ping" />
                  <div className="absolute top-2 left-2 w-4 h-4 bg-amber-300 rounded-full animate-pulse"></div>
                </div>
              </div>

              <h3 className="text-4xl font-black text-amber-900 mb-6 drop-shadow-lg">
                AI Barista Magic
              </h3>
              <p className="text-amber-700 leading-relaxed text-xl font-medium">
                Our AI barista carefully blends each student's story into a
                personalized merit score - fair, transparent, and unbiased.
              </p>

              <div className="absolute bottom-4 left-4 flex space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded-full border border-green-600"></div>
                <div className="w-4 h-4 bg-red-400 rounded-full border border-red-600"></div>
                <div className="w-4 h-4 bg-blue-400 rounded-full border border-blue-600"></div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="text-center group relative">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 p-10 rounded-3xl border-6 border-red-400 shadow-2xl transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-6 left-2 opacity-30">
                <div className="w-10 h-1.5 bg-red-300 rounded-full"></div>
                <div className="w-8 h-1.5 bg-orange-300 rounded-full mt-1"></div>
                <div className="w-12 h-1.5 bg-red-300 rounded-full mt-1"></div>
              </div>
              <div className="absolute bottom-8 right-4 opacity-25">
                <div className="w-8 h-1.5 bg-orange-400 rounded-full"></div>
                <div className="w-10 h-1.5 bg-red-400 rounded-full mt-1"></div>
                <div className="w-6 h-1.5 bg-orange-400 rounded-full mt-1"></div>
              </div>

              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-2xl border-6 border-red-700 group-hover:rotate-12 transition-transform duration-500">
                  <Heart className="w-14 h-14 text-white drop-shadow-lg animate-pulse" />
                </div>
                <div className="absolute -top-4 -right-4 w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full border-4 border-orange-600 flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-2xl drop-shadow-lg">
                    3
                  </span>
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-80">
                  <div className="text-yellow-300 text-4xl animate-bounce">
                    ⚡
                  </div>
                </div>
              </div>

              <h3 className="text-4xl font-black text-red-900 mb-6 drop-shadow-lg">
                Instant Warmth
              </h3>
              <p className="text-red-700 leading-relaxed text-xl font-medium">
                Donors see the impact immediately as scholarships are
                distributed through Sei's lightning-fast blockchain - faster
                than brewing espresso!
              </p>

              <div className="absolute bottom-3 right-3 bg-green-400 px-4 py-2 rounded-full border-2 border-green-600 text-green-800 font-black text-sm">
                &lt;400ms
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
