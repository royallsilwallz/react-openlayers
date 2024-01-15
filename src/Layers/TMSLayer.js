/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { transformExtent } from 'ol/proj';
import { isExtentValid } from '../helpers/layerUtils';

const TMSLayer = ({
  map,
  url,
  zIndex = 1,
  visibleOnMap = true,
  zoomToLayer,
  bbox,
  opacity = 1,
  srid = 3857,
}) => {
  const [tileLayer, setTileLayer] = useState(null);

  useEffect(() => {
    if (!map) return;
    const tileLyr = new TileLayer({
      source: new XYZ({
        url,
        crossOrigin: 'Anonymous',
      }),
    });
    setTileLayer(tileLyr);
  }, [map, url]);

  // add layer to map
  useEffect(() => {
    if (!tileLayer) return;
    if (visibleOnMap) {
      map.addLayer(tileLayer);
    } else {
      map.removeLayer(tileLayer);
    }
  }, [map, visibleOnMap, tileLayer]);

  // set z-index
  useEffect(() => {
    if (!tileLayer) return;
    tileLayer.setZIndex(zIndex);
  }, [zIndex, tileLayer]);

  // set opacity
  useEffect(() => {
    if (!tileLayer) return;
    tileLayer.setOpacity(opacity);
  }, [opacity, tileLayer]);

  // zoom to bbox
  useEffect(() => {
    if (!map || !bbox || !zoomToLayer) return;
    const zoomExtentx = transformExtent(bbox, `EPSG:3857`, 'EPSG:4326');
    const zoomExtent = transformExtent(zoomExtentx, 'EPSG:4326', 'EPSG:3857');
    if (isExtentValid(zoomExtent)) {
      map.getView().fit(zoomExtent, {
        padding: [70, 70, 70, 70],
        duration: 500,
        constrainResolution: true,
      });
    }
  }, [map, bbox, zoomToLayer, srid]);

  return null;
};

export default TMSLayer;
