import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://fnoppzknyvluzpaomuzv.supabase.co"
const supabaseKey = "sb_publishable_2S21u7vXqRBqZQf4sVwZ1g_Eym7fNCt"

export const supabase = createClient(supabaseUrl, supabaseKey)