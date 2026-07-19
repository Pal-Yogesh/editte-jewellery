"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

export default function SignupPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(signupAction, undefined);

  useEffect(() => {
    if (state?.redirect) router.push(state.redirect);
  }, [state, router]);

  return (
    <div className="max-w-sm w-full mx-auto">
      <h1 className="font-heading text-cacao text-3xl mb-2">Create account</h1>
      <p className="text-ink/50 text-sm mb-10 tracking-wide">
        Join India&apos;s finest jewellery collective
      </p>

      <form action={action} className="flex flex-col gap-6">
        <AuthInput
          label="Full Name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          error={state?.errors?.name}
        />
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
          autoComplete="new-password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          error={state?.errors?.password}
        />

        {state?.message && (
          <p className="text-sm text-rose bg-rose/10 px-4 py-3 rounded">
            {state.message}
          </p>
        )}

        <AuthButton loading={pending}>Create Account</AuthButton>
      </form>

      <p className="text-center text-sm text-ink/50 mt-8">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-cacao hover:text-sage transition-colors">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-ink/30 mt-6 leading-relaxed">
        By creating an account you agree to our{" "}
        <span className="underline cursor-pointer">Terms</span> and{" "}
        <span className="underline cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  );
}
