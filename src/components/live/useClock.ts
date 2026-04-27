'use client'

// ===========================================================================
// Amplify Hub · useClock — fonte única de "agora" para countdowns
// ===========================================================================
// `useSyncExternalStore` é a forma idiomática de subscrever o React a um
// valor externo que muda com o tempo (no caso, o relógio). Usar
// `useState + setInterval + setState` viola react-hooks/set-state-in-effect
// (cascading renders) e força um interval por componente — aqui temos um
// único interval global que só roda enquanto há pelo menos um subscriber.
//
// SSR: getServerSnapshot retorna 0 para que o componente saiba que não tem
// um "agora" real ainda; deve renderizar um placeholder estável até o
// hidrate disparar o subscribe.
// ===========================================================================

import { useSyncExternalStore } from 'react'

type Clock = {
  subscribe: (fn: () => void) => () => void
  getSnapshot: () => number
  getServerSnapshot: () => number
}

function createClock(intervalMs: number): Clock {
  const subscribers = new Set<() => void>()
  let timer: ReturnType<typeof setInterval> | null = null

  function subscribe(fn: () => void) {
    subscribers.add(fn)
    if (timer === null && typeof window !== 'undefined') {
      timer = setInterval(() => {
        for (const s of subscribers) s()
      }, intervalMs)
    }
    return () => {
      subscribers.delete(fn)
      if (subscribers.size === 0 && timer !== null) {
        clearInterval(timer)
        timer = null
      }
    }
  }

  function getSnapshot() {
    return Date.now()
  }

  function getServerSnapshot() {
    return 0
  }

  return { subscribe, getSnapshot, getServerSnapshot }
}

const secondClock = createClock(1000)
const fifteenSecondClock = createClock(15_000)

export function useNowMsEverySecond(): number {
  return useSyncExternalStore(
    secondClock.subscribe,
    secondClock.getSnapshot,
    secondClock.getServerSnapshot,
  )
}

export function useNowMsEvery15s(): number {
  return useSyncExternalStore(
    fifteenSecondClock.subscribe,
    fifteenSecondClock.getSnapshot,
    fifteenSecondClock.getServerSnapshot,
  )
}
