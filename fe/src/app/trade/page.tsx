"use client";
import { useEffect, useState } from "react";
import { Candle, TradeChart } from "../../../componets/chart";
import { Table } from "../../../componets/table";
import { SelectTime } from "../../../componets/selectTime";
import { SelectAsset } from "../../../componets/SelectAsset";
import { useUserStore } from "../../../store/userStore";
import OrderForm from "../../../componets/order";
import { Orders } from "../../../componets/orders";
import { useWss } from "../../../hooks/useWss";

// Mock table data type
type Trade = {
	time: string;
	asset: string;
	price: number;
};

export default function Dashboard() {
	const [loading, setLoading] = useState(false);
	const [asset, setAsset] = useState<
		"BTCUSDT" | "ETHUSDT" | "BNBUSDT" | "XRPUSDT" | "ADAUSDT"
	>("BTCUSDT");
	const [data, setData] = useState<Candle[]>([]);
	const [timeFrame, setTimeFrame] = useState<"1" | "5" | "15" | "60" | "1440">(
		"1"
	);
	const Userbalance = useUserStore((state) => state.balance.USD);

	async function fetchData() {
		setLoading(true);
		try {
			const response = await fetch(
				`http://localhost:3000/api/trades/${asset}/${timeFrame}`
			);
			const result = await response.json();

			setData(
				result.map((d: any) => ({
					x: new Date(d.timestamp),
					y: [d.open_price, d.high_price, d.low_price, d.close_price],
				}))
			);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	}

  const trade = useWss("ws://localhost:8080");
	
  
	useEffect(() => {
		fetchData();
	}, [timeFrame, asset]);

	return (
		<div className="w-screen h-screen flex flex-col bg-gray-950 text-white">
			{/* Navbar */}
			<nav className="w-full h-14 flex items-center justify-between px-6 bg-gray-900 shadow-md">
				<div className=" flex items-center gap-8">
					<h1 className="text-xl font-bold">📈 Trading Dashboard</h1>
					<div className="flex w-xs items-center gap-1">
						<p className="text-yellow-400 font-bold">Balance:</p>
						<p>{Userbalance} USD</p>
					</div>
				</div>
				<div className="flex gap-4">
					<SelectAsset
						value={asset}
						onChange={(e) => setAsset(e.target.value as any)}
					/>
					<SelectTime
						value={timeFrame}
						onChange={(e) => {
							setTimeFrame(e.target.value as "1" | "5" | "15" | "60" | "1440");
						}}
					/>
					<button
						onClick={fetchData}
						className="px-4 py-1 rounded-md bg-blue-600 hover:bg-blue-700">
						Refresh
					</button>
				</div>
			</nav>

			<div className="flex flex-1 p-4 gap-4 ">
				<div className="flex flex-col gap-4 ">
					<div className="">
						<Table setAsset={setAsset} trade={trade} />
					</div>
					<div className=" h-1/2">
						<OrderForm asset={asset} />
					</div>
				</div>

				{/* Right: Chart */}
				<div className="flex-1 bg-gray-800 rounded-xl p-4 shadow-lg">
					{loading ? <p>Loading...</p> : <TradeChart data={data}  />}
					<Orders trade={trade} />
				</div>
			</div>
		</div>
	);
}
