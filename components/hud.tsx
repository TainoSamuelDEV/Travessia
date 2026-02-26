"use client"

import type { TrafficState } from "@/hooks/use-traffic-state"

interface HudProps {
  state: TrafficState
  carLight: "green" | "yellow" | "red"
  pedestrianLight: "red" | "green" | "blinking"
  sensorActive: boolean
  pedestrianInSensor: boolean
  timeRemaining: number
  onRequestCrossing: () => void
}

const stateLabels: Record<TrafficState, string> = {
  default: "Fluxo Normal",
  request: "Requisicao Enviada",
  validation: "Validacao Antifraude",
  transition: "Transicao",
  crossing: "Travessia Segura",
  ending: "Finalizando",
}

const stateDescriptions: Record<TrafficState, string> = {
  default:
    "Semaforo verde para veiculos. Arraste o pedestre e pressione o botao para solicitar travessia.",
  request: "Botao pressionado. Sensor ultrasonico ativado.",
  validation: "Verificando presenca real no sensor (3s)...",
  transition: "Semaforo mudando para vermelho. Veiculos desacelerando.",
  crossing: "Sinal aberto para pedestres. Ondas sonoras e vibracao ativas.",
  ending: "Tempo acabando. LED piscando com alertas acelerados.",
}

function LightIndicator({
  color,
  active,
  label,
}: {
  color: string
  active: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: active ? color : "rgba(0,0,0,0.1)",
          boxShadow: active ? `0 0 6px ${color}, 0 0 12px ${color}40` : "none",
        }}
      />
      <span
        className="font-mono text-[10px] uppercase tracking-wider"
        style={{ color: active ? "#1a1a1a" : "#999" }}
      >
        {label}
      </span>
    </div>
  )
}

export function Hud({
  state,
  carLight,
  pedestrianLight,
  sensorActive,
  pedestrianInSensor,
  timeRemaining,
  onRequestCrossing,
}: HudProps) {
  const stateColor =
    state === "crossing" || state === "ending"
      ? "#22c55e"
      : state === "transition"
        ? "#eab308"
        : state === "validation" || state === "request"
          ? "#3b82f6"
          : "#999"

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* Top left - status panel */}
      <div
        className="pointer-events-auto absolute top-5 left-5 w-72 rounded-xl border p-4"
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        {/* State header */}
        <div className="mb-2 flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: stateColor,
              boxShadow: `0 0 6px ${stateColor}`,
            }}
          />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: "#1a1a1a" }}>
            {stateLabels[state]}
          </span>
        </div>
        <p className="mb-3 font-mono text-[10px] leading-relaxed" style={{ color: "#666" }}>
          {stateDescriptions[state]}
        </p>

        {/* Light indicators */}
        <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <p className="mb-1 font-mono text-[9px] uppercase tracking-widest" style={{ color: "#999" }}>
              Veiculos
            </p>
            <LightIndicator color="#ef4444" active={carLight === "red"} label="Pare" />
            <LightIndicator color="#eab308" active={carLight === "yellow"} label="Atencao" />
            <LightIndicator color="#22c55e" active={carLight === "green"} label="Siga" />
          </div>
          <div>
            <p className="mb-1 font-mono text-[9px] uppercase tracking-widest" style={{ color: "#999" }}>
              Pedestre
            </p>
            <LightIndicator color="#ef4444" active={pedestrianLight === "red"} label="Pare" />
            <LightIndicator
              color="#22c55e"
              active={pedestrianLight === "green" || pedestrianLight === "blinking"}
              label={pedestrianLight === "blinking" ? "Alerta" : "Atravesse"}
            />
          </div>
        </div>

        {/* Sensor bar */}
        <div
          className="flex items-center gap-3 border-t pt-2"
          style={{ borderColor: "rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: sensorActive ? "#3b82f6" : "rgba(0,0,0,0.15)",
                boxShadow: sensorActive ? "0 0 4px #3b82f6" : "none",
              }}
            />
            <span className="font-mono text-[9px]" style={{ color: "#777" }}>
              SENSOR {sensorActive ? "ON" : "OFF"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: pedestrianInSensor ? "#22c55e" : "rgba(0,0,0,0.15)",
                boxShadow: pedestrianInSensor ? "0 0 4px #22c55e" : "none",
              }}
            />
            <span className="font-mono text-[9px]" style={{ color: "#777" }}>
              {pedestrianInSensor ? "DETECTADO" : "VAZIO"}
            </span>
          </div>
        </div>

        {timeRemaining > 0 && (
          <div
            className="mt-2 flex items-center justify-between border-t pt-2"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            <span className="font-mono text-[9px] uppercase" style={{ color: "#999" }}>
              Tempo
            </span>
            <span className="font-mono text-sm font-bold" style={{ color: "#1a1a1a" }}>
              {timeRemaining}s
            </span>
          </div>
        )}
      </div>

      {/* Bottom center - Crossing button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          className="pointer-events-auto rounded-xl border px-6 py-3 transition-all active:scale-95 disabled:opacity-30"
          style={{
            background:
              state === "default"
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(16px)",
            borderColor: state === "default" ? "rgba(245, 158, 11, 0.3)" : "rgba(0,0,0,0.06)",
          }}
          onClick={onRequestCrossing}
          disabled={state !== "default"}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="h-3 w-3 rounded-full border-2"
              style={{
                borderColor: state === "default" ? "#f59e0b" : "#ccc",
                backgroundColor:
                  state === "default" ? "rgba(245, 158, 11, 0.15)" : "transparent",
              }}
            />
            <span
              className="font-mono text-xs font-medium uppercase tracking-wider"
              style={{ color: state === "default" ? "#92400e" : "#999" }}
            >
              Solicitar Travessia
            </span>
          </div>
        </button>
      </div>

      {/* Top right - Instructions */}
      <div
        className="absolute top-5 right-5 max-w-52 rounded-xl border p-3"
        style={{
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest" style={{ color: "#999" }}>
          Controles
        </p>
        <ul className="space-y-0.5">
          {[
            "Arraste o pedestre com o mouse",
            "Clique no botao amarelo no poste",
            "O sensor verifica presenca real",
            "Orbite com botao direito",
          ].map((text, i) => (
            <li
              key={i}
              className="font-mono text-[10px] leading-relaxed"
              style={{ color: "#777" }}
            >
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
