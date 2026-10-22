import React from "react";
import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { AbsoluteFill } from "remotion";
import { colors } from "./brand";
import {
  Autoservicio,
  ComoFunciona,
  Hook,
  Intro,
  Marcas,
  Outro,
  QueEs,
  Slogan,
} from "./scenes";

const smooth = springTiming({ config: { damping: 200 }, durationInFrames: 22 });

export const H30_DURATION = 120 + 105 + 190 + 200 + 240 + 160 + 110 + 160 - (18 + 22 + 22 + 22 + 22 + 18 + 30);

export const H30Franquicia: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.ink }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="Logo" durationInFrames={120}>
        <Intro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
      <TransitionSeries.Sequence name="Gancho" durationInFrames={105}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={smooth} />
      <TransitionSeries.Sequence name="Qué es H30" durationInFrames={190}>
        <QueEs />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={smooth} />
      <TransitionSeries.Sequence name="Autoservicio" durationInFrames={200}>
        <Autoservicio />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={smooth} />
      <TransitionSeries.Sequence name="Cómo funciona" durationInFrames={240}>
        <ComoFunciona />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={smooth} />
      <TransitionSeries.Sequence name="Marcas" durationInFrames={160}>
        <Marcas />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
      <TransitionSeries.Sequence name="Slogan" durationInFrames={110}>
        <Slogan />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={clockWipe({ width: 1920, height: 1080 })}
        timing={linearTiming({ durationInFrames: 30 })}
      />
      <TransitionSeries.Sequence name="Cierre" durationInFrames={160}>
        <Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
