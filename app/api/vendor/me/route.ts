import { NextResponse } from "next/server";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";

export async function GET() {
  const vendor = await getSessionVendor();

  if (!vendor) {
    return NextResponse.json(
      { authenticated: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      role: "vendor",
      vendor: await serializeVendor(vendor),
    },
    { status: 200 }
  );
}
