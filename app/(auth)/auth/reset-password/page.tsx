"use client";
import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [state, action, pending] = useActionState(resetPasswordAction, undefined);

  useEffect(() => {
    if (state?.redirect) router.push(state.redirect);
  }, [state, router]);

  return (
    <div className="max-w-sm w-full mx-auto">
      <h1 className="font-heading text-cacao text-3xl mb-2">Set new password</h1>
      <p className="text-ink/50 text-sm mb-10 tracking-wide">
        Choose a strong new password for{" "}
        <span className="text-cacao">{email}</span>
      </p>

      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="email" value={email} />
        <AuthInput
          label="New Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          error={state?.errors?.password}
        />

        {state?.message && !state.redirect && (
          <p className="text-sm text-rose bg-rose/10 px-4 py-3 rounded">
            {state.message}
          </p>
        )}

        <AuthButton loading={pending}>Update Password</AuthButton>
      </form>

      <div className="mt-8 text-center">
        <Link href="/auth/login" className="text-xs text-ink/40 hover:text-cacao transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
