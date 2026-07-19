"use client";
import { useState } from "react";

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Once your order is shipped, you will receive a tracking link via email. You can also check the 'My Orders' section in your dashboard for live status updates.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery. Items must be unused, in original packaging, and accompanied by the original invoice. Raise a ticket or email us at support@yashagrawal.dev.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 5–7 business days. Express delivery (2–3 days) is available in select cities at an additional charge.",
  },
  {
    q: "Are the products hallmarked?",
    a: "Yes, all gold jewellery is BIS hallmarked. Certificates are included with each purchase.",
  },
  {
    q: "Can I cancel my order?",
    a: "Orders can be cancelled before dispatch from the 'My Orders' section. Once dispatched, cancellations are not possible but you can initiate a return after delivery.",
  },
  {
    q: "How do I exchange a product?",
    a: "Raise a return/exchange ticket through the Support section. Our team will arrange a pickup and process the exchange within 5–7 business days.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes, all payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We do not store any card details on our servers.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col divide-y divide-ink/5 border border-ink/5 rounded-xl bg-white overflow-hidden">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left flex items-start justify-between gap-4 px-6 py-4 hover:bg-salt/50 transition-colors"
          >
            <span className="font-heading text-cacao text-sm">{faq.q}</span>
            <span className="text-ink/30 shrink-0 mt-0.5 text-base">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div className="px-6 pb-4">
              <p className="text-sm text-ink/60 leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
