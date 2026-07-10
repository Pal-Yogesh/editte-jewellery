"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User, type UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import GoogleAuth from "./components/google-auth";
import { buttonOutline, card, heading, muted } from "@/app/theme";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSuccess = (
    credential: UserCredential,
    mode: "signin" | "signup",
  ) => {
    const userName =
      credential.user.displayName || credential.user.email || "User";
    setStatusMessage(
      mode === "signin"
        ? `Welcome back, ${userName}! You are signed in with Google.`
        : `Account created successfully, ${userName}! You are signed up with Google.`,
    );
  };

  const handleError = (error: Error, mode: "signin" | "signup") => {
    setStatusMessage(
      mode === "signin"
        ? `Sign in failed: ${error.message}`
        : `Sign up failed: ${error.message}`,
    );
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setStatusMessage("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className={muted}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <main className={`w-full max-w-md ${card}`}>
        <h1 className={`mb-2 ${heading}`}>
          Welcome to Jewellery Web
        </h1>

        {user ? (
          <div className="space-y-4">
            <p className={muted}>
              Signed in as {user.displayName || user.email}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className={`w-full ${buttonOutline}`}
            >
              Sign out
            </button>
          </div>
        ) : (
          <>
            <p className={`mb-6 ${muted}`}>
              Continue with Google to sign in or create your account.
            </p>
            <GoogleAuth onSuccess={handleSuccess} onError={handleError} />
          </>
        )}

        {statusMessage ? (
          <p className="mt-4 rounded-md bg-surface-hover px-3 py-2 text-sm text-foreground">
            {statusMessage}
          </p>
        ) : null}
      </main>
    </div>
  );
}
