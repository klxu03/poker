export function createGame() {
  return {
    /* Info in each player
        {
          "username": "p1",
          "socket": "4P9otlxMX9LRkjRBAAAB",
          "bal": 1000,
          "action": "Fold",
          "amt": 0,
          "cards": []
        },
    */
    players: [], // array of player objects
    turn: null, // index of whose turn it is
    blind: null, // index of who the big blind is
    table: [], // array of cards represented as strings on the table
    totalPot: 0, // total pot
    currPot: 0, // current round pot
    bet: {
      user: null, // index of player of who made the last bet
      amt: 0, // amt previously bet
    },
    gameInfo: {
      admin: "", // username of the admin
      entryBal: 1000, // balance everyone joining the game gets
      pwd: null, // password to join game
    },
  };
}
