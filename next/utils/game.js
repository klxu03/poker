// Helper functions that deal with items dealing with the actual game and updating the db

export function createGame() {
  return {
    /* Info in each player
        {
          "username": "p1",
          "socket": "4P9otlxMX9LRkjRBAAAB",
          "bal": 1000,
          "action": "Fold",
          "amt": 0,
          "totalAmt": 0,
          "cards": []
        },
    */
    players: [], // array of player objects
    turn: null, // index of whose turn it is
    blind: null, // index of who the big blind is
    table: [], // array of all 5 cards to be on the table
    tableCounter: 0, // counter of the number of cards displayed on the table
    totalPot: 0, // total pot
    currPot: 0, // current round pot
    bet: {
      user: null, // index of player of who made the last bet
      amt: 0, // amt previously bet
    },
    gameInfo: {
      admin: "", // username of the admin
      entryBal: 1000, // balance everyone joining the game gets
      smallBlind: 50,
      bigBlind: 100,
      pwd: null, // password to join game
    },
  };
}

export function makeBet({ gameId, db, io, username, amt }) {
  const currGame = db.data.games[gameId];
  for (let player of currGame.players) {
    if (player.username === username) {
      player.bal -= amt;
      player.amt += amt;
      player.totalAmt += amt;
      player.action = "Call";

      io.sockets.emit("updateBal", { username, newBal: player.bal });
    }
  }

  db.write();
}

export function startTurn({ gameId, io, socket, db }) {
  const numPlayers = db.data.games[gameId].players.length;
  const currGame = db.data.games[gameId];

  // set the blinds
  const bigBlindIndex = (db.data.games[gameId].blind + 1) % numPlayers;
  io.sockets.emit("bigBlind", bigBlindIndex);
  db.data.games[gameId].blind = bigBlindIndex;

  // big blind makes a bet at start of round
  if (currGame.players[bigBlindIndex].bal < currGame.gameInfo.bigBlind) {
    makeBet({
      gameId,
      db,
      io,
      username: currGame.players[bigBlindIndex].username,
      amt: currGame.players[bigBlindIndex].bal,
    });
  } else {
    makeBet({
      gameId,
      db,
      io,
      username: currGame.players[bigBlindIndex].username,
      amt: currGame.gameInfo.bigBlind,
    });
  }

  // small blind bet

  // manually set the turn to be small blind because after small blind makes bet, will move onto 3rd person's turn, but should be small blind
  // small blinds turn
  io.sockets.emit(
    "playerTurn",
    db.data.games[gameId].players[(bigBlindIndex + 1) % numPlayers].username
  );

  // check actionHandler
}
