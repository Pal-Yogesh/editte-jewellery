"use client";
import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "./sponsored.css";
import type { SponsoredSlide } from "@/lib/types";

const FALLBACK_SLIDES: SponsoredSlide[] = [
  { id: "s1", title: "Bridal",        image: "/images-2/Thebridal.jpg", order: 0, status: "published" },
  { id: "s2", title: "Showstopper",   image: "/images-2/Workday.jpg",   order: 1, status: "published" },
  { id: "s3", title: "Everyday",      image: "/images-2/Daily.jpg",     order: 2, status: "published" },
  { id: "s4", title: "Vacation",      image: "/images-2/Vacation.jpg",  order: 3, status: "published" },
  { id: "s5", title: "Festive Find",  image: "/banner3/Festive-Finds.png", order: 4, status: "published" },
  { id: "s6", title: "Men Essential", image: "/images-2/Men.jpg",       order: 5, status: "published" },
  { id: "s7", title: "Gift",          image: "/images-2/gift.jpg",      order: 6, status: "published" },
];

export default function SponsoredProduct({ slides: propSlides }: { slides?: SponsoredSlide[] }) {
  const slides = propSlides?.length ? propSlides : FALLBACK_SLIDES;
  const [bgSwiper, setBgSwiper] = useState<SwiperType | null>(null);
  const [titlesSwiper, setTitlesSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    if (!titlesSwiper || !bgSwiper) return;
    const handleChange = () => bgSwiper.slideTo(titlesSwiper.realIndex);
    titlesSwiper.on("slideChange", handleChange);
    return () => { titlesSwiper.off("slideChange", handleChange); };
  }, [bgSwiper, titlesSwiper]);

  return (
    <section className="sponsored-slider">
      <div className="sponsored-bg">
        <Swiper modules={[EffectFade]} effect="fade" slidesPerView={1} speed={600} allowTouchMove={false} onSwiper={setBgSwiper}>
          {slides.map((s, i) => (
            <SwiperSlide key={`bg-${i}`}>
              <img src={s.image} alt={s.title} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="sponsored-titles">
        <Swiper
          modules={[Navigation, Autoplay]}
          slidesPerView="auto"
          speed={600}
          slideToClickedSlide
          centeredSlides
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          onSwiper={setTitlesSwiper}
          onSlideChange={(s) => bgSwiper?.slideTo(s.realIndex)}
        >
          {slides.map((s, i) => (
            <SwiperSlide key={`title-${i}`}>
              <p className="slider-title">{s.title}</p>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="sponsored-bottom" />
    </section>
  );
}
