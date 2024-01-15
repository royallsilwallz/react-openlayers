/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  defaultStyles,
  hexToRgba,
  lineTypes,
  pointTypes,
} from '@src/components/common/OpenLayersComponent/helpers/styleUtils';
// import getSvgImageIcon from '@Utils/map/getSvgImageIcon';
// import checkIfSvgUrl from '../OpenLayersComponent/helpers/checkIfSvgUrl';
// import './styles.scss';

const LegendItem = ({
  styles = { ...defaultStyles },
  onClick = () => {},
  className = '',
  size = '28px',
  ...rest
}) => {
  const stylex = { ...defaultStyles, ...styles };
  const {
    lineColor,
    lineOpacity,
    fillColor,
    fillOpacity,
    lineThickness,
    dashline,
    geometryType,
    icon,
  } = stylex;
  // const [svgIcon, setSvgIcon] = useState(null);

  const style = {
    width: size,
    height: size,
  };

  // const isSVGIcon = useMemo(
  //   () => icon?.url && checkIfSvgUrl(icon?.url),
  //   [icon?.url],
  // );

  // useEffect(() => {
  //   if (!icon?.url || !isSVGIcon) return;
  //   async function getSvgIcon() {
  //     const svgString = await getSvgImageIcon(icon.url, icon.fillColor);
  //     setSvgIcon(svgString);
  //   }
  //   getSvgIcon();
  // }, [icon, isSVGIcon]);

  return (
    <div
      role="presentation"
      className={`custom__legend ${className}`}
      // title="Edit style"
      onClick={onClick}
      onKeyUp={() => {}}
      style={{
        minHeight: size,
        maxHeight: size,
        height: size,
        width: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...rest}
    >
      {icon?.url ? (
        <div style={style}>
          <img src={icon?.url} alt="icon" />
        </div>
      ) : pointTypes.includes(geometryType) ? (
        <div
          style={{
            backgroundColor: hexToRgba(fillColor, fillOpacity),
            border: `${lineThickness}px solid ${hexToRgba(
              lineColor,
              lineOpacity,
            )}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
          }}
        />
      ) : lineTypes.includes(geometryType) ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
          }}
        >
          <div
            style={{
              width: size,
              borderBottom: `${lineThickness}px solid ${hexToRgba(
                lineColor,
                lineOpacity,
              )}`,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            backgroundColor: hexToRgba(fillColor, fillOpacity),
            border: `${lineThickness}px ${
              dashline > 0 ? 'dashed' : 'solid'
            } ${hexToRgba(lineColor, lineOpacity)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
          }}
        />
      )}
    </div>
  );
};

export default LegendItem;
