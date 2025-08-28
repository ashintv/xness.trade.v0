"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
export type Candle = {
	x: string; // timestamp (ISO string, number, or Date)
	y: [number, number, number, number]; // [open, high, low, close]
};

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
	ssr: false,
});
export function TradeChart({
	timeFrame,
	asset,
}: {
	timeFrame: number;
	asset: string;
}) {
	const [data, setData] = useState<Candle[]>([]);
	async function fetchData() {
		try {
			const response = await fetch(
				`http://localhost:3000/api/trades/${asset}/${timeFrame}`
			);
			const result = await response.json();

			setData(
				result.map((d: any) => ({
					x: new Date(d.timestamp),
					y: [d.open_price, d.high_price, d.low_price, d.close_price],
				}))
			);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
		}
	}

	useEffect(() => {
		const interval = setInterval(() => {
			fetchData();
		}, 10000);

		return () => clearInterval(interval);
	}, [asset, timeFrame]);

	const series = [
		{
			data,
		},
	];
	const options: ApexCharts.ApexOptions = {
		title: {
			text: `${asset} - ${timeFrame}min`,
			align: "left",
		},
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
		tooltip: {
			shared: true,
			intersect: false,
		},
	};
	return (
		<div className="bg-[#0d0d0d] w-full rounded-2xl shadow-sm   p-4">
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
