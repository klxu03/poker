import gameStyles from "../../styles/Game.module.css";
import cardStyles from "../../styles/Card.module.css";

import io from "socket.io-client";
import { useState, useEffect } from "react";

import { useHydratedStore, useStore } from "../../utils/store";

// Global socket variable
let socket;

const Game = ({ gameState }) => {
  const loaded = useHydratedStore().loaded;
  const username = useHydratedStore().username;
  const id = useHydratedStore().id;

  const [players, setPlayers] = useState([]);
  const [turn, setTurn] = useState("");
  const [blind, setBlind] = useState(-1);
  const [table, setTable] = useState([]);
  const [totalPot, setTotalPot] = useState(0);
  const [currPot, setCurrPot] = useState(0);
  const [bet, setBet] = useState({});

  const [hand, setHand] = useState([]);
  const [bal, setBal] = useState();

  const [admin, setAdmin] = useState(false);
  const [started, setStarted] = useState(false); // check if game has started or not

  const [raise, setRaise] = useState("");

  const colors = {
    Fold: "red",
    Call: "#0070f3",
    // Check: "gray", // no more concept of a check, just a call
    Raise: "green",
    Pending: "#36454F",
  };

  // Request to initialize the socket client-side
  const socketInitializer = async () => {
    // Call the server to initialize in case it's not initialized
    await fetch("/api/socket");

    socket = io();

    socket.on("start", () => {
      setStarted(true);
    });

    socket.on("newUserJoined", (user) => {
      const playerExist =
        undefined !=
        players.find((player) => {
          return player.username == user.username;
        });

      if (playerExist) {
        // Don't add this new player as they already exist
        return;
      }

      setPlayers((currPlayers) => [
        ...currPlayers,
        {
          username: user.username,
          bal: 1000,
          action: "Pending",
          amt: 0,
          totalAmt: 0,
          socket: user.socket,
        },
      ]);
    });

    socket.on("userLeft", (socketId) => {
      setPlayers((currPlayers) => {
        return currPlayers.filter((player) => {
          return player.socket != socketId;
        });
      });
    });

    socket.on("initialCards", (cards) => {
      setHand(cards);
    });

    socket.on("bigBlind", (index) => {
      setBlind(index);
      console.log("setting big blind to be", index);
    });

    socket.on("playerTurn", (username) => {
      setTurn(username);
    });

    socket.on("updateBal", ({ username, newBal }) => {
      // update their bal
      setPlayers((currPlayers) => {
        for (let player of currPlayers) {
          if (player.username === username) {
            if (newBal < player.bal) {
              const balDiff = player.bal - newBal;
              player.amt += balDiff;
              player.totalAmt += balDiff;

              setCurrPot((currPot) => currPot + balDiff);
              setTotalPot((totalPot) => totalPot + balDiff);
            }
            player.bal = newBal;
          }
        }

        return [...currPlayers];
      });
    });

    socket.on("cleanBets", () => {
      setPlayers((currPlayers) => {
        for (let player of currPlayers) {
          player.amt = 0;
        }

        return [...currPlayers];
      });
    });

    socket.on("updateAction", ({ username, action }) => {
      setPlayers((currPlayers) => {
        for (let player of currPlayers) {
          if (player.username === username) {
            player.action = action;
          }
        }

        return currPlayers;
      });
    });

    socket.on("updateBet", (newBet) => {
      setBet(newBet);
    });

    socket.on("tableCard", (card) => {
      setTable((currTable) => {
        return [...currTable, card];
      });
    });
  };

  const sendNewUserJoining = async () => {
    const playerExist =
      undefined !=
      gameState.players.find((player) => {
        return player.username == username;
      });
    if (playerExist) {
      // Don't emit as this player already exists
      return;
    }

    socket.emit("newUserJoining", {
      username,
    });
  };

  const loadCurrentBoardState = async () => {
    if (gameState.players.length > 0) {
      setPlayers([
        ...gameState.players,
        {
          username,
          bal: 1000,
          action: "Pending",
          amt: 0,
          totalAmt: 0,
          socket: "me",
        },
      ]);
    } else {
      // You are the first player
      setPlayers([
        {
          username,
          bal: 1000,
          action: "Pending",
          amt: 0,
          totalAmt: 0,
          socket: "me",
        },
      ]);

      setAdmin(true);
      setStarted(false);
    }

    setTurn(gameState.turn);
    setBlind(gameState.blind);
    setTable(gameState.table);
    setTotalPot(gameState.totalPot);
    setCurrPot(gameState.currPot);
    setBet(gameState.bet);
    setStarted(gameState.turn != null);
  };

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const init = async () => {
      await socketInitializer();
      await sendNewUserJoining();
      loadCurrentBoardState();
    };

    init();
  }, [loaded]);

  const sendStartGame = () => {
    socket.emit("startRequest", "default");
  };

  const sendCall = () => {
    socket.emit("callRequest", { gameId: "default", username });
  };

  const sendFold = () => {
    // send fold
  };

  const sendRaise = () => {
    const oldAmt = players.find((player) => player.username === username).amt;

    if (+raise > bal || +raise <= bet) {
      setRaise("");
      return;
    }

    // send raise
  };

  return (
    <>
      <div className={gameStyles.container}>
        <main className={gameStyles.main}>
          {admin && started == false && (
            <button onClick={sendStartGame}>Start Game</button>
          )}
          <h1>Players:</h1>

          <div className={gameStyles.grid}>
            {players.map((player) => (
              <>
                <a
                  key={player.username}
                  className={`${gameStyles.card} custom-player-card`}
                >
                  <h2>Player {player.username}</h2>
                  <h3>Balance: {player.bal}</h3>
                  <p>[{player.action}]</p>

                  {player.action != "Pending" && player.action != "Fold" && (
                    <>
                      <p>Amount: {player.amt}</p>
                      <p>Total Amount: {player.totalAmt}</p>
                    </>
                  )}
                </a>

                <style jsx>
                  {`
                    .custom-player-card {
                      color: ${colors[player.action]};
                      border-color: ${colors[player.action]};
                      border-width: ${turn == player.username ? "5px" : "1px"};
                    }
                  `}
                </style>
              </>
            ))}
          </div>

          <h2>Table</h2>
          <div className={cardStyles.grid}>
            {table.map((card) => {
              // the text displayed on the card
              const dispCard = card.slice(1) + card[0];

              return (
                <>
                  <div className={`${cardStyles.card} custom-card`}>
                    <p>{dispCard}</p>
                  </div>

                  <style jsx>
                    {`
                      .custom-card {
                        color: ${card[0] == "♦" || card[0] == "♥"
                          ? "red"
                          : "black"};
                        border-color: ${card[0] == "♦" || card[0] == "♥"
                          ? "red"
                          : "black"};
                      }
                    `}
                  </style>
                </>
              );
            })}
          </div>
          <h3>Current Pot Size: {currPot}</h3>
          <h2>Total Pot Size: {totalPot}</h2>

          <div className={cardStyles.grid}>
            {hand.map((card) => {
              // the text displayed on the card
              const dispCard = card.slice(1) + card[0];

              return (
                <>
                  <div className={`${cardStyles.card} custom-card`}>
                    <p>{dispCard}</p>
                  </div>

                  <style jsx>
                    {`
                      .custom-card {
                        color: ${card[0] == "♦" || card[0] == "♥"
                          ? "red"
                          : "black"};
                        border-color: ${card[0] == "♦" || card[0] == "♥"
                          ? "red"
                          : "black"};
                      }
                    `}
                  </style>
                </>
              );
            })}
          </div>
          <div>
            <button onClick={sendCall} disabled={turn !== username}>
              Call
            </button>
            <button onClick={sendFold} disabled={turn !== username}>
              Fold
            </button>
            <button onClick={sendRaise} disabled={turn !== username}>
              Raise
            </button>
            <input
              type="text"
              placeholder="Raise Amt"
              value={raise}
              onChange={(e) => {
                setRaise(e.target.value);
              }}
            ></input>

            <br />
          </div>
          <h2>Your Chip Bal: {bal}</h2>
        </main>
      </div>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const res = await fetch(
    `http://localhost:3000/api/games/${context.params.id}`
  );

  const gameState = await res.json();
  console.log({ gameState });

  return {
    props: {
      gameState,
    },
  };
};

export default Game;
