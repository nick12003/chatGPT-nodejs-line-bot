import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

import { get, set } from "./redis.js";

dotenv.config();

const defaultTokens = parseInt(process.env.OPENAI_MAX_TOKENS);

const openAI = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

async function replyText(message, userId) {
  console.info(`replyText-${userId}`, message);
  let messages = [];

  // get history from redis
  const historyValue = await get(userId);

  // non-first-user
  if (historyValue) {
    messages = JSON.parse(historyValue);
  }

  // add new message object
  messages = [
    ...messages,
    {
      role: "user",
      content: message,
    },
  ];

  // request answer from chatGPT
  const { data } = await openAI.createChatCompletion({
    model: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
    messages,
    max_tokens: isNaN(defaultTokens) ? 500 : defaultTokens,
  });

  const [choices] = data.choices;

  console.info("ai response", choices);

  // save history messages to redis
  await set(userId, JSON.stringify([...messages, { ...choices.message, role: "system" }]));

  // create a echoing text message
  return { type: "text", text: choices.message.content.trim() };
}

export { replyText };
