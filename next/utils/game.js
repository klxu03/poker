export function createGame({ id }) {
  return {
    id,
    players: [],
    turn: "",
    table: [],
  };
}
