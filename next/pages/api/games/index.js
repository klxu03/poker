import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// GameJS
import { createGame } from "../../../utils/game";

// Return a list of currently active games
export default async function ListGames(req, res) {
  /* Data LowDB Stuff */
  let __dirname = dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, "../../../data/", "db.json");

  // Configure lowdb to write to JSONFile
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();

  if (db.data === null) {
    console.log("init db from from games/index.js");
    db.data = {
      users: {},
      games: {},
    };
    await db.write();
  }

  let ret = [];

  for (const [key, value] of Object.entries(db.data.games)) {
    ret.push({
      id: key,
      admin: value.gameInfo.admin,
      numPlayers: value.players.length,
    });
  }

  res.status(200).json(ret);
}
