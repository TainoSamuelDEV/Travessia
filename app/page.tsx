"use client"

import dynamic from "next/dynamic"

const TrafficSimulation = dynamic(
  () => import("@/components/traffic-simulation"),
  { ssr: false }
)

export default function Page() {
  return <TrafficSimulation />
}
