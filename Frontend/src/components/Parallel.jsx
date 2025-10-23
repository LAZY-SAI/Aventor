import {
  useScroll,
  motion,
  useTransform,
  useSpring,
  
} from "motion/react";
import { useState, useEffect } from "react";
import HeroText from "./HeroText";
const Parallax = () => {
  const { scrollYProgress } = useScroll();
 const smoothScroll = useSpring(scrollYProgress, {
  damping: 30,
  stiffness: 80,
  mass: 0.4,
});
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Responsive parallax values
  const mountain = useTransform(
    smoothScroll,
    [0, 0.5],
    ["0%", isMobile ? "0%" : "2%"]
  );
  const jungle1 = useTransform(
    smoothScroll,
    [0, 1],
    ["0%", isMobile ? "15%" : "30%"]
  );
  const jungle2 = useTransform(
    smoothScroll,
    [0, 1],
    ["0%", isMobile ? "10%" : "20%"]
  );
  const jungle3 = useTransform(
    smoothScroll,
    [0, 1],
    ["0%", isMobile ? "8%" : "15%"]
  );
  const jungle4 = useTransform(
    smoothScroll,
    [0, 1],
    ["0%", isMobile ? "5%" : "10%"]
  );
  const jungle5 = useTransform(
    smoothScroll,
    [0, 1],
    ["0%", isMobile ? "3%" : "5%"]
  );
  const man = useTransform(
    smoothScroll,
    [0, 1],
    ["0%", isMobile ? "2%" : "4%"]
  );

  return (
    <section className="absolute inset-0 bg-black/40">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background sky */}
        <img
          src="/assets/background.png"
          alt="Sky background"
          className="absolute inset-0 w-full h-full object-cover -z-50"
          draggable="false"
        />

        {/* Mountain  */}
        <motion.img
          src="/assets/mountains.png"
          alt="Mountains"
          className="absolute inset-0 w-full h-full object-cover -z-40"
          style={{ y: mountain, willChange: "transform" }}
          draggable="false"
        />

        {/* Jungle 1 */}
        <motion.img
          src="/assets/jungle1.png"
          alt="Jungle layer 1"
          className="absolute inset-0 w-full h-full object-cover -z-30"
          style={{ y: jungle1, willChange: "transform" }}
          draggable="false"
        />

        {/* Jungle 2 */}
       <motion.img
          src="/assets/jungle2.png"
          alt="Jungle layer 2"
          className="absolute inset-0 w-full h-full object-cover -z-20"
          style={{ y: jungle2, willChange: "transform" }}
          draggable="false"
        />

        {/* Jungle 3  */}
        <motion.img
          src="/assets/jungle3.png"
          alt="Jungle layer 3"
          className="absolute inset-0 w-full h-full object-cover -z-10 md:ml-20 ml-4"
          style={{ y: jungle3, willChange: "transform" }}
          draggable="false"
        />

        {/* Jungle 4 */}
          <motion.img
          src="/assets/jungle4.png"
          alt="Jungle layer 4"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ y: jungle4, willChange: "transform" }}
          draggable="false"
        />

        {/* Jungle 5 */}
     <motion.img
          src="/assets/jungle5.png"
          alt="Jungle layer 5"
          className="absolute inset-0 w-full h-full object-cover z-10"
          style={{ y: jungle5, willChange: "transform" }}
          draggable="false"
        />

        {/* Foreground Man */}
          <motion.img
          src="/assets/man_on_mountain.png"
          alt="Man on mountain"
          className="absolute inset-0 w-full h-full object-cover z-20"
          style={{ y: man, willChange: "transform" }}
          draggable="false"
        />

        {/* Responsive text overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-50">
         <HeroText />
        </div>
       
      </div>

  
     
    </section>
  );
};

export default Parallax;
