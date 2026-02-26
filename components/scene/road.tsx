"use client"

import * as THREE from "three"
import { useMemo } from "react"

export function Road() {
  const roadWidth = 12
  const roadLength = 80

  // Chevron arrow shape - Tesla style
  const chevronShape = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0.8)
    shape.lineTo(0.35, 0)
    shape.lineTo(0.18, 0)
    shape.lineTo(0, 0.5)
    shape.lineTo(-0.18, 0)
    shape.lineTo(-0.35, 0)
    shape.closePath()
    return shape
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#efedea" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, roadLength]} />
        <meshStandardMaterial color="#faf8f5" />
      </mesh>

      <mesh position={[-roadWidth / 2, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.25, roadLength]} />
        <meshStandardMaterial
          color="#e8401a"
          emissive="#e8401a"
          emissiveIntensity={2.0}
        />
      </mesh>

      <mesh position={[roadWidth / 2, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.25, roadLength]} />
        <meshStandardMaterial
          color="#e8401a"
          emissive="#e8401a"
          emissiveIntensity={2.0}
        />
      </mesh>

      {Array.from({ length: 28 }).map((_, i) => {
        const z = -roadLength / 2 + 2 + i * 2.8
        return (
          <mesh
            key={`dash-${i}`}
            position={[0, 0.012, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.1, 1.5]} />
            <meshStandardMaterial color="#ffd200" emissive="#ffd200" emissiveIntensity={0.25} />
          </mesh>
        )
      })}

      {[-3, 3].map((x) =>
        Array.from({ length: 28 }).map((_, i) => {
          const z = -roadLength / 2 + 2 + i * 2.8
          return (
            <mesh
              key={`lane-${x}-${i}`}
              position={[x, 0.011, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.06, 1.2]} />
              <meshStandardMaterial color="#d8d4cf" opacity={0.5} transparent />
            </mesh>
          )
        })
      )}

      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`cw-${i}`}
          position={[-roadWidth / 2 + 0.5 + i * (roadWidth / 12), 0.013, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.55, 3.5]} />
          <meshStandardMaterial color="#ebe7e2" />
        </mesh>
      ))}

      {Array.from({ length: 5 }).map((_, i) => {
        const z = -16 + i * 8
        return (
          <group key={`arrow-${i}`}>
            <mesh position={[3, 0.013, z]} rotation={[-Math.PI / 2, Math.PI, 0]}>
              <shapeGeometry args={[chevronShape]} />
              <meshStandardMaterial color="#c0bbb5" opacity={0.6} transparent />
            </mesh>
            <mesh position={[-3, 0.013, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <shapeGeometry args={[chevronShape]} />
              <meshStandardMaterial color="#c0bbb5" opacity={0.6} transparent />
            </mesh>
          </group>
        )
      })}

      <mesh position={[-roadWidth / 2 - 4, 0.06, 0]} receiveShadow>
        <boxGeometry args={[8, 0.12, roadLength]} />
        <meshStandardMaterial color="#ece8e4" />
      </mesh>
      <mesh position={[roadWidth / 2 + 4, 0.06, 0]} receiveShadow>
        <boxGeometry args={[8, 0.12, roadLength]} />
        <meshStandardMaterial color="#ece8e4" />
      </mesh>
    </group>
  )
}
