"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccountAction } from "@/app/actions/profile";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

export default function DeleteAccount() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [state, action, pending] = useActionState(deleteAccountAction, undefined);

  useEffect(() => {
    if (state?.redirect) router.push(state.redirect);
  }, [state, router]);

  return (
    <div>
      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="border border-rose text-rose text-sm tracking-[0.1em] uppercase px-6 py-2.5 hover:bg-rose hover:text-white transition-colors"
        >
          Delete My Account
        </button>
      ) : (
        <form action={action} className="flex flex-col gap-4 max-w-sm">
          <p className="text-sm text-rose bg-rose/10 px-4 py-3 rounded">
            This will permanently delete your account, addresses, wishlist, cart, and all your data.
          </p>
          <AuthInput
            label='Type "DELETE" to confirm'
            name="confirm"
            placeholder="DELETE"
            error={state?.message ? [state.message] : undefined}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-ink/20 text-ink/50 text-sm py-2.5 hover:border-ink/50 transition-colors"
            >
              Cancel
            </button>
            <AuthButton loading={pending} className="flex-1 !bg-rose hover:!bg-cacao">
              Delete Account
            </AuthButton>
          </div>
        </form>
      )}
    </div>
  );
}
