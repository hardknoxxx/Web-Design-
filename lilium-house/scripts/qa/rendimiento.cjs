// Rendimiento móvil de Lilium: carga + scroll completo + reposo en el hero.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const URL = process.argv[2] || 'https://lilium-house.vercel.app'
const OUT = path.join(__dirname, 'perf')
fs.mkdirSync(OUT, { recursive: true })

const PROFILES = [
  { name: 'sin-limite', cpu: 1, net: null },
  // Perfil "móvil" de Lighthouse: CPU 4x más lenta, 4G lento
  { name: 'gama-media', cpu: 4, net: { latency: 150, downloadThroughput: (1638.4 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 } },
]

const INIT = () => {
  window.__perf = { long: [], lcp: 0, cls: 0, fcp: 0 }
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__perf.long.push({ t: e.startTime, d: e.duration }))).observe({ type: 'longtask', buffered: true })
  new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__perf.lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true })
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__perf.cls += e.value })).observe({ type: 'layout-shift', buffered: true })
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.name === 'first-contentful-paint') window.__perf.fcp = e.startTime })).observe({ type: 'paint', buffered: true })
}

const stats = (dts) => {
  if (!dts.length) return null
  const s = [...dts].sort((a, b) => a - b)
  const total = dts.reduce((a, b) => a + b, 0)
  return {
    fps: +((dts.length * 1000) / total).toFixed(1),
    p50: +s[Math.floor(s.length * 0.5)].toFixed(1),
    p95: +s[Math.floor(s.length * 0.95)].toFixed(1),
    max: +s[s.length - 1].toFixed(1),
    jank: +((dts.filter((d) => d > 50).length / dts.length) * 100).toFixed(1), // % cuadros > 50 ms
  }
}

async function run(browser, prof) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    locale: 'es-AR',
  })
  await ctx.addInitScript(INIT)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Performance.enable')
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: prof.cpu })
  if (prof.net) {
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', { offline: false, ...prof.net })
  }

  const t0 = Date.now()
  await page.goto(URL, { waitUntil: 'load', timeout: 120000 })
  const loadMs = Date.now() - t0
  await page.waitForTimeout(3000)

  const load = await page.evaluate(() => {
    const res = performance.getEntriesByType('resource')
    const by = {}
    for (const r of res) {
      const ext = (r.name.split('?')[0].match(/\.(\w+)$/) || [, 'otro'])[1]
      by[ext] = (by[ext] || 0) + (r.transferSize || r.encodedBodySize || 0)
    }
    const nav = performance.getEntriesByType('navigation')[0]
    const p = window.__perf
    return {
      fcp: Math.round(p.fcp), lcp: Math.round(p.lcp), cls: +p.cls.toFixed(3),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      tbt: Math.round(p.long.reduce((a, l) => a + Math.max(0, l.d - 50), 0)),
      longTasks: p.long.length,
      kbPorTipo: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, Math.round(v / 1024)])),
      kbTotal: Math.round(Object.values(by).reduce((a, b) => a + b, 0) / 1024) + Math.round((nav.transferSize || 0) / 1024),
      pedidos: res.length,
      webgl: (() => { const c = document.createElement('canvas').getContext('webgl'); const d = c && c.getExtension('WEBGL_debug_renderer_info'); return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'n/d' })(),
    }
  })
  await page.screenshot({ path: path.join(OUT, `${prof.name}-hero.png`) })

  // Reposo en el hero (lirio 3D animándose)
  const idle = await page.evaluate(() => new Promise((res) => {
    const dts = []; let last = performance.now(); const end = last + 4000
    const f = (t) => { dts.push(t - last); last = t; t < end ? requestAnimationFrame(f) : res(dts.slice(1)) }
    requestAnimationFrame(f)
  }))

  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]))
  const longBefore = await page.evaluate(() => window.__perf.long.length)

  // Scroll de punta a punta a velocidad constante (como un dedo que lee: 900 px/s)
  const scroll = await page.evaluate(() => new Promise((res) => {
    const marks = [...document.querySelectorAll('[data-phase]')]
      .map((el) => ({ y: el.getBoundingClientRect().top + scrollY, h: el.dataset.phase.split('|')[2] }))
      .sort((a, b) => a.y - b.y)
    const maxY = document.documentElement.scrollHeight - innerHeight
    const speed = 0.9 // px/ms
    const frames = []
    let start = null, last = null
    const f = (t) => {
      if (start === null) { start = t; last = t; requestAnimationFrame(f); return }
      const y = Math.min(maxY, (t - start) * speed)
      window.scrollTo({ top: y, behavior: 'instant' })
      const sec = [...marks].reverse().find((m) => m.y <= y + innerHeight * 0.5)
      frames.push({ dt: t - last, y, s: sec ? sec.h : '08:00' })
      last = t
      if (y < maxY) requestAnimationFrame(f)
      else setTimeout(() => res({ frames, maxY, marks }), 500)
    }
    requestAnimationFrame(f)
  }))
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]))
  const longScroll = await page.evaluate((n) => window.__perf.long.slice(n), longBefore)
  await page.screenshot({ path: path.join(OUT, `${prof.name}-final.png`) })

  const porEscena = {}
  for (const fr of scroll.frames) (porEscena[fr.s] ||= []).push(fr.dt)
  const worst = [...scroll.frames].sort((a, b) => b.dt - a.dt).slice(0, 8).map((f) => ({ ms: Math.round(f.dt), y: Math.round(f.y), escena: f.s }))

  // Abrir el menú-hoja y medir la animación
  let menu = null
  try {
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(800)
    const btn = page.locator('button[aria-label*="menú" i], button[aria-label*="menu" i]').first()
    if (await btn.count()) {
      const p = page.evaluate(() => new Promise((res) => {
        const dts = []; let last = performance.now(); const end = last + 1500
        const f = (t) => { dts.push(t - last); last = t; t < end ? requestAnimationFrame(f) : res(dts.slice(1)) }
        requestAnimationFrame(f)
      }))
      await btn.tap()
      menu = stats(await p)
      await page.screenshot({ path: path.join(OUT, `${prof.name}-menu.png`) })
    }
  } catch (e) { menu = { error: e.message } }

  await ctx.close()
  return {
    perfil: prof.name, loadMs, load, errores: errors.slice(0, 5),
    reposoHero: stats(idle),
    scroll: {
      ...stats(scroll.frames.map((f) => f.dt)),
      segundos: +(scroll.frames.reduce((a, f) => a + f.dt, 0) / 1000).toFixed(1),
      alturaPx: scroll.maxY,
      longTasks: longScroll.length, tbt: Math.round(longScroll.reduce((a, l) => a + Math.max(0, l.d - 50), 0)),
      layouts: m1.LayoutCount - m0.LayoutCount, recalcEstilos: m1.RecalcStyleCount - m0.RecalcStyleCount,
      scriptSeg: +(m1.ScriptDuration - m0.ScriptDuration).toFixed(2), layoutSeg: +(m1.LayoutDuration - m0.LayoutDuration).toFixed(2),
      estiloSeg: +(m1.RecalcStyleDuration - m0.RecalcStyleDuration).toFixed(2), tareaSeg: +(m1.TaskDuration - m0.TaskDuration).toFixed(2),
      heapMB: +(m1.JSHeapUsedSize / 1048576).toFixed(1), nodos: m1.Nodes,
    },
    porEscena: Object.fromEntries(Object.entries(porEscena).map(([k, v]) => [k, stats(v)])),
    peoresCuadros: worst,
    menuHoja: menu,
  }
}

;(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
  const results = []
  for (const p of PROFILES) {
    const r = await run(browser, p)
    console.log(JSON.stringify(r, null, 1))
    results.push(r)
  }
  fs.writeFileSync(path.join(OUT, 'resultados.json'), JSON.stringify(results, null, 2))
  await browser.close()
})()
