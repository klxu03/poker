// Handle a new player joining a game

/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default (io, socket) => {
  const join = (username) => {
    socket.broadcast.emit('newUserJoined', username);
  };

  socket.on('newUserJoining', join);
};
