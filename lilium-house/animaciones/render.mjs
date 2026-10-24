// Renderiza los cuadros de la comanda (1,5x) para armar el sprite del sitio.
import { execFileSync } from 'node:child_process'

const browser = process.env.REMOTION_BROWSER // opcional: ruta a chrome-headless-shell
for (const [id, dir] of [['PapelComanda', 'out/papel']]) {
  const args = ['remotion', 'render', 'src/index.ts', id, dir, '--sequence', '--image-format=png', '--scale=1.5']
  if (browser) args.push(`--browser-executable=${browser}`)
  execFileSync('npx', args, { stdio: 'inherit' })
}
