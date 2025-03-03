import { supabase } from '../utils/supabase'
import { parseStringPromise } from 'xml2js';

export default defineEventHandler(async (event) => {
  const user = await getUser(event)

  if (!user) {
    return {
      status: 400,
      body: { error: 'Missing user_id' }
    };
  }

  const body = await readBody(event);
  const { gameId } = body;
  if (!gameId) {
    return {
      status: 400,
      body: { error: 'Missing gameId' }
    };
  }

  // 1. mi assicuro che il gioco esista nel db
  const jsonArray = [parseInt(gameId, 10)];
  const { data: missingIds, error: missingIdsError } = await supabase
      .rpc('get_missing_bgg_ids', { bgg_ids: jsonArray });
  if (missingIdsError) {
    return {
      status: 500,
      body: { error: missingIdsError.message }
    };
  }
  
  if (missingIds && missingIds.length > 0) {
    // recupero le info del gioco
    const gameToInsert = await getGameDetails(gameId);
    console.log(gameToInsert)
    // inserisco il gioco
    await insertGameInDB(gameToInsert);
  }

  // 2. inserisco la relazione
  const ownershipToInsert = {
    user_id: user.id,
    bgg_id: gameId,
  };
  console.log('sono qui')
  const { data: ownershipData, error: ownershipError } = await supabase
    .from('ownership')
    .upsert(ownershipToInsert, { onConflict: 'user_id,bgg_id' });
  if (ownershipError) {
    return {
      status: 500,
      body: { error: ownershipError.message }
    };
  }

  return {
    status: 200,
    body: { success: true, ownershipData }
  };
})

// Funzione per ottenere i dettagli del gioco dato un game_id
async function getGameDetails(gameId: number) {
  const url = `https://www.boardgamegeek.com/xmlapi2/thing?id=${gameId}`;

  try {
    // Fetch data from BGG API
    const response = await fetch(url);
    const xmlData = await response.text();
    
    // Parsing XML to JSON using xml2js
    const jsonData = await parseStringPromise(xmlData, { explicitArray: false });

    if (!jsonData.items || !jsonData.items.item) {
      return { error: 'Game not found' };
    }
    const items = Array.isArray(jsonData.items.item) ? jsonData.items.item : [jsonData.items.item];
    
    const item = items[0]
    return {
      bgg_id: gameId,
      name: getPrimaryName(item.name) || "Unknown",
      min_players: item.minplayers.$.value ? Number(item.minplayers.$.value) : undefined,
      max_players: item.minplayers.$.value ? Number(item.minplayers.$.value) : undefined,
      bgg_link: `https://boardgamegeek.com/boardgame/${gameId}`,
    }
  } catch (error) {
    console.error("Errore durante il recupero dei dettagli del gioco:", error);
  }
}

async function insertGameInDB(gameToInsert: any) {
  const { data, error: error3 } = await supabase
    .from('boardgames')
    .upsert(gameToInsert, { onConflict: 'bgg_id' })
    .select()
  console.log(data)
  console.log(error3)
  if (error3) {
    return { error: error3.message };
  }
}

function getPrimaryName(name: any): string {
  if (Array.isArray(name)) {
    const primaryName = name.find(n => n.$.type === 'primary');
    return primaryName ? primaryName.$.value : 'Unknown';
  } else if (name && name.$.type === 'primary') {
    return name.$.value;
  }
  return 'Unknown';
}
