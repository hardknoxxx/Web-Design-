import { Composition } from 'remotion'
import { z } from 'zod'
import { HojaMenu } from './HojaMenu'
import { PapelComanda } from './PapelComanda'

export const hojaSchema = z.object({ width: z.number(), height: z.number() })
export const papelSchema = z.object({ cupX: z.number(), cupY: z.number() })

/** Animaciones de los menús de Lilium, inspiradas en las referencias del cliente (planta y papel). */
export const Root = () => (
  <>
    {/* menú de arriba: una hoja nueva que brota enrollada y se desenrolla (panel 340×562) */}
    <Composition id="HojaMenu" component={HojaMenu} schema={hojaSchema} defaultProps={{ width: 340, height: 562 }} durationInFrames={20} fps={24} width={340} height={562} />
    {/* comanda: la bola de papel nace en la taza y se desenvuelve en stop-motion (papel 288×330) */}
    <Composition id="PapelComanda" component={PapelComanda} schema={papelSchema} defaultProps={{ cupX: 246, cupY: 378 }} durationInFrames={12} fps={12} width={300} height={420} />
  </>
)
