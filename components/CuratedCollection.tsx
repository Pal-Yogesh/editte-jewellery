"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectFade,
  Controller,
  Navigation,
  Autoplay,
} from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "./CuratedCollection.css";

// ─── Slide data ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    title: "Haldi Jewellery",
    image: "https://i.pinimg.com/1200x/5e/95/cb/5e95cbf6c0c65e6e26860a11ac6f71f2.jpg",
    thumb: "https://i.pinimg.com/1200x/5e/95/cb/5e95cbf6c0c65e6e26860a11ac6f71f2.jpg",
  },
  {
    title: "Ceromony Jewellery",
    image: "https://i.pinimg.com/736x/c3/ec/c1/c3ecc13eebe1d3cec5ba135e64809eb3.jpg",
    thumb: "https://i.pinimg.com/736x/c3/ec/c1/c3ecc13eebe1d3cec5ba135e64809eb3.jpg",
  },
  {
    title: "Wedding Jewellery",
    image: "https://i.pinimg.com/1200x/a7/10/9b/a7109b9b8470345f0655c1e9dcddb462.jpg",
    thumb: "https://i.pinimg.com/1200x/a7/10/9b/a7109b9b8470345f0655c1e9dcddb462.jpg",
  },
  {
    title: "Party Jewellery",
    image: "https://i.pinimg.com/1200x/18/02/6f/18026fc55d58b1d411775ba178343d10.jpg",
    thumb: "https://i.pinimg.com/1200x/18/02/6f/18026fc55d58b1d411775ba178343d10.jpg",
  },
  {
    title: "Fashioned Jewellery",
    image: "https://i.pinimg.com/1200x/08/a4/13/08a413802e631f9da67ca43c94a7eeb2.jpg",
    thumb: "https://i.pinimg.com/1200x/08/a4/13/08a413802e631f9da67ca43c94a7eeb2.jpg",
  },

];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

// ArrowSvg removed — using shared NavArrow component

export default function SponsoredProduct() {
  const [bgSwiper, setBgSwiper] = useState<SwiperType | null>(null);
  const [titlesSwiper, setTitlesSwiper] = useState<SwiperType | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Sync all three swipers via Controller once they're all mounted
  useEffect(() => {
    if (!bgSwiper || !titlesSwiper || !thumbsSwiper) return;
    // titles drives bg + thumbs
    titlesSwiper.controller.control = [bgSwiper, thumbsSwiper];
    // bg and thumbs don't drive anything back (one-way sync)
  }, [bgSwiper, titlesSwiper, thumbsSwiper]);

  return (
    <section className="sponsored-slider rounded-3xl my-7">
      {/* Heading */}
      <div className="sponsored-heading">
        <span className="sponsored-heading__eyebrow">
          <span className="sponsored-heading__line" />
          Sponsored
          <span className="sponsored-heading__line" />
        </span>
        <h2 className="sponsored-heading__title">
          Curated <em>Collections</em>
        </h2>
        <p className="sponsored-heading__sub">
          Handpicked jewellery styles from India&apos;s finest artisan houses
        </p>
      </div>

      {/* ── Background Slider ── */}
      <div className="sponsored-bg">
        <Swiper
          modules={[EffectFade, Controller]}
          effect="fade"
          slidesPerView={1}
          speed={400}
          allowTouchMove={false}
          onSwiper={setBgSwiper}
        >
          {SLIDES.map((s, i) => (
            <SwiperSlide key={`bg-${i}`}>
              <img src={s.image} alt={s.title} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Titles Slider (main driver) ── */}
      <div className="sponsored-titles">
        <Swiper
          modules={[Controller, Navigation, Autoplay]}
          slidesPerView="auto"
          speed={600}
          slideToClickedSlide
          centeredSlides
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            if (swiper.params.navigation && typeof swiper.params.navigation !== "boolean") {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
          onSwiper={setTitlesSwiper}
          onSlideChange={(s) => setCurrentSlide(s.realIndex + 1)}
        >
          {SLIDES.map((s, i) => (
            <SwiperSlide key={`title-${i}`}>
              <p className="slider-title">{s.title}</p>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="sponsored-bottom">
        {/* <div className="sponsored-nav">
          <button ref={prevRef} className="sponsored-btn is-prev" aria-label="Previous slide">
            <NavArrow direction="left" />
          </button>
          <button ref={nextRef} className="sponsored-btn" aria-label="Next slide">
            <NavArrow direction="right" />
          </button>
        </div> */}

        <p className="sponsored-counter">
          <span className="current">{pad(currentSlide)}</span> — {pad(SLIDES.length)}
        </p>

        <div className="sponsored-thumbs-wrap">
          <div className="sponsored-thumbs-overflow">
            <div>
              <div className="sponsored-thumbs-inner">
                <Swiper
                  modules={[Controller]}
                  slidesPerView={1}
                  speed={600}
                  slideToClickedSlide
                  onSwiper={setThumbsSwiper}
                >
                  {SLIDES.map((s, i) => (
                    <SwiperSlide key={`thumb-${i}`}>
                      <div className="sponsored-thumb">
                        <img src={s.thumb} alt={s.title} />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
