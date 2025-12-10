import React, { useEffect, useState } from 'react';
import { Gift, Copy, Trash2, Clock, Users, Tag, Check } from 'lucide-react';
import { DiscountCode } from '../types';

export interface DiscountCodesProps {
  onGenerateCode: () => void;
  onCopyCode: (code: string) => void;
  onDeleteCode: (id: string) => void;
  discountCodes: DiscountCode[];
  loading?: boolean;
}

const DiscountCodes: React.FC<DiscountCodesProps> = ({
  onGenerateCode,
  onCopyCode,
  onDeleteCode,
  discountCodes = [],
  loading = false,
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold">Checkout Discount Codes</h1>
            <p className="text-gray-400">Generate & manage codes</p>
          </div>
          <button
            onClick={onGenerateCode}
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Gift className="w-5 h-5 mr-2" />
            <span>Generate Code</span>
          </button>
        </div>

        {/* Discount Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discountCodes.length > 0 ? (
            discountCodes.map((code) => (
              <div key={code.id} className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-2xl font-bold mr-2">{code.code}</span>
                      <span className="bg-purple-600 text-xs font-medium px-2 py-0.5 rounded">
                        {code.discount_percentage}% OFF
                      </span>
                    </div>
                    <span className="inline-flex items-center text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                      <Check className="w-3 h-3 mr-1" /> Active
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onCopyCode(code.code)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Copy code"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDeleteCode(code.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete code"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <p className="font-medium text-white">{code.description || 'No description'}</p>
                  
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{code.uses_count || 0}/{code.max_uses || '∞'} uses</span>
                  </div>
                  
                  {code.expires_at && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Expires {formatDate(code.expires_at)}</span>
                    </div>
                  )}
                  
                  {code.minimum_amount && (
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Min: {formatCurrency(code.minimum_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-lg">No discount codes yet</p>
              <p className="text-sm">Click "Generate Code" to create your first discount</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountCodes;
