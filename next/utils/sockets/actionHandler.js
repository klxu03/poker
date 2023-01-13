// Handles an action

import { setCards } from "../card";
import { startTurn } from "../game";

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const start = (gameId) => {
    socket.emit("start"); // not a broadcast since even sender needs to know

    db.data.games[gameId].turn = -1;
    db.data.games[gameId].blind = -1;

    setCards({ gameId, io, db });
    startTurn({ gameId, io, socket, db });

    db.write();
  };

  const updateBal = (gameId, username) => {};

  const bet = (gameId, username) => {};

  socket.on("startRequest", start);
};
