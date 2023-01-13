import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { nanoid } from "nanoid";
import ky from "ky";

import { useState, useEffect } from "react";

import { useHydratedStore, useStore } from "../utils/store";

export default function Home({ initialGames }) {
  const [games, setGames] = useState([]);
  const router = useRouter();

  const loaded = useHydratedStore().loaded;
  const username = useHydratedStore().username;
  const setUsername = useHydratedStore().setUsername;
  const id = useHydratedStore().id;
  const setId = useHydratedStore().setId;

  const updateUsername = () => {
    ky.post("/api/users/create", {
      json: {
        id,
        username,
      },
    });
  };

  useEffect(() => {
    setGames(initialGames);

    if (id === null && typeof window !== "undefined" && loaded) {
      const assignId = async () => {
        let newId;
        while (true) {
          newId = nanoid();

          const res = await ky
            .get("/api/users/exist", {
              searchParams: {
                id: newId,
              },
            })
            .json();

          if (!res) {
            break;
          }
        }
        setId(newId);
      };
      assignId();
    }
  }, [loaded]);

  const createGame = async (gameId) => {
    await ky.post("/api/games/create");
    router.push(`/game/${gameId}`);
  };

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
              }}
            />
            <button onClick={updateUsername}>Update</button>
            <h3>Username: {username}</h3>
          </div>

          <br />

          <div className={styles.grid}>
            {games.length === 0 && (
              <a
                className={styles.card}
                onClick={() => {
                  console.log("Creating default game");
                  createGame("default");
                }}
              >
                <h2>Create Default Game</h2>
              </a>
            )}
            {games.map((game) => (
              <Link
                key={game.id}
                legacyBehavior
                href={{
                  pathname: "/game/[id]",
                  query: { id: game.id },
                }}
              >
                <a
                  className={styles.card}
                  onClick={() => {
                    console.log("Joining game:", game.id);
                  }}
                >
                  <h2>Game {game.id}</h2>
                  <h3>Created by {game.admin}</h3>
                  <p>{game.numPlayers} participants</p>
                </a>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const res = await fetch("http://localhost:3000/api/games");

  const games = await res.json();
  console.log({ games });

  return {
    props: {
      initialGames: games,
    },
  };
};
