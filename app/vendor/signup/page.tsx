"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  pageCentered,
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


export default function VendorSignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const notify = (msg: string, error = false) => {
    setMessage(msg);
    setIsError(error);
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    notify("");

    try {
      const res = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, brandName }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify(data.message || "Sign up failed.", true);
        return;
      }

      setStep("otp");
      notify("We sent a 6-digit code to your email.");
    } catch {
      notify("Unable to sign up right now. Please try again.", true);
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
        body: JSON.stringify({ email, otp, purpose: "signup" }),
      });
      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        notify(data.message || "Invalid code.", true);
        return;
      }

      notify("Email verified. Redirecting to your dashboard...");
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
      <section className={`w-full max-w-md ${card}`}>
        <h1 className={`mb-2 ${heading}`}>
          Vendor Sign Up
        </h1>
        <p className={`mb-6 ${muted}`}>
          {step === "form"
            ? "Create your vendor account to list your brand."
            : "Enter the verification code sent to your email."}
        </p>

        {step === "form" ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className={label}>
                Brand name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className={input}
                placeholder="Your brand name"
              />
            </div>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={input}
                placeholder="At least 8 characters"
              />
            </div>
            <button type="submit" disabled={loading} className={buttonPrimaryBlock}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
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
              {loading ? "Verifying..." : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setOtp("");
                notify("");
              }}
              className={`w-full text-center text-sm ${linkMuted}`}
            >
              Back
            </button>
          </form>
        )}

        {message ? (
          <p className={`mt-4 ${banner(isError)}`}>
            {message}
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/vendor/login" className={linkStrong}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
