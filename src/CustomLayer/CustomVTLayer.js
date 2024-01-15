/* eslint-disable react/prop-types */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useRef } from 'react';
// import * as olExtent from 'ol/extent';
import VectorTile from 'ol/layer/VectorTile';
import MVT from 'ol/format/MVT';
import Feature from 'ol/Feature';
import VectorTileSource from 'ol/source/VectorTile';
import { transformExtent } from 'ol/proj';
import getSvgImageIcon from '../helpers/getSvgImageIcon';
import {
  getStyles,
  defaultStyles,
  selectEffectColor,
  hoverEffectColor,
} from '../helpers/styleUtils';
import { isExtentValid } from '../helpers/layerUtils';
import checkIfSvgUrl from '../helpers/checkIfSvgUrl';
// import { isExtentValid } from '../helpers/layerUtils';

export default function CustomVTLayer({
  map,
  url,
  style = { ...defaultStyles },
  zIndex = 1,
  visibleOnMap = true,
  authToken,
  setStyle,
  zoomToLayer = false,
  bbox = null,
  properties,
  renderMode = 'hybrid',
  hoverEffect = false,
  onFeatureSelect = () => {},
  hoverExceptionIds,
}) {
  const hoveredFeatures = useRef({});
  const selectedFeatures = useRef({});
  const hoverLayer = useRef(null);
  const selectionLayer = useRef(null);

  const vectorTileLayer = useMemo(
    () =>
      new VectorTile({
        renderMode,
        // declutter: true,
      }),
    [renderMode],
  );

  // add source to layer
  useEffect(() => {
    if (!map) return;

    const requestHeader = new Headers();
    if (authToken) {
      requestHeader.append('Authorization', `Bearer ${authToken}`);
    }

    const vectorTileSource = new VectorTileSource({
      format: new MVT({
        idProperty: 'id',
        featureClass: Feature,
      }),
      maxZoom: 19,
      url,
      transition: 0,
      tileLoadFunction: (tile, vtUrl) => {
        tile.setLoader((extent, _, projection) => {
          fetch(vtUrl, {
            headers: requestHeader,
          }).then(response => {
            response.arrayBuffer().then(data => {
              const format = tile.getFormat();
              const features = format.readFeatures(data, {
                extent,
                featureProjection: projection,
              });
              tile.setFeatures(features);
            });
          });
        });
      },
    });
    vectorTileLayer.setSource(vectorTileSource);
  }, [map, url, authToken, vectorTileLayer]);

  // add layer to map
  useEffect(() => {
    if (!map) return;
    if (visibleOnMap) {
      map.addLayer(vectorTileLayer);
    } else {
      map.removeLayer(vectorTileLayer);
    }
  }, [map, visibleOnMap, vectorTileLayer]);

  // // set style
  useEffect(() => {
    if (!map || !visibleOnMap || !setStyle) return;
    vectorTileLayer.setStyle(setStyle);
  }, [map, setStyle, vectorTileLayer, visibleOnMap]);

  // set style
  useEffect(() => {
    if (!map || !visibleOnMap || setStyle) return;
    async function setAsyncStyle() {
      if (style?.icon?.url && style?.icon?.fillColor) {
        const iconUrl = style.icon.url;
        const isSVGIcon = checkIfSvgUrl(iconUrl);
        if (isSVGIcon) {
          const svgString = await getSvgImageIcon(
            iconUrl,
            style.icon.fillColor || '#333333',
          );
          vectorTileLayer.setStyle((feature, resolution) =>
            getStyles({
              style: { ...style, icon: { ...style.icon, url: svgString } },
              feature,
              resolution,
            }),
          );
        }
      } else {
        vectorTileLayer.setStyle((feature, resolution) =>
          getStyles({ style, feature, resolution }),
        );
      }
    }
    setAsyncStyle();
  }, [map, style, vectorTileLayer, visibleOnMap, setStyle]);

  // set z-index
  useEffect(() => {
    if (!map) return;
    vectorTileLayer.setZIndex(zIndex);
  }, [map, zIndex, vectorTileLayer]);

  // set properties to layer
  useEffect(() => {
    if (!vectorTileLayer || !properties) return;
    vectorTileLayer.setProperties(properties);
  }, [vectorTileLayer, properties]);

  // zoom to layer
  useEffect(() => {
    if (!map || !vectorTileLayer || !zoomToLayer || !bbox) return;
    const transformedExtent = transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
    if (!isExtentValid(transformedExtent)) return;
    map.getView().fit(transformedExtent, {
      padding: [50, 50, 50, 50],
      duration: 900,
      constrainResolution: true,
    });
  }, [map, vectorTileLayer, zoomToLayer, bbox]);

  // add hover effect
  useEffect(() => {
    function hoverInteraction(event) {
      vectorTileLayer.getFeatures(event.pixel).then(features => {
        // hover effect
        const hit = map.hasFeatureAtPixel(event.pixel);
        map.getViewport().style.cursor = hit ? 'pointer' : '';
        if (!features.length) {
          hoveredFeatures.current = {};
          hoverLayer.current.changed();
          return;
        }
        const feature = features[0];
        if (!feature) {
          return;
        }
        const fid = feature.getId();
        if (hoverExceptionIds.includes(fid)) return;
        hoveredFeatures.current[fid] = feature;
        hoverLayer.current.changed();
      });
    }
    if (!map || !vectorTileLayer || !hoverEffect) {
      hoveredFeatures.current = {};
      if (hoverLayer.current) {
        hoverLayer.current.changed();
        hoverLayer.current.setSource(null);
      }
      map?.un('singleclick', hoverInteraction);
      return;
    }
    hoverLayer.current = new VectorTile({
      map,
      renderMode: 'vector',
      source: vectorTileLayer.getSource(),
      style: (feature, resolution) => {
        if (feature.getId() in hoveredFeatures.current) {
          return getStyles({
            style: {
              ...style,
              fillColor: hoverEffectColor,
              fillOpacity: 100,
              lineColor: hoverEffectColor,
              lineOpacity: 100,
              lineThickness: +style.lineThickness + 2,
            },
            feature,
            resolution,
          });
        }
      },
    });
    map.on('pointermove', hoverInteraction);
    return () => {
      map?.un('singleclick', hoverInteraction);
    };
  }, [map, vectorTileLayer, hoverEffect, style, hoverExceptionIds]);

  // add select effect
  useEffect(() => {
    function selectInteraction(event) {
      vectorTileLayer.getFeatures(event.pixel).then(features => {
        if (!features.length || !hoverEffect) {
          return;
        }
        const feature = features[0];
        if (!feature) {
          return;
        }
        const fid = feature.getId();
        if (hoverExceptionIds.includes(fid)) return;
        if (fid in selectedFeatures.current) {
          delete selectedFeatures.current[fid];
          selectionLayer.current.changed();
          onFeatureSelect(Object.keys(selectedFeatures.current));
        } else {
          selectedFeatures.current[fid] = feature;
          selectionLayer.current.changed();
          onFeatureSelect(Object.keys(selectedFeatures.current));
        }
      });
    }
    if (!map || !vectorTileLayer || !hoverEffect) {
      selectedFeatures.current = {};
      if (selectionLayer.current) {
        selectionLayer.current.changed();
        selectionLayer.current.setSource(null);
      }
      map?.un('singleclick', selectInteraction);
      return;
    }
    selectionLayer.current = new VectorTile({
      map,
      renderMode: 'vector',
      source: vectorTileLayer.getSource(),
      style: (feature, resolution) => {
        if (feature.getId() in selectedFeatures.current) {
          return getStyles({
            style: {
              ...style,
              fillColor: selectEffectColor,
              fillOpacity: 100,
              lineColor: selectEffectColor,
              lineOpacity: 100,
              lineThickness: +style.lineThickness + 2,
            },
            feature,
            resolution,
          });
        }
      },
    });
    map.on('singleclick', selectInteraction);
    return () => {
      map?.un('singleclick', selectInteraction);
    };
  }, [map, vectorTileLayer, hoverEffect, style, hoverExceptionIds]); // eslint-disable-line

  // cleanup
  useEffect(
    () => () => map && map.removeLayer(vectorTileLayer),
    [map, vectorTileLayer],
  );

  return null;
}
