// Handles a player being promoted to admin

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  // oldAdmin username and newAdmin username
  const promote = ({ oldAdmin, newAdmin }) => {
    const oldAdminIndex = db.data.games["default"].players.findIndex(
      (player) => {
        return player.username == oldAdmin && player.admin == true;
      }
    );

    const newAdminIndex = db.data.games["default"].players.findIndex(
      (player) => {
        return player.username == newAdmin;
      }
    );
    if (oldAdminIndex != -1 || newAdminIndex != -1) {
      // Don't promote as this oldAdmin or newAdmin player doesn't exist or is not admin
      return;
    }

    socket.broadcast.emit("newPromotion", {
      oldAdmin,
      newAdmin,
    });

    db.data.games["default"].players[oldAdminIndex].admin = false;
    db.data.games["default"].players[newAdminIndex].admin = true;
    db.write();
  };

  socket.on("newPromotionRequest", promote);
};
