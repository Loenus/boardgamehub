import { H3Event } from 'h3';
import { supabase } from './supabase';

export async function getUser(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader) {
    throw new Error('Missing authorization header')
  }

  const token = authHeader.replace('Bearer ', '').trim()

  // Verifica il token con Supabase
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    throw new Error('Invalid or expired token')
  }

  return data.user // L'oggetto utente di Supabase
}
