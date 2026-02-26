"use client"

import { useRef } from "react"
import { useFrame, ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"

interface TrafficLightProps {
  carLight: "green" | "yellow" | "red"
  pedestrianLight: "red" | "green" | "blinking"
  sensorActive: boolean
  soundWaves: boolean
  soundWavesFast: boolean
  vibration: boolean
  onButtonClick: () => void
}

function SoundWaveRing({ index, fast }: { index: number; fast: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const speed = fast ? 3 : 1.5
    const t = ((clock.getElapsedTime() * speed + index * 0.8) % 3) / 3
    const scale = 0.5 + t * 2.5
    ref.current.scale.set(scale, scale, 1)
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.opacity = 1 - t
  })

  return (
    <mesh ref={ref} position={[0, 3.5, 0]}>
      <ringGeometry args={[0.3, 0.35, 32]} />
      <meshStandardMaterial
        color="#38bdf8"
        emissive="#38bdf8"
        emissiveIntensity={2}
        transparent
        opacity={1}
        side={2}
      />
    </mesh>
  )
}

function SensorCone({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshStandardMaterial
    if (active) {
      mat.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 2) * 0.04
    } else {
      mat.opacity = 0
    }
  })

  return (
    <mesh ref={ref} position={[3.5, 1.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[3.5, 6, 16, 1, true]} />
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={0.6}
        transparent
        opacity={0}
        side={2}
        depthWrite={false}
      />
    </mesh>
  )
}

function DetectionDots({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.visible = active
    if (active) {
      ref.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial
        const pulse = Math.sin(clock.getElapsedTime() * 4 + i * 0.6) * 0.5 + 0.5
        mat.opacity = 0.2 + pulse * 0.6
      })
    }
  })

  return (
    <group ref={ref} visible={false}>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-4 + i * 1.0, 1, 0.3]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color="#1a1a1a"
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

export function TrafficLight({
  carLight,
  pedestrianLight,
  sensorActive,
  soundWaves,
  soundWavesFast,
  vibration,
  onButtonClick,
}: TrafficLightProps) {
  const poleRef = useRef<THREE.Group>(null)
  const blinkRef = useRef<THREE.Mesh>(null)

  const roadWidth = 12

  useFrame(({ clock }) => {
    if (!poleRef.current) return
    if (vibration) {
      const shake = Math.sin(clock.getElapsedTime() * 40) * 0.01
      poleRef.current.position.x = -roadWidth / 2 - 0.5 + shake
    } else {
      poleRef.current.position.x = -roadWidth / 2 - 0.5
    }

    if (blinkRef.current) {
      const mat = blinkRef.current.material as THREE.MeshStandardMaterial
      if (pedestrianLight === "blinking") {
        const blink = Math.sin(clock.getElapsedTime() * 8) > 0
        mat.emissiveIntensity = blink ? 4 : 0.2
        mat.color.set(blink ? "#22c55e" : "#1a1a1a")
        mat.emissive.set(blink ? "#22c55e" : "#000000")
      } else if (pedestrianLight === "green") {
        mat.emissiveIntensity = 4
        mat.color.set("#22c55e")
        mat.emissive.set("#22c55e")
      } else {
        mat.emissiveIntensity = 4
        mat.color.set("#ef4444")
        mat.emissive.set("#ef4444")
      }
    }
  })

  return (
    <group ref={poleRef} position={[-roadWidth / 2 - 0.5, 0, 0]}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 5, 8]} />
        <meshStandardMaterial color="#5a5a5a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Car traffic light housing */}
      <group position={[0, 5.2, 0]}>
        <mesh>
          <boxGeometry args={[0.45, 1.4, 0.35]} />
          <meshStandardMaterial color="#222222" metalness={0.3} roughness={0.5} />
        </mesh>
        {/* Red */}
        <mesh position={[0, 0.42, 0.18]}>
          <circleGeometry args={[0.14, 16]} />
          <meshStandardMaterial
            color={carLight === "red" ? "#ef4444" : "#2a1111"}
            emissive={carLight === "red" ? "#ef4444" : "#000000"}
            emissiveIntensity={carLight === "red" ? 6 : 0}
          />
        </mesh>
        {/* Yellow */}
        <mesh position={[0, 0, 0.18]}>
          <circleGeometry args={[0.14, 16]} />
          <meshStandardMaterial
            color={carLight === "yellow" ? "#eab308" : "#2a2211"}
            emissive={carLight === "yellow" ? "#eab308" : "#000000"}
            emissiveIntensity={carLight === "yellow" ? 6 : 0}
          />
        </mesh>
        {/* Green */}
        <mesh position={[0, -0.42, 0.18]}>
          <circleGeometry args={[0.14, 16]} />
          <meshStandardMaterial
            color={carLight === "green" ? "#22c55e" : "#112a11"}
            emissive={carLight === "green" ? "#22c55e" : "#000000"}
            emissiveIntensity={carLight === "green" ? 6 : 0}
          />
        </mesh>
        {/* Active light glow */}
        {carLight === "red" && (
          <pointLight position={[0, 0.42, 0.4]} color="#ef4444" intensity={5} distance={8} />
        )}
        {carLight === "yellow" && (
          <pointLight position={[0, 0, 0.4]} color="#eab308" intensity={5} distance={8} />
        )}
        {carLight === "green" && (
          <pointLight position={[0, -0.42, 0.4]} color="#22c55e" intensity={5} distance={8} />
        )}
      </group>

      {/* Pedestrian light */}
      <group position={[0, 3.5, 0.35]}>
        <mesh>
          <boxGeometry args={[0.35, 0.45, 0.25]} />
          <meshStandardMaterial color="#222222" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh ref={blinkRef} position={[0, 0, 0.13]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={4}
          />
        </mesh>
      </group>

      {/* Crossing button */}
      <group position={[0, 2, 0.2]}>
        <mesh
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation()
            onButtonClick()
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            document.body.style.cursor = "pointer"
          }}
          onPointerOut={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            document.body.style.cursor = "auto"
          }}
        >
          <boxGeometry args={[0.25, 0.18, 0.08]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
          <meshStandardMaterial
            color="#dc2626"
            emissive="#dc2626"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Sound wave rings */}
      {soundWaves && (
        <group>
          {[0, 1, 2].map((i) => (
            <SoundWaveRing key={i} index={i} fast={soundWavesFast} />
          ))}
        </group>
      )}

      {/* Sensor cone */}
      <SensorCone active={sensorActive} />

      {/* Detection dots (Tesla-style dotted line) */}
      <DetectionDots active={sensorActive} />
    </group>
  )
}
