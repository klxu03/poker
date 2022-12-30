import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// GameJS
import { createGame } from "../../../utils/game";

export default async function UserCreateHandler(req, res) {
  /* Data LowDB Stuff */
  let __dirname = dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, "../../../data/", "db.json");

  // Configure lowdb to write to JSONFile
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();

  if (db.data === null) {
    // users is a key==username value==amount of chips
    db.data = {
      users: {},
      games: { default: createGame() },
    };
    await db.write();

    res.status(200).json(false);
    return;
  }

  console.log("req.query", req.query);

  res.status(200).json(false);
}
