import { Response } from "express";
import { closed_orders_v0, users_v0 } from "../config";
import { Asset, NotificationType, OpenOrder, User, UserBalance } from "../types/v0-types";
import { RedisClientType } from "redis";

export class TradeManager {
	private open_orders: OpenOrder[] = [];
	private client: RedisClientType;
	private QueueManager: RedisClientType;
	private queue_name: string = "email_queue";
	private group: string = "email_workers";
	private asset: Asset = {
		BTCUSDT: { ask: null, bid: null },
		ETHUSDT: { ask: null, bid: null },
		BNBUSDT: { ask: null, bid: null },
		XRPUSDT: { ask: null, bid: null },
		ADAUSDT: { ask: null, bid: null },
	};

	constructor(redisClient: RedisClientType) {
		this.client = redisClient;
		this.QueueManager = redisClient.duplicate();
		this.init();
	}

	private async init() {
		await this.client.connect();
		await this.QueueManager.connect();
		await this.subscribeToRedis();
		console.log("Redis Subscriber started");
		await this.initQueue();
		await this.send_confirmation(
			{
				email: "ashintv2003@gmail.com",
				message: `Server Init StartMessage`,
				balance: {
					usd_balance: 999999999,
					locked_balance: 0,
				},
				type: "notification",
				orderId: "1",
			},
			undefined
		);
	}

	private async subscribeToRedis() {
		await this.client.subscribe("trades_v0", (message) => {
			const data = JSON.parse(message);
			this.asset[data.asset as keyof Asset] = {
				ask: data.ask,
				bid: data.bid,
			};
			this.handleTradeUpdate(data);
		});
	}

	private handleTradeUpdate(data: any) {
		this.open_orders.forEach((order: OpenOrder, index) => {
			const pnl = this.calculatePnl(order);
			if (pnl === null) return;
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

	getOrderOf(userId: string) {
		return this.open_orders.filter((order) => order.userId === userId);
	}

	/**
	 * Gets the current price for a specific asset.
	 * @param s The asset symbol to get the price for.
	 * @returns The current price of the asset.
	 */
	getPrice(s: keyof Asset) {
		return this.asset[s];
	}

	/**
	 * Gets the current prices for all assets.
	 * @returns An object containing the current prices of all assets.
	 */
	getAssets() {
		return this.asset;
	}

	/**
	 * Opens a new order.
	 * @param Order The order to open.
	 */

	async openOrders(Order: OpenOrder) {
		const user = users_v0.find((u) => u.userId === Order.userId)!;
		user.balance.usd_balance -= Order.margin;
		user.balance.locked_balance += Order.margin;
		this.open_orders.push(Order);
		await this.send_confirmation(
			{
				email: user.email,
				message: "New order opened",
				balance: user.balance as UserBalance,
				type: "notification",
				orderId: Order.orderId,
			},
			user.res
		);
	}

	/**
	 * Closes an order and updates the user's balance.
	 * @param order The order to close.
	 * @param index The index of the order in the open orders list.
	 * @param pnl The profit and loss (PnL) of the order.
	 * @param cause The reason for closing the order.
	 */

	async closeOrders(
		order: OpenOrder,
		index: number,
		pnl: number,
		cause: "takeProfit" | "stopLoss" | "liquidation" | "user_closed"
	) {
		const closePrice = order.type == "buy" ? this.asset[order.asset]["bid"]! : this.asset[order.asset]["ask"]!;
		const user = users_v0.find((u) => u.userId === order.userId);
		if (user) {
			user.balance.usd_balance += order.margin + pnl;
			user.balance.locked_balance -= order.margin;
			if (user.res) {
				const notifaction: NotificationType = {
					email: user.email,
					message: `Order Closed cause: ${cause} `,
					balance: user.balance as UserBalance,
					type: "notification",
					orderId: order.orderId,
				};
				await this.send_confirmation(notifaction, user.res);
			}
		}
		this.open_orders.splice(index, 1);
		closed_orders_v0.push({
			...order,
			closePrice,
			pnl,
			cause,
		});
	}
	/**
	 * Calculates the profit and loss (PnL) for a specific order.
	 * @param order The order to calculate the PnL for.
	 * @returns The calculated PnL, or null if an error occurred.
	 */
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

	/**
	 * Initializes the email queue.
	 */
	private async initQueue() {
		try {
			await this.QueueManager.xGroupCreate(this.queue_name, "email_workers", "0", { MKSTREAM: true });
			console.log("Worker Group created successfully");
		} catch (error: any) {
			if (error.message.includes("BUSYGROUP")) {
				console.log("Worker Group already exists skipping....");
			} else {
				console.error("Error creating worker group:", error);
			}
		}
	}

	/**
	 * Sends a confirmation notification to the user and adds it to the email queue.
	 * @param notification The notification to send.
	 */
	private async send_confirmation(notification: NotificationType, res: Response | undefined) {
		if (res) {
			res?.write(JSON.stringify(notification));
		}
		await this.QueueManager.xAdd(this.queue_name, "*", { "data": JSON.stringify(notification) });
	}
}
