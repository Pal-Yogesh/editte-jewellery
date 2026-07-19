import { getCurrentUser } from "@/lib/dal";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccount from "./DeleteAccount";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="font-heading text-cacao text-3xl">Account Settings</h1>

      {/* Profile Info */}
      <section className="bg-white rounded-xl border border-ink/5 p-6 md:p-8">
        <h2 className="font-heading text-cacao text-lg mb-6">Personal Information</h2>
        <ProfileForm user={user} />
      </section>

      {/* Change Password */}
      <section className="bg-white rounded-xl border border-ink/5 p-6 md:p-8">
        <h2 className="font-heading text-cacao text-lg mb-6">Change Password</h2>
        <ChangePasswordForm />
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-xl border border-rose/20 p-6 md:p-8">
        <h2 className="font-heading text-rose text-lg mb-2">Danger Zone</h2>
        <p className="text-ink/50 text-sm mb-6">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        <DeleteAccount />
      </section>
    </div>
  );
}
