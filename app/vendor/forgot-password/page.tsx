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
  linkStrong,
} from "@/app/theme";


export default function VendorForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const notify = (msg: string, error = false) => {
    setMessage(msg);
    setIsError(error);
  };

  const handleRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    notify("");

    try {
      const res = await fetch("/api/vendor/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify(data.message || "Something went wrong.", true);
        return;
      }

      setStep("reset");
      notify("If that email is registered, a reset code has been sent.");
    } catch {
      notify("Unable to send reset code. Please try again.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    notify("");

    try {
      const res = await fetch("/api/vendor/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify(data.message || "Reset failed.", true);
        return;
      }

      notify("Password updated. Redirecting to login...");
      setTimeout(() => router.push("/vendor/login"), 1200);
    } catch {
      notify("Reset failed. Please try again.", true);
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
          Reset Password
        </h1>
        <p className={`mb-6 ${muted}`}>
          {step === "request"
            ? "Enter your email to receive a reset code."
            : "Enter the code and choose a new password."}
        </p>

        {step === "request" ? (
          <form onSubmit={handleRequest} className="space-y-5">
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
            <button type="submit" disabled={loading} className={buttonPrimaryBlock}>
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
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
            <div>
              <label className={label}>
                New password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={input}
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={buttonPrimaryBlock}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        {message ? (
          <p className={`mt-4 ${banner(isError)}`}>
            {message}
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/vendor/login" className={linkStrong}>
            Back to login
          </Link>
        </p>
        </section>
      </div>
    </main>
  );
}
