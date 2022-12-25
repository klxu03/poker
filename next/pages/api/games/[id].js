import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export default async function GameHandler(req, res) {
  /* Data LowDB Stuff */
  let __dirname = dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, "../../../data/", "db.json");

  // Configure lowdb to write to JSONFile
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();

  if (db.data === null) {
    // users is a key==username value==amount of chips
    db.data = { users: {}, game: { players: [], turn: "", table: [] } };
    await db.write();
  }

  res.status(200).json(db.data.game);
}
