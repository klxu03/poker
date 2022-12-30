// Handle a new player joining a game

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const join = (user) => {
    const playerExist =
      undefined !=
      db.data.games["default"].players.find((player) => {
        return player.username == user.username;
      });

    if (playerExist) {
      // Don't emit as this player already exists
      return;
    }

    socket.broadcast.emit("newUserJoined", {
      username: user.username,
      socket: socket.id,
    });

    db.data.games["default"].players.push({
      username: user.username,
      socket: socket.id,
      bal: 1000,
      action: "Fold",
      amt: 0,
      admin: false,
    });

    // If the user joining is the first player, make them admin
    if (db.data.games["default"].players.length == 1) {
      db.data.games["default"].players[0].admin = true;
    }

    db.write();
  };

  socket.on("newUserJoining", join);
};
