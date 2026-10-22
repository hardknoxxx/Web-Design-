import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Manual de marca H30: Unbounded para titulares, Roboto para lectura continua.
// Las fuentes viven en public/fonts para que el render no dependa de la red.
export const display = "Unbounded";
export const body = "Roboto";

for (const weight of ["400", "600", "900"]) {
  loadFont({ family: display, url: staticFile(`fonts/Unbounded-${weight}.woff2`), weight });
}
for (const weight of ["300", "400", "700"]) {
  loadFont({ family: body, url: staticFile(`fonts/Roboto-${weight}.woff2`), weight });
}
loadFont({
  family: body,
  url: staticFile("fonts/Roboto-900italic.woff2"),
  weight: "900",
  style: "italic",
});

export const colors = {
  orange: "#F08224",
  gray: "#4C4C4C",
  grayLight: "#969696",
  ink: "#1F1F1F",
  inkSoft: "#2A2A2A",
  white: "#FFFFFF",
  text: "#F4F1EE",
  muted: "#A9A4A0",
  // Colores secundarios: uno por rubro (Squad).
  buloneria: "#34A279",
  herramientas: "#7D5A9C",
  plomeria: "#58A3D9",
  electricidad: "#E8C308",
  seguridad: "#969696",
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
