"use client"

import { useRef, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { Road } from "@/components/scene/road"
import { TrafficLight } from "@/components/scene/traffic-light"
import { Cars } from "@/components/scene/car"
import { Pedestrian } from "@/components/scene/pedestrian"
import { Hud } from "@/components/hud"
import { useTrafficState } from "@/hooks/use-traffic-state"

function Scene({
  trafficState,
}: {
  trafficState: ReturnType<typeof useTrafficState>
}) {
  const pedestrianPos = useRef<THREE.Vector3>(new THREE.Vector3())

  const handlePositionChange = useCallback(
    (position: THREE.Vector3) => {
      pedestrianPos.current.copy(position)

      const roadWidth = 12
      const sensorCenter = new THREE.Vector3(-roadWidth / 2 - 4, 0, 0)
      const sensorRadius = 3.5

      const dist = new THREE.Vector2(
        position.x - sensorCenter.x,
        position.z - sensorCenter.z
      ).length()

      trafficState.setPedestrianInSensor(dist < sensorRadius)
    },
    [trafficState]
  )

  const pedestrianInitialPos: [number, number, number] = [-10, 0.15, 0]

  return (
    <>
      <ambientLight intensity={1.25} color="#f7f5f2" />
      <hemisphereLight args={["#faf8f6", "#ebe8e5", 0.6]} />
      <directionalLight
        position={[25, 30, 20]}
        intensity={0.55}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        color="#fff8f2"
      />
      <directionalLight position={[-20, 15, -15]} intensity={0.18} color="#eee9e4" />

      <fog attach="fog" args={["#f3f0ec", 70, 160]} />

      <Road />

      <TrafficLight
        carLight={trafficState.carLight}
        pedestrianLight={trafficState.pedestrianLight}
        sensorActive={trafficState.sensorActive}
        soundWaves={trafficState.soundWaves}
        soundWavesFast={trafficState.soundWavesFast}
        vibration={trafficState.vibration}
        onButtonClick={trafficState.requestCrossing}
      />

      <Cars carLight={trafficState.carLight} />

      <Pedestrian
        initialPosition={pedestrianInitialPos}
        onPositionChange={handlePositionChange}
        pedestrianLight={trafficState.pedestrianLight}
        autoCross={true}
      />

      <OrbitControls
        makeDefault
        target={[0, 1, 0]}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        minDistance={10}
        maxDistance={60}
        enablePan={false}
      />
    </>
  )
}

// Blur vignette corners overlay
function BlurVignette() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        className="absolute top-0 left-0 h-48 w-48"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, rgba(240,238,235,0.75) 0%, rgba(240,238,235,0.35) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 right-0 h-48 w-48"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(240,238,235,0.75) 0%, rgba(240,238,235,0.35) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-48 w-48"
        style={{
          background:
            "radial-gradient(ellipse at 0% 100%, rgba(240,238,235,0.75) 0%, rgba(240,238,235,0.35) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute right-0 bottom-0 h-48 w-48"
        style={{
          background:
            "radial-gradient(ellipse at 100% 100%, rgba(240,238,235,0.75) 0%, rgba(240,238,235,0.35) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(240,238,235,0.25) 88%, rgba(240,238,235,0.5) 100%)",
        }}
      />
    </div>
  )
}

export default function TrafficSimulation() {
  const trafficState = useTrafficState()

  return (
    <div className="relative h-screen w-full" style={{ background: "#f0efec" }}>
      <BlurVignette />
      <Hud
        state={trafficState.state}
        carLight={trafficState.carLight}
        pedestrianLight={trafficState.pedestrianLight}
        sensorActive={trafficState.sensorActive}
        pedestrianInSensor={trafficState.pedestrianInSensor}
        timeRemaining={trafficState.timeRemaining}
        onRequestCrossing={trafficState.requestCrossing}
      />
      <Canvas
        shadows
        camera={{
          position: [24, 16, 24],
          fov: 38,
          near: 0.1,
          far: 250,
        }}
        gl={{ antialias: true, toneMapping: 1 }}
        style={{ background: "#f0efec" }}
      >
        <Scene trafficState={trafficState} />
      </Canvas>
    </div>
  )
}
