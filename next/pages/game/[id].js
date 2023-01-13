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
  const [bet, setBet] = useState();

  const [hand, setHand] = useState([]);
  const [bal, setBal] = useState();

  const [admin, setAdmin] = useState(false);
  const [started, setStarted] = useState(false); // check if game has started or not

  const colors = {
    Fold: "red",
    Check: "#0070f3",
    Call: "gray",
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
            }
            player.bal = newBal;
          }
        }

        return currPlayers;
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

          <div className={cardStyles.grid}>
            {table.map((card) => (
              <>
                <div className={`${cardStyles.card} custom-card`}>
                  <p>{card}</p>
                </div>

                <style jsx>
                  {`
                    .custom-card {
                      color: ${card[1] == "♦" || card[1] == "♥"
                        ? "red"
                        : "black"};
                      border-color: ${card[1] == "♦" || card[1] == "♥"
                        ? "red"
                        : "black"};
                    }
                  `}
                </style>
              </>
            ))}
          </div>
          <h3>Current Pot Size: {currPot}</h3>
          <h2>Total Pot Size: {totalPot}</h2>

          <div className={cardStyles.grid}>
            {hand.map((card) => (
              <>
                <div className={`${cardStyles.card} custom-card`}>
                  <p>{card}</p>
                </div>

                <style jsx>
                  {`
                    .custom-card {
                      color: ${card[1] == "♦" || card[1] == "♥"
                        ? "red"
                        : "black"};
                      border-color: ${card[1] == "♦" || card[1] == "♥"
                        ? "red"
                        : "black"};
                    }
                  `}
                </style>
              </>
            ))}
          </div>
          <div>
            <button>Call</button>
            <button>Fold</button>
            <button>Raise</button>
            <input type="text"></input>

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
