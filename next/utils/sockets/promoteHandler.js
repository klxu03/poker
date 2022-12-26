// Handles a player being promoted to admin

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  // oldAdmin username and newAdmin username
  const promote = (oldAdmin, newAdmin) => {
    const oldAdminExist =
      [] !=
      db.data.games[0].players.find((player) => {
        return player.username == oldAdmin && player.admin == true;
      });
    if (oldAdminExist) {
      // Don't promote as this oldAdmin player doesn't exist or is not admin
      return;
    }

    socket.broadcast.emit("newUserJoined", {
      username: user.username,
      socket: socket.id,
    });

    if (db.data.users[user.username] == undefined) {
      db.data.users[user.username] = 1000;
      db.write();
    }

    db.data.games[0].players.push({
      username: user.username,
      socket: socket.id,
      bal: db.data.users[user.username],
      action: "Fold",
      amt: 0,
    });
    db.write();
  };

  socket.on("newPromotionRequest", promote);
};
