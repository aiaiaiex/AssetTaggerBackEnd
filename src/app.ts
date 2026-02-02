import express from "express";

const app = express();

app.get("/ping", (req, res) => {
  res.json({ msg: "pong!" });
});

app.listen(3000, () => {
  console.log(`Server listening on http://localhost:3000`);
});
