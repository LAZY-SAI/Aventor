import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Shadow } from "@react-three/drei";
import { Boots } from "../components/Boots";
import { Backpack } from "../components/Backpack";
import { InteractiveHoverButton } from "../components/Button";
import { easing } from "maath";
import Globe from "../components/Globe";
const About = () => {
  return (
    <section className="c-space section-spacing">
      <h2 className="text-heading">About Us</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12">
        {/* Grid 1 */}
        <div className="flex items-end grid-default-color grid-1">
          <figure className="absolute items-center left-18 -top-15  ">
            <Globe scale={100} />
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
          <figure className="absolute left-[30%] top-[10%]"></figure>
        </div>

        {/* Grid 3 */}
        <div className="grid-default-color grid-3 flex flex-col justify-center items-center p-6">
          <figure className="absolute inset-4 -ml-[40%] ">
            <Canvas
              camera={{
                position: [4, 6, 6], // top-right, looking down
                fov: 50,
              }}
              style={{ width: "60vw", height: "50vh" }}
            >
              <Float />
              <ambientLight intensity={0.5} />
              <directionalLight position={[12, 15, 9]} intensity={10} />

              {/* Boots */}
              <group position={[-5, 0.5, 0.3]}>
                <Boots />
                <Shadow position={[0, -1, 0]} scale={[2, 2, 1]} opacity={1} />
              </group>

              {/* Backpack */}
              <group position={[5.4, 0.9, -1.5]}>
                <Backpack />
                <Shadow
                  position={[-1.2, -1.2, 0.3]}
                  scale={[2, 2, 1]}
                  opacity={1}
                />
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
          <InteractiveHoverButton className="w-35 h-12 flex flex-row">
            <p className="subtext" style={{ color: "white" }}>
              Sign up
            </p>
          </InteractiveHoverButton>
        </div>
      </div>
    </section>
  );
};

function Rig() {
  return useFrame((state, delta) => {
    const targetPos = [
      4 + state.mouse.x * 0.5, // horizontal sway
      6 - state.mouse.y * 0.5, // vertical tilt
      6,
    ];
    easing.damp3(state.camera.position, targetPos, 0.25, delta);
    state.camera.lookAt(0, 0, 0); // Always look at center
  });
}

export default About;
