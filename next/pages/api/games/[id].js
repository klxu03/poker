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

  if (db.data.games["default"] === undefined) {
    res.status(500).send("A game with this ID is not found");
  }

  // Destructure everything but players
  console.log("game data req received on server");
  let { tableCounter, ...ret } = {
    ...db.data.games["default"],
    players: [],
    table: [],
  };

  // Pass player info in the game besides their cards
  // Deep copy of players into fullPlayers
  const fullPlayers = JSON.parse(
    JSON.stringify(db.data.games["default"].players)
  );
  for (let player of fullPlayers) {
    let { cards, ...newPlayer } = player;
    console.log({ newPlayer });
    ret.players.push(newPlayer);
  }

  // Add in the cards to table
  for (let i = 0; i < tableCounter; i++) {
    ret.table.push(db.data.games["default"].table[i]);
  }

  res.status(200).json(ret);
}
