// Handle a new player joining a game

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const leave = () => {
    socket.broadcast.emit("userLeft", socket.id);

    db.data.games["default"].players = db.data.games["default"].players.filter(
      (player) => {
        return player.socket !== socket.id;
      }
    );
    db.write();
    console.log("user left: ", socket.id);
  };

  socket.on("disconnect", leave);
};
