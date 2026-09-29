import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawAnonKey &&
  !rawUrl.includes('placeholder') &&
  (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Shivalaya Config] Supabase credentials not set or using placeholders. ' +
    'Running in safe fallback mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables.'
  )
}

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co'
const supabaseAnonKey = isSupabaseConfigured ? rawAnonKey : 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export const RESORT_ID = import.meta.env.VITE_RESORT_ID || '00000000-0000-0000-0000-000000000001'
