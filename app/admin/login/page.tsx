"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
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
} from "@/app/theme";

type LoginResponse = {
  message?: string;
  authenticated?: boolean;
  otpRequired?: boolean;
  role?: string;
};

const OTP_DURATION = 60;

export default function AdminLoginPage() {
  const router = useRouter();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setCountdown(OTP_DURATION);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleCredentialsSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password }),
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Invalid credentials.");
        return;
      }

      if (data.otpRequired) {
        setStep("otp");
        setIsError(false);
        setMessage("A verification code has been sent to your registered email.");
        startTimer();
      }
    } catch {
      setIsError(true);
      setMessage("Unable to login right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, otp }),
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok || !data.authenticated) {
        setIsError(true);
        setMessage(data.message || "Invalid OTP.");
        return;
      }

      clearTimer();
      setIsError(false);
      setMessage("Verified. Redirecting to dashboard...");
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password }),
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || "Failed to resend OTP.");
        return;
      }

      setOtp("");
      setIsError(false);
      setMessage("New verification code sent.");
      startTimer();
    } catch {
      setIsError(true);
      setMessage("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    clearTimer();
    setStep("credentials");
    setOtp("");
    setMessage("");
    setIsError(false);
  };

  return (
    <main className={pageCentered}>
      <section className={`w-full max-w-md ${card}`}>
        <h1 className={`mb-2 ${heading}`}>
          Admin Login
        </h1>
        <p className={`mb-6 ${muted}`}>
          {step === "credentials"
            ? "Sign in with your admin ID and password."
            : "Enter the verification code sent to your email."}
        </p>

        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label htmlFor="adminId" className={label}>
                Admin ID
              </label>
              <input
                id="adminId"
                name="adminId"
                type="text"
                autoComplete="username"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
                className={input}
                placeholder="Enter admin ID"
              />
            </div>

            <div>
              <label htmlFor="password" className={label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={input}
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonPrimaryBlock}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className={label}>
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                className={otpInput}
                placeholder="000000"
              />
            </div>

            {countdown > 0 ? (
              <p className="text-center text-sm text-muted">
                Code expires in{" "}
                <span className="font-medium text-foreground">
                  {countdown}s
                </span>
              </p>
            ) : (
              <p className="text-center text-sm text-error-fg">
                Code expired.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || countdown === 0}
              className={buttonPrimaryBlock}
            >
              {loading ? "Verifying..." : "Verify & Sign in"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading || countdown > 0}
              className={`w-full text-center text-sm ${linkMuted} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              Resend code
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
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
      </section>
    </main>
  );
}
