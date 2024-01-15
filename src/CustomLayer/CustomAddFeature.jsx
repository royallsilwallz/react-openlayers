/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState, useRef } from 'react';
import { Draw } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { createBox } from 'ol/interaction/Draw';
import { getStyles } from '../helpers/styleUtils';
import getFeatureGeojson from '../helpers/getFeatureGeojson';

export default function CustomAddFeature({
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
        type: geometryType === 'Box' ? 'Circle' : 'Polygon',
        geometryFunction: geometryType === 'Box' ? createBox() : null,
      }),
    [vectorLayer, geometryType],
  );

  useEffect(() => {
    if (!map || !draw || !enable) return;
    map.removeInteraction(draw);
    map.addInteraction(draw);
    return () => {
      map.removeInteraction(draw);
    };
  }, [geometryType, map, draw, enable]);

  // add interaction
  useEffect(() => {
    if (!map || !drawType || isDrawInstanceAdded.current || !enable) return;
    map.addInteraction(draw);
    isDrawInstanceAdded.current = true;
  }, [map, draw, drawType, enable]);

  // on draw end
  useEffect(() => {
    draw.on('drawend', e => {
      const { feature } = e;
      setDrawnFeature(feature);
      if (map) {
        map.removeInteraction(draw);
      }
      isDrawInstanceAdded.current = false;
      setDrawType(null);
      const featureGeojson = getFeatureGeojson(feature);
      onDrawFinish(featureGeojson);
    });
  }, [draw, map, onDrawFinish]);

  return null;
}
