import dotenv from "dotenv";
import express from "express";
import { lineMiddleware, eventHandle } from "./line.js";
import { redisRouter } from "./redis.js";

dotenv.config();

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// receive line message
app.post("/callback", lineMiddleware, (req, res) => {
  Promise.all(req.body.events.map(eventHandle))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.use("/redis", redisRouter);

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.info(`listening on ${port}`);
});
