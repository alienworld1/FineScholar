import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useScholarshipContract } from '../hooks/useScholarshipContract';
import { useMCPService } from '../hooks/useMCPService';
import {
  Heart,
  Coffee,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Gift,
  Eye,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import FloatingElements from './FloatingElements';

interface DonationStats {
  totalDonated: string;
  studentsHelped: number;
  averageScore: number;
  recentTransactions: Array<{
    id: string;
    student: string;
    amount: string;
    timestamp: Date;
    score: number;
  }>;
}

export default function DonorPortal() {
  const { login, logout, authenticated, user } = usePrivy();
  const {
    totalFunds,
    depositFunds,
    getTotalFunds,
    loading: contractLoading,
    isConnected,
  } = useScholarshipContract();

  // We'll keep this for future event monitoring features
  const { startEventMonitoring } = useMCPService();

  const [donationAmount, setDonationAmount] = useState('');
  const [stats, setStats] = useState<DonationStats>({
    totalDonated: '0.0',
    studentsHelped: 0,
    averageScore: 0,
    recentTransactions: [],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load initial data
  useEffect(() => {
    if (authenticated && isConnected) {
      loadDonorStats();
    }
  }, [authenticated, isConnected]);

  // Set up event monitoring
  useEffect(() => {
    if (authenticated && isConnected) {
      const stopMonitoring = startEventMonitoring(event => {
        if (event.type === 'Payout') {
          loadDonorStats(); // Refresh stats when scholarships are distributed
        }
      });
      return stopMonitoring;
    }
  }, [authenticated, isConnected, startEventMonitoring]);

  const loadDonorStats = async () => {
    setIsRefreshing(true);
    try {
      // Fetch real blockchain data from our API
      const response = await fetch('/api/donor-stats');
      const data = await response.json();

      if (data.success) {
        setStats({
          totalDonated: data.data.totalDonated,
          studentsHelped: data.data.studentsHelped,
          averageScore: data.data.averageScore,
          recentTransactions: data.data.recentScholarships || [],
        });
      } else {
        // Fallback to contract data if API fails
        const funds = await getTotalFunds();
        setStats({
          totalDonated: funds,
          studentsHelped: 0,
          averageScore: 0,
          recentTransactions: [],
        });
      }
    } catch (error) {
      console.error('Failed to load donor stats:', error);
      // Fallback to basic contract data
      try {
        const funds = await getTotalFunds();
        setStats({
          totalDonated: funds,
          studentsHelped: 0,
          averageScore: 0,
          recentTransactions: [],
        });
      } catch {
        setStats({
          totalDonated: totalFunds,
          studentsHelped: 0,
          averageScore: 0,
          recentTransactions: [],
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      return;
    }

    try {
      // Clear any previous errors
      setShowError(false);
      setErrorMessage('');

      // Use the actual blockchain deposit function - this now waits for confirmation
      const transactionHash = await depositFunds(donationAmount);

      // Only show success after transaction is confirmed
      setShowSuccess(true);
      setDonationAmount('');

      // Refresh stats immediately after successful transaction
      await loadDonorStats();

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Donation failed:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Donation failed. Please try again.',
      );
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
        <FloatingElements />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* Cafe-style welcome card */}
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl p-12 border-4 border-orange-300 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-500 rounded-full border-4 border-red-600 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Heart className="w-10 h-10 text-red-100 drop-shadow-lg" />
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-orange-900 mb-6 leading-tight">
                Welcome to Our
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mt-2">
                  Donor Cafe ☕
                </span>
              </h1>

              <div className="text-xl text-orange-700 mb-10 leading-relaxed">
                Join our cozy community of generous hearts brewing opportunities
                for deserving students through AI-powered scholarship matching.
              </div>

              <button
                onClick={login}
                className="group relative px-10 py-5 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-red-500/50 transform hover:-translate-y-2 hover:scale-110 transition-all duration-300 border-3 border-red-700 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 to-orange-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 to-orange-300 opacity-80"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-red-700 to-orange-800"></div>

                <div className="relative z-10 flex items-center">
                  <Coffee className="w-6 h-6 mr-3" />
                  <span>Connect & Start Helping</span>
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-r from-orange-100 to-amber-100 border-b-4 border-orange-300 shadow-xl">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-full border-3 border-red-600 flex items-center justify-center shadow-inner">
                  <Heart className="w-6 h-6 text-red-100" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-orange-900">
                    Donor Portal
                  </h1>
                  <p className="text-orange-600">
                    Welcome back, {user?.wallet?.address?.slice(0, 6)}...!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={loadDonorStats}
                  disabled={isRefreshing}
                  className="p-3 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl border-3 border-orange-600 text-orange-900 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                </button>

                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gradient-to-br from-red-400 to-orange-400 text-white rounded-xl font-bold border-3 border-red-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          {/* Success notification */}
          {showSuccess && (
            <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-4 rounded-2xl border-3 border-green-600 shadow-2xl transform animate-bounce">
              <div className="flex items-center">
                <Sparkles className="w-6 h-6 mr-3" />
                <span className="font-bold">
                  Donation confirmed! Thank you for helping students! ✨
                </span>
              </div>
            </div>
          )}

          {/* Error notification */}
          {showError && (
            <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-red-400 to-red-500 text-white px-6 py-4 rounded-2xl border-3 border-red-600 shadow-2xl">
              <div className="flex items-center">
                <RefreshCw className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-bold">Donation Failed</div>
                  <div className="text-sm opacity-90">{errorMessage}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main donation card */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl p-8 border-4 border-orange-300 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-4 border-amber-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Gift className="w-8 h-8 text-amber-100" />
                  </div>

                  <h2 className="text-3xl font-black text-orange-900 mb-3">
                    Brew Some Magic ☕✨
                  </h2>
                  <p className="text-xl text-orange-700 leading-relaxed">
                    Your contribution helps our AI barista match deserving
                    students with perfect scholarship blends
                  </p>
                </div>

                {/* Current pool balance */}
                <div className="bg-gradient-to-r from-amber-200 to-orange-200 rounded-2xl p-6 mb-8 border-3 border-amber-400 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-3 border-green-600 flex items-center justify-center mr-4 shadow-inner">
                        <DollarSign className="w-6 h-6 text-green-100" />
                      </div>
                      <div>
                        <p className="text-orange-800 font-bold">
                          Current Pool Balance
                        </p>
                        <p className="text-2xl font-black text-orange-900">
                          {totalFunds} SEI
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-orange-600">
                        Estimated Scholarships
                      </p>
                      <p className="text-xl font-black text-orange-800">
                        {Math.floor(parseFloat(totalFunds) * 10)} students
                      </p>
                    </div>
                  </div>
                </div>

                {/* Donation form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-bold text-orange-900 mb-3">
                      Donation Amount (SEI)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={donationAmount}
                        onChange={e => setDonationAmount(e.target.value)}
                        placeholder="Enter amount..."
                        className="w-full px-6 py-4 text-xl font-bold text-orange-900 bg-white rounded-2xl border-4 border-orange-300 focus:border-orange-500 focus:outline-none shadow-inner placeholder-orange-400"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-600 font-bold">
                        SEI
                      </div>
                    </div>
                  </div>

                  {/* Quick amount buttons */}
                  <div className="grid grid-cols-4 gap-3">
                    {['0.5', '1.0', '2.5', '5.0'].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className="px-4 py-3 bg-gradient-to-br from-orange-300 to-amber-300 rounded-xl border-3 border-orange-500 font-bold text-orange-900 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        {amount} SEI
                      </button>
                    ))}
                  </div>

                  {/* Donate button */}
                  <button
                    onClick={handleDonate}
                    disabled={!donationAmount || contractLoading}
                    className="w-full py-6 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-red-500/50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-3 border-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center justify-center">
                      {contractLoading ? (
                        <>
                          <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                          <span>Confirming Transaction...</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-6 h-6 mr-3" />
                          <span>Donate with Love</span>
                          <Sparkles className="w-6 h-6 ml-3" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats sidebar */}
            <div className="space-y-6">
              {/* Impact stats */}
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-6 border-4 border-amber-300 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full border-3 border-purple-600 flex items-center justify-center mr-3 shadow-inner">
                    <TrendingUp className="w-5 h-5 text-purple-100" />
                  </div>
                  <h3 className="text-xl font-black text-orange-900">
                    Your Impact
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700 font-bold">
                      Total Donated
                    </span>
                    <span className="text-2xl font-black text-orange-900">
                      {stats.totalDonated} SEI
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700 font-bold">
                      Students Helped
                    </span>
                    <span className="text-2xl font-black text-orange-900">
                      {stats.studentsHelped}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700 font-bold">
                      Avg Merit Score
                    </span>
                    <span className="text-2xl font-black text-orange-900">
                      {stats.averageScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-6 border-4 border-orange-300 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full border-3 border-blue-600 flex items-center justify-center mr-3 shadow-inner">
                    <Activity className="w-5 h-5 text-blue-100" />
                  </div>
                  <h3 className="text-xl font-black text-orange-900">
                    Recent Awards
                  </h3>
                </div>

                <div className="space-y-4">
                  {stats.recentTransactions.map(tx => (
                    <div
                      key={tx.id}
                      className="bg-white/60 rounded-xl p-4 border-2 border-orange-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-orange-900">
                            {tx.student}
                          </p>
                          <p className="text-sm text-orange-600">
                            Score: {tx.score}/100
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">
                            {tx.amount} SEI
                          </p>
                          <p className="text-xs text-orange-500">
                            {tx.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {stats.recentTransactions.length === 0 && (
                  <div className="text-center py-8 text-orange-600">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-bold">No recent activity</p>
                    <p className="text-sm">Scholarships will appear here</p>
                  </div>
                )}
              </div>

              {/* Monitor link */}
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 border-3 border-green-300 shadow-lg">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-green-700 mr-3" />
                  <div>
                    <p className="font-bold text-green-900">
                      Monitor Live Activity
                    </p>
                    <p className="text-sm text-green-600">
                      Track scholarships in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
