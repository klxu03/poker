// Handles everyting related to cards

// Create the initial pre-shuffled deck
const createDeck = (cards) => {
  const suits = "♥♣♦♠";

  for (let i = 0; i < 52; i++) {
    let card = "";
    switch (i % 13) {
      case 0:
        card += "K";
        break;
      case 1:
        card += "A";
        break;
      case 11:
        card += "J";
        break;
      case 12:
        card += "Q";
        break;
      default:
        card += (i % 13).toString();
        break;
    }

    card += suits[Math.floor(i / 13)];
    cards.push(card);
  }
};

const shuffleCards = (cards) => {
  const numSwaps = 10000;
  for (let i = 0; i < numSwaps; i++) {
    let rand1 = Math.floor(Math.random() * 52);
    let rand2 = Math.floor(Math.random() * 52);

    if (rand1 === rand2) {
      continue;
    }

    [cards[rand1], cards[rand2]] = [cards[rand2], cards[rand1]];
  }
};

const whoWon = () => {};
// new probability file to handle everything probability related

// Initialize all the cards on the table and to each player
export function setCards({ gameId, io, db }) {
  let cards = [];
  createDeck(cards);

  shuffleCards(cards);

  // deal the cards
  const numPlayers = db.data.games[gameId].players.length;
  for (let i = 0; i < numPlayers; i++) {
    io.to(db.data.games[gameId].players[i].socket).emit("initialCards", [
      cards[i * 2],
      cards[i * 2 + 1],
    ]);

    db.data.games[gameId].players[i].cards = [cards[i * 2], cards[i * 2 + 1]];
    db.data.games[gameId].players[i].action = "Call";
    // actionHandler of update status of player from Pending -> Call
  }

  db.data.games[gameId].table = [
    cards[numPlayers * 2],
    cards[numPlayers * 2 + 1],
    cards[numPlayers * 2 + 2],
    cards[numPlayers * 2 + 3],
    cards[numPlayers * 2 + 4],
  ];

  db.write();
}
