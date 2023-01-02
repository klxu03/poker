// Handles an action

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const start = (gameId) => {
    socket.broadcast.emit("start", socket.id);

    db.data.games[gameId].turn = 0;
    db.data.games[gameId].blind = 0;

    db.write();
    console.log("user left: ", socket.id);
  };

  socket.on("startRequest", start);
};
