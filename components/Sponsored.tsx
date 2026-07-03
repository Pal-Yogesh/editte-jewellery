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
import "./sponsored.css";


// ─── Slide data ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    title: "The Bridal & ceremony",
    image: "/original-images/01.png",
    thumb: "/original-images/01.png",
  },
  {
    title: "After Dark",
    image: "/original-images/02.png",
    thumb: "/original-images/02.png",
  },
  {
    title: "Daily Icons",
    image: "/original-images/03.png",
    thumb: "/original-images/03.png",
  },
  {
    title: "Workday Luxe",
    image: "/original-images/04.png",
    thumb: "/original-images/04.png",
  },
  {
    title: "Vacation Escape",
    image: "/original-images/05.png",
    thumb: "/original-images/05.png",
  },
  {
    title: "Festive Finds",
    image: "/original-images/06.png",
    thumb: "/original-images/06.png",
  },
  {
    title: "The Gift Guide",
    image: "/original-images/07.png",
    thumb: "/original-images/07.png",
  },
  {
    title: "Men's Essentials",
    image: "/original-images/08.png",
    thumb: "/original-images/08.png",
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
          speed={600}
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
