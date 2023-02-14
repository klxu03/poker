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

// Username attempting to make a bet of amt
export function makeBet({ gameId, db, io, username, amt }) {
  const currGame = db.data.games[gameId];
  for (let i = 0; i < currGame.players.length; i++) {
    const player = currGame.players[i];

    if (player.username === username) {
      // if user makes a bet larger than amount they have, make them go all in
      // easy way to handle cases where user only has $20 left, and min raise is $50
      if (player.bal < amt) {
        player.amt += player.bal;
        player.totalAmt += player.bal;

        currGame.currPot += player.bal;
        currGame.totalPot += player.bal;

        player.bal = 0;
      } else {
        player.bal -= amt;
        player.amt += amt;
        player.totalAmt += amt;

        currGame.currPot += amt;
        currGame.totalPot += amt;
      }

      io.sockets.emit("updateBal", { username, newBal: player.bal });

      // this player made a new bet, not just a call as
      // new player totalAmt bet this round is > previous bet amt
      if (player.amt > db.data.games[gameId].bet.amt) {
        db.data.games[gameId].bet = {
          user: i,
          amt: player.amt,
        };

        io.sockets.emit("updateBet", db.data.games[gameId].bet);
      }
    }
  }

  db.write();
}

export function updateAction({ gameId, db, io, username, action }) {
  io.sockets.emit("updateAction", { username, action });

  const currGame = db.data.games[gameId];

  for (let player of currGame.players) {
    if (player.username === username) {
      player.action = action;
    }
  }

  db.write();
}

const nextBetRound = ({ db, io, gameId }) => {
  const currGame = db.data.games[gameId];

  if (currGame.tableCounter == 0) {
    for (let i = 0; i < 3; i++) {
      io.sockets.emit("tableCard", currGame.table[i]);
    }
    // here comes the flop
    currGame.tableCounter = 3;
  } else if (currGame.tableCounter == 3 || currGame.tableCounter == 4) {
    // here comes the turn or river
    io.sockets.emit("tableCard", currGame.table[currGame.tableCounter]);
    currGame.tableCounter++;
  } else {
    // end of round. over show cards ending
  }

  // reset the bet to whoever has the button
  const bigBlindIndex = db.data.games[gameId].blind;
  db.data.games[gameId].bet = {
    user: bigBlindIndex,
    amt: 0,
  };
  currGame.turn = bigBlindIndex;
  io.sockets.emit("playerTurn", currGame.players[bigBlindIndex].username);
  io.sockets.emit("updateBet", db.data.games[gameId].bet);

  // reset everyone's previous round's bet amounts (amt, not totalAmt)
  io.sockets.emit("cleanBets");
  currGame.currPot = 0;
  for (let player of currGame.players) {
    player.amt = 0;
  }

  db.write();
};

export function nextTurn({ db, io, gameId }) {
  const numPlayers = db.data.games[gameId].players.length;
  const currGame = db.data.games[gameId];

  currGame.turn++;
  currGame.turn %= numPlayers;
  let nextAction = currGame.players[currGame.turn].action; // the next turn person's action
  while (nextAction != "Call" && nextAction != "Raise") {
    currGame.turn++;
    currGame.turn %= numPlayers;
    nextAction = currGame.players[currGame.turn].action;
  }

  // check if nextTurn is the better. If it is, next round
  if (currGame.turn == currGame.bet.user) {
    // emit the big blind's turn
    nextBetRound({ db, io, gameId });
  } else {
    // normal person's next turn
    io.sockets.emit(
      "playerTurn",
      db.data.games[gameId].players[currGame.turn].username
    );
  }

  db.write();
}

// Start a poker round
export function startRound({ gameId, io, socket, db }) {
  const numPlayers = db.data.games[gameId].players.length;
  const currGame = db.data.games[gameId];

  // make everyone's status pending
  for (let player of currGame.players) {
    updateAction({
      gameId,
      db,
      io,
      username: player.username,
      action: "Call",
    });
  }

  // set the blinds
  const bigBlindIndex = (db.data.games[gameId].blind + 1) % numPlayers;
  io.sockets.emit("bigBlind", bigBlindIndex);
  db.data.games[gameId].blind = bigBlindIndex;

  // big blind makes a bet at start of round
  makeBet({
    gameId,
    db,
    io,
    username: currGame.players[bigBlindIndex].username,
    amt: currGame.gameInfo.bigBlind,
  });
  updateAction({
    gameId,
    db,
    io,
    username: currGame.players[bigBlindIndex].username,
    action: "Raise",
  });

  // small blind bet
  makeBet({
    gameId,
    db,
    io,
    username: currGame.players[(bigBlindIndex + 1) % numPlayers].username,
    amt: currGame.gameInfo.smallBlind,
  });
  updateAction({
    gameId,
    db,
    io,
    username: currGame.players[(bigBlindIndex + 1) % numPlayers].username,
    action: "Call",
  });

  // manually set the turn to be small blind because after small blind makes bet, will move onto 3rd person's turn, but should be small blind
  // small blinds turn
  io.sockets.emit(
    "playerTurn",
    db.data.games[gameId].players[(bigBlindIndex + 1) % numPlayers].username
  );

  // set the bet to be small blind, so when the game wraps back up to small blind it becomes next turn
  currGame.bet = {
    user: (bigBlindIndex + 1) % numPlayers,
    amt: currGame.gameInfo.bigBlind,
  };
  // current turn is small blind
  currGame.turn = (bigBlindIndex + 1) % numPlayers;

  // check actionHandler

  db.write();
}
