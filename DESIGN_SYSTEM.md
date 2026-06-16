# editta — Web Design System

> Brand design reference for the **editta** jewellery UI. These tokens and rules are taken directly from the official Web Colour Guide and must be used **as-is** across all interfaces.

---

## 1. Colours

| Name  | Hex        | Swatch role                                      |
| ----- | ---------- | ------------------------------------------------ |
| Salt  | `#F9F5F1`  | Neutral off-white base                           |
| Cacao | `#361515`  | Deep brown, headings & lifestyle                 |
| Rose  | `#C87A79`  | Dusty rose accent, buttons                       |
| Sage  | `#B3AD6E`  | Muted olive/green, UI elements                   |
| Sand  | `#EDE2C3`  | Warm cream, accent backgrounds                   |
| Gold  | gradient*  | Metallic gold, headings on dark backgrounds      |
| Ink   | `#0C0E0E`  | Near-black, body copy                            |

\*Gold is a metallic gradient (no flat hex in the guide). Suggested approximation: `linear-gradient(135deg, #C9A24B 0%, #E8CE8F 50%, #B8862F 100%)`.

### CSS Custom Properties

```css
:root {
  --color-salt:  #F9F5F1;
  --color-cacao: #361515;
  --color-rose:  #C87A79;
  --color-sage:  #B3AD6E;
  --color-sand:  #EDE2C3;
  --color-ink:   #0C0E0E;
  --gradient-gold: linear-gradient(135deg, #C9A24B 0%, #E8CE8F 50%, #B8862F 100%);
}
```

### Tailwind theme tokens

```js
// tailwind.config — colors
colors: {
  salt:  "#F9F5F1",
  cacao: "#361515",
  rose:  "#C87A79",
  sage:  "#B3AD6E",
  sand:  "#EDE2C3",
  ink:   "#0C0E0E",
}
```

---

## 2. Colour Usage

> A neutral base with refined accents. Use this hierarchy to maintain consistency across all interfaces.

| Colour | Proportion | Where to use                                   |
| ------ | ---------- | ---------------------------------------------- |
| Salt   | **45%**    | Mostly background                              |
| Cacao  | **25%**    | Part of lifestyle images and headings          |
| Sand   | **15%**    | Accent backgrounds                             |
| Rose   | **8%**     | Part of lifestyle images and buttons           |
| Sage   | **5%**     | Part of lifestyle images and UI elements       |
| Gold   | **2%**     | Headings on darker backgrounds                 |
| Ink    | —          | Can be used for body copy                      |

**Rule of thumb:** Salt dominates as the canvas, Cacao anchors structure/headings, Sand softens secondary surfaces, and Rose/Sage/Gold are sparing accents only.

---

## 3. Buttons

### Primary Button

| State    | Background        | Text        |
| -------- | ----------------- | ----------- |
| Default  | Rose `#C87A79`    | Salt/white  |
| Hover    | Cacao `#361515`   | Salt/white  |
| Pressed  | Cacao (darker)    | Salt/white  |
| Disabled | Light grey        | Muted grey  |

### Secondary Button

| State    | Background        | Text        |
| -------- | ----------------- | ----------- |
| Default  | Rose `#C87A79`    | Salt/white  |
| Hover    | Sand `#EDE2C3`    | Cacao/Ink   |
| Pressed  | Sand / Gold tone  | Cacao/Ink   |
| Disabled | Light grey        | Muted grey  |

### Text Link

| State    | Style                                  |
| -------- | -------------------------------------- |
| Default  | Rose `#C87A79`, no underline           |
| Hover    | Rose `#C87A79`, **underlined**         |
| Disabled | Muted grey, no underline               |

---

## 4. Typography

| Style Name    | Typeface         | Usage                |
| ------------- | ---------------- | -------------------- |
| Heading Large | Goudy Old Style  | Headings, Hero titles |
| Heading Small | Goudy Old Style  | Section Titles       |
| Body Text     | Open Sans        | Body Copy            |
| Button Text   | Open Sans        | Buttons              |

- **Display / Headings:** `"Goudy Old Style", Goudy, "Times New Roman", serif`
- **Body / UI:** `"Open Sans", system-ui, sans-serif`

```css
--font-heading: "Goudy Old Style", Goudy, "Times New Roman", serif;
--font-body: "Open Sans", system-ui, -apple-system, sans-serif;
```

> Headings always use Goudy Old Style (serif). Body copy, buttons, and all UI text use Open Sans.

---

## 5. UI Elements

### Inputs

| State    | Border             | Notes                                      |
| -------- | ------------------ | ------------------------------------------ |
| Default  | Light grey         | Placeholder text "Input Text" in grey      |
| Focused  | Ink `#0C0E0E`      | Solid dark border on focus                 |
| Error    | Rose `#C87A79`     | Helper message "This Field is required" in rose |

### Checkbox

| State      | Appearance                            |
| ---------- | ------------------------------------- |
| Selected   | Rose `#C87A79` fill with white check  |
| Unselected | White fill, grey/Ink border           |

### Radio Button

| State      | Appearance                            |
| ---------- | ------------------------------------- |
| Selected   | Sage `#B3AD6E` filled inner dot       |
| Unselected | Empty circle, grey/Ink border         |

---

## 6. Quick Reference Summary

- **Base canvas:** Salt `#F9F5F1`
- **Headings:** Cacao `#361515` (or Gold on dark backgrounds) in Goudy Old Style
- **Body copy:** Ink `#0C0E0E` in Open Sans
- **Primary action colour:** Rose `#C87A79`
- **Accent surfaces:** Sand `#EDE2C3`
- **Form/selection accents:** Rose (checkbox), Sage (radio)
- **Error state:** Rose border + rose helper text
- **Focus state:** Ink border

Keep accent colours sparing — the design leans on a neutral, refined palette where Salt and Cacao carry most of the weight.
