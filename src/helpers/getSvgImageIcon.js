import SVGInjector from 'svg-injector';
import memoize from 'memoize-one';

const getSvgImageIcon = async (src, fillColor) => {
  const onImageLoad = memoize(async () => {
    const width = 500;
    const height = 500;
    const dummySvg = document.createElement('svg');
    const container = document.createElement('div');
    dummySvg.setAttribute('data-src', src);
    container.appendChild(dummySvg);
    const options = {};
    let finalTargetImage = null;
    await new Promise(resolve => {
      SVGInjector(dummySvg, options, () => {
        const svg = container.children[0];
        svg.style.width = `${width}px`;
        svg.style.height = `${height}px`;
        if (fillColor) {
          svg.style.fill = fillColor;
          const paths = svg.getElementsByTagName('path');
          for (let i = 0; i < paths.length; i += 1) {
            paths[i].style.fill = fillColor;
          }
        }
        const getString = (() => {
          const DIV = document.createElement('div');
          if ('outerHTML' in DIV) return node => node.outerHTML;
          return node => {
            const div = DIV.cloneNode();
            div.appendChild(node.cloneNode(true));
            return div.innerHTML;
          };
        })();
        const svgFinalOutput = getString(svg);
        finalTargetImage = `data:image/svg+xml,${encodeURIComponent(
          svgFinalOutput,
        )}`;
        resolve();
        // const canvas = document.createElement('canvas');
        // const ctx = canvas.getContext('2d');
        // canvas.width = width;
        // canvas.height = height;
        // const tempImg = document.createElement('img');
        // tempImg.src = `data:image/svg+xml,${encodeURIComponent(svgFinalOutput)}`;
        // ctx.drawImage(tempImg, 0, 0);
        // const targetImg = canvas.toDataURL();
        // finalTargetImage = targetImg;
      });
    });
    return finalTargetImage;
  });
  return onImageLoad();
};

export default getSvgImageIcon;
