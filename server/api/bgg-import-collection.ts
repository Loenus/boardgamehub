import { parseStringPromise } from 'xml2js';
import { supabase } from '../utils/supabase'
import { getUser } from '../utils/getUser'
import { BoardGame } from '../../types/bgg';

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
    const gamesOwnedUrl =  `https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1&stats=1`;
    const gamesOwnedXmlData = await $fetch<string>(gamesOwnedUrl);
    const gamesOwned: BoardGame[] = await parseBoardGameCollection(gamesOwnedXmlData);
    if (!gamesOwned) return { error: 'No games found in collection' };
    console.log(gamesOwned);
  
    // 2. mi assicuro siano tutti già presenti nel db FATTO
    const allBggIdsOwned = gamesOwned.map(game => game.id);
    const { data: missingIds, error: missingIdsError } = await supabase
      .rpc('get_missing_bgg_ids', { bgg_ids: allBggIdsOwned });
    console.log('id mancanti: ' + missingIds.length + " -> " + missingIds)
    if (missingIdsError) return { error: missingIdsError.message };

    let gamesToInsert = gamesOwned.filter(game => missingIds.includes(game.id));
    await insertGamesInDB(gamesToInsert);

    // 3. aggiungo la relazione "posseduto da" tra questo utente e il bgg_id
    const ownershipsToInsert = gamesOwned.map(game => ({
      user_id: user.id,
      bgg_id: game.id,
    }));

    const { data: ownershipData, error: ownershipError } = await supabase
      .from('ownership')
      .upsert(ownershipsToInsert.slice(0, 3), { onConflict: 'user_id,bgg_id' });
    console.log(ownershipData);
    console.log(ownershipError);
    if (ownershipError) {
      return { error: ownershipError.message };
    }

    // 4. aggiungo la relazione "valutato da" tra questo utente e il bgg_id
    const ratingsToInsert = gamesOwned
      .filter(game => game.rating != null && !isNaN(game.rating))
      .map(game => ({
        user_id: user.id,
        bgg_id: game.id,
        rating: game.rating,
      }));
    console.log(ratingsToInsert.length);
    console.log(ratingsToInsert);
    const { data: ratingData, error: ratingError } = await supabase
      .from('ratings')
      .upsert(ratingsToInsert.slice(0, 3), { onConflict: 'user_id,bgg_id' });
    console.log(ratingData);
    console.log(ratingError);
    if (ratingError) {
      return { error: ratingError.message };
    }

    // 5. (Opzionale) recupero i giochi che l'utente corrente ha valutato 
    //TODO FEATURE FUTURA

    return { success: true, inserted: gamesOwned.length };
  } catch (error) {
    return { error: 'Failed to fetch or process data' };
  }
});



async function insertGamesInDB(singleGames: BoardGame[]) {
  const gamesToInsert = singleGames.map((game: BoardGame) => ({
    bgg_id: game.id,
    name: game.name,
    min_players: game.minPlayers,
    max_players: game.maxPlayers,
    bgg_link: `https://boardgamegeek.com/boardgame/${game.id}`,
  }));
  console.log(gamesToInsert.length)
  console.log(gamesToInsert);

  // Inserire i giochi nel DB Supabase
  const firstGame = gamesToInsert[0];
  const { data, error: error3 } = await supabase
    .from('boardgames')
    .upsert(firstGame, { onConflict: 'bgg_id' })
    .select()
  console.log(data)
  console.log(error3)
  if (error3) {
    return { error: error3.message };
  }
}


async function parseBoardGameCollection(xmlData: string): Promise<BoardGame[]> {
  try {
    const jsonData = await parseStringPromise(xmlData, { explicitArray: false });

    if (!jsonData.items || !jsonData.items.item) {
      return [];
    }

    const items = Array.isArray(jsonData.items.item) ? jsonData.items.item : [jsonData.items.item];

    return items.map((item: any) => ({
      id: Number(item.$.objectid),
      name: item.name?._ || "Unknown",
      yearPublished: item.yearpublished ? Number(item.yearpublished) : undefined,
      image: item.image || undefined,
      thumbnail: item.thumbnail || undefined,
      rating: item.stats?.rating?.$?.value ? parseFloat(item.stats.rating.$.value) : undefined, // Rating dell'utente
      minPlayers: item.stats?.$?.minplayers ? Number(item.stats.$.minplayers) : undefined,
      maxPlayers: item.stats?.$?.maxplayers ? Number(item.stats.$.maxplayers) : undefined,
      owned: item.status?.$?.own === "1",
      wishlist: item.status?.$?.wishlist === "1",
      wantToPlay: item.status?.$?.wanttoplay === "1",
      wantToBuy: item.status?.$?.wanttobuy === "1",
      preordered: item.status?.$?.preordered === "1",
      numPlays: item.numplays ? Number(item.numplays) : 0
    }));
  } catch (error) {
    console.error("Errore nel parsing XML:", error);
    return [];
  }
}


