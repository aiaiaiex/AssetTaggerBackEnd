import express from "express";
import serverConfig from "./config/serverConfig";

const app = express();

app.get("/ping", (req, res) => {
  res.json({ msg: "pong!" });
});

app.listen(serverConfig.port, () => {
  console.log(`Server listening on http://localhost:${serverConfig.port}`);
});
