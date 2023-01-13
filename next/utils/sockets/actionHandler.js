// Handles an action

import { setCards } from "../card";
import { startRound } from "../game";

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const start = (gameId) => {
    socket.emit("start"); // not a broadcast since even sender needs to know

    db.data.games[gameId].blind = -1;

    setCards({ gameId, io, db });
    startRound({ gameId, io, socket, db });

    db.write();
  };

  socket.on("startRequest", start);
};
