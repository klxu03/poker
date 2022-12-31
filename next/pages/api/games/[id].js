import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// GameJS
import { createGame } from "../../../utils/game";

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
    db.data = {
      users: {},
      games: { default: createGame() },
    };
    await db.write();
  }

  // Destructure everything but players
  console.log("game data req received on server");
  let ret = { ...db.data.games["default"], players: [] };

  // Pass player info in the game besides their cards
  // Deep copy of players into fullPlayers
  const fullPlayers = JSON.parse(
    JSON.stringify(db.data.games["default"].players)
  );
  for (let player of fullPlayers) {
    let { cards, ...newPlayer } = player;
    console.log({ counter, newPlayer });
    ret.players.push(newPlayer);
  }

  res.status(200).json(ret);
}
