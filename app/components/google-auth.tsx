"use client";

import { useState } from "react";
import { signInWithPopup, type UserCredential } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { buttonOutline, buttonPrimary } from "@/app/theme";

type GoogleAuthProps = {
  onSuccess?: (credential: UserCredential, mode: "signin" | "signup") => void;
  onError?: (error: Error, mode: "signin" | "signup") => void;
};

export default function GoogleAuth({ onSuccess, onError }: GoogleAuthProps) {
  const [loadingMode, setLoadingMode] = useState<"signin" | "signup" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleAuth = async (mode: "signin" | "signup") => {
    setLoadingMode(mode);
    setErrorMessage(null);

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      onSuccess?.(credential, mode);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Google authentication failed.");
      setErrorMessage(error.message);
      onError?.(error, mode);
    } finally {
      setLoadingMode(null);
    }
  };

  const isSigningIn = loadingMode === "signin";
  const isSigningUp = loadingMode === "signup";
  const isLoading = loadingMode !== null;

  return (
    <div className="w-full max-w-sm space-y-3">
      <button
        type="button"
        onClick={() => handleGoogleAuth("signin")}
        disabled={isLoading}
        className={`w-full gap-2 ${buttonOutline}`}
      >
        {isSigningIn ? "Signing in..." : "Sign in with Google"}
      </button>

      <button
        type="button"
        onClick={() => handleGoogleAuth("signup")}
        disabled={isLoading}
        className={`w-full gap-2 ${buttonPrimary}`}
      >
        {isSigningUp ? "Creating account..." : "Sign up with Google"}
      </button>

      {errorMessage ? (
        <p className="text-sm text-error-fg">{errorMessage}</p>
      ) : null}
    </div>
  );
}
