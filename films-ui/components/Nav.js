"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuth, getAuth, saveAuth } from "../lib/auth";

export default function Nav() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const storedAuth = getAuth();

    if (storedAuth) {
      setUser(storedAuth.user);
    }
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setIsLoggingIn(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: formData.get("username"),
            password: formData.get("password"),
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Invalid username or password.");
      }
      saveAuth(data.jwt, data.user);
      setUser(data.user);
      event.currentTarget.reset();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    clearAuth();
    setUser(null);
  }

  return (
    <nav className="flex w-full flex-wrap items-center justify-between bg-white px-4 py-4 text-lg text-gray-700 md:py-0">
      <Link href="/">
        <img
          className="m-3"
          src="/strapi-logo.png"
          width={200}
          height={50}
          alt="Strapi Logo"
        />
      </Link>
      <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto md:gap-4">
        <div className="flex items-center gap-3">
          <Link className="py-2 hover:text-purple-400 md:p-2" href="/">
          Home
          </Link>
          <Link className="py-2 hover:text-purple-400 md:p-2" href="/films">
            Films
          </Link>
        </div>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <Link className="font-semibold text-indigo-700 hover:text-indigo-900" href="/profile">
              {user.username}&apos;s profile
            </Link>
            <button className="border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        ) : (
        <form className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto" onSubmit={handleLogin}>
          <label className="sr-only" htmlFor="username">
            Username
          </label>
          <input
            className="min-w-0 flex-1 border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:w-28 md:flex-none"
            id="username"
            name="username"
            placeholder="Username"
            type="text"
            autoComplete="username"
          />
          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <input
            className="min-w-0 flex-1 border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:w-28 md:flex-none"
            id="password"
            name="password"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
          />
          <button
            className="border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            type="submit"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Login"}
          </button>
          <Link className="border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50" href="/register">
            Register
          </Link>
          {error && <p className="w-full text-right text-xs text-red-600">{error}</p>}
        </form>
        )}
      </div>
    </nav>
  );
}