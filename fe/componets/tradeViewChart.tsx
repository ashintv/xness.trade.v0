
// import React, { useEffect, useRef } from "react";
// import {
// 	createChart,
// 	IChartApi,
// 	ISeriesApi,
// 	CandlestickData,
// 	CandlestickSeriesPartialOptions,
// } from "lightweight-charts";

// const CandleChart: React.FC = () => {
// 	const chartContainerRef = useRef<HTMLDivElement | null>(null);
// 	const chartRef = useRef<IChartApi | null>(null);
// 	const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

// 	useEffect(() => {
// 		if (!chartContainerRef.current) return;

// 		// Create chart instance
// 		const chart = createChart(chartContainerRef.current, {
// 			width: chartContainerRef.current.clientWidth,
// 			height: 400,
// 			layout: {
// 				background: { color: "#ffffff" },
// 				textColor: "#333",
// 			},
// 			grid: {
// 				vertLines: { color: "#eee" },
// 				horzLines: { color: "#eee" },
// 			},
// 			timeScale: {
// 				borderColor: "#ccc",
// 			},
// 		});

// 		chartRef.current = chart;

// 		// ✅ Add Candlestick Series
// 		const candleSeries = chart.addCandlestickSeries();
// 		candleSeriesRef.current = candleSeries;

// 		// Initial candles
// 		const initialData: CandlestickData[] = [
// 			{
// 				time: "2025-08-28T09:30:00",
// 				open: 120,
// 				high: 130,
// 				low: 115,
// 				close: 125,
// 			},
// 			{
// 				time: "2025-08-28T09:35:00",
// 				open: 125,
// 				high: 135,
// 				low: 120,
// 				close: 130,
// 			},
// 		];
// 		candleSeries.setData(initialData);

// 		// Simulate live updates
// 		let i = 0;
// 		const interval = setInterval(() => {
// 			i++;
// 			const newCandle: CandlestickData = {
// 				time: `2025-08-28T09:${40 + i}:00`, // ISO string or UNIX timestamp
// 				open: 130,
// 				high: 140 + i,
// 				low: 125,
// 				close: 135 + i,
// 			};

// 			// ✅ Updates if same time, appends if new
// 			candleSeries.update(newCandle);
// 		}, 3000);

// 		return () => {
// 			clearInterval(interval);
// 			chart.remove();
// 		};
// 	}, []);

// 	return (
// 		<div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
// 	);
// };

// export default CandleChart;