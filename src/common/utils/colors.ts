export type RGB = [number, number, number];

export const interpolateColor = (color1: RGB, color2: RGB, percentage: number): RGB => {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * (percentage / 100));
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * (percentage / 100));
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * (percentage / 100));

  return [r, g, b];
};

export const rgbToString = (color: RGB) => {
  return `rgb(${color[0]},${color[1]},${color[2]})`;
};

export const hexToRGB = (color: string): RGB => {
  const r = Number(`0x${color.slice(1, 3)}`);
  const g = Number(`0x${color.slice(3, 5)}`);
  const b = Number(`0x${color.slice(5, 7)}`);
  return [r, g, b];
};

export const hexToRGBA = (hex: string, alpha: number = 1) => {
  const [r, g, b] = hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
