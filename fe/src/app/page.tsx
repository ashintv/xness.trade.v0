"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const router = useRouter();
	return (
		<div className="border flex justify-center items-center h-screen flex-col gap-4">
			<h1>Welcome to the Trading Platform</h1>
			<ul className="flex flex-col gap-2 border rounded-2xl p-20 ">
				<li
					className="hover:underline hover:cursor-pointer hover:text-red-500 text-blue-600"
					onClick={() => router.push("/trade")}>
					Go to Trade
				</li>
				<li
					className="hover:underline hover:cursor-pointer hover:text-red-500 text-blue-600"
					onClick={() => router.push("/signup")}>
					Sign Up
				</li>
				<li
					className="hover:underline hover:cursor-pointer hover:text-red-500 text-blue-600"
					onClick={() => router.push("/signin")}>
					Sign In
				</li>
			</ul>
		</div>
	);
}
