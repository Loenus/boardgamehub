import { parseStringPromise } from 'xml2js';
import { supabase } from '../utils/supabase'
import { getUser } from '../utils/getUser'

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const username = query.username;

  console.log('username: ' + username);
  const user = await getUser(event)
  console.log(user.id);
  if (supabase) {
    console.log('Connected to Supabase');
  }

  if (!username) {
    return { error: 'Missing username' };
  }

  try {
    // 1. recupero tutti i giochi posseduti dall'utente su bgg FATTO
    // 2. mi assicuro siano tutti già presenti nel db FATTO
    // 3. aggiungo la relazione "posseduto da" tra questo utente e il bgg_id
    // 4. recupero i giochi che l'utente corrente ha valutato
    // 5. aggiungo la relazione "valutato da" tra questo utente e il bgg_id

    // Chiamata all'API di BGG per ottenere la collezione dell'utente
    const response = await fetch(`https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`); //&rated=1 recupera solo i giochi valutati
    const xmlData = await response.text();
    //TODO: gestire la parte di RATED

    // Parsing XML -> JSON
    const jsonData: BGGResponse2 = await parseStringPromise(xmlData, { explicitArray: false });

    // Controlla se ci sono giochi nella collezione
    if (!jsonData.items || !jsonData.items.item) {
      return { error: 'No games found in collection' };
    }

    // Estrarre dati utili (ID, nome, link BGG)
    const games = Array.isArray(jsonData.items.item) ? jsonData.items.item : [jsonData.items.item];
    const formattedGames = games.map((game: BGGGame2) => ({
      id: game.$.id,
      objectId: game.$.objectid,
      name: game.name?._ || 'Unknown',
      //originalname: game.originalname || 'Unknown',
      //yearpublished: game.yearpublished || 'N/A',
      //image: game.image || '',
      //thumbnail: game.thumbnail || '',
      //status: game.status?.$ || {},
      //numplays: game.numplays || '0',
      //rating: game.rating?.$.value || '0',
      bgg_link: `https://boardgamegeek.com/boardgame/${game.$.objectid}`,
    }));


    console.log(games.length)
    //console.log(games)
    console.log(formattedGames.length)
    console.log(formattedGames)

    // Ottenere gli ID mancanti utilizzando la funzione SQL
    const objectIds = formattedGames.map(game => parseInt(game.objectId));
    console.log(objectIds)
    const { data: missingIds, error: missingIdsError } = await supabase
      .rpc('get_missing_bgg_ids', { bgg_ids: objectIds });

    console.log('id mancanti: ' + missingIds.length + " -> " + missingIds)
    if (missingIdsError) {
      return { error: missingIdsError.message };
    }

    // Suddividere l'array di missingIds in blocchi di massimo 20 ID
    const missingIdsChunks = chunkArray(missingIds, 20);

    // Recupero dei giocatori max e min per ogni gioco mancante
    const singleGames: any[] = [];
    for (const chunk of missingIdsChunks) {
      const url = `https://boardgamegeek.com/xmlapi2/thing?id=${chunk.join(',')}`;
      console.log(url);
      const response2 = await fetch(url);
      const xmlData2 = await response2.text();
      const jsonData2: BGGResponse2 = await parseStringPromise(xmlData2, { explicitArray: false });
      if (jsonData2.items && jsonData2.items.item) {
        const chunkGames = Array.isArray(jsonData2.items.item) ? jsonData2.items.item : [jsonData2.items.item];
        singleGames.push(...chunkGames);
      }
    }
    // Inserire i giochi nel DB Supabase
    const gamesToInsert = singleGames.map((game: SingleBGGGame) => ({
      bgg_id: parseInt(game.$.id),
      name: getPrimaryName(game.name),
      min_players: game.minplayers?.$?.value ? parseInt(game.minplayers.$.value) : 0,
      max_players: game.maxplayers?.$?.value ? parseInt(game.maxplayers.$.value) : 0,
      bgg_link: `https://boardgamegeek.com/boardgame/${game.$.id}`,
    }));
    console.log(gamesToInsert.length)
    console.log(gamesToInsert);



    // Inserire i giochi nel DB Supabase
    const firstGame = gamesToInsert[0];
    //const { error } = await supabase.from('board_games').upsert(firstGame, { onConflict: 'id' }).select();
    const { data, error: error3 } = await supabase
      .from('boardgames')
      .upsert(firstGame, { onConflict: 'bgg_id' })
      .select()
    console.log(data)
    console.log(error3)
    if (error3) {
      return { error: error3.message };
    }

    return { success: true, inserted: formattedGames.length };

  } catch (error) {
    return { error: 'Failed to fetch or process data' };
  }
});

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
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
