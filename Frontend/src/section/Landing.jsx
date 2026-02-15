import ParallelBackground from "../components/Parallel";
import About from "./About";
import Feature from "./Feature";
import { Reveal } from "../components/Reveal";  

const Landing = () => {
  return (
    <main className="relative max-w-8xl overflow-x-hidden">
   
      <section className="h-screen max-w-8xl relative z-0">
        <ParallelBackground />
      </section>

    
      <div className="relative z-10 ">
    
        <div className="absolute -top-40 left-0 w-full h-40 bg-gradient-to-t from-[#050505] to-transparent" />
        
        <div className="max-w-8xl mx-auto px-6 space-y-32 py-20">
          <Reveal>
            <About />
          </Reveal>

          <Reveal delay={0.2}>
            <Feature />
          </Reveal>
        </div>
      </div>
    </main>
  );
};

export default Landing;