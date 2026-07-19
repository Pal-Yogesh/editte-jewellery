"use client";
import { useActionState } from "react";
import { changePasswordAction } from "@/app/actions/profile";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-5 max-w-md">
      <AuthInput
        label="Current Password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        error={state?.errors?.currentPassword}
      />
      <AuthInput
        label="New Password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        error={state?.errors?.newPassword}
      />
      {state?.message && (
        <p className={`text-sm px-4 py-3 rounded ${state.success ? "text-sage bg-sage/10" : "text-rose bg-rose/10"}`}>
          {state.message}
        </p>
      )}
      <div className="flex justify-end">
        <AuthButton loading={pending} className="!w-auto !px-8">Update Password</AuthButton>
      </div>
    </form>
  );
}
