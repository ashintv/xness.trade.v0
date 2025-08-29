import CandleChart from "../../../componets/tradeViewChart";

;

export default function DemoPage() {
	return (
		<div className="w-screen h-screen ">
			<h1>Demo Page</h1>
			<div className="w-full h-1/2">
				<CandleChart />
			</div>
		</div>
	);
}