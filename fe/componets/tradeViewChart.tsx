"use client";
import axios from "axios";
import {
	CandlestickData,
	CandlestickSeries,
	createChart,
	IChartApi,
	ISeriesApi,
	UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useWss } from "../hooks/useWss";

export default function CandleChart({ asset, timeframeSec }: { asset: string; timeframeSec :number}) {
	const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<IChartApi>(null);
	const lastCandleRef = useRef<Candle | null>(null);
	const [pastData, setPastData] = useState<Candle[]>([]);
	const chartInitialized = useRef(false);

	// const [timeframeSec, setTimeframeSec] = useState<number>(60); // 1m by default

	let lastCandle: Candle | null = null;

	function toUTCTimestamp(isoString: string): UTCTimestamp {
		return Math.floor(new Date(isoString).getTime() / 1000) as UTCTimestamp;
	}

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
		 return () => {
				chartRef.current?.remove();
				candleSeriesRef.current = null;
			};
	}, [timeframeSec , asset]);

	useEffect(() => {
		if (chartContainerRef.current && pastData.length > 0 && !chartInitialized.current) {
			const chart = createChart(chartContainerRef.current, createChartOption);
			chartRef.current = chart;
			chart.timeScale().fitContent();
			chart.timeScale().setVisibleLogicalRange({ from: 1, to: 10 });
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
			chartRef.current?.timeScale().setVisibleLogicalRange({
				from: candleSeriesRef.current?.data.length - 100,
				to: candleSeriesRef.current?.data.length,
			});
			chartInitialized.current = true; 
		}
	}, [pastData]);

	const liveData = useWss("ws://localhost:8080");
	useEffect(() => {
		if (!liveData || !candleSeriesRef.current) return;
		const trade = liveData.BTCUSDT;
		if (!trade) return;

		const ts = Math.floor(
			new Date(Date.now()).getTime() / 1000
		) as UTCTimestamp;
		const bucket = (Math.floor(ts / timeframeSec) *
			timeframeSec) as unknown as UTCTimestamp;

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
			lastCandleRef.current = {
				...lastCandleRef.current,
				close: trade.price,
				high: Math.max(lastCandleRef.current.high, trade.price),
				low: Math.min(lastCandleRef.current.low, trade.price),
			};
			candleSeriesRef.current.update(lastCandleRef.current as CandlestickData);
		}
		chartRef.current
			?.timeScale()
			.scrollToPosition(candleSeriesRef.current.data.length + 5, true);
		
	}, [liveData, timeframeSec]);

	return <div className="h-full w-full" ref={chartContainerRef}></div>;
}

interface Candle {
	time: UTCTimestamp;
	open: number;
	high: number;
	low: number;
	close: number;
}

const createChartOption = {
	layout: {
		background: { color: "#030712" },
		textColor: "#DDD",
	},
	grid: {
		vertLines: { color: "#444" },
		horzLines: { color: "#444" },
	},
};
