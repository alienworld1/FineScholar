import { Coffee, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-orange-900 via-red-900 to-orange-800 text-orange-100 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-6 md:mb-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg border-3 border-orange-600 flex items-center justify-center shadow-lg">
                <Coffee className="w-5 h-5 text-white drop-shadow-lg" />
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-ping" />
            </div>
            <div>
              <span className="text-2xl font-black drop-shadow-lg">
                FineScholar
              </span>
              <p className="text-xs text-orange-300 font-medium tracking-wider uppercase">
                Artisan Scholarships
              </p>
            </div>
          </div>

          <p className="text-xl text-orange-300 text-center font-medium">
            Brewing opportunities, one scholarship at a time ☕
          </p>

          <div className="text-orange-400 text-sm mt-6 md:mt-0 text-center">
            <div className="font-bold">Powered by</div>
            <div>Sei Blockchain</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
