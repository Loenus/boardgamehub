import { supabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await getUser(event)

  if (!user) {
    return {
      status: 400,
      body: { error: 'Missing user_id' }
    };
  }

  const body = await readBody(event);
  const { bgg_id, rating } = body;

  if (!bgg_id || rating == null) {
    return {
      status: 400,
      body: { error: 'Missing bgg_id or rating' }
    };
  }

  const { data, error } = await supabase
    .from('ratings')
    .upsert({ user_id: user.id, bgg_id, rating }, { onConflict: 'user_id, bgg_id' });

  if (error) {
    return {
      status: 500,
      body: { error: error.message }
    };
  }

  return {
    status: 200,
    body: { success: true, data }
  };
});