export default defineNuxtRouteMiddleware(async (to, from) => {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
  
    if (!user.value) {
      return navigateTo('/login'); // Se non sei loggato, vai alla pagina di login
    }
  
    const teamId = to.params.id; // Prendi l'ID del team dalla rotta
    if (!teamId) return navigateTo('/profile'); // Se l'ID non esiste, reindirizza
  
    // Controlla se l'utente ha un'entry in `team_members`
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', user.value.id);
  
    if (error || data.length === 0) {
      return navigateTo('/profile'); // Se l'utente non fa parte del team, blocca l'accesso
    }
})
