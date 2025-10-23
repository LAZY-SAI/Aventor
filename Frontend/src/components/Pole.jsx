
import { useGLTF } from '@react-three/drei'

export function Pole(props) {
  const { nodes, materials } = useGLTF('/models/treking_pole.glb')
  return (
    <group {...props} dispose={null}>
      <group scale={2}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={1}>
          <group>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Object_2.geometry}
              material={materials.pole}
            />
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/treking_pole.glb')
