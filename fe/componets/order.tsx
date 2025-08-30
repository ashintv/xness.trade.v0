"use client";
import axios from "axios";
import { useState } from "react";
import { useBalanceStore } from "../store/orderStore";
import { useUserStore } from "../store/userStore";
import { convertFromPercentage, convertToPercentage } from "../lib/utils/percentage-convetor";
import toast from "react-hot-toast";


export default function OrderForm({
	asset,
	ask,
	sell
}: {
	asset: "BTCUSDT" | "ETHUSDT" | "BNBUSDT" | "XRPUSDT" | "ADAUSDT";
	ask: number;
	sell: number;
}) {
	const [quantity, setQuantity] = useState(0.01);
	const [leverage, setLeverage] = useState(1);
	const [takeProfit, setTakeProfit] = useState(0);
	const [stopLoss, setStopLoss] = useState(0);
	const [type, setType] = useState<"long" | "short">("long");
	const setBalance = useBalanceStore((state) => state.setBalance);
	const [pl, setPType] = useState<'%' | '$'>('%');
	const username = useUserStore((state) => state.username);
	const handleSubmit = async () => {
		const res = await axios.post("http://localhost:3000/api/order/open", {
			username,
			type,
			asset,
			qty: quantity,
			leverage,
			stopLoss: pl === '%' ? convertFromPercentage(stopLoss, type === "long" ? ask : sell) : stopLoss,
			takeProfit: pl === '%' ? convertFromPercentage(takeProfit, type === "long" ? ask : sell) : takeProfit,
		}, {
			headers: {
				Authorization: localStorage.getItem("token"),
			},
		});
		setBalance(res.data.balance);
		toast.success("Order placed successfully!");
	};

	return (
		<div className=" p-4 rounded-xl shadow-lg w-full space-y-3 ">
			<div>
				<span className="text-gray-400">Asset:</span>
				{asset}
			</div>
			<select
				className="w-full bg-gray-700 rounded-md p-1 flex justify-center"
				name="orderType"
				id="orderType"
				value={type}
				onChange={(e) => setType(e.target.value as "long" | "short")}>
				<option value="long">Long / Buy</option>
				<option value="short">Short / Sell</option>
			</select>
			<div>
				<label className="block text-sm text-gray-400 mb-1">Quantity</label>
				<div className="flex items-center bg-black rounded-md border border-gray-700">
					<input
						type="number"
						step="0.01"
						value={quantity}
						onChange={(e) => setQuantity(parseFloat(e.target.value))}
						className="flex-1 p-2 bg-black text-white rounded-l-md outline-none"
					/>
					<button
						onClick={() => setQuantity((q) => Math.max(0, q - 0.01))}
						className="px-3 text-gray-400 hover:text-white">
						–
					</button>
					<button
						onClick={() => setQuantity((q) => q + 0.01)}
						className="px-3 text-gray-400 hover:text-white">
						+
					</button>
				</div>
			</div>
			<div>
				<label className="block text-sm text-gray-400 mb-1">Leaverage</label>
				<div className="flex items-center bg-black rounded-md border border-gray-700">
					<input
						type="number"
						step="1"
						value={leverage}
						onChange={(e) => setLeverage(parseFloat(e.target.value))}
						className="flex-1 p-2 bg-black text-white rounded-l-md outline-none"
					/>
					<button
						onClick={() => setLeverage((l) => l - 1)}
						className="px-3 text-gray-400 hover:text-white">
						–
					</button>
					<button
						onClick={() => setLeverage((l) => l + 1)}
						className="px-3 text-gray-400 hover:text-white">
						+
					</button>
				</div>
			</div>

			<SelectPL pl={pl} setPType={setPType} />
			<div className="flex text-sm gap-1">
				<div className="border border-gray-700 p-2">
					TP : <span className="text-gray-400">{pl === '%' ? convertFromPercentage(takeProfit, type === "long" ? ask : sell) : convertToPercentage(takeProfit, type === "long" ? ask : sell)}{pl === '$' ? '%' : '$'}</span>
					<input
						value={takeProfit}
						onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
						type="number"
						placeholder="0.13$"
						className="flex-1 p-2 bg-black border border-gray-700 text-white rounded-l-md outline-none"
					/>
				</div>
				<div className="border border-gray-700 p-2">
					SL : <span className="text-gray-400">{pl === '%' ? convertFromPercentage(stopLoss, type === "long" ? ask : sell) : convertToPercentage(stopLoss, type === "long" ? ask : sell)}{pl === '%' ? '$' : '%'}</span>
					<input
						value={stopLoss}
						onChange={(e) => setStopLoss(parseFloat(e.target.value))}
						type="number"
						placeholder="0.29$"
						className="flex-1 p-2 bg-black border border-gray-700 text-white rounded-l-md outline-none"
					/>
				</div>
			</div>
			<div className="text-sm text-gray-500">
				Margin ={" "}
				{Math.round(
					((quantity * (type === "long" ? ask : sell)) / leverage) * 100
				) / 100}{" "}
				USD
			</div>

			{/* Place Order */}
			<button
				onClick={handleSubmit}
				className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-semibold">
				Place Order
			</button>
		</div>
	);
}


export function SelectPL({ pl, setPType }:{ pl: '%' | '$', setPType: (value: '%' | '$') => void }){
	return (
		
		<select
			className="bg-black border border-gray-700 text-white rounded text-xs outline-none px-3 py-2 "
			value={pl}
			onChange={(e) => setPType(e.target.value as '%' | '$')}>
			<option value="%">take profit/stop loss in %</option>
			<option value="$">take profit/stop loss in $</option>
		</select>
	);
} 
