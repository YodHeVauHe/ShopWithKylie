
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars manually since we are running with node
// We need to parse the .env.local file
dotenv.config();

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const adminEmail = 'admin_scfl8o@shopwithkylie.vercel.app';
const adminPassword = 'kagio1haqc04myl3utbtz5';

async function createAdmin() {
    console.log(`Attempting to create admin user: ${adminEmail}`);

    const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
            data: {
                role: 'admin',
                username: 'admin_scfl8o'
            }
        }
    });

    if (error) {
        console.error('Error creating admin user:', error.message);
    } else {
        console.log('Admin user created successfully:', data.user?.id);
        console.log('Please check your email for confirmation if enabled, or check the Supabase dashboard.');
    }
}

createAdmin();
