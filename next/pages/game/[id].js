import styles from '../../styles/Home.module.css';
import gameStyles from '../../styles/Game.module.css';

const Game = () => {
  const players = [
    {
      username: 'jeff',
      bal: 10_000,
      action: 'Fold',
      amt: '0',
    },
    {
      username: 'elon',
      bal: 15_000,
      action: 'Check',
      amt: '100',
    },
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
  ];

  const colors = {
    Fold: 'red',
    Check: '#0070f3',
    Call: 'gray',
    Raise: 'green',
  };

  let turn = 'leon';

  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Players:</h1>

          <div className={gameStyles.grid}>
            {players.map((player) => (
              <>
                <a
                  key={player.username}
                  className={`${gameStyles.card} custom-card`}
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
                    .custom-card {
                      color: ${colors[player.action]};
                      border-color: ${colors[player.action]};
                      border-width: ${turn == player.username ? '5px' : '1px'};
                    }
                  `}
                </style>
              </>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default Game;
