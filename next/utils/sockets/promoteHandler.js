// Handles a player being promoted to admin

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  // oldAdmin ID and newAdmin username
  const promote = ({ oldAdminId, newAdmin }) => {
    if (db.data.users[oldAdminId] != db.data.games["default"].gameInfo.admin) {
      // improper person, oldAdminId trying to make promotion request
      return;
    }
    if (
      undefined ==
      db.data.games["default"].players.find((player) => {
        return player.username == newAdmin;
      })
    ) {
      // person to be promoted doesn't exist
      return;
    }

    socket.broadcast.emit("newPromotion", {
      newAdmin,
    });

    db.data.games["default"].gameInfo.admin = newAdmin;
    db.write();
  };

  socket.on("newPromotionRequest", promote);
};
