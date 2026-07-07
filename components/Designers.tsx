// "use client";

// import Image from "next/image";
// import { motion } from "framer-motion";

// export default function Designers() {
//   return (
// <section className="bg-salt py-16 md:py-24">
//   <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:gap-40 items-center">
//     {/* Left — Image */}
//     <motion.div
//       initial={{ opacity: 0, x: -30 }}
//       whileInView={{ opacity: 1, x: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.7 }}
//       className="relative"
//     >
//       <Image
//         src="/footer.jpeg"
//         alt="Styling advice - jewellery models"
//         width={800}
//         height={600}
//         className="w-full h-auto object-cover rounded-sm"
//       />
//     </motion.div>

//     {/* Right — Content */}
//     <motion.div
//       initial={{ opacity: 0, x: 30 }}
//       whileInView={{ opacity: 1, x: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.7, delay: 0.15 }}
//       className="flex flex-col justify-center"
//     >
//       <h2
//         className="font-heading text-cacao leading-[1.1] uppercase"
//         style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700 }}
//       >
//         Need Styling
//         <br />
//         Advice ?
//       </h2>

//       <p className="text-ink/70 text-base leading-relaxed mt-5 max-w-md">
//         At Editte, our Personal Shopping Concierge offers expert guidance to
//         help you discover your perfect look.
//       </p>

//       <div className="mt-8">
//         <button className="bg-cacao text-white text-sm tracking-[0.15em] uppercase rounded-sm px-8 py-4 hover:bg-cacao/90 transition-colors duration-300 font-medium">
//           Book an Appointment
//         </button>
//       </div>
//     </motion.div>
//   </div>
// </section>
//   );
// }

"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const DESIGNERS = [
  "/images/designers/4.png",
  "/images/designers/5.png",
  "/images/designers/1.png",
  "/images/designers/2.png",
  "/images/designers/3.png",
];

export default function Designers() {
  return (
    <>
      <section className="bg-salt pt-10 pb-20">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-cacao text-center uppercase mb-9 px-4"
          style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 700 }}
        >
        Our Designers
        </motion.h2>

        {/* Designer photos — full-bleed staggered row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0">
          {DESIGNERS.map((src, i) => {
            // gentle wave: outer photos high, center photo lowest
            const offsets = [0, 18, 36, 18, 0];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative overflow-hidden group"
                style={{
                  aspectRatio: "4/5",
                  marginTop: `${offsets[i] ?? 0}px`,
                }}
              >
                <img
                  src={src}
                  alt={`Designer ${i + 1}`}
                  className="absolute inset-0 w-full px-2 h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                />
              </motion.div>
            );
          })}
        </div>
        {/* <div className="max-w-7xl mx-auto px-6 pt-16 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:gap-40 items-center">

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col justify-center"
          >
            <h2
              className="font-heading text-cacao leading-[1.1] uppercase"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
              }}
            >
              Need Styling
              <br />
              Advice ?
            </h2>

            <p className="text-ink/70 text-base leading-relaxed mt-5 max-w-md">
              At Editte, our Personal Shopping Concierge offers expert guidance
              to help you discover your perfect look.
            </p>

            <div className="mt-8">
              <button className="bg-sage text-white text-sm tracking-[0.15em] uppercase rounded-sm px-8 py-4 hover:bg-cacao transition-colors duration-300 font-medium">
                Book an Appointment
              </button>
            </div>
          </motion.div>
        
           <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <Image
              src="/footer.jpeg"
              alt="Styling advice - jewellery models"
              width={900}
              height={700}
              className="w-full h-auto object-cover rounded-sm"
            />
          </motion.div>
        </div> */}
      </section>
    </>
  );
}
