import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { body, clamp, colors, display, easeInOut, easeOut } from "./brand";
import { H30Logo } from "./Logo";
import {
  Backdrop,
  CornerMark,
  RubroIcon,
  SectionTag,
  Sticker,
  Tape,
  Words,
} from "./ui";

const headline: React.CSSProperties = {
  fontFamily: display,
  fontWeight: 600,
  fontSize: 104,
  lineHeight: 1.12,
  color: colors.text,
  letterSpacing: -1,
};

const support: React.CSSProperties = {
  fontFamily: body,
  fontWeight: 300,
  fontSize: 46,
  color: colors.muted,
};

const center: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

/* 1 · El logo se arma */
const IntroTagline: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [44, 64], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        fontFamily: display,
        fontWeight: 400,
        fontSize: 40,
        letterSpacing: 14,
        color: colors.text,
        marginTop: 56,
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [20, 0])}px`,
      }}
    >
      FERRETERÍAS EXPRESS
    </div>
  );
};

export const Intro: React.FC = () => (
  <Backdrop glowY="45%">
    <AbsoluteFill style={{ ...center, flexDirection: "column" }}>
      <H30Logo size={420} delay={4} />
      <IntroTagline />
    </AbsoluteFill>
  </Backdrop>
);

/* 2 · Gancho */
export const Hook: React.FC = () => (
  <Backdrop>
    <AbsoluteFill style={{ ...center, flexDirection: "column", gap: 10 }}>
      <Words text="¿Querés tener tu propia" style={{ ...support, fontSize: 56 }} />
      <Words
        text="*franquicia *ferretera?"
        delay={14}
        stagger={6}
        style={{ ...headline, fontSize: 150, fontWeight: 900 }}
      />
    </AbsoluteFill>
    <CornerMark />
  </Backdrop>
);

/* 3 · Qué es H30: cifras */
const Stat: React.FC<{ value: number; prefix?: string; label: string; delay: number }> = ({
  value,
  prefix = "",
  label,
  delay,
}) => {
  const frame = useCurrentFrame() - delay;
  const p = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        opacity: interpolate(frame, [0, 10], [0, 1], clamp),
        translate: `0px ${interpolate(frame, [0, 18], [30, 0], { ...clamp, easing: easeOut })}px`,
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontWeight: 900,
          fontSize: 150,
          color: colors.orange,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {prefix}
        {Math.round(value * p).toLocaleString("es-AR")}
      </div>
      <div
        style={{
          width: interpolate(frame, [10, 34], [0, 120], { ...clamp, easing: easeOut }),
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.gray,
        }}
      />
      <div style={{ ...support, fontSize: 40, color: colors.text, fontWeight: 400 }}>
        {label}
      </div>
    </div>
  );
};

export const QueEs: React.FC = () => (
  <Backdrop glow={0.7}>
    <AbsoluteFill style={{ padding: "110px 140px", flexDirection: "column" }}>
      <SectionTag>Qué es H30</SectionTag>
      <Words
        text="Ferreterías de *autoservicio"
        delay={8}
        style={{ ...headline, fontSize: 76, marginTop: 70 }}
      />
      <Words
        text="Construcción, remodelación y refacción, en todo el país."
        delay={22}
        stagger={2}
        style={{ ...support, marginTop: 24 }}
      />
      <div style={{ display: "flex", marginTop: 120 }}>
        <Stat value={25} label="puntos de venta" delay={40} />
        <Stat value={8} label="provincias" delay={52} />
        <Stat value={5000} prefix="+" label="productos" delay={64} />
      </div>
    </AbsoluteFill>
    <CornerMark />
  </Backdrop>
);

/* 4 · Autoservicio: los rubros */
export const Autoservicio: React.FC = () => (
  <Backdrop glow={0.8} glowY="70%">
    <AbsoluteFill style={{ padding: "110px 140px", flexDirection: "column", alignItems: "center" }}>
      <div style={{ alignSelf: "flex-start" }}>
        <SectionTag>Autoservicio</SectionTag>
      </div>
      <Words
        text="Tu cliente *entra, *elige y *se *lleva."
        delay={8}
        style={{ ...headline, fontSize: 78, marginTop: 40 }}
      />
      <Words
        text="Todo a la vista, ordenado por rubro y listo para resolver."
        delay={24}
        stagger={2}
        style={{ ...support, marginTop: 20 }}
      />
      <div style={{ display: "flex", gap: 70, marginTop: 100 }}>
        <RubroIcon file="buloneria" label="BULONERÍA" color={colors.buloneria} delay={44} />
        <RubroIcon file="herramientas" label="HERRAMIENTAS" color={colors.herramientas} delay={52} />
        <RubroIcon file="plomeria" label="PLOMERÍA" color={colors.plomeria} delay={60} />
        <RubroIcon file="electricidad" label="ELECTRICIDAD" color={colors.electricidad} delay={68} />
        <RubroIcon file="seguridad" label="SEGURIDAD" color={colors.seguridad} delay={76} />
      </div>
    </AbsoluteFill>
  </Backdrop>
);

/* 5 · Cómo funciona: checklist estilo "nos encargamos del resto" */
const Step: React.FC<{ n: number; title: string; delay: number; doneAt: number }> = ({
  n,
  title,
  delay,
  doneAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = interpolate(frame - delay, [0, 16], [0, 1], { ...clamp, easing: easeOut });
  const done = frame >= doneAt;
  const check = spring({ frame: frame - doneAt, fps, config: { damping: 12 } });
  const spin = (frame * 12) % 360;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 34,
        padding: "26px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        opacity: inP,
        translate: `${interpolate(inP, [0, 1], [-30, 0])}px 0px`,
      }}
    >
      <div style={{ fontFamily: display, fontSize: 30, color: colors.grayLight, width: 40 }}>
        {n}
      </div>
      <div style={{ flex: 1, fontFamily: body, fontWeight: 700, fontSize: 44, color: colors.text }}>
        {title}
      </div>
      <div
        style={{
          fontFamily: body,
          fontSize: 32,
          color: done ? colors.orange : colors.muted,
          display: "flex",
          alignItems: "center",
          gap: 16,
          width: 230,
          justifyContent: "flex-end",
        }}
      >
        {done ? "listo" : "en curso"}
        {done ? (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: colors.orange,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: check,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M4 12.5l5 5L20 6.5"
                fill="none"
                stroke={colors.white}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `4px solid ${colors.gray}`,
              borderTopColor: colors.muted,
              rotate: `${spin}deg`,
              margin: 3,
            }}
          />
        )}
      </div>
    </div>
  );
};

export const ComoFunciona: React.FC = () => (
  <Backdrop glow={0.5}>
    <AbsoluteFill style={{ padding: "110px 140px", flexDirection: "column" }}>
      <SectionTag>Cómo funciona la franquicia</SectionTag>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 50 }}>
        <Words text="Vos abrís tu local." style={{ ...support, fontSize: 52, color: colors.text }} />
        <Words
          text="Nosotros hacemos *el *resto."
          delay={16}
          style={{ ...headline, fontSize: 76, marginTop: 8 }}
        />
      </div>
      <div style={{ width: 1380, alignSelf: "center", marginTop: 60 }}>
        <Step n={1} title="Imagen H30: marquesina, góndolas y cartelería" delay={40} doneAt={90} />
        <Step n={2} title="Abastecimiento de tu local al 100%" delay={50} doneAt={120} />
        <Step n={3} title="Más de 5.000 productos de primeras marcas" delay={60} doneAt={150} />
        <Step n={4} title="Mejores precios y entregas más rápidas" delay={70} doneAt={180} />
      </div>
    </AbsoluteFill>
  </Backdrop>
);

/* 6 · Respaldo de marcas */
const BRANDS = ["Fischer", "Famiq", "Bremen", "Sistelectric", "Epuyén", "Grupo Dema"];

const BrandRow: React.FC = () => {
  const frame = useCurrentFrame();
  const row = [...BRANDS, ...BRANDS, ...BRANDS];
  return (
    <div
      style={{
        display: "flex",
        gap: 28,
        translate: `${-frame * 4}px 0px`,
        maskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
      }}
    >
      {row.map((b, i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            fontFamily: display,
            fontWeight: 600,
            fontSize: 44,
            color: colors.text,
            padding: "28px 52px",
            borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.12)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          {b}
        </div>
      ))}
    </div>
  );
};

export const Marcas: React.FC = () => (
  <Backdrop glow={0.6}>
    <AbsoluteFill style={{ padding: "110px 0", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 110, left: 140 }}>
        <SectionTag>Respaldo</SectionTag>
      </div>
      <Words
        text="Trabajás con *marcas *líderes"
        delay={8}
        style={{ ...headline, fontSize: 92 }}
      />
      <Words
        text="Especialistas en bulonería, plomería, electricidad y herramientas."
        delay={22}
        stagger={2}
        style={{ ...support, marginTop: 20 }}
      />
      <div style={{ marginTop: 110 }}>
        <BrandRow />
      </div>
    </AbsoluteFill>
  </Backdrop>
);

/* 7 · Slogan con cintas */
const SloganInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slap = spring({ frame: frame - 18, fps, config: { damping: 11, stiffness: 160 } });
  const tapeIn = (d: number) => interpolate(frame - d, [0, 18], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <>
      <Tape
        offset={-frame * 3}
        style={{
          width: 2600,
          left: -340,
          top: 250,
          rotate: "-8deg",
          clipPath: `inset(0 ${100 - tapeIn(0) * 100}% 0 0)`,
        }}
      />
      <Tape
        color={colors.gray}
        offset={frame * 3 - 400}
        style={{
          width: 2600,
          left: -340,
          top: 760,
          rotate: "5deg",
          clipPath: `inset(0 0 0 ${100 - tapeIn(6) * 100}%)`,
        }}
      />
      <AbsoluteFill style={center}>
        <div
          style={{
            scale: interpolate(slap, [0, 1], [2.4, 1]),
            opacity: interpolate(slap, [0, 0.2], [0, 1], clamp),
          }}
        >
          <Sticker scale={1.5} />
        </div>
      </AbsoluteFill>
    </>
  );
};

export const Slogan: React.FC = () => (
  <Backdrop glow={1.2} glowY="50%">
    <SloganInner />
  </Backdrop>
);

/* 8 · Cierre */
const OutroText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = spring({ frame: frame - 62, fps, config: { damping: 14 } });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
      <Words text="Tu propia" delay={22} style={{ ...support, fontSize: 52, color: colors.text }} />
      <Words
        text="*franquicia ferretera"
        delay={30}
        style={{ ...headline, fontSize: 80, fontWeight: 900, justifyContent: "flex-start" }}
      />
      <div
        style={{
          marginTop: 40,
          scale: btn,
          fontFamily: display,
          fontWeight: 600,
          fontSize: 36,
          color: colors.white,
          backgroundColor: colors.orange,
          padding: "26px 54px",
          borderRadius: 999,
          transformOrigin: "left center",
          boxShadow: `0 0 ${interpolate(Math.sin(frame / 8), [-1, 1], [20, 50])}px rgba(240,130,36,0.45)`,
        }}
      >
        ¡Conocé más!
      </div>
    </div>
  );
};

export const Outro: React.FC = () => (
  <Backdrop glow={1} glowY="50%">
    <AbsoluteFill style={{ ...center, flexDirection: "row", gap: 90, textAlign: "left" }}>
      <H30Logo size={380} />
      <OutroText />
    </AbsoluteFill>
  </Backdrop>
);
