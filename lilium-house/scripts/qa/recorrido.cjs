// Recorrido visual: carta, entrada de Visitanos (mancha) y cuaderno de campo, en 1440×900 y 390×844.
// Uso: npm run build && npx vite preview --port 4173 --strictPort; después, desde una carpeta temporal:
//   node <repo>/lilium-house/scripts/qa/recorrido.cjs   (deja las capturas en la carpeta actual)
const { chromium } = require('playwright')
;(async () => {
  const b = await chromium.launch()
  for (const [n, vp, mob] of [['d', { width: 1440, height: 900 }, false], ['m', { width: 390, height: 844 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob })
    const p = await ctx.newPage(); const errs = []
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    await p.goto('http://localhost:4173', { waitUntil: 'load' }); await p.waitForTimeout(2000)
    const top = (sel) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel)
    const ir = async (y, t = 1400) => { await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(t) }
    const yc = await top('#carta')
    await ir(yc); await p.screenshot({ path: `${n}-carta1.png` })
    await ir(yc + vp.height * 0.8); await p.screenshot({ path: `${n}-carta2.png` })
    const yv = await top('#visita')
    for (const f of [0.85, 0.55, 0.25]) { await ir(yv - vp.height * f, 900); await p.screenshot({ path: `${n}-visita-${f}.png` }) }
    await ir(yv + 10, 2000); await p.screenshot({ path: `${n}-visita-in.png` })
    const yr = await top('.cuaderno')
    await ir(yr - vp.height * 0.3, 300); await p.screenshot({ path: `${n}-cuaderno-a.png` })
    await p.waitForTimeout(3500); await p.screenshot({ path: `${n}-cuaderno-b.png` })
    await ir(1e6, 1500); await p.screenshot({ path: `${n}-fin.png` })
    console.log(n, 'errores', errs, 'desborde', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    await ctx.close()
  }
  await b.close()
})()
