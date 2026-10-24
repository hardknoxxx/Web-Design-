---
target: prototipo /nuevo.html (mesa giratoria)
total_score: 21
max_score: 32
na_heuristics: 5,9
p0_count: 0
p1_count: 2
target_identity: "file:/home/user/Web-Design-/lilium-house/src/nuevo/MesaGiratoria.tsx"
target_fingerprint: "sha256:552d81154a8453122cb4d18ea8c28384c45859069f4314e9aa3377abf74b4c10"
target_path: /home/user/Web-Design-/lilium-house/src/nuevo/MesaGiratoria.tsx
timestamp: 2026-10-24T19-43-26Z
slug: lilium-house-src-nuevo-mesagiratoria-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score: 21/32 (Nielsen, heuristics 5 and 9 n/a)
| # | Heuristic | Score |
|---|---|---|
| 1 | Visibility of system status | 3 |
| 2 | Match with the real world | 3 |
| 3 | User control and freedom | 2 |
| 4 | Consistency and standards | 3 |
| 5 | Error prevention | n/a |
| 6 | Recognition rather than recall | 3 |
| 7 | Flexibility and efficiency | 2 |
| 8 | Aesthetic and minimalist design | 3 |
| 9 | Error recovery | n/a |
| 10 | Help and documentation | 2 |

## Design specificity
Specific: plates that stay as line drawings and colour in, like the colouring place mats. Generic seam: the rotating rim text carried facts nobody can read. "Verde por dentro" was claimed but not shown.

## Priority issues
- [P1] Drag and arrow offsets persisted after scrolling, and the infinite wrap broke the morning-to-night order.
- [P1] Hours and address were about 2,700 px down on mobile, and the status pill hid the closing time.
- [P2] The rim text carried status and address while rotating behind the caption.
- [P2] No hint that the table can be turned; aria-live fired while scrolling; no keyboard arrows and no list of dishes.
- [P2] The WhatsApp button sat on almost the same green as its background.

## Detector
`impeccable detect`: 0 findings. The overlay flagged 2 low-contrast items (false positives: the text sits on the green disc, 5.2:1 and 8.4:1) and cream-palette (a brand choice: paper and place mat).

## Minor
Single-word widow in the mobile h1, an empty cream band on mobile, Unicode arrows, a hard-coded green dot, a 12.8 px uppercase eyebrow label.
