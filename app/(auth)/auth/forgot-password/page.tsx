"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(forgotPasswordAction, undefined);

  useEffect(() => {
    if (state?.redirect) router.push(state.redirect);
  }, [state, router]);

  return (
    <div className="max-w-sm w-full mx-auto">
      <h1 className="font-heading text-cacao text-3xl mb-2">Forgot password?</h1>
      <p className="text-ink/50 text-sm mb-10 tracking-wide">
        Enter your email and we&apos;ll send a reset code
      </p>

      <form action={action} className="flex flex-col gap-6">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={state?.errors?.email}
        />

        {state?.message && !state.redirect && (
          <p className={`text-sm px-4 py-3 rounded ${state.success ? "text-sage bg-sage/10" : "text-rose bg-rose/10"}`}>
            {state.message}
          </p>
        )}

        <AuthButton loading={pending}>Send Reset Code</AuthButton>
      </form>

      <div className="mt-8 text-center">
        <Link href="/auth/login" className="text-xs text-ink/40 hover:text-cacao transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
