"use client";
import axios from "axios";
import {
	CandlestickSeries,
	createChart,
	IChartApi,
	ISeriesApi,
	Time,
	UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useWss } from "../hooks/useWss";
import { Trade } from "../lib/types";
import { time } from "console";

export default function CandleChart({
	asset,
	timeframeSec,
}: {
	asset: string;
	timeframeSec: number;
}) {
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

	function toUTCTimestamp_Real(): UTCTimestamp {
		return Math.floor(Date.now() / 1000) as UTCTimestamp;
	}

	useEffect(() => {
		async function fetchPastData() {
			const response = await axios.get(
				`http://localhost:3000/api/trades/${asset}/${timeframeSec / 60}`
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
			lastCandleRef.current = null;
			if (chartRef.current) {
				chartRef.current.remove();
				chartRef.current = null;
				candleSeriesRef.current = null;
				chartInitialized.current = false;
			}
		};
	}, [timeframeSec, asset]);

	useEffect(() => {
		if (
			chartContainerRef.current &&
			pastData.length > 0 &&
			!chartInitialized.current
		) {
			const chart = createChart(chartContainerRef.current, createChartOption);
			chartRef.current = chart;
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
			chart.timeScale().resetTimeScale();
			chartInitialized.current = true;
		}
	}, [pastData]);

	const liveData = useWss("ws://localhost:8080");
	useEffect(() => {
		if (!liveData || !candleSeriesRef.current) return;
		const trade = liveData[asset as keyof Trade];
		if (!trade) return;

		const ts = toUTCTimestamp_Real();
		const bucket = (Math.floor(ts / timeframeSec) *
			timeframeSec) as UTCTimestamp;

		if (!lastCandleRef.current || lastCandleRef.current.time !== bucket) {
			lastCandleRef.current = {
				time: bucket,
				open: trade.price,
				high: trade.price,
				low: trade.price,
				close: trade.price,
			};
			const lastBar = candleSeriesRef.current.dataByIndex(
				candleSeriesRef.current.data().length - 1
			);
			if (
				candleSeriesRef.current &&
				lastCandleRef.current.time >= lastBar?.time!
			) {
				candleSeriesRef.current.update(lastCandleRef.current, false);
			}
		} else {
			lastCandleRef.current = {
				...lastCandleRef.current,
				time: bucket,
				close: trade.price,
				high: Math.max(lastCandleRef.current.high, trade.price),
				low: Math.min(lastCandleRef.current.low, trade.price),
			};
			const lastBar = candleSeriesRef.current.dataByIndex(
				candleSeriesRef.current.data().length - 1
			);
			if (
				candleSeriesRef.current &&
				lastCandleRef.current.time >= lastBar?.time!
			) {
				candleSeriesRef.current.update(lastCandleRef.current, false);
			}
		}

		chartRef.current?.timeScale().scrollToPosition(15, true);
	}, [liveData, timeframeSec]);

	return <div className="h-full w-full" ref={chartContainerRef}></div>;
}

interface Candle {
	time: Time;
	open: number;
	high: number;
	low: number;
	close: number;
}

const createChartOption = {
	width: 960,
	layout: {
		background: { color: "#0a0a0a" },
		textColor: "#DDD",
	},
	grid: {
		vertLines: { color: "#1e2938" },
		horzLines: { color: "#1e2938" },
	},
	timeScale: {
		timeVisible: false,
		seconds: false,
		tickMarkFormatter: (time: number) => {
			const date = new Date(time * 1000);
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
		},
	},
};
