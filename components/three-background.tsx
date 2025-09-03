"use client"

import { useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import type * as THREE from "three"
import dynamic from "next/dynamic"

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null!)

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(1000 * 3) // Reduced for better performance
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.02
      ref.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#8b5cf6" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.6} />
    </Points>
  )
}

function RotatingShape() {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.2
      ref.current.rotation.y = state.clock.elapsedTime * 0.3
      ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5
    }
  })

  return (
    <mesh ref={ref} position={[3, 0, -2]}>
      <torusGeometry args={[1, 0.3, 16, 100]} />
      <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.2} />
    </mesh>
  )
}

function FloatingCubes() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      groupRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime + i) * 0.3
        child.rotation.x = state.clock.elapsedTime * 0.5
      })
    }
  })

  const cubePositions = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2
      return [Math.cos(angle) * 2, 0, Math.sin(angle) * 2]
    })
  }, [])

  return (
    <group ref={groupRef} position={[-3, 0, -2]}>
      {cubePositions.map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#06d6a0" : "#f72585"}
            emissive={i % 2 === 0 ? "#06d6a0" : "#f72585"}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06d6a0" />

      <Suspense fallback={null}>
        <FloatingParticles />
        <RotatingShape />
        <FloatingCubes />
      </Suspense>
    </Canvas>
  )
}

// Dynamic import to ensure client-side only rendering
const DynamicThreeScene = dynamic(() => Promise.resolve(ThreeScene), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-black/20" />
    </div>
  ),
})

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <DynamicThreeScene />
    </div>
  )
}
