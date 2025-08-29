"use client";
import axios from "axios";
import {
	CandlestickData,
	CandlestickSeries,
	createChart,
	ISeriesApi,
	UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useWss } from "../hooks/useWss";

export default function CandleChart() {
	const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const lastCandleRef = useRef<Candle | null>(null);
	const [pastData, setPastData] = useState<Candle[]>([]);
	const [timeframeSec, setTimeframeSec] = useState<number>(60); // 1m by default

	let lastCandle: Candle | null = null;

	// 🔹 Convert ISO timestamp to UTCTimestamp (seconds)
	function toUTCTimestamp(isoString: string): UTCTimestamp {
		return Math.floor(new Date(isoString).getTime() / 1000) as UTCTimestamp;
	}

	// 🔹 Fetch past data from API
	useEffect(() => {
		async function fetchPastData() {
			const response = await axios.get(
				`http://localhost:3000/api/trades/BTCUSDT/${timeframeSec / 60}`
			);

			setPastData(
				response.data.map((t: any) => ({
					time: toUTCTimestamp(t.timestamp),
					open: t.open_price,
					high: t.high_price,
					low: t.low_price,
					close: t.close_price,
				}))
			);
		}
		fetchPastData();
	}, [timeframeSec]);

	// 🔹 Initialize chart
	useEffect(() => {
		if (chartContainerRef.current && pastData.length > 0) {
			const chart = createChart(chartContainerRef.current, createChartOption);
			const candleSeries = chart.addSeries(CandlestickSeries, {
				upColor: "#26a69a",
				downColor: "#ef5350",
				borderUpColor: "#26a69a",
				borderDownColor: "#ef5350",
				wickUpColor: "#26a69a",
				wickDownColor: "#ef5350",
			});
			candleSeriesRef.current = candleSeries;
			candleSeries.setData(pastData);
			chart.timeScale().fitContent();
			// set lastCandle to last historical candle
			lastCandleRef.current = pastData[pastData.length - 1] || null;
		}
	}, [pastData]);

	// 🔹 WebSocket live trades
	const liveData = useWss("ws://localhost:8080"); // expect: { BTCUSDT: { price, timestamp } }
	useEffect(() => {
		if (!liveData || !candleSeriesRef.current) return;
		const trade = liveData.BTCUSDT;
		if (!trade) return;

		const ts = Math.floor(
			new Date(Date.now()).getTime() / 1000
		) as UTCTimestamp;
		const bucket = (Math.floor(ts / timeframeSec) *
			timeframeSec) as unknown as UTCTimestamp;

		console.log(lastCandleRef.current);
		if (!lastCandleRef.current || lastCandleRef.current.time !== bucket) {
			lastCandleRef.current = {
				time: bucket,
				open: trade.price,
				high: trade.price,
				low: trade.price,
				close: trade.price,
			};
			candleSeriesRef.current.update(lastCandleRef.current as CandlestickData);
		} else {
			// 🔹 Update existing candle
			lastCandleRef.current = {
				...lastCandleRef.current,
				close: trade.price,
				high: Math.max(lastCandleRef.current.high, trade.price),
				low: Math.min(lastCandleRef.current.low, trade.price),
			};
			candleSeriesRef.current.update(lastCandleRef.current as CandlestickData);
		}
	}, [liveData, timeframeSec]);

	return <div className="h-full w-full" ref={chartContainerRef}></div>;
}

// 🔹 Candle Type
interface Candle {
	time: UTCTimestamp;
	open: number;
	high: number;
	low: number;
	close: number;
}

// 🔹 Chart Styling
const createChartOption = {
	layout: {
		background: { color: "#222" },
		textColor: "#DDD",
	},
	grid: {
		vertLines: { color: "#444" },
		horzLines: { color: "#444" },
	},
};
