import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSessionVendor } from "@/lib/vendor/session";
import { EXCEL_COLUMNS } from "@/lib/product/excel-schema";

export type ParsedRow = {
  rowNumber: number;
  title: string;
  description: string;
  price: number;
  discountPercent: number;
  metal: string;
  colors: string[];
  size: string;
  category: string;
  brandName: string;
  quantity: number;
  minQuantity: number;
  sku: string;
};

export type ParseError = {
  row: number;
  message: string;
};

export type ParseResult = {
  rows: ParsedRow[];
  errors: ParseError[];
  total: number;
};

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object" && "result" in v) return cellText({ ...cell, value: v.result } as ExcelJS.Cell);
  if (typeof v === "object" && "text" in v) return String(v.text).trim();
  if (typeof v === "object" && "richText" in v)
    return v.richText.map((rt: { text: string }) => rt.text).join("").trim();
  return String(v).trim();
}

function cellNumber(cell: ExcelJS.Cell): number | null {
  const v = cell.value;
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  if (typeof v === "object" && "result" in v) return cellNumber({ ...cell, value: v.result } as ExcelJS.Cell);
  const n = Number(String(v).replace(/[₹,%]/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No Excel file provided." }, { status: 400 });
  }
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    return NextResponse.json(
      { message: "File must be an Excel file (.xlsx or .xls)." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(arrayBuffer as any);
  } catch {
    return NextResponse.json(
      { message: "Could not read the Excel file. Make sure it is a valid .xlsx file." },
      { status: 400 }
    );
  }

  const ws = wb.getWorksheet("Products") ?? wb.worksheets[0];
  if (!ws) {
    return NextResponse.json(
      { message: "No worksheet found. Use the editte template." },
      { status: 400 }
    );
  }

  // Map header names → column index from the actual file
  const headerRow = ws.getRow(1);
  const colMap: Record<string, number> = {};
  headerRow.eachCell((cell, colNumber) => {
    const text = cellText(cell).replace(" *", "").replace("₹", "").trim();
    const match = EXCEL_COLUMNS.find(
      (c) => c.header.replace(" *", "").replace("₹", "").trim().toLowerCase() === text.toLowerCase()
    );
    if (match) colMap[match.key] = colNumber;
  });

  const missingRequired = EXCEL_COLUMNS.filter(
    (c) => c.required && !colMap[c.key]
  ).map((c) => c.header);
  if (missingRequired.length) {
    return NextResponse.json(
      {
        message: `Missing required columns: ${missingRequired.join(", ")}. Use the editte template.`,
      },
      { status: 400 }
    );
  }

  const rows: ParsedRow[] = [];
  const errors: ParseError[] = [];
  const seenSkus = new Set<string>();

  ws.eachRow((excelRow, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const get = (key: string): ExcelJS.Cell => {
      const col = colMap[key];
      if (!col) return { value: null } as ExcelJS.Cell;
      return excelRow.getCell(col);
    };

    const title           = cellText(get("title"));
    const description     = cellText(get("description"));
    const price           = cellNumber(get("price"));
    const rawDiscount     = cellNumber(get("discountPercent"));
    const metal           = cellText(get("metal"));
    const colorsRaw       = cellText(get("colors"));
    const size            = cellText(get("size"));
    const category        = cellText(get("category"));
    const brandName       = cellText(get("brandName")) || vendor.profile.brandName;
    const quantity        = cellNumber(get("quantity"));
    const minQuantity     = cellNumber(get("minQuantity"));
    const sku             = cellText(get("sku"));

    // Skip completely empty rows
    if (!title && !sku && price === null) return;

    const rowErrors: string[] = [];

    if (!title) rowErrors.push("Missing Product Title");
    if (price === null || price <= 0) rowErrors.push("Missing or invalid Price");
    if (!sku) rowErrors.push("Missing SKU");
    if (sku && seenSkus.has(sku.toLowerCase())) rowErrors.push(`Duplicate SKU "${sku}" in this batch`);

    if (rowErrors.length) {
      errors.push({ row: rowNumber, message: rowErrors.join(" · ") });
      return;
    }

    seenSkus.add(sku.toLowerCase());

    const discountPercent = rawDiscount !== null ? Math.min(Math.max(rawDiscount, 0), 100) : 0;
    const colors = colorsRaw
      ? colorsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    rows.push({
      rowNumber,
      title,
      description,
      price: price!,
      discountPercent,
      metal,
      colors,
      size,
      category,
      brandName,
      quantity: quantity ?? 0,
      minQuantity: minQuantity ?? 0,
      sku,
    });
  });

  if (rows.length === 0 && errors.length === 0) {
    return NextResponse.json(
      { message: "The Products sheet appears to be empty. Add product rows below the header." },
      { status: 400 }
    );
  }

  const result: ParseResult = { rows, errors, total: rows.length + errors.length };
  return NextResponse.json(result, { status: 200 });
}
