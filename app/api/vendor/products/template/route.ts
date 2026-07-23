import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSessionVendor } from "@/lib/vendor/session";
import { EXCEL_COLUMNS } from "@/lib/product/excel-schema";

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
