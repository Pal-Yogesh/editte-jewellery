"use client";
import { useActionState } from "react";
import { deleteNewArrivalAction, toggleNewArrivalStatusAction } from "@/app/actions/adminContent";
import type { NewArrivalItem } from "@/lib/types";

function ItemRow({ item }: { item: NewArrivalItem }) {
  const [, deleteAction, deletePending] = useActionState(deleteNewArrivalAction, undefined);
  const [, toggleAction, togglePending] = useActionState(toggleNewArrivalStatusAction, undefined);
  const isPublished = item.status === "published";

  return (
    <div className="flex items-center gap-4 py-3 border-b border-ink/5 last:border-0">
      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border border-ink/10 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-heading text-cacao truncate">{item.name}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${isPublished ? "bg-sage/20 text-sage" : "bg-ink/10 text-ink/40"}`}>
            {isPublished ? "Live" : "Draft"}
          </span>
        </div>
        <p className="text-xs text-ink/40 mt-0.5">{item.category} · ₹{item.price.toLocaleString("en-IN")}</p>
      </div>

      <form action={toggleAction}>
        <input type="hidden" name="itemId" value={item.id} />
        <button type="submit" disabled={togglePending}
          className={`text-xs px-3 py-1.5 border transition-colors disabled:opacity-50 shrink-0 ${
            isPublished
              ? "border-ink/20 text-ink/50 hover:border-cacao hover:text-cacao"
              : "border-sage/40 text-sage hover:bg-sage hover:text-white"
          }`}>
          {togglePending ? "…" : isPublished ? "Unpublish" : "Publish"}
        </button>
      </form>

      <form action={deleteAction}>
        <input type="hidden" name="itemId" value={item.id} />
        <button type="submit" disabled={deletePending}
          className="text-xs text-rose border border-rose/30 px-3 py-1.5 hover:bg-rose hover:text-white transition-colors disabled:opacity-50 shrink-0">
          {deletePending ? "…" : "Remove"}
        </button>
      </form>
    </div>
  );
}

export default function NewArrivalsList({ items }: { items: NewArrivalItem[] }) {
  if (items.length === 0)
    return <p className="text-ink/40 text-sm text-center py-8">No products yet. Add one below.</p>;
  return <div className="flex flex-col">{items.map((i) => <ItemRow key={i.id} item={i} />)}</div>;
}
