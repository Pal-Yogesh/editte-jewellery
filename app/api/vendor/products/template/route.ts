import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSessionVendor } from "@/lib/vendor/session";
import { EXCEL_COLUMNS } from "@/lib/product/excel-schema";
import {
  DEPARTMENTS,
  allGroupLabels,
  allTypeLabels,
  placementLabels,
} from "@/lib/product/categories";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF361515" }, // Cacao
};
const REQUIRED_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF6E6E5" }, // light rose tint
};

export async function GET() {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "editte";
  wb.created = new Date();

  // ── Products sheet ────────────────────────────────────────────────────────
  const ws = wb.addWorksheet("Products", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = EXCEL_COLUMNS.map((col) => ({
    key: col.key,
    header: col.header,
    width: col.width,
  }));

  // Style header row
  const headerRow = ws.getRow(1);
  headerRow.height = 22;
  EXCEL_COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.font = { bold: true, color: { argb: "FFF9F5F1" }, size: 11 };
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFC87A79" } },
    };
  });

  // Column indices
  const priceIdx      = EXCEL_COLUMNS.findIndex((c) => c.key === "price");
  const discIdx       = EXCEL_COLUMNS.findIndex((c) => c.key === "discountPercent");
  const quantityIdx   = EXCEL_COLUMNS.findIndex((c) => c.key === "quantity");
  const minQtyIdx     = EXCEL_COLUMNS.findIndex((c) => c.key === "minQuantity");
  const weightIdx     = EXCEL_COLUMNS.findIndex((c) => c.key === "weightGrams");
  const deptIdx       = EXCEL_COLUMNS.findIndex((c) => c.key === "department");
  const groupIdx      = EXCEL_COLUMNS.findIndex((c) => c.key === "categoryGroup");
  const typeIdx       = EXCEL_COLUMNS.findIndex((c) => c.key === "productType");
  const placementIdx  = EXCEL_COLUMNS.findIndex((c) => c.key === "placements");

  // Tint required-field columns + number formatting (discount is a plain number, e.g. 15 — not a percentage)
  const requiredIndices = EXCEL_COLUMNS
    .map((c, i) => (c.required ? i : -1))
    .filter((i) => i >= 0);

  for (let row = 2; row <= 200; row++) {
    requiredIndices.forEach((ci) => {
      ws.getRow(row).getCell(ci + 1).fill = REQUIRED_FILL;
    });
    ws.getRow(row).getCell(priceIdx + 1).numFmt    = "₹#,##0.00";
    ws.getRow(row).getCell(discIdx + 1).numFmt     = "0.00";
    ws.getRow(row).getCell(quantityIdx + 1).numFmt = "0";
    ws.getRow(row).getCell(minQtyIdx + 1).numFmt = "0";
    ws.getRow(row).getCell(weightIdx + 1).numFmt   = "0.00";
  }

  // ── Category dropdowns ────────────────────────────────────────────────────
  // The option lists live on a hidden sheet: inline `formulae` lists are capped
  // at 255 characters and the product-type list is longer than that.
  const lists = wb.addWorksheet("Lists");
  lists.state = "veryHidden";

  const deptLabels  = DEPARTMENTS.map((d) => d.label);
  const groupLabels = allGroupLabels();
  const typeLabels  = allTypeLabels();

  deptLabels.forEach((v, i)  => { lists.getCell(i + 1, 1).value = v; });
  groupLabels.forEach((v, i) => { lists.getCell(i + 1, 2).value = v; });
  typeLabels.forEach((v, i)  => { lists.getCell(i + 1, 3).value = v; });

  const dropdowns: { idx: number; ref: string; prompt: string }[] = [
    { idx: deptIdx,  ref: `Lists!$A$1:$A$${deptLabels.length}`,  prompt: "Pick a category" },
    { idx: groupIdx, ref: `Lists!$B$1:$B$${groupLabels.length}`, prompt: "Pick a sub-category that belongs to the category" },
    { idx: typeIdx,  ref: `Lists!$C$1:$C$${typeLabels.length}`,  prompt: "Pick a product type that belongs to the sub-category" },
  ];

  // Collections take several values in one cell ("New In, Sale"), so a list
  // validation would reject them. Prompt with the options instead of enforcing.
  for (let row = 2; row <= 200; row++) {
    ws.getRow(row).getCell(placementIdx + 1).dataValidation = {
      // A length check that nothing can fail — it exists only to carry the
      // prompt, since ExcelJS has no "no rule, prompt only" validation type.
      type: "textLength",
      operator: "greaterThanOrEqual",
      formulae: [0],
      allowBlank: true,
      showErrorMessage: false,
      showInputMessage: true,
      promptTitle: "Collections (optional)",
      prompt: `Comma-separated. Options: ${placementLabels()}. An admin decides which requests go live.`,
    };
  }

  for (let row = 2; row <= 200; row++) {
    for (const { idx, ref, prompt } of dropdowns) {
      ws.getRow(row).getCell(idx + 1).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [ref],
        showErrorMessage: true,
        errorStyle: "error",
        errorTitle: "Invalid value",
        error: "Choose one of the listed options.",
        showInputMessage: true,
        promptTitle: "editte",
        prompt,
      };
    }
  }

  // ── Serialize ─────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="editte-products-template.xlsx"',
    },
  });
}
