import { LilyMark } from './Icons'

const ITEMS = ['Coffee Lounge', 'Café de especialidad', 'Chipa casera', 'Pastelería', 'Manteles para colorear', 'Bed & Breakfast']

export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center gap-6 px-6 font-display text-xl text-crema italic sm:text-2xl">
          {item}
          <LilyMark className="h-5 w-5 text-rosa" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="wood-grain relative overflow-hidden py-4" role="presentation">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
