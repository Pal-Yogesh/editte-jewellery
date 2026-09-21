"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  pageCentered,
  authWordmark,
  authWordmarkSub,
  card,
  heading,
  muted,
  label,
  input,
  otpInput,
  buttonPrimaryBlock,
  banner,
  linkMuted,
  linkStrong,
} from "@/app/theme";


export default function VendorLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [purpose, setPurpose] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const notify = (msg: string, error = false) => {
    setMessage(msg);
    setIsError(error);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    notify("");

    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify(data.message || "Invalid credentials.", true);
        return;
      }

      setPurpose(data.purpose === "signup" ? "signup" : "login");
      setStep("otp");
      notify(data.message || "A verification code has been sent to your email.");
    } catch {
      notify("Unable to log in right now. Please try again.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    notify("");

    try {
      const res = await fetch("/api/vendor/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose }),
      });
      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        notify(data.message || "Invalid code.", true);
        return;
      }

      notify("Verified. Redirecting...");
      router.push("/vendor/dashboard");
      router.refresh();
    } catch {
      notify("Verification failed. Please try again.", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={pageCentered}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className={`${authWordmark} text-heading`}>editte</p>
          <p className={`${authWordmarkSub} text-muted`}>Vendor Portal</p>
        </div>

        <section className={card}>
        <h1 className={`mb-2 ${heading}`}>
          Vendor Login
        </h1>
        <p className={`mb-6 ${muted}`}>
          {step === "credentials"
            ? "Sign in with your email and password."
            : "Enter the verification code sent to your email."}
        </p>

        {step === "credentials" ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={label}>
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={input}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className={label}>
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={input}
                placeholder="Enter password"
              />
            </div>
            <button type="submit" disabled={loading} className={buttonPrimaryBlock}>
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className={label}>
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                className={otpInput}
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={buttonPrimaryBlock}
            >
              {loading ? "Verifying..." : "Verify & sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setOtp("");
                notify("");
              }}
              className={`w-full text-center text-sm ${linkMuted}`}
            >
              Back to login
            </button>
          </form>
        )}

        {message ? (
          <p className={`mt-4 ${banner(isError)}`}>
            {message}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href="/vendor/forgot-password"
            className={linkMuted}
          >
            Forgot password?
          </Link>
          <Link
            href="/vendor/signup"
            className={linkStrong}
          >
            Create account
          </Link>
        </div>
        </section>
      </div>
    </main>
  );
}
