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
import { Balance } from "../../../componets/balance";
import { useFetchBalance } from "../../../hooks/usefetchBalance";
import CandleChart from "../../../componets/tradeViewChart";
import { useBalanceStore } from "../../../store/orderStore";

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

	const [timeFrame, setTimeFrame] = useState<"1" | "5" | "15" | "60" | "1440">(
		"1"
	);
	const Userbalance = useBalanceStore((state) => state.balance);
	useFetchBalance();
	const trade = useWss("ws://localhost:8080");

	return (
		<div className="w-screen h-screen flex flex-col text-white">
			{/* Navbar */}
			<nav className="w-full h-20 flex items-center justify-between px-6  shadow-md">
				<div className=" flex items-center gap-8">
					<h1 className="text-xl font-bold">📈 DonTo</h1>
					<div className="flex w-xs items-center gap-1">
						<Balance trade={trade} />
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
				</div>
			</nav>

			<div className="flex flex-1 p-4 gap-4 border border-gray-800">
				<div className="flex flex-col gap-4 border border-gray-800 ">
					<div className="">
						<Table setAsset={setAsset} trade={trade} />
					</div>
					<div className=" h-1/2">
						<OrderForm
							asset={asset}
							ask={trade[asset]?.ask!}
							sell={trade[asset]?.bid!}
						/>
					</div>
				</div>

				{/* Right: Chart */}
				<div className="flex flex-col bg-transparent border border-gray-800 p-4 shadow-lg ">
					{loading ? (
						<p>Loading...</p>
					) : (
						<CandleChart timeframeSec={Number(timeFrame) * 60} asset={asset} />
					)}
					<div className="w-full border border-gray-800">
						<Orders trade={trade} />
					</div>
				</div>
			</div>
		</div>
	);
}
