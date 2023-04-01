# chatGPT-nodejs-line-bot

![image](https://user-images.githubusercontent.com/34929382/229303781-95c13903-9137-46c4-9f4e-b8426bfe1fa0.png)

使用 nodejs 將 chatGPT 串接 line

注意事項

- 目前只支援文字格式
- 需等 AI 回覆後才能繼續追問
- 超過五分鐘沒有對話會重置聊天

使用的技術

- [Express](https://expressjs.com/) - api 框架
- [openAI API](https://platform.openai.com/docs/api-reference) - chatGPT api
- [Line develop](https://developers.line.biz/zh-hant/) - line 串接
- [Redis Labs](https://redis.com/) - 暫存聊天紀錄

## 事前準備

1. 在 [OpenAI](https://beta.openai.com/) 取得一個 `API KEY`
   ![image](https://user-images.githubusercontent.com/34929382/229305165-2c947af4-dac9-47fa-b2d8-86495c7df538.png)
2. 在 [Line develop](https://developers.line.biz/zh-hant/) 創建一個專案，並取得`Channel access token`、`Channel secret`
   ![image](https://user-images.githubusercontent.com/34929382/229305223-823ef276-2fcb-4119-b8aa-3252a2570f6a.png)
   ![image](https://user-images.githubusercontent.com/34929382/229305273-6cde859c-4679-40e2-bf1e-18fd87eb43a7.png)
3. 建立一個 redis 資料庫或可以在 [Redis Labs](https://redis.com/try-free/) 建立一個免費資料庫，並取得 `endpoint` 與 `password`
   ![image](https://user-images.githubusercontent.com/34929382/229305348-0516988e-8616-4e80-95e5-651bbc5d6f46.png)
   ![image](https://user-images.githubusercontent.com/34929382/229305367-48e59f51-9def-4461-8307-d0c16656c1a0.png)
   > Redis Labs 免費版限制 - 30MB 使用量、同時 30 個連接、單月最多一百萬次操作
4. 如果無法部屬到雲端平台，可以使用 [ngrok](https://ngrok.com/) 將 nodejs 服務的 port 暴露給 line 串接。下載安裝後執行 ngrok，在 command 執行 `ngrok http 3000`，再將 `Forwarding` 的 url 設定成 line 的 webhook，例如 Forwarding 為 `https://69e3-112-104-98-11.jp.ngrok.io` ，則 webhook 設定為該網址+`/callback` => `https://69e3-112-104-98-11.jp.ngrok.io/callback`
   ![image](https://user-images.githubusercontent.com/34929382/229305394-4ec4c6b4-e456-4dda-8dbc-f949ada73fb8.png)

## 使用

1. 新增環境變數

新增檔案 `.env`

```bash
# line的Channel access token
CHANNEL_ACCESS_TOKEN=
# line的Channel secret
CHANNEL_SECRET=

# 使用的AI模型
OPENAI_MODEL="gpt-3.5-turbo"
# api key
OPENAI_API_KEY=
# 數字越大可以回復的字數越多
OPENAI_MAX_TOKENS=500


# redis的 endpoint
REDIS_URL=
# redis的 密碼
REDIS_PASSWORD=
#超過多久沒有提問會重置對話 (分鐘)
REDIS_EXPIRE_TIME=5
```

2. 啟動

```bash
npm install
npm run start
```
