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

async function replyText(message, userId, replyToken) {
  console.info("Asking AI - ", { message, userId, replyToken });
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

  let gptResult = {};

  try {
    const options = {
      model: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
      messages,
      max_tokens: isNaN(defaultTokens) ? 500 : defaultTokens,
    };
    console.info("Create chat completion - ", options);
    // request answer from chatGPT
    const { data } = await openAI.createChatCompletion(options);

    const [choices] = data.choices;

    console.info("Ai response - ", choices);

    gptResult = { ...choices.message };
  } catch (error) {
    if (error.response) {
      const { status, statusText, config } = error.response;
      throw {
        name: "chatGPT",
        status,
        statusText,
        userId,
        replyToken,
        requestData: config.data,
      };
    }
    throw { replyToken, error };
  }

  // save history messages to redis
  await set(userId, JSON.stringify([...messages, { ...gptResult, role: "system" }]));

  // create a echoing text message
  return { type: "text", text: choices.message.content.trim() };
}

export { replyText };
