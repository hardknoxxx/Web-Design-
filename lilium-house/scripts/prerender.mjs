// Inserta el HTML de la portada (generado con React en el build de servidor) y sus datos estructurados en dist/index.html.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const html = `${raiz}dist/index.html`
const servidor = `${raiz}dist-ssr/entry-server.js`

const { render, jsonLd } = await import(pathToFileURL(servidor).href)
let pagina = await readFile(html, 'utf8')

const vacio = '<div id="root"></div>'
if (!pagina.includes(vacio)) throw new Error('No se encontró <div id="root"></div> en dist/index.html')
pagina = pagina.replace(vacio, `<div id="root">${render()}</div>`)

const ld = /<script type="application\/ld\+json">[\s\S]*?<\/script>/
if (!ld.test(pagina)) throw new Error('No se encontró el bloque JSON-LD en dist/index.html')
pagina = pagina.replace(ld, `<script type="application/ld+json">${JSON.stringify(jsonLd())}</script>`)

await writeFile(html, pagina)
await rm(`${raiz}dist-ssr`, { recursive: true, force: true })
console.log('prerender: dist/index.html con la portada y el JSON-LD generados')
