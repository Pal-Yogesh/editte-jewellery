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
import CuratedColection from "@/components/CuratedCollection";

export default function Home() {
  return (
    <>
      <div className="relative">
        <Navbar />
        <Hero />
      </div>
      <main>
        <CategoryIcons />
        <CategoryCards />
        <DiamondBanner />
        <NewArrivals />
        <StorySection />
        <TrustBadges />
        <CuratedColection />
        <Designers />
      </main>
      <Footer />
    </>
  );
}
