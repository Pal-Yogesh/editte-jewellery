"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
}

interface Props {
  subtotal: number;
  userName: string;
  userEmail: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutButton({ subtotal, userName, userEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    // Load Razorpay SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway. Please try again.");
      setLoading(false);
      return;
    }

    // Create Razorpay order on server
    const orderRes = await fetch("/api/checkout/create-order", { method: "POST" });
    if (!orderRes.ok) {
      const err = await orderRes.json();
      setError(err.error ?? "Could not initiate payment.");
      setLoading(false);
      return;
    }

    const { orderId, amount, currency } = await orderRes.json();

    // Open Razorpay modal
    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount,
      currency,
      name: "editte",
      description: "Fine Jewellery",
      order_id: orderId,
      prefill: { name: userName, email: userEmail },
      theme: { color: "#361515" },
      handler: async (response: RazorpayResponse) => {
        // Verify payment on server
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        if (verifyRes.ok) {
          const data = await verifyRes.json();
          router.push(`/dashboard/orders?success=1&invoice=${data.invoiceNumber}`);
        } else {
          setError("Payment verification failed. Contact support with your payment ID.");
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    });

    rzp.open();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-cacao text-white text-xs tracking-[0.2em] uppercase py-3 hover:bg-sage transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Processing…
          </>
        ) : (
          "Proceed to Checkout"
        )}
      </button>
      {error && (
        <p className="text-xs text-rose bg-rose/10 px-3 py-2 rounded leading-relaxed">{error}</p>
      )}
    </div>
  );
}
