import { FlipWords } from "./FlipWords";

const HeroText = () => {
  return (
    <div className="z-10 mt-20 text-center md:mt-40 rounded-3xl px-4">
      <div className="flex flex-col items-center c-space">
        {/* Main title */}
        <h1 className="font-custom font-bold mb-4 drop-shadow-2xl text-4xl sm:text-12 md:text-3xl lg:text-8xl">
          A V E N T O R
        </h1>

        {/* Subtitle and flipping words */}
        <div className="flex flex-col items-center">
          <p className="font-medium mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            where your adventure
          </p>
          <FlipWords
            words={["Awaits", "Begins", "Unfolds"]}
            className="font-bold text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroText;
