import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useScholarshipContract } from '../hooks/useScholarshipContract';
import { useMCPService, type StudentData } from '../hooks/useMCPService';
import {
  BookOpen,
  Coffee,
  Brain,
  Star,
  Award,
  Sparkles,
  ArrowRight,
  RefreshCw,
  GraduationCap,
  Heart,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import FloatingElements from './FloatingElements';

type ApplicationStatus = 'idle' | 'processing' | 'success' | 'error';

export default function StudentPortal() {
  const { login, logout, authenticated, user } = usePrivy();
  const {
    isVerified,
    meritScore,
    hasReceivedScholarship,
    submitStudentApplication,
    loading: contractLoading,
  } = useScholarshipContract();
  const { calculateMeritScore, processStudentApplication, isProcessing } =
    useMCPService();

  const [formData, setFormData] = useState<Partial<StudentData>>({
    studentId: '',
    gpa: 0,
    financialNeed: 0,
    volunteerHours: 0,
    academicYear: '',
    major: '',
    university: '',
    additionalInfo: '',
  });

  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus>('idle');
  const [meritPreview, setMeritPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInputChange = (
    field: keyof StudentData,
    value: string | number,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const previewMeritScore = async () => {
    if (!isFormValid()) return;

    setShowPreview(true);
    try {
      const studentData: StudentData = {
        ...formData,
        address: user?.wallet?.address || '',
      } as StudentData;

      const result = await calculateMeritScore(studentData);
      setMeritPreview(result);
    } catch (error) {
      console.error('Merit preview failed:', error);
    }
  };

  const submitApplication = async () => {
    if (!isFormValid() || !user?.wallet?.address) return;

    setApplicationStatus('processing');
    setErrorMessage(''); // Clear any previous errors

    try {
      const studentData: StudentData = {
        ...formData,
        address: user.wallet.address,
      } as StudentData;

      const result = await processStudentApplication(studentData);

      if (result.success) {
        setApplicationStatus('success');
      } else {
        setApplicationStatus('error');
        setErrorMessage(result.error || 'Application processing failed');
      }
    } catch (error) {
      console.error('Application failed:', error);
      setApplicationStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Application failed',
      );
    }
  };

  const isFormValid = () => {
    return (
      formData.studentId &&
      formData.gpa &&
      formData.major &&
      formData.university &&
      formData.academicYear
    );
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
        <FloatingElements />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-12 border-4 border-blue-300 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full border-4 border-blue-600 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <BookOpen className="w-10 h-10 text-blue-100 drop-shadow-lg" />
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-6 leading-tight">
                Welcome to Our
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500 mt-2">
                  Study Lounge 📚
                </span>
              </h1>

              <div className="text-xl text-blue-700 mb-10 leading-relaxed">
                Grab a coffee and let our AI assess your academic achievements
                to match you with perfect scholarship opportunities.
              </div>

              <button
                onClick={login}
                className="group relative px-10 py-5 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-2 hover:scale-110 transition-all duration-300 border-3 border-blue-700 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-300 to-blue-300 opacity-80"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-700 to-indigo-800"></div>

                <div className="relative z-10 flex items-center">
                  <Coffee className="w-6 h-6 mr-3" />
                  <span>Connect & Apply</span>
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
        <header className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b-4 border-blue-300 shadow-xl">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full border-3 border-blue-600 flex items-center justify-center shadow-inner">
                  <BookOpen className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-blue-900">
                    Student Portal
                  </h1>
                  <p className="text-blue-600">
                    Hello, future scholar! {user?.wallet?.address?.slice(0, 6)}
                    ...
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 bg-gradient-to-br from-blue-400 to-indigo-400 text-white rounded-xl font-bold border-3 border-blue-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 border-4 border-green-300 shadow-xl">
              <div className="flex items-center mb-4">
                {isVerified ? (
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-orange-500 mr-3" />
                )}
                <div>
                  <p className="font-black text-green-900">
                    Verification Status
                  </p>
                  <p
                    className={`text-sm ${isVerified ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {isVerified ? 'Verified Student ✓' : 'Pending Verification'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-purple-300 shadow-xl">
              <div className="flex items-center mb-4">
                <Star className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="font-black text-purple-900">Merit Score</p>
                  <p className="text-2xl font-black text-purple-800">
                    {meritScore}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-6 border-4 border-orange-300 shadow-xl">
              <div className="flex items-center mb-4">
                <Award className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="font-black text-orange-900">
                    Scholarship Status
                  </p>
                  <p
                    className={`text-sm ${hasReceivedScholarship ? 'text-green-600' : 'text-gray-600'}`}
                  >
                    {hasReceivedScholarship
                      ? 'Received! 🎉'
                      : 'Not yet awarded'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Application Form */}
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 border-4 border-blue-300 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full border-4 border-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <GraduationCap className="w-8 h-8 text-indigo-100" />
                </div>

                <h2 className="text-3xl font-black text-blue-900 mb-3">
                  Scholarship Application ☕
                </h2>
                <p className="text-xl text-blue-700 leading-relaxed">
                  Let our AI barista blend your achievements into the perfect
                  scholarship match
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-900 font-bold mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={formData.studentId || ''}
                      onChange={e =>
                        handleInputChange('studentId', e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white shadow-inner"
                      placeholder="STU001"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-900 font-bold mb-2">
                      GPA (0-4.0)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa || ''}
                      onChange={e =>
                        handleInputChange(
                          'gpa',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white shadow-inner"
                      placeholder="3.8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-900 font-bold mb-2">
                      Financial Need (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.financialNeed || ''}
                      onChange={e =>
                        handleInputChange(
                          'financialNeed',
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white shadow-inner"
                      placeholder="75"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-900 font-bold mb-2">
                      Volunteer Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.volunteerHours || ''}
                      onChange={e =>
                        handleInputChange(
                          'volunteerHours',
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white shadow-inner"
                      placeholder="120"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-900 font-bold mb-2">
                      Academic Year
                    </label>
                    <select
                      value={formData.academicYear || ''}
                      onChange={e =>
                        handleInputChange('academicYear', e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white shadow-inner"
                    >
                      <option value="">Select Year</option>
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-blue-900 font-bold mb-2">
                      Major
                    </label>
                    <input
                      type="text"
                      value={formData.major || ''}
                      onChange={e => handleInputChange('major', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white shadow-inner"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-900 font-bold mb-2">
                    University
                  </label>
                  <input
                    type="text"
                    value={formData.university || ''}
                    onChange={e =>
                      handleInputChange('university', e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white shadow-inner"
                    placeholder="Tech University"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 font-bold mb-2">
                    Additional Information
                  </label>
                  <textarea
                    value={formData.additionalInfo || ''}
                    onChange={e =>
                      handleInputChange('additionalInfo', e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white shadow-inner resize-none"
                    placeholder="Tell us about your achievements, challenges, and goals..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={previewMeritScore}
                    disabled={!isFormValid() || isProcessing}
                    className="flex-1 py-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl font-bold border-3 border-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Preview Score
                    </div>
                  </button>

                  <button
                    onClick={submitApplication}
                    disabled={
                      !isFormValid() || applicationStatus === 'processing'
                    }
                    className="flex-1 py-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl font-bold border-3 border-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center">
                      {applicationStatus === 'processing' ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Submit Application
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Merit Score Preview / Results */}
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 border-4 border-amber-300 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-4 border-amber-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <TrendingUp className="w-8 h-8 text-amber-100" />
                </div>
                <h3 className="text-2xl font-black text-amber-900">
                  AI Merit Assessment
                </h3>
              </div>

              {!showPreview && !meritPreview && (
                <div className="text-center py-12 text-amber-600">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-bold">Ready for Analysis</p>
                  <p>
                    Fill out the form and click "Preview Score" to see your
                    merit assessment
                  </p>
                </div>
              )}

              {showPreview && !meritPreview && (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-amber-600" />
                  <p className="text-lg font-bold text-amber-900">
                    AI Analyzing Your Profile...
                  </p>
                  <p className="text-amber-600">
                    Our coffee-powered AI is brewing your perfect score
                  </p>
                </div>
              )}

              {meritPreview && (
                <div className="space-y-6">
                  {/* Score Display */}
                  <div className="bg-white/60 rounded-2xl p-6 border-3 border-amber-400 text-center">
                    <p className="text-lg font-bold text-amber-800 mb-2">
                      Your Merit Score
                    </p>
                    <p className="text-5xl font-black text-amber-900 mb-2">
                      {meritPreview.score}/100
                    </p>
                    <div className="flex justify-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.floor(meritPreview.score / 20)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-black text-amber-900">
                      Score Breakdown:
                    </h4>

                    <div className="bg-white/40 rounded-xl p-4 border-2 border-amber-300">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-amber-800">
                          GPA Score
                        </span>
                        <span className="text-xl font-black text-amber-900">
                          {meritPreview.breakdown.gpaScore}/50
                        </span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                          style={{
                            width: `${(meritPreview.breakdown.gpaScore / 50) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/40 rounded-xl p-4 border-2 border-amber-300">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-amber-800">
                          Financial Need
                        </span>
                        <span className="text-xl font-black text-amber-900">
                          {meritPreview.breakdown.financialNeedScore}/30
                        </span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-400 to-pink-500 h-2 rounded-full"
                          style={{
                            width: `${(meritPreview.breakdown.financialNeedScore / 30) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/40 rounded-xl p-4 border-2 border-amber-300">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-amber-800">
                          Volunteer Hours
                        </span>
                        <span className="text-xl font-black text-amber-900">
                          {meritPreview.breakdown.volunteerScore}/20
                        </span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                          style={{
                            width: `${(meritPreview.breakdown.volunteerScore / 20) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-white/60 rounded-xl p-4 border-2 border-amber-300">
                    <h4 className="font-bold text-amber-900 mb-2 flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      AI Analysis:
                    </h4>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      {meritPreview.reasoning}
                    </p>
                  </div>
                </div>
              )}

              {applicationStatus === 'success' && (
                <div className="bg-green-100 border-3 border-green-400 rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-xl font-black text-green-900 mb-2">
                    Application Submitted! 🎉
                  </h4>
                  <p className="text-green-700">
                    Your application has been processed and submitted to the
                    blockchain.
                  </p>
                </div>
              )}

              {applicationStatus === 'error' && (
                <div className="bg-red-100 border-3 border-red-400 rounded-xl p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h4 className="text-xl font-black text-red-900 mb-2">
                    Application Failed
                  </h4>
                  <p className="text-red-700 mb-2">
                    {errorMessage ||
                      'There was an error processing your application.'}
                  </p>
                  <p className="text-red-600 text-sm">
                    Please check your details and try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
