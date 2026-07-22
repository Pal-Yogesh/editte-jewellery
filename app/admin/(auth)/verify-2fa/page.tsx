"use client";
import { useActionState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminVerify2FAAction, adminResend2FAAction } from "@/app/actions/adminAuth";
import AuthButton from "@/components/ui/AuthButton";

function Verify2FAForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const email   = params.get("email") ?? "";
  const inputs  = useRef<(HTMLInputElement | null)[]>([]);

  const [state,   verifyAction, verifyPending] = useActionState(adminVerify2FAAction, undefined);
  const [resendState, resendAction, resendPending] = useActionState(adminResend2FAAction, undefined);

  useEffect(() => {
    if (state?.redirect) router.push(state.redirect);
  }, [state, router]);

  function handleDigit(e: React.ChangeEvent<HTMLInputElement>, i: number) {
    const val = e.target.value.replace(/\D/g, "");
    e.target.value = val.slice(-1);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace" && !(e.target as HTMLInputElement).value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function collectOtp() {
    return inputs.current.map((el) => el?.value ?? "").join("");
  }

  return (
    <div className="min-h-screen bg-cacao flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-heading text-white text-3xl tracking-[0.3em] uppercase">editte</h1>
          <p className="text-white/40 text-xs tracking-[0.2em] uppercase mt-2">Admin Portal</p>
        </div>

        <div className="bg-salt rounded-xl p-8">
          <h2 className="font-heading text-cacao text-xl mb-1">Two-Factor Authentication</h2>
          <p className="text-ink/50 text-xs mb-1 tracking-wide">Code sent to</p>
          <p className="text-cacao text-sm font-heading mb-7 truncate">{email}</p>

          <form
            action={async (fd) => {
              fd.set("otp", collectOtp());
              fd.set("email", email);
              await verifyAction(fd);
            }}
            className="flex flex-col gap-7"
          >
            <input type="hidden" name="email" value={email} />

            {/* 6-digit OTP boxes */}
            <div className="flex gap-2 justify-between">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  onChange={(e) => handleDigit(e, i)}
                  onKeyDown={(e) => handleKey(e, i)}
                  className="w-11 h-13 text-center text-xl border-b-2 border-ink/20 bg-transparent outline-none focus:border-cacao transition-colors text-cacao"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            {state?.errors?.otp && (
              <p className="text-xs text-rose">{state.errors.otp[0]}</p>
            )}
            {state?.message && (
              <p className="text-sm text-rose bg-rose/10 px-4 py-3 rounded">
                {state.message}
              </p>
            )}

            <AuthButton loading={verifyPending}>Verify & Sign In</AuthButton>
          </form>

          {/* Resend */}
          <form
            action={async (fd) => { fd.set("email", email); await resendAction(fd); }}
            className="mt-5 text-center"
          >
            <input type="hidden" name="email" value={email} />
            <p className="text-sm text-ink/50">
              Didn&apos;t receive a code?{" "}
              <button
                type="submit"
                disabled={resendPending}
                className="text-cacao hover:text-sage underline transition-colors disabled:opacity-50"
              >
                {resendPending ? "Sending…" : "Resend"}
              </button>
            </p>
            {resendState?.message && (
              <p className="text-xs text-sage mt-2">{resendState.message}</p>
            )}
          </form>

          <div className="mt-5 text-center">
            <a href="/admin/login" className="text-xs text-ink/30 hover:text-cacao transition-colors">
              ← Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return <Suspense><Verify2FAForm /></Suspense>;
}
