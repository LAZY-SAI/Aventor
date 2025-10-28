import { useState, useEffect } from "react";
import HeroText from "./HeroText";

const Parallax = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="absolute inset-0 bg-black/40">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background sky */}
        <img
          src="/assets/webp/background.webp"
          alt="Sky background"
          className="absolute inset-0 w-full h-full object-cover -z-50"
          draggable="false"
        />

        {/* Mountain */}
        <img
          src="/assets/mountains.png"
          alt="Mountains"
          className="absolute inset-0 w-full h-full object-cover -z-40"
          draggable="false"
        />

        {/* Jungle 1 */}
        <img
          src="/assets/webp/jungle1.webp"
          alt="Jungle layer 1"
          className="absolute inset-0 w-full h-full object-cover -z-30"
          draggable="false"
        />

        {/* Jungle 2 */}
        <img
          src="/assets/webp/jungle2.webp"
          alt="Jungle layer 2"
          className="absolute inset-0 w-full h-full object-cover -z-20"
          draggable="false"
        />

        {/* Jungle 3 */}
        <img
          src="/assets/webp/jungle3.webp"
          alt="Jungle layer 3"
          className="absolute inset-0 w-full h-full object-cover -z-10 md:ml-20 ml-4"
          draggable="false"
        />

        {/* Jungle 4 */}
        <img
          src="/assets/webp/jungle4.webp"
          alt="Jungle layer 4"
          className="absolute inset-0 w-full h-full object-cover z-0"
          draggable="false"
        />

        {/* Jungle 5 */}
        <img
          src="/assets/webp/jungle5.webp"
          alt="Jungle layer 5"
          className="absolute inset-0 w-full h-full object-cover z-10"
          draggable="false"
        />

        {/* Foreground Man */}
        <img
          src="/assets/webp/man_on_mountain.webp"
          alt="Man on mountain"
          className="absolute inset-0 w-full h-full object-cover z-20"
          draggable="false"
        />

        {/* Centered text overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <HeroText />
        </div>
      </div>
    </section>
  );
};

export default Parallax;
