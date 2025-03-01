import { supabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)

  if (!user) {
    return {
      status: 400,
      body: { error: 'Missing user_id' }
    };
  }

  const { data, error } = await supabase.rpc('get_user_games', { user_id_provided: user.id });

  if (error) {
    console.log(error)
    return {
      status: 500,
      body: { error: error.message}
    };
  } else {
    console.log(data)
  }

  return {
    status: 200,
    body: data
  };
});