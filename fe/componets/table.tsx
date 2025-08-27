import { Dispatch, SetStateAction } from "react";
import { useWss } from "../hooks/useWss";

export function Table({
	setAsset,
}: {
	setAsset: Dispatch<
		SetStateAction<"BTCUSDT" | "ETHUSDT" | "BNBUSDT" | "XRPUSDT" | "ADAUSDT">
	>;
}) {
	const trade = useWss("ws://localhost:8080");

	return (
		<div className="w-1/3 bg-gray-800 rounded-2xl p-4 shadow-lg overflow-y-auto">
			<h2 className="text-xl font-bold text-white mb-4">📈 Live Prices</h2>

			<div className="space-y-2">
				{Object.values(trade).map((item) => (
					<div
						key={item.asset}
						onClick={() =>
							setAsset(
								item.asset as
									| "BTCUSDT"
									| "ETHUSDT"
									| "BNBUSDT"
									| "XRPUSDT"
									| "ADAUSDT"
							)
						}
						className="flex items-center justify-between p-3 rounded-xl bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
						{/* Asset name */}
						<div className="text-lg font-semibold text-white">{item.asset}</div>

						{/* Prices */}
						<div className="flex items-center gap-6 text-sm">
							<div className="flex flex-col items-end">
								<span className="text-gray-400">Ask</span>
								<span
									className={
										item.profitAsk < 0
											? "text-green-400 font-medium"
											: "text-red-400 font-medium"
									}>
									{item.ask} $
								</span>
							</div>

							<div className="flex flex-col items-end">
								<span className="text-gray-400">Bid</span>
								<span
									className={
										item.profitBid > 0
											? "text-green-400 font-medium"
											: "text-red-400 font-medium"
									}>
									{item.bid} $
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
