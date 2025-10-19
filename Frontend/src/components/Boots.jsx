//import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Boots(props) {
  const { nodes, materials } = useGLTF('/models/boots.glb')
  return (
    <group {...props} dispose={null}>
      <group scale={0.03}>
        <group position={[-10.628, 0, 23.189]} rotation={[-Math.PI / 2, 0, -0.3]} scale={80}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model007_material0011_0.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model007_material0011_0_1.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model007_material0011_0_2.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model007_material0011_0_3.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model007_material0011_0_4.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model007_material0011_0_5.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model007_material0011_0_6.geometry}
            material={materials['material0.011']}
          />
        </group>
        <group position={[26.126, 29.89, -61.812]} rotation={[3.126, -0.55, -0.104]} scale={100}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model009_material0011_0.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model009_material0011_0_1.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model009_material0011_0_2.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model009_material0011_0_3.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model009_material0011_0_4.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model009_material0011_0_5.geometry}
            material={materials['material0.011']}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Model009_material0011_0_6.geometry}
            material={materials['material0.011']}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/boots.glb')
