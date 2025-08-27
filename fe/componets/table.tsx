import { Dispatch, SetStateAction} from "react";
import { useWss } from "../hooks/useWss";
import { AssetData } from "../store/priceStore";

export function Table({
	setAsset,
	trade,
}: {
	setAsset: Dispatch<
		SetStateAction<"BTCUSDT" | "ETHUSDT" | "BNBUSDT" | "XRPUSDT" | "ADAUSDT">
	>;
	trade: Record<string, AssetData>;
}) {
	

	return (
		<div className="w-full min-w-94 bg-gray-800 rounded-2xl p-4 shadow-lg overflow-y-auto">
			<h2 className="text-sm font-bold text-white mb-4">📈 Live Prices</h2>

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
						className="flex items-center justify-between px-2 py-1 rounded-xl bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
						{/* Asset name */}
						<div className="text-xs font-semibold text-white">{item.asset}</div>

						{/* Prices */}
						<div className="flex items-center gap-6 text-sm">
							<div className="flex  items-end">
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

							<div className="flex  items-end">
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
