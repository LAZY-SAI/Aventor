
import { useGLTF } from '@react-three/drei'

export function Backpack(props) {
  const { nodes, materials } = useGLTF('/models/blackbag.glb')
  return (
    <group {...props} dispose={null} scale={0.025}
    rotation={[-Math.PI/28, -0.8, 0.3]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Bag_LOD0_BaseBag_test_Base_0.geometry}
        material={materials.BaseBag_test_Base}
        scale={[100, 100, 136.799]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Straps_LOD0_BaseBag_test_Extra_0.geometry}
        material={materials.BaseBag_test_Extra}
        rotation={[-2.317, 0, -Math.PI]}
        scale={[142.695, 100, 66.505]}
      />
    </group>
  )
}

useGLTF.preload('/models/blackbag.glb')