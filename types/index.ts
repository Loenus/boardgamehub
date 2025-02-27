export {};

declare global {

  interface BGGGame {
    $: {
      id: string;
    };
    name?: {
      $: {
        value: string;
      };
    };
    yearpublished?: {
      $: {
        value: string;
      };
    };
  }
  
  interface BGGResponse {
    items?: {
      item?: BGGGame[];
    };
  }

  
  interface BGGGame2 {
    $: {
      id: string;
      objectid: string;
    };
    name?: {
      _: string;
      $: {
        sortindex: string;
      };
    };
    originalname?: string;
    yearpublished?: string;
    image?: string;
    thumbnail?: string;
    status?: {
      $: {
        own: string;
        prevowned: string;
        fortrade: string;
        want: string;
        wanttoplay: string;
        wanttobuy: string;
        wishlist: string;
        preordered: string;
        lastmodified: string;
      };
    };
    numplays?: string;
    rating?: {
      $: {
        value: string;  // Il valore della valutazione data dall'utente
      };
    };
  }

  interface BGGResponse2 {
    items?: {
      $: {
        totalitems: string;
        termsofuse: string;
        pubdate: string;
      };
      item?: BGGGame2[];
    };
  }

  interface SingleBGGGame {
    $: {
      id: string;
      objectid: string;
    };
    name?: {
      _: string;
      $: {
        type: string;
        sortindex: string;
        value: string;
      };
    } | {
      _: string;
      $: {
        type: string;
        sortindex: string;
        value: string;
      };
    }[];
    minplayers?: {
      $: {
        value: string;
      };
    };
    maxplayers?: {
      $: {
        value: string;
      };
    };
  }
  interface BGGReponse22 {
    items?: {
      item?: SingleBGGGame[];
    }
  }
  



  //type SomeType = [boolean, string, number]; 

  //interface MyFancyInterface {
  //  ...
  //}

  //const enum GlobalConstEnum {
  //  ...
  //}
}
 