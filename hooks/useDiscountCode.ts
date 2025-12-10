import { useState, useCallback } from 'react';
import { DiscountService } from '../services/discountService';
import { DiscountCode } from '../types';

interface UseDiscountCodeReturn {
  discountCode: DiscountCode | null;
  isLoading: boolean;
  error: string | null;
  validateCode: (code: string, cartTotal?: number, productIds?: string[]) => Promise<boolean>;
  clearDiscount: () => void;
  applyDiscount: () => Promise<void>;
}

export const useDiscountCode = (): UseDiscountCodeReturn => {
  const [discountCode, setDiscountCode] = useState<DiscountCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCode = useCallback(async (
    code: string, 
    cartTotal?: number, 
    productIds?: string[]
  ): Promise<boolean> => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await DiscountService.validateDiscountCode(code, cartTotal, productIds);
      
      if (result.success) {
        if (result.valid && result.discountCode) {
          setDiscountCode(result.discountCode);
          return true;
        } else {
          setError(result.error || 'Invalid discount code');
          return false;
        }
      } else {
        setError(result.error || 'Failed to validate discount code');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDiscount = useCallback(() => {
    setDiscountCode(null);
    setError(null);
  }, []);

  const applyDiscount = useCallback(async () => {
    if (!discountCode) return;

    try {
      await DiscountService.incrementUsage(discountCode.id);
      // Discount has been successfully applied and usage tracked
    } catch (error) {
      console.error('Failed to track discount usage:', error);
      // Don't show error to user as discount was already applied
    }
  }, [discountCode]);

  return {
    discountCode,
    isLoading,
    error,
    validateCode,
    clearDiscount,
    applyDiscount,
  };
};
