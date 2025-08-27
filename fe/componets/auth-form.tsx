'use client'

import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
	const router = useRouter();
	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-2xl font-bold">
				{mode === "signin" ? "Sign In" : "Sign Up"}
			</h2>
			<input type="email" placeholder="Email" className="border p-2" />
			<input type="password" placeholder="Password" className="border p-2" />
			<button  className="bg-blue-600 text-white p-2 rounded">
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
