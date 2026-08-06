import React from 'react';
import { CheckCircle, Clock, FileText, AlertCircle, ArrowDownRight, Award } from 'lucide-react';

interface BidTrackingProps {
  status: string;
  submittedAt?: string;
  evaluation?: {
    technicalScore?: number;
    financialScore?: number;
    totalScore?: number;
    technicalRemarks?: string;
    financialRemarks?: string;
    overallRemarks?: string;
    isRecommended?: boolean;
    evaluatedAt?: string;
  };
  withdrawnAt?: string;
  withdrawalReason?: string;
  tenderDeadline?: string;
}

const statusSteps = [
  { key: 'draft', label: 'Draft', icon: FileText },
  { key: 'submitted', label: 'Submitted', icon: CheckCircle },
  { key: 'under_review', label: 'Under Review', icon: Clock },
  { key: 'accepted', label: 'Awarded', icon: Award },
];

const rejectedStatus = { key: 'rejected', label: 'Rejected', icon: AlertCircle };
const withdrawnStatus = { key: 'withdrawn', label: 'Withdrawn', icon: ArrowDownRight };

export default function BidTracking({ 
  status, 
  submittedAt, 
  evaluation, 
  withdrawnAt, 
  withdrawalReason,
  tenderDeadline 
}: BidTrackingProps) {
  const currentIndex = statusSteps.findIndex(s => s.key === status);
  const isRejected = status === 'rejected';
  const isWithdrawn = status === 'withdrawn';
  const isComplete = isRejected || isWithdrawn || status === 'accepted';

  const getStatusColor = (stepKey: string) => {
    if (isWithdrawn && stepKey !== 'draft') return 'bg-gray-200 text-gray-400';
    if (isRejected && stepKey !== 'draft' && stepKey !== 'submitted' && stepKey !== 'under_review') return 'bg-red-100 text-red-600';
    
    if (stepKey === 'accepted' && status === 'accepted') return 'bg-green-500 text-white';
    if (stepKey === 'under_review' && ['under_review', 'accepted', 'rejected'].includes(status)) return 'bg-blue-500 text-white';
    if (stepKey === 'submitted' && ['submitted', 'under_review', 'accepted', 'rejected'].includes(status)) return 'bg-blue-500 text-white';
    if (stepKey === 'draft' && currentIndex >= 0) return 'bg-blue-500 text-white';
    
    return 'bg-gray-200 text-gray-400';
  };

  const getConnectorColor = (index: number) => {
    if (isWithdrawn) return 'bg-gray-200';
    if (isRejected && index >= 2) return 'bg-red-200';
    if (index < currentIndex) return 'bg-blue-500';
    if (index === currentIndex && !isComplete) return 'bg-blue-200 animate-pulse';
    return 'bg-gray-200';
  };

  return (
    <div className="w-full">
      {/* Timeline */}
      <div className="flex items-center justify-between mb-8">
        {statusSteps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${getStatusColor(step.key)}`}
              >
                <step.icon size={20} />
              </div>
              <span className={`text-xs font-semibold mt-2 ${
                currentIndex >= index ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index === 1 && submittedAt && (
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(submittedAt).toLocaleDateString('en-IN')}
                </span>
              )}
              {index === 2 && evaluation?.evaluatedAt && (
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(evaluation.evaluatedAt).toLocaleDateString('en-IN')}
                </span>
              )}
            </div>
            {index < statusSteps.length - 1 && (
              <div className={`w-12 h-1 flex-1 mx-2 ${getConnectorColor(index)}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Final Status */}
      {(isRejected || isWithdrawn) && (
        <div className={`p-4 rounded-xl mb-6 ${
          isRejected ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isRejected ? (
              <AlertCircle size={20} className="text-red-600" />
            ) : (
              <ArrowDownRight size={20} className="text-gray-600" />
            )}
            <span className={`font-bold ${isRejected ? 'text-red-900' : 'text-gray-900'}`}>
              {isRejected ? 'Bid Rejected' : 'Bid Withdrawn'}
            </span>
          </div>
          {isWithdrawn && withdrawalReason && (
            <p className="text-sm text-gray-600">{withdrawalReason}</p>
          )}
          {isWithdrawn && withdrawnAt && (
            <p className="text-xs text-gray-500 mt-1">
              Withdrawn on {new Date(withdrawnAt).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
      )}

      {/* Evaluation Details */}
      {evaluation && evaluation.totalScore !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={20} className="text-blue-600" />
            Evaluation Results
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Technical Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {evaluation.technicalScore ?? 'N/A'}
                <span className="text-sm text-gray-400">/100</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Financial Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {evaluation.financialScore ?? 'N/A'}
                <span className="text-sm text-gray-400">/100</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Total Score</p>
              <p className={`text-2xl font-bold ${
                (evaluation.totalScore ?? 0) >= 70 ? 'text-green-600' :
                (evaluation.totalScore ?? 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {evaluation.totalScore ?? 'N/A'}
                <span className="text-sm text-gray-400">/100</span>
              </p>
            </div>
          </div>
          {evaluation.technicalRemarks && (
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">Technical Remarks</p>
              <p className="text-sm text-gray-600">{evaluation.technicalRemarks}</p>
            </div>
          )}
          {evaluation.financialRemarks && (
            <div className="mt-2 p-3 bg-white rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">Financial Remarks</p>
              <p className="text-sm text-gray-600">{evaluation.financialRemarks}</p>
            </div>
          )}
          {evaluation.overallRemarks && (
            <div className="mt-2 p-3 bg-white rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">Overall Remarks</p>
              <p className="text-sm text-gray-600">{evaluation.overallRemarks}</p>
            </div>
          )}
        </div>
      )}

      {/* Deadline Info */}
      {tenderDeadline && !isComplete && (
        <div className={`p-4 rounded-xl ${
          new Date(tenderDeadline) < Date.now() ? 'bg-red-50 border border-red-200' :
          new Date(tenderDeadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 
            ? 'bg-orange-50 border border-orange-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            <Clock size={18} className={
              new Date(tenderDeadline) < Date.now() ? 'text-red-600' :
              new Date(tenderDeadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 
                ? 'text-orange-600' 
                : 'text-green-600'
            } />
            <span className={`text-sm font-medium ${
              new Date(tenderDeadline) < Date.now() ? 'text-red-900' :
              new Date(tenderDeadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 
                ? 'text-orange-900' 
                : 'text-green-900'
            }`}>
              {new Date(tenderDeadline) < Date.now() ? 'Deadline Passed' : 
                `Deadline: ${new Date(tenderDeadline).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}