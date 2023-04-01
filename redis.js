import express from "express";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const defaultMin = parseInt(process.env.REDIS_EXPIRE_TIME);

const EXPIRE_TIME = 60 * (isNaN(defaultMin) ? 5 : defaultMin);

const redisClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

(async () => {
  redisClient.on("error", (error) => console.error(`Ups : ${error}`));
  await redisClient.connect();
})();

async function set(key, value) {
  await redisClient.set(key, value, {
    EX: EXPIRE_TIME,
  });
}

async function get(key) {
  const value = await redisClient.get(key);
  return value;
}

async function remove(key) {
  await redisClient.del(key);
}

const redisRouter = express.Router();

redisRouter.use(express.json());
redisRouter.use(express.urlencoded({ extended: false }));

redisRouter.delete("/:key", async (req, res) => {
  const key = req.params.key;
  console.info("redis delete:", key);
  try {
    await remove(key);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
    });
  }
});

redisRouter.get("/:key", async (req, res) => {
  const key = req.params.key;
  console.info("redis query:", key);
  try {
    const value = await get(key);
    res.status(200).json({
      success: true,
      value,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
    });
  }
});

redisRouter.post("/", async (req, res) => {
  const { key, value } = req.body;
  console.info(`redis create:${key} , ${value}`);
  try {
    await set(key, value);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
    });
  }
});

redisRouter.post("/reset", async (req, res) => {
  console.info("redis flushAll");
  try {
    await redisClient.flushAll();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
    });
  }
});

export { set, get, remove, redisRouter };
