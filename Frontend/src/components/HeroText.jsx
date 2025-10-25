import { FlipWords } from "./FlipWords";
import { useState, useEffect } from 'react';

const HeroText = () => {
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
    <div className="z-10 mt-20 text-center md:mt-40 rounded-3xl px-4">
      <div className="flex flex-col items-center c-space">
        {/* Main title */}
        <h1 className={`font-custom font-bold mb-4 drop-shadow-2xl ${
          isMobile 
            ? "text-3xl sm:text-2xl" 
            : "text-6xl md:text-6xl lg:text-8xl"
        }`}>
          A V E N T O R
        </h1>

        {/* Subtitle and flipping words */}
        <div className="flex flex-col items-center">
          <p className={`font-medium mt-2 ${
            isMobile 
              ? "text-xl sm:text-2xl" 
              : "text-2xl md:text-3xl lg:text-4xl"
          }`}>
            where your adventure
          </p>
          <FlipWords
            words={["Awaits", "Begins", "Unfolds"]}
            className={`font-bold text-white mt-2 ${
              isMobile 
                ? "text-2xl sm:text-3xl" 
                : "text-3xl md:text-4xl lg:text-5xl"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroText;