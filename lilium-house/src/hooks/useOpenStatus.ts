import { useEffect, useState } from 'react'

// Martes (2) a Domingo (0); lunes cerrado.
const OPEN_DAYS = new Set([0, 2, 3, 4, 5, 6])
const SLOTS: [number, number][] = [
  [8 * 60, 12 * 60],
  [17 * 60, 21 * 60],
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export type OpenStatus = { open: boolean; label: string }

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

function argentinaNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0'
  return { day: WEEKDAYS.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export function computeOpenStatus(day: number, minutes: number): OpenStatus {
  if (OPEN_DAYS.has(day)) {
    const current = SLOTS.find(([start, end]) => minutes >= start && minutes < end)
    if (current) return { open: true, label: `Abierto ahora · cierra ${fmt(current[1])}` }
    const later = SLOTS.find(([start]) => minutes < start)
    if (later) return { open: false, label: `Cerrado · abre hoy ${fmt(later[0])}` }
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = (day + offset) % 7
    if (OPEN_DAYS.has(next)) {
      const when = offset === 1 ? 'mañana' : `el ${DAY_NAMES[next]}`
      return { open: false, label: `Cerrado · abre ${when} ${fmt(SLOTS[0][0])}` }
    }
  }
  return { open: false, label: 'Cerrado' }
}

export function useOpenStatus(): OpenStatus | null {
  const [status, setStatus] = useState<OpenStatus | null>(null)
  useEffect(() => {
    const update = () => {
      const { day, minutes } = argentinaNow()
      setStatus(computeOpenStatus(day, minutes))
    }
    update()
    const id = window.setInterval(update, 60_000)
    return () => window.clearInterval(id)
  }, [])
  return status
}
