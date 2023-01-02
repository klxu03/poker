export function createGame() {
  return {
    /* Info in each player
        {
          "username": "p1",
          "socket": "4P9otlxMX9LRkjRBAAAB",
          "bal": 1000,
          "action": "Fold",
          "amt": 0,
          "admin": true,
          "cards": []
        },
    */
    players: [], // array of player objects
    turn: null, // index of whose turn it is
    blind: null, // index of who the big blind is
    table: [], // array of cards represented as strings on the table
    totalPot: null, // total pot
    currPot: null, // current round pot
    bet: {
      user: null, // index of player of who made the last bet
      amt: 0, // amt previously bet
    },
  };
}
