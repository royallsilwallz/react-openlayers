/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState, useRef } from 'react';
import { Draw } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { getStyles } from '../helpers/styleUtils';
import getFeatureGeojson from '../helpers/getFeatureGeojson';

export default function AddFeature({
  map,
  style,
  enable,
  geometryType,
  onDrawFinish,
  // onCancel,
}) {
  const isDrawInstanceAdded = useRef(false);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [drawType, setDrawType] = useState(null);
  const [drawnFeature, setDrawnFeature] = useState(null);

  useEffect(() => {
    if (!geometryType && vectorLayer) {
      vectorLayer.getSource().clear();
      setVectorLayer(null);
      setDrawType(null);
    }
  }, [geometryType, vectorLayer]);

  useEffect(() => {
    if (!map || !enable || !geometryType) return;
    setDrawType(geometryType);
    const source = new VectorSource({ wrapX: false });
    const vector = new VectorLayer({
      source,
      style: (feature, resolution) => getStyles({ style, feature, resolution }),
    });
    setVectorLayer(vector);
    map.addLayer(vector);
  }, [map, enable, style, geometryType]);

  // initialize draw instance
  const draw = useMemo(
    () =>
      new Draw({
        source: vectorLayer?.getSource(),
        type: geometryType || 'Point',
      }),
    [vectorLayer, geometryType],
  );

  // add interaction
  useEffect(() => {
    if (!map || !drawType || isDrawInstanceAdded.current || !enable)
      return () => {};
    map.addInteraction(draw);
    isDrawInstanceAdded.current = true;
    return () => {
      map.removeInteraction(draw);
      isDrawInstanceAdded.current = false;
    };
  }, [map, draw, drawType, enable]);

  // on draw end
  useEffect(() => {
    draw.on('drawend', e => {
      const { feature } = e;
      setDrawnFeature(feature);
      map.removeInteraction(draw);
      isDrawInstanceAdded.current = false;
      setDrawType(null);
      const featureGeojson = getFeatureGeojson(feature);
      onDrawFinish(featureGeojson);
    });
  }, [draw, map, onDrawFinish]);

  return null;
}
