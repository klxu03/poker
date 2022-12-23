import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";

import { useState, useEffect } from "react";

export default function Home() {
  const [games, setGames] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // setGames([1, 21, 35, 402, 518, 6006]);
    setGames([1]);
    setUsername(window.localStorage.getItem("username"));
    console.log(
      "localStorage username:",
      window.localStorage.getItem("username")
    );
  }, []);

  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Poker App</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>
            Welcome to <a>Poker!</a>
          </h1>

          <p className={styles.description}>
            Get started by entering a username and joining an open game!
          </p>

          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                window.localStorage.setItem("username", e.target.value);
              }}
            />
            <h3>Username: {username}</h3>
          </div>

          <br />

          <div className={styles.grid}>
            {games.map((game) => (
              <Link
                key={game}
                legacyBehavior
                href="/game/[id]"
                as={`/game/${game}`}
              >
                <a
                  className={styles.card}
                  onClick={() => {
                    console.log("Joining game:", game);
                  }}
                >
                  <h2>Game {game}</h2>
                  <h3>Created by Kev</h3>
                  <p>0/4 participants</p>
                </a>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
