/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Vector as OLVectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { getArea, getLength } from 'ol/sphere';
import { Draw } from 'ol/interaction';
import CircleStyle from 'ol/style/Circle';
import { Style, Fill, Stroke } from 'ol/style';
import { Overlay } from 'ol';
import { Polygon, LineString } from 'ol/geom';
import { unByKey } from 'ol/Observable';
import useOutsideClick from '@Hooks/useOutsideClick';

let measureVector;
let measureDraw;

function getOutputLayout(data, unit) {
  return `<div class="bg-white h-10 rounded-md shadow-3xl flex items-center">
        <span class="px-2 pt-3 align-middle h-full">${data} ${unit} 
        </span>
        <span class="close-icons rounded-r-md hover:bg-red-500 cursor-pointer hover:text-grey-200 h-full">
        <i class=' material-icons text-[1rem] pt-3 px-3 block' style="cursor:pointer;">close</i>
        </span>
        </div>`;
}

function MeasureControl({
  map,
  style,
  buttonText,
  direction,
  measureBoth = false,
  // eslint-disable-next-line react/prop-types
  onMeasureToggle,
}) {
  const [isMeasureEnabled, setIsMeasureEnabled] = useState(false);
  const [divRef, toggle, handleToggle] = useOutsideClick();

  // const controlRef = useRef(null);
  const drawRef = useRef();
  // const [options, setOptions] = useState(false);

  const getDropdownPosition = value => {
    switch (value) {
      case 'bottom-right':
        return {
          right: '0px',
          top: '42px',
        };
      case 'bottom-left':
        return {
          left: '0px',
          top: '42px',
        };
      case 'right':
        return {
          left: '45px',
          top: '0px',
        };
      case 'left':
        return {
          right: '45px',
          top: '0px',
        };
      default:
        return {
          right: '0px',
          top: '0px',
        };
    }
  };

  useEffect(() => {
    if (!map) return;
    onMeasureToggle(isMeasureEnabled);
    // return () => {
    //   map.removeLayer(measureVector);
    //   map.removeInteraction(measureDraw);
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isMeasureEnabled]);

  const clickHandler = ({ type = 'Polygon' }) => {
    const element = document.querySelector('.ol-tooltip-static');
    if (element) {
      element.parentNode.removeChild(element);
    }
    map.removeLayer(measureVector);
    map.removeInteraction(measureDraw);
    setIsMeasureEnabled(false);

    const measureSource = new VectorSource();
    measureVector = new OLVectorLayer({
      source: measureSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: '#3333ff',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#3333ff',
          }),
        }),
      }),
    });
    let sketch;
    let measureTooltipElement = null;
    let measureTooltip = null;
    map.addLayer(measureVector);
    measureVector.setZIndex(99999);
    const formatLength = line => {
      const length = getLength(line);
      let output;
      if (length > 100) {
        const data = Math.round((length / 1000) * 100) / 100;

        output = getOutputLayout(data, 'km');
      } else {
        const data = Math.round(length * 100) / 100;
        output = getOutputLayout(data, 'm');
      }
      return output;
    };
    const formatArea = polygon => {
      const area = getArea(polygon);
      let output;
      if (area > 10000) {
        const data = Math.round((area / 1000000) * 100) / 100;
        output = getOutputLayout(data, 'km<sup>2 </sup>');
      } else {
        const data = Math.round(area * 100) / 100;
        output = getOutputLayout(data, 'm<sup>2 </sup>');
      }
      return output;
    };
    function createMeasureTooltip() {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
      });
      map.addOverlay(measureTooltip);
    }
    function addInteraction() {
      measureDraw = new Draw({
        source: measureSource,
        type,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.7)',
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
            lineDash: [10, 10],
            width: 2,
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.7)',
            }),
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)',
            }),
          }),
        }),
      });
      map.addInteraction(measureDraw);
      setIsMeasureEnabled(true);
      createMeasureTooltip();
      let listener;
      measureDraw.on('drawstart', evt => {
        sketch = evt.feature;
        let tooltipCoord = evt.coordinate;
        listener = sketch.getGeometry().on('change', event => {
          const geom = event.target;
          let output;
          if (geom instanceof Polygon) {
            output = formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          measureTooltipElement.innerHTML = output;
          measureTooltip.setPosition(tooltipCoord);
        });
      });
      measureDraw.on('drawend', () => {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        map.removeInteraction(measureDraw);
        setIsMeasureEnabled(false);
        sketch = null;
        measureTooltipElement = null;
        unByKey(listener);
        const closeElement = document.querySelector('.close-icons');
        closeElement.addEventListener('click', () => {
          const elementPopup = document.querySelector('.ol-tooltip-static');
          if (elementPopup) {
            elementPopup.parentNode.removeChild(elementPopup);
          }
          map.removeLayer(measureVector);
        });
      });
    }
    addInteraction();
  };

  // const showOptions = () => {
  //   setOptions(prevState => !prevState);
  // };

  return (
    <div
      ref={divRef}
      className="pt-1 "
      style={{ ...style, cursor: 'pointer' }}
    >
      <a
        ref={drawRef}
        onClick={
          measureBoth ? handleToggle : () => clickHandler({ type: 'Polygon' })
        }
        type="button"
        title="Measure"
        className=""
      >
        {buttonText}
      </a>
      {toggle && (
        <ul
          className="bg-white rounded-sm flex shadow-3xl"
          style={{
            position: 'absolute',
            ...getDropdownPosition(direction),
          }}
        >
          <li className="p-2 h-10 items-center justify-center hover:bg-grey-100">
            <a
              onClick={() => {
                clickHandler({ type: 'LineString' });
                handleToggle();
              }}
              title="Add Coordinate"
            >
              <i className="material-icons">show_chart</i>
            </a>
          </li>
          <li className="p-2 h-10 items-center justify-center hover:bg-grey-100">
            <a
              onClick={() => {
                clickHandler({ type: 'Polygon' });
                handleToggle();
              }}
              title="Measure Length and Area"
            >
              <i className="material-icons">crop_square</i>
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}

MeasureControl.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  buttonText: PropTypes.object,
  measureBoth: PropTypes.bool,
  map: PropTypes.object,
  onMeasureToggle: PropTypes.func,
  direction: PropTypes.string,
};
MeasureControl.defaultProps = {
  onMeasureToggle: () => {},
  direction: 'bottom-right',
};
export default MeasureControl;
