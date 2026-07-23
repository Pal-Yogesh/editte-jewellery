import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";
import { deletePath, uploadVendorFile } from "@/lib/vendor/storage";
import { MAX_VENDOR_DOCUMENTS, type VendorDocument } from "@/lib/vendor/types";

const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/png",
  "image/jpeg",
  "image/webp",
];
const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

/**
 * Accepts a file if its MIME type is allowed, OR (as a fallback) its extension
 * is allowed. Browsers sometimes report an empty or generic MIME type for
 * .doc/.docx/.pdf, so extension matching prevents valid files being rejected.
 */
function isAllowedDocument(file: File): boolean {
  if (ALLOWED_TYPES.includes(file.type)) return true;
  const name = (file.name || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

type KycTextBody = {
  gstNumber?: string;
  panNumber?: string;
};

type DeleteBody = {
  documentId?: string;
};

/** Update GST / PAN numbers. */
export async function PUT(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: KycTextBody;
  try {
    body = (await request.json()) as KycTextBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    "kyc.gstNumber": (body.gstNumber ?? vendor.kyc.gstNumber).trim().toUpperCase(),
    "kyc.panNumber": (body.panNumber ?? vendor.kyc.panNumber).trim().toUpperCase(),
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    { message: "KYC details updated.", vendor: updated ? await serializeVendor(updated) : null },
    { status: 200 }
  );
}

/** Upload a business/KYC document (max 10 total). */
export async function POST(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  if (vendor.kyc.documents.length >= MAX_VENDOR_DOCUMENTS) {
    return NextResponse.json(
      { message: `You can upload a maximum of ${MAX_VENDOR_DOCUMENTS} documents.` },
      { status: 400 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  const label = (form.get("name") as string | null)?.trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file provided." }, { status: 400 });
  }
  if (!isAllowedDocument(file)) {
    return NextResponse.json(
      { message: "Document must be a PDF, Word (.doc/.docx), PNG, JPEG, or WebP file." },
      { status: 400 }
    );
  }
  if (file.size > MAX_DOC_BYTES) {
    return NextResponse.json({ message: "Document must be 10 MB or smaller." }, { status: 400 });
  }

  const uploaded = await uploadVendorFile(vendor.vendorId, "documents", file);

  const document: VendorDocument = {
    id: randomUUID(),
    name: label || file.name || "Document",
    path: uploaded.path,
    contentType: uploaded.contentType,
    uploadedAt: new Date().toISOString(),
  };

  const documents = [...vendor.kyc.documents, document];

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    "kyc.documents": documents,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    { message: "Document uploaded.", vendor: updated ? await serializeVendor(updated) : null },
    { status: 201 }
  );
}

/** Remove a document by id. */
export async function DELETE(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: DeleteBody;
  try {
    body = (await request.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const documentId = body.documentId?.trim();
  if (!documentId) {
    return NextResponse.json({ message: "documentId is required." }, { status: 400 });
  }

  const target = vendor.kyc.documents.find((doc) => doc.id === documentId);
  if (!target) {
    return NextResponse.json({ message: "Document not found." }, { status: 404 });
  }

  await deletePath(target.path);
  const documents = vendor.kyc.documents.filter((doc) => doc.id !== documentId);

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    "kyc.documents": documents,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    { message: "Document removed.", vendor: updated ? await serializeVendor(updated) : null },
    { status: 200 }
  );
}
