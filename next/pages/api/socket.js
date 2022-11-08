import { Socket } from 'socket.io';
import { Server } from 'socket.io';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { maxHeaderSize } from 'node:http';

import { nanoid } from 'nanoid';

// Socket Connection Handlers
import joinHandler from '../../utils/sockets/joinHandler';

export default async function SocketHandler(req, res) {
  // The socket has already been initialized
  if (res.socket.server.io) {
    res.end();
    return;
  }

  // Initialize the socket server
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  // Callback function on connection
  const onConnection = (socket) => {
    joinHandler(io, socket);
  };

  io.on('connection', onConnection);

  console.log('Set up the socket');

  // Data LowDB stuff
  let __dirname = dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, '../../data/', 'db.json');

  // Configure lowdb to write to JSONFile
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();

  if (db.data === null) {
    db.data = { users: [] };
    await db.write();
  }

  console.log('db.data', db.data);

  db.data = { ...db.data, users: [...db.data.users, nanoid()] };

  await db.write();

  res.end();
}
