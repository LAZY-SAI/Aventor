import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Float, Shadow } from "@react-three/drei";
import { Backpack } from "../components/Backpack";
import { Boots } from "../components/Boots";
import { Button } from "../components/Button";
import {Reveal} from "../components/Reveal"
import {Rig} from '../components/Rig'
import Globe from "../components/Globe";

const About = () => {


  const navigate = useNavigate();

  
  return (
      <section className="c-space section-spacing">
     <Reveal>
       <h2 className="text-heading">About Us</h2>
     </Reveal>

      <div className="grid grid-cols-1  gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12 ">
        {/* Grid 1 */}
        <div className="flex items-end grid-default-color grid-1 ">
          <figure className="absolute items-center left-30 -top-13  ">
            <Globe />
          </figure>

          <div className="z-10">
            <p className="headtext">Hi, we're Aventor</p>
            <p className="subtext">
              Your Ultimate Travel Companion Aventor helps travelers explore,
              book guides, and discover hidden gems in Nepal.
            </p>
          </div>
        </div>

        {/* Grid 2 */}
        <div className="grid-black-color grid-2">
          <div>
            <h2 className="headtext">Our Mission</h2>
            <p className="subtext">
              We believe travel should be easy, safe, and unforgettable. Aventor
              is here to help you explore the world with confidence and
              adventure.
            </p>
          </div>
          {/* <figure className="absolute left-[30%] top-[10%]"></figure> */}
        </div>
        {/* Grid 3 */}
        <div className="flex flex-col items-end grid-default-color grid-3">
          <div className="z-10">
            <h2 className="headtext">Why Choose Us?</h2>
            <p className="subtext">
              Expert Guides: Connect with local experts who know Nepal inside
              out.
              <br />
              Easy Booking: Seamlessly book guides and experiences through our
              user-friendly platform.
              <br />
              Hidden Gems: Discover off-the-beaten-path destinations and unique
              experiences.
            </p>
          </div>
        </div>
        {/* Grid 4 */}
        <div className="grid-default-color grid-4 flex flex-col justify-center items-center p-6 overflow-hidden">
          <figure className="absolute inset-4 -ml-[40%] ">
            <Canvas
              camera={{
                position: [4, 7, 7], 
                fov: 50,
                near: 0.1,
                far: 1000,
              }}
              style={{ width: "120vw", height: "38vh"}}
            >
              <Float />
              <ambientLight intensity={0.5} />
              <directionalLight position={[15, 15, 10]} intensity={10} />

              {/* Boots */}
              <group position={[-7.7, 0.3, 4]}>
                <Boots />
               
              </group>

              {/* Backpack */}
              <group position={[9.2,-0.4, 8]}>
                <Backpack />
              
              </group>

              <Rig />
            </Canvas>
          </figure>
          <div className="text-center mb-4 z-10">
            <h2 className="text-2xl font-bold font-custom">
              Ready for Your Next Adventure?
            </h2>
            <p className="subtext  ">
              Sign up, book a guide, or discover amazing destinations today!
            </p>
          </div>
          <Button className="w-35 h-12 flex flex-row" 
          onClick={()=> navigate("/signup")}>
            <p className="subtext" style={{ color: "white" }}>
              Sign up
            </p>
          </Button>
        </div>
      </div>
    </section>
  );
};



export default About;