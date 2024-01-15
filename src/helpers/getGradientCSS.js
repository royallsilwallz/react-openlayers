export default function getGradientCSS(colorArr) {
  if (!Array.isArray(colorArr)) return '';
  const numberOfColors = colorArr.length;
  const ratio = 100 / (numberOfColors - 1);
  if (ratio === Infinity) {
    return colorArr?.[0];
  }
  const result = colorArr.map((color, index) => `${color} ${index * ratio}%`);
  return `linear-gradient(to right, ${result.join(',')})`;
}
