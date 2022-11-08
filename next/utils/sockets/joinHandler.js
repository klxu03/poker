// Handle a new player joining a game

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket, db) => {
  const join = (user) => {
    socket.broadcast.emit('newUserJoined', user);

    if (db.data.users[user.username] == undefined) {
      db.data.users[user.username] = 1000;
      db.write();
    }
  };

  socket.on('newUserJoining', join);
};
