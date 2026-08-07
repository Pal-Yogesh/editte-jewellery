# editte — Theme Export

A portable, drop-in theme for **Tailwind v4 + Next.js (App Router)**. Copy the
`theme-export/` folder into your new project and follow the steps below.

## What's inside

| File | Purpose |
| ---- | ------- |
| `theme.css` | The full theme: brand colours, `@theme` tokens, base styles, scrollbar + marquee helpers. |
| `layout-font.tsx` | Reference `app/layout.tsx` wiring up the single typeface (Sorts Mill Goudy) as `--font-goudy`. |
| `DESIGN_SYSTEM.md` | The brand reference — colour roles, usage ratios, buttons, typography, UI element states. |

## Requirements

- Next.js with the App Router
- Tailwind **v4** (this theme uses the CSS-first `@import "tailwindcss"` + `@theme` API, **not** a `tailwind.config.js`)
- PostCSS with `@tailwindcss/postcss`

Install (if starting fresh):

```bash
npm install tailwindcss @tailwindcss/postcss
```

`postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## Setup

1. **Styles** — copy the contents of `theme.css` into your `app/globals.css`
   (it already includes `@import "tailwindcss";`).

2. **Font** — merge the font setup from `layout-font.tsx` into your
   `app/layout.tsx`. The key parts are the `Sorts_Mill_Goudy` import,
   the `variable: "--font-goudy"` option, and adding `goudy.variable`
   to the `<html>` className.

3. **Use it** — Tailwind utilities are now available:

   ```tsx
   <section className="bg-salt text-ink">
     <h1 className="font-heading text-cacao">Fine Jewellery</h1>
     <button className="bg-rose text-salt hover:bg-cacao">Shop now</button>
     <div className="bg-sand">Accent surface</div>
   </section>
   ```

## Palette quick reference

| Token | Hex | Utility examples |
| ----- | --- | ---------------- |
| `salt` | `#F9F5F1` | `bg-salt`, base canvas |
| `cacao` | `#361515` | `text-cacao`, headings |
| `rose` | `#C87A79` | `bg-rose`, primary action |
| `sage` | `#B3AD6E` | `bg-sage`, UI accents |
| `sand` | `#EDE2C3` | `bg-sand`, secondary surfaces |
| `ink` | `#0C0E0E` | `text-ink`, body copy |
| `gold` | gradient | use `var(--gold)` for metallic headings on dark bg |

> `gold` is a gradient (`--gold`), so it has no flat colour utility. Apply it via
> `background: var(--gold)` (e.g. as a `background-clip: text` gradient for headings).

See `DESIGN_SYSTEM.md` for full usage rules, button/input states, and colour proportions.
