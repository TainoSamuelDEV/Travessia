"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"

interface PedestrianProps {
  initialPosition: [number, number, number]
  onPositionChange: (position: THREE.Vector3) => void
  pedestrianLight: "red" | "green" | "blinking"
  autoCross: boolean
}

export function Pedestrian({
  initialPosition,
  onPositionChange,
  pedestrianLight,
  autoCross,
}: PedestrianProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hasCrossed, setHasCrossed] = useState(false)
  const walkPhaseRef = useRef(0)
  const legLeftRef = useRef<THREE.Mesh>(null)
  const legRightRef = useRef<THREE.Mesh>(null)
  const armLeftRef = useRef<THREE.Mesh>(null)
  const armRightRef = useRef<THREE.Mesh>(null)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.15))
  const intersection = useRef(new THREE.Vector3())
  const { camera, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  const isWalking = useRef(false)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    onPositionChange(groupRef.current.position)

    const shouldWalk =
      autoCross &&
      (pedestrianLight === "green" || pedestrianLight === "blinking") &&
      !isDragging &&
      !hasCrossed

    if (shouldWalk) {
      isWalking.current = true
      const crossSpeed = pedestrianLight === "blinking" ? 3.5 : 2.2
      const targetX = 10
      const currentX = groupRef.current.position.x

      if (currentX < targetX) {
        groupRef.current.position.x += crossSpeed * delta

        // Walking animation
        walkPhaseRef.current += delta * 8
        const legSwing = Math.sin(walkPhaseRef.current) * 0.4

        if (legLeftRef.current) legLeftRef.current.rotation.x = legSwing
        if (legRightRef.current) legRightRef.current.rotation.x = -legSwing
        if (armLeftRef.current) armLeftRef.current.rotation.x = -legSwing * 0.6
        if (armRightRef.current) armRightRef.current.rotation.x = legSwing * 0.6

        // Subtle vertical bob
        groupRef.current.position.y =
          initialPosition[1] + Math.abs(Math.sin(walkPhaseRef.current)) * 0.03
      } else {
        setHasCrossed(true)
        isWalking.current = false
        groupRef.current.position.y = initialPosition[1]
        // Reset limb rotations
        if (legLeftRef.current) legLeftRef.current.rotation.x = 0
        if (legRightRef.current) legRightRef.current.rotation.x = 0
        if (armLeftRef.current) armLeftRef.current.rotation.x = 0
        if (armRightRef.current) armRightRef.current.rotation.x = 0
      }
    } else if (!isWalking.current) {
      // Reset when not walking
      if (legLeftRef.current) legLeftRef.current.rotation.x = 0
      if (legRightRef.current) legRightRef.current.rotation.x = 0
      if (armLeftRef.current) armLeftRef.current.rotation.x = 0
      if (armRightRef.current) armRightRef.current.rotation.x = 0
    }
  })

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setIsDragging(true)
      setHasCrossed(false)
      gl.domElement.style.cursor = "grabbing"
    },
    [gl]
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    gl.domElement.style.cursor = "auto"
  }, [gl])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !groupRef.current) return
      const rect = gl.domElement.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.current.setFromCamera(mouse.current, camera)
      if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
        groupRef.current.position.x = intersection.current.x
        groupRef.current.position.z = intersection.current.z
      }
    },
    [isDragging, camera, gl]
  )

  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e: PointerEvent) => handlePointerMove(e)
      const upHandler = () => handlePointerUp()
      window.addEventListener("pointermove", moveHandler)
      window.addEventListener("pointerup", upHandler)
      return () => {
        window.removeEventListener("pointermove", moveHandler)
        window.removeEventListener("pointerup", upHandler)
      }
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  // Reset pedestrian when cycle resets
  useEffect(() => {
    if (pedestrianLight === "red" && hasCrossed) {
      const timer = setTimeout(() => {
        setHasCrossed(false)
        if (groupRef.current) {
          groupRef.current.position.set(
            initialPosition[0],
            initialPosition[1],
            initialPosition[2]
          )
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [pedestrianLight, hasCrossed, initialPosition])

  const bodyColor = "#6f7275"
  const bodyOpacity = 0.75

  return (
    <group
      ref={groupRef}
      position={[initialPosition[0], initialPosition[1], initialPosition[2]]}
      onPointerDown={handlePointerDown}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (!isDragging) gl.domElement.style.cursor = "grab"
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (!isDragging) gl.domElement.style.cursor = "auto"
      }}
    >
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={bodyOpacity} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.1, 8]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={bodyOpacity} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.4, 8, 16]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={bodyOpacity} />
      </mesh>

      {/* Left arm */}
      <mesh ref={armLeftRef} position={[-0.22, 1.15, 0]}>
        <capsuleGeometry args={[0.045, 0.42, 6, 8]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={bodyOpacity} />
      </mesh>

      {/* Right arm */}
      <mesh ref={armRightRef} position={[0.22, 1.15, 0]}>
        <capsuleGeometry args={[0.045, 0.42, 6, 8]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={bodyOpacity} />
      </mesh>

      {/* Left leg */}
      <mesh ref={legLeftRef} position={[-0.08, 0.5, 0]}>
        <capsuleGeometry args={[0.055, 0.48, 6, 8]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={bodyOpacity} />
      </mesh>

      {/* Right leg */}
      <mesh ref={legRightRef} position={[0.08, 0.5, 0]}>
        <capsuleGeometry args={[0.055, 0.48, 6, 8]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={bodyOpacity} />
      </mesh>
    </group>
  )
}
