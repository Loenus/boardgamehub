import { supabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)

  if (!user) {
    return {
      status: 400,
      body: { error: 'Missing user_id' }
    };
  }

  
  return 'Hello Nitro'
})
