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


  //qui si possono dichiarare tipi accessibili a tutto il progetto

  //type SomeType = [boolean, string, number]; 

  //interface MyFancyInterface {
  //  ...
  //}

  //const enum GlobalConstEnum {
  //  ...
  //}
}
 