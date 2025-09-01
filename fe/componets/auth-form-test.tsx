"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "../store/userStore";
import axios from "axios";
import { useBalanceStore } from "../store/orderStore";
import toast, { Toaster } from "react-hot-toast";
export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
	const [usernameField, setUsernameField] = useState("");
	const [passwordField, setPasswordField] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const setUsername = useUserStore((state) => state.setUsername);
	const setBalance = useBalanceStore((state) => state.setBalance);
	async function handleSubmit() {
		setLoading(true);
		if (mode === "signin") {
			const res = await axios.post(`http://localhost:3005/api/v1/user/signin`, {
				email: usernameField,
				password: passwordField,
			});
			localStorage.setItem("token", res.data.token);
			// setUsername(res.data.email);
			// setBalance(res.data.balance);
			alert("Sign in successful");
			const token = res.data.token;
			const evtSource = new EventSource(`http://localhost:3005/api/v1/events?token=${token}`);
			evtSource.onmessage = (event) => {
				const data = JSON.parse(event.data);
				toast(`New event: ${data.message}`);
				console.log("New event:", data);
			};

			evtSource.onerror = (err) => {
				console.error("SSE error:", err);
			};
		} else {
			// Sign up
			const res = await axios.post(`http://localhost:3005/api/v1/user/signup`, {
				email: usernameField,
				password: passwordField,
			});
			console.log(res.data);
			router.push("/signin");
		}
		setLoading(false);
	}
	return (
		<div className="flex flex-col gap-4 w-full">
			<h2 className="text-2xl font-bold">{mode === "signin" ? "Sign In" : "Sign Up"}</h2>
			<input
				onChange={(e) => setUsernameField(e.target.value)}
				type="text"
				placeholder="Email"
				className="border p-2 w-full"
			/>
			<input
				onChange={(e) => setPasswordField(e.target.value)}
				type="password"
				placeholder="Password"
				className="border p-2 w-full"
			/>
			<button
				onClick={handleSubmit}
				disabled={loading}
				className="bg-blue-600 disabled:bg-blue-400 text-white p-2 rounded">
				{mode === "signin" ? "Sign In" : "Sign Up"}
			</button>
			<p>
				{mode === "signin" ? "Don't have an account? " : "Already have an account? "}
				<span
					onClick={() => router.push(mode === "signin" ? "/signup" : "/signin")}
					className="text-blue-600 hover:underline">
					{mode === "signin" ? "Sign Up" : "Sign In"}
				</span>
			</p>
		</div>
	);
}
