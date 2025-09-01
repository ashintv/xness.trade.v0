import AuthForm from "../../../../../componets/auth-form-test";


export default function SignUpPage() {
	return (
		<div className="flex justify-center items-center h-screen">
			<div className="border p-4 rounded w-1/3 ">
				<AuthForm mode="signup" />
			</div>
		</div>
	);
}
