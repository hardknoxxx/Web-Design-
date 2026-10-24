Fuente: https://github.com/Leonxlnx/taste-skill (skills/taste-skill, nombre del skill: design-taste-frontend)
Commit auditado: 6010f91a9935f1c167dfc500fb1a475681892e6b (2026-10-20)
Auditoría: sin eval ni envío de datos. Scripts de Node que corren solo al usarse el skill:
- scripts/assets.mjs busca y descarga imágenes de dominio público (Openverse, Wikimedia, AIC, Met, archive.org, NASA)
- scripts/draw.mjs guarda historial en ~/.taste-skill/history.json
- scripts/inspect.mjs / lib/cdp.mjs abren un Chrome local headless para inspeccionar la página
MIT.
