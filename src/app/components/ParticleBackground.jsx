"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

function Particles({ count = 800 }) {
  const points = useRef()

  // Generate random positions using useMemo to avoid recalculating
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 15
      let y = (Math.random() - 0.5) * 15
      let z = (Math.random() - 0.5) * 10
      positions.set([x, y, z], i * 3)
    }
    return positions
  }, [count])

  // Animation loop
  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.x -= delta / 30
      points.current.rotation.y -= delta / 40
    }
  })

  return (
    <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f0ff"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] pointer-events-none opacity-50 bg-[#030712] transition-opacity duration-1000">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} className="w-full h-full">
        <Particles />
      </Canvas>
    </div>
  )
}
