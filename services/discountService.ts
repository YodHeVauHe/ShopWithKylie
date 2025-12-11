import { supabase, getAuthToken } from './supabase';
import { DiscountCode } from '../types';

export class DiscountService {
    // Generate a random discount code
    static generateRandomCode(length: number = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Create a new discount code
    static async createDiscountCode(discountData: {
        code?: string;
        discount_percentage: number;
        description?: string;
        max_uses?: number;
        expires_at?: string;
        minimum_amount?: number;
        applicable_products?: string[];
        applicable_categories?: string[];
        created_by: string;
    }): Promise<{ success: boolean; data?: DiscountCode; error?: string }> {
        try {
            const code = discountData.code || this.generateRandomCode();

            // Get the current session to use the user's JWT token
            const authToken = await getAuthToken();

            if (!authToken) {
                throw new Error('User must be authenticated to create discount codes');
            }

            const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;

            const insertData = {
                code: code.toUpperCase(),
                discount_percentage: discountData.discount_percentage,
                description: discountData.description || null,
                max_uses: discountData.max_uses || null,
                uses_count: 0,
                is_active: true,
                expires_at: discountData.expires_at || null,
                minimum_amount: discountData.minimum_amount || null,
                applicable_products: discountData.applicable_products || [],
                applicable_categories: discountData.applicable_categories || [],
                created_by: discountData.created_by,
                created_at: new Date().toISOString()
            };

            const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes`, {
                method: 'POST',
                headers: {
                    'apikey': import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(insertData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const discountCode = Array.isArray(data) ? data[0] : data;

            return { success: true, data: discountCode };
        } catch (error) {
            console.error('Error in createDiscountCode:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Failed to create discount code' };
        }
    }

    // Get all discount codes
    static async getDiscountCodes(): Promise<{ success: boolean; data?: DiscountCode[]; error?: string }> {
        try {
            // Use REST API directly
            const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

            // Get auth token
            const authToken = await getAuthToken();
            const headers: HeadersInit = {
                'apikey': anonKey,
                'Content-Type': 'application/json'
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            } else {
                headers['Authorization'] = `Bearer ${anonKey}`;
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes?order=created_at.desc`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error in getDiscountCodes:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch discount codes' };
        }
    }

    // Validate a discount code
    static async validateDiscountCode(code: string, cartTotal?: number, productIds?: string[]): Promise<{
        success: boolean;
        valid: boolean;
        discountCode?: DiscountCode;
        error?: string
    }> {
        try {
            // Use REST API directly
            const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

            const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes?code=eq.${code.toUpperCase()}&is_active=eq.true&limit=1`, {
                method: 'GET',
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const discountCodes = await response.json();
            const discountCode = discountCodes[0];

            if (!discountCode) {
                return { success: true, valid: false, error: 'Invalid discount code' };
            }

            // Check if code is expired
            if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
                return { success: true, valid: false, error: 'Discount code has expired' };
            }

            // Check if max uses reached
            if (discountCode.max_uses && discountCode.uses_count >= discountCode.max_uses) {
                return { success: true, valid: false, error: 'Discount code has reached maximum uses' };
            }

            // Check minimum amount
            if (discountCode.minimum_amount && cartTotal && cartTotal < discountCode.minimum_amount) {
                return {
                    success: true,
                    valid: false,
                    error: `Minimum order amount of UGX ${discountCode.minimum_amount.toLocaleString()} required`
                };
            }

            // Check applicable products (if specified)
            if (discountCode.applicable_products && discountCode.applicable_products.length > 0 && productIds) {
                const hasApplicableProduct = productIds.some(id => discountCode.applicable_products?.includes(id));
                if (!hasApplicableProduct) {
                    return { success: true, valid: false, error: 'Discount code not applicable to these products' };
                }
            }

            return { success: true, valid: true, discountCode };
        } catch (error) {
            console.error('Error validating discount code:', error);
            return { success: false, valid: false, error: 'Failed to validate discount code' };
        }
    }

    // Update discount code usage count
    static async incrementUsage(codeId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase.rpc('increment_discount_usage', { code_id: codeId });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error incrementing discount usage:', error);
            return { success: false, error: 'Failed to update discount usage' };
        }
    }

    // Delete a discount code
    static async deleteDiscountCode(codeId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
            const authToken = await getAuthToken();

            if (!authToken) {
                throw new Error('User must be authenticated to delete discount codes');
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes?id=eq.${codeId}`, {
                method: 'DELETE',
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting discount code:', error);
            return { success: false, error: 'Failed to delete discount code' };
        }
    }

    // Update discount code
    static async updateDiscountCode(codeId: string, updates: Partial<DiscountCode>): Promise<{
        success: boolean;
        data?: DiscountCode;
        error?: string
    }> {
        try {
            const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
            const authToken = await getAuthToken();

            if (!authToken) {
                throw new Error('User must be authenticated to update discount codes');
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/discount_codes?id=eq.${codeId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const updatedCode = Array.isArray(data) ? data[0] : data;
            return { success: true, data: updatedCode };
        } catch (error) {
            console.error('Error updating discount code:', error);
            return { success: false, error: 'Failed to update discount code' };
        }
    }
}
