export interface BoardGame {
  id: number;
  name?: string;
  yearPublished?: number;
  image?: string;
  thumbnail?: string;
  rating?: number; // Voto dato dall'utente
  minPlayers: number;
  maxPlayers: number;
  owned: boolean;
  wishlist: boolean;
  wantToPlay: boolean;
  wantToBuy: boolean;
  preordered: boolean;
  numPlays?: number;
}
