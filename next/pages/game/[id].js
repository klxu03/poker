import gameStyles from '../../styles/Game.module.css';
import cardStyles from '../../styles/Card.module.css';

import io from 'socket.io-client';
import { useState, useEffect } from 'react';

// Global socket variable
let socket;

const Game = () => {
  const [players, setPlayers] = useState([]);
  const [turn, setTurn] = useState('');
  const [table, setTable] = useState([]);
  const [pot, setPot] = useState();

  const [hand, setHand] = useState([]);
  const [bal, setBal] = useState();

  const colors = {
    Fold: 'red',
    Check: '#0070f3',
    Call: 'gray',
    Raise: 'green',
  };

  // Request to initialize the socket client-side
  const socketInitializer = async () => {
    // Call the server to initialize in case it's not initialized
    await fetch('/api/socket');

    socket = io();
  };

  useEffect(() => {
    socketInitializer();
  });

  // Initialize everyone for demo purposes
  useEffect(() => {
    setPlayers([
      {
        username: 'leon',
        bal: 200,
        action: 'Call',
        amt: '0',
      },
      {
        username: 'kev',
        bal: 1_000,
        action: 'Raise',
        amt: '100',
      },
    ]);

    setTurn('');

    setTable(['A♠ ', '7♥ ', 'J♣ ', '3♦ ']);

    setPot(200);

    setHand(['A♥ ', 'A♣ ']);
    setBal(1000);
  }, []);

  return (
    <>
      <div className={gameStyles.container}>
        <main className={gameStyles.main}>
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

                  {(player.amt != 0 || player.action != 'Fold') && (
                    <p>Amount: {player.amt}</p>
                  )}
                </a>

                <style jsx>
                  {`
                    .custom-player-card {
                      color: ${colors[player.action]};
                      border-color: ${colors[player.action]};
                      border-width: ${turn == player.username ? '5px' : '1px'};
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
                      color: ${card[1] == '♦' || card[1] == '♥'
                        ? 'red'
                        : 'black'};
                      border-color: ${card[1] == '♦' || card[1] == '♥'
                        ? 'red'
                        : 'black'};
                    }
                  `}
                </style>
              </>
            ))}
          </div>
          <h2>Total Pot Size: {pot}</h2>

          <div className={cardStyles.grid}>
            {hand.map((card) => (
              <>
                <div className={`${cardStyles.card} custom-card`}>
                  <p>{card}</p>
                </div>

                <style jsx>
                  {`
                    .custom-card {
                      color: ${card[1] == '♦' || card[1] == '♥'
                        ? 'red'
                        : 'black'};
                      border-color: ${card[1] == '♦' || card[1] == '♥'
                        ? 'red'
                        : 'black'};
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

export default Game;
