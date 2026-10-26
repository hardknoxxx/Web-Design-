// Auditoría técnica: axe-core (WCAG 2.1 AA), objetivos táctiles, desborde, encabezados, foco y zoom de texto.
// Uso: node scripts/qa/accesibilidad.cjs con la vista previa en http://localhost:4173. Carga axe-core desde jsDelivr.
const { chromium } = require('playwright')
;(async () => {
  const b = await chromium.launch()
  for (const [n, vp, mob] of [['390', { width: 390, height: 844 }, true], ['768', { width: 768, height: 1024 }, true], ['1440', { width: 1440, height: 900 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob })
    const p = await ctx.newPage()
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    await p.goto('http://localhost:4173', { waitUntil: 'load' })
    await p.waitForTimeout(2000)
    // recorrer la página para que todo entre (animaciones de entrada terminadas)
    const h = await p.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < h; y += 400) await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y)
    await p.waitForTimeout(1500)
    await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await p.waitForTimeout(800)
    await p.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axe-core@4.10.3/axe.min.js' })
    const axe = await p.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } })
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ej: v.nodes.slice(0, 3).map((x) => x.target.join(' ') + ' :: ' + (x.failureSummary || '').split('\n').slice(1, 2).join('').slice(0, 110)) }))
    })
    const datos = await p.evaluate(() => {
      const chicos = [...document.querySelectorAll('a, button, [role=tab], input, select, textarea')]
        .filter((e) => {
          const r = e.getBoundingClientRect()
          const cs = getComputedStyle(e)
          return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !e.closest('[inert]') && (r.width < 44 || r.height < 44)
        })
        .map((e) => `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 24)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`)
      const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map((x) => x.tagName + ':' + (x.textContent || '').trim().slice(0, 26))
      return { desborde: document.documentElement.scrollWidth > innerWidth, chicos: [...new Set(chicos)].slice(0, 20), hs, imgsSinAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length }
    })
    console.log(`\n===== ${n}px  errores: ${JSON.stringify(errs)}`)
    console.log('axe:', JSON.stringify(axe, null, 1))
    console.log('desborde:', datos.desborde, '| imgs sin alt:', datos.imgsSinAlt)
    console.log('objetivos < 44px:', JSON.stringify(datos.chicos, null, 1))
    if (n === '1440') {
      console.log('encabezados:', datos.hs.join(' | '))
      // recorrido con teclado: los primeros 18 focos y si el foco se ve
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      const focos = []
      for (let k = 0; k < 18; k++) {
        await p.keyboard.press('Tab')
        focos.push(await p.evaluate(() => {
          const e = document.activeElement
          const cs = getComputedStyle(e)
          return `${e.tagName.toLowerCase()} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 20)}" outline:${cs.outlineStyle !== 'none' ? cs.outlineWidth : 'no'}`
        }))
      }
      console.log('teclado:', JSON.stringify(focos, null, 1))
      // flechas del teclado en la mesa
      const zoom = await (async () => {
        await p.evaluate(() => (document.documentElement.style.fontSize = '200%'))
        await p.waitForTimeout(300)
        return p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      })()
      console.log('desborde con texto al 200%:', zoom)
    }
    await ctx.close()
  }
  await b.close()
})()
