// Handle a player leaving a game

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const leave = () => {
    socket.broadcast.emit("userLeft", socket.id);

    db.data.games["default"].players = db.data.games["default"].players.filter(
      (player) => {
        return player.socket !== socket.id;
      }
    );

    // If last person left the game, delete the game
    if (db.data.games["default"].players.length === 0) {
      db.data.games = {};
    }

    db.write();
  };

  socket.on("disconnect", leave);
};
