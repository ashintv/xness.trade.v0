// "use client";
// import axios from "axios";
// import {
// 	CandlestickData,
// 	CandlestickSeries,
// 	CandlestickSeriesOptions,
// 	CandlestickStyleOptions,
// 	createChart,
// 	DeepPartial,
// 	ISeriesApi,
// 	SeriesOptionsCommon,
// 	Time,
// 	UTCTimestamp,
// 	WhitespaceData,
// } from "lightweight-charts";
// import { useEffect, useRef, useState } from "react";
// import { useWss } from "../../hooks/useWss";


// export default function CandleChart() {
// 	const candleSeriesRef =
// 		useRef<
// 			ISeriesApi<
// 				"Candlestick",
// 				Time,
// 				CandlestickData<Time> | WhitespaceData<Time>,
// 				CandlestickSeriesOptions,
// 				DeepPartial<CandlestickStyleOptions & SeriesOptionsCommon>
// 			>
// 		>(null);
// 	const chartOptions = {
// 		layout: {
// 			textColor: "black",
// 			background: { type: "solid", color: "white" },
// 		},
// 	};
// 	function toUTCTimestamp(isoString: string): UTCTimestamp {
// 		return Math.floor(new Date(isoString).getTime() / 1000) as UTCTimestamp;
// 	}

// 	const [pastData, setPastData] = useState<Candle[]>([]);
// 	const chartContainerRef = useRef<HTMLDivElement>(null);
// 	useEffect(() => {
// 		async function Fetch() {
// 			const response = await axios.get(
// 				`http://localhost:3000/api/trades/${"BTCUSDT"}/${1}`
// 			);
// 			setPastData(
// 				response.data.map((t: any) => ({
// 					time: toUTCTimestamp(t.timestamp),
// 					open: t.open_price,
// 					high: t.high_price,
// 					low: t.low_price,
// 					close: t.close_price,
// 				}))
// 			);
// 		}
// 		Fetch();
// 	}, []);

// 	useEffect(() => {
// 		if (chartContainerRef.current) {
// 			const chart = createChart(chartContainerRef.current, {
// 				layout: {
// 					textColor: "black",
// 					background: { color: "white" },
// 				},
// 			});
// 			const candleSeries = chart.addSeries(CandlestickSeries, {
// 				upColor: "#26a69a",
// 				downColor: "#ef5350",
// 				borderUpColor: "#26a69a",
// 				borderDownColor: "#ef5350",
// 				wickUpColor: "#26a69a",
// 				wickDownColor: "#ef5350",
// 			});
// 			candleSeriesRef.current = candleSeries;
// 			candleSeries.setData(pastData);
// 		}
// 	}, [pastData]);
// 	const liveData = useWss("ws://localhost:8080");
// 	useEffect(() => {
// 		candleSeriesRef.current?.update({
// 			time: new Date().getTime() as UTCTimestamp,
// 		});
// 	}, [liveData]);

// 	return (
        
// 			<div className="h-full" ref={chartContainerRef}>
// 				{chartContainerRef.current ? "t" : "n"}
// 			</div>
        
// 	)
// }

// interface Candle {
// 	time: Time;
// 	open: number;
// 	high: number;
// 	low: number;
// 	close: number;
// }
