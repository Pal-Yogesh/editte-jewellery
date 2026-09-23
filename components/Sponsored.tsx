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

export default function SponsoredProduct({ slides: propSlides }: { slides?: SponsoredSlide[] }) {
  const slides = propSlides ?? [];
  if (slides.length === 0) return null;

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
              <p className="slider-title" style={{
                color:"#F9EEDA"
              }}>{s.title}</p>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="sponsored-bottom" />
    </section>
  );
}
