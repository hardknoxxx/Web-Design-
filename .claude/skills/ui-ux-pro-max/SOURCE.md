Fuente: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (.claude/skills/ui-ux-pro-max)
Commit auditado: d14efff8ed1faa4187f004f79926f428c8074ec7 (2026-10-23). MIT.
Auditoría: SKILL.md y referencias en Markdown sin instrucciones ocultas; datos en CSV/JSON locales.
Scripts de Python (stdlib, sin dependencias): search.py busca en los CSV locales; no usan red, subprocesos ni eval.
Solo escriben archivos con --persist (design-system/<proyecto>/MASTER.md en --output-dir). Sin hooks ni binarios.
Instalado copiando la carpeta del skill (sin los tests), no con el CLI uipro ni el marketplace.
Uso: python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --domain <dominio>
