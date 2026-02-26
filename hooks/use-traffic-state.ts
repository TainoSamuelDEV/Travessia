import { useState, useCallback, useRef, useEffect } from "react"

export type TrafficState =
  | "default"        // Estado 1: Carros verde, pedestres vermelho
  | "request"        // Estado 2: Botao pressionado, sensor ativado
  | "validation"     // Estado 3: Checando pedestre no sensor
  | "transition"     // Estado 4: Amarelo -> Vermelho para carros
  | "crossing"       // Estado 5: Pedestre pode atravessar
  | "ending"         // Estado 6: Tempo acabando, alerta

export interface TrafficStateData {
  state: TrafficState
  carLight: "green" | "yellow" | "red"
  pedestrianLight: "red" | "green" | "blinking"
  sensorActive: boolean
  soundWaves: boolean
  soundWavesFast: boolean
  vibration: boolean
  pedestrianInSensor: boolean
  timeRemaining: number
}

export function useTrafficState() {
  const [state, setState] = useState<TrafficState>("default")
  const [pedestrianInSensor, setPedestrianInSensor] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (validationTimerRef.current) clearTimeout(validationTimerRef.current)
  }, [])

  const resetToDefault = useCallback(() => {
    clearAllTimers()
    setState("default")
    setTimeRemaining(0)
  }, [clearAllTimers])

  const requestCrossing = useCallback(() => {
    if (state !== "default") return
    setState("request")
    // Move to validation after a brief moment
    timerRef.current = setTimeout(() => {
      setState("validation")
    }, 500)
  }, [state])

  // Validation: check if pedestrian stays in sensor for 3 seconds
  useEffect(() => {
    if (state === "validation") {
      if (pedestrianInSensor) {
        validationTimerRef.current = setTimeout(() => {
          // Pedestrian stayed 3 seconds -> transition
          setState("transition")
        }, 3000)
      } else {
        // No pedestrian in sensor, cancel after a moment
        validationTimerRef.current = setTimeout(() => {
          resetToDefault()
        }, 2000)
      }
      return () => {
        if (validationTimerRef.current) clearTimeout(validationTimerRef.current)
      }
    }
  }, [state, pedestrianInSensor, resetToDefault])

  // Cancel if pedestrian leaves sensor during validation
  useEffect(() => {
    if (state === "validation" && !pedestrianInSensor) {
      if (validationTimerRef.current) clearTimeout(validationTimerRef.current)
      validationTimerRef.current = setTimeout(() => {
        resetToDefault()
      }, 1000)
    }
  }, [state, pedestrianInSensor, resetToDefault])

  // Transition: yellow 2s -> red -> crossing
  useEffect(() => {
    if (state === "transition") {
      timerRef.current = setTimeout(() => {
        setState("crossing")
        setTimeRemaining(5)
      }, 2000)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [state])

  // Crossing: 5 seconds countdown
  useEffect(() => {
    if (state === "crossing") {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setState("ending")
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [state])

  // Ending: blink for 3 seconds then reset
  useEffect(() => {
    if (state === "ending") {
      setTimeRemaining(3)
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            resetToDefault()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [state, resetToDefault])

  const getStateData = useCallback((): TrafficStateData => {
    const carLight: TrafficStateData["carLight"] =
      state === "transition" ? "yellow" :
      state === "crossing" || state === "ending" ? "red" : "green"

    const pedestrianLight: TrafficStateData["pedestrianLight"] =
      state === "crossing" ? "green" :
      state === "ending" ? "blinking" : "red"

    return {
      state,
      carLight,
      pedestrianLight,
      sensorActive: state === "request" || state === "validation",
      soundWaves: state === "crossing" || state === "ending",
      soundWavesFast: state === "ending",
      vibration: state === "crossing" || state === "ending",
      pedestrianInSensor,
      timeRemaining,
    }
  }, [state, pedestrianInSensor, timeRemaining])

  return {
    ...getStateData(),
    requestCrossing,
    setPedestrianInSensor,
    resetToDefault,
  }
}
