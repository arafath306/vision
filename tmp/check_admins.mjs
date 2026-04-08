import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkAdmins() {
  const { data, error } = await supabase.from('users').select('id, full_name, role')
  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log(JSON.stringify(data, null, 2))
}

checkAdmins()
