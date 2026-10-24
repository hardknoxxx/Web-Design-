import { useEffect, useRef } from 'react'
import { createLily } from './lily'

/**
 * Lirio 3D interactivo del hero. React solo monta y desmonta: la escena, el bucle de render y
 * los gestos viven en `lily.ts` (three.js puro), así React no participa de ningún cuadro.
 *
 * La caja (`hitArea`) es la que recibe los gestos y deja pasar el scroll vertical; el canvas es
 * 1,5 veces más alto que la caja (el tallo baja hasta perderse detrás del pasto) y no captura
 * ningún evento, así no tapa nada de lo que haya debajo.
 */
export default function LilyCanvas({ onReady }: { onReady?: () => void }) {
  const hitRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const readyRef = useRef(onReady)
  readyRef.current = onReady

  useEffect(() => {
    const lily = createLily({ hitArea: hitRef.current!, container: stageRef.current!, onReady: () => readyRef.current?.() })
    return () => lily.dispose()
  }, [])

  return (
    <div
      ref={hitRef}
      role="img"
      aria-label="Flor de lirio 3D interactiva: arrastrá para girarla o tocala para que te salude"
      className="relative h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
    >
      <div ref={stageRef} className="pointer-events-none absolute inset-x-0 top-0 h-[150%]" />
    </div>
  )
}
