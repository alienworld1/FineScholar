import { useState } from 'react';
import { useEnrollmentNFT } from '../hooks/useEnrollmentNFT';
import {
  Shield,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Award,
  RefreshCw,
  Sparkles,
  University,
} from 'lucide-react';

interface EnrollmentVerificationProps {
  onVerificationComplete?: () => void;
}

export default function EnrollmentVerification({
  onVerificationComplete,
}: EnrollmentVerificationProps) {
  const {
    loading,
    error,
    hasActiveEnrollment,
    requestEnrollmentNFT,
    uploadEnrollmentDocument,
  } = useEnrollmentNFT();

  const [verificationMethod, setVerificationMethod] = useState<
    'nft' | 'document' | null
  >(null);
  const [nftFormData, setNftFormData] = useState({
    university: '',
    studentId: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<{
    type: 'success' | 'error' | 'processing' | null;
    message: string;
    transactionHash?: string;
  }>({ type: null, message: '' });

  const handleNFTRequest = async () => {
    if (!nftFormData.university || !nftFormData.studentId) {
      return;
    }

    setVerificationStatus({
      type: 'processing',
      message: 'Requesting enrollment NFT...',
    });

    try {
      const result = await requestEnrollmentNFT(
        nftFormData.university,
        nftFormData.studentId,
      );

      setVerificationStatus({
        type: 'success',
        message:
          'Enrollment NFT requested successfully! It will be minted by an admin after verification.',
        transactionHash: result.transactionHash,
      });

      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error) {
      setVerificationStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to request NFT',
      });
    }
  };

  const handleDocumentUpload = async () => {
    if (!uploadedFile) {
      return;
    }

    setVerificationStatus({
      type: 'processing',
      message: 'Uploading and verifying document...',
    });

    try {
      const result = await uploadEnrollmentDocument(uploadedFile);

      setVerificationStatus({
        type: 'success',
        message:
          'Document uploaded and hash stored on blockchain! Awaiting admin verification.',
        transactionHash: result.transactionHash,
      });

      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error) {
      setVerificationStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to upload document',
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (only allow PDFs and images)
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
      ];
      if (!allowedTypes.includes(file.type)) {
        setVerificationStatus({
          type: 'error',
          message: 'Please upload a PDF or image file (JPG, PNG, PDF)',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setVerificationStatus({
          type: 'error',
          message: 'File size must be less than 5MB',
        });
        return;
      }

      setUploadedFile(file);
      setVerificationStatus({ type: null, message: '' });
    }
  };

  if (hasActiveEnrollment) {
    return (
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 border-4 border-green-300 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-green-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle className="w-8 h-8 text-green-100" />
          </div>

          <h3 className="text-2xl font-black text-green-900 mb-3">
            Enrollment Verified! 🎉
          </h3>
          <p className="text-green-700 leading-relaxed">
            Your enrollment has been successfully verified. You can now apply
            for scholarships.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl p-8 border-4 border-purple-300 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full border-4 border-purple-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Shield className="w-8 h-8 text-purple-100" />
        </div>

        <h3 className="text-2xl font-black text-purple-900 mb-3">
          Verify Your Enrollment 🎓
        </h3>
        <p className="text-purple-700 leading-relaxed">
          To receive scholarships, you need to verify your university
          enrollment. Choose one of the methods below:
        </p>
      </div>

      {/* Status Messages */}
      {verificationStatus.type && (
        <div
          className={`mb-6 p-4 rounded-xl border-3 ${
            verificationStatus.type === 'success'
              ? 'bg-green-100 border-green-400 text-green-700'
              : verificationStatus.type === 'error'
                ? 'bg-red-100 border-red-400 text-red-700'
                : 'bg-blue-100 border-blue-400 text-blue-700'
          }`}
        >
          <div className="flex items-center">
            {verificationStatus.type === 'processing' && (
              <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
            )}
            {verificationStatus.type === 'success' && (
              <CheckCircle className="w-5 h-5 mr-3" />
            )}
            {verificationStatus.type === 'error' && (
              <AlertCircle className="w-5 h-5 mr-3" />
            )}
            <div>
              <p className="font-bold">{verificationStatus.message}</p>
              {verificationStatus.transactionHash && (
                <a
                  href={`https://seitrace.com/tx/${verificationStatus.transactionHash}?chain=atlantic-2`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:no-underline mt-1 inline-block"
                >
                  View Transaction
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl border-3 bg-red-100 border-red-400 text-red-700">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <p className="font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Method Selection */}
      {!verificationMethod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setVerificationMethod('nft')}
            className="p-6 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl border-3 border-blue-400 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-center">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h4 className="text-xl font-black text-blue-900 mb-2">
                Request Enrollment NFT
              </h4>
              <p className="text-blue-700 text-sm">
                Provide your university details and get a verification NFT
                minted to your wallet.
              </p>
            </div>
          </button>

          <button
            onClick={() => setVerificationMethod('document')}
            className="p-6 bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl border-3 border-orange-400 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-center">
              <FileText className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <h4 className="text-xl font-black text-orange-900 mb-2">
                Upload Document
              </h4>
              <p className="text-orange-700 text-sm">
                Upload an enrollment letter or transcript. Its hash will be
                stored on-chain.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* NFT Request Form */}
      {verificationMethod === 'nft' && (
        <div className="space-y-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setVerificationMethod(null)}
              className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition-colors mr-3"
            >
              ← Back
            </button>
            <h4 className="text-xl font-black text-purple-900">
              Request Enrollment NFT
            </h4>
          </div>

          <div>
            <label className="block text-purple-900 font-bold mb-2">
              University Name
            </label>
            <input
              type="text"
              value={nftFormData.university}
              onChange={e =>
                setNftFormData(prev => ({
                  ...prev,
                  university: e.target.value,
                }))
              }
              className="w-full px-4 py-3 rounded-xl border-3 border-purple-300 focus:border-purple-500 focus:outline-none bg-white shadow-inner"
              placeholder="e.g., Harvard University"
            />
          </div>

          <div>
            <label className="block text-purple-900 font-bold mb-2">
              Student ID
            </label>
            <input
              type="text"
              value={nftFormData.studentId}
              onChange={e =>
                setNftFormData(prev => ({ ...prev, studentId: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border-3 border-purple-300 focus:border-purple-500 focus:outline-none bg-white shadow-inner"
              placeholder="e.g., STU123456"
            />
          </div>

          <button
            onClick={handleNFTRequest}
            disabled={
              loading || !nftFormData.university || !nftFormData.studentId
            }
            className="w-full py-4 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-xl font-bold border-3 border-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center">
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <University className="w-5 h-5 mr-2" />
                  Request NFT
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Document Upload Form */}
      {verificationMethod === 'document' && (
        <div className="space-y-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setVerificationMethod(null)}
              className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition-colors mr-3"
            >
              ← Back
            </button>
            <h4 className="text-xl font-black text-purple-900">
              Upload Enrollment Document
            </h4>
          </div>

          <div className="border-3 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="enrollment-document"
            />
            <label htmlFor="enrollment-document" className="cursor-pointer">
              <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <p className="text-lg font-bold text-purple-900 mb-2">
                {uploadedFile
                  ? uploadedFile.name
                  : 'Click to upload enrollment document'}
              </p>
              <p className="text-purple-600 text-sm">
                Supported formats: PDF, JPG, PNG (max 5MB)
              </p>
            </label>
          </div>

          {uploadedFile && (
            <div className="bg-white/60 rounded-xl p-4 border-2 border-purple-300">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="font-bold text-purple-900">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-purple-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleDocumentUpload}
            disabled={loading || !uploadedFile}
            className="w-full py-4 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl font-bold border-3 border-orange-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center">
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Upload & Verify
                </>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
