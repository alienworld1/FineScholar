import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useScholarshipContract } from '../hooks/useScholarshipContract';
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Star,
  DollarSign,
  Clock,
  Eye,
  Award,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import FloatingElements from './FloatingElements';

interface PendingApplication {
  id: string;
  studentAddress: string;
  studentId: string;
  university: string;
  major: string;
  gpa: number;
  financialNeed: number;
  volunteerHours: number;
  meritScore: number;
  aiReasoning: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  estimatedAmount: string;
}

const AdminWalletAddress = import.meta.env.VITE_ADMIN_WALLET_ADDRESS!;

export default function AdminDashboard() {
  const { login, logout, authenticated, user } = usePrivy();
  const { totalFunds, loading: contractLoading } = useScholarshipContract();

  const [pendingApplications, setPendingApplications] = useState<
    PendingApplication[]
  >([]);
  const [approvedApplications, setApprovedApplications] = useState<
    PendingApplication[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved'>(
    'pending',
  );
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const isAdmin = user?.wallet?.address === AdminWalletAddress;

  useEffect(() => {
    if (authenticated && isAdmin) {
      loadApplications();
    }
  }, [authenticated, isAdmin]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/applications');
      const data = await response.json();

      if (data.success) {
        setPendingApplications(data.data.pending || []);
        setApprovedApplications(data.data.approved || []);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    setProcessingIds(prev => new Set([...prev, applicationId]));

    try {
      const response = await fetch('/api/admin/approve-scholarship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      });

      const result = await response.json();

      if (result.success) {
        // Move application from pending to approved
        const application = pendingApplications.find(
          app => app.id === applicationId,
        );
        if (application) {
          setApprovedApplications(prev => [
            ...prev,
            { ...application, status: 'approved' },
          ]);
          setPendingApplications(prev =>
            prev.filter(app => app.id !== applicationId),
          );
        }
      } else {
        alert(`Failed to approve scholarship: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to approve scholarship:', error);
      alert('Failed to approve scholarship. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    setProcessingIds(prev => new Set([...prev, applicationId]));

    try {
      const response = await fetch('/api/admin/reject-scholarship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove from pending applications
        setPendingApplications(prev =>
          prev.filter(app => app.id !== applicationId),
        );
      } else {
        alert(`Failed to reject application: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const distributeScholarship = async (applicationId: string) => {
    setProcessingIds(prev => new Set([...prev, applicationId]));

    try {
      const response = await fetch('/api/admin/distribute-scholarship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Scholarship distributed! TX: ${result.transactionHash}`);
        loadApplications(); // Reload to update status
      } else {
        alert(`Failed to distribute scholarship: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to distribute scholarship:', error);
      alert('Failed to distribute scholarship. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl p-12 border-4 border-red-300 shadow-2xl">
              <Shield className="w-20 h-20 text-red-600 mx-auto mb-8" />
              <h1 className="text-4xl font-black text-red-900 mb-6">
                Admin Dashboard
              </h1>
              <p className="text-xl text-red-700 mb-10">
                Connect your admin wallet to manage scholarships
              </p>
              <button
                onClick={login}
                className="px-10 py-5 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-3 border-red-700"
              >
                Connect Admin Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl p-12 border-4 border-red-300 shadow-2xl">
              <AlertCircle className="w-20 h-20 text-red-600 mx-auto mb-8" />
              <h1 className="text-4xl font-black text-red-900 mb-6">
                Access Denied
              </h1>
              <p className="text-xl text-red-700 mb-10">
                This dashboard is only accessible to authorized administrators.
              </p>
              <button
                onClick={logout}
                className="px-10 py-5 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-3 border-red-700"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-r from-red-100 to-pink-100 border-b-4 border-red-300 shadow-xl">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full border-3 border-red-600 flex items-center justify-center shadow-inner">
                  <Shield className="w-6 h-6 text-red-100" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-red-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-red-600">Scholarship Management System</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-red-600">Available Funds</p>
                  <p className="text-xl font-black text-red-900">
                    {totalFunds} SEI
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gradient-to-br from-red-400 to-pink-400 text-white rounded-xl font-bold border-3 border-red-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-6 py-3 rounded-xl font-bold border-3 transition-all duration-200 ${
                selectedTab === 'pending'
                  ? 'bg-gradient-to-br from-orange-400 to-red-400 text-white border-orange-600'
                  : 'bg-white text-red-900 border-red-300 hover:border-red-400'
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Pending Applications ({pendingApplications.length})
            </button>
            <button
              onClick={() => setSelectedTab('approved')}
              className={`px-6 py-3 rounded-xl font-bold border-3 transition-all duration-200 ${
                selectedTab === 'approved'
                  ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white border-green-600'
                  : 'bg-white text-red-900 border-red-300 hover:border-red-400'
              }`}
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Approved Applications ({approvedApplications.length})
            </button>
            <button
              onClick={loadApplications}
              disabled={loading}
              className="px-4 py-3 bg-gradient-to-br from-blue-400 to-indigo-400 text-white rounded-xl font-bold border-3 border-blue-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            {selectedTab === 'pending' &&
              pendingApplications.map(app => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={() => handleApproveApplication(app.id)}
                  onReject={() => handleRejectApplication(app.id)}
                  isProcessing={processingIds.has(app.id)}
                  showApprovalActions={true}
                />
              ))}

            {selectedTab === 'approved' &&
              approvedApplications.map(app => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onDistribute={() => distributeScholarship(app.id)}
                  isProcessing={processingIds.has(app.id)}
                  showDistributionActions={true}
                />
              ))}

            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-red-600" />
                <p className="text-lg font-bold text-red-900">
                  Loading applications...
                </p>
              </div>
            )}

            {!loading &&
              selectedTab === 'pending' &&
              pendingApplications.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50 text-red-400" />
                  <p className="text-lg font-bold text-red-900">
                    No pending applications
                  </p>
                </div>
              )}

            {!loading &&
              selectedTab === 'approved' &&
              approvedApplications.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-green-400" />
                  <p className="text-lg font-bold text-red-900">
                    No approved applications
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Application Card Component
function ApplicationCard({
  application,
  onApprove,
  onReject,
  onDistribute,
  isProcessing,
  showApprovalActions,
  showDistributionActions,
}: {
  application: PendingApplication;
  onApprove?: () => void;
  onReject?: () => void;
  onDistribute?: () => void;
  isProcessing: boolean;
  showApprovalActions?: boolean;
  showDistributionActions?: boolean;
}) {
  return (
    <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-8 border-4 border-pink-300 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info */}
        <div className="lg:col-span-2">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full border-3 border-purple-600 flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-purple-100" />
            </div>
            <div>
              <h3 className="text-xl font-black text-purple-900">
                Student ID: {application.studentId}
              </h3>
              <p className="text-purple-600">
                {application.university} • {application.major}
              </p>
              <p className="text-sm text-gray-600">
                {application.studentAddress}
              </p>
            </div>
          </div>

          {/* Academic Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white/60 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-sm font-bold text-purple-800">GPA</p>
              <p className="text-2xl font-black text-purple-900">
                {application.gpa}/4.0
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-sm font-bold text-purple-800">
                Financial Need
              </p>
              <p className="text-2xl font-black text-purple-900">
                {application.financialNeed}/100
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-sm font-bold text-purple-800">Volunteer Hrs</p>
              <p className="text-2xl font-black text-purple-900">
                {application.volunteerHours}
              </p>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 border-3 border-amber-300">
            <h4 className="font-black text-amber-900 mb-2 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              AI Analysis:
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed mb-2">
              {application.aiReasoning}
            </p>
            <p className="text-xs text-amber-600">
              Submitted:{' '}
              {new Date(application.submissionDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Merit Score & Actions */}
        <div className="space-y-4">
          {/* Merit Score */}
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 border-4 border-green-400 text-center">
            <div className="flex justify-center space-x-1 mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.floor(application.meritScore / 20)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-3xl font-black text-green-900 mb-1">
              {application.meritScore}/100
            </p>
            <p className="text-sm font-bold text-green-700">Merit Score</p>
          </div>

          {/* Estimated Amount */}
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-4 border-3 border-blue-300 text-center">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-black text-blue-900">
              {application.estimatedAmount} SEI
            </p>
            <p className="text-sm text-blue-600">Estimated Award</p>
          </div>

          {/* Action Buttons */}
          {showApprovalActions && (
            <div className="space-y-3">
              <button
                onClick={onApprove}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl font-bold border-3 border-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Approve
                  </>
                )}
              </button>
              <button
                onClick={onReject}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl font-bold border-3 border-red-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5 inline mr-2" />
                    Reject
                  </>
                )}
              </button>
            </div>
          )}

          {showDistributionActions && (
            <button
              onClick={onDistribute}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl font-bold border-3 border-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                <>
                  <Award className="w-5 h-5 inline mr-2" />
                  Distribute Scholarship
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
