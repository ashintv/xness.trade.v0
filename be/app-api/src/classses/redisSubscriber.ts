
import { closed_orders_v0, open_orders_v0 } from "../config";
import { Asset, OpenOrder } from "../types/v0-types";
import { createClient, RedisClientType } from "redis";



export class redisSubscriber {
	private client: RedisClientType;
	private asset: Asset = {
		BTCUSDT: { ask: null, bid: null },
		ETHUSDT: { ask: null, bid: null },
		BNBUSDT: { ask: null, bid: null },
		XRPUSDT: { ask: null, bid: null },
		ADAUSDT: { ask: null, bid: null },
	};

	constructor (redisClient: RedisClientType) {
		this.client = redisClient
        this.init();
	}

	private async init() {
		await this.client.connect();
		this.subscribeToRedis();
		console.log("Redis Subscriber started");
	}

	private async subscribeToRedis() {
		await this.client.subscribe("trades_v0", (message) => {
			const data = JSON.parse(message);
			this.asset[data.asset as keyof Asset] = {
				ask: data.ask,
				bid: data.bid,
			};
            console.log("Price update from Redis:", data);
			this.handleTradeUpdate(data);
		});
	}

	private handleTradeUpdate(data: any) {
		open_orders_v0.forEach((order: OpenOrder, index) => {
			const pnl = this.calculatePnl(order);
            if(pnl === null) return;
			//check take profit?
			if (order.takeProfit && pnl >= order.takeProfit) {
				this.closeOrders(order, index, pnl, "takeProfit");
			}
			//check stop loss?
			else if (order.stopLoss && pnl <= order.stopLoss) {
				this.closeOrders(order, index, pnl, "stopLoss");
			}
			// check liquidation?
			else if (order.margin && pnl <= -order.margin) {
				this.closeOrders(order, index, pnl, "liquidation");
			}
		});
	}

	private closeOrders(order: OpenOrder, index: number, pnl: number, cause: "takeProfit" | "stopLoss" | "liquidation") {
		const closePrice = order.type == "buy" ? this.asset[order.asset]["bid"]! : this.asset[order.asset]["ask"]!;

		open_orders_v0.splice(index, 1);
		closed_orders_v0.push({
			...order,
			closePrice,
			pnl,
			cause,
		});
	}

	private calculatePnl(order: OpenOrder) {
		try {
			const key = order.asset;
			const bidPrice = this.asset[key]["bid"];
			const askPrice = this.asset[key]["ask"];
			if (order.type == "buy") {
				return (bidPrice! - order.openPrice) * order.qty * order.leverage;
			} else {
				return (order.openPrice - askPrice!) * order.qty * order.leverage;
			}
		} catch (error) {
			console.error("Error calculating PnL:", error);
			return null;
		}
	}

    getPrice(s: keyof Asset) {
        return this.asset[s];
    }
    getAssets() {
        return this.asset;
    }
}
