import express from "express";

const app = express();

app.get("/ping", (req, res) => {
  res.json({ msg: "pong!" });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Server listening on http://localhost:${process.env.SERVER_PORT ?? "3000"}`,
  );
});
