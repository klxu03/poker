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
  const cardAmts = {};

  const sortedCards = [...convertCards(cards)].sort(sortCards);

  for (let i = 0; i < 7; i++) {
    if (cardAmts[sortedCards[i].slice(1)] === undefined) {
      cardAmts[sortedCards[i].slice(1)] = 0;
    }

    cardAmts[sortedCards[i].slice(1)]++;
  }

  // Sorted big to small so first is {"14": 2, "5": 2, "11": 1, ...}
  const sortedCardAmts = Object.entries(cardAmts).sort(function (a, b) {
    if (a[1] == b[1]) {
      return Number(a[0]) > Number(b[0]) ? -1 : 1;
    }

    return a[1] > b[1] ? -1 : 1;
  });
  console.log({ sortedCards });

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
    return [6, Number(sortedCardAmts[0][0])];
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

  // compare three of a kind - 3
  if (sortedCardAmts[0][1] >= 3) {
    return [3, Number(sortedCardAmts[0][0])];
  }

  /* this and beyond you might tie your top pair for example, like both pair of 10 and it goes to next best card */
  /* thus, I will be returning sortedCardAmts */
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

const whoWon = () => {
  // lets go
  // just take each hand, and then O(n) go through and get a max and currIndex of best hand
};

const test = () => {
  const suits = "♥♣♦♠";
  const cards = [
    suits[0] + "J",
    suits[0] + "10",
    suits[0] + "K",
    suits[0] + "9",
    suits[1] + "9",
    suits[3] + "9",
    suits[0] + "8",
  ];

  let res = bestHand(cards);
  console.log("bestHand", { res });

  // const straightCards = convertCards([
  //   cards[0],
  //   cards[1],
  //   cards[2],
  //   cards[3],
  //   cards[6],
  // ]).sort(sortCards);

  // console.log({ straightCards });
  // res = isStraight(straightCards);
  // console.log("isStraight", { res });
};

test();
