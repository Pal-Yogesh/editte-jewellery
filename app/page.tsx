import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryIcons from "@/components/CategoryIcons";
import CategoryCards from "@/components/CategoryCards";
import DiamondBanner from "@/components/DiamondBanner";
import NewArrivals from "@/components/NewArrivals";
import StorySection from "@/components/StorySection";
import TrustBadges from "@/components/TrustBadges";
import Designers from "@/components/Designers";
import Footer from "@/components/Footer";
import BrandBanner from "@/components/BrandBanner";
import CuratedCollection from "@/components/CuratedCollection";
import DiscoverSection from "@/components/DiscoverSection";

export default function Home() {
  return (
    <>
      <div className="relative  ">
        <Navbar />
        <Hero />
      </div>
      <main className="relative">
        {/* Group 1 — scrolls up to reveal the pinned banner */}
        <div className="relative z-10 bg-salt">
          <CategoryIcons />
          <CategoryCards />
        </div>

        {/* Pinned reveal banner — stays fixed behind everything.
            -mt pulls its pinned slot up behind Group 1's bottom, so Group 1
            slides UP over it (revealing it), it stays fixed, then Group 2
            slides up over it from below. Content crosses it from both sides. */}
        <div className="relative h-[300vh] -z-10 -mt-[100vh]">
          <div className="sticky top-0 h-screen overflow-hidden">
            <DiamondBanner />
          </div>
        </div>

        {/* Group 2 — pulled up to slide over the pinned banner from below */}
        <div className="relative z-10 bg-salt -mt-[100vh]">
          <NewArrivals />
          <BrandBanner />
          <StorySection />
          <TrustBadges />
          <Designers />
          <DiscoverSection />
          {/* <CuratedCollection /> */}
        </div>
      </main>
      <Footer />
    </>
  );
}
