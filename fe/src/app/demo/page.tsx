// "use client";
// import React, { useEffect, useRef } from "react";
// import { createChart, CandlestickSeries } from "lightweight-charts";

// interface OHLC {
// 	time: number | string;
// 	open: number;
// 	high: number;
// 	low: number;
// 	close: number;
// }

// type RawOHLC = OHLC[];

// function sanitizeData(raw: RawOHLC): OHLC[] {
// 	const parsed = raw.map((d) => ({
// 		...d,
// 		time:
// 			typeof d.time === "string"
// 				? Math.floor(new Date(d.time).valueOf() / 1000)
// 				: d.time,
// 	}));
// 	parsed.sort((a, b) => (a.time as number) - (b.time as number));
// 	return parsed.filter(
// 		(item, index, arr) => index === 0 || item.time !== arr[index - 1].time
// 	);
// }

// const CandleChart: React.FC = () => {
// 	const chartContainerRef = useRef<HTMLDivElement | null>(null);

// 	useEffect(() => {
// 		if (!chartContainerRef.current) return;

// 		const chart = createChart(chartContainerRef.current, {
// 			width: chartContainerRef.current.clientWidth,
// 			height: 400,
// 			layout: {
// 				background: { color: "#000000" },
// 				textColor: "#d1d4dc",
// 			},
// 			grid: {
// 				vertLines: { color: "#1c1c1c" },
// 				horzLines: { color: "#1c1c1c" },
// 			},
// 			crosshair: { mode: 1 },
// 			rightPriceScale: { borderVisible: false },
// 			timeScale: { borderVisible: false },
// 		});

// 		const candleSeries = chart.addSeries(CandlestickSeries, {
// 			upColor: "#26a69a",
// 			downColor: "#ef5350",
// 			borderVisible: false,
// 			wickUpColor: "#26a69a",
// 			wickDownColor: "#ef5350",
// 		});

// 		const rawData: RawOHLC = [
// 			// Example data set (timestamps duplicated for demonstration)
// 			{ time: 1756339200, open: 1.23, high: 1.25, low: 1.2, close: 1.22 },
// 			{
// 				time: 1756339200,
// 				open: 1.22,
// 				high: 1.24,
// 				low: 1.21,
// 				close: 1.23,
// 			}, // duplicate timestamp
// 			{ time: 1756342800, open: 1.23, high: 1.26, low: 1.22, close: 1.25 },
// 			{
// 				time: "2025-08-28T06:00:00Z",
// 				open: 0.86,
// 				high: 0.87,
// 				low: 0.85,
// 				close: 0.86,
// 			},
// 			// Add more data points...
// 		];

// 		const sanitized = sanitizeData(rawData);
// 		candleSeries.setData(sanitized);

// 		chart.timeScale().scrollToRealTime();

// 		const handleResize = () => {
// 			if (chartContainerRef.current) {
// 				chart.applyOptions({
// 					width: chartContainerRef.current.clientWidth,
// 				});
// 			}
// 		};

// 		window.addEventListener("resize", handleResize);
// 		return () => {
// 			window.removeEventListener("resize", handleResize);
// 			chart.remove();
// 		};
// 	}, []);

// 	return (
// 		<div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
// 	);
// };

// export default CandleChart;
