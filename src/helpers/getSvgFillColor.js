import getColors from 'get-svg-colors';

export default async function getSvgFillColor(url) {
  const urlResponse = await fetch(url);
  const svgString = await urlResponse.text();
  const colors = getColors(svgString);
  if (!colors.fills[0]) return null;
  return colors.fills[0].hex();
}
