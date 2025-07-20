import { Coffee, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-amber-100 via-orange-100 to-red-100 border-b-8 border-orange-300 shadow-2xl">
      {/* Cafe Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-20 w-16 h-20 bg-orange-200 rounded-b-full"></div>
        <div className="absolute -top-2 left-24 w-4 h-6 bg-orange-300 rounded-full"></div>
        <div className="absolute top-0 right-32 w-12 h-16 bg-amber-200 rounded-b-full"></div>
        <div className="absolute -top-1 right-36 w-3 h-5 bg-amber-300 rounded-full"></div>
        <div className="absolute top-4 left-1/2 w-24 h-24 border-4 border-orange-200 rounded-full"></div>
        <div className="absolute bottom-2 left-1/3 w-16 h-16 border-3 border-amber-200 rounded-full"></div>
        <div className="absolute top-6 right-1/4 w-20 h-20 border-4 border-red-200 rounded-full"></div>
      </div>

      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-4">
          <div className="relative group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg border-4 border-orange-700 flex items-center justify-center transform group-hover:rotate-3 transition-all duration-300">
              <Coffee className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-3 bg-orange-300 rounded-full opacity-60 animate-pulse"></div>
              <div className="w-1 h-2 bg-amber-300 rounded-full opacity-50 animate-bounce ml-1 -mt-2"></div>
              <div className="w-1 h-4 bg-orange-200 rounded-full opacity-70 animate-pulse -ml-2 -mt-3"></div>
            </div>
            <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-ping" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-orange-900 tracking-wide drop-shadow-lg">
              FineScholar
            </h1>
            <p className="text-xs text-orange-600 font-medium tracking-wider uppercase">
              Artisan Scholarships
            </p>
          </div>
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link
            to="/student"
            className="relative group px-4 py-2 text-orange-800 hover:text-orange-900 font-bold transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="relative z-10">Student Portal</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-amber-200 rounded-lg border-3 border-orange-400 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-300 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          </Link>

          <Link
            to="/donor"
            className="relative group px-4 py-2 text-orange-800 hover:text-orange-900 font-bold transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="relative z-10">Donor Portal</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-amber-200 rounded-lg border-3 border-orange-400 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-300 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          </Link>

          <Link
            to="/admin"
            className="relative group px-4 py-2 text-purple-800 hover:text-purple-900 font-bold transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="relative z-10">Admin Dashboard</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-violet-200 rounded-lg border-3 border-purple-400 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-300 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
