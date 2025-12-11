import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Configuration:');
console.log('- URL:', supabaseUrl ? 'set' : 'MISSING');
console.log('- AnonKey:', supabaseAnonKey ? 'set' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env.local file.');
    console.error('Required variables: VITE_PUBLIC_SUPABASE_URL, VITE_PUBLIC_SUPABASE_ANON_KEY');
    // Alert the user so they know why the app might not work
    if (typeof window !== 'undefined') {
        alert('Missing Supabase environment variables! Check console for details.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add a test function to verify connection
export const testSupabaseConnection = async () => {
    try {
        // Test with a simple query
        const { data, error } = await supabase
            .from('products')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Supabase connection test failed:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Supabase connection test error:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
};

// Helper to get auth token with fallback
export const getAuthToken = async (): Promise<string | null> => {
    try {
        // Try standard way with short timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session fetch timeout')), 2000)
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
        if (result.data?.session?.access_token) {
            return result.data.session.access_token;
        }
    } catch (e) {
        // Silent fail for timeout, try fallback
    }

    try {
        const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) return null;

        // Extract project ID from URL (e.g., https://xyz.supabase.co -> xyz)
        const projectId = supabaseUrl.replace('https://', '').split('.')[0];
        const key = `sb-${projectId}-auth-token`;

        const stored = localStorage.getItem(key);
        if (stored) {
            const session = JSON.parse(stored);
            if (session.access_token) {
                return session.access_token;
            }
        }
    } catch (e) {
        console.error('LocalStorage fallback failed:', e);
    }

    return null;
};
