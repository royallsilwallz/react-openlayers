/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable react/forbid-prop-types */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import OLVectorLayer from 'ol/layer/Vector';
import {
  defaultStyles,
  getStyles,
} from '@src/components/common/OpenLayersComponent/helpers/styleUtils';
import { isExtentValid } from '../helpers/layerUtils';

const CircleMarker = ({
  map,
  coordinates,
  style,
  zIndex,
  zoomToLayer = false,
  visibleOnMap = true,
  properties,
}) => {
  const [vectorLayer, setVectorLayer] = useState(null);

  useEffect(
    () => () => map && vectorLayer && map.removeLayer(vectorLayer),
    [map, vectorLayer],
  );

  useEffect(() => {
    if (!map) return;

    const [lat, lng] = coordinates;
    const vectorLyr = new OLVectorLayer({
      source: new VectorSource({
        features: [
          new Feature({
            geometry: new Point(fromLonLat([lng, lat])),
          }),
        ],
      }),
      declutter: true,
    });
    setVectorLayer(vectorLyr);
  }, [map, coordinates]);

  useEffect(() => {
    if (!map || !vectorLayer) return;
    if (visibleOnMap) {
      map.addLayer(vectorLayer);
    } else {
      map.removeLayer(vectorLayer);
    }
  }, [map, vectorLayer, visibleOnMap]);

  useEffect(() => {
    if (!vectorLayer || !style) return;
    vectorLayer.setStyle((feature, resolution) =>
      getStyles({ style, feature, resolution }),
    );
  }, [vectorLayer, style]);

  useEffect(() => {
    if (!vectorLayer) return;
    vectorLayer.setZIndex(zIndex);
  }, [vectorLayer, zIndex]);

  useEffect(() => {
    if (!map || !vectorLayer || !zoomToLayer) return;
    const extent = vectorLayer.getSource().getExtent();
    if (!isExtentValid(extent)) return;
    map.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      duration: 900,
      constrainResolution: true,
    });
  }, [map, vectorLayer, zoomToLayer]);

  // set properties to layer
  useEffect(() => {
    if (!vectorLayer || !properties) return;
    vectorLayer.setProperties(properties);
  }, [vectorLayer, properties]);

  return null;
};

CircleMarker.defaultProps = {
  zIndex: 0,
  style: { ...defaultStyles },
  zoomToLayer: false,
};

CircleMarker.propTypes = {
  coordinates: PropTypes.array.isRequired,
  style: PropTypes.object,
  zIndex: PropTypes.number,
  zoomToLayer: PropTypes.bool,
  // Context: PropTypes.object.isRequired,
};

export default CircleMarker;
