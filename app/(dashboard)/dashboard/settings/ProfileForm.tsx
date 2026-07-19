"use client";
import { useActionState, useRef, useState, useEffect } from "react";
import { updateProfileAction, uploadPhotoAction } from "@/app/actions/profile";
import AuthInput from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  phone?: string | null;
  dob?: string | null;
  gender?: string | null;
}

export default function ProfileForm({ user }: { user: User | null }) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, undefined);
  const [photoState, photoAction, photoPending] = useActionState(uploadPhotoAction, undefined);

  // preview tracks what's shown in the circle.
  // Initially = saved photoURL; updated to blob URL when user picks a file;
  // updated to the real Firebase URL after a successful upload.
  const [preview, setPreview] = useState<string | null>(user?.photoURL ?? null);
  // pendingFile = true when user has picked a file but not yet uploaded
  const [pendingFile, setPendingFile] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // When upload succeeds, the action returns the new Firebase URL in state.redirect
  useEffect(() => {
    if (photoState?.success && photoState.redirect) {
      setPreview(photoState.redirect); // redirect field carries the new photoURL
      setPendingFile(false);
      // Clear the file input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [photoState]);

  return (
    <div className="flex flex-col gap-8">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-sand"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-cacao text-white flex items-center justify-center text-2xl font-heading uppercase">
              {(user?.name ?? "U").charAt(0)}
            </div>
          )}
          {/* Spinner overlay while uploading */}
          {photoPending && (
            <div className="absolute inset-0 rounded-full bg-cacao/50 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink/60">Profile photo</p>
          <form action={photoAction} className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              name="photo"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 3 * 1024 * 1024) {
                  setSizeError("Image must be under 3 MB. Please choose a smaller file.");
                  setPendingFile(false);
                  e.target.value = ""; // reset input
                  return;
                }
                setSizeError(null);
                setPreview(URL.createObjectURL(f));
                setPendingFile(true);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-cacao underline hover:text-sage transition-colors"
            >
              Choose photo
            </button>
            {pendingFile && (
              <AuthButton
                type="submit"
                loading={photoPending}
                className="!w-auto !py-1.5 !px-4 text-xs"
              >
                Upload
              </AuthButton>
            )}
          </form>
          {photoState?.message && (
            <p className={`text-xs ${photoState.success ? "text-sage" : "text-rose"}`}>
              {photoState.message}
            </p>
          )}
          {sizeError && (
            <p className="text-xs text-rose">{sizeError}</p>
          )}
          <p className="text-xs text-ink/30">Max 3 MB · JPG and PNG</p>
        </div>
      </div>

      {/* Profile fields */}
      <form action={profileAction} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AuthInput
            label="Full Name"
            name="name"
            defaultValue={user?.name ?? ""}
            error={profileState?.errors?.name}
          />
          <AuthInput
            label="Email"
            name="email"
            type="email"
            defaultValue={user?.email ?? ""}
            disabled
            className="opacity-50 cursor-not-allowed"
          />
          <AuthInput
            label="Phone Number"
            name="phone"
            type="tel"
            defaultValue={user?.phone ?? ""}
            placeholder="10-digit mobile number"
            error={profileState?.errors?.phone}
          />
          <AuthInput
            label="Date of Birth"
            name="dob"
            type="date"
            defaultValue={user?.dob ?? ""}
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-2">
          <p className="text-xs tracking-[0.15em] uppercase text-ink/60">Gender</p>
          <div className="flex gap-6">
            {(["male", "female", "other"] as const).map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  defaultChecked={user?.gender === g}
                  className="accent-sage"
                />
                <span className="capitalize">{g}</span>
              </label>
            ))}
          </div>
        </div>

        {profileState?.message && (
          <p className={`text-sm px-4 py-3 rounded ${profileState.success ? "text-sage bg-sage/10" : "text-rose bg-rose/10"}`}>
            {profileState.message}
          </p>
        )}

        <div className="flex justify-end">
          <AuthButton loading={profilePending} className="!w-auto !px-8">
            Save Changes
          </AuthButton>
        </div>
      </form>
    </div>
  );
}
