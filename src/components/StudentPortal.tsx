import { Link } from 'react-router-dom';
import { Coffee, User, BookOpen, ArrowLeft } from 'lucide-react';

export default function StudentPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-100 to-orange-100 border-b-4 border-orange-200">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center space-x-3 text-orange-800 hover:text-orange-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <Coffee className="w-6 h-6" />
              <span className="text-xl font-bold">FineScholar</span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 px-4 py-2 bg-orange-200 rounded-full">
            <User className="w-4 h-4 text-orange-700" />
            <span className="text-orange-700 font-medium">Student Portal</span>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-400 rounded-full mx-auto flex items-center justify-center shadow-xl border-4 border-orange-200 mb-8">
            <BookOpen className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-orange-900 mb-6">
            Welcome to Your Learning Journey! ☕
          </h1>

          <p className="text-xl text-orange-700 mb-8 leading-relaxed">
            This cozy corner is being prepared just for you. Soon you'll be able
            to:
          </p>

          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-200 mb-8">
            <ul className="space-y-4 text-left">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-orange-700">
                  Connect your wallet and verify your enrollment
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <span className="text-orange-700">
                  Share your academic achievements and volunteer work
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span className="text-orange-700">
                  Receive your AI-calculated merit score
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-orange-700">
                  Get matched with scholarship opportunities
                </span>
              </li>
            </ul>
          </div>

          <p className="text-orange-600 italic">
            ⏰ Coming soon! Our developers are brewing something amazing for
            you.
          </p>

          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 mt-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
