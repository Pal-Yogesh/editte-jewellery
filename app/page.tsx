import { redirect } from "next/navigation";

export default function Home() {
  // The storefront currently opens on the vendor login.
  redirect("/vendor/login");
}
