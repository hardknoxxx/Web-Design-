import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { clamp, colors, easeOut } from "./brand";

// Trazos vectoriales extraídos del manual de marca (página "Logo").
const H =
  "M 275.644531 294.746094 C 275.644531 294.746094 275.964844 332.367188 275.644531 346.191406 C 275.324219 360.019531 296.96875 359.375 296.96875 347.15625 C 296.96875 329.632812 296.761719 306.320312 296.761719 306.320312 L 343.859375 306.320312 L 343.859375 346.191406 C 343.859375 360.980469 366.320312 360.339844 366.320312 347.15625 L 366.320312 245.867188 C 366.320312 234.9375 344.019531 233.8125 344.019531 246.992188 L 344.019531 286.546875 L 297.453125 286.546875 L 297.453125 248.925781 C 297.453125 235.097656 275.640625 234.453125 275.640625 248.925781 C 275.640625 270.464844 275.644531 294.746094 275.644531 294.746094";
const THREE_TOP =
  "M 382.558594 238.796875 C 371.464844 238.796875 371.144531 258.25 383.523438 258.25 L 429.023438 258.25 C 429.023438 258.25 402.875 277.644531 392.203125 288.3125 C 384.085938 296.433594 397.410156 309.21875 406.835938 301.175781 C 423.527344 286.941406 448.238281 268.726562 461.820312 256.800781 C 471.644531 248.175781 463.554688 238.796875 458.121094 238.796875 Z";
const THREE_BOTTOM =
  "M 442.296875 283.152344 C 445.671875 283.957031 480.628906 302.78125 460.535156 335.902344 C 448.679688 355.4375 427.566406 354.382812 420.339844 354.390625 C 410.050781 354.402344 385.191406 349.578125 379.019531 330.917969 C 374.238281 316.449219 393.332031 314.519531 397.027344 322.234375 C 399.902344 328.230469 411.660156 334.132812 420.339844 334.453125 C 425.414062 334.644531 435.082031 331.832031 435.082031 331.832031 C 435.082031 331.832031 448.488281 325.90625 446.015625 313.375 C 443.054688 298.382812 409.867188 302.214844 411.0625 301.609375 C 413.757812 300.242188 442.296875 283.152344 442.296875 283.152344";
const O =
  "M 520.589844 333.164062 C 502.523438 333.164062 496.558594 312.578125 496.558594 296.59375 C 496.558594 280.605469 502.75 260.03125 520.808594 260.03125 C 541.726562 260.03125 545.980469 281.195312 545.964844 297.324219 C 545.949219 316.207031 538.660156 333.164062 520.589844 333.164062 M 566.484375 294.367188 C 565.839844 266.289062 549.121094 238.632812 519.964844 238.796875 C 490.8125 238.957031 476.023438 273.574219 476.023438 295.65625 C 476.023438 326.738281 495.527344 354.820312 522.96875 354.398438 C 550.40625 353.980469 567.128906 322.449219 566.484375 294.367188";

const CX = 420.5;
const CY = 297.4;
const RING_R = 201.5;
const RING_C = 2 * Math.PI * RING_R;

/** Isologotipo H30 que se arma: disco gris, anillo naranja que se dibuja y letras que caen en su lugar. */
export const H30Logo: React.FC<{
  size: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ size, delay = 0, style }) => {
  const frame = useCurrentFrame() - delay;
  const { fps } = useVideoConfig();

  const pop = (d: number) =>
    spring({ frame: frame - d, fps, config: { damping: 14, stiffness: 140 } });

  const disc = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });
  const ring = interpolate(frame, [6, 34], [0, 1], { ...clamp, easing: easeOut });
  const letters = [H, THREE_TOP, THREE_BOTTOM, O];

  return (
    <svg
      viewBox="211 88 419 419"
      width={size}
      height={size}
      style={{ overflow: "visible", ...style }}
    >
      <circle
        cx={CX}
        cy={CY + 1}
        r={196.75}
        fill={colors.gray}
        style={{ scale: disc, transformOrigin: `${CX}px ${CY}px` }}
      />
      <circle
        cx={CX}
        cy={CY}
        r={RING_R}
        fill="none"
        stroke={colors.orange}
        strokeWidth={14.5}
        strokeDasharray={RING_C}
        strokeDashoffset={RING_C * (1 - ring)}
        strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`}
      />
      {letters.map((d, i) => {
        const p = pop(16 + i * 4);
        return (
          <path
            key={i}
            d={d}
            fill={colors.orange}
            style={{
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              translate: `0px ${interpolate(p, [0, 1], [40, 0])}px`,
            }}
          />
        );
      })}
    </svg>
  );
};

/** Logotipo plano (sin círculo), para firmas y esquinas. */
export const H30Wordmark: React.FC<{
  height: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ height, color = colors.orange, style }) => (
  <svg
    viewBox="274 237 294 119"
    height={height}
    width={(height * 294) / 119}
    style={style}
  >
    {[H, THREE_TOP, THREE_BOTTOM, O].map((d) => (
      <path key={d.slice(0, 12)} d={d} fill={color} />
    ))}
  </svg>
);
