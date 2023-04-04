import express from "express";
import { lineMiddleware, eventHandle, lineClient } from "./line.js";
import { redisRouter } from "./redis.js";

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// receive line message
app.post("/callback", lineMiddleware, (req, res) => {
  Promise.all(req.body.events.map(eventHandle))
    .then((result) => res.json(result))
    .catch((err) => errorHandle(err, res));
});

function errorHandle(error, res) {
  console.error("error", error);
  switch (error.name) {
    case "chatGPT":
      let responseMessage = "GPT異常，請報修工程師。";
      switch (error.status) {
        case 429:
          responseMessage = "GPT暫時無法使用，請稍後再試。";
          break;
        default:
          break;
      }
      res.json(lineClient.replyMessage(error.replyToken, { type: "text", text: responseMessage }));
      break;
    default:
      res.status(500).end();
      break;
  }
}

app.use("/redis", redisRouter);

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.info(`listening on ${port}`);
});
