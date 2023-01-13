import create from "zustand";
import { persist } from "zustand/middleware";

import { useState, useEffect } from "react";

const initialStates = {
  loaded: false,
  id: null,
  username: null,
  setUsername: (username) => username,
  setId: (id) => id,
};

// define the local store
const useLocalStore = create(
  persist(
    (set) => {
      return {
        loaded: true,
        id: initialStates.id,
        username: initialStates.username,
        setUsername: (username) => {
          return set((state) => ({ ...state, username }));
        },
        setId: (id) => {
          return set((state) => ({ ...state, id }));
        },
      };
    },
    {
      // Default, persist via localStorage
      getStorage: () => localStorage,
    }
  )
);

const useHydratedStore = () => {
  const [state, setState] = useState(initialStates);
  const zustandState = useLocalStore((persistedState) => persistedState);

  useEffect(() => {
    setState(zustandState);
  }, [zustandState]);

  return state;
};

const useStore = create((set) => {
  return {
    gameId: null,
  };
});

export { useHydratedStore, useStore };
