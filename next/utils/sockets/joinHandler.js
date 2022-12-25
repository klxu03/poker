// Handle a new player joining a game

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const join = (user) => {
    if (
      db.data.game.players.find((player) => {
        return player.username == user.username;
      })
    ) {
      // Don't emit as this player already exists
      return;
    }

    socket.broadcast.emit("newUserJoined", user);

    if (db.data.users[user.username] == undefined) {
      db.data.users[user.username] = 1000;
      db.write();
    }

    db.data.game.players.push({
      username: user.username,
      socket: socket.id,
      bal: db.data.users[user.username],
      action: "Fold",
      amt: 0,
    });
    db.write();
  };

  socket.on("newUserJoining", join);
};
