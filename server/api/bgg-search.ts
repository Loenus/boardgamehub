import { parseStringPromise } from 'xml2js';

export default defineEventHandler(async (event) => {
  const query = String(getQuery(event).title); // Prende il titolo dal parametro ?title=
  if (!query) {
    return { error: 'No title provided' };
  }

  try {
    const url = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`;
    const response = await fetch(url);
    const xmlText = await response.text();

    // Converte XML in JSON
    const jsonResult: BGGResponse = await parseStringPromise(xmlText, { explicitArray: false });

    // Estrai dati utili
    const games = jsonResult.items?.item?.map((game: BGGGame) => ({
      id: game.$.id,
      name: game.name?.$.value || 'Unknown',
      year: game.yearpublished?.$.value || 'N/A'
    })) || [];

    return { games };
  } catch (error) {
    return { error: 'Error fetching data from BoardGameGeek' };
  }
});