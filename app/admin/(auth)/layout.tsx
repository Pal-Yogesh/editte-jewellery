// Auth pages (login, 2FA) — no sidebar, no topbar
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
