import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { body, clamp, colors, display, easeOut } from "./brand";
import { H30Wordmark } from "./Logo";

/** Fondo oscuro con resplandor naranja y la grilla de 1 cm del manual. */
export const Backdrop: React.FC<{
  glow?: number;
  glowY?: string;
  children?: React.ReactNode;
}> = ({ glow = 1, glowY = "55%", children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 60% at 50% ${glowY}, rgba(240,130,36,${0.16 * glow}) 0%, rgba(240,130,36,0) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          backgroundPosition: `${frame * 0.25}px ${frame * 0.15}px`,
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 85%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

/** Línea naranja vertical + sección, como los encabezados del manual. */
export const SectionTag: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame() - delay;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, height: 56 }}>
      <div
        style={{
          width: 5,
          height: 56,
          backgroundColor: colors.orange,
          borderRadius: 3,
          scale: `1 ${interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: easeOut })}`,
          transformOrigin: "top",
        }}
      />
      <div
        style={{
          fontFamily: display,
          fontWeight: 400,
          fontSize: 30,
          letterSpacing: 1,
          color: colors.muted,
          opacity: interpolate(frame, [6, 20], [0, 1], clamp),
          translate: `${interpolate(frame, [6, 20], [-16, 0], { ...clamp, easing: easeOut })}px 0px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Palabras que suben con desenfoque, una tras otra. Las palabras con * van en naranja. */
export const Words: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  accent?: string;
}> = ({ text, delay = 0, stagger = 4, style, accent = colors.orange }) => {
  const frame = useCurrentFrame() - delay;
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: "0.28em",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const f = frame - i * stagger;
        const hot = w.startsWith("*");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: hot ? accent : undefined,
              opacity: interpolate(f, [0, 12], [0, 1], clamp),
              translate: `0px ${interpolate(f, [0, 16], [36, 0], { ...clamp, easing: easeOut })}px`,
              filter: `blur(${interpolate(f, [0, 12], [10, 0], clamp)}px)`,
            }}
          >
            {hot ? w.slice(1) : w}
          </span>
        );
      })}
    </div>
  );
};

/** Ícono circular de rubro (del manual), con etiqueta de color del Squad. */
export const RubroIcon: React.FC<{
  file: string;
  label: string;
  color: string;
  delay: number;
  size?: number;
}> = ({ file, label, color, delay, size = 210 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 120 } });
  const lbl = interpolate(frame - delay, [10, 24], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          scale: p,
          rotate: `${interpolate(p, [0, 1], [-25, 0])}deg`,
          boxShadow: `0 0 0 ${interpolate(lbl, [0, 1], [0, 8])}px ${color}`,
        }}
      >
        <Img src={staticFile(`icons/${file}.svg`)} style={{ width: size, height: size }} />
      </div>
      <div
        style={{
          fontFamily: display,
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: 1,
          color: colors.text,
          opacity: lbl,
          translate: `0px ${interpolate(lbl, [0, 1], [14, 0])}px`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: color }} />
        {label}
      </div>
    </div>
  );
};

/** Sticker "Experto en soluciones": papel blanco inclinado con sombra paralela (manual: multiplicar, 75%). */
export const Sticker: React.FC<{ scale?: number; style?: React.CSSProperties }> = ({
  scale = 1,
  style,
}) => (
  <div
    style={{
      backgroundColor: colors.white,
      padding: `${18 * scale}px ${40 * scale}px ${20 * scale}px`,
      rotate: "-4deg",
      boxShadow: `${10 * scale}px ${12 * scale}px ${10 * scale}px rgba(30,30,30,0.55)`,
      clipPath: "polygon(0 6%, 100% 0, 99% 100%, 1% 96%)",
      ...style,
    }}
  >
    <div
      style={{
        fontFamily: body,
        fontStyle: "italic",
        fontWeight: 900,
        fontSize: 40 * scale,
        color: colors.gray,
        lineHeight: 1,
        marginBottom: 6 * scale,
      }}
    >
      EXPERTO EN
    </div>
    <div
      style={{
        fontFamily: display,
        fontWeight: 900,
        fontSize: 92 * scale,
        color: colors.orange,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        letterSpacing: 2 * scale,
      }}
    >
      S
      <Img
        src={staticFile("icons/buloneria.svg")}
        style={{ width: 80 * scale, height: 80 * scale, margin: `0 ${4 * scale}px` }}
      />
      LUCIONES
    </div>
  </div>
);

/** Cinta "H30 - H30 - H30" de la iconografía. */
export const Tape: React.FC<{
  color?: string;
  text?: string;
  offset?: number;
  style?: React.CSSProperties;
}> = ({ color = colors.orange, text = "H30", offset = 0, style }) => (
  <div
    style={{
      position: "absolute",
      height: 64,
      backgroundColor: color,
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      whiteSpace: "nowrap",
      boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    <div
      style={{
        fontFamily: body,
        fontWeight: 700,
        fontSize: 30,
        color: colors.white,
        letterSpacing: 2,
        translate: `${offset}px 0px`,
      }}
    >
      {Array.from({ length: 40 }, () => `${text}  -  `).join("")}
    </div>
  </div>
);

/** Firma pequeña en la esquina, como en cada página del manual. */
export const CornerMark: React.FC = () => (
  <div style={{ position: "absolute", right: 80, bottom: 64, opacity: 0.9 }}>
    <H30Wordmark height={44} />
  </div>
);
