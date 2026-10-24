import { useEffect, useState } from 'react'
import { HORARIO as SCHEDULE, hhmm as fmt } from '../data/site'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const DAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

/** `label` es la frase completa; `state` y `detail`, la versión corta del cartel de madera (dos líneas). */
export type OpenStatus = { open: boolean; label: string; state: string; detail: string }

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
    if (current) return { open: true, label: `Abierto ahora · cierra ${fmt(current[1])}`, state: 'Abierto', detail: `hasta ${fmt(current[1])}` }
    const later = slots.find(([start]) => minutes < start)
    if (later) return { open: false, label: `Cerrado · abre hoy ${fmt(later[0])}`, state: 'Cerrado', detail: `abre ${fmt(later[0])}` }
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = (day + offset) % 7
    if (SCHEDULE[next].length) {
      const when = offset === 1 ? 'mañana' : `el ${DAY_NAMES[next]}`
      const at = fmt(SCHEDULE[next][0][0])
      return { open: false, label: `Cerrado · abre ${when} ${at}`, state: 'Cerrado', detail: `${offset === 1 ? 'mañana' : DAY_SHORT[next]} ${at}` }
    }
  }
  return { open: false, label: 'Cerrado', state: 'Cerrado', detail: '' }
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
