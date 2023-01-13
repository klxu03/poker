import { Socket } from "socket.io";
import { Server } from "socket.io";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Socket Connection Handlers
import actionHandler from "../../utils/sockets/actionHandler";
import joinHandler from "../../utils/sockets/joinHandler";
import leaveHandler from "../../utils/sockets/leaveHandler";
import promoteHandler from "../../utils/sockets/promoteHandler";

export default async function SocketHandler(req, res) {
  /* Data LowDB Stuff */
  let __dirname = dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, "../../data/", "db.json");

  // Configure lowdb to write to JSONFile
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();

  // The socket has already been initialized
  if (res.socket.server.io) {
    res.end();
    return;
  }

  /* Initialize the socket server and more socket stuff */
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  // Callback function on connection
  const onConnection = (socket) => {
    actionHandler(io, socket, db);
    joinHandler(io, socket, db);
    leaveHandler(io, socket, db);
    promoteHandler(io, socket, db);
  };

  io.on("connection", onConnection);

  console.log("Set up the socket");

  res.end();
}
