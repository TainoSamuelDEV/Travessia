"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface CarProps {
  lane: number
  speed: number
  initialZ: number
  carLight: "green" | "yellow" | "red"
  color: string
  isEgo?: boolean
}

export function Car({ lane, speed, initialZ, carLight, color, isEgo }: CarProps) {
  const ref = useRef<THREE.Group>(null)
  const stopZ = lane > 0 ? 5 : -5

  // Tesla Model 3 body as a smooth rounded box shape
  const bodyGeometry = useMemo(() => {
    // Main body - sleek sedan shape built with merged geometries approach
    // We'll use box + cylinder combos for the Tesla-like silhouette
    return null
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const direction = lane > 0 ? -1 : 1
    const currentZ = ref.current.position.z

    const shouldStop =
      (carLight === "red" || carLight === "yellow") &&
      ((direction === -1 && currentZ > stopZ && currentZ < stopZ + 14) ||
        (direction === 1 && currentZ < stopZ && currentZ > stopZ - 14))

    if (!shouldStop) {
      ref.current.position.z += direction * speed * delta
    }

    if (ref.current.position.z < -50) ref.current.position.z = 50
    if (ref.current.position.z > 50) ref.current.position.z = -50
  })

  const laneX = lane * 3
  const facing = lane > 0 ? Math.PI : 0

  return (
    <group ref={ref} position={[laneX, 0.01, initialZ]} rotation={[0, facing, 0]}>
      {/* Lower body - main chassis */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[1.6, 0.35, 4.2]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.12}
        />
      </mesh>

      {/* Upper cabin - greenhouse (slightly narrower, tapered) */}
      <mesh position={[0, 0.52, -0.15]} castShadow>
        <boxGeometry args={[1.4, 0.32, 2.2]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.12}
        />
      </mesh>

      {/* Windshield slope - front */}
      <mesh position={[0, 0.46, 0.85]} rotation={[-0.45, 0, 0]} castShadow>
        <boxGeometry args={[1.38, 0.02, 0.9]} />
        <meshStandardMaterial
          color="#1a2030"
          metalness={0.3}
          roughness={0.1}
          opacity={0.85}
          transparent
        />
      </mesh>

      {/* Rear window slope */}
      <mesh position={[0, 0.46, -1.15]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[1.38, 0.02, 0.8]} />
        <meshStandardMaterial
          color="#1a2030"
          metalness={0.3}
          roughness={0.1}
          opacity={0.85}
          transparent
        />
      </mesh>

      {/* Roof - smooth top panel */}
      <mesh position={[0, 0.69, -0.15]} castShadow>
        <boxGeometry args={[1.38, 0.02, 2.0]} />
        <meshStandardMaterial
          color="#1a2030"
          metalness={0.2}
          roughness={0.1}
          opacity={0.9}
          transparent
        />
      </mesh>

      {/* Front bumper - rounded */}
      <mesh position={[0, 0.15, 2.1]}>
        <boxGeometry args={[1.5, 0.2, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.12} />
      </mesh>

      {/* Rear bumper */}
      <mesh position={[0, 0.15, -2.1]}>
        <boxGeometry args={[1.5, 0.2, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.12} />
      </mesh>

      {/* Wheels - 4 wheels with dark tires and silver rims */}
      {([
        [-0.82, 0.16, 1.3],
        [0.82, 0.16, 1.3],
        [-0.82, 0.16, -1.3],
        [0.82, 0.16, -1.3],
      ] as const).map((pos, i) => (
        <group key={i} position={[pos[0], pos[1], pos[2]]}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.16, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.95} />
          </mesh>
          {/* Rim center */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.17, 16]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      ))}

      {/* Headlights - slim LED strips (Tesla signature) */}
      <mesh position={[-0.55, 0.3, 2.12]}>
        <boxGeometry args={[0.35, 0.04, 0.02]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={isEgo ? 4 : 1.2}
        />
      </mesh>
      <mesh position={[0.55, 0.3, 2.12]}>
        <boxGeometry args={[0.35, 0.04, 0.02]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={isEgo ? 4 : 1.2}
        />
      </mesh>

      {/* Tail lights - full width light bar (Tesla Model 3 signature) */}
      <mesh position={[0, 0.3, -2.12]}>
        <boxGeometry args={[1.4, 0.04, 0.02]} />
        <meshStandardMaterial
          color="#ff2020"
          emissive="#ff2020"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Ego car highlight - subtle glow underneath */}
      {isEgo && (
        <pointLight
          position={[0, 0.05, 0]}
          color="#f5c518"
          intensity={0.6}
          distance={3}
        />
      )}
    </group>
  )
}

interface CarsProps {
  carLight: "green" | "yellow" | "red"
}

export function Cars({ carLight }: CarsProps) {
  const carConfigs = [
    { lane: 1, speed: 4.5, initialZ: 22, color: "#1a1a1e", isEgo: true },
    { lane: 1, speed: 3.6, initialZ: -16, color: "#c0bbb5" },
    { lane: -1, speed: 5.2, initialZ: -24, color: "#3a3a3e" },
    { lane: -1, speed: 3.2, initialZ: 18, color: "#888888" },
    { lane: 1, speed: 4.0, initialZ: -34, color: "#2a2a2e" },
    { lane: -1, speed: 4.8, initialZ: 38, color: "#b8b3ad" },
  ]

  return (
    <group>
      {carConfigs.map((config, i) => (
        <Car key={i} {...config} carLight={carLight} />
      ))}
    </group>
  )
}
