import { getSession } from "@/lib/session";
import NewArrivalsScroller from "./NewArrivalsScroller";

export default async function NewArrivals() {
  const session = await getSession();
  const isLoggedIn = !!session?.uid;

  return (
    <section className="bg-salt py-14 px-20 relative overflow-hidden">
      <h2
        className="font-heading text-cacao uppercase text-center mb-9"
        style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
      >
        New Arrivals
      </h2>
      <NewArrivalsScroller isLoggedIn={isLoggedIn} />
    </section>
  );
}
