import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/firebase-admin";

const ADMIN_COLLECTION = "admin_credentials";
const SALT_ROUNDS = 12;

type CredentialsBody = {
  adminId?: string;
  password?: string;
  email?: string;
};

export async function POST(request: Request) {
  let body: CredentialsBody;

  try {
    body = (await request.json()) as CredentialsBody;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const adminId = body.adminId?.trim();
  const password = body.password;
  const email = body.email?.trim();

  if (!adminId || !password || !email) {
    return NextResponse.json(
      { message: "adminId, password, and email are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { message: "Invalid email address." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await db.collection(ADMIN_COLLECTION).doc(adminId).set({
    passwordHash,
    email,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    { message: "Admin credentials saved successfully.", adminId },
    { status: 201 }
  );
}
