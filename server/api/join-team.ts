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

  // 1. cerca nel db se esiste un team con quel name
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('name', nameTeam)
    .single(); // Restituisce un solo oggetto invece di un array

  if (error) {
    console.error("Errore nel recupero del team:", error.message);
    return {
      status: 500,
      body: { error: error.message }
    };
  } else {
    console.log("Team trovato:", data);
  }

  const teamId = data.id

  // 2. crea la relazione
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
