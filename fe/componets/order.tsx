"use client";
import axios from "axios";
import { useState } from "react";
import { useUserStore } from "../store/userStore";

export default function OrderForm({
	asset,
}: {
	asset: "BTCUSDT" | "ETHUSDT" | "BNBUSDT" | "XRPUSDT" | "ADAUSDT";
}) {
	const [quantity, setQuantity] = useState(0.01);
	const [type, setType] = useState<"buy" | "sell">("buy");
    const setBalance = useUserStore((state) => state.setBalance);
    const username = useUserStore((state) => state.username);
	const handleSubmit = async () => {
		const res = await axios.post("http://localhost:3000/api/order/open", {
			username,
			type,
			asset,
			qty: quantity
		});
        console.log(res.data);
        console.log(asset)
        setBalance(res.data.balance);
	};

	return (
		<div className="bg-gray-900 p-4 rounded-xl shadow-lg w-80 space-y-4 w-full">
			<div>
				<span className="text-gray-400">Asset:</span>
				{asset}
			</div>
			{/* Quantity */}
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

			{/* Place Order */}
			<button
				onClick={handleSubmit}
				className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-semibold">
				Place Order
			</button>
		</div>
	);
}
