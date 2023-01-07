// Handles an action

import { setCards } from "../card";

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const start = (gameId) => {
    io.sockets.emit("start"); // io sockets emit instead of broadcast since even sender should know

    db.data.games[gameId].turn = 0;
    db.data.games[gameId].blind = -1;

    setCards({ gameId, io, db });

    db.write();
  };

  const updateBal = (gameId, username) => {};

  const bet = (gameId, username) => {};

  socket.on("startRequest", start);
};
