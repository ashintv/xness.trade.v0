"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "../store/userStore";
import { useBalanceStore } from "../store/orderStore";
import app_api from "../lib/config";
import { toast } from "react-hot-toast";
export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
	const [usernameField, setUsernameField] = useState("");
	const [passwordField, setPasswordField] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	async function handleSubmit() {
		try {
			setLoading(true);
			if (mode === "signin") {
				const res = await app_api.post(`user/signin`, {
					email: usernameField,
					password: passwordField,
				});
				localStorage.setItem("token", res.data.token);
				router.push("/trade");
			} else {
				// Sign up
				const res = await app_api.post(`user/signup`, {
					email: usernameField,
					password: passwordField,
				});
				console.log(res.data);
				router.push("/signin");
			}
		} catch (error) {
			console.error("Error during authentication:", error);
			toast.error(`Failed to ${mode} Please try again.`);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			<h2 className="text-2xl font-bold">{mode === "signin" ? "Sign In" : "Sign Up"}</h2>
			<input
				onChange={(e) => setUsernameField(e.target.value)}
				type="email"
				placeholder="ashin@gmail.com"
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
