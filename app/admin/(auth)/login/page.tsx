"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLoginAction } from "@/app/actions/adminAuth";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(adminLoginAction, undefined);

  useEffect(() => {
    if (state?.redirect) router.push(state.redirect);
  }, [state, router]);

  return (
    <div className="min-h-screen bg-cacao flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-white text-3xl tracking-[0.3em] uppercase">
            editte
          </h1>
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase mt-2">
            Admin Portal
          </p>
        </div>

        <div className="bg-salt rounded-xl p-8">
          <h2 className="font-heading text-cacao text-xl mb-1">Sign In</h2>
          <p className="text-ink/40 text-xs mb-7 tracking-wide">
            A verification code will be sent to your email
          </p>

          <form action={action} className="flex flex-col gap-5">
            <AuthInput
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
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

            <AuthButton loading={pending} className="mt-2">
              Continue
            </AuthButton>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-8 tracking-wider">
          Admin access only · Unauthorised access is prohibited
        </p>
      </div>
    </div>
  );
}
