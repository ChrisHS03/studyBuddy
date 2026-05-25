import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vwnnurbfgwolvqzzzfhz.supabase.co'
const supabaseAnonKey = 'sb_publishable_UzZIZKe57KqbOLMTds1L2Q_TRT2oVKt'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)