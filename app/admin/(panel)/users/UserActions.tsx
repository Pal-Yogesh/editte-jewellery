"use client";
import { useActionState, useState } from "react";
import {
  assignAdminRoleAction,
  removeAdminRoleAction,
  resetUserPasswordAction,
  deleteUserAction,
} from "@/app/actions/adminUsers";

interface Props {
  uid: string;
  role: string;
  name: string;
  isSelf: boolean;
}

export default function UserActions({ uid, role, name, isSelf }: Props) {
  const [showReset, setShowReset] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [roleState, roleAction, rolePending] = useActionState(
    role === "admin" ? removeAdminRoleAction : assignAdminRoleAction,
    undefined
  );
  const [resetState, resetAction, resetPending] = useActionState(resetUserPasswordAction, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteUserAction, undefined);

  if (isSelf) return <span className="text-xs text-ink/20">You</span>;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Role toggle */}
      {/* <form action={roleAction}>
        <input type="hidden" name="uid" value={uid} />
        <button type="submit" disabled={rolePending}
          className={`text-[10px] tracking-wide uppercase px-3 py-1.5 border transition-colors disabled:opacity-50 ${
            role === "admin"
              ? "border-rose/30 text-rose hover:bg-rose hover:text-white"
              : "border-sage/30 text-sage hover:bg-sage hover:text-white"
          }`}>
          {rolePending ? "…" : role === "admin" ? "Revoke Admin" : "Make Admin"}
        </button>
      </form> */}
      {roleState?.message && <span className="text-xs text-ink/40">{roleState.message}</span>}

      {/* Reset password */}
      <button onClick={() => setShowReset((v) => !v)}
        className="text-[10px] tracking-wide uppercase px-3 py-1.5 border border-cacao/20 text-cacao/60 hover:border-cacao hover:text-cacao transition-colors">
        Reset PW
      </button>

      {/* Delete */}
      <button onClick={() => setShowDelete(true)}
        className="text-[10px] tracking-wide uppercase px-3 py-1.5 border border-rose/20 text-rose/60 hover:border-rose hover:text-rose transition-colors">
        Delete
      </button>

      {/* Reset password inline form */}
      {showReset && (
        <form action={async (fd) => { fd.set("uid", uid); await resetAction(fd); setShowReset(false); }}
          className="flex gap-2 w-full mt-1">
          <input type="password" name="newPassword" placeholder="New password (min 6)"
            className="flex-1 border-b border-ink/20 text-xs pb-1 outline-none focus:border-cacao bg-transparent" />
          <button type="submit" disabled={resetPending}
            className="text-[10px] bg-cacao text-white px-3 py-1 disabled:opacity-50">
            {resetPending ? "…" : "Set"}
          </button>
          <button type="button" onClick={() => setShowReset(false)} className="text-[10px] text-ink/30">Cancel</button>
        </form>
      )}
      {resetState?.message && <span className="text-xs text-sage">{resetState.message}</span>}

      {/* Delete confirm */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-cacao/30 flex items-center justify-center">
          <div className="bg-salt rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <p className="font-heading text-cacao text-base mb-2">Delete user?</p>
            <p className="text-ink/50 text-sm mb-6">This will permanently delete <strong>{name}</strong> and all their data.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 border border-ink/20 text-ink/50 text-sm py-2 hover:border-ink/50 transition-colors">
                Cancel
              </button>
              <form action={async (fd) => { fd.set("uid", uid); await deleteAction(fd); setShowDelete(false); }} className="flex-1">
                <button type="submit" disabled={deletePending}
                  className="w-full bg-rose text-white text-sm py-2 hover:bg-rose/80 transition-colors disabled:opacity-50">
                  {deletePending ? "Deleting…" : "Delete"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
