import { roundTo } from "../lib/utils/RoundN";
import { useBalanceStore } from "../store/orderStore";
import { Trade } from "../lib/types";

export function Balance({ trade }: { trade: Trade }) {
	// const orders = useOrderStore((state) => state.orders);
	// function sumOfUnrealizedPnL(): number {
		// let total = 0;
		// orders
		// 	.filter((o) => o.status === "open")
		// 	.forEach((o) => {
		// 		const assetData = trade[o.asset as keyof Trade];
		// 		if (assetData && o.type === "long") {
		// 			total += (assetData.bid - o.OpenPrice) * o.qty;
		// 		} else if (assetData && o.type === "short") {
		// 			total += (o.OpenPrice - assetData.bid) * o.qty;
		// 		}
		// 	});
		// return total;
	// }
	const balance = useBalanceStore((state) => state.balance);
	return (
		<div className="flex flex-col w-fit text-xs">
			{JSON.stringify(balance)}
			{/* Tradable: {roundTo(balance.tradable)} <br />
			Actual:{" "}
			{roundTo(balance.tradable + balance.locked + sumOfUnrealizedPnL())} <br /> */}
		</div>
	);
}
