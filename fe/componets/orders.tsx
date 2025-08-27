import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import axios from "axios";
import { AssetData } from "../store/priceStore";

export function Orders({ trade }: { trade: Record<string, AssetData> }) {
	const [orders, setOrders] = useState<Order[]>([]);
	const username = useUserStore((state) => state.username);
	const fetchData = async () => {
		const res = await axios.get(`http://localhost:3000/api/orders/${username}`);
		setOrders(res.data.orders);
	};

	useEffect(() => {
		fetchData();
	}, [username]);
	function calculatePL(order: Order): number {
		const tradeData = trade[order.asset];
		if (!tradeData) return 0; 

		const currentPrice = tradeData.bid
		const qty = order.qty;

		
		if (order.type === "buy") {
			return (currentPrice - order.OpenPrice) * qty;
		} else if (order.type === "sell") {
			return (order.OpenPrice - currentPrice) * qty;
		}

		return 0;
	}
	return (
		<div className="rounded-xl shadow-lg w-full ">
			<h2 className="text-lg font-semibold">Your Orders</h2>
			<div className="h-[250px] overflow-y-auto space-y-2 ">
				{orders.map((order) => (
					<OrderRow
						key={order.id}
						asset={order.asset}
						qty={order.qty}
						OpenPrice={order.OpenPrice}
						type={order.type}
						CurrentPrice={trade[order.asset]?.bid}
						pl={calculatePL(order) }
					/>
				))}
			</div>
		</div>
	);
}

function OrderRow({
	asset,
	qty,
	OpenPrice,
	CurrentPrice,
	pl,
	type,
}: {
	asset: string;
	qty: number;
	OpenPrice: number;
	CurrentPrice: number;
	pl: number;
	type: "buy" | "sell";
}) {
	return (
		<div className="flex items-center  p-2 rounded-md bg-black text-xs px-5">
			<div className="text-bold text-yellow-300 w-1/6">{asset}</div>
			<div className="text-bold w-1/6">
				{qty}

				{/* {CurrentPrice}
                {pl} */}
			</div>
			<div className="text-bold w-1/6">{type == "buy" ? "Buy" : "Sell"}</div>
			<div className="text-bold w-1/6">{OpenPrice}</div>
			<div className="text-bold w-1/6">{CurrentPrice}</div>
			<div className="text-bold w-1/6">{pl}</div>
		</div>
	);
}

interface Order {
	id: number;
	asset: string;
	type: "buy" | "sell";
	qty: number;
	price: number;
	OpenPrice: number;
}
