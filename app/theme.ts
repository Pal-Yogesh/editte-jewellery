/**
 * Centralised UI theme.
 *
 * Colours live as CSS variables in app/globals.css.
 * This file composes those semantic colour utilities into reusable
 * component class strings. To restyle a component everywhere, edit it here.
 *
 * Design language (mirrors the editte storefront):
 *   · One typeface — Sorts Mill Goudy — across the whole UI.
 *   · Uppercase, wide-tracked micro-copy for labels, buttons and nav.
 *   · Underlined inputs rather than boxed fields.
 *   · Soft hairline borders (ink/8) on white cards over a Salt canvas.
 *   · Cacao carries structure; Sage is the hover lift; Rose/Ruby signal errors.
 */

// ── Layout ──────────────────────────────────────────────────────────
export const page = "min-h-screen bg-background text-foreground";
export const pageCentered =
  "flex min-h-screen items-center justify-center bg-background px-6 py-12";
export const card = "rounded-xl border border-border bg-surface p-8";
export const panel = "rounded-xl border border-border bg-surface p-6";

// ── Auth screens ────────────────────────────────────────────────────
/** Dark Cacao canvas used for the admin portal sign-in. */
export const authPageDark =
  "flex min-h-screen items-center justify-center bg-cacao px-5 py-12";
/** Salt canvas used for vendor-facing sign-in / sign-up. */
export const authPageLight = pageCentered;
/** The wordmark above an auth card. */
export const authWordmark =
  "font-heading text-3xl uppercase tracking-[0.3em]";
export const authWordmarkSub =
  "mt-2 text-[10px] uppercase tracking-[0.25em]";
/** Card sitting on the dark canvas. */
export const authCardDark = "rounded-xl bg-salt p-8";
/** Fine print below an auth card. */
export const authFootnote = "mt-8 text-center text-[10px] tracking-[0.15em]";

// ── Typography ──────────────────────────────────────────────────────
export const heading = "font-heading text-2xl text-heading";
export const subheading = "font-heading text-xl text-heading";
/** Uppercase, wide-tracked eyebrow above a heading. */
export const eyebrow = "text-xs uppercase tracking-[0.25em] text-muted";
export const muted = "text-sm text-muted";
/**
 * Field label. Cacao-toned and tracked so it reads as a *label* rather than
 * blending into the value beneath it — the whole UI is one serif, so contrast
 * and letter-spacing carry the distinction that a second typeface normally would.
 */
export const label =
  "mb-2 block text-[11px] uppercase tracking-[0.16em] text-cacao/75";

// ── Form fields ─────────────────────────────────────────────────────
/**
 * Boxed field. The storefront uses underlined inputs, which suit a two-field
 * login but leave a long data-entry form looking like unbroken prose: the
 * label and the typed value run together. Product/vendor forms therefore use a
 * bordered, tinted box so every field has an obvious beginning and end.
 */
export const input =
  "w-full rounded-lg border border-input bg-field px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-ring focus:ring-2 focus:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-50";
export const textarea = `${input} min-h-24 leading-relaxed`;
export const otpInput = `${input} text-center text-lg tracking-[0.4em]`;
/** Native select, matching the boxed inputs. */
export const select = `${input} cursor-pointer pr-9`;

/** Error variants — rose border over a faint rose wash. */
export const inputInvalid =
  "w-full rounded-lg border border-error-fg bg-error-bg px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-error-fg focus:ring-2 focus:ring-error-fg/15";
export const selectInvalid = `${inputInvalid} cursor-pointer pr-9`;
/** Helper line under a field. */
export const fieldHint = "mt-1.5 text-xs text-muted";
export const fieldError = "mt-1.5 text-xs text-error-fg";
/** Group divider inside a long form. */
export const sectionLabel =
  "text-[10px] uppercase tracking-[0.25em] text-cacao/60";

// ── Buttons ─────────────────────────────────────────────────────────
const buttonBase =
  "inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonPrimary = `${buttonBase} bg-primary text-primary-foreground hover:bg-primary-hover`;
export const buttonPrimaryBlock = `w-full ${buttonPrimary}`;
export const buttonOutline = `${buttonBase} border border-heading text-heading hover:bg-heading hover:text-primary-foreground`;
export const buttonDanger = `${buttonBase} bg-danger text-white hover:bg-danger-hover`;

/** Small inline action buttons (e.g. approve / reject rows). */
const buttonSmallBase =
  "inline-flex items-center justify-center px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50";
export const buttonApprove = `${buttonSmallBase} bg-success-solid text-white hover:bg-success-solid-hover`;
export const buttonReject = `${buttonSmallBase} bg-danger text-white hover:bg-danger-hover`;
/** Compact secondary control — refresh, quantity steppers, inline toggles. */
export const buttonQuiet = `${buttonSmallBase} border border-border text-muted hover:border-heading hover:text-heading`;

/** Filter chips / tab pills. */
export const buttonChipActive = "bg-primary text-primary-foreground";
export const buttonChipInactive =
  "border border-border text-muted hover:border-heading hover:text-heading";
export const chipBase =
  "px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors duration-300";

export const linkMuted =
  "text-muted underline-offset-4 transition-colors hover:text-heading hover:underline";
export const linkStrong =
  "text-heading underline-offset-4 transition-colors hover:text-primary-hover hover:underline";

// ── Sidebar / shell ─────────────────────────────────────────────────
/* The dark Cacao shell itself lives in app/components/dashboard-shell.tsx;
   these are the pieces rendered inside it. */
export const sidebarMeta =
  "mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-white/40";
const sidebarItemBase =
  "w-full rounded-lg px-4 py-2.5 text-left text-sm tracking-wide transition-colors duration-200";
export const sidebarItemActive = `${sidebarItemBase} bg-white/10 text-white`;
export const sidebarItemIdle = `${sidebarItemBase} text-white/50 hover:bg-white/5 hover:text-white`;
/** Ghost button sitting on the dark sidebar. */
export const sidebarButton =
  "w-full px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:text-white disabled:opacity-40";

// ── Tables ──────────────────────────────────────────────────────────
export const tableHeadCell =
  "px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-muted";
export const tableRow = "border-b border-border last:border-0";
export const tableCell = "px-4 py-3 text-sm";

// ── Status banners ──────────────────────────────────────────────────
export const bannerBase = "rounded-lg px-4 py-3 text-sm";
export const bannerError = `${bannerBase} bg-error-bg text-error-fg`;
export const bannerSuccess = `${bannerBase} bg-success-bg text-success-fg`;
export const bannerWarning = `${bannerBase} bg-warning-bg text-warning-fg`;

/** Returns the appropriate banner class for a success/error state. */
export function banner(isError: boolean): string {
  return isError ? bannerError : bannerSuccess;
}

// ── Status badges (vendor / product approval states) ────────────────
export const statusBadge = {
  base: "rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em]",
  incomplete: "bg-surface-hover text-muted",
  pending: "bg-warning-bg text-warning-fg",
  under_review: "bg-warning-bg text-warning-fg",
  approved: "bg-success-bg text-success-fg",
  rejected: "bg-error-bg text-error-fg",
} as const;

export const statusBanner = {
  incomplete: `${bannerBase} bg-surface-hover text-muted`,
  pending: `${bannerBase} bg-warning-bg text-warning-fg`,
  under_review: `${bannerBase} bg-warning-bg text-warning-fg`,
  approved: `${bannerBase} bg-success-bg text-success-fg`,
  rejected: `${bannerBase} bg-error-bg text-error-fg`,
} as const;
