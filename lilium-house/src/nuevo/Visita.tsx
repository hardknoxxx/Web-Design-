import { useEffect, useRef, useState } from "react";
import { LilyMark, PhoneIcon } from "../components/Icons";
import { SITE, whatsappLink } from "../data/site";
import { useOpenStatus } from "../hooks/useOpenStatus";
import { reducido } from "./animar";
import { AVENIDA, CALLE, PARQUE, PIN, RIO, ROTULOS } from "./croquisDatos";
import { Estampilla } from "./Papeles";

/*
 * Visitanos (referencia: el mapa redibujado de Madie). Las calles reales de OpenStreetMap en la paleta, el horario con el día de
 * hoy marcado y las tres formas de llegar o avisar.
 * El croquis se anima con anime.js al entrar: las calles se dibujan, un punto recorre Av. Tres Fronteras hasta el local,
 * el lirio cae en su lugar y deja ondas, como un "estás acá".
 */

// el último tramo de Av. Tres Fronteras hasta la puerta (mismas coordenadas que AVENIDA)
const RECORRIDO =
  "M79 174L82 177L89 180L100 182L112 183L119 184L126 185L152 187L194 191L231 196L267 201L283 203L290 205";

function filaDeHoy() {
  const d = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "short",
  }).format(new Date());
  return d === "Sun" ? "Domingo" : d === "Mon" ? "Lunes" : "Mar a Sáb";
}

function Croquis() {
  const [px, py] = PIN;
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (reducido()) return;
    const anims: { pause: () => void }[] = [];
    let cancelado = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        // anime.js se baja recién cuando el mapa está por verse
        import("animejs").then(
          ({ animate, createDrawable, createMotionPath, stagger }) => {
            if (cancelado) return;
            // las calles se dibujan de a una
            anims.push(
              animate(createDrawable(el.querySelectorAll(".croquis-trazo")), {
                draw: ["0 0", "0 1"],
                duration: 1400,
                delay: stagger(140),
                ease: "inOutQuad",
              }),
            );
            // el recorrido punteado y el punto que viaja por la avenida hasta la puerta
            anims.push(
              animate(createDrawable(el.querySelector(".croquis-recorrido")!), {
                draw: ["0 0", "0 1"],
                duration: 1600,
                delay: 500,
                ease: "inOutSine",
              }),
            );
            anims.push(
              animate(el.querySelector(".croquis-viajero")!, {
                ...createMotionPath(
                  el.querySelector<SVGPathElement>(".croquis-recorrido")!,
                ),
                opacity: [0, 1],
                duration: 1600,
                delay: 500,
                ease: "inOutSine",
              }),
            );
            // el lirio cae con un rebote y después quedan las ondas
            anims.push(
              animate(el.querySelector(".croquis-pin")!, {
                y: [-46, 0],
                scale: [0.6, 1],
                opacity: [0, 1],
                duration: 900,
                delay: 1900,
                ease: "outElastic(1, .6)",
              }),
            );
            anims.push(
              animate(el.querySelectorAll(".croquis-onda"), {
                r: [22, 64],
                opacity: [0.55, 0],
                duration: 2400,
                delay: stagger(1200, { start: 2400 }),
                loop: true,
                ease: "outQuad",
              }),
            );
            anims.push(
              animate(
                el.querySelectorAll(
                  ".croquis-rotulo, .croquis-calle, .croquis-nombre",
                ),
                {
                  opacity: [0, 1],
                  duration: 600,
                  delay: stagger(60, { start: 1200 }),
                },
              ),
            );
          },
        );
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      cancelado = true;
      io.disconnect();
      for (const a of anims) a.pause();
    };
  }, []);
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 340"
      className="h-auto w-full overflow-hidden rounded-[1.25rem]"
      role="img"
      aria-label="Croquis: Lilium en Av. Tres Fronteras, casi esquina Entre Ríos, a unos 200 m de la Costanera"
    >
      <rect width="480" height="340" className="fill-laguna" />
      {/* el río Iguazú, al norte, detrás de la Costanera */}
      <path
        d={RIO}
        className="stroke-turquesa/45"
        strokeWidth="96"
        fill="none"
        strokeLinejoin="round"
      />
      <path d={PARQUE} className="fill-musgo/70" />
      <path
        d={CALLE}
        className="croquis-trazo stroke-laguna-deep"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={AVENIDA}
        className="croquis-trazo stroke-menta"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={RECORRIDO}
        className="croquis-recorrido stroke-lima"
        strokeWidth="3.5"
        strokeDasharray="1 9"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        className="croquis-viajero fill-lima"
        r="6"
        cx="0"
        cy="0"
        opacity="0"
      />
      <text
        x="408"
        y="24"
        textAnchor="middle"
        className="croquis-rotulo fill-crema"
      >
        Río Iguazú
      </text>
      {ROTULOS.map((r) => (
        <text
          key={r.t}
          x={r.x}
          y={r.y}
          transform={`rotate(${r.r} ${r.x} ${r.y})`}
          textAnchor="middle"
          dominantBaseline="middle"
          className={
            r.t.startsWith("Av.") || r.t === "Costanera"
              ? "croquis-calle fill-laguna-deep"
              : "croquis-rotulo fill-menta"
          }
        >
          {r.t}
        </text>
      ))}
      {/* Lilium */}
      <circle
        className="croquis-onda stroke-crema"
        cx={px}
        cy={py}
        r="22"
        fill="none"
        strokeWidth="2"
        opacity="0"
      />
      <circle
        className="croquis-onda stroke-crema"
        cx={px}
        cy={py}
        r="22"
        fill="none"
        strokeWidth="2"
        opacity="0"
      />
      <g transform={`translate(${px} ${py})`}>
        <g className="croquis-pin">
          <circle r="22" className="fill-crema" />
          <LilyMark
            x="-15"
            y="-15"
            width="30"
            height="30"
            className="text-laguna-deep"
          />
        </g>
      </g>
      <text
        x={px}
        y={py - 34}
        textAnchor="middle"
        className="croquis-nombre fill-crema"
      >
        Lilium
      </text>
    </svg>
  );
}

export function Visita() {
  const status = useOpenStatus();
  // el día de hoy se marca recién en el navegador (el HTML se genera al compilar)
  const [hoy, setHoy] = useState<string | null>(null);
  useEffect(() => setHoy(filaDeHoy()), []);

  return (
    <section
      id="visita"
      aria-labelledby="visita-titulo"
      className="relative overflow-hidden bg-laguna-deep px-4 pt-20 pb-24 text-crema md:px-7 md:pt-28 md:pb-32"
    >
      <div className="relative z-10 mx-auto grid max-w-5xl gap-14 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <h2
            id="visita-titulo"
            className="titulo-vitrina text-[3.4rem] leading-[0.88] md:text-[6.5rem]"
          >
            Te <span className="text-turquesa">esperamos</span>
          </h2>
          <p
            className="mt-5 flex items-center gap-2 font-elegante text-lg"
            data-open={status?.open ?? undefined}
          >
            <span aria-hidden="true" className="estado-punto" />
            {status?.label ?? "Martes a domingo"}
          </p>
          <p className="mt-3 text-lg text-menta">
            <a
              href={SITE.mapsHref}
              target="_blank"
              rel="noopener"
              className="enlace-animado"
            >
              {SITE.address}
            </a>
            <span className="block">{SITE.city}</span>
          </p>
          <ul className="mt-3 grid gap-1 text-lg text-crema">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener"
                className="enlace-animado"
              >
                WhatsApp {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={SITE.instagramHref}
                target="_blank"
                rel="noopener"
                className="enlace-animado"
              >
                @{SITE.instagram}
              </a>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={SITE.mapsHref}
              target="_blank"
              rel="noopener"
              className="pildora pildora-lima"
            >
              Cómo llegar
            </a>
            <a
              href={whatsappLink(
                "Hola Lilium! Quería reservar una mesa para … personas, el día … a las …",
              )}
              target="_blank"
              rel="noopener"
              className="pildora pildora-linea"
            >
              Reservar por WhatsApp
            </a>
            <a href={SITE.phoneHref} className="pildora pildora-linea">
              <PhoneIcon className="h-5 w-5" />
              Llamar
            </a>
          </div>

          <dl className="mt-12 grid gap-1 font-elegante text-lg">
            {SITE.hours.rows.map(([dia, hora]) => (
              <div
                key={dia}
                className="horario-fila"
                data-hoy={dia === hoy || undefined}
              >
                <dt className="font-semibold">
                  {dia}
                  {dia === hoy && (
                    <span className="ml-2 font-hand text-[1.3rem] font-normal text-menta">
                      hoy
                    </span>
                  )}
                </dt>
                <dd className="tabular-nums">{hora}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="relative self-start">
          <Estampilla className="visita-estampilla" color="#E6D7BC" giro={-8}>
            <span className="estampilla-lirio" aria-hidden="true">
              <LilyMark width="34" height="34" />
            </span>
            <span className="estampilla-lugar">Puerto Iguazú</span>
            <span className="estampilla-pie">Misiones · Tres Fronteras</span>
          </Estampilla>
          <Croquis />
          <figcaption className="mt-3 text-[0.95rem] text-menta">
            Casi esquina Entre Ríos, a unos 200 m de la Costanera. Mapa: ©
            colaboradores de OpenStreetMap.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
