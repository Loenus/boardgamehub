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
  const { nameTeam } = body;

  if (!nameTeam) {
    return {
      status: 400,
      body: { error: 'Missing nameTeam' }
    };
  }

  const { data, error } = await supabase
    .from('teams')
    .upsert({ name: nameTeam })
    .select();

  if (error) {
    return {
      status: 500,
      body: { error: error.message }
    };
  }

  const teamId = JSON.parse(JSON.stringify(data, null, 2))[0].id

  const { data: data2, error: error2 } = await supabase
    .from('team_members')
    .upsert({ user_id: user.id, team_id: teamId }, { onConflict: 'user_id, team_id' });

  if (error2) {
    return {
      status: 500,
      body: { error: error2.message }
    };
  }

  return {
    status: 200,
    body: { success: true, data }
  };
})
