"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectFade,
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
    title: "Everyday",
    image: "/images-2/Daily.jpg",
    thumb: "/images-2/Daily.jpg",
  },
  {
    title: "Men Essential",
    image: "/images-2/Men.jpg",
    thumb: "/images-2/Men.jpg",
  },
  {
    title: "Bridal",
    image: "/images-2/Thebridal.jpg",
    thumb: "/images-2/Thebridal.jpg",
  },
  {
    title: "Vacation Done",
    image: "/images-2/Vacation.jpg",
    thumb: "/images-2/Vacation.jpg",
  },
  {
    title: "Workday",
    image: "/images-2/Workday.jpg",
    thumb: "/images-2/Workday.jpg",
  },
  {
    title: "Gift",
    image: "/images-2/gift.jpg",
    thumb: "/images-2/gift.jpg",
  },
  {
    title: "Festive Find",
    image: "/banner3/Festive-Finds.png",
    thumb: "/images-2/gift.jpg",
  },
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

// ArrowSvg removed — using shared NavArrow component

export default function SponsoredProduct() {
  const [bgSwiper, setBgSwiper] = useState<SwiperType | null>(null);
  const [titlesSwiper, setTitlesSwiper] = useState<SwiperType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Sync bg swiper whenever titles change slide
  useEffect(() => {
    if (!titlesSwiper || !bgSwiper) return;
    const handleChange = () => {
      bgSwiper.slideTo(titlesSwiper.realIndex);
    };
    titlesSwiper.on("slideChange", handleChange);
    return () => {
      titlesSwiper.off("slideChange", handleChange);
    };
  }, [bgSwiper, titlesSwiper]);

  return (
    <section className="sponsored-slider rounded-3xl my-7">
     

      {/* ── Background Slider ── */}
      <div className="sponsored-bg ">
        <Swiper
          modules={[EffectFade]}
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
      <div className="sponsored-titles mt-40">
        <Swiper
          modules={[Navigation, Autoplay]}
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

        {/* <p className="sponsored-counter">
          <span className="current">{pad(currentSlide)}</span> — {pad(SLIDES.length)}
        </p> */}

        {/* <div className="sponsored-thumbs-wrap">
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
        </div> */}
      </div>
    </section>
  );
}
