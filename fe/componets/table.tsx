import { useState } from "react";
import { useWss } from "../hooks/useWss";

export function Table() {
	const trade = useWss("ws://localhost:8080");
	return (
		<div className="w-1/3 bg-gray-800 rounded-xl p-4 shadow-lg overflow-y-auto">
			<h2 className="text-lg font-semibold mb-3">Live Prices</h2>
			<table className="w-full text-left border-collapse">
				<thead className="bg-gray-700 text-gray-200">
					<tr>
						<th className="py-2 px-3">Time</th>
						<th className="py-2 px-3">Asset</th>
						<th className="py-2 px-3">Price</th>
					</tr>
				</thead>
				<tbody>
					<tr
						className={`border-b border-gray-700 hover:bg-gray-900 border ${
							trade?.profit > 0 ? "border-green-500" : "border-red-500"
						}`}>
						<td className="py-2 px-3">{trade?.time}</td>
						<td className="py-2 px-3 ">{trade?.asset}</td>
						<td className={`py-2 px-3 ${trade?.profit > 0 ? "text-green-500" : "text-red-500"}`}>{trade?.price}</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
