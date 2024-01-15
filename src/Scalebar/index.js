/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { ScaleLine } from 'ol/control';

function scaleControl() {
  const control = new ScaleLine({
    units: 'metric',
  });
  return control;
}

const Scalebar = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    map.addControl(scaleControl());
  }, [map]);
  return null;
};

export default Scalebar;
