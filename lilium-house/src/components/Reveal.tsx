import { m, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { LilyMark } from './Icons'

export const EASE = [0.22, 1, 0.36, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

type RevealProps = { children: ReactNode; className?: string; delay?: number; y?: number }

/** Aparición suave al entrar en viewport (una sola vez). */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </m.div>
  )
}

type HeadingProps = {
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
  tone?: 'light' | 'dark'
  align?: 'center' | 'left'
}

export function SectionHeading({ eyebrow, title, intro, tone = 'light', align = 'center' }: HeadingProps) {
  const dark = tone === 'dark'
  const center = align === 'center'
  return (
    <m.header
      className={`mb-12 max-w-2xl md:mb-16 ${center ? 'mx-auto text-center' : ''}`}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      <m.p variants={fadeUp} className={`eyebrow ${dark ? 'text-mostaza' : 'text-rosa'}`}>
        <span className={`h-px w-8 ${dark ? 'bg-mostaza/60' : 'bg-rosa/60'}`} />
        {eyebrow}
        <span className={`h-px w-8 ${dark ? 'bg-mostaza/60' : 'bg-rosa/60'} ${center ? '' : 'hidden'}`} />
      </m.p>
      <m.h2
        variants={fadeUp}
        className={`mt-4 font-display text-4xl leading-[1.05] font-medium text-balance sm:text-5xl md:text-6xl ${
          dark ? 'text-crema' : 'text-madera'
        }`}
      >
        {title}
      </m.h2>
      <m.div variants={fadeUp} className={`mt-5 flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
        <span className={`h-px w-12 ${dark ? 'bg-crema/30' : 'bg-madera/25'}`} />
        <LilyMark className="h-5 w-5 text-rosa" />
        <span className={`h-px w-12 ${dark ? 'bg-crema/30' : 'bg-madera/25'}`} />
      </m.div>
      {intro && (
        <m.p
          variants={fadeUp}
          className={`mt-5 text-lg leading-relaxed text-pretty ${dark ? 'text-crema/75' : 'text-madera/75'}`}
        >
          {intro}
        </m.p>
      )}
    </m.header>
  )
}
