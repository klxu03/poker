// Handles evaluating who won at the end of the round, or with this set of cards

// inp: permute is the current permutation
// out: the number that is the next permutation
const nextPermutation = (permute) => {
  let numOnes;
  while (permute < 1 << 7) {
    permute++;
    numOnes = 0;
    for (let i = 0; i < 7; i++) {
      if (permute & (1 << i)) numOnes++;
    }

    if (numOnes == 5) {
      return permute;
    }
  }

  return false;
};

// prettier-ignore
const cardLetterToValue = {
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14
}

// convert "A" to 14 and stuff
const convertCards = (cards) => {
  const ret = [];
  for (card of cards) {
    let val = card.slice(1);
    if (val in cardLetterToValue) {
      val = "" + cardLetterToValue[val];
    }
    ret.push(card[0] + val);
  }

  return ret;
};

// assume cards are sorted
const isStraight = (cards) => {
  let curr = cards[0].slice(1);
  curr = Number(curr);

  let valid = true;
  const A2345 = [0, 0, 0, 0, 0]; // card amounts, so A2345[2] == 2 means two 3s
  for (let i = 1; i < 5; i++) {
    let next = cards[i].slice(1);
    next = Number(next);

    if (next != curr + 1) {
      valid = false;
    }

    if (next == 14) {
      A2345[0]++;
    } else if (next >= 2 && next <= 5) {
      A2345[next]++;
    }

    curr = next;
  }

  if (!valid) {
    // check A2345
    for (let i = 0; i < 5; i++) {
      if (A2345[i] != 1) {
        return false;
      }
    }
  }

  return true;
};

// assume input of 7 cards is sorted
const hasStraight = (cards) => {
  let permutation = nextPermutation(0);

  while (permutation !== false) {
    let currCards = [];
    for (let i = 0; i < 7; i++) {
      if (permutation & (1 << i)) currCards.push(cards[cards.length - 1 - i]);
    }
    currCards.reverse();

    if (isStraight(currCards)) {
      return currCards[4];
    }

    permutation = nextPermutation(permutation);
  }

  return false;
};

// assume the 5 cards are sorted
const isFlush = (cards) => {
  for (let i = 1; i < 5; i++) {
    if (cards[i][0] != cards[0][0]) {
      return false;
    }
  }

  return true;
};

// assume input of 7 cards is sorted
const hasFlush = (cards) => {
  let permutation = nextPermutation(0);

  while (permutation !== false) {
    let currCards = [];
    for (let i = 0; i < 7; i++) {
      if (permutation & (1 << i)) currCards.push(cards[cards.length - 1 - i]);
    }
    currCards.reverse();

    if (isFlush(currCards)) {
      return currCards[4];
    }

    permutation = nextPermutation(permutation);
  }

  return false;
};

// returns false if no straight flush, otherwise return the highest card representing
// assume the input of 7 cards is sorted
const hasStraightFlush = (cards) => {
  let permutation = nextPermutation(0);

  while (permutation !== false) {
    let currCards = [];
    for (let i = 0; i < 7; i++) {
      if (permutation & (1 << i)) currCards.push(cards[cards.length - 1 - i]);
    }
    currCards.reverse();

    if (isStraight(currCards) && isFlush(currCards)) {
      return currCards[4];
    }

    permutation = nextPermutation(permutation);
  }

  return false;
};

// custom comparator to sort the cards in ascending order
const sortCards = (a, b) => {
  if (Number(a.slice(1)) == Number(b.slice(1))) {
    return a[0] < b[0] ? -1 : 1;
  }

  return Number(a.slice(1)) < Number(b.slice(1)) ? -1 : 1;
};

// returns your best hand array where a[0] is your score, so 0 if 1 high, 2 if pair, and
// a[1] is the value highest like 3 means 3, or 11 J if your score is triple and above, otherwise
// there may duplicate like pairs or high cards, thus the entirety of sortedCardAmts will be returned
const bestHand = (cards) => {
  // determine someone's best hand

  // Counts the # of each, so if three aces cardAmts["A"] == 3
  const cardAmts = new Map();

  const sortedCards = [...convertCards(cards)].sort(sortCards);

  for (let i = 0; i < 7; i++) {
    const currVal = Number(sortedCards[i].slice(1));
    if (cardAmts.get(currVal) === undefined) {
      cardAmts.set(currVal, 0);
    }

    cardAmts.set(currVal, cardAmts.get(currVal) + 1);
  }

  // Sorted big to small so first is {"14": 2, "5": 2, "11": 1, ...}
  const sortedCardAmts = [...cardAmts].sort(function (a, b) {
    if (a[1] == b[1]) {
      return a[0] > b[0] ? -1 : 1;
    }

    return a[1] > b[1] ? -1 : 1;
  });
  console.log({ sortedCards });
  console.log({ sortedCardAmts });

  let res;

  // straight flush - 8
  res = hasStraightFlush(sortedCards);

  if (res !== false) {
    return [8, Number(res.slice(1))];
  }

  // compare four of a kind - 7
  if (sortedCardAmts[0][1] >= 4) {
    return [7, Number(sortedCardAmts[0][0])];
  }

  // compare full house - 6
  // edge case of 3-3-1, this is still a full house
  if (sortedCardAmts[0][1] >= 3 && sortedCardAmts[1][1] >= 2) {
    return [6, sortedCardAmts];
  }

  // compare flush - 5
  res = hasFlush(sortedCards);

  if (res !== false) {
    return [5, Number(res.slice(1))];
  }

  // compare straight - 4
  res = hasStraight(sortedCards);

  if (res !== false) {
    return [4, Number(res.slice(1))];
  }

  /* this and beyond you might tie your top pair for example, like both pair of 10 and it goes to next best card */
  /* thus, I will be returning sortedCardAmts */
  // compare three of a kind - 3
  if (sortedCardAmts[0][1] >= 3) {
    return [3, sortedCardAmts];
  }

  // compare two pair - 2
  if (sortedCardAmts[0][1] >= 2 && sortedCardAmts[1][1] <= 2) {
    return [2, sortedCardAmts];
  }

  // compare pair - 1
  if (sortedCardAmts[0][1] >= 2) {
    return [1, sortedCardAmts];
  }

  // compare high card - 0
  return [0, sortedCardAmts];
};

// inp: an array of objects {username: player_username, cards: [7 cards]}
// out: an array of names of players who won. 1 if just one winner, multiple if ties
const whoWon = (playerCards) => {
  let ret = [playerCards[0].username];

  let best = bestHand(playerCards[0].cards);
  // just take each hand, and then O(n) go through and get a max and currIndex of best hand
  for (let i = 1; i < playerCards.length; i++) {
    let curr = bestHand(playerCards[i].cards);

    console.log(best[0], curr[0]);
    console.log("best1:", best[1]);
    console.log("curr1:", curr[1]);

    if (curr[0] > best[0]) {
      best = curr;
      ret = [playerCards[i].username];
    } else if (curr[0] == best[0]) {
      // check tie or higher trips for example

      // second element is just the Number
      if (curr[0] === 8 || curr[0] === 7 || curr[0] === 5 || curr[0] === 4) {
        if (best[1] < curr[1]) {
          best = curr;
          ret = [playerCards[i].username];
        } else if (best[1] === curr[1]) {
          ret.push(playerCards[i].username);
        }
      } else {
        // compare first five cards
        switch (curr[0]) {
          case 6:
            if (
              best[1][0][0] < curr[1][0][0] ||
              (best[1][0][0] === curr[1][0][0] && best[1][1][0] < curr[1][1][0])
            ) {
              console.log("full house: replace best with curr");
              best = curr;
              ret = [playerCards[i].username];
            } else if (
              best[1][0][0] === curr[1][0][0] &&
              best[1][1][0] === curr[1][1][0]
            ) {
              ret.push(playerCards[i].username);
            }
            break;
          case 3:
            if (
              best[1][0][0] < curr[1][0][0] ||
              (best[1][0][0] === curr[1][0][0] &&
                best[1][1][0] < curr[1][1][0]) ||
              (best[1][0][0] === curr[1][0][0] &&
                best[1][1][0] === curr[1][1][0] &&
                best[1][2][0] === curr[1][2][0])
            ) {
              best = curr;
              ret = [playerCards[i].username];
            } else if (
              best[1][0][0] === curr[1][0][0] &&
              best[1][1][0] === curr[1][1][0] &&
              best[1][2][0] === curr[1][2][0]
            ) {
              ret.push(playerCards[i].username);
            }
            break;
          case 2:
            // two pair could lead to triple pairs, same two pairs and then a 3rd low pair + high single
            // but 3rd pair would show instead of the high single
            if (
              best[1][0][0] < curr[1][0][0] ||
              (best[1][0][0] === curr[1][0][0] && best[1][1][0] < curr[1][1][0])
            ) {
              best = curr;
              ret = [playerCards[i].username];
            }

            if (
              best[1][0][0] === curr[1][0][0] &&
              best[1][1][0] === curr[1][1][0]
            ) {
              // figure out the 5th best card
              // in case it's a double then single, best of the single or double
              // if its just two singles (dub, dub, sing, sing, sing) then you're getting best sing anyways
              const best_5 = max(best[1][2][0], best[1][3][0]);
              const curr_5 = max(curr[1][2][0], curr[1][3][0]);

              if (best_5 < curr_5) {
                best = curr;
                ret = [playerCards[i].username];
              } else if (best_5 === curr_5) {
                ret.push(playerCards[i].username);
              }
            }
            break;
          case 1:
            if (best[1][0][0] < curr[1][0][0]) {
              best = curr;
              ret = [playerCards[i].username];
            } else if (best[1][0][0] === curr[1][0][0]) {
              // [double, single, single, single] are the best 5
              for (let i = 1; i < 4; i++) {
                if (best[1][i][0] != curr[1][i][0]) {
                  if (best[1][i][0] < curr[1][i][0]) {
                    best = curr;
                    ret = [playerCards[i].username];
                  }

                  break;
                }
              }

              // if you make it out of the for loop, everything is equal
              ret.push(playerCards[i].username);
            }
            break;
          case 0:
            // [single, single, single, single, single] are the best 5
            for (let i = 0; i < 5; i++) {
              if (best[1][i][0] != curr[1][i][0]) {
                if (best[1][i][0] < curr[1][i][0]) {
                  best = curr;
                  ret = [playerCards[i].username];
                }

                break;
              }
            }

            // if you make it out of the for loop, everything is equal
            ret.push(playerCards[i].username);
            break;
        }
      }
    }
  }

  return ret;
};

/* 
const test = () => {
  const suits = "♥♣♦♠";
  const p1 = [
    suits[2] + "J",
    suits[0] + "10",
    suits[0] + "K",
    suits[0] + "9",
    suits[1] + "9",
    suits[3] + "9",
    suits[0] + "J",
  ];

  const p2 = [
    suits[0] + "9",
    suits[1] + "9",
    suits[2] + "9",
    suits[0] + "7",
    suits[1] + "7",
    suits[3] + "J",
    suits[0] + "A",
  ];

  let res = whoWon([
    { username: "p1", cards: p1 },
    { username: "p2", cards: p2 },
  ]);

  console.log({ res });
};

test();
*/
