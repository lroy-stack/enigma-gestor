import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://alkjwbrrdoluzvrzthfd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa2p3YnJyZG9sdXp2cnp0aGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjczNjksImV4cCI6MjA2MDU0MzM2OX0.nSUoYchfdgTOTtulUgA6SjzCKfoNbvipwwIyt_ZOls8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
