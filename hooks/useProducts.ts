import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Product } from '../types';

// Query keys for cache management
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

// Fetch all products
async function fetchProducts(): Promise<Product[]> {
    try {
        // Use REST API directly with environment variables
        const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
        
        const response = await fetch(`${supabaseUrl}/rest/v1/products?order=created_at.desc`, {
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

        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Error fetching products:', err);
        return [];
    }
}

// Fetch single product
async function fetchProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// Create product
async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// Update product
async function updateProduct({ id, ...updates }: Partial<Product> & { id: string }): Promise<Product> {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// Delete product
async function deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}

// Apply discount to products
async function applyDiscount(productIds: string[], discountPercentage: number): Promise<void> {
    const { error } = await supabase
        .from('products')
        .update({ discount: discountPercentage })
        .in('id', productIds);

    if (error) {
        throw new Error(error.message);
    }
}

// ========== HOOKS ==========

/**
 * Hook to fetch all products with caching
 * - Automatically caches data
 * - Refetches on window focus
 * - Deduplicates simultaneous requests
 */
export function useProducts() {
    return useQuery({
        queryKey: productKeys.lists(),
        queryFn: fetchProducts,
        staleTime: 0, // Always consider data stale to ensure fresh fetch
        gcTime: 1000 * 60 * 30, // Cache garbage collected after 30 minutes
        refetchOnWindowFocus: true, // Refetch when tab gains focus
        refetchOnMount: true, // Always refetch on component mount
        refetchOnReconnect: true, // Refetch when network reconnects
        retry: 3, // Retry failed requests 3 times
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        enabled: true, // Always enabled for public access
        initialData: [], // Start with empty array instead of undefined
    });
}

/**
 * Hook to fetch a single product
 */
export function useProduct(id: string) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => fetchProduct(id),
        enabled: !!id, // Only run if id is provided
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to create a new product with optimistic updates
 */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: (newProduct) => {
            // Add the new product to the cache
            queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
                old ? [newProduct, ...old] : [newProduct]
            );
        },
        onError: (error) => {
            console.error('Failed to create product:', error);
        },
    });
}

/**
 * Hook to update a product with optimistic updates
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProduct,
        onMutate: async (updatedProduct) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: productKeys.lists() });

            // Snapshot previous value
            const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists());

            // Optimistically update the cache
            queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
                old?.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
            );

            return { previousProducts };
        },
        onError: (err, _variables, context) => {
            // Rollback on error
            if (context?.previousProducts) {
                queryClient.setQueryData(productKeys.lists(), context.previousProducts);
            }
            console.error('Failed to update product:', err);
        },
        onSettled: () => {
            // Refetch after mutation (ensures server state)
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/**
 * Hook to delete a product with optimistic updates
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,
        onMutate: async (deletedId) => {
            await queryClient.cancelQueries({ queryKey: productKeys.lists() });

            const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists());

            // Optimistically remove from cache
            queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
                old?.filter((p) => p.id !== deletedId)
            );

            return { previousProducts };
        },
        onError: (err, _variables, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData(productKeys.lists(), context.previousProducts);
            }
            console.error('Failed to delete product:', err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/**
 * Hook to apply discounts to products
 */
export function useApplyDiscount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productIds, discountPercentage }: { productIds: string[]; discountPercentage: number }) =>
            applyDiscount(productIds, discountPercentage),
        onMutate: async ({ productIds, discountPercentage }) => {
            await queryClient.cancelQueries({ queryKey: productKeys.lists() });

            const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists());

            // Optimistically update discounts
            queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
                old?.map((p) => (productIds.includes(p.id) ? { ...p, discount: discountPercentage } : p))
            );

            return { previousProducts };
        },
        onError: (err, _variables, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData(productKeys.lists(), context.previousProducts);
            }
            console.error('Failed to apply discount:', err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}

/**
 * Hook to remove discounts from products
 */
export function useRemoveDiscount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productIds: string[]) => applyDiscount(productIds, 0),
        onMutate: async (productIds) => {
            await queryClient.cancelQueries({ queryKey: productKeys.lists() });

            const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists());

            queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
                old?.map((p) => (productIds.includes(p.id) ? { ...p, discount: 0 } : p))
            );

            return { previousProducts };
        },
        onError: (err, _variables, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData(productKeys.lists(), context.previousProducts);
            }
            console.error('Failed to remove discount:', err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
}
