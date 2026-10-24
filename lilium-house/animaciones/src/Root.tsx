import { Composition } from 'remotion'
import { z } from 'zod'
import { PapelComanda } from './PapelComanda'

export const papelSchema = z.object({ origenX: z.number(), origenY: z.number() })

/**
 * Animación de la comanda de Lilium, inspirada en la referencia del cliente (papel que se
 * desenvuelve). El menú-hoja de arriba ya no usa película: se abre con CSS (revelado radial).
 */
export const Root = () => (
  <>
    {/* comanda: la bolita se desenvuelve en su lugar, en stop-motion (papel 288×330, centro en 150,169) */}
    <Composition id="PapelComanda" component={PapelComanda} schema={papelSchema} defaultProps={{ origenX: 150, origenY: 169 }} durationInFrames={12} fps={12} width={300} height={420} />
  </>
)
