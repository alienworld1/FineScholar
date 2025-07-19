import { Link } from 'react-router-dom';
import { Coffee, Heart, Gift, ArrowLeft } from 'lucide-react';

export default function DonorPortal() {
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

          <div className="flex items-center space-x-2 px-4 py-2 bg-amber-200 rounded-full">
            <Heart className="w-4 h-4 text-amber-700" />
            <span className="text-amber-700 font-medium">Donor Dashboard</span>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mx-auto flex items-center justify-center shadow-xl border-4 border-amber-200 mb-8">
            <Gift className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-orange-900 mb-6">
            Thank You for Your Generous Heart! ☕
          </h1>

          <p className="text-xl text-orange-700 mb-8 leading-relaxed">
            Your special table is being set up with care. Soon you'll be able
            to:
          </p>

          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-amber-200 mb-8">
            <ul className="space-y-4 text-left">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <span className="text-orange-700">
                  Connect your wallet and make secure donations
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-orange-700">
                  View transparent fund distribution reports
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span className="text-orange-700">
                  See real-time impact of your contributions
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <span className="text-orange-700">
                  Connect with scholarship recipients
                </span>
              </li>
            </ul>
          </div>

          <p className="text-orange-600 italic">
            ⏰ Coming soon! We're crafting the perfect giving experience for
            you.
          </p>

          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 mt-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
