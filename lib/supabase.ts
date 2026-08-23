import { createClient } from '@supabase/supabase-js'

const url = 'https://vkdjpoflkycwiskktfwa.supabase.co'
const key = 'sb_publishable_GWeNymYiYjR-tA7TOXTh_A__PyjmSjl'

export const hasSupabaseEnv = true
export const supabase = createClient(url, key)
