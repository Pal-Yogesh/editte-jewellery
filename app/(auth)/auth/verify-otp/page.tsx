"use client";
import { useActionState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyOtpAction, resendOtpAction } from "@/app/actions/auth";
import AuthButton from "@/components/ui/AuthButton";
import { Suspense } from "react";

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const purpose = (params.get("purpose") ?? "verify") as "verify" | "reset";

  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtpAction, undefined);
  const [resendState, resendAction, resendPending] = useActionState(resendOtpAction, undefined);

  // OTP digit refs for auto-focus
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (verifyState?.redirect) router.push(verifyState.redirect);
  }, [verifyState, router]);

  function handleDigitInput(e: React.ChangeEvent<HTMLInputElement>, i: number) {
    const val = e.target.value.replace(/\D/g, "");
    e.target.value = val.slice(-1);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleDigitKey(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace" && !(e.target as HTMLInputElement).value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function collectOtp() {
    return inputs.current.map((el) => el?.value ?? "").join("");
  }

  const title = purpose === "verify" ? "Verify your email" : "Enter reset code";
  const subtitle =
    purpose === "verify"
      ? "We sent a 6-digit code to verify your email"
      : "We sent a 6-digit reset code to";

  return (
    <div className="max-w-sm w-full mx-auto">
      <h1 className="font-heading text-cacao text-3xl mb-2">{title}</h1>
      <p className="text-ink/50 text-sm mb-2 tracking-wide">{subtitle}</p>
      <p className="text-cacao text-sm font-medium mb-10 truncate">{email}</p>

      {/* OTP box inputs */}
      <form
        action={async (fd) => {
          fd.set("otp", collectOtp());
          fd.set("email", email);
          fd.set("purpose", purpose);
          await verifyAction(fd);
        }}
        className="flex flex-col gap-8"
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="purpose" value={purpose} />

        <div className="flex gap-3 justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              onChange={(e) => handleDigitInput(e, i)}
              onKeyDown={(e) => handleDigitKey(e, i)}
              className="w-12 h-14 text-center text-xl border-b-2 border-ink/20 bg-transparent outline-none focus:border-cacao transition-colors text-cacao"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {verifyState?.message && (
          <p className="text-sm text-rose bg-rose/10 px-4 py-3 rounded">
            {verifyState.message}
          </p>
        )}

        <AuthButton loading={verifyPending}>Verify Code</AuthButton>
      </form>

      {/* Resend form */}
      <form
        action={async (fd) => {
          fd.set("email", email);
          fd.set("purpose", purpose);
          await resendAction(fd);
        }}
        className="mt-6 text-center"
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="purpose" value={purpose} />
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
          <p className="text-xs mt-2 text-sage">{resendState.message}</p>
        )}
      </form>

      <div className="mt-8 text-center">
        <Link href="/auth/login" className="text-xs text-ink/40 hover:text-cacao transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
