import { useFrame } from "@react-three/fiber";
import { easing } from "maath";

export const Rig = () => {
  return useFrame((state, delta) => {
  
    const targetX = state.mouse.x * 0.8; 
    const targetY = state.mouse.y * 0.5;

    easing.damp3(
      state.camera.position, 
      [targetX, targetY, 12.5], 
      0.25, 
      delta
    );

    // Look at the center so the models stay framed
    state.camera.lookAt(0, 0, 0);
  });
};