/* eslint-disable consistent-return */
import { useRef, useState, useEffect } from 'react';
import Map from 'ol/Map';
import { View } from 'ol';
import * as olExtent from 'ol/extent';
import VectorLayer from 'ol/layer/Vector';

const defaultProps = {
  center: [0, 0],
  zoom: 2,
  maxZoom: 20,
};

const useOLMap = props => {
  const settings = { ...defaultProps, ...props };
  const { center, zoom, maxZoom } = settings;

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [renderComplete, setRenderComplete] = useState(null);

  useEffect(() => {
    const options = {
      view: new View({
        center,
        zoom,
        maxZoom,
      }),
      target: mapRef.current,
    };
    const mapInstance = new Map(options);
    setMap(mapInstance);

    return () => mapInstance.setTarget(undefined);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!map) return;

    function onRenderComplete() {
      const extent = olExtent.createEmpty();
      const layers = map.getLayers();
      layers.forEach(layer => {
        if (layer instanceof VectorLayer) {
          olExtent.extend(extent, layer.getSource().getExtent());
        }
      });
      if (extent[0] !== Infinity) {
        setTimeout(() => {
          setRenderComplete(true);
        }, 500);
        map.un('rendercomplete', onRenderComplete);
      }
    }
    map.on('rendercomplete', onRenderComplete);

    return () => {
      if (map) {
        map.un('rendercomplete', onRenderComplete);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    map.on('loadstart', () => {
      setIsMapLoading(true);
    });
    map.on('loadend', () => {
      setIsMapLoading(false);
    });
  }, [map]);

  return { mapRef, map, renderComplete, isMapLoading };
};

export default useOLMap;
