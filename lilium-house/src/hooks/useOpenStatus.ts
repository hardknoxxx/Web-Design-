import { useEffect, useState } from 'react'

// Martes a sábado corrido; domingo mañana y tarde; lunes cerrado.
const FULL: [number, number][] = [[8 * 60, 21 * 60]]
const SPLIT: [number, number][] = [
  [8 * 60, 12 * 60],
  [17 * 60, 21 * 60],
]
const SCHEDULE: [number, number][][] = [SPLIT, [], FULL, FULL, FULL, FULL, FULL]
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
  const slots = SCHEDULE[day]
  if (slots.length) {
    const current = slots.find(([start, end]) => minutes >= start && minutes < end)
    if (current) return { open: true, label: `Abierto ahora · cierra ${fmt(current[1])}` }
    const later = slots.find(([start]) => minutes < start)
    if (later) return { open: false, label: `Cerrado · abre hoy ${fmt(later[0])}` }
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = (day + offset) % 7
    if (SCHEDULE[next].length) {
      const when = offset === 1 ? 'mañana' : `el ${DAY_NAMES[next]}`
      return { open: false, label: `Cerrado · abre ${when} ${fmt(SCHEDULE[next][0][0])}` }
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
