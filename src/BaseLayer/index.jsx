/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import TileLayer from 'ol/layer/Tile';

const tileLayer = new TileLayer();

const BaseLayer = ({ map, source }) => {
  // add tile layer to map
  useEffect(() => {
    if (!map) return;
    map.addLayer(tileLayer);
  }, [map]);

  // change tile layer source
  useEffect(() => {
    if (!map || !source) return;
    tileLayer.setSource(source);
  }, [map, source]);

  // cleanup
  useEffect(() => () => map && map.removeLayer(tileLayer), [map]);

  return null;
};

export default BaseLayer;
