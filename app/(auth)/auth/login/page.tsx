"use client";
import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const resetSuccess = params.get("reset") === "1";

  const [state, action, pending] = useActionState(loginAction, undefined);

  useEffect(() => {
    if (state?.redirect) router.push(state.redirect);
  }, [state, router]);

  return (
    <div className="max-w-sm w-full mx-auto">
      <h1 className="font-heading text-cacao text-3xl mb-2">Welcome back</h1>
      <p className="text-ink/50 text-sm mb-10 tracking-wide">
        Sign in to your editte account
      </p>

      {resetSuccess && (
        <p className="text-sm text-sage bg-sage/10 px-4 py-3 rounded mb-6">
          ✓ Password updated successfully. Sign in with your new password.
        </p>
      )}

      <form action={action} className="flex flex-col gap-6">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={state?.errors?.email}
        />
        <AuthInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={state?.errors?.password}
        />

        {state?.message && (
          <p className="text-sm text-rose bg-rose/10 px-4 py-3 rounded">
            {state.message}
          </p>
        )}

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-ink/50 hover:text-cacao transition-colors tracking-wide"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton loading={pending}>Sign In</AuthButton>
      </form>

      <p className="text-center text-sm text-ink/50 mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-cacao hover:text-sage transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
