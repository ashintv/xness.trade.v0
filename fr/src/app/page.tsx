"use client";
import { useEffect, useState } from "react";
import { Candle, TradeChart } from "../../componets/chart";
import { Table } from "../../componets/table";


// Mock table data type
type Trade = {
  time: string;
  asset: string;
  price: number;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Candle[]>([]);


  async function fetchData() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/trades/1");
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
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
		<div className="w-screen h-screen flex flex-col bg-gray-950 text-white">
			{/* Navbar */}
			<nav className="w-full h-14 flex items-center justify-between px-6 bg-gray-900 shadow-md">
				<h1 className="text-xl font-bold">📈 Trading Dashboard</h1>
				<button
					onClick={fetchData}
					className="px-4 py-1 rounded-md bg-blue-600 hover:bg-blue-700">
					Refresh
				</button>
			</nav>

			<div className="flex flex-1 p-4 gap-4">
				<Table />
				{/* Right: Chart */}
				<div className="flex-1 bg-gray-800 rounded-xl p-4 shadow-lg">
					{loading ? <p>Loading...</p> : <TradeChart data={data} />}
				</div>
			</div>
		</div>
	);
}
