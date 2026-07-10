/**
 * Centralised UI theme.
 *
 * Colors live as CSS variables in app/globals.css (light + dark).
 * This file composes those semantic color utilities into reusable
 * component class strings. To restyle a component everywhere, edit it here.
 */

// Layout
export const page = "min-h-screen bg-background text-foreground";
export const pageCentered =
  "flex min-h-screen items-center justify-center bg-background px-6 py-12";
export const card =
  "rounded-2xl border border-border bg-surface p-8 shadow-sm";
export const panel =
  "rounded-2xl border border-border bg-surface p-6 shadow-sm";

// Typography
export const heading = "text-2xl font-semibold tracking-tight text-foreground";
export const subheading = "text-lg font-semibold text-foreground";
export const muted = "text-sm text-muted";
export const label = "mb-1 block text-sm font-medium text-foreground";

// Form fields
export const input =
  "w-full rounded-md border border-input bg-field px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring";
export const textarea = `${input} min-h-24`;
export const otpInput = `${input} text-center text-lg font-semibold tracking-widest`;

// Buttons
export const buttonPrimary =
  "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";
export const buttonPrimaryBlock = `w-full ${buttonPrimary}`;
export const buttonOutline =
  "inline-flex items-center justify-center rounded-md border border-input bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60";
export const buttonDanger =
  "inline-flex items-center justify-center rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition hover:bg-danger-hover disabled:cursor-not-allowed disabled:opacity-60";

// Small inline action buttons (e.g. approve / reject rows)
export const buttonApprove =
  "inline-flex items-center justify-center rounded-md bg-success-solid px-3 py-1.5 text-xs font-medium text-white transition hover:bg-success-solid-hover disabled:opacity-60";
export const buttonReject =
  "inline-flex items-center justify-center rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white transition hover:bg-danger-hover disabled:opacity-60";
export const buttonChipActive =
  "bg-primary text-primary-foreground";
export const buttonChipInactive =
  "border border-input text-muted hover:bg-surface-hover";
export const linkMuted =
  "text-muted underline transition hover:text-foreground";
export const linkStrong = "font-medium text-foreground underline";

// Status banners
export const bannerBase = "rounded-md px-3 py-2 text-sm";
export const bannerError = `${bannerBase} bg-error-bg text-error-fg`;
export const bannerSuccess = `${bannerBase} bg-success-bg text-success-fg`;
export const bannerWarning = `${bannerBase} bg-warning-bg text-warning-fg`;

/** Returns the appropriate banner class for a success/error state. */
export function banner(isError: boolean): string {
  return isError ? bannerError : bannerSuccess;
}

// Status badges (vendor approval states)
export const statusBadge = {
  base: "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
  incomplete: "bg-surface-hover text-muted",
  pending: "bg-warning-bg text-warning-fg",
  approved: "bg-success-bg text-success-fg",
  rejected: "bg-error-bg text-error-fg",
} as const;

export const statusBanner = {
  incomplete: `${bannerBase} bg-surface-hover text-muted`,
  pending: `${bannerBase} bg-warning-bg text-warning-fg`,
  approved: `${bannerBase} bg-success-bg text-success-fg`,
  rejected: `${bannerBase} bg-error-bg text-error-fg`,
} as const;
