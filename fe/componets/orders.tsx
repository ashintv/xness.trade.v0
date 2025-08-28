import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import axios from "axios";
import { AssetData, Order, Trade } from "../lib/types";
import { useOrderStore } from "../store/orderStore";
import { useFetchOrders } from "../hooks/useFetchOrders";

export function Orders({ trade }: { trade:Trade }) {
	
	const orders = useOrderStore((state) => state.orders);
	const balance = useUserStore((state) => state.balance);
	const username = useUserStore((state) => state.username);
	const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
	useFetchOrders({ username , balance });

	function calculatePL(order: Order): number {
		const tradeData = trade[order.asset as keyof Trade];
		if (!tradeData) return 0;
		const currentPrice = tradeData.bid;
		const qty = order.qty;
		if (order.type === "long") {
			return (currentPrice - order.OpenPrice) * qty;
		} else if (order.type === "short") {
			return (order.OpenPrice - currentPrice) * qty;
		}

		return 0;
	}
	return (
		<div className="rounded-xl shadow-lg w-full border-black border bg-gray-900 p-4 mt-4">
			<div className="flex items-center  p-2 rounded-md text-xs px-5 text-blue-400">
				<div className="text-bold  w-1/6">S</div>
				<div className="text-bold w-1/7">QT</div>
				<div className="text-bold w-1/7">TYPE</div>
				<div className="text-bold w-1/7">OP</div>
				<div className="text-bold w-1/7">CP</div>
				<div className="text-bold w-1/7">P/L</div>
				<div
					className={`text-bold w-1/7 text-underline hover:cursor-pointer hover:text-yellow-300 ${
						filter === "open" ? "text-blue-500" : "text-gray-500"
					}`}>
					<select
						value={filter}
						onChange={(e) =>
							setFilter(e.target.value as "open" | "closed" | "all")
						}>
						<option value="open">Opened</option>
						<option value="closed">Closed</option>
						<option value="all">All</option>
					</select>
				</div>
			</div>

			<div className="h-[200px] overflow-y-auto space-y-1 ">
				{orders
					.filter(
						(order) =>
							order.status === (filter === "all" ? order.status : filter)
					)
					.map((order) => (
						<OrderRow
							status={order.status}
							id={order.id}
							key={order.id}
							asset={order.asset}
							qty={order.qty}
							OpenPrice={order.OpenPrice}
							type={order.type}
							CurrentPrice={
								filter == "closed" ? order.ClosePrice : trade[order.asset as keyof Trade]?.bid!
							}
							pl={filter == "closed" ? order.pl : calculatePL(order)}
						/>
					))}
			</div>
		</div>
	);
}

function OrderRow({
	id,
	asset,
	qty,
	OpenPrice,
	CurrentPrice,
	pl,
	type,
	status,
}: {
	id: number;
	asset: string;
	qty: number;
	OpenPrice: number;
	CurrentPrice: number;
	pl: number;
	type: "long" | "short";
	status: "open" | "closed";
}) {
	const username = useUserStore((state) => state.username);
	const setBalance = useUserStore((state) => state.setBalance);
	async function handleClose(id: number) {
		try {
			const res = await axios.post("http://localhost:3000/api/order/close", {
				orderID: id,
				username,
			});
			setBalance(res.data.user.balance);
		} catch (err) {
			console.error(err);
		}
		// Close the order
	}
	return (
		<div className="flex items-center  p-2 border-b border-gray-950 text-xs px-5 ">
			<div className="text-bold text-yellow-300 w-1/6">{asset}</div>
			<div className="text-bold w-1/7">{qty}</div>
			<div className="text-bold w-1/7">{type == "long" ? "Long" : "Short"}</div>
			<div className="text-bold w-1/7">{OpenPrice}</div>
			<div className="text-bold w-1/7">{CurrentPrice}</div>
			<div
				className={`text-bold w-1/7 ${
					pl < 0 ? "text-red-500" : "text-green-500"
				}`}>
				{Math.round(pl * 1000) / 1000}
			</div>
			<div className=" w-1/7  text-black ">
				<button
					disabled={status === "closed"}
					className=" bg-red-500 rounded px-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
					onClick={() => handleClose(id)}>
					Close
				</button>
			</div>
		</div>
	);
}

