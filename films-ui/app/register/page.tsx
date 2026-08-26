"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type RegisterState = {
	username: string;
	email: string;
	password: string;
};

const initialState: RegisterState = {
	username: "",
	email: "",
	password: "",
};

export default function RegisterPage() {
	const [form, setForm] = useState<RegisterState>(initialState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setSuccess("");

		if (!form.username.trim()) {
			setError("Username is required.");
			return;
		}

		if (!form.email.trim()) {
			setError("Email is required.");
			return;
		}

		if (!form.password) {
			setError("Password is required.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: form.username.trim(),
					email: form.email.trim(),
					password: form.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || "Could not register user.");
			}

			setSuccess("User registered successfully.");
			setForm(initialState);
		} catch (registerError) {
			const message =
				registerError instanceof Error
					? registerError.message
					: "Something went wrong. Please try again.";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-md items-center px-5 py-10">
			<div className="w-full border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
				<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
					Create account
				</p>
				<h1 className="mt-2 text-3xl font-black text-slate-900">Register</h1>
				<p className="mt-2 text-sm text-slate-600">
					Add a new local user with username, email, and password.
				</p>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="username">
							Username
						</label>
						<input
							className="w-full border border-slate-300 px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
							id="username"
							name="username"
							type="text"
							autoComplete="username"
							placeholder="Enter username"
							value={form.username}
							onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
							required
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="email">
							Email
						</label>
						<input
							className="w-full border border-slate-300 px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							placeholder="name@example.com"
							value={form.email}
							onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
							required
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="password">
							Password
						</label>
						<input
							className="w-full border border-slate-300 px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
							id="password"
							name="password"
							type="password"
							autoComplete="new-password"
							placeholder="Enter password"
							value={form.password}
							onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
							required
						/>
					</div>

					{error && <p className="text-sm text-red-600">{error}</p>}
					{success && <p className="text-sm text-green-700">{success}</p>}

					<button
						className="w-full border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Registering..." : "Register"}
					</button>
				</form>

				<p className="mt-4 text-sm text-slate-600">
					Back to <Link className="font-semibold text-indigo-700 hover:text-indigo-900" href="/">home</Link>.
				</p>
			</div>
		</section>
	);
}
