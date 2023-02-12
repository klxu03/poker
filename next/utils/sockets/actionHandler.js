// Handles an action

import { setCards } from "../card";
import { nextTurn, makeBet, updateAction, startRound } from "../game";

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const start = (gameId) => {
    socket.emit("start"); // not a broadcast since even sender needs to know

    db.data.games[gameId].blind = -1;

    setCards({ gameId, io, db });
    startRound({ gameId, io, socket, db });

    db.write();
  };

  const call = ({ gameId, username }) => {
    const betAmt = db.data.games[gameId].bet.amt;
    const oldAmt = db.data.games[gameId].players.find(
      (player) => player.username === username
    ).amt;

    makeBet({
      gameId,
      db,
      io,
      username,
      amt: betAmt - oldAmt,
    });
    updateAction({ gameId, db, io, username, action: "Call" });

    nextTurn({ db, io, gameId });
  };

  socket.on("startRequest", start);

  socket.on("callRequest", call);
};
