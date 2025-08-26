'use client'
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
			toolbar: {
				show: true,
			},
		},
		title: {
			text: "Candlestick Chart",
			align: "left",
		},
		xaxis: {
			type: "datetime",
		},
		yaxis: {
			tooltip: {
				enabled: true,
			},
		},
        theme: {
            mode: 'dark',
        }
		
	};
	return (
		<div className="bg-white w-full rounded-2xl shadow-sm border border-gray-200 p-4">
            {typeof window !== 'undefined' && (
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
