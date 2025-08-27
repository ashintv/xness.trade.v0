"use client";
import dynamic from "next/dynamic";
import Chart from "react-apexcharts";
export type Candle = {
	x: string | number | Date; // timestamp (ISO string, number, or Date)
	y: [number, number, number, number]; // [open, high, low, close]
};

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
	ssr: false,
});
export function TradeChart({ data }: { data: Candle[] }) {
	const series = [
		{
			data,
		},
	];
	const options: ApexCharts.ApexOptions = {
		chart: {
			type: "candlestick",
			height: 350,
			background: "#0d0d0d", // deep black background
			toolbar: { show: true },
		},
		theme: {
			mode: "dark",
			palette: "palette1",
			monochrome: {
				enabled: false, // disable monochrome since we want green/red
			},
		},
		plotOptions: {
			candlestick: {
				colors: {
					upward: "#00ff88", // neon green for bullish
					downward: "#ff2e2e", // bright red for bearish
				},
				wick: {
					useFillColor: true, // wick uses same color as body
				},
			},
		},
		xaxis: {
			type: "datetime",
			labels: { style: { colors: "#aaa" } },
		},
		yaxis: {
			tooltip: { enabled: true },
			labels: { style: { colors: "#aaa" } },
		},
		grid: {
			borderColor: "#333",
			strokeDashArray: 3,
		},
	};
	return (
		<div className="bg-transparent w-full rounded-2xl shadow-sm  p-4">
			{typeof window !== "undefined" && (
				<Chart
					options={options}
					series={series}
					type="candlestick"
					height={350}
				/>
			)}
		</div>
	);
}
