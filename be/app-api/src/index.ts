import express from "express";
import { userRouter } from "./routes/user";
import { tradeRouter } from "./routes/trade";
import { tradesRouter } from "./routes/trades";
import { assetsRouter } from "./routes/assets";
import { candleRouter } from "./routes/candle";
import { createClient, RedisClientType } from "redis";
import { TradeManager } from "./classses/redisSubscriber";
import { eventsRouter } from "./routes/events";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/v1/user", userRouter);
app.use("/api/v1/trade", tradeRouter);
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/assets", assetsRouter);
app.use("/api/v1/candles", candleRouter);
app.use("/api/v1/events" ,eventsRouter )

const redisClient = createClient({ url: "redis://localhost:6370" });
export const tradeManager = new TradeManager(redisClient as RedisClientType);

app.listen(3005, () => {
	console.log("v0 Server is running on port 3005");
    
});
