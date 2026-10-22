import { m } from 'framer-motion'
import { whatsappLink } from '../data/site'
import { WhatsAppIcon } from './Icons'

export function WhatsAppButton() {
  return (
    <m.a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 1.2 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="group fixed right-4 z-50 flex items-center gap-2 rounded-full bg-turquesa p-4 text-white shadow-[0_14px_32px_-8px_rgb(0_168_150/0.75)] sm:right-6 sm:pr-6"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-turquesa/40 [animation-duration:2.5s]" />
      <WhatsAppIcon className="h-7 w-7" />
      <span className="hidden text-base font-semibold text-hierro sm:inline">WhatsApp</span>
    </m.a>
  )
}
