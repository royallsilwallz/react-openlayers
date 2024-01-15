/* eslint-disable react/prop-types */
/* eslint-disable func-names */
import { useEffect, useState } from 'react';
import TileLayer from 'ol/layer/Tile';
// import VectorTileLayer from 'ol/layer/VectorTile';
// import View from 'ol/View';
import TileWMS from 'ol/source/TileWMS';

const WMSTileLayer = ({ map, url, layer, zIndex = 1, visibleOnMap = true }) => {
  const [tileLayer, setTileLayer] = useState(null);

  // remove layer from map on unmount
  useEffect(
    () => () => map && tileLayer && map.removeLayer(tileLayer),
    [map, tileLayer],
  );

  useEffect(() => {
    if (!map) return;

    // initialize tile layer instance
    const tileLyr = new TileLayer({
      source: new TileWMS({
        crossOrigin: 'anonymous',
        url,
        params: { LAYERS: layer, TILED: true },
        serverType: 'geoserver',
        transition: 0,
      }),
      opacity: 0.7,
    });
    // set tilelayer instance to state
    setTileLayer(tileLyr);
  }, [map, url, layer]);

  // add/remove layer from the map
  useEffect(() => {
    if (!map || !tileLayer) return;
    if (visibleOnMap) {
      map.addLayer(tileLayer);
    } else {
      map.removeLayer(tileLayer);
    }
  }, [map, tileLayer, visibleOnMap]);

  // set zindex
  useEffect(() => {
    if (!tileLayer) return;
    tileLayer.setZIndex(zIndex);
  }, [tileLayer, zIndex]);

  // popup for wms layer
  // useEffect(() => {
  //  if (!map || !tileLayer) return;

  //  const viewResolution = map.getView();
  //  map.on('singleclick', function ehello(evt) {
  //    map.forEachLayerAtPixel(evt.pixel, function (lyr) {
  //      if (!(lyr instanceof VectorTileLayer)) {
  //        //
  //      }
  //    });
  //    const source = tileLayer.getSource();
  //    const geoserverUrl = tileLayer
  //      .getSource()
  //      .getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', {
  //        INFO_FORMAT: 'application/json',
  //      });
  //    if (geoserverUrl) {
  //      fetch(geoserverUrl)
  //        .then(response => response.json())
  //        .then(json => {
  //          const jsonData = json.features[0].properties;
  //        });
  //    }
  //  });
  // }, [map, tileLayer]);

  return null;
};

export default WMSTileLayer;
