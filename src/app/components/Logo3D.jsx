"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

function Ring() {
  const mesh = useRef()

  useFrame(() => {
    mesh.current.rotation.y += 0.01
  })

  return (
    <mesh ref={mesh}>
      <torusGeometry args={[2.2, 0.08, 16, 100]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  )
}

function Logo() {
  const texture = new THREE.TextureLoader().load("/logo.png")

  return (
    <mesh>
      <circleGeometry args={[1.3, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

export default function Logo3D() {
  return (
    <div style={{ width: 300, height: 300 }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} />

        <Float speed={2}>
          <Ring />
          <Logo />
        </Float>

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}