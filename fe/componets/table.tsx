import { Dispatch, SetStateAction, useState } from "react";
import { useWss } from "../hooks/useWss";

export function Table({ setAsset }: { setAsset: Dispatch<SetStateAction<"BTCUSDT" | "ETHUSDT" | "BNBUSDT" | "XRPUSDT" | "ADAUSDT">> }) {
	const trade = useWss("ws://localhost:8080");
	return (
		<div className="w-1/3 bg-gray-800 rounded-xl p-4 shadow-lg overflow-y-auto">
			<h2 className="text-lg font-semibold mb-3">Live Prices</h2>
			{Object.values(trade).map((item) => (
				<div
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
					key={item.asset}
					className="border m-1 rounded-md flex px-5 justify-between bg-black border-gray-900 py-2">
					{item.asset}
					<div className="flex justify-between">
						<span
							className={item.profit > 0 ? "text-green-500" : "text-red-500"}>
							{item.price} $
						</span>
					</div>
				</div>
			))}
		</div>
	);
}
