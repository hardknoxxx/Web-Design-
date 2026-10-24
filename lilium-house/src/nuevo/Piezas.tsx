import type { CSSProperties, ReactNode } from 'react'
import type { OpenStatus } from '../hooks/useOpenStatus'

/*
 * Piezas gráficas de la vitrina (dirección A, referencia LATTE): la cinta que corre cruzada, el sticker de
 * borde ondulado, la mancha ondulada que va detrás de las fotos y la píldora de estado del local.
 */

/** Contorno ondulado alrededor de una elipse: `k` ondas de amplitud `a` (0–1). viewBox -100 -100 200 200. */
function ondulado(k: number, a: number, rx = 96, ry = 96) {
  const n = k * 8
  let d = ''
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    const r = 1 - a + a * Math.cos(k * t)
    const x = Math.cos(t) * rx * r
    const y = Math.sin(t) * ry * r
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d + 'Z'
}

/** Cinta que cruza la página con un texto que corre sin fin (se queda quieta con movimiento reducido). */
export function Cinta({ items, className = '', inversa = false }: { items: string[]; className?: string; inversa?: boolean }) {
  const linea = items.flatMap((t) => [t, '✦'])
  return (
    <div className={`cinta ${className}`} data-inversa={inversa || undefined} aria-hidden="true">
      <div className="cinta-pista">
        {[0, 1].map((copia) => (
          <span key={copia} className="cinta-tramo">
            {linea.map((t, i) => (
              <span key={i} className={t === '✦' ? 'cinta-estrella' : undefined}>
                {t}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Sticker de borde ondulado, girado, con texto corto a mano. */
export function Sticker({ children, className = '', color = 'var(--color-menta)', giro = -8 }: { children: ReactNode; className?: string; color?: string; giro?: number }) {
  return (
    <div className={`sticker ${className}`} style={{ rotate: `${giro}deg` } as CSSProperties}>
      <svg viewBox="-100 -100 200 200" preserveAspectRatio="none" className="sticker-fondo" aria-hidden="true">
        <path d={ondulado(14, 0.06, 98, 94)} fill={color} />
      </svg>
      <span className="relative">{children}</span>
    </div>
  )
}

/** Mancha ondulada de color que va detrás de una foto o un plato. */
export function Mancha({ className = '', color, ondas = 9, amplitud = 0.07 }: { className?: string; color: string; ondas?: number; amplitud?: number }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true">
      <path d={ondulado(ondas, amplitud)} fill={color} />
    </svg>
  )
}

/** Estado del local en una píldora: punto (verde si está abierto) y la próxima hora que importa. */
export function Estado({ status, className = '' }: { status: OpenStatus | null; className?: string }) {
  return (
    <a href="#visita" className={`estado ${className}`} data-open={status?.open ?? undefined}>
      <span aria-hidden="true" className="estado-punto" />
      {status ? (
        <span>
          <span className="font-semibold">{status.state}</span> {status.detail}
        </span>
      ) : (
        'Horario'
      )}
    </a>
  )
}
