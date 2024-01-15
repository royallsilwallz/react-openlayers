export default function checkIfSvgUrl(url) {
  const urlArr = url.split('.');
  const extension = urlArr[urlArr.length - 1];
  return extension === 'svg';
}
