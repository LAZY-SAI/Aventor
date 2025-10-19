import { FlipWords } from "./FlipWords";

const HeroText = () => {
  return (
    <div className="z-10 mt-20 text-center md:mt-40 rounded-3xl">
      <div className="flex flex-col items-center c-space">
        {/* Main title */}
        <h1 className="lg:text-8xl ml-12 font-custom md:text-6xl text-4xl font-bold mb-6 drop-shadow-2xl justify-evenly ">
          A V E N T O R
        </h1>

        {/* Subtitle and flipping words */}
        <div className="flex flex-col items-center">
          <p className="text-6xl font-medium mt-1">where Your Adventure </p>
          <FlipWords
            words={["Awaits",  "Begins", "Unfolds"]}
            className="font-bold text-white text-6xl"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroText;
