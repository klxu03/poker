import ky from "ky";

const res = ky
  .post("http://localhost:3000/api/users/exist", {
    json: {
      foo: true,
    },
  })
  .json();
