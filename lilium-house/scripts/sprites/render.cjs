// Uso: node scripts/sprites/render.cjs <url del servidor de vite> <carpeta de salida> [cuadros] [ancho] [alto]
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
;(async () => {
  const [url, out, n = '36', w = '640', h = '480'] = process.argv.slice(2)
  fs.mkdirSync(out, { recursive: true })
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-gl=angle'] })
  const p = await b.newPage()
  p.setDefaultTimeout(0)
  p.on('pageerror', (e) => console.error('pageerror', e.message))
  await p.goto(url + '/scripts/sprites/render.html', { waitUntil: 'load' })
  await p.waitForFunction(() => window.ids)
  const ids = process.env.IDS ? process.env.IDS.split(',') : await p.evaluate(() => window.ids)
  const meta = {}
  for (const id of ids) {
    const t0 = Date.now()
    const r = await p.evaluate(([id, n, w, h]) => window.renderPlato(id, n, w, h), [id, +n, +w, +h])
    r.urls.forEach((u, i) => fs.writeFileSync(path.join(out, `${id}-${String(i).padStart(2, '0')}.png`), Buffer.from(u.split(',')[1], 'base64')))
    meta[id] = r.centro
    console.log(id, r.urls.length, 'cuadros', ((Date.now() - t0) / 1000).toFixed(1) + 's', JSON.stringify(r.centro))
  }
  fs.writeFileSync(path.join(out, 'centro.json'), JSON.stringify(meta, null, 1))
  await b.close()
})()
