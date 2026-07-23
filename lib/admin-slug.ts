/**
 * The admin panel lives under a secret, configurable URL slug so it can't be
 * discovered at predictable paths like /admin or /admin/login.
 *
 * Set ADMIN_ACCESS_KEY in your environment to a hard-to-guess value, e.g.
 *   ADMIN_ACCESS_KEY=ops-7f3a9k2m
 * The admin login then lives at /ops-7f3a9k2m/login (and /ops-7f3a9k2m/dashboard).
 *
 * Any other slug 404s, so vendors/users can't reach the admin area.
 */
export function getAdminSlug(): string {
  return process.env.ADMIN_ACCESS_KEY?.trim() || "control-center";
}
